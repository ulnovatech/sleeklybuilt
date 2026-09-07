<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/cors.php';
uln_portfolio_cors();

require_once __DIR__ . '/../../php/leads/rate_limit.php';
uln_rate_limit('developer_quote', 12, 3600);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input = uln_json_input();
$name = trim((string) ($input['name'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$service = trim((string) ($input['service'] ?? ''));
$messageBody = trim((string) ($input['message'] ?? ''));
$company = trim((string) ($input['company'] ?? ''));
$budget = trim((string) ($input['budget'] ?? ''));
$timeline = trim((string) ($input['timeline'] ?? ''));

if ($name === '' || $email === '' || $service === '' || $messageBody === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Name, email, service, and message are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format.']);
    exit;
}

$to = getenv('MAIL_FROM') ?: 'sales@sleeklybuilt.pro';
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    $to = 'sales@sleeklybuilt.pro';
}

$subject = 'New developer quote request — ' . $name;
$fromAddr = getenv('MAIL_FROM') ?: 'noreply@sleeklybuilt.pro';
$headers = [
    'From: SleeklyBuilt <' . $fromAddr . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/html; charset=UTF-8',
];

$rows = [
    'Name' => $name,
    'Email' => $email,
    'Service' => $service,
    'Message' => $messageBody,
];
if ($company !== '') {
    $rows['Company'] = $company;
}
if ($budget !== '') {
    $rows['Budget'] = $budget;
}
if ($timeline !== '') {
    $rows['Timeline'] = $timeline;
}

$message = '<html><body><h2>New developer quote request</h2><table style="border-collapse:collapse;width:100%">';
foreach ($rows as $label => $value) {
    $message .= '<tr><td style="padding:8px;border:1px solid #ddd"><strong>'
        . htmlspecialchars($label, ENT_QUOTES, 'UTF-8')
        . ':</strong></td><td style="padding:8px;border:1px solid #ddd">'
        . nl2br(htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'))
        . '</td></tr>';
}
$message .= '</table><p><em>Received: ' . htmlspecialchars(date('c'), ENT_QUOTES, 'UTF-8') . '</em></p></body></html>';

if (!mail($to, $subject, $message, implode("\r\n", $headers))) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not send the request. Email us or use WhatsApp.']);
    exit;
}

echo json_encode([
    'status' => 'success',
    'message' => "{$name}, your quote request was emailed to the team. We will reply to {$email}.",
]);
