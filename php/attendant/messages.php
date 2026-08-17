<?php

declare(strict_types=1);

/**
 * GET /php/attendant/messages.php
 * Poll new messages for the visitor widget (human / system while escalated).
 */

require_once __DIR__ . '/bootstrap.php';

attendant_handle_options();
attendant_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET' && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    attendant_json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

uln_rate_limit('attendant_messages', 120, ATTENDANT_CHAT_RATE_WINDOW);

$token = (string) ($_GET['session_token'] ?? $_SERVER['HTTP_X_ATTENDANT_SESSION'] ?? '');
$afterId = (int) ($_GET['after_id'] ?? 0);
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $body = attendant_json_body();
    $token = (string) ($body['session_token'] ?? $token);
    $afterId = (int) ($body['after_id'] ?? $afterId);
}

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

$cid = $session['conversation_id'];
$messages = $store->messagesAfter($cid, $afterId, 50);
$esc = $store->getEscalationState($cid);

attendant_json_out([
    'ok' => true,
    'conversation_id' => $cid,
    'escalation_state' => $esc,
    'human_controlled' => Attendant\EscalationState::isHumanControlled($esc),
    'messages' => $messages,
]);
