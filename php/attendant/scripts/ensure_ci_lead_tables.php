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

$statements = [
    <<<'SQL'
CREATE TABLE IF NOT EXISTS contactus (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  subject VARCHAR(255) DEFAULT NULL,
  message TEXT,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contactus_received_at (received_at),
  KEY idx_contactus_name (name),
  KEY idx_contactus_phone (phone),
  KEY idx_contactus_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL,
    <<<'SQL'
CREATE TABLE IF NOT EXISTS website_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  template VARCHAR(255) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) DEFAULT NULL,
  business VARCHAR(255) DEFAULT NULL,
  details TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_website_orders_submitted_at (submitted_at),
  KEY idx_website_orders_name (name),
  KEY idx_website_orders_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL,
];

foreach ($statements as $sql) {
    $pdo->exec($sql);
    $label = preg_match('/TABLE IF NOT EXISTS\s+(\w+)/i', $sql, $m) ? $m[1] : 'table';
    fwrite(STDOUT, "OK lead table: {$label}\n");
}
