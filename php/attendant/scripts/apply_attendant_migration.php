<?php

declare(strict_types=1);

/**
 * Apply 014_attendant.sql
 * Usage (from repo root): php php/attendant/scripts/apply_attendant_migration.php
 */

require_once dirname(__DIR__, 3) . '/php/env.php';

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

$sqlFile = dirname(__DIR__, 3) . '/sleekly-dash/backend/migrations/014_attendant.sql';
$sql = (string) file_get_contents($sqlFile);
if (trim($sql) === '') {
    throw new RuntimeException('014_attendant.sql is empty');
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
    fwrite(STDOUT, 'OK: ' . substr(preg_replace('/\s+/', ' ', $statement), 0, 72) . "…\n");
}

fwrite(STDOUT, "Migration 014_attendant applied on database {$dbName}.\n");
