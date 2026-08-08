<?php

/**
 * Hashed Bearer service tokens for machine integrations (Discovery ↔ sleekly-dash).
 * Valid only when ApiAuth allows /api/integrations/* for auth_via=service_token.
 */
class ServiceTokenAuth
{
    private ?array $resolvedUser = null;

    public function __construct(private PDO $pdo)
    {
    }

    public function user(): ?array
    {
        return $this->resolvedUser;
    }

    public function authenticateRequest(): bool
    {
        $this->resolvedUser = null;
        $token = $this->extractBearerToken();
        if ($token === null || $token === '') {
            return false;
        }

        $hash = hash('sha256', $token);
        $prefix = substr($token, 0, 12);

        $stmt = $this->pdo->prepare(
            'SELECT id, name, token_hash, scopes
             FROM integration_tokens
             WHERE token_prefix = :prefix
               AND is_active = 1
               AND revoked_at IS NULL
             LIMIT 20'
        );
        $stmt->execute([':prefix' => $prefix]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $matched = null;
        foreach ($rows as $row) {
            $stored = (string) ($row['token_hash'] ?? '');
            if ($stored !== '' && hash_equals($stored, $hash)) {
                $matched = $row;
                break;
            }
        }

        if ($matched === null) {
            return false;
        }

        $scopes = null;
        if (!empty($matched['scopes'])) {
            $decoded = is_string($matched['scopes'])
                ? json_decode($matched['scopes'], true)
                : $matched['scopes'];
            $scopes = is_array($decoded) ? $decoded : null;
        }

        $upd = $this->pdo->prepare(
            'UPDATE integration_tokens SET last_used_at = NOW() WHERE id = :id'
        );
        $upd->execute([':id' => (int) $matched['id']]);

        $this->resolvedUser = [
            'username' => 'integration:' . (string) $matched['name'],
            'auth_via' => 'service_token',
            'token_id' => (int) $matched['id'],
            'scopes' => $scopes,
            'logged_in_at' => gmdate('c'),
        ];

        return true;
    }

    private function extractBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (!preg_match('/^Bearer\s+(\S+)$/i', trim($header), $matches)) {
            return null;
        }

        return $matches[1];
    }
}
