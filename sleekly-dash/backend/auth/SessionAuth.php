<?php

require_once __DIR__ . '/../services/DashUserService.php';

class SessionAuth
{
    private const SESSION_KEY = 'sleekly_dash_user';

    private DashUserService $users;

    public function __construct(private PDO $pdo)
    {
        $this->users = new DashUserService($pdo);

        if (session_status() === PHP_SESSION_NONE) {
            $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
            session_set_cookie_params([
                'lifetime' => 86400,
                'path' => '/',
                'secure' => $secure,
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
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
        session_regenerate_id(true);
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
}
