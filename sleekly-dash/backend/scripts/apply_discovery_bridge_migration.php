<?php

declare(strict_types=1);

/**
 * Apply 011_discovery_bridge.sql (idempotent where possible).
 * Usage: php scripts/apply_discovery_bridge_migration.php
 *
 * Optional: mint a service token after migrate:
 *   php scripts/mint_integration_token.php --name=discovery
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';

// Prefer sleekly-dash/backend/.env over any prior host defaults (localhost vs 127.0.0.1).
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

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $host,
    $port,
    $dbName
);

$pdo = new PDO(
    $dsn,
    $user,
    $pass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$sqlFile = __DIR__ . '/../migrations/011_discovery_bridge.sql';
$sql = (string) file_get_contents($sqlFile);
if (trim($sql) === '') {
    throw new RuntimeException('011_discovery_bridge.sql is empty');
}

// Strip comments, split on semicolons.
$lines = preg_split('/\R/', $sql) ?: [];
$buf = '';
foreach ($lines as $line) {
    $trim = ltrim($line);
    if ($trim === '' || str_starts_with($trim, '--')) {
        continue;
    }
    $buf .= $line . "\n";
}

$statements = array_filter(array_map('trim', explode(';', $buf)));

foreach ($statements as $i => $statement) {
    if ($statement === '') {
        continue;
    }
    try {
        $pdo->exec($statement);
        fwrite(STDOUT, 'OK: statement ' . ($i + 1) . "\n");
    } catch (PDOException $e) {
        $message = $e->getMessage();
        $code = (int) ($e->errorInfo[1] ?? 0);
        if (
            str_contains($message, 'Duplicate column') ||
            str_contains($message, 'Duplicate key') ||
            str_contains($message, 'already exists') ||
            $code === 1060 ||
            $code === 1061 ||
            $code === 1050
        ) {
            fwrite(STDOUT, 'SKIP (already applied): statement ' . ($i + 1) . "\n");
            continue;
        }
        fwrite(STDERR, "FAIL statement " . ($i + 1) . ": {$message}\n");
        throw $e;
    }
}

fwrite(STDOUT, "Discovery bridge schema ready.\n");
fwrite(STDOUT, "Mint a token with: php scripts/mint_integration_token.php --name=discovery\n");
