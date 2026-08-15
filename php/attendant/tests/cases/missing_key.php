<?php

declare(strict_types=1);

use Attendant\ConversationStore;
use Attendant\ConfirmationGate;
use Attendant\ContextEngine;
use Attendant\GeminiProvider;
use Attendant\PromptComposer;
use Attendant\SchemaValidator;
use Attendant\SkillActivator;
use Attendant\Telemetry;
use Attendant\ToolRouter;
use Attendant\TurnEngine;

fwrite(STDOUT, "\n[missing Gemini key]\n");

$prev = getenv('GEMINI_API_KEY');
putenv('GEMINI_API_KEY=');
$_ENV['GEMINI_API_KEY'] = '';

try {
    $pdo = attendant_pdo();
    $store = new ConversationStore($pdo);
    $created = $store->createSession();
    $session = $store->resolveSession($created['session_token']);
    AttendantTest::assertTrue($session !== null, 'session for missing-key turn');

    $gate = new ConfirmationGate($pdo);
    $llm = new GeminiProvider('');
    AttendantTest::assertTrue(!$llm->isConfigured(), 'GeminiProvider reports not configured');

    $events = [];
    $engine = new TurnEngine(
        $store,
        $gate,
        new SchemaValidator(),
        new ContextEngine(),
        new SkillActivator(),
        new PromptComposer(),
        $llm,
        new Telemetry($pdo),
        new ToolRouter($gate, $pdo)
    );

    $engine->runChat(
        $session['session_id'],
        $session['conversation_id'],
        'Hello',
        ['page_id' => 'home', 'current_url' => 'http://localhost/'],
        null,
        static function (string $event, array $payload) use (&$events): void {
            $events[] = ['event' => $event, 'payload' => $payload];
        }
    );

    $names = array_column($events, 'event');
    AttendantTest::assertTrue(in_array('error', $names, true), 'missing key emits error SSE');
    AttendantTest::assertTrue(in_array('done', $names, true), 'missing key still emits done');
    $err = null;
    foreach ($events as $e) {
        if ($e['event'] === 'error') {
            $err = $e['payload'];
            break;
        }
    }
    AttendantTest::assertSame('missing_api_key', $err['code'] ?? null, 'error code missing_api_key');
    AttendantTest::assertContains("can't reply", mb_strtolower($err['message'] ?? ''), 'honest missing-key message');
    AttendantTest::assertTrue(!in_array('message_delta', $names, true), 'no canned success deltas without key');
} catch (Throwable $e) {
    AttendantTest::skip('missing_key needs DB: ' . $e->getMessage());
} finally {
    if ($prev === false) {
        putenv('GEMINI_API_KEY');
        unset($_ENV['GEMINI_API_KEY']);
    } else {
        putenv('GEMINI_API_KEY=' . $prev);
        $_ENV['GEMINI_API_KEY'] = $prev;
    }
}
