<?php

declare(strict_types=1);

/**
 * Apply 012_site_contact_settings.sql
 * Usage: php scripts/apply_site_contact_settings_migration.php
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

$sqlFile = __DIR__ . '/../migrations/012_site_contact_settings.sql';
$sql = (string) file_get_contents($sqlFile);
if (trim($sql) === '') {
    throw new RuntimeException('012_site_contact_settings.sql is empty');
}

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
foreach ($statements as $statement) {
    if ($statement === '') {
        continue;
    }
    $pdo->exec($statement);
    fwrite(STDOUT, "OK: " . substr(preg_replace('/\s+/', ' ', $statement), 0, 72) . "…\n");
}

fwrite(STDOUT, "Migration 012_site_contact_settings applied.\n");
