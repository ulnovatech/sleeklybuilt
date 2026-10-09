<?php

require_once __DIR__ . '/../services/DashUserService.php';

class SessionAuth
{
    private const SESSION_KEY = 'sleekly_dash_user';
    public const OPERATOR_TOKEN_COOKIE = 'sb_operator_token';

    private DashUserService $users;

    public function __construct(private PDO $pdo)
    {
        $this->users = new DashUserService($pdo);

        if (session_status() === PHP_SESSION_NONE) {
            $secure = $this->cookieSecure();
            $params = [
                'lifetime' => 86400,
                'path' => '/',
                'secure' => $secure,
                'httponly' => true,
                'samesite' => 'Lax',
            ];
            $domain = $this->cookieDomain();
            if ($domain !== '') {
                $params['domain'] = $domain;
            }
            session_set_cookie_params($params);
            session_start();
        }
    }

    public function users(): DashUserService
    {
        return $this->users;
    }

    public function user(): ?array
    {
        return $_SESSION[self::SESSION_KEY] ?? null;
    }

    public function check(): bool
    {
        return $this->user() !== null;
    }

    public function login(string $identifier, string $password): bool
    {
        $row = $this->users->verifyCredentials($identifier, $password);
        if (!$row) {
            return false;
        }

        session_regenerate_id(true);
        $_SESSION[self::SESSION_KEY] = $this->users->sessionPayload($row);
        return true;
    }

    public function loginAsUser(array $row): void
    {
        session_regenerate_id(true);
        $_SESSION[self::SESSION_KEY] = $this->users->sessionPayload($row);
    }

    public function logout(): void
    {
        unset($_SESSION[self::SESSION_KEY]);
        $this->clearOperatorTokenCookie();
        session_regenerate_id(true);
    }

    public function setOperatorTokenCookie(string $token, int $expiresIn): void
    {
        $options = [
            'expires' => time() + max(60, $expiresIn),
            'path' => '/',
            'secure' => $this->cookieSecure(),
            'httponly' => true,
            'samesite' => 'Lax',
        ];
        $domain = $this->cookieDomain();
        if ($domain !== '') {
            $options['domain'] = $domain;
        }
        setcookie(self::OPERATOR_TOKEN_COOKIE, $token, $options);
    }

    public function clearOperatorTokenCookie(): void
    {
        $options = [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => $this->cookieSecure(),
            'httponly' => true,
            'samesite' => 'Lax',
        ];
        $domain = $this->cookieDomain();
        if ($domain !== '') {
            $options['domain'] = $domain;
        }
        setcookie(self::OPERATOR_TOKEN_COOKIE, '', $options);
    }

    public function requireAuth(): void
    {
        if (!$this->check()) {
            http_response_code(401);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Please sign in to continue.']);
            exit;
        }
    }

    private function cookieSecure(): bool
    {
        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            return true;
        }
        $proto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
        return $proto === 'https';
    }

    private function cookieDomain(): string
    {
        $configured = trim((string) (getenv('SESSION_COOKIE_DOMAIN') ?: ''));
        if ($configured !== '') {
            return $configured;
        }
        $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
        $host = preg_replace('/:\d+$/', '', $host) ?: '';
        if ($host === 'sleeklybuilt.pro' || str_ends_with($host, '.sleeklybuilt.pro')) {
            return '.sleeklybuilt.pro';
        }
        return '';
    }
}
