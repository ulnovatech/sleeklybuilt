<?php

declare(strict_types=1);

use Attendant\ConfirmationGate;
use Attendant\ConversationStore;
use Attendant\ToolRouter;

fwrite(STDOUT, "\n[integration DB — confirmation cannot INSERT]\n");

$pdo = attendant_pdo();
$store = new ConversationStore($pdo);
$gate = new ConfirmationGate($pdo);
$router = new ToolRouter($gate, $pdo);
$created = $store->createSession();
$cid = $created['conversation_id'];
$page = ['page_id' => 'contact', 'current_url' => 'http://localhost/contact'];

$before = (int) $pdo->query('SELECT COUNT(*) FROM contactus')->fetchColumn();

$lead = $router->execute('capture_lead', [
    'name' => 'NoInsert',
    'phone' => '+256700000099',
    'email' => 'noinsert@example.com',
    'subject' => 'Must not insert',
    'message' => 'Layer A confirmation test',
], $cid, $page, false);

AttendantTest::assertSame('confirmation_required', $lead['code'] ?? null, 'integration: confirmation_required');
$token = $lead['data']['token'] ?? '';
AttendantTest::assertTrue(is_string($token) && $token !== '', 'integration: pending token issued');

$after = (int) $pdo->query('SELECT COUNT(*) FROM contactus')->fetchColumn();
AttendantTest::assertSame($before, $after, 'integration: no contactus INSERT without confirm');

$ordersBefore = (int) $pdo->query('SELECT COUNT(*) FROM website_orders')->fetchColumn();
$order = $router->execute('start_order', [
    'template' => 'attendant-inquiry',
    'fullName' => 'NoInsert',
    'phone' => '700000099',
    'package' => 'smart',
], $cid, $page, false);
AttendantTest::assertSame('confirmation_required', $order['code'] ?? null, 'integration: start_order confirmation_required');
$ordersAfter = (int) $pdo->query('SELECT COUNT(*) FROM website_orders')->fetchColumn();
AttendantTest::assertSame($ordersBefore, $ordersAfter, 'integration: no website_orders INSERT without confirm');

// Telemetry scrub on persisted meta (ToolRouter does not emit; engine does — simulate emit)
$handoff = $router->execute('handoff', ['reason' => 'layer-a'], $cid, $page, false);
AttendantTest::assertTrue(($handoff['ok'] ?? false) === true, 'handoff tool succeeds');
$telemetry = new Attendant\Telemetry($pdo);
$telemetry->emit('tool_call', [
    'conversation_id' => $cid,
    'tool_name' => 'handoff',
    'tool_ok' => true,
    'meta' => [
        'GEMINI_API_KEY' => 'should-never-persist',
        'session_token' => 'raw-token',
        'handoff' => true,
    ],
]);
$stmt = $pdo->prepare(
    "SELECT meta_json, tool_name FROM attendant_events
     WHERE conversation_id = ? AND tool_name = 'handoff'
     ORDER BY id DESC LIMIT 1"
);
$stmt->execute([$cid]);
$row = $stmt->fetch();
AttendantTest::assertTrue(is_array($row), 'telemetry row for tool call');
$meta = json_decode((string) ($row['meta_json'] ?? 'null'), true);
AttendantTest::assertTrue(is_array($meta), 'telemetry meta is object');
AttendantTest::assertTrue(!isset($meta['GEMINI_API_KEY']), 'telemetry meta has no API key');
AttendantTest::assertTrue(!isset($meta['session_token']), 'telemetry meta has no session token');
AttendantTest::assertTrue(($meta['handoff'] ?? false) === true, 'telemetry keeps handoff flag');
