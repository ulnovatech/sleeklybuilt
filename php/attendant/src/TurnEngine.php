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
        private KnowledgeCorpus $corpus = new KnowledgeCorpus()
    ) {
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

        $pending = $this->gate->peekActive($conversationId);
        $activeSkills = $this->skills->activate($message, $page, $pending !== null);
        $allowedTools = array_values(array_intersect(
            $this->skills->allowedTools($activeSkills),
            $this->tools->registeredTools()
        ));

        $hits = $this->corpus->search($message, 3);
        $blocks = $this->context->build($page, $draft, $pending, $hits);

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
            if (($row['role'] === 'visitor' || $row['role'] === 'attendant') && $row['text'] !== '') {
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
            $role = ($msg['role'] ?? '') === 'attendant' ? 'model' : 'user';
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
                            'prompt_hash' => $composed['prompt_hash'],
                        ],
                    ]);

                    if (!empty($result['confirmation_required'])) {
                        $emit('confirmation_required', [
                            'token' => $result['data']['token'] ?? null,
                            'summary' => $result['summary'] ?? null,
                            'tool' => $name,
                            'expires_at' => $result['data']['expires_at'] ?? null,
                        ]);
                    }

                    if (($result['side_effects'] ?? '') === 'client_navigation' && ($result['ok'] ?? false)) {
                        $data = is_array($result['data'] ?? null) ? $result['data'] : [];
                        $emit('client_action', [
                            'type' => !empty($data['highlight']) ? 'highlight' : 'navigate',
                            'page_id' => $data['page_id'] ?? null,
                            'section_id' => $data['section_id'] ?? null,
                            'path' => $data['path'] ?? null,
                            'hash' => $data['hash'] ?? null,
                            'external' => $data['external'] ?? false,
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
