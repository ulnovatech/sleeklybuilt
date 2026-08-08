<?php

declare(strict_types=1);

require_once __DIR__ . '/DashMailer.php';

/**
 * DB-backed dash accounts: login, register, password reset, team invite.
 */
class DashUserService
{
    public const MIN_PASSWORD_LENGTH = 12;
    public const RESET_TTL_SECONDS = 3600;

    public function __construct(
        private PDO $pdo,
        private ?DashMailer $mailer = null,
    ) {
        $this->mailer ??= new DashMailer();
    }

    public function countUsers(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM dash_users')->fetchColumn();
    }

    public function publicSignupOpen(): bool
    {
        if ($this->countUsers() === 0) {
            return true;
        }
        return $this->envFlag('DASH_ALLOW_PUBLIC_SIGNUP');
    }

    public function signupStatus(): array
    {
        $count = $this->countUsers();
        if ($count === 0) {
            return [
                'signup_open' => true,
                'reason' => 'first_user',
                'message' => 'Create the first admin account for this dashboard.',
            ];
        }
        if ($this->envFlag('DASH_ALLOW_PUBLIC_SIGNUP')) {
            return [
                'signup_open' => true,
                'reason' => 'public',
                'message' => 'Create a Sleekly Dash account.',
            ];
        }
        return [
            'signup_open' => false,
            'reason' => 'closed',
            'message' => 'New accounts are created by an administrator in Settings → Team.',
        ];
    }

