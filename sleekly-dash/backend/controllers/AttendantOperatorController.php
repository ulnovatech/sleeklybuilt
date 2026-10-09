<?php

declare(strict_types=1);

/**
 * Operator APIs for attendant escalations (admin-mobile / dash JWT).
 */
class AttendantOperatorController
{
    private Attendant\ConversationStore $store;

    public function __construct(private PDO $pdo)
    {
        $bootstrap = dirname(__DIR__, 3) . '/php/attendant/bootstrap.php';
        if (!is_file($bootstrap)) {
            throw new RuntimeException('Attendant bootstrap missing');
        }
        require_once $bootstrap;
        $this->store = new Attendant\ConversationStore($pdo);
    }

    public function index(): void
    {
        $rows = $this->store->listEscalated(50);
        echo json_encode([
            'success' => true,
            'escalations' => $rows,
            'meta' => ['total' => count($rows)],
        ]);
    }

    /** All recent chats (including AI-only / not handed over). */
    public function indexAll(): void
    {
        $limit = max(1, min(150, (int) ($_GET['limit'] ?? 80)));
        $rows = $this->store->listConversations($limit, 'all');
        echo json_encode([
            'success' => true,
            'conversations' => $rows,
            // Back-compat for clients that still read escalations[]
            'escalations' => array_values(array_filter(
                $rows,
                static fn (array $r): bool => in_array(
                    (string) ($r['escalation_state'] ?? ''),
                    [Attendant\EscalationState::ESCALATED, Attendant\EscalationState::HUMAN_ACTIVE],
                    true
                )
            )),
            'meta' => [
                'total' => count($rows),
                'scope' => 'all',
                'limit' => $limit,
            ],
        ]);
    }

    public function show(string $id): void
    {
        $conv = $this->store->getConversation($id);
        if ($conv === null) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Conversation not found']);
            return;
        }
        $messages = $this->store->messagesAfter($id, 0, 200);
        echo json_encode([
            'success' => true,
            'conversation' => $conv,
            'messages' => $messages,
        ]);
    }

    public function takeover(string $id, ?int $userId): void
    {
        $conv = $this->store->getConversation($id);
        if ($conv === null) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Conversation not found']);
            return;
        }
        $from = Attendant\EscalationState::normalize((string) ($conv['escalation_state'] ?? 'autonomous'));
        if ($from === Attendant\EscalationState::HUMAN_ACTIVE) {
            echo json_encode([
                'success' => true,
                'escalation_state' => Attendant\EscalationState::HUMAN_ACTIVE,
                'already_active' => true,
            ]);
            return;
        }
        $to = Attendant\EscalationState::transition($from, Attendant\EscalationState::HUMAN_ACTIVE);
        if ($to !== Attendant\EscalationState::HUMAN_ACTIVE) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'Cannot take over from state ' . $from,
                'escalation_state' => $from,
            ]);
            return;
        }
        $this->store->setEscalationState($id, Attendant\EscalationState::HUMAN_ACTIVE, null, $userId);
        $this->store->addMessage(
            $id,
            'system',
            'A team member has joined this conversation.',
            null,
            null,
            'takeover-' . $id . '-' . time()
        );
        try {
            $telemetry = new Attendant\Telemetry($this->pdo);
            $telemetry->emit('operator_takeover', [
                'conversation_id' => $id,
                'tool_ok' => true,
                'meta' => [
                    'operator_user_id' => $userId,
                    'escalation_state' => Attendant\EscalationState::HUMAN_ACTIVE,
                    'from_state' => $from,
                ],
            ]);
        } catch (Throwable $e) {
            error_log('operator_takeover telemetry: ' . $e->getMessage());
        }
        echo json_encode([
            'success' => true,
            'escalation_state' => Attendant\EscalationState::HUMAN_ACTIVE,
        ]);
    }

    public function resume(string $id): void
    {
        $conv = $this->store->getConversation($id);
        if ($conv === null) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Conversation not found']);
            return;
        }
        $from = (string) ($conv['escalation_state'] ?? 'autonomous');
        $toResumed = Attendant\EscalationState::transition($from, Attendant\EscalationState::RESUMED);
        if ($toResumed !== Attendant\EscalationState::RESUMED
            && $from !== Attendant\EscalationState::RESUMED
        ) {
            // Allow direct return to autonomous from escalated/human_active
            $toAuto = Attendant\EscalationState::transition($from, Attendant\EscalationState::AUTONOMOUS);
            if ($toAuto !== Attendant\EscalationState::AUTONOMOUS) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => 'Cannot resume from state ' . $from,
                    'escalation_state' => $from,
                ]);
                return;
            }
            $this->store->resumeToAutonomous($id);
            $this->store->addMessage(
                $id,
                'system',
                'The attendant is available again in this chat.',
                null,
                null,
                'resume-auto-' . $id . '-' . time()
            );
            echo json_encode([
                'success' => true,
                'escalation_state' => Attendant\EscalationState::AUTONOMOUS,
            ]);
            return;
        }

        $this->store->setEscalationState($id, Attendant\EscalationState::RESUMED);
        $this->store->resumeToAutonomous($id);
        $this->store->addMessage(
            $id,
            'system',
            'The attendant is available again in this chat.',
            null,
            null,
            'resume-' . $id . '-' . time()
        );
        echo json_encode([
            'success' => true,
            'escalation_state' => Attendant\EscalationState::AUTONOMOUS,
        ]);
    }

    /**
     * @param array<string,mixed> $body
     */
    public function postMessage(string $id, array $body, ?int $userId): void
    {
        $conv = $this->store->getConversation($id);
        if ($conv === null) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Conversation not found']);
            return;
        }
        $state = Attendant\EscalationState::normalize((string) ($conv['escalation_state'] ?? ''));

        $text = trim((string) ($body['text'] ?? $body['message'] ?? ''));
        if ($text === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Message text is required']);
            return;
        }
        if (mb_strlen($text) > 4000) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Message is too long']);
            return;
        }

        // First operator reply claims the conversation (escalated, AI-only, or resumed).
        if ($state !== Attendant\EscalationState::HUMAN_ACTIVE) {
            $to = Attendant\EscalationState::transition($state, Attendant\EscalationState::HUMAN_ACTIVE);
            if ($to !== Attendant\EscalationState::HUMAN_ACTIVE) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => 'Cannot join this chat from state ' . $state,
                    'escalation_state' => $state,
                ]);
                return;
            }
            $this->store->setEscalationState($id, Attendant\EscalationState::HUMAN_ACTIVE, null, $userId);
            $this->store->addMessage(
                $id,
                'system',
                'A team member has joined this conversation.',
                null,
                null,
                'takeover-on-reply-' . $id
            );
        }

        $idem = isset($body['idempotency_key'])
            ? trim((string) $body['idempotency_key'])
            : trim((string) ($_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? ''));
        if ($idem === '') {
            $idem = null;
        }

        try {
            $msgId = $this->store->addMessage($id, 'human', $text, null, null, $idem);
        } catch (Throwable $e) {
            error_log('operator_post_message: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Could not save your reply. Try again.',
            ]);
            return;
        }

        if ($msgId <= 0) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Reply was not saved. Try again.',
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'message' => [
                'id' => $msgId,
                'role' => 'human',
                'text' => $text,
            ],
            'escalation_state' => $this->store->getEscalationState($id),
        ]);
    }
}
