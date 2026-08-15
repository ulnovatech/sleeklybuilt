<?php

declare(strict_types=1);

/**
 * POST /php/attendant/confirm.php
 * Consumes a confirmation token and executes the write tool for real.
 */

require_once __DIR__ . '/bootstrap.php';

attendant_handle_options();
attendant_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    attendant_json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

uln_rate_limit('attendant_confirm', ATTENDANT_CONFIRM_RATE_MAX, ATTENDANT_CHAT_RATE_WINDOW);

$body = attendant_json_body();
$token = (string) ($body['session_token'] ?? $_SERVER['HTTP_X_ATTENDANT_SESSION'] ?? '');
$confirmToken = (string) ($body['confirmation_token'] ?? $body['token'] ?? '');

$pdo = attendant_pdo();
$store = new Attendant\ConversationStore($pdo);
$session = $store->resolveSession($token);
if ($session === null) {
    attendant_json_out([
        'ok' => false,
        'code' => 'unauthorized',
        'error' => 'Invalid or expired session.',
    ], 401);
}

$gate = new Attendant\ConfirmationGate($pdo);
$telemetry = new Attendant\Telemetry($pdo);
$pending = $gate->consume($session['conversation_id'], $confirmToken);
if ($pending === null) {
    $telemetry->emit('confirm_rejected', [
        'conversation_id' => $session['conversation_id'],
        'session_id' => $session['session_id'],
        'error_code' => 'invalid_token',
    ]);
    attendant_json_out([
        'ok' => false,
        'code' => 'validation_error',
        'error' => 'Confirmation expired or invalid.',
    ], 400);
}

$router = new Attendant\ToolRouter($gate, $pdo);
$result = $router->execute(
    $pending['tool_name'],
    $pending['payload'],
    $session['conversation_id'],
    [],
    true
);

$telemetry->emit('confirm_attempt', [
    'conversation_id' => $session['conversation_id'],
    'session_id' => $session['session_id'],
    'tool_name' => $pending['tool_name'],
    'tool_ok' => (bool) ($result['ok'] ?? false),
    'error_code' => ($result['ok'] ?? false) ? null : (string) ($result['code'] ?? 'backend_error'),
    'meta' => [
        'conversion' => (bool) ($result['ok'] ?? false),
        'handoff' => false,
    ],
]);

$store->addMessage(
    $session['conversation_id'],
    'system',
    'Confirmation for ' . $pending['tool_name'] . ': ' . (($result['ok'] ?? false) ? 'ok' : (string) ($result['code'] ?? 'failed')),
    $pending['tool_name'],
    (bool) ($result['ok'] ?? false)
);

attendant_json_out([
    'ok' => (bool) ($result['ok'] ?? false),
    'tool' => $result['tool'] ?? $pending['tool_name'],
    'code' => $result['code'] ?? null,
    'user_safe_error' => $result['user_safe_error'] ?? null,
    'summary' => $pending['summary'],
    'data' => $result['data'] ?? null,
]);
