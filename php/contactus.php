<?php
ob_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/leads/notify.php';
require_once __DIR__ . '/leads/rate_limit.php';

uln_rate_limit('contactus');

/**
 * Idempotent submit: same submission_key returns the original reference.
 */
function uln_contact_submission_store(string $key, ?array $payload = null): ?array
{
    if ($key === '') {
        return null;
    }

    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ulnovatech_contact_keys';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $file = $dir . DIRECTORY_SEPARATOR . hash('sha256', $key) . '.json';
    if ($payload === null) {
        if (!is_file($file)) {
            return null;
        }
        $decoded = json_decode((string) file_get_contents($file), true);
        return is_array($decoded) ? $decoded : null;
    }

    @file_put_contents($file, json_encode($payload));
    return $payload;
}

$con = mysqli_connect($db_host, $db_user, $db_pass, $db_name, $db_port);
if (!$con) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to connect to database.']);
    ob_end_flush();
    exit;
}

$name    = trim($_POST['name'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$email   = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$intent  = trim($_POST['intent'] ?? '');
$submissionKey = preg_replace('/[^a-zA-Z0-9_-]/', '', substr((string) ($_POST['submission_key'] ?? ''), 0, 80));

if ($submissionKey !== '') {
    $existing = uln_contact_submission_store($submissionKey);
    if (is_array($existing) && ($existing['status'] ?? '') === 'success') {
        http_response_code(200);
        echo json_encode($existing);
        mysqli_close($con);
        ob_end_flush();
        exit;
    }
}

if ($name === '' || $phone === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    mysqli_close($con);
    ob_end_flush();
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format.']);
    mysqli_close($con);
    ob_end_flush();
    exit;
}

if ($intent !== '') {
    $message = "[Intent: {$intent}]\n\n" . $message;
}

$stmt = $con->prepare('INSERT INTO contactus (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Something went wrong. Please try again later.']);
    mysqli_close($con);
    ob_end_flush();
    exit;
}

$stmt->bind_param('sssss', $name, $phone, $email, $subject, $message);
$insert = $stmt->execute();
$stmt->close();

if ($insert) {
    $sourceId = (int) mysqli_insert_id($con);
    $reference = 'MSG-' . str_pad((string) $sourceId, 4, '0', STR_PAD_LEFT);

    uln_notify_lead('contactus', [
        'source_id' => $sourceId,
        'name' => $name,
        'phone' => $phone,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'reference' => $reference,
        'intent' => $intent,
    ]);

    $payload = [
        'status' => 'success',
        'message' => "$name, your message has been received. Reference $reference. We'll reply within one working day.",
        'reference' => $reference,
    ];

    if ($submissionKey !== '') {
        uln_contact_submission_store($submissionKey, $payload);
    }

    http_response_code(200);
    echo json_encode($payload);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Something went wrong. Please try again later.']);
}

mysqli_close($con);
ob_end_flush();
exit;
