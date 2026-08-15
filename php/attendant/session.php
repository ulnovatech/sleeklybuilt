<?php

declare(strict_types=1);

/**
 * POST /php/attendant/session.php
 * Creates a visitor session + conversation.
 */

require_once __DIR__ . '/bootstrap.php';

attendant_handle_options();
attendant_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    attendant_json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

try {
    uln_rate_limit('attendant_session', ATTENDANT_SESSION_RATE_MAX, ATTENDANT_CHAT_RATE_WINDOW);
} catch (Throwable $e) {
    // rate_limit exits on 429
}

try {
    $store = new Attendant\ConversationStore(attendant_pdo());
    $telemetry = new Attendant\Telemetry(attendant_pdo());
    $created = $store->createSession();
    $telemetry->emit('session_created', [
        'conversation_id' => $created['conversation_id'],
        'meta' => ['expires_at' => $created['expires_at']],
    ]);
    attendant_json_out([
        'ok' => true,
        'session_token' => $created['session_token'],
        'conversation_id' => $created['conversation_id'],
        'expires_at' => $created['expires_at'],
        'model' => ATTENDANT_MODEL,
    ]);
} catch (Throwable $e) {
    attendant_json_out([
        'ok' => false,
        'error' => 'Could not create session.',
        'code' => 'backend_error',
    ], 500);
}
