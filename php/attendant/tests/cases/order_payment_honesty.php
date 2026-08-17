<?php

declare(strict_types=1);

/**
 * Chunk 3F — order / payment honesty (no pay-in-chat, handoff only).
 */

use Attendant\CommercialStateMachine;
use Attendant\CustomerModel;
use Attendant\CustomerModelUpdater;
use Attendant\PageRegistry;
use Attendant\ProductCatalogue;
use Attendant\ToolResults;
use Attendant\Tools\StartOrderTool;

fwrite(STDOUT, "\n[order + payment honesty]\n");

$registry = new PageRegistry();
$orderPage = $registry->getPage('portfolio-order');
AttendantTest::assertTrue($orderPage !== null, 'portfolio-order page registered');
AttendantTest::assertSame('/portfolio-app/order', $orderPage['path'] ?? null, 'portfolio-order path');
AttendantTest::assertTrue(($orderPage['external'] ?? false) === true, 'portfolio-order external');

$handoff = $registry->resolvePaymentHandoff('willey-fragrance', 'smart');
AttendantTest::assertTrue($handoff !== null, 'payment handoff resolves');
AttendantTest::assertTrue(str_contains((string) ($handoff['path'] ?? ''), '/portfolio-app/order'), 'handoff path is portfolio order');
AttendantTest::assertTrue(str_contains((string) ($handoff['path'] ?? ''), 'template=willey-fragrance'), 'handoff includes template');
AttendantTest::assertTrue(str_contains((string) ($handoff['path'] ?? ''), 'package=smart'), 'handoff includes package');
AttendantTest::assertTrue(($handoff['external'] ?? false) === true, 'handoff external');
AttendantTest::assertTrue(($handoff['payment_handoff'] ?? false) === true, 'handoff flag');
AttendantTest::assertTrue(!str_contains(strtolower((string) ($handoff['path'] ?? '')), 'flutterwave'), 'handoff is not flutterwave host');
AttendantTest::assertTrue(!str_contains((string) ($handoff['path'] ?? ''), 'payment-init'), 'handoff is not payment-init');

$evilTpl = $registry->resolvePaymentHandoff('https://evil.test/x', 'smart');
AttendantTest::assertTrue($evilTpl !== null, 'invalid template still resolves base path');
AttendantTest::assertTrue(!str_contains((string) ($evilTpl['path'] ?? ''), 'evil'), 'evil template stripped from query');

$updater = new CustomerModelUpdater();
$seed = CustomerModel::merge(null, [
    'commercial_state' => CommercialStateMachine::RECOMMENDATION,
    'package' => 'smart',
]);

$quoteOk = ToolResults::ok('start_order', [
    'order_id' => 42,
    'package' => 'smart',
    'template' => 'attendant-inquiry',
    'success' => true,
    'paid' => false,
    'payment_handoff' => $handoff,
], 'writes_quote');
$afterQuote = $updater->fromToolResult($seed, 'start_order', $quoteOk);
AttendantTest::assertSame(CommercialStateMachine::PAYMENT, $afterQuote['commercial_state'] ?? null, 'quote+handoff → payment state');
AttendantTest::assertTrue(in_array('payment_handoff', $afterQuote['known_facts'] ?? [], true), 'payment_handoff fact');
AttendantTest::assertTrue(!in_array('payment_confirmed', $afterQuote['known_facts'] ?? [], true), 'quote does not invent payment_confirmed');

$quoteNoHandoff = ToolResults::ok('start_order', [
    'order_id' => 43,
    'package' => 'basic',
    'paid' => false,
], 'writes_quote');
$afterOrderOnly = $updater->fromToolResult($seed, 'start_order', $quoteNoHandoff);
AttendantTest::assertSame(CommercialStateMachine::ORDER, $afterOrderOnly['commercial_state'] ?? null, 'quote without handoff stays order');

$pendingStatus = ToolResults::ok('get_order_status', [
    'reference' => 'ULN-TEST',
    'status' => 'pending',
    'package' => 'smart',
]);
$afterPending = $updater->fromToolResult($afterQuote, 'get_order_status', $pendingStatus);
AttendantTest::assertSame(CommercialStateMachine::PAYMENT, $afterPending['commercial_state'] ?? null, 'pending status stays payment');
AttendantTest::assertTrue(!in_array('payment_confirmed', $afterPending['known_facts'] ?? [], true), 'pending is not payment_confirmed');

$paidStatus = ToolResults::ok('get_order_status', [
    'reference' => 'ULN-TEST',
    'status' => 'successful',
    'package' => 'smart',
]);
$afterPaid = $updater->fromToolResult($afterPending, 'get_order_status', $paidStatus);
AttendantTest::assertSame(CommercialStateMachine::COMPLETE, $afterPaid['commercial_state'] ?? null, 'successful status → complete');
AttendantTest::assertTrue(in_array('payment_confirmed', $afterPaid['known_facts'] ?? [], true), 'payment_confirmed only from backend');

$failLookup = ToolResults::fail('get_order_status', 'not_found', 'No order found');
$afterFail = $updater->fromToolResult($afterPaid, 'get_order_status', $failLookup);
AttendantTest::assertSame(CommercialStateMachine::COMPLETE, $afterFail['commercial_state'] ?? null, 'failed lookup does not clear complete');
AttendantTest::assertTrue(in_array('status_lookup_failed', $afterFail['known_facts'] ?? [], true), 'status_lookup_failed fact');

// Simulate inventing paid without tool — state machine must not jump discovery → complete without edges
$noJump = CommercialStateMachine::transition(CommercialStateMachine::DISCOVERY, CommercialStateMachine::COMPLETE);
AttendantTest::assertSame(CommercialStateMachine::DISCOVERY, $noJump, 'cannot invent complete from discovery');

$catalogue = new ProductCatalogue();
$tool = new StartOrderTool($catalogue, $registry);
AttendantTest::assertTrue(!in_array('starter', $catalogue->orderableIds(), true), 'starter not orderable');

// Tool declaration must not claim payment
$decl = $tool->declaration();
AttendantTest::assertTrue(str_contains(strtolower((string) ($decl['description'] ?? '')), 'not payment'), 'start_order declares not payment');
