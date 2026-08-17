<?php

declare(strict_types=1);

namespace Attendant;

/**
 * One visitor turn: validate → skills → compose → tool loop → stream → persist → telemetry.
 */
final class TurnEngine
{
    public function __construct(
        private ConversationStore $store,
        private ConfirmationGate $gate,
        private SchemaValidator $validator,
        private ContextEngine $context,
        private SkillActivator $skills,
        private PromptComposer $composer,
        private LlmProvider $llm,
        private Telemetry $telemetry,
        private ToolRouter $tools,
        private KnowledgeCorpus $corpus = new KnowledgeCorpus(),
        private CustomerModelUpdater $modelUpdater = new CustomerModelUpdater(),
        private ?CompanyDocumentStore $company = null,
        private ?ChoiceGate $choiceGate = null,
    ) {
        $this->company ??= new CompanyDocumentStore();
    }

    /**
     * @param array<string,mixed> $pageInput
     * @param callable(string,array):void $emit SSE emitter (event name, payload)
     */
    public function runChat(
        int $sessionId,
        string $conversationId,
        string $message,
        array $pageInput,
        ?array $draft,
        callable $emit
    ): void {
        $started = (int) (microtime(true) * 1000);
        $message = trim($message);

        if ($message === '') {
            $emit('error', ['code' => 'validation_error', 'message' => 'Message cannot be empty.']);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        }
        if (mb_strlen($message) > ATTENDANT_MAX_MESSAGE_CHARS) {
            $emit('error', ['code' => 'validation_error', 'message' => 'Message is too long.']);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        }

        $validated = $this->validator->validateContext($pageInput);
        if (!$validated['ok']) {
            $emit('error', [
                'code' => 'validation_error',
                'message' => $validated['error'] ?? 'Invalid page context.',
            ]);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        }
        /** @var array<string,mixed> $page */
        $page = $validated['value'];

        // Human-controlled: persist visitor text, skip LLM, keep WhatsApp as parallel escape.
        $escState = $this->store->getEscalationState($conversationId);
        if (EscalationState::isHumanControlled($escState)) {
            $draft = $this->modelUpdater->fromMessage($draft, $message, $page);
            $this->store->saveDraft($conversationId, $draft);
            $this->store->addMessage($conversationId, 'visitor', $message);
            $statusCopy = $escState === EscalationState::HUMAN_ACTIVE
                ? 'Your message was delivered to the team.'
                : 'Connecting you with the team… Your message was delivered.';
            $this->store->addMessage(
                $conversationId,
                'system',
                $statusCopy,
                null,
                null,
                'human-pause-' . md5($conversationId . '|' . $message)
            );
            $emit('escalation_status', [
                'escalation_state' => $escState,
                'message' => $statusCopy,
            ]);
            $emit('message_delta', ['text' => $statusCopy]);
            $emit('done', [
                'conversation_id' => $conversationId,
                'escalation_state' => $escState,
                'llm_skipped' => true,
            ]);
            $this->telemetry->emit('chat_turn_start', [
                'conversation_id' => $conversationId,
                'session_id' => $sessionId,
                'page_id' => $page['page_id'] ?? null,
                'meta' => [
                    'llm_skipped' => true,
                    'escalation_state' => $escState,
                    'handoff' => true,
                ],
            ]);
            return;
        }

        $pending = $this->gate->peekActive($conversationId);
        $choicePending = $this->choiceGate?->peekActive($conversationId);
        $activeSkills = $this->skills->activate($message, $page, $pending !== null);
        $allowedTools = array_values(array_intersect(
            $this->skills->allowedTools($activeSkills),
            $this->tools->registeredTools()
        ));

        // Deterministic model update before compose (survives turns; feeds no-reask)
        $draft = $this->modelUpdater->fromMessage($draft, $message, $page);
        $this->store->saveDraft($conversationId, $draft);

        $faqHits = $this->corpus->search($message, 3);
        $companyHits = $this->company->search($message, CompanyDocumentStore::VISITOR_ALLOWED, 3);
        $hits = [];
        foreach (array_merge($companyHits, $faqHits) as $hit) {
            $id = (string) ($hit['id'] ?? '');
            if ($id === '' || isset($hits[$id])) {
                continue;
            }
            if ($this->company->isVisitorDeniedId($id)) {
                continue;
            }
            $hits[$id] = [
                'id' => $id,
                'title' => (string) ($hit['title'] ?? ''),
                'text' => (string) ($hit['text'] ?? ''),
                'source' => (string) ($hit['source'] ?? ''),
                'public_route' => $hit['public_route'] ?? null,
            ];
        }
        $hits = array_slice(array_values($hits), 0, 4);
        $blocks = $this->context->build($page, $draft, $pending, $hits, $message, $choicePending);

        try {
            $composed = $this->composer->compose(
                $activeSkills,
                $allowedTools,
                $blocks,
                $this->tools->declarations($allowedTools)
            );
        } catch (\Throwable $e) {
            $this->telemetry->emit('chat_error', [
                'conversation_id' => $conversationId,
                'session_id' => $sessionId,
                'page_id' => $page['page_id'] ?? null,
                'error_code' => 'compose_error',
                'meta' => ['detail' => $e->getMessage()],
            ]);
            $emit('error', ['code' => 'backend_error', 'message' => "I can't reply just now."]);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        }

        $this->store->addMessage($conversationId, 'visitor', $message);
        $history = $this->store->recentMessages($conversationId, ATTENDANT_HISTORY_LIMIT);
        $historyForModel = [];
        foreach ($history as $row) {
            if (
                ($row['role'] === 'visitor' || $row['role'] === 'attendant' || $row['role'] === 'human')
                && $row['text'] !== ''
            ) {
                $historyForModel[] = $row;
            }
        }
        if ($historyForModel !== [] && end($historyForModel)['text'] === $message && end($historyForModel)['role'] === 'visitor') {
            array_pop($historyForModel);
        }

        $this->telemetry->emit('chat_turn_start', [
            'conversation_id' => $conversationId,
            'session_id' => $sessionId,
            'page_id' => $page['page_id'] ?? null,
            'section_id' => $page['section_id'] ?? null,
            'active_skills' => $composed['skill_ids'],
            'retrieved_ids' => $blocks['retrieved_ids'],
            'meta' => ['prompt_hash' => $composed['prompt_hash']],
        ]);

        $contents = [];
        foreach ($historyForModel as $msg) {
            $roleName = (string) ($msg['role'] ?? '');
            $role = ($roleName === 'attendant' || $roleName === 'human') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => (string) $msg['text']]],
            ];
        }
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $message]],
        ];

        $declarations = $this->tools->declarations($allowedTools);
        $finalText = '';
        $promptTokens = null;
        $completionTokens = null;

        try {
            for ($round = 0; $round < ATTENDANT_MAX_TOOL_ROUNDS; $round++) {
                $turn = $this->llm->generateWithTools(
                    $composed['system'],
                    $contents,
                    $declarations
                );
                $promptTokens = $turn['prompt_tokens'] ?? $promptTokens;
                $completionTokens = $turn['completion_tokens'] ?? $completionTokens;

                $calls = $turn['function_calls'] ?? [];
                if ($calls === []) {
                    $finalText = trim((string) ($turn['text'] ?? ''));
                    break;
                }

                $modelParts = $turn['model_parts'] !== []
                    ? $turn['model_parts']
                    : array_map(static function (array $call): array {
                        return [
                            'functionCall' => [
                                'name' => $call['name'],
                                'args' => $call['args'],
                            ],
                        ];
                    }, $calls);

                $contents[] = [
                    'role' => 'model',
                    'parts' => $modelParts,
                ];

                $responseParts = [];
                foreach ($calls as $call) {
                    $name = (string) ($call['name'] ?? '');
                    $args = is_array($call['args'] ?? null) ? $call['args'] : [];
                    if ($name === '' || !in_array($name, $allowedTools, true)) {
                        $result = ToolResults::fail($name !== '' ? $name : 'unknown', 'unsupported', 'That action is not available.');
                    } else {
                        $result = $this->tools->execute($name, $args, $conversationId, $page, false);
                    }

                    $draft = $this->modelUpdater->fromToolResult($draft, $name, $result);
                    $this->store->saveDraft($conversationId, $draft);

                    $resultData = is_array($result['data'] ?? null) ? $result['data'] : [];
                    $this->telemetry->emit('tool_call', [
                        'conversation_id' => $conversationId,
                        'session_id' => $sessionId,
                        'page_id' => $page['page_id'] ?? null,
                        'tool_name' => $name,
                        'tool_ok' => (bool) ($result['ok'] ?? false),
                        'error_code' => ($result['ok'] ?? false) ? null : (string) ($result['code'] ?? null),
                        'retrieved_ids' => $blocks['retrieved_ids'],
                        'meta' => [
                            'handoff' => $name === 'handoff' && ($result['ok'] ?? false),
                            'payment_handoff' => $name === 'start_order'
                                && ($result['ok'] ?? false)
                                && !empty($resultData['payment_handoff']),
                            'prompt_hash' => $composed['prompt_hash'],
                        ],
                    ]);

                    // First-class observability events (Chunk 3H)
                    if (($result['ok'] ?? false) && $name === 'handoff') {
                        $this->telemetry->emit('escalation', [
                            'conversation_id' => $conversationId,
                            'session_id' => $sessionId,
                            'page_id' => $page['page_id'] ?? null,
                            'tool_name' => 'handoff',
                            'tool_ok' => true,
                            'meta' => [
                                'reason_code' => $resultData['reason_code'] ?? null,
                                'escalation_state' => EscalationState::ESCALATED,
                            ],
                        ]);
                    }
                    if (
                        !($result['ok'] ?? false)
                        && $name === 'get_company_document'
                        && (($result['code'] ?? '') === 'unauthorized')
                    ) {
                        $this->telemetry->emit('retrieval_access_denied', [
                            'conversation_id' => $conversationId,
                            'session_id' => $sessionId,
                            'page_id' => $page['page_id'] ?? null,
                            'tool_name' => 'get_company_document',
                            'tool_ok' => false,
                            'error_code' => 'unauthorized',
                            'meta' => [
                                'requested_id' => $args['id'] ?? null,
                                'requested_slug' => $args['slug'] ?? null,
                            ],
                        ]);
                    }
                    if (
                        ($result['ok'] ?? false)
                        && $name === 'start_order'
                        && !empty($resultData['payment_handoff'])
                        && is_array($resultData['payment_handoff'])
                    ) {
                        $this->telemetry->emit('payment_handoff', [
                            'conversation_id' => $conversationId,
                            'session_id' => $sessionId,
                            'page_id' => $page['page_id'] ?? null,
                            'tool_name' => 'start_order',
                            'tool_ok' => true,
                            'meta' => [
                                'path' => $resultData['payment_handoff']['path'] ?? null,
                                'package' => $resultData['package'] ?? null,
                            ],
                        ]);
                    }

                    if (!empty($result['confirmation_required'])) {
                        $emit('confirmation_required', [
                            'token' => $result['data']['token'] ?? null,
                            'summary' => $result['summary'] ?? null,
                            'tool' => $name,
                            'expires_at' => $result['data']['expires_at'] ?? null,
                        ]);
                    }

                    if (($result['side_effects'] ?? '') === 'client_navigation' && ($result['ok'] ?? false)) {
                        $data = $resultData;
                        $emit('client_action', [
                            'type' => !empty($data['highlight']) ? 'highlight' : 'navigate',
                            'page_id' => $data['page_id'] ?? null,
                            'section_id' => $data['section_id'] ?? null,
                            'path' => $data['path'] ?? null,
                            'hash' => $data['hash'] ?? null,
                            'external' => $data['external'] ?? false,
                        ]);
                    }

                    if (($result['ok'] ?? false) && $name === 'handoff') {
                        $emit('escalation_status', [
                            'escalation_state' => EscalationState::ESCALATED,
                            'message' => 'Connecting you with the team…',
                            'operator_brief' => is_array($resultData['operator_brief'] ?? null)
                                ? ['reason_code' => $resultData['operator_brief']['reason_code'] ?? null]
                                : null,
                        ]);
                    }

                    if (
                        ($result['ok'] ?? false)
                        && $name === 'start_order'
                        && !empty($resultData['payment_handoff'])
                        && is_array($resultData['payment_handoff'])
                    ) {
                        $emit('client_action', $resultData['payment_handoff']);
                    }

                    if (($result['side_effects'] ?? '') === 'await_choice' && ($result['ok'] ?? false)) {
                        $data = is_array($result['data'] ?? null) ? $result['data'] : [];
                        $emit('choices', [
                            'id' => $data['choice_id'] ?? null,
                            'token' => $data['token'] ?? null,
                            'prompt' => $data['prompt'] ?? null,
                            'options' => $data['options'] ?? [],
                            'multi' => !empty($data['multi']),
                            'expires_at' => $data['expires_at'] ?? null,
                        ]);
                    }

                    $responseParts[] = [
                        'functionResponse' => [
                            'name' => $name,
                            'id' => isset($call['id']) ? (string) $call['id'] : null,
                            'response' => $result,
                        ],
                    ];
                }

                $contents[] = [
                    'role' => 'user',
                    'parts' => $responseParts,
                ];
            }

            if ($finalText === '') {
                $closing = $this->llm->generateWithTools($composed['system'], $contents, []);
                $finalText = trim((string) ($closing['text'] ?? ''));
                $promptTokens = $closing['prompt_tokens'] ?? $promptTokens;
                $completionTokens = $closing['completion_tokens'] ?? $completionTokens;
            }
        } catch (GeminiException $e) {
            $this->telemetry->emit('chat_error', [
                'conversation_id' => $conversationId,
                'session_id' => $sessionId,
                'page_id' => $page['page_id'] ?? null,
                'error_code' => $e->errorCode,
                'latency_ms' => (int) (microtime(true) * 1000) - $started,
                'meta' => ['detail' => $e->getMessage()],
            ]);
            $emit('error', ['code' => $e->errorCode, 'message' => $e->userSafeMessage]);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        } catch (\Throwable $e) {
            $this->telemetry->emit('chat_error', [
                'conversation_id' => $conversationId,
                'session_id' => $sessionId,
                'page_id' => $page['page_id'] ?? null,
                'error_code' => 'backend_error',
                'latency_ms' => (int) (microtime(true) * 1000) - $started,
                'meta' => ['detail' => $e->getMessage()],
            ]);
            $emit('error', ['code' => 'backend_error', 'message' => "I can't reply just now."]);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        }

        if ($finalText === '') {
            $emit('error', ['code' => 'backend_error', 'message' => "I can't reply just now."]);
            $emit('done', ['conversation_id' => $conversationId]);
            return;
        }

        // Emit as deltas for SSE clients (chunked for progressive display)
        $chunkSize = 48;
        $len = mb_strlen($finalText);
        for ($i = 0; $i < $len; $i += $chunkSize) {
            $emit('message_delta', ['text' => mb_substr($finalText, $i, $chunkSize)]);
        }

        $this->store->addMessage($conversationId, 'attendant', $finalText);

        $this->telemetry->emit('chat_turn_complete', [
            'conversation_id' => $conversationId,
            'session_id' => $sessionId,
            'page_id' => $page['page_id'] ?? null,
            'active_skills' => $composed['skill_ids'],
            'retrieved_ids' => $blocks['retrieved_ids'],
            'latency_ms' => (int) (microtime(true) * 1000) - $started,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'meta' => ['prompt_hash' => $composed['prompt_hash']],
        ]);

        $emit('done', ['conversation_id' => $conversationId]);
    }
}
