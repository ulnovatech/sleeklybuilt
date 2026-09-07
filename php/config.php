<?php
/**
 * Shared MySQL settings for public PHP handlers (contact, inquiries, portfolio APIs).
 * Production / Docker: DB_* from the environment (php/.env bind-mount).
 * Local XAMPP fallback only when DB_HOST is unset and the request is localhost.
 */

require_once __DIR__ . '/env.php';

$db_host = getenv('DB_HOST') ?: '';
$db_user = getenv('DB_USER') ?: '';
$db_pass = getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '';
$db_name = getenv('DB_NAME') ?: '';
$db_port = (int) (getenv('DB_PORT') ?: '3306');

$hostHeader = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
$isLocalHost = $hostHeader === 'localhost'
    || str_starts_with($hostHeader, 'localhost:')
    || $hostHeader === '127.0.0.1'
    || str_starts_with($hostHeader, '127.0.0.1:');

if ($db_host === '' && $isLocalHost) {
    $db_host = 'localhost';
    $db_user = $db_user !== '' ? $db_user : 'root';
    $db_name = $db_name !== '' ? $db_name : 'ulnovatech';
    $db_port = getenv('DB_PORT') ? $db_port : 3310;
}

$DB = [
    'host' => $db_host,
    'user' => $db_user,
    'pass' => $db_pass,
    'name' => $db_name,
    'port' => $db_port,
];

$GLOBALS['DB'] = $DB;
$GLOBALS['db_host'] = $db_host;
$GLOBALS['db_user'] = $db_user;
$GLOBALS['db_pass'] = $db_pass;
$GLOBALS['db_name'] = $db_name;
$GLOBALS['db_port'] = $db_port;

if (!function_exists('uln_db_settings')) {
    /**
     * @return array{host:string,user:string,pass:string,name:string,port:int}
     */
    function uln_db_settings(): array
    {
        $db = $GLOBALS['DB'] ?? [];
        return [
            'host' => (string) ($db['host'] ?? ''),
            'user' => (string) ($db['user'] ?? ''),
            'pass' => (string) ($db['pass'] ?? ''),
            'name' => (string) ($db['name'] ?? ''),
            'port' => (int) ($db['port'] ?? 3306),
        ];
    }
}
