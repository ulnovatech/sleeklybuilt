<?php

declare(strict_types=1);

/**
 * 1C smoke — knowledge + tools without requiring Gemini.
 * Usage: php php/attendant/scripts/smoke_1c.php
 */

require_once dirname(__DIR__) . '/bootstrap.php';

$pdo = attendant_pdo();
$gate = new Attendant\ConfirmationGate($pdo);
$router = new Attendant\ToolRouter($gate, $pdo);
$pages = new Attendant\PageRegistry();
$corpus = new Attendant\KnowledgeCorpus();
$products = new Attendant\ProductCatalogue();

$failures = 0;
$assert = static function (bool $cond, string $label) use (&$failures): void {
    if ($cond) {
        echo "OK  {$label}\n";
    } else {
        echo "FAIL {$label}\n";
        $failures++;
    }
};

$assert(count($router->registeredTools()) === 11, '11 tools registered');
$assert($pages->hasPage('home') && $pages->hasPage('prices'), 'page registry has home+prices');

$nav = $pages->resolveNavigate('prices', 'price-deposit');
$assert($nav !== null && ($nav['path'] ?? '') === '/prices' && ($nav['hash'] ?? '') === 'price-deposit', 'navigate prices#price-deposit');

$bad = $pages->resolveNavigate('prices', 'not-a-section');
$assert($bad === null, 'unknown section rejected');

$momo = $corpus->search('Mobile Money', 4);
$assert($momo !== [] && str_contains(mb_strtolower($momo[0]['text'] ?? ''), 'mobile money'), 'corpus Mobile Money hit');

$store = new Attendant\ConversationStore($pdo);
$session = $store->createSession();
$cid = $session['conversation_id'];
$page = ['page_id' => 'home', 'current_url' => 'http://localhost/'];

$navResult = $router->execute('navigate_to', ['page_id' => 'contact'], $cid, $page, false);
$assert(($navResult['ok'] ?? false) === true && ($navResult['data']['path'] ?? '') === '/contact', 'navigate_to contact');
$assert(($navResult['side_effects'] ?? '') === 'client_navigation', 'navigate side_effects');

$invented = $router->execute('navigate_to', ['page_id' => 'https://evil.example'], $cid, $page, false);
$assert(($invented['ok'] ?? true) === false, 'invented URL page_id rejected');

$smart = $products->getProduct('smart', 'orderable_package');
$assert(($smart['ok'] ?? false) && ($smart['product']['orderable'] ?? false), 'smart orderable from uln_packages');

$starter = $products->getProduct('starter', 'display_package');
$assert(($starter['ok'] ?? false) && ($starter['product']['orderable'] ?? true) === false, 'starter is display only');

$compareBad = $router->execute(
    'compare_products',
    ['ids' => ['smart', 'business-basic']],
    $cid,
    $page,
    false
);
$assert(($compareBad['ok'] ?? true) === false, 'mixed kind compare fails closed');

$lead = $router->execute('capture_lead', [
    'name' => 'Smoke Test',
    'phone' => '+256700000000',
    'email' => 'smoke@example.com',
    'subject' => 'Attendant smoke',
    'message' => 'Please ignore — automated smoke',
], $cid, $page, false);
$assert(($lead['ok'] ?? true) === false && ($lead['code'] ?? '') === 'confirmation_required', 'capture_lead requires confirmation');
$token = $lead['data']['token'] ?? '';
$assert(is_string($token) && $token !== '', 'confirmation token issued');

// Bypass attempt: execute write without confirmed flag again — must not insert
$bypass = $router->execute('capture_lead', [
    'name' => 'Bypass',
    'phone' => '+256700000001',
    'email' => 'bypass@example.com',
    'subject' => 'Should not insert',
    'message' => 'bypass',
], $cid, $page, false);
$assert(($bypass['code'] ?? '') === 'confirmation_required', 'write cannot bypass confirmation');

$orderReject = $router->execute('start_order', [
    'template' => 'attendant-inquiry',
    'fullName' => 'Smoke',
    'phone' => '700000000',
    'package' => 'starter',
], $cid, $page, false);
$assert(($orderReject['ok'] ?? true) === false, 'display package id rejected for start_order');

$handoff = $router->execute('handoff', ['reason' => 'smoke'], $cid, $page, false);
$assert(($handoff['ok'] ?? false) === true && !empty($handoff['data']['email']), 'handoff returns channels');

$unknown = $router->execute('do_anything', [], $cid, $page, false);
$assert(($unknown['ok'] ?? true) === false && ($unknown['code'] ?? '') === 'unsupported', 'unknown tool fail closed');

if ($failures > 0) {
    fwrite(STDERR, "FAILED {$failures} assertion(s)\n");
    exit(1);
}

echo "PASS: 1C knowledge + tools smoke\n";
exit(0);
