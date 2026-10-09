<?php

/**
 * Hashed Bearer tokens for the phone-only Sleekly Admin APK (no login UI).
 * Path allowlist is enforced in ApiAuth when auth_via=operator_device_token.
 */
class OperatorDeviceTokenAuth
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

        // Prefer dedicated prefix; still allow lookup by first 12 chars for minted tokens.
        $hash = hash('sha256', $token);
        $prefix = substr($token, 0, 12);

        if (!$this->tableExists('operator_device_tokens')) {
            return false;
        }

        $stmt = $this->pdo->prepare(
            'SELECT id, label, token_hash, operator_user_id, admin_username, scopes
             FROM operator_device_tokens
             WHERE token_prefix = :prefix
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
        if ($scopes === null || $scopes === []) {
            $scopes = ['mobile', 'attendant'];
        }

        $upd = $this->pdo->prepare(
            'UPDATE operator_device_tokens SET last_used_at = NOW() WHERE id = :id'
        );
        $upd->execute([':id' => (int) $matched['id']]);

        $username = trim((string) ($matched['admin_username'] ?? ''));
        if ($username === '') {
            $username = 'operator';
        }

        $userId = isset($matched['operator_user_id']) && $matched['operator_user_id'] !== null
            ? (int) $matched['operator_user_id']
            : null;

        $this->resolvedUser = [
            'id' => $userId,
            'username' => $username,
            'auth_via' => 'operator_device_token',
            'token_id' => (int) $matched['id'],
            'label' => (string) ($matched['label'] ?? ''),
            'scopes' => $scopes,
            'logged_in_at' => gmdate('c'),
        ];

        return true;
    }

    /**
     * Paths allowed for operator_device_token (mobile CRM + attendant).
     */
    public static function pathAllowed(string $path): bool
    {
        $path = '/' . ltrim($path, '/');
        if (str_starts_with($path, '/api/mobile')) {
            return true;
        }
        if (str_starts_with($path, '/api/attendant')) {
            return true;
        }
        if (str_starts_with($path, '/api/requests')) {
            return true;
        }
        if ($path === '/api/auth/mobile/me') {
            return true;
        }

        return false;
    }

    private function tableExists(string $table): bool
    {
        static $cache = [];
        if (array_key_exists($table, $cache)) {
            return $cache[$table];
        }
        try {
            $stmt = $this->pdo->prepare(
                'SELECT COUNT(*) FROM information_schema.tables
                 WHERE table_schema = DATABASE() AND table_name = :table'
            );
            $stmt->execute([':table' => $table]);
            $cache[$table] = (int) $stmt->fetchColumn() > 0;
        } catch (Throwable) {
            $cache[$table] = false;
        }

        return $cache[$table];
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
