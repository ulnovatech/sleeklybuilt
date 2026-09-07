<?php

declare(strict_types=1);

/**
 * Rate-limited prepared insert for legacy product inquiry tables.
 *
 * @return array{ok:bool,status:string,message:string,reference?:string,http:int}
 */
function uln_inquiry_submit(string $table, string $successSuffix): array
{
    require_once __DIR__ . '/../config.php';
    require_once __DIR__ . '/rate_limit.php';

    $allowed = [
        'appdevrequests' => 'App',
        'graphdesrequests' => 'GD',
        'marketingrequests' => 'MK',
        'webdesigninq' => 'WD',
    ];
    if (!isset($allowed[$table])) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Something went wrong. Please try again later.',
            'http' => 500,
        ];
    }

    if (!uln_rate_limit_allows($table, 12, 3600)) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Too many submissions from your network. Please try again later.',
            'http' => 429,
        ];
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $phone = trim((string) ($_POST['phone'] ?? ''));
    $description = trim((string) ($_POST['description'] ?? ''));

    if ($name === '' || $phone === '' || $description === '') {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'All fields are required.',
            'http' => 400,
        ];
    }

    $db = uln_db_settings();
    $db_host = $db['host'];
    $db_user = $db['user'];
    $db_pass = $db['pass'];
    $db_name = $db['name'];
    $db_port = $db['port'];

    if ($db_host === '' || $db_name === '') {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Failed to connect to database.',
            'http' => 500,
        ];
    }

    $con = mysqli_connect($db_host, $db_user, $db_pass, $db_name, (int) $db_port);
    if (!$con) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Failed to connect to database.',
            'http' => 500,
        ];
    }

    $stmt = $con->prepare("INSERT INTO {$table} (name, phone, description) VALUES (?, ?, ?)");
    if (!$stmt) {
        mysqli_close($con);
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Something went wrong. Please try again later.',
            'http' => 500,
        ];
    }

    $stmt->bind_param('sss', $name, $phone, $description);
    $ok = $stmt->execute();
    $id = (int) $con->insert_id;
    $stmt->close();
    mysqli_close($con);

    if (!$ok || $id < 1) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Something went wrong. Please try again later.',
            'http' => 500,
        ];
    }

    $reference = $allowed[$table] . '-' . str_pad((string) $id, 4, '0', STR_PAD_LEFT);

    return [
        'ok' => true,
        'status' => 'success',
        'message' => "{$name}, {$successSuffix} Reference {$reference}.",
        'reference' => $reference,
        'http' => 200,
    ];
}
