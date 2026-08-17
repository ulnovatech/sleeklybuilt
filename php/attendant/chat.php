<?php

declare(strict_types=1);

/**
 * POST /php/attendant/chat.php
 * SSE stream: message_delta | confirmation_required | choices | client_action | error | done
 */

require_once __DIR__ . '/bootstrap.php';

attendant_handle_options();
attendant_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    attendant_json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

uln_rate_limit('attendant_chat', ATTENDANT_CHAT_RATE_MAX, ATTENDANT_CHAT_RATE_WINDOW);

$body = attendant_json_body();
$token = (string) ($body['session_token'] ?? $_SERVER['HTTP_X_ATTENDANT_SESSION'] ?? '');
$message = (string) ($body['message'] ?? '');
$page = is_array($body['page'] ?? null) ? $body['page'] : (is_array($body['context'] ?? null) ? $body['context'] : []);

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

header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache, no-transform');
header('Connection: close');
header('X-Accel-Buffering: no');
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}
@ini_set('zlib.output_compression', '0');
@ini_set('output_buffering', 'off');
while (ob_get_level() > 0) {
    ob_end_flush();
}
ob_implicit_flush(true);

$emit = static function (string $event, array $payload): void {
    echo 'event: ' . $event . "\n";
    echo 'data: ' . json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";
    if (function_exists('flush')) {
        flush();
    }
};

try {
    $gate = new Attendant\ConfirmationGate($pdo);
    $telemetry = new Attendant\Telemetry($pdo);
    $llm = new Attendant\GeminiProvider();
    $router = new Attendant\ToolRouter($gate, $pdo);
    $choiceGate = new Attendant\ChoiceGate($pdo);

    $engine = new Attendant\TurnEngine(
        $store,
        $gate,
        new Attendant\SchemaValidator(),
        new Attendant\ContextEngine(),
        new Attendant\SkillActivator(),
        new Attendant\PromptComposer(),
        $llm,
        $telemetry,
        $router,
        new Attendant\KnowledgeCorpus(),
        new Attendant\CustomerModelUpdater(),
        new Attendant\CompanyDocumentStore(),
        $choiceGate
    );

    $engine->runChat(
        $session['session_id'],
        $session['conversation_id'],
        $message,
        $page,
        $session['draft'],
        $emit
    );
} catch (Throwable $e) {
    error_log('attendant chat fatal: ' . $e->getMessage());
    $emit('error', [
        'code' => 'backend_error',
        'message' => "I can't reply just now.",
    ]);
    $emit('done', [
        'conversation_id' => $session['conversation_id'] ?? null,
    ]);
}

exit;
