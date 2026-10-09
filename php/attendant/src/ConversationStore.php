<?php

declare(strict_types=1);

namespace Attendant;

final class ConversationStore
{
    public function __construct(private \PDO $pdo)
    {
    }

    /**
     * @return array{session_token:string,conversation_id:string,expires_at:string}
     */
    public function createSession(): array
    {
        $token = attendant_new_id(32);
        $hash = attendant_hash_token($token);
        $expires = (new \DateTimeImmutable('+' . ATTENDANT_SESSION_TTL_SECONDS . ' seconds'))
            ->format('Y-m-d H:i:s');

        $stmt = $this->pdo->prepare(
            'INSERT INTO attendant_sessions (token_hash, ip_hash, expires_at) VALUES (?, ?, ?)'
        );
        $stmt->execute([$hash, attendant_client_ip_hash(), $expires]);
        $sessionId = (int) $this->pdo->lastInsertId();

        $conversationId = attendant_new_id(16);
        $draft = CustomerModel::empty();
        $columns = $this->conversationColumns();
        if (isset($columns['commercial_state'])) {
            $ins = $this->pdo->prepare(
                'INSERT INTO attendant_conversations
                 (id, session_id, status, draft_json, commercial_state, escalation_state)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $ins->execute([
                $conversationId,
                $sessionId,
                'active',
                json_encode($draft, JSON_UNESCAPED_UNICODE),
                CommercialStateMachine::DISCOVERY,
                'autonomous',
            ]);
        } else {
            $ins = $this->pdo->prepare(
                'INSERT INTO attendant_conversations (id, session_id, status, draft_json) VALUES (?, ?, ?, ?)'
            );
            $ins->execute([
                $conversationId,
                $sessionId,
                'active',
                json_encode($draft, JSON_UNESCAPED_UNICODE),
            ]);
        }

        return [
            'session_token' => $token,
            'conversation_id' => $conversationId,
            'expires_at' => $expires,
        ];
    }

    /**
     * @return array{
     *   session_id:int,
     *   conversation_id:string,
     *   draft:?array,
     *   commercial_state:string,
     *   escalation_state:string
     * }|null
     */
    public function resolveSession(string $token): ?array
    {
        if ($token === '' || strlen($token) < 16) {
            return null;
        }
        $hash = attendant_hash_token($token);
        $columns = $this->conversationColumns();
        $extra = '';
        if (isset($columns['commercial_state'])) {
            $extra .= ', c.commercial_state';
        }
        if (isset($columns['escalation_state'])) {
            $extra .= ', c.escalation_state';
        }
        $stmt = $this->pdo->prepare(
            "SELECT s.id AS session_id, s.expires_at, c.id AS conversation_id, c.status, c.draft_json
             {$extra}
             FROM attendant_sessions s
             INNER JOIN attendant_conversations c ON c.session_id = s.id
             WHERE s.token_hash = ?
             ORDER BY c.created_at DESC
             LIMIT 1"
        );
        $stmt->execute([$hash]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        if (strtotime((string) $row['expires_at']) < time()) {
            return null;
        }
        if (($row['status'] ?? '') !== 'active') {
            return null;
        }

        // Sliding session window — keep returning visitors on the same conversation.
        $this->touchSession((int) $row['session_id']);

        $draft = null;
        if (!empty($row['draft_json'])) {
            $decoded = json_decode((string) $row['draft_json'], true);
            $draft = is_array($decoded) ? CustomerModel::normalize($decoded) : null;
        }
        return [
            'session_id' => (int) $row['session_id'],
            'conversation_id' => (string) $row['conversation_id'],
            'draft' => $draft,
            'commercial_state' => CommercialStateMachine::normalize(
                isset($row['commercial_state']) ? (string) $row['commercial_state'] : ($draft['commercial_state'] ?? null)
            ),
            'escalation_state' => (string) ($row['escalation_state'] ?? 'autonomous'),
        ];
    }

    /** Extend visitor session expiry on activity (sliding TTL). */
    public function touchSession(int $sessionId): void
    {
        if ($sessionId <= 0) {
            return;
        }
        $expires = (new \DateTimeImmutable('+' . ATTENDANT_SESSION_TTL_SECONDS . ' seconds'))
            ->format('Y-m-d H:i:s');
        try {
            $stmt = $this->pdo->prepare(
                'UPDATE attendant_sessions SET expires_at = ? WHERE id = ?'
            );
            $stmt->execute([$expires, $sessionId]);
        } catch (\Throwable) {
            // Non-fatal — chat can continue with existing expiry.
        }
    }

    /**
     * @return array<string,mixed>|null
     */
    public function getDraft(string $conversationId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT draft_json FROM attendant_conversations WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$conversationId]);
        $row = $stmt->fetch();
        if (!$row || empty($row['draft_json'])) {
            return null;
        }
        $decoded = json_decode((string) $row['draft_json'], true);
        return is_array($decoded) ? CustomerModel::normalize($decoded) : null;
    }

