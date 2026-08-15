<?php
ob_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/leads/contact_submit.php';

$name    = trim($_POST['name'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$email   = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$intent  = trim($_POST['intent'] ?? '');
$submissionKey = (string) ($_POST['submission_key'] ?? '');

$result = uln_contact_submit([
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'intent' => $intent,
    'submission_key' => $submissionKey,
]);

http_response_code((int) ($result['http'] ?? 500));
if ($result['ok'] ?? false) {
    echo json_encode([
        'status' => 'success',
        'message' => $result['message'],
        'reference' => $result['reference'] ?? null,
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => $result['message'] ?? 'Something went wrong. Please try again later.',
    ]);
}

ob_end_flush();
exit;
