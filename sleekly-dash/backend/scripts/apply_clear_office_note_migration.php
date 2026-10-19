<?php

declare(strict_types=1);

/**
 * Apply 020_clear_office_under_development.sql
 * Usage: php scripts/apply_clear_office_note_migration.php
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';

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
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$sqlFile = __DIR__ . '/../migrations/020_clear_office_under_development.sql';
if (!is_file($sqlFile)) {
    fwrite(STDERR, "MISSING: 020_clear_office_under_development.sql\n");
    exit(1);
}

$sql = trim((string) file_get_contents($sqlFile));
$affected = $pdo->exec($sql);
echo "OK: cleared office-under-development note (rows affected: " . (int) $affected . ")\n";
