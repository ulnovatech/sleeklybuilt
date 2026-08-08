<?php

declare(strict_types=1);

/**
 * Create a one-time plaintext service token for /api/integrations/*.
 * Usage: php scripts/mint_integration_token.php --name=discovery
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';

$name = 'discovery';
foreach ($argv as $arg) {
    if (str_starts_with($arg, '--name=')) {
        $name = substr($arg, 7);
    }
}
$name = preg_replace('/[^a-zA-Z0-9_\-]/', '', $name) ?: 'discovery';

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

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName),
    $user,
    $pass,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$plain = 'uln_' . bin2hex(random_bytes(24));
$prefix = substr($plain, 0, 12);
$hash = hash('sha256', $plain);

$stmt = $pdo->prepare(
    'INSERT INTO integration_tokens (name, token_prefix, token_hash, scopes, is_active)
     VALUES (:name, :prefix, :hash, :scopes, 1)'
);
$stmt->execute([
    ':name' => $name,
    ':prefix' => $prefix,
    ':hash' => $hash,
    ':scopes' => json_encode(['integrations']),
]);

fwrite(STDOUT, "Created integration token id=" . $pdo->lastInsertId() . " name={$name}\n");
fwrite(STDOUT, "Save this Bearer token now (shown once):\n{$plain}\n");
fwrite(STDOUT, "\nExample:\n");
fwrite(STDOUT, "curl -s -X POST \"http://localhost/sleeklybuilt/sleekly-dash/backend/api/integrations/prospects\" \\\n");
fwrite(STDOUT, "  -H \"Authorization: Bearer {$plain}\" -H \"Content-Type: application/json\" \\\n");
fwrite(STDOUT, "  -d \"{\\\"discovery_account_id\\\":\\\"acct-demo-1\\\",\\\"name\\\":\\\"Demo Cafe\\\",\\\"industry\\\":\\\"Hospitality\\\",\\\"location\\\":\\\"Kampala\\\",\\\"discovery_score\\\":78}\"\n");
