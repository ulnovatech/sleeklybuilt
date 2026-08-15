<?php

declare(strict_types=1);

/**
 * Shared contact insert used by contactus.php and the attendant capture_lead tool.
 *
 * @param array{
 *   name:string,phone:string,email:string,subject:string,message:string,
 *   intent?:string,submission_key?:string
 * } $fields
 * @return array{ok:bool,status:string,message:string,reference?:string,http:int}
 */
function uln_contact_submit(array $fields): array
{
    require_once __DIR__ . '/../config.php';
    require_once __DIR__ . '/notify.php';
    require_once __DIR__ . '/rate_limit.php';

    if (!uln_rate_limit_allows('contactus', 12, 3600)) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Too many submissions from your network. Please try again later.',
            'http' => 429,
        ];
    }

    $name = trim((string) ($fields['name'] ?? ''));
    $phone = trim((string) ($fields['phone'] ?? ''));
    $email = trim((string) ($fields['email'] ?? ''));
    $subject = trim((string) ($fields['subject'] ?? ''));
    $message = trim((string) ($fields['message'] ?? ''));
    $intent = trim((string) ($fields['intent'] ?? ''));
    $submissionKey = preg_replace(
        '/[^a-zA-Z0-9_-]/',
        '',
        substr((string) ($fields['submission_key'] ?? ''), 0, 80)
    );

    if ($submissionKey !== '') {
        $existing = uln_contact_submission_store($submissionKey);
        if (is_array($existing) && ($existing['status'] ?? '') === 'success') {
            return [
                'ok' => true,
                'status' => 'success',
                'message' => (string) ($existing['message'] ?? 'Already received.'),
                'reference' => (string) ($existing['reference'] ?? ''),
                'http' => 200,
            ];
        }
    }

    if ($name === '' || $phone === '' || $email === '' || $subject === '' || $message === '') {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'All fields are required.',
            'http' => 400,
        ];
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Invalid email format.',
            'http' => 400,
        ];
    }

    if ($intent !== '') {
        $message = "[Intent: {$intent}]\n\n" . $message;
    }

    $con = mysqli_connect($db_host, $db_user, $db_pass, $db_name, $db_port);
    if (!$con) {
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Failed to connect to database.',
            'http' => 500,
        ];
    }

    $stmt = $con->prepare('INSERT INTO contactus (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)');
    if (!$stmt) {
        mysqli_close($con);
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Something went wrong. Please try again later.',
            'http' => 500,
        ];
    }

    $stmt->bind_param('sssss', $name, $phone, $email, $subject, $message);
    $insert = $stmt->execute();
    $stmt->close();

    if (!$insert) {
        mysqli_close($con);
        return [
            'ok' => false,
            'status' => 'error',
            'message' => 'Something went wrong. Please try again later.',
            'http' => 500,
        ];
    }

    $sourceId = (int) mysqli_insert_id($con);
    mysqli_close($con);
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
        'message' => "{$name}, your message has been received. Reference {$reference}. We'll reply within one working day.",
        'reference' => $reference,
    ];

    if ($submissionKey !== '') {
        uln_contact_submission_store($submissionKey, $payload);
    }

    return [
        'ok' => true,
        'status' => 'success',
        'message' => $payload['message'],
        'reference' => $reference,
        'http' => 200,
    ];
}

/**
 * Idempotent submit store (shared with contactus.php).
 *
 * @return array<string,mixed>|null
 */
function uln_contact_submission_store(string $key, ?array $payload = null): ?array
{
    if ($key === '') {
        return null;
    }

    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'sleeklybuilt_contact_keys';
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