    public function addMessage(
        string $conversationId,
        string $role,
        string $text,
        ?string $toolName = null,
        ?bool $toolOk = null,
        ?string $idempotencyKey = null
    ): int {
        $allowed = ['visitor', 'attendant', 'system', 'human'];
        if (!in_array($role, $allowed, true)) {
            $role = 'system';
        }

        if ($idempotencyKey !== null && $idempotencyKey !== '') {
            $existing = $this->findMessageByIdempotency($conversationId, $idempotencyKey);
            if ($existing !== null) {
                return $existing;
            }
            $columns = $this->messageColumns();
            if (isset($columns['idempotency_key'])) {
                try {
                    $stmt = $this->pdo->prepare(
                        'INSERT INTO attendant_messages
                         (conversation_id, role, text_body, tool_name, tool_ok, idempotency_key)
                         VALUES (?, ?, ?, ?, ?, ?)'
                    );
                    $stmt->execute([
                        $conversationId,
                        $role,
                        $text,
                        $toolName,
                        $toolOk === null ? null : ($toolOk ? 1 : 0),
                        mb_substr($idempotencyKey, 0, 64),
                    ]);
                    $insertedId = $this->resolveInsertedMessageId($conversationId, $idempotencyKey);
                    $this->touchConversation($conversationId);
                    return $insertedId;
                } catch (\PDOException $e) {
                    $again = $this->findMessageByIdempotency($conversationId, $idempotencyKey);
                    if ($again !== null) {
                        return $again;
                    }
                    throw $e;
                }
            }
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO attendant_messages (conversation_id, role, text_body, tool_name, tool_ok)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $conversationId,
            $role,
            $text,
            $toolName,
            $toolOk === null ? null : ($toolOk ? 1 : 0),
        ]);
        $insertedId = $this->resolveInsertedMessageId($conversationId, null);
        $this->touchConversation($conversationId);
        return $insertedId;
    }

    /**
     * PDO lastInsertId() can return 0 across some proxied/persistent connections.
     * Prefer LAST_INSERT_ID(), then idempotency lookup, then latest row for the conversation.
     */
    private function resolveInsertedMessageId(string $conversationId, ?string $idempotencyKey): int
    {
        $id = (int) $this->pdo->lastInsertId();
        if ($id > 0) {
            return $id;
        }
        try {
            $id = (int) $this->pdo->query('SELECT LAST_INSERT_ID()')->fetchColumn();
            if ($id > 0) {
                return $id;
            }
        } catch (\Throwable) {
            // fall through
        }
        if ($idempotencyKey !== null && $idempotencyKey !== '') {
            $found = $this->findMessageByIdempotency($conversationId, $idempotencyKey);
            if ($found !== null && $found > 0) {
                return $found;
            }
        }
        $stmt = $this->pdo->prepare(
            'SELECT id FROM attendant_messages
             WHERE conversation_id = ?
             ORDER BY id DESC
             LIMIT 1'
        );
        $stmt->execute([$conversationId]);
        $row = $stmt->fetch();
        return $row ? (int) $row['id'] : 0;
    }

    public function findMessageByIdempotency(string $conversationId, string $key): ?int
    {
        $columns = $this->messageColumns();
        if (!isset($columns['idempotency_key']) || $key === '') {
            return null;
        }
        $stmt = $this->pdo->prepare(
            'SELECT id FROM attendant_messages
             WHERE conversation_id = ? AND idempotency_key = ?
             LIMIT 1'
        );
        $stmt->execute([$conversationId, mb_substr($key, 0, 64)]);
        $row = $stmt->fetch();
        return $row ? (int) $row['id'] : null;
    }

    /**
     * @return list<array{role:string,text:string,tool_name:?string,tool_ok:?bool}>
     */
    public function recentMessages(string $conversationId, int $limit = ATTENDANT_HISTORY_LIMIT): array
    {
        $limit = max(1, min(50, $limit));
        $stmt = $this->pdo->prepare(
            "SELECT role, text_body, tool_name, tool_ok
             FROM attendant_messages
             WHERE conversation_id = ?
             ORDER BY id DESC
             LIMIT {$limit}"
        );
        $stmt->execute([$conversationId]);
        $rows = array_reverse($stmt->fetchAll() ?: []);
        $out = [];
        foreach ($rows as $row) {
            $out[] = [
                'role' => (string) $row['role'],
                'text' => (string) $row['text_body'],
                'tool_name' => $row['tool_name'] !== null ? (string) $row['tool_name'] : null,
                'tool_ok' => $row['tool_ok'] === null ? null : ((int) $row['tool_ok'] === 1),
            ];
        }
        return $out;
    }

    /**
     * Messages after a cursor id (visitor poll / operator thread).
     *
     * @return list<array{id:int,role:string,text:string,created_at:?string}>
     */
    public function messagesAfter(string $conversationId, int $afterId = 0, int $limit = 50): array
    {
        $limit = max(1, min(100, $limit));
        $stmt = $this->pdo->prepare(
            "SELECT id, role, text_body, created_at
             FROM attendant_messages
             WHERE conversation_id = ? AND id > ?
             ORDER BY id ASC
             LIMIT {$limit}"
        );
        $stmt->execute([$conversationId, max(0, $afterId)]);
        $out = [];
        foreach ($stmt->fetchAll() ?: [] as $row) {
            $out[] = [
                'id' => (int) $row['id'],
                'role' => (string) $row['role'],
                'text' => (string) $row['text_body'],
                'created_at' => isset($row['created_at']) ? (string) $row['created_at'] : null,
            ];
        }
        return $out;
    }

    public function getEscalationState(string $conversationId): string
    {
        $columns = $this->conversationColumns();
        if (!isset($columns['escalation_state'])) {
            return EscalationState::AUTONOMOUS;
        }
        $stmt = $this->pdo->prepare(
            'SELECT escalation_state FROM attendant_conversations WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$conversationId]);
        $row = $stmt->fetch();
        return EscalationState::normalize($row['escalation_state'] ?? null);
    }

    /**
     * @return array<string,mixed>|null
     */
    public function getOperatorBrief(string $conversationId): ?array
    {
        $columns = $this->conversationColumns();
        if (!isset($columns['operator_brief_json'])) {
            return null;
        }
        $stmt = $this->pdo->prepare(
            'SELECT operator_brief_json FROM attendant_conversations WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$conversationId]);
        $row = $stmt->fetch();
        if (!$row || empty($row['operator_brief_json'])) {
            return null;
        }
        $decoded = json_decode((string) $row['operator_brief_json'], true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @return array<string,mixed>|null
     */
    public function getConversation(string $conversationId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM attendant_conversations WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$conversationId]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $draft = null;
        if (!empty($row['draft_json'])) {
            $decoded = json_decode((string) $row['draft_json'], true);
            $draft = is_array($decoded) ? CustomerModel::normalize($decoded) : null;
        }
        $brief = null;
        if (!empty($row['operator_brief_json'])) {
            $decoded = json_decode((string) $row['operator_brief_json'], true);
            $brief = is_array($decoded) ? $decoded : null;
        }
        return [
            'id' => (string) $row['id'],
            'session_id' => (int) ($row['session_id'] ?? 0),
            'status' => (string) ($row['status'] ?? ''),
            'draft' => $draft,
            'commercial_state' => CommercialStateMachine::normalize(
                isset($row['commercial_state']) ? (string) $row['commercial_state'] : ($draft['commercial_state'] ?? null)
            ),
            'escalation_state' => EscalationState::normalize($row['escalation_state'] ?? null),
            'operator_brief' => $brief,
            'escalated_at' => $row['escalated_at'] ?? null,
            'human_taken_at' => $row['human_taken_at'] ?? null,
            'operator_user_id' => isset($row['operator_user_id']) ? (int) $row['operator_user_id'] : null,
            'updated_at' => $row['updated_at'] ?? null,
            'created_at' => $row['created_at'] ?? null,
        ];
    }

    /**
     * Open handoffs waiting for / owned by a human.
     *
     * @return list<array<string,mixed>>
     */
    public function listEscalated(int $limit = 40): array
    {
        return $this->listConversations($limit, 'open');
    }

    /**
     * Operator inbox listing.
     *
     * @param 'open'|'all' $scope open = escalated|human_active; all = every recent thread
     * @return list<array<string,mixed>>
     */
    public function listConversations(int $limit = 50, string $scope = 'all'): array
    {
        $columns = $this->conversationColumns();
        if (!isset($columns['escalation_state'])) {
            return [];
        }
        $limit = max(1, min(150, $limit));
        $scope = $scope === 'open' ? 'open' : 'all';
        $where = $scope === 'open'
            ? "WHERE c.escalation_state IN ('escalated', 'human_active')"
            : '';

        $stmt = $this->pdo->query(
            "SELECT c.id, c.escalation_state, c.operator_brief_json, c.commercial_state, c.updated_at,
                    c.escalated_at, c.human_taken_at, c.draft_json, c.status,
                    (
                      SELECT m.text_body FROM attendant_messages m
                      WHERE m.conversation_id = c.id
                      ORDER BY m.id DESC LIMIT 1
                    ) AS last_text,
                    (
                      SELECT m.role FROM attendant_messages m
                      WHERE m.conversation_id = c.id
                      ORDER BY m.id DESC LIMIT 1
                    ) AS last_role
             FROM attendant_conversations c
             {$where}
             ORDER BY c.updated_at DESC
             LIMIT {$limit}"
        );

        $out = [];
        foreach ($stmt->fetchAll() ?: [] as $row) {
            $mapped = $this->mapConversationListRow($row);
            if ($mapped !== null) {
                $out[] = $mapped;
            }
        }
        return $out;
    }

    /**
     * @param array<string,mixed> $row
     * @return array<string,mixed>|null
     */
    private function mapConversationListRow(array $row): ?array
    {
        $id = trim((string) ($row['id'] ?? ''));
        if ($id === '') {
            return null;
        }

        $brief = null;
        if (!empty($row['operator_brief_json'])) {
            $decoded = json_decode((string) $row['operator_brief_json'], true);
            $brief = is_array($decoded) ? $decoded : null;
        }
        $customer = is_array($brief['customer'] ?? null) ? $brief['customer'] : [];

        $draft = null;
        if (!empty($row['draft_json'])) {
            $decoded = json_decode((string) $row['draft_json'], true);
            $draft = is_array($decoded) ? $decoded : null;
        }
        $draftCustomer = is_array($draft['customer_model'] ?? null) ? $draft['customer_model'] : [];

        $orgName = $customer['org_name']
            ?? $draftCustomer['org_name']
            ?? ($draft['business_name'] ?? null);
        $objective = $customer['objective'] ?? $draftCustomer['objective'] ?? null;
        $summary = $brief['summary'] ?? null;
        if ($summary === null || $summary === '') {
            $last = trim((string) ($row['last_text'] ?? ''));
            if ($last !== '') {
                $role = (string) ($row['last_role'] ?? '');
                $prefix = $role === 'visitor' ? 'Visitor: ' : ($role === 'human' ? 'You: ' : ($role === 'assistant' ? 'AI: ' : ''));
                $summary = $prefix . (mb_strlen($last) > 140 ? mb_substr($last, 0, 140) . '…' : $last);
            }
        }

        return [
            'id' => $id,
            'status' => (string) ($row['status'] ?? ''),
            'escalation_state' => EscalationState::normalize($row['escalation_state'] ?? null),
            'commercial_state' => CommercialStateMachine::normalize($row['commercial_state'] ?? null),
            'reason_code' => $brief['reason_code'] ?? null,
            'summary' => $summary,
            'org_name' => $orgName !== null && $orgName !== '' ? (string) $orgName : null,
            'objective' => $objective !== null && $objective !== '' ? (string) $objective : null,
            'suggested_next_action' => $brief['suggested_next_action'] ?? null,
            'last_text' => isset($row['last_text']) ? (string) $row['last_text'] : null,
            'last_role' => isset($row['last_role']) ? (string) $row['last_role'] : null,
            'updated_at' => $row['updated_at'] ?? null,
            'escalated_at' => $row['escalated_at'] ?? null,
        ];
    }

    /**
     * @param array<string,mixed>|null $draft
     */
    public function saveDraft(string $conversationId, ?array $draft): void
    {
        $normalized = $draft === null ? null : CustomerModel::normalize($draft);
        $columns = $this->conversationColumns();
        if ($normalized !== null && isset($columns['commercial_state'])) {
            $stmt = $this->pdo->prepare(
                'UPDATE attendant_conversations
                 SET draft_json = ?, commercial_state = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?'
            );
            $stmt->execute([
                json_encode($normalized, JSON_UNESCAPED_UNICODE),
                CommercialStateMachine::normalize((string) $normalized['commercial_state']),
                $conversationId,
            ]);
            return;
        }
        $stmt = $this->pdo->prepare(
            'UPDATE attendant_conversations SET draft_json = ? WHERE id = ?'
        );
        $stmt->execute([
            $normalized === null ? null : json_encode($normalized, JSON_UNESCAPED_UNICODE),
            $conversationId,
        ]);
    }

    /**
     * @param array<string,mixed>|null $brief
     */
    public function setEscalationState(
        string $conversationId,
        string $state,
        ?array $brief = null,
        ?int $operatorUserId = null
    ): void {
        $columns = $this->conversationColumns();
        if (!isset($columns['escalation_state'])) {
            return;
        }
        $state = EscalationState::normalize($state);
        $sets = ['escalation_state = ?', 'updated_at = CURRENT_TIMESTAMP'];
        $params = [$state];

        if ($brief !== null && isset($columns['operator_brief_json'])) {
            $sets[] = 'operator_brief_json = ?';
            $params[] = json_encode($brief, JSON_UNESCAPED_UNICODE);
        }

        if (
            ($state === EscalationState::ESCALATED || $state === EscalationState::HUMAN_ACTIVE)
            && isset($columns['commercial_state'])
        ) {
            $sets[] = 'commercial_state = ?';
            $params[] = CommercialStateMachine::ESCALATED;
        }

        if ($state === EscalationState::ESCALATED && isset($columns['escalated_at'])) {
            $sets[] = 'escalated_at = COALESCE(escalated_at, CURRENT_TIMESTAMP)';
        }
        if ($state === EscalationState::HUMAN_ACTIVE && isset($columns['human_taken_at'])) {
            $sets[] = 'human_taken_at = COALESCE(human_taken_at, CURRENT_TIMESTAMP)';
        }
        if ($operatorUserId !== null && isset($columns['operator_user_id'])) {
            $sets[] = 'operator_user_id = ?';
            $params[] = $operatorUserId;
        }

        $params[] = $conversationId;
        $sql = 'UPDATE attendant_conversations SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    }

    /**
     * Return conversation to AI: autonomous escalation, clear operator claim,
     * restore commercial_state off the escalated branch when possible.
     * Keeps escalated_at / human_taken_at for history.
     */
    public function resumeToAutonomous(string $conversationId): void
    {
        $conv = $this->getConversation($conversationId);
        if ($conv === null) {
            return;
        }

        $columns = $this->conversationColumns();
        $sets = ['updated_at = CURRENT_TIMESTAMP'];
        $params = [];

        if (isset($columns['escalation_state'])) {
            $sets[] = 'escalation_state = ?';
            $params[] = EscalationState::AUTONOMOUS;
        }

        if (isset($columns['operator_user_id'])) {
            $sets[] = 'operator_user_id = NULL';
        }

        $commercial = isset($conv['commercial_state'])
            ? CommercialStateMachine::normalize((string) $conv['commercial_state'])
            : CommercialStateMachine::DISCOVERY;

        if (
            isset($columns['commercial_state'])
            && $commercial === CommercialStateMachine::ESCALATED
        ) {
            // Resume is an operator action: restore pre-escalation commercial state from draft
            // when present (transition graph from escalated is intentionally narrow).
            $restored = CommercialStateMachine::DISCOVERY;
            $draft = is_array($conv['draft'] ?? null) ? $conv['draft'] : [];
            if (isset($draft['commercial_state'])) {
                $fromDraft = CommercialStateMachine::normalize((string) $draft['commercial_state']);
                if ($fromDraft !== CommercialStateMachine::ESCALATED) {
                    $restored = $fromDraft;
                }
            }
            $sets[] = 'commercial_state = ?';
            $params[] = $restored;
        }

        $params[] = $conversationId;
        $sql = 'UPDATE attendant_conversations SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    }

    private function touchConversation(string $conversationId): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE attendant_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        $stmt->execute([$conversationId]);
    }

    /**
     * @return array<string,bool>
     */
    private function conversationColumns(): array
    {
        static $cache = null;
        if (is_array($cache)) {
            return $cache;
        }
        $cache = [];
        try {
            $stmt = $this->pdo->query('SHOW COLUMNS FROM attendant_conversations');
            $rows = $stmt ? $stmt->fetchAll() : [];
            foreach ($rows as $row) {
                $field = (string) ($row['Field'] ?? '');
                if ($field !== '') {
                    $cache[$field] = true;
                }
            }
        } catch (\Throwable) {
            $cache = ['draft_json' => true];
        }
        return $cache;
    }

    /**
     * @return array<string,bool>
     */
    private function messageColumns(): array
    {
        static $cache = null;
        if (is_array($cache)) {
            return $cache;
        }
        $cache = [];
        try {
            $stmt = $this->pdo->query('SHOW COLUMNS FROM attendant_messages');
            $rows = $stmt ? $stmt->fetchAll() : [];
            foreach ($rows as $row) {
                $field = (string) ($row['Field'] ?? '');
                if ($field !== '') {
                    $cache[$field] = true;
                }
            }
        } catch (\Throwable) {
            $cache = [];
        }
        return $cache;
    }
}
