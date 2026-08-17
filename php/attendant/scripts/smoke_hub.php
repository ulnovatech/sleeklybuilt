<?php

declare(strict_types=1);

/**
 * Hub / production smoke — Chunk 3H acceptance gate.
 *
 * Offline checks always run (no Gemini, DB optional).
 * With MySQL: session + tool count + escalation columns.
 * With ATTENDANT_SMOKE_BASE (e.g. https://sleeklybuilt.pro or http://localhost):
 *   HTTP probes for session, public policies, messages auth.
 *
 * Usage:
 *   php php/attendant/scripts/smoke_hub.php
 *   ATTENDANT_SMOKE_BASE=http://localhost php php/attendant/scripts/smoke_hub.php
 */

require_once dirname(__DIR__) . '/bootstrap.php';

$failures = 0;
$assert = static function (bool $cond, string $label) use (&$failures): void {
    if ($cond) {
        echo "OK  {$label}\n";
    } else {
        echo "FAIL {$label}\n";
        $failures++;
    }
};

echo "SleeklyBuilt Attendant — hub smoke (3H)\n\n";

// --- Contract on disk ---
$contract = attendant_contract_dir();
$assert(is_dir($contract . DIRECTORY_SEPARATOR . 'company'), 'company corpus directory');
$assert(is_file($contract . DIRECTORY_SEPARATOR . 'company' . DIRECTORY_SEPARATOR . 'manifest.json'), 'company manifest');
$assert(is_dir($contract . DIRECTORY_SEPARATOR . 'expertise'), 'expertise directory');
$assert(
    is_file($contract . DIRECTORY_SEPARATOR . 'QUALITY_RUBRIC.md'),
    'QUALITY_RUBRIC.md in attendant contract'
);

// --- Registry (3E/3F) ---
$pages = new Attendant\PageRegistry();
$assert($pages->hasPage('policies'), 'policies page registered');
$assert($pages->hasPage('portfolio-order'), 'portfolio-order page registered');
$privacy = $pages->resolveNavigate('policies', 'privacy');
$assert(
    is_array($privacy)
    && ($privacy['path'] ?? '') === '/policies/privacy'
    && array_key_exists('hash', $privacy)
    && $privacy['hash'] === null,
    'policies privacy path_segment'
);
$refund = $pages->resolveShowSection('refund', 'policies');
$assert($refund !== null && ($refund['highlight'] ?? false) === true, 'refund show_section highlight');
$handoff = $pages->resolvePaymentHandoff('attendant-inquiry', 'smart');
$assert(
    $handoff !== null
    && str_contains((string) ($handoff['path'] ?? ''), '/portfolio-app/order')
    && !str_contains((string) ($handoff['path'] ?? ''), 'payment-init'),
    'payment handoff path is portfolio order'
);

// --- Company access (3A) ---
$company = new Attendant\CompanyDocumentStore();
$public = $company->listPublicPolicies();
$assert(count($public) >= 8, 'at least 8 PUBLIC policies');
$denied = $company->getById('18_attendant_authority_matrix', Attendant\CompanyDocumentStore::VISITOR_ALLOWED);
$assert(($denied['ok'] ?? true) === false, 'INTERNAL authority denied to visitors');
$privacyDoc = $company->getBySlug('privacy', Attendant\CompanyDocumentStore::VISITOR_ALLOWED);
$assert(($privacyDoc['ok'] ?? false) === true, 'PUBLIC privacy loads');

// --- Escalation state machine (3G) ---
$assert(Attendant\EscalationState::isHumanControlled('escalated'), 'escalated is human-controlled');
$assert(Attendant\EscalationState::canTransition('escalated', 'human_active'), 'escalated→human_active');
$assert(!Attendant\EscalationState::canTransition('autonomous', 'human_active'), 'no skip to human_active');

// --- Tools + catalogue (no Gemini) ---
$products = new Attendant\ProductCatalogue();
$assert(in_array('smart', $products->orderableIds(), true), 'smart orderable');
$assert(!in_array('starter', $products->orderableIds(), true), 'starter not orderable');

$dbOk = false;
try {
    $pdo = attendant_pdo();
    $pdo->query('SELECT 1 FROM attendant_sessions LIMIT 1');
    $dbOk = true;
} catch (Throwable $e) {
    echo "SKIP DB: " . $e->getMessage() . "\n";
}

