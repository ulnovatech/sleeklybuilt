<?php

declare(strict_types=1);

/**
 * Local smoke for 1B — run: php php/attendant/scripts/smoke_1b.php
 */

require_once dirname(__DIR__) . '/bootstrap.php';

$store = new Attendant\ConversationStore(attendant_pdo());
$created = $store->createSession();
echo "session_ok conversation_id={$created['conversation_id']}\n";

$composer = new Attendant\PromptComposer();
$activator = new Attendant\SkillActivator();
$page = ['page_id' => 'home', 'current_url' => 'http://localhost/'];
$skills = $activator->activate('What do you build?', $page);
$blocks = (new Attendant\ContextEngine())->build($page, null, null);
$composed = $composer->compose($skills, [], $blocks);
echo 'skills=' . implode(',', $composed['skill_ids']) . "\n";
echo 'prompt_hash=' . $composed['prompt_hash'] . "\n";
echo 'system_bytes=' . strlen($composed['system']) . "\n";

$llm = new Attendant\GeminiProvider();
echo 'gemini_configured=' . ($llm->isConfigured() ? 'yes' : 'no') . "\n";

// Simulate TurnEngine missing-key path
$telemetry = new Attendant\Telemetry(attendant_pdo());
$gate = new Attendant\ConfirmationGate(attendant_pdo());
$engine = new Attendant\TurnEngine(
    $store,
    $gate,
    new Attendant\SchemaValidator(),
    new Attendant\ContextEngine(),
    $activator,
    $composer,
    $llm,
    $telemetry,
    new Attendant\ToolRouter($gate, attendant_pdo())
);

$events = [];
$session = $store->resolveSession($created['session_token']);
if ($session === null) {
    fwrite(STDERR, "resolveSession failed\n");
    exit(1);
}

$engine->runChat(
    $session['session_id'],
    $session['conversation_id'],
    'Hello — what is SleeklyBuilt?',
    $page,
    null,
    static function (string $event, array $payload) use (&$events): void {
        $events[] = ['event' => $event, 'payload' => $payload];
        $preview = json_encode($payload, JSON_UNESCAPED_UNICODE);
        if ($preview !== false && strlen($preview) > 160) {
            $preview = substr($preview, 0, 160) . '…';
        }
        echo "sse {$event} {$preview}\n";
    }
);

$names = array_column($events, 'event');
if (!in_array('done', $names, true)) {
    fwrite(STDERR, "FAIL: missing done event\n");
    exit(1);
}

if (!$llm->isConfigured()) {
    if (!in_array('error', $names, true)) {
        fwrite(STDERR, "FAIL: expected honest error without GEMINI_API_KEY\n");
        exit(1);
    }
    $err = null;
    foreach ($events as $e) {
        if ($e['event'] === 'error') {
            $err = $e['payload'];
            break;
        }
    }
    if (($err['code'] ?? '') !== 'missing_api_key') {
        fwrite(STDERR, 'FAIL: expected missing_api_key, got ' . json_encode($err) . "\n");
        exit(1);
    }
    echo "PASS: honest failure without GEMINI_API_KEY\n";
} else {
    if (!in_array('message_delta', $names, true) && !in_array('error', $names, true)) {
        fwrite(STDERR, "FAIL: expected message_delta or error with key set\n");
        exit(1);
    }
    echo in_array('message_delta', $names, true)
        ? "PASS: streamed reply with GEMINI_API_KEY\n"
        : "PASS: Gemini configured but API returned error (honest)\n";
}

exit(0);
