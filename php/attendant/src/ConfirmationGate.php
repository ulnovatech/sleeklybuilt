<?php

declare(strict_types=1);

namespace Attendant;

final class ConfirmationGate
{
    /** Tools that require an explicit visitor confirmation before execution. */
    private const WRITE_TOOLS = ['capture_lead', 'start_order'];

    public function __construct(private \PDO $pdo)
    {
    }

    public function requiresConfirmation(string $toolName): bool
    {
        return in_array($toolName, self::WRITE_TOOLS, true);
    }

    /**
     * Create a pending consequential action. Returns the raw token for the client.
     *
     * @param array<string,mixed> $payload
     * @return array{token:string,summary:string,tool:string,expires_at:string}
     */
    public function createPending(
        string $conversationId,
        string $toolName,
        array $payload,
        string $summary
    ): array {
        if (!$this->requiresConfirmation($toolName)) {
            throw new \InvalidArgumentException('Tool does not require confirmation');
        }
        $token = attendant_new_id(24);
        $hash = attendant_hash_token($token);
        $expires = (new \DateTimeImmutable('+' . ATTENDANT_CONFIRM_TTL_SECONDS . ' seconds'))
            ->format('Y-m-d H:i:s');
        $summary = mb_substr(trim($summary), 0, 500);

        $stmt = $this->pdo->prepare(
            'INSERT INTO attendant_pending_actions
             (conversation_id, token_hash, tool_name, payload_json, summary_text, expires_at)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $conversationId,
            $hash,
            $toolName,
            json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $summary,
            $expires,
        ]);

        return [
            'token' => $token,
            'summary' => $summary,
            'tool' => $toolName,
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
             WHERE conversation_id = ? AND consumed_at IS NULL
             ORDER BY id DESC
             LIMIT 1'
        );
        $stmt->execute([$conversationId]);
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
     * Consume a confirmation token. Returns the pending payload once.
     *
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
                 WHERE conversation_id = ? AND token_hash = ?
                 LIMIT 1
                 FOR UPDATE'
            );
            $stmt->execute([$conversationId, $hash]);
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
     * Block write-tool execution from the model path. Always returns a tool-result shape.
     *
     * @param array<string,mixed> $args
     * @return array<string,mixed>
     */
    public function interceptWrite(string $conversationId, string $toolName, array $args, string $summary): array
    {
        if (!$this->requiresConfirmation($toolName)) {
            return [
                'ok' => false,
                'tool' => $toolName,
                'code' => 'validation_error',
                'user_safe_error' => 'This action does not use confirmation.',
                'data' => null,
                'side_effects' => 'none',
                'confirmation_required' => false,
                'summary' => null,
            ];
        }

        $pending = $this->createPending($conversationId, $toolName, $args, $summary);
        return [
            'ok' => false,
            'tool' => $toolName,
            'code' => 'confirmation_required',
            'user_safe_error' => null,
            'data' => [
                'token' => $pending['token'],
                'expires_at' => $pending['expires_at'],
            ],
            'side_effects' => 'none',
            'confirmation_required' => true,
            'summary' => $pending['summary'],
        ];
    }
}
