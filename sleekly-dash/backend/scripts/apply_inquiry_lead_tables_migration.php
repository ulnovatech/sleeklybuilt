<?php

declare(strict_types=1);

/**
 * Create legacy inquiry / lead tables for Inbox + Home summary (idempotent).
 * Usage: php scripts/apply_inquiry_lead_tables_migration.php
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';

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
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$sqlFile = __DIR__ . '/../migrations/019_inquiry_lead_tables.sql';
if (!is_file($sqlFile)) {
    fwrite(STDERR, "MISSING: 019_inquiry_lead_tables.sql\n");
    exit(1);
}

$sql = (string) file_get_contents($sqlFile);
$parts = preg_split('/;\s*\n/', $sql) ?: [];
foreach ($parts as $part) {
    $stmt = trim($part);
    if ($stmt === '' || str_starts_with($stmt, '--')) {
        continue;
    }
    // Drop leading comment-only lines
    $lines = array_values(array_filter(
        explode("\n", $stmt),
        static fn (string $line): bool => !str_starts_with(trim($line), '--')
    ));
    $stmt = trim(implode("\n", $lines));
    if ($stmt === '') {
        continue;
    }
    $pdo->exec($stmt);
    if (preg_match('/TABLE IF NOT EXISTS\s+(\w+)/i', $stmt, $m)) {
        fwrite(STDOUT, "OK: {$m[1]}\n");
    }
}

fwrite(STDOUT, "OK: inquiry lead tables ready.\n");
