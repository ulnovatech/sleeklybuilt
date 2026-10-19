<?php

declare(strict_types=1);

/**
 * Shared PDO for MoMo payment domain (provider config, claims, verify).
 * Uses php/config (portfolio/public DB) so Settings and checkout hit the same data.
 */

require_once __DIR__ . '/../config.php';

/**
 * @return PDO
 */
function uln_payment_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $DB = uln_db_settings();
    if ($DB['host'] === '' || $DB['name'] === '') {
        throw new RuntimeException('Payment database is not configured (DB_HOST / DB_NAME).');
    }

    $host = $DB['host'] === 'localhost' ? '127.0.0.1' : $DB['host'];
    $port = (int) ($DB['port'] ?? 3306);
    $dsn = "mysql:host={$host};port={$port};dbname={$DB['name']};charset=utf8mb4";

    $pdo = new PDO($dsn, $DB['user'], $DB['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}
