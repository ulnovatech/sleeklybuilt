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
        $ins = $this->pdo->prepare(
            'INSERT INTO attendant_conversations (id, session_id, status, draft_json) VALUES (?, ?, ?, ?)'
        );
        $ins->execute([$conversationId, $sessionId, 'active', null]);

        return [
            'session_token' => $token,
            'conversation_id' => $conversationId,
            'expires_at' => $expires,
        ];
    }

    /**
     * @return array{session_id:int,conversation_id:string,draft:?array}|null
     */
    public function resolveSession(string $token): ?array
    {
        if ($token === '' || strlen($token) < 16) {
            return null;
        }
        $hash = attendant_hash_token($token);
        $stmt = $this->pdo->prepare(
            'SELECT s.id AS session_id, s.expires_at, c.id AS conversation_id, c.status, c.draft_json
             FROM attendant_sessions s
             INNER JOIN attendant_conversations c ON c.session_id = s.id
             WHERE s.token_hash = ?
             ORDER BY c.created_at DESC
             LIMIT 1'
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
        $draft = null;
        if (!empty($row['draft_json'])) {
            $decoded = json_decode((string) $row['draft_json'], true);
            $draft = is_array($decoded) ? $decoded : null;
        }
        return [
            'session_id' => (int) $row['session_id'],
            'conversation_id' => (string) $row['conversation_id'],
            'draft' => $draft,
        ];
    }

    public function addMessage(
        string $conversationId,
        string $role,
        string $text,
        ?string $toolName = null,
        ?bool $toolOk = null
    ): int {
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
        $this->touchConversation($conversationId);
        return (int) $this->pdo->lastInsertId();
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

    public function saveDraft(string $conversationId, ?array $draft): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE attendant_conversations SET draft_json = ? WHERE id = ?'
        );
        $stmt->execute([
            $draft === null ? null : json_encode($draft, JSON_UNESCAPED_UNICODE),
            $conversationId,
        ]);
    }

    private function touchConversation(string $conversationId): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE attendant_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        $stmt->execute([$conversationId]);
    }
}
