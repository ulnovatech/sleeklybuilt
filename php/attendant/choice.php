<?php

declare(strict_types=1);

/**
 * POST /php/attendant/choice.php
 * Consumes a Decision UI selection, updates customer model, resumes the turn (SSE).
 *
 * Body: { session_token, choice_token, option_ids: string[], page?, cancel?: bool, resume?: bool }
 * cancel=true dismisses chips (JSON). resume=false returns JSON without LLM.
 * Default: SSE resume via TurnEngine (same events as chat.php).
 */

require_once __DIR__ . '/bootstrap.php';

attendant_handle_options();
attendant_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    attendant_json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

uln_rate_limit('attendant_choice', ATTENDANT_CHOICE_RATE_MAX, ATTENDANT_CHAT_RATE_WINDOW);

$body = attendant_json_body();
$token = (string) ($body['session_token'] ?? $_SERVER['HTTP_X_ATTENDANT_SESSION'] ?? '');
$choiceToken = (string) ($body['choice_token'] ?? $body['token'] ?? '');
$cancel = !empty($body['cancel']);
$optionIds = $body['option_ids'] ?? $body['option_id'] ?? [];
if (is_string($optionIds)) {
    $optionIds = [$optionIds];
}
if (!is_array($optionIds)) {
    $optionIds = [];
}
$optionIds = array_values(array_filter(array_map(
    static function ($id): string {
        $clean = preg_replace('/[^a-z0-9_\-]/i', '', (string) $id);
        return strtolower((string) $clean);
    },
    $optionIds
), static fn (string $id): bool => $id !== ''));

$page = is_array($body['page'] ?? null) ? $body['page'] : [];

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
$choiceGate = new Attendant\ChoiceGate($pdo);
$telemetry = new Attendant\Telemetry($pdo);
$updater = new Attendant\CustomerModelUpdater();

if ($cancel) {
    $choiceGate->cancel($session['conversation_id'], $choiceToken);
    $telemetry->emit('choice_cancelled', [
        'conversation_id' => $session['conversation_id'],
        'session_id' => $session['session_id'],
    ]);
    attendant_json_out(['ok' => true, 'cancelled' => true]);
}

$pending = $choiceGate->consume($session['conversation_id'], $choiceToken);
if ($pending === null) {
    $telemetry->emit('choice_rejected', [
        'conversation_id' => $session['conversation_id'],
        'session_id' => $session['session_id'],
        'error_code' => 'invalid_token',
    ]);
    attendant_json_out([
        'ok' => false,
        'code' => 'validation_error',
        'error' => 'Those choices expired. Ask again in the chat.',
    ], 400);
}

$payload = $pending['payload'];
$options = is_array($payload['options'] ?? null) ? $payload['options'] : [];
$byId = [];
foreach ($options as $opt) {
    if (is_array($opt) && isset($opt['id'])) {
        $byId[(string) $opt['id']] = $opt;
    }
}

$multi = !empty($payload['multi']);
if ($optionIds === []) {
    attendant_json_out([
        'ok' => false,
        'code' => 'validation_error',
        'error' => 'Pick at least one option.',
    ], 400);
}
if (!$multi && count($optionIds) > 1) {
    $optionIds = [array_values($optionIds)[0]];
}

$selected = [];
foreach ($optionIds as $oid) {
    if (!isset($byId[$oid])) {
        attendant_json_out([
            'ok' => false,
            'code' => 'validation_error',
            'error' => 'That choice is not available.',
        ], 400);
    }
    $selected[] = $byId[$oid];
}

$draft = $updater->fromChoiceSelection($session['draft'] ?? null, $selected);
$store->saveDraft($session['conversation_id'], $draft);

$labels = array_map(
    static fn (array $o): string => (string) ($o['label'] ?? $o['id'] ?? ''),
    $selected
);
$resumeMessage = 'I chose: ' . implode('; ', array_filter($labels));

$telemetry->emit('choice_selected', [
    'conversation_id' => $session['conversation_id'],
    'session_id' => $session['session_id'],
    'page_id' => $page['page_id'] ?? null,
    'meta' => [
        'option_ids' => $optionIds,
        'choice_id' => $payload['choice_id'] ?? null,
    ],
]);

$wantSse = !isset($body['resume']) || $body['resume'] !== false;
if (!$wantSse) {
    attendant_json_out([
        'ok' => true,
        'selected' => $optionIds,
        'draft' => Attendant\CustomerModel::forPrompt($draft),
        'resume_message' => $resumeMessage,
    ]);
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

$pageInput = $page !== [] ? $page : [
    'current_url' => 'https://sleeklybuilt.pro/',
    'page_id' => 'home',
];

try {
    $engine = new Attendant\TurnEngine(
        $store,
        $gate,
        new Attendant\SchemaValidator(),
        new Attendant\ContextEngine(),
        new Attendant\SkillActivator(),
        new Attendant\PromptComposer(),
        new Attendant\GeminiProvider(),
        $telemetry,
        new Attendant\ToolRouter($gate, $pdo),
        new Attendant\KnowledgeCorpus(),
        new Attendant\CustomerModelUpdater(),
        new Attendant\CompanyDocumentStore(),
        $choiceGate
    );

    $engine->runChat(
        $session['session_id'],
        $session['conversation_id'],
        $resumeMessage,
        $pageInput,
        $draft,
        $emit
    );
} catch (Throwable $e) {
    error_log('attendant choice resume fatal: ' . $e->getMessage());
    $emit('error', [
        'code' => 'backend_error',
        'message' => "I can't reply just now.",
    ]);
    $emit('done', [
        'conversation_id' => $session['conversation_id'] ?? null,
    ]);
}

exit;
