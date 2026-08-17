<?php

declare(strict_types=1);

/**
 * Shared bootstrap for SleeklyBuilt Attendant public HTTP handlers.
 */

require_once dirname(__DIR__) . '/env.php';
require_once dirname(__DIR__) . '/leads/rate_limit.php';

const ATTENDANT_MODEL = 'gemini-2.5-flash-lite';
const ATTENDANT_SESSION_TTL_SECONDS = 604800; // 7 days
const ATTENDANT_CONFIRM_TTL_SECONDS = 900; // 15 minutes
const ATTENDANT_MAX_MESSAGE_CHARS = 4000;
const ATTENDANT_HISTORY_LIMIT = 16;
const ATTENDANT_MAX_TOOL_ROUNDS = 4;
const ATTENDANT_CHAT_RATE_MAX = 60;
const ATTENDANT_CHAT_RATE_WINDOW = 3600;
const ATTENDANT_SESSION_RATE_MAX = 30;
const ATTENDANT_CONFIRM_RATE_MAX = 30;
const ATTENDANT_CHOICE_RATE_MAX = 40;

function attendant_contract_dir(): string
{
    static $resolved = null;
    if (is_string($resolved)) {
        return $resolved;
    }

    // public_html/attendant (production build) or repo-root/attendant (local XAMPP)
    $candidates = [
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'attendant',
        dirname(__DIR__) . DIRECTORY_SEPARATOR . 'attendant',
        __DIR__ . DIRECTORY_SEPARATOR . 'contract',
    ];
    foreach ($candidates as $dir) {
        if (is_dir($dir . DIRECTORY_SEPARATOR . 'schemas')
            && is_dir($dir . DIRECTORY_SEPARATOR . 'prompts')
            && is_dir($dir . DIRECTORY_SEPARATOR . 'rules')
            && is_dir($dir . DIRECTORY_SEPARATOR . 'skills')
        ) {
            $resolved = $dir;
            return $resolved;
        }
    }

    throw new RuntimeException(
        'Attendant contract missing (schemas/prompts/rules/skills). Deploy attendant/ into public_html.'
    );
}

function attendant_src_dir(): string
{
    return __DIR__ . DIRECTORY_SEPARATOR . 'src';
}

spl_autoload_register(static function (string $class): void {
    if (!str_starts_with($class, 'Attendant\\')) {
        return;
    }
    $relative = str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen('Attendant\\')));
    $path = attendant_src_dir() . DIRECTORY_SEPARATOR . $relative . '.php';
    if (is_file($path)) {
        require_once $path;
    }
});

function attendant_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: '127.0.0.1';
    if ($host === 'localhost') {
        $host = '127.0.0.1';
    }
    $port = getenv('DB_PORT') ?: '3306';
    $dbName = getenv('DB_NAME') ?: 'sleeklybuilt';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '';

    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName),
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    return $pdo;
}

function attendant_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = getenv('ALLOWED_ORIGINS')
        ?: 'http://localhost:5176,http://localhost:5174,http://localhost:3000,http://localhost,http://hub.34.66.94.12.nip.io';
    $list = array_filter(array_map('trim', explode(',', $allowed)));
    if ($origin !== '' && in_array($origin, $list, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Attendant-Session');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}

function attendant_handle_options(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        attendant_cors();
        http_response_code(204);
        exit;
    }
}

function attendant_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function attendant_json_out(array $data, int $code = 200): void
{
    attendant_cors();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function attendant_new_id(int $bytes = 16): string
{
    return bin2hex(random_bytes($bytes));
}

function attendant_hash_token(string $token): string
{
    return hash('sha256', $token);
}

function attendant_client_ip_hash(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return hash('sha256', $ip);
}
