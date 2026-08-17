<?php

declare(strict_types=1);

use Attendant\ConfirmationGate;
use Attendant\ConversationStore;
use Attendant\ToolRouter;
use Attendant\ToolResults;

fwrite(STDOUT, "\n[tools + confirmation]\n");

try {
    $pdo = attendant_pdo();
    $pdo->query('SELECT 1 FROM attendant_sessions LIMIT 1');
} catch (Throwable $e) {
    AttendantTest::skip('tools_and_confirmation needs DB: ' . $e->getMessage());
    return;
}

$gate = new ConfirmationGate($pdo);
AttendantTest::assertTrue($gate->requiresConfirmation('capture_lead'), 'capture_lead requires confirm');
AttendantTest::assertTrue($gate->requiresConfirmation('start_order'), 'start_order requires confirm');
AttendantTest::assertTrue(!$gate->requiresConfirmation('navigate_to'), 'navigate needs no confirm');

$router = new ToolRouter($gate, $pdo);
$registered = $router->registeredTools();
AttendantTest::assertSame(14, count($registered), 'exactly 14 tools registered');
AttendantTest::assertTrue(in_array('get_company_document', $registered, true), 'get_company_document registered');
AttendantTest::assertTrue(in_array('update_customer_model', $registered, true), 'update_customer_model registered');
AttendantTest::assertTrue(in_array('present_choices', $registered, true), 'present_choices registered');

$decls = $router->declarations(['navigate_to', 'capture_lead', 'do_evil']);
AttendantTest::assertSame(2, count($decls), 'declarations intersect allow-list only');

$page = ['page_id' => 'home', 'current_url' => 'http://localhost/'];
$store = new ConversationStore($pdo);
$created = $store->createSession();
$cid = $created['conversation_id'];

$nav = $router->execute('navigate_to', ['page_id' => 'prices'], $cid, $page, false);
AttendantTest::assertTrue(($nav['ok'] ?? false) === true, 'navigate_to prices ok');
AttendantTest::assertSame('/prices', $nav['data']['path'] ?? null, 'navigate path from registry');
AttendantTest::assertSame('client_navigation', $nav['side_effects'] ?? null, 'navigate side_effects');

$evil = $router->execute('navigate_to', ['page_id' => 'https://evil.test'], $cid, $page, false);
AttendantTest::assertTrue(($evil['ok'] ?? true) === false, 'invented URL page_id rejected');

$lead = $router->execute('capture_lead', [
    'name' => 'LayerA',
    'phone' => '+256700000010',
    'email' => 'layera@example.com',
    'subject' => 'Test',
    'message' => 'Do not send',
], $cid, $page, false);
AttendantTest::assertSame('confirmation_required', $lead['code'] ?? null, 'capture_lead without confirm');
AttendantTest::assertTrue(($lead['ok'] ?? true) === false, 'capture_lead ok false until confirm');

$badPkg = $router->execute('start_order', [
    'template' => 'attendant-inquiry',
    'fullName' => 'A',
    'phone' => '700000011',
    'package' => 'starter',
], $cid, $page, false);
AttendantTest::assertTrue(($badPkg['ok'] ?? true) === false, 'display id starter rejected for start_order');

$compare = $router->execute('compare_products', [
    'ids' => ['smart', 'business-basic'],
], $cid, $page, false);
AttendantTest::assertTrue(($compare['ok'] ?? true) === false, 'mixed kind compare fails');

$unknown = $router->execute('payment_init', [], $cid, $page, false);
AttendantTest::assertSame('unsupported', $unknown['code'] ?? null, 'unknown/payment tool unsupported');

$fail = ToolResults::fail('start_order', 'backend_error', 'I couldn\'t complete that just now.');
AttendantTest::assertTrue(($fail['ok'] ?? true) === false, 'failure mapping stays ok:false');
AttendantTest::assertTrue(($fail['side_effects'] ?? '') === 'none', 'failed write has no side_effects write');