    /**
     * Seed first admin from DASH_ADMIN_* env when the table is empty.
     * Returns the user row or null when nothing was seeded.
     */
    public function bootstrapFromEnvIfEmpty(): ?array
    {
        if ($this->countUsers() > 0) {
            return null;
        }

        $username = trim((string) (getenv('DASH_ADMIN_USER') ?: ''));
        $passHash = (string) (getenv('DASH_ADMIN_PASS_HASH') ?: '');
        $passPlain = (string) (getenv('DASH_ADMIN_PASS') ?: '');
        $emailEnv = trim((string) (getenv('DASH_ADMIN_EMAIL') ?: ''));

        if ($username === '' && $emailEnv === '') {
            return null;
        }
        if ($passHash === '' && $passPlain === '') {
            return null;
        }

        $email = $emailEnv !== ''
            ? strtolower($emailEnv)
            : (str_contains($username, '@')
                ? strtolower($username)
                : strtolower(($username !== '' ? $username : 'admin') . '@local.sleeklybuilt'));

        $hash = $passHash !== '' ? $passHash : password_hash($passPlain, PASSWORD_DEFAULT);
        $uname = $username !== '' && !str_contains($username, '@') ? $username : null;

        return $this->createUser([
            'email' => $email,
            'username' => $uname,
            'password_hash' => $hash,
            'display_name' => $uname ?: 'Admin',
            'role' => 'admin',
        ]);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM dash_users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM dash_users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => strtolower(trim($email))]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findByLoginIdentifier(string $identifier): ?array
    {
        $id = trim($identifier);
        if ($id === '') {
            return null;
        }

        if (str_contains($id, '@')) {
            return $this->findByEmail($id);
        }

        $stmt = $this->pdo->prepare(
            'SELECT * FROM dash_users WHERE username = :u OR email = :e LIMIT 1'
        );
        $stmt->execute([
            ':u' => $id,
            ':e' => strtolower($id),
        ]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function listUsers(): array
    {
        $rows = $this->pdo->query(
            'SELECT id, email, username, display_name, role, is_active, created_at, last_login_at
             FROM dash_users
             ORDER BY id ASC'
        )->fetchAll();

        return array_map([$this, 'publicUser'], $rows);
    }

    public function createUser(array $data): array
    {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('A valid email is required.');
        }

        if ($this->findByEmail($email)) {
            throw new InvalidArgumentException('An account with this email already exists.');
        }

        $passwordHash = (string) ($data['password_hash'] ?? '');
        if ($passwordHash === '') {
            $password = (string) ($data['password'] ?? '');
            $this->assertPasswordStrength($password);
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        }

        $username = isset($data['username']) && $data['username'] !== null && $data['username'] !== ''
            ? trim((string) $data['username'])
            : null;
        if ($username !== null) {
            $check = $this->pdo->prepare('SELECT id FROM dash_users WHERE username = :u LIMIT 1');
            $check->execute([':u' => $username]);
            if ($check->fetch()) {
                throw new InvalidArgumentException('That username is already taken.');
            }
        }

        $role = ($data['role'] ?? 'admin') === 'member' ? 'member' : 'admin';
        $display = trim((string) ($data['display_name'] ?? ''));
        if ($display === '') {
            $display = strstr($email, '@', true) ?: $email;
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO dash_users (email, username, password_hash, display_name, role, is_active)
             VALUES (:email, :username, :password_hash, :display_name, :role, 1)'
        );
        $stmt->execute([
            ':email' => $email,
            ':username' => $username,
            ':password_hash' => $passwordHash,
            ':display_name' => $display,
            ':role' => $role,
        ]);

        $user = $this->findById((int) $this->pdo->lastInsertId());
        if (!$user) {
            throw new RuntimeException('Failed to create user.');
        }
        return $user;
    }

    public function verifyCredentials(string $identifier, string $password): ?array
    {
        $this->bootstrapFromEnvIfEmpty();

        $user = $this->findByLoginIdentifier($identifier);
        if (!$user || !(int) ($user['is_active'] ?? 0)) {
            return null;
        }

        if (!password_verify($password, (string) $user['password_hash'])) {
            return null;
        }

        $this->pdo->prepare('UPDATE dash_users SET last_login_at = NOW() WHERE id = :id')
            ->execute([':id' => $user['id']]);

        return $this->findById((int) $user['id']);
    }

    public function assertPasswordStrength(string $password): void
    {
        if (strlen($password) < self::MIN_PASSWORD_LENGTH) {
            throw new InvalidArgumentException(
                'Password must be at least ' . self::MIN_PASSWORD_LENGTH . ' characters.'
            );
        }
        if (!preg_match('/\d/', $password)) {
            throw new InvalidArgumentException('Password must include at least one number.');
        }
    }

    public function setPassword(int $userId, string $password): void
    {
        $this->assertPasswordStrength($password);
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $this->pdo->prepare('UPDATE dash_users SET password_hash = :h WHERE id = :id')
            ->execute([':h' => $hash, ':id' => $userId]);
    }

    public function deactivateUser(int $id, int $actorId): void
    {
        if ($id === $actorId) {
            throw new InvalidArgumentException('You cannot deactivate your own account.');
        }
        $user = $this->findById($id);
        if (!$user) {
            throw new InvalidArgumentException('User not found.');
        }
        $this->pdo->prepare('UPDATE dash_users SET is_active = 0 WHERE id = :id')
            ->execute([':id' => $id]);
    }

    /**
     * Always returns a generic result to avoid account enumeration.
     * @return array{ok: bool, message: string, reset_url?: string}
     */
    public function requestPasswordReset(string $email): array
    {
        $generic = [
            'ok' => true,
            'message' => 'If an account exists for that email, a reset link is on its way. Check your inbox.',
        ];

        $user = $this->findByEmail($email);
        if (!$user || !(int) ($user['is_active'] ?? 0)) {
            return $generic;
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expires = date('Y-m-d H:i:s', time() + self::RESET_TTL_SECONDS);

        $this->pdo->prepare(
            'UPDATE dash_password_resets SET used_at = NOW()
             WHERE user_id = :uid AND used_at IS NULL'
        )->execute([':uid' => $user['id']]);

        $this->pdo->prepare(
            'INSERT INTO dash_password_resets (user_id, token_hash, expires_at)
             VALUES (:uid, :th, :exp)'
        )->execute([
            ':uid' => $user['id'],
            ':th' => $tokenHash,
            ':exp' => $expires,
        ]);

        $resetUrl = $this->resetUrl($token);
        $brand = getenv('BRAND_NAME') ?: 'SleeklyBuilt';
        $body = implode("\n", [
            "Hi,",
            '',
            "We received a request to reset your {$brand} Dash password.",
            "This link expires in 60 minutes:",
            '',
            $resetUrl,
            '',
            'If you did not request this, you can ignore this email.',
        ]);

        $this->mailer->send((string) $user['email'], "Reset your {$brand} Dash password", $body);

        if ($this->envFlag('DASH_AUTH_EXPOSE_RESET_LINK') && getenv('APP_DEBUG') === 'true') {
            $generic['reset_url'] = $resetUrl;
        }

        return $generic;
    }

    /**
     * @return array{user: array}|null
     */
    public function resetPasswordWithToken(string $token, string $password): ?array
    {
        $token = trim($token);
        if ($token === '') {
            return null;
        }

        $this->assertPasswordStrength($password);

        $tokenHash = hash('sha256', $token);
        $stmt = $this->pdo->prepare(
            'SELECT r.*, u.email, u.is_active
             FROM dash_password_resets r
             INNER JOIN dash_users u ON u.id = r.user_id
             WHERE r.token_hash = :th
             LIMIT 1'
        );
        $stmt->execute([':th' => $tokenHash]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        if ($row['used_at'] !== null) {
            return null;
        }
        if (strtotime((string) $row['expires_at']) < time()) {
            return null;
        }
        if (!(int) ($row['is_active'] ?? 0)) {
            return null;
        }

        $userId = (int) $row['user_id'];
        $this->setPassword($userId, $password);
        $this->pdo->prepare('UPDATE dash_password_resets SET used_at = NOW() WHERE id = :id')
            ->execute([':id' => $row['id']]);

        $user = $this->findById($userId);
        if (!$user) {
            return null;
        }

        $brand = getenv('BRAND_NAME') ?: 'SleeklyBuilt';
        $this->mailer->send(
            (string) $user['email'],
            "Your {$brand} Dash password was changed",
            "Your password was updated successfully. If you did not do this, contact your administrator immediately."
        );

        return ['user' => $user];
    }

    public function publicUser(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'email' => (string) $row['email'],
            'username' => $row['username'] !== null ? (string) $row['username'] : null,
            'display_name' => $row['display_name'] !== null ? (string) $row['display_name'] : null,
            'role' => (string) ($row['role'] ?? 'admin'),
            'is_active' => (bool) (int) ($row['is_active'] ?? 1),
            'created_at' => $row['created_at'] ?? null,
            'last_login_at' => $row['last_login_at'] ?? null,
        ];
    }

    public function sessionPayload(array $user): array
    {
        $public = $this->publicUser($user);
        return [
            'id' => $public['id'],
            'email' => $public['email'],
            'username' => $public['username'] ?: $public['email'],
            'display_name' => $public['display_name'],
            'role' => $public['role'],
            'logged_in_at' => date('c'),
        ];
    }

    private function resetUrl(string $token): string
    {
        $base = rtrim((string) (getenv('BASE_URL') ?: ''), '/');
        if ($base === '') {
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $base = $scheme . '://' . $host;
        }
        return $base . '/dash/reset-password?token=' . urlencode($token);
    }

    private function envFlag(string $name): bool
    {
        $v = strtolower(trim((string) (getenv($name) ?: '')));
        return in_array($v, ['1', 'true', 'yes', 'on'], true);
    }
}
