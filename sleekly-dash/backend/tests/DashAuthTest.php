<?php

declare(strict_types=1);

/**
 * Smoke tests for DashUserService (password rules, reset token lifecycle).
 * Usage: php tests/DashAuthTest.php
 * Prerequisite: php scripts/apply_dash_users_migration.php
 */

require_once __DIR__ . '/../services/DashMailer.php';
require_once __DIR__ . '/../services/DashUserService.php';

$envFile = __DIR__ . '/../.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (trim($line) === '' || str_starts_with(trim($line), '#')) {
            continue;
        }
        [$k, $v] = array_map('trim', explode('=', $line, 2));
        if ($k !== '') {
            putenv("$k=$v");
        }
    }
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
if ($host === 'localhost') {
    $host = '127.0.0.1';
}
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'sleeklybuilt';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName),
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    $pdo->query('SELECT 1 FROM dash_users LIMIT 1');
} catch (Throwable $e) {
    fwrite(STDERR, "dash_users missing — run: php scripts/apply_dash_users_migration.php\n");
    fwrite(STDERR, $e->getMessage() . "\n");
    exit(1);
}

class CapturingMailer extends DashMailer
{
    /** @var list<array{to:string,subject:string,body:string}> */
    public array $sent = [];

    public function send(string $to, string $subject, string $body): bool
    {
        $this->sent[] = compact('to', 'subject', 'body');
        return true;
    }
}

$mailer = new CapturingMailer();
$svc = new DashUserService($pdo, $mailer);

$failures = 0;
function assert_true(bool $cond, string $msg): void
{
    global $failures;
    if ($cond) {
        echo "PASS: {$msg}\n";
    } else {
        echo "FAIL: {$msg}\n";
        $failures++;
    }
}

$email = 'auth-test-' . bin2hex(random_bytes(4)) . '@example.com';
$password = 'CorrectHorse1!';

try {
    $created = $svc->createUser([
        'email' => $email,
        'password' => $password,
        'display_name' => 'Auth Test',
        'role' => 'admin',
    ]);
    assert_true((int) $created['id'] > 0, 'create user');

    assert_true($svc->verifyCredentials($email, $password) !== null, 'verify good password');
    assert_true($svc->verifyCredentials($email, 'wrong-password-99') === null, 'reject bad password');

    putenv('DASH_AUTH_EXPOSE_RESET_LINK=true');
    putenv('APP_DEBUG=true');
    putenv('BASE_URL=http://localhost');
    $forgot = $svc->requestPasswordReset($email);
    assert_true(($forgot['ok'] ?? false) === true, 'forgot password ok');
    assert_true(isset($forgot['reset_url']), 'reset url exposed in debug');
    assert_true(count($mailer->sent) >= 1, 'reset email sent');

    $token = '';
    if (preg_match('/token=([a-f0-9]+)/', (string) ($forgot['reset_url'] ?? ''), $m)) {
        $token = $m[1];
    }
    assert_true($token !== '', 'parse reset token');

    $newPass = 'BrandNewPass42';
    assert_true($svc->resetPasswordWithToken($token, $newPass) !== null, 'reset with token');
    assert_true($svc->verifyCredentials($email, $newPass) !== null, 'login with new password');
    assert_true($svc->verifyCredentials($email, $password) === null, 'old password rejected');
    assert_true($svc->resetPasswordWithToken($token, 'AnotherPass99') === null, 'token single-use');

    $pdo->prepare('DELETE FROM dash_users WHERE email = :e')->execute([':e' => $email]);
} catch (Throwable $e) {
    echo 'FAIL: exception ' . $e->getMessage() . "\n";
    $failures++;
    try {
        $pdo->prepare('DELETE FROM dash_users WHERE email = :e')->execute([':e' => $email]);
    } catch (Throwable) {
    }
}

if ($failures > 0) {
    fwrite(STDERR, "{$failures} failure(s)\n");
    exit(1);
}

echo "All DashAuth tests passed.\n";
