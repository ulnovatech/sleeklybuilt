<?php
require_once __DIR__ . '/../../php/config.php';

$DB = uln_db_settings();
if ($DB['host'] === '' || $DB['name'] === '') {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$host = $DB['host'] === 'localhost' ? '127.0.0.1' : $DB['host'];
$port = (int) ($DB['port'] ?? 3306);
$dsn = "mysql:host={$host};port={$port};dbname={$DB['name']};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $DB['user'], $DB['pass'], $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}
