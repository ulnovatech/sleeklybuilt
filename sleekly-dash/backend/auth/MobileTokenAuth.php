<?php

require_once __DIR__ . '/../services/DashUserService.php';

/**
 * HS256 JWT for admin mobile app (no extra Composer deps).
 */
class MobileTokenAuth
{
    private const TTL_SECONDS = 604800; // 7 days

    private ?array $resolvedUser = null;
    private DashUserService $users;

    public function __construct(private PDO $pdo)
    {
        $this->users = new DashUserService($pdo);
    }

    public function user(): ?array
    {
        return $this->resolvedUser;
    }

    public function authenticateRequest(): bool
    {
        $this->resolvedUser = null;
        $token = $this->extractBearerToken();
        if ($token === null) {
            return false;
        }

        $payload = $this->decode($token);
        if ($payload === null || empty($payload['sub'])) {
            return false;
        }

        $uid = isset($payload['uid']) ? (int) $payload['uid'] : 0;
        $row = $uid > 0 ? $this->users->findById($uid) : $this->users->findByLoginIdentifier((string) $payload['sub']);
        if (!$row || !(int) ($row['is_active'] ?? 0)) {
            return false;
        }

        $session = $this->users->sessionPayload($row);
        $this->resolvedUser = array_merge($session, [
            'auth_via' => 'mobile_token',
            'logged_in_at' => isset($payload['iat']) ? gmdate('c', (int) $payload['iat']) : $session['logged_in_at'],
        ]);

        return true;
    }

    public function issueToken(array $user): array
    {
        $now = time();
        $sub = (string) ($user['email'] ?? $user['username'] ?? '');
        $payload = [
            'sub' => $sub,
            'uid' => (int) $user['id'],
            'iat' => $now,
            'exp' => $now + self::TTL_SECONDS,
        ];

        return [
            'token' => $this->encode($payload),
            'expires_at' => gmdate('c', $payload['exp']),
            'expires_in' => self::TTL_SECONDS,
        ];
    }

    public function validateCredentials(string $identifier, string $password): ?array
    {
        return $this->users->verifyCredentials($identifier, $password);
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

    private function secret(): string
    {
        $secret = getenv('MOBILE_JWT_SECRET') ?: '';
        if ($secret !== '') {
            return $secret;
        }

        if (getenv('APP_DEBUG') === 'true') {
            return 'sleeklybuilt-mobile-dev-secret-change-me';
        }

        throw new RuntimeException('MOBILE_JWT_SECRET is not configured.');
    }

    private function encode(array $payload): string
    {
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $segments = [
            $this->base64UrlEncode(json_encode($header)),
            $this->base64UrlEncode(json_encode($payload)),
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, $this->secret(), true);
        $segments[] = $this->base64UrlEncode($signature);

        return implode('.', $segments);
    }

    private function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;
        $signingInput = $headerB64 . '.' . $payloadB64;
        $expected = $this->base64UrlEncode(hash_hmac('sha256', $signingInput, $this->secret(), true));

        if (!hash_equals($expected, $signatureB64)) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($payloadB64), true);
        if (!is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && time() >= (int) $payload['exp']) {
            return null;
        }

        return $payload;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }
}
