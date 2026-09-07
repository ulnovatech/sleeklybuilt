<?php
ob_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/leads/inquiry_submit.php';

$result = uln_inquiry_submit('webdesigninq', 'your message has been sent.');
http_response_code((int) ($result['http'] ?? 500));
$payload = [
    'status' => $result['status'],
    'message' => $result['message'],
];
if (!empty($result['reference'])) {
    $payload['reference'] = $result['reference'];
}
echo json_encode($payload);
ob_end_flush();
exit;
