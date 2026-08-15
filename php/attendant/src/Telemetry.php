<?php

declare(strict_types=1);

namespace Attendant;

final class Telemetry
{
    public function __construct(private \PDO $pdo)
    {
    }

    /**
     * Strip secrets from meta payloads before persistence.
     *
     * @param array<string,mixed>|null $meta
     * @return array<string,mixed>|null
     */
    public static function scrubMeta(?array $meta): ?array
    {
        if ($meta === null) {
            return null;
        }
        $banned = [
            'api_key',
            'API_KEY',
            'session_token',
            'raw_token',
            'GEMINI_API_KEY',
            'gemini_api_key',
            'authorization',
            'password',
            'secret',
        ];
        foreach ($banned as $key) {
            unset($meta[$key]);
        }
        foreach ($meta as $k => $v) {
            if (is_array($v)) {
                $meta[$k] = self::scrubMeta($v);
            }
        }
        return $meta;
    }

    /**
     * @param array<string,mixed> $fields
     */
    public function emit(string $eventType, array $fields = []): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO attendant_events
             (conversation_id, session_id, event_type, page_id, section_id, intent_label,
              active_skills_json, retrieved_ids_json, tool_name, tool_ok, latency_ms,
              prompt_tokens, completion_tokens, error_code, meta_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $meta = self::scrubMeta(isset($fields['meta']) && is_array($fields['meta']) ? $fields['meta'] : null);

        $stmt->execute([
            $fields['conversation_id'] ?? null,
            $fields['session_id'] ?? null,
            $eventType,
            $fields['page_id'] ?? null,
            $fields['section_id'] ?? null,
            $fields['intent'] ?? null,
            isset($fields['active_skills'])
                ? json_encode(array_values($fields['active_skills']), JSON_UNESCAPED_UNICODE)
                : null,
            isset($fields['retrieved_ids'])
                ? json_encode(array_values($fields['retrieved_ids']), JSON_UNESCAPED_UNICODE)
                : null,
            $fields['tool_name'] ?? null,
            array_key_exists('tool_ok', $fields)
                ? ($fields['tool_ok'] ? 1 : 0)
                : null,
            $fields['latency_ms'] ?? null,
            $fields['prompt_tokens'] ?? null,
            $fields['completion_tokens'] ?? null,
            $fields['error_code'] ?? null,
            $meta !== null ? json_encode($meta, JSON_UNESCAPED_UNICODE) : null,
        ]);
    }
}