if ($dbOk) {
    $gate = new Attendant\ConfirmationGate($pdo);
    $router = new Attendant\ToolRouter($gate, $pdo);
    $assert(count($router->registeredTools()) === 14, 'exactly 14 tools registered');

    $store = new Attendant\ConversationStore($pdo);
    $created = $store->createSession();
    $cid = $created['conversation_id'];
    $assert($cid !== '', 'session creates conversation');

    $cols = $pdo->query('SHOW COLUMNS FROM attendant_conversations')->fetchAll(PDO::FETCH_COLUMN);
    $assert(in_array('escalation_state', $cols, true), 'column escalation_state');
    $assert(in_array('operator_brief_json', $cols, true), 'column operator_brief_json');
    $assert(in_array('commercial_state', $cols, true), 'column commercial_state');

    $msgCols = $pdo->query('SHOW COLUMNS FROM attendant_messages')->fetchAll(PDO::FETCH_COLUMN);
    // human role may require migration 016
    $roleRow = $pdo->query("SHOW COLUMNS FROM attendant_messages LIKE 'role'")->fetch(PDO::FETCH_ASSOC);
    $type = (string) ($roleRow['Type'] ?? '');
    $assert(str_contains($type, 'human'), 'message role ENUM includes human (apply migration 016 if FAIL)');

    $page = ['page_id' => 'home', 'current_url' => 'http://localhost/'];
    $pay = $router->execute('payment_init', [], $cid, $page, false);
    $assert(($pay['code'] ?? '') === 'unsupported', 'payment_init unsupported');

    $starter = $router->execute('start_order', [
        'template' => 'attendant-inquiry',
        'fullName' => 'Smoke',
        'phone' => '700000001',
        'package' => 'starter',
    ], $cid, $page, false);
    $assert(($starter['ok'] ?? true) === false, 'display package starter rejected');

    $soft = $router->execute('handoff', ['reason_code' => 'just_because'], $cid, $page, false);
    $assert(($soft['code'] ?? '') === 'escalation_not_allowed', 'soft handoff rejected');

    $esc = Attendant\EscalationState::normalize($store->getEscalationState($cid));
    $assert($esc === Attendant\EscalationState::AUTONOMOUS, 'new conversation starts autonomous');
}

// --- Optional HTTP hub probes ---
$base = rtrim((string) (getenv('ATTENDANT_SMOKE_BASE') ?: ''), '/');
if ($base !== '') {
    echo "\n[HTTP {$base}]\n";
    $httpGet = static function (string $url, array $headers = []) : array {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['code' => $code, 'body' => is_string($body) ? $body : ''];
    };
    $httpPostJson = static function (string $url, array $payload, array $headers = []) : array {
        $ch = curl_init($url);
        $headers[] = 'Content-Type: application/json';
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => json_encode($payload),
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $json = json_decode(is_string($body) ? $body : '', true);
        return ['code' => $code, 'body' => is_string($body) ? $body : '', 'json' => is_array($json) ? $json : []];
    };

    $sess = $httpPostJson($base . '/php/attendant/session.php', []);
    $assert($sess['code'] === 200 && !empty($sess['json']['ok']), 'HTTP session.php ok');
    $token = (string) ($sess['json']['session_token'] ?? '');
    $assert($token !== '', 'HTTP session_token issued');

    $pol = $httpGet($base . '/php/attendant/public_policy.php?slug=privacy');
    $assert($pol['code'] === 200 && str_contains(mb_strtolower($pol['body']), 'privacy'), 'HTTP public privacy policy');

    $msg = $httpGet(
        $base . '/php/attendant/messages.php?after_id=0',
        ['X-Attendant-Session: ' . $token, 'Accept: application/json']
    );
    $msgJson = json_decode($msg['body'], true);
    $assert(
        $msg['code'] === 200 && is_array($msgJson) && ($msgJson['ok'] ?? false) === true,
        'HTTP messages.php with session'
    );

    $badMsg = $httpGet($base . '/php/attendant/messages.php?after_id=0');
    $assert($badMsg['code'] === 401 || str_contains($badMsg['body'], 'unauthorized') || str_contains($badMsg['body'], 'Invalid'), 'HTTP messages.php rejects missing session');
} else {
    echo "SKIP HTTP (set ATTENDANT_SMOKE_BASE to probe hub)\n";
}

echo "\n";
if ($failures > 0) {
    echo "FAILED {$failures} check(s)\n";
    exit(1);
}
echo "Hub smoke passed.\n";
if (!$dbOk) {
    echo "Note: start MySQL and run: php php/attendant/scripts/apply_attendant_migration.php all\n";
}
exit(0);
