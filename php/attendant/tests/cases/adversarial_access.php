<?php

declare(strict_types=1);

/**
 * Chunk 3H — prompt injection / document access honesty.
 */

use Attendant\CompanyDocumentStore;
use Attendant\ConfirmationGate;
use Attendant\ToolContext;
use Attendant\ToolRouter;
use Attendant\Tools\GetCompanyDocumentTool;

fwrite(STDOUT, "\n[adversarial access / doc leak]\n");

$store = new CompanyDocumentStore();
$tool = new GetCompanyDocumentTool($store);
$ctx = new ToolContext('test-conv', ['page_id' => 'home'], false, null, null, null);

$leak = $tool->execute(['id' => '18_attendant_authority_matrix'], $ctx);
AttendantTest::assertTrue(($leak['ok'] ?? true) === false, 'A9 authority matrix tool fails');
AttendantTest::assertSame('unauthorized', $leak['code'] ?? null, 'A9 unauthorized code');
$leakBody = json_encode($leak);
AttendantTest::assertTrue(
    $leakBody === false || !str_contains(mb_strtolower($leakBody), 'never publish'),
    'A9 INTERNAL body not in tool result'
);

$truth = $tool->execute(['id' => '20_attendant_company_truth'], $ctx);
AttendantTest::assertTrue(($truth['ok'] ?? true) === false, 'A9 SYSTEM truth tool fails');

$privacy = $tool->execute(['slug' => 'privacy'], $ctx);
AttendantTest::assertTrue(($privacy['ok'] ?? false) === true, 'PUBLIC privacy still loads');

$refund = $tool->execute(['slug' => 'refund'], $ctx);
AttendantTest::assertTrue(($refund['ok'] ?? false) === true, 'PUBLIC refund loads for policy retrieve');

// Router path: unknown payment tool still unsupported
try {
    $pdo = attendant_pdo();
    $pdo->query('SELECT 1 FROM attendant_sessions LIMIT 1');
    $router = new ToolRouter(new ConfirmationGate($pdo), $pdo);
    $evil = $router->execute('payment_init', [], 'x', ['page_id' => 'home'], false);
    AttendantTest::assertSame('unsupported', $evil['code'] ?? null, 'payment_init unsupported via router');
} catch (Throwable $e) {
    AttendantTest::skip('adversarial router needs DB: ' . $e->getMessage());
}

$turn = (string) file_get_contents(dirname(__DIR__, 2) . '/src/TurnEngine.php');
AttendantTest::assertTrue(str_contains($turn, "emit('escalation'"), 'TurnEngine emits escalation event');
AttendantTest::assertTrue(str_contains($turn, "emit('payment_handoff'"), 'TurnEngine emits payment_handoff event');
AttendantTest::assertTrue(str_contains($turn, "emit('retrieval_access_denied'"), 'TurnEngine emits retrieval_access_denied');

$ops = (string) file_get_contents(
    dirname(__DIR__, 4) . '/sleekly-dash/backend/controllers/AttendantOperatorController.php'
);
AttendantTest::assertTrue(str_contains($ops, "emit('operator_takeover'"), 'operator_takeover telemetry');

$choice = (string) file_get_contents(dirname(__DIR__, 2) . '/choice.php');
AttendantTest::assertTrue(str_contains($choice, "emit('choice_selected'"), 'choice_selected telemetry');
