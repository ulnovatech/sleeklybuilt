<?php

declare(strict_types=1);

/**
 * Ensure CRM lead tables exist for attendant integration tests.
 * Production already has these; CI MySQL starts empty.
 *
 * Usage: php php/attendant/scripts/ensure_ci_lead_tables.php
 */

require_once dirname(__DIR__, 3) . '/php/env.php';

$host = getenv('DB_HOST') ?: '127.0.0.1';
if ($host === 'localhost') {
    $host = '127.0.0.1';
}
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'ulnovatech';
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

// Keep in sync with sleekly-dash/backend/migrations/019_inquiry_lead_tables.sql
$sqlFile = dirname(__DIR__, 3) . '/sleekly-dash/backend/migrations/019_inquiry_lead_tables.sql';
if (!is_file($sqlFile)) {
    fwrite(STDERR, "MISSING: 019_inquiry_lead_tables.sql\n");
    exit(1);
}
$sql = (string) file_get_contents($sqlFile);
$statements = preg_split('/;\s*\n/', $sql) ?: [];
$statements = array_values(array_filter(array_map(static function (string $part): string {
    $lines = array_values(array_filter(
        explode("\n", trim($part)),
        static fn (string $line): bool => !str_starts_with(trim($line), '--')
    ));
    return trim(implode("\n", $lines));
}, $statements)));

foreach ($statements as $sql) {
    $pdo->exec($sql);
    $label = preg_match('/TABLE IF NOT EXISTS\s+(\w+)/i', $sql, $m) ? $m[1] : 'table';
    fwrite(STDOUT, "OK lead table: {$label}\n");
}
