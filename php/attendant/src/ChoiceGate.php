<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Stores progressive Decision UI choice sets (tokenized, like confirmation).
 */
final class ChoiceGate
{
    public const TOOL = 'present_choices';

    public function __construct(private \PDO $pdo)
    {
    }

    /**
     * @param array<string,mixed> $payload
     * @return array{token:string,choice_id:string,summary:string,expires_at:string}
     */
    public function createPending(string $conversationId, array $payload, string $summary): array
    {
        $token = attendant_new_id(24);
        $hash = attendant_hash_token($token);
        $choiceId = attendant_new_id(8);
        $expires = (new \DateTimeImmutable('+' . ATTENDANT_CONFIRM_TTL_SECONDS . ' seconds'))
            ->format('Y-m-d H:i:s');
        $summary = mb_substr(trim($summary), 0, 500);
        $payload['choice_id'] = $choiceId;

        $stmt = $this->pdo->prepare(
            'INSERT INTO attendant_pending_actions
             (conversation_id, token_hash, tool_name, payload_json, summary_text, expires_at)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $conversationId,
            $hash,
            self::TOOL,
            json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $summary,
            $expires,
        ]);

        return [
            'token' => $token,
            'choice_id' => $choiceId,
            'summary' => $summary,
            'expires_at' => $expires,
        ];
    }

    /**
     * @return array{id:int,tool_name:string,payload:array,summary:string}|null
     */
    public function peekActive(string $conversationId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, tool_name, payload_json, summary_text, expires_at
             FROM attendant_pending_actions
             WHERE conversation_id = ? AND consumed_at IS NULL AND tool_name = ?
             ORDER BY id DESC
             LIMIT 1'
        );
        $stmt->execute([$conversationId, self::TOOL]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        if (strtotime((string) $row['expires_at']) < time()) {
            return null;
        }
        $payload = json_decode((string) $row['payload_json'], true);
        return [
            'id' => (int) $row['id'],
            'tool_name' => (string) $row['tool_name'],
            'payload' => is_array($payload) ? $payload : [],
            'summary' => (string) $row['summary_text'],
        ];
    }

    /**
     * @return array{tool_name:string,payload:array,summary:string}|null
     */
    public function consume(string $conversationId, string $token): ?array
    {
        if ($token === '') {
            return null;
        }
        $hash = attendant_hash_token($token);
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare(
                'SELECT id, tool_name, payload_json, summary_text, expires_at, consumed_at
                 FROM attendant_pending_actions
                 WHERE conversation_id = ? AND token_hash = ? AND tool_name = ?
                 LIMIT 1
                 FOR UPDATE'
            );
            $stmt->execute([$conversationId, $hash, self::TOOL]);
            $row = $stmt->fetch();
            if (!$row || $row['consumed_at'] !== null) {
                $this->pdo->rollBack();
                return null;
            }
            if (strtotime((string) $row['expires_at']) < time()) {
                $this->pdo->rollBack();
                return null;
            }
            $upd = $this->pdo->prepare(
                'UPDATE attendant_pending_actions SET consumed_at = NOW() WHERE id = ?'
            );
            $upd->execute([(int) $row['id']]);
            $this->pdo->commit();
            $payload = json_decode((string) $row['payload_json'], true);
            return [
                'tool_name' => (string) $row['tool_name'],
                'payload' => is_array($payload) ? $payload : [],
                'summary' => (string) $row['summary_text'],
            ];
        } catch (\Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Cancel without selecting (visitor dismissed chips).
     */
    public function cancel(string $conversationId, string $token): bool
    {
        $consumed = $this->consume($conversationId, $token);
        return $consumed !== null;
    }
}
