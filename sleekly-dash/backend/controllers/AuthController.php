<?php

require_once __DIR__ . '/../auth/SessionAuth.php';
require_once __DIR__ . '/../auth/MobileTokenAuth.php';

class AuthController
{
    public function __construct(
        private SessionAuth $auth,
        private MobileTokenAuth $mobileAuth,
    ) {
    }

    public function capabilities(): void
    {
        echo json_encode($this->auth->users()->signupStatus());
    }

    public function login(): void
    {
        $this->rateLimit('dash_auth_login', 20, 3600);

        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request body']);
            return;
        }

        $identifier = trim((string) ($data['email'] ?? $data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($identifier === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            return;
        }

        if (!$this->auth->login($identifier, $password)) {
            http_response_code(401);
            echo json_encode([
                'error' => 'Email or password is incorrect.',
                'hint' => 'reset_password',
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'user' => $this->auth->user(),
        ]);
    }

    public function register(): void
    {
        $this->rateLimit('dash_auth_register', 8, 3600);

        $users = $this->auth->users();
        if (!$users->publicSignupOpen()) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Public account creation is closed.',
                'message' => 'Ask an administrator to create your account in Settings → Team.',
            ]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request body']);
            return;
        }

        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $displayName = trim((string) ($data['display_name'] ?? $data['name'] ?? ''));

        try {
            $isFirst = $users->countUsers() === 0;
            $row = $users->createUser([
                'email' => $email,
                'password' => $password,
                'display_name' => $displayName,
                'role' => 'admin',
            ]);
            $this->auth->loginAsUser($row);

            echo json_encode([
                'success' => true,
                'user' => $this->auth->user(),
                'first_user' => $isFirst,
            ]);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Could not create account.',
                'details' => getenv('APP_DEBUG') === 'true' ? $e->getMessage() : null,
            ]);
        }
    }

    public function forgotPassword(): void
    {
        $this->rateLimit('dash_auth_forgot', 8, 3600);

        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request body']);
            return;
        }

        $email = trim((string) ($data['email'] ?? ''));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Enter a valid email address.']);
            return;
        }

        $result = $this->auth->users()->requestPasswordReset($email);
        echo json_encode($result);
    }

    public function resetPassword(): void
    {
        $this->rateLimit('dash_auth_reset', 10, 3600);

        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request body']);
            return;
        }

        $token = trim((string) ($data['token'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($token === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Reset token and new password are required.']);
            return;
        }

        try {
            $result = $this->auth->users()->resetPasswordWithToken($token, $password);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
            return;
        }

        if ($result === null) {
            http_response_code(400);
            echo json_encode([
                'error' => 'This reset link has expired or is invalid.',
                'hint' => 'request_new_link',
            ]);
            return;
        }

        $this->auth->loginAsUser($result['user']);

        echo json_encode([
            'success' => true,
            'message' => 'Password updated. You are signed in.',
            'user' => $this->auth->user(),
        ]);
    }

    public function listUsers(): void
    {
        $this->auth->requireAuth();
        echo json_encode(['users' => $this->auth->users()->listUsers()]);
    }

    public function createUser(): void
    {
        $this->auth->requireAuth();
        $actor = $this->auth->user();
        if (($actor['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Only admins can create accounts.']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request body']);
            return;
        }

        try {
            $row = $this->auth->users()->createUser([
                'email' => trim((string) ($data['email'] ?? '')),
                'password' => (string) ($data['password'] ?? ''),
                'display_name' => trim((string) ($data['display_name'] ?? $data['name'] ?? '')),
                'role' => ($data['role'] ?? 'admin') === 'member' ? 'member' : 'admin',
            ]);
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'user' => $this->auth->users()->publicUser($row),
            ]);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deactivateUser(int $id): void
    {
        $this->auth->requireAuth();
        $actor = $this->auth->user();
        if (($actor['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Only admins can deactivate accounts.']);
            return;
        }

        try {
            $this->auth->users()->deactivateUser($id, (int) ($actor['id'] ?? 0));
            echo json_encode(['success' => true]);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function logout(): void
    {
        $this->auth->logout();
        echo json_encode(['success' => true]);
    }

    public function me(): void
    {
        $user = $this->auth->user();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        echo json_encode(['user' => $user]);
    }

    public function mobileLogin(): void
    {
        $this->rateLimit('mobile_admin_login', 10, 3600);

        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid request body']);
            return;
        }

        $identifier = trim((string) ($data['email'] ?? $data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($identifier === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Email and password are required.']);
            return;
        }

        $row = $this->mobileAuth->validateCredentials($identifier, $password);
        if (!$row) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid credentials.']);
            return;
        }

        try {
            $token = $this->mobileAuth->issueToken($row);
        } catch (RuntimeException $e) {
            http_response_code(503);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            return;
        }

        $session = $this->auth->users()->sessionPayload($row);
        echo json_encode([
            'success' => true,
            'user' => array_merge($session, ['auth_via' => 'mobile_token']),
            'token' => $token['token'],
            'expires_at' => $token['expires_at'],
            'expires_in' => $token['expires_in'],
        ]);
    }

    public function mobileMe(): void
    {
        if (!$this->mobileAuth->authenticateRequest()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            return;
        }

        echo json_encode([
            'success' => true,
            'user' => $this->mobileAuth->user(),
        ]);
    }

    public function mobileLogout(): void
    {
        echo json_encode(['success' => true, 'message' => 'Signed out. Discard the token on the device.']);
    }

    private function rateLimit(string $bucket, int $max, int $window): void
    {
        $path = __DIR__ . '/../../../php/leads/rate_limit.php';
        if (is_file($path)) {
            require_once $path;
            if (function_exists('uln_rate_limit')) {
                uln_rate_limit($bucket, $max, $window);
            }
        }
    }
}
