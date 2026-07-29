<?php

declare(strict_types=1);

final class TemplateAuditLogger
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * @param array<string,mixed> $details
     */
    public function log(
        string $action,
        string $actor,
        string $slug,
        ?int $jobId = null,
        array $details = []
    ): void {
        $action = trim($action);
        $actor = trim($actor);
        $slug = trim($slug);
        if (
            preg_match('/\A[a-z][a-z0-9_]{1,49}\z/D', $action) !== 1 ||
            $actor === '' ||
            $slug === ''
        ) {
            throw new InvalidArgumentException('Invalid template audit event.');
        }

        $safeDetails = $this->sanitize($details);
        $encoded = $safeDetails === []
            ? null
            : json_encode(
                $safeDetails,
                JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
            );
        if (is_string($encoded) && strlen($encoded) > 16384) {
            throw new InvalidArgumentException('Template audit details exceed 16 KB.');
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO template_import_audit_events
                (job_id, action, actor, slug, details_json)
             VALUES
                (:job_id, :action, :actor, :slug, :details_json)'
        );
        $stmt->execute([
            'job_id' => $jobId,
            'action' => $action,
            'actor' => mb_substr($actor, 0, 100),
            'slug' => mb_substr($slug, 0, 253),
            'details_json' => $encoded,
        ]);
    }

    /**
     * @param array<string,mixed>|null $user
     */
    public static function actor(?array $user): string
    {
        $actor = trim((string) ($user['username'] ?? $user['sub'] ?? ''));
        if ($actor === '') {
            throw new RuntimeException('Authenticated user identity is unavailable.', 401);
        }

        return mb_substr($actor, 0, 100);
    }

    /**
     * @param array<string|int,mixed> $value
     * @return array<string|int,mixed>
     */
    private function sanitize(array $value): array
    {
        $clean = [];
        foreach ($value as $key => $item) {
            if (
                is_string($key) &&
                preg_match('/password|passwd|secret|token|cookie|authorization|credential/i', $key)
            ) {
                continue;
            }
            if (is_array($item)) {
                $clean[$key] = $this->sanitize($item);
                continue;
            }
            if (is_scalar($item) || $item === null) {
                $clean[$key] = $item;
            }
        }

        return $clean;
    }
}
