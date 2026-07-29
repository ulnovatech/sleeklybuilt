<?php

declare(strict_types=1);

/**
 * Create the template import job store (idempotent).
 * Usage: php scripts/apply_template_import_migrations.php
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'ulnovatech';
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

$files = [
    '007_template_import_jobs.sql',
    '008_template_import_rollback_state.sql',
    '009_template_import_audit_events.sql',
];

foreach ($files as $file) {
    $sqlFile = __DIR__ . '/../migrations/' . $file;
    $sql = trim((string) file_get_contents($sqlFile));
    if ($sql === '') {
        throw new RuntimeException("Template import migration is empty: {$file}");
    }
    $pdo->exec($sql);
    fwrite(STDOUT, "OK: {$file}\n");
}

fwrite(STDOUT, "Template import schema ready.\n");
