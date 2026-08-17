<?php

declare(strict_types=1);

/**
 * Chunk 3G — human handoff / escalation state.
 */

use Attendant\EscalationState;

fwrite(STDOUT, "\n[escalation / operator]\n");

AttendantTest::assertSame(EscalationState::AUTONOMOUS, EscalationState::normalize(null), 'null → autonomous');
AttendantTest::assertTrue(EscalationState::canTransition('autonomous', 'escalated'), 'autonomous→escalated');
AttendantTest::assertTrue(EscalationState::canTransition('escalated', 'human_active'), 'escalated→human_active');
AttendantTest::assertTrue(EscalationState::canTransition('human_active', 'resumed'), 'human_active→resumed');
AttendantTest::assertTrue(EscalationState::canTransition('human_active', 'autonomous'), 'human_active→autonomous');
AttendantTest::assertTrue(!EscalationState::canTransition('autonomous', 'human_active'), 'no skip to human_active');
AttendantTest::assertTrue(EscalationState::isHumanControlled('escalated'), 'escalated is human-controlled');
AttendantTest::assertTrue(EscalationState::isHumanControlled('human_active'), 'human_active is human-controlled');
AttendantTest::assertTrue(!EscalationState::isHumanControlled('autonomous'), 'autonomous not controlled');
AttendantTest::assertTrue(!EscalationState::isHumanControlled('resumed'), 'resumed not controlled');

$briefFields = [
    'summary',
    'requirements',
    'decisions',
    'unresolved',
    'customer',
    'recommendation',
    'suggested_next_action',
    'reason_code',
    'order_package',
];
$handoffFile = (string) file_get_contents(dirname(__DIR__, 2) . '/src/Tools/HandoffTool.php');
foreach ($briefFields as $field) {
    AttendantTest::assertTrue(
        str_contains($handoffFile, "'" . $field . "'"),
        "§55 brief builds {$field}"
    );
}
AttendantTest::assertTrue(str_contains($handoffFile, 'uln_dispatch_lead_push'), 'handoff dispatches FCM');
AttendantTest::assertTrue(str_contains($handoffFile, 'attendant_escalation'), 'FCM type attendant_escalation');

// §55 keys present in a built brief (no DB)
$ref = new ReflectionClass(Attendant\Tools\HandoffTool::class);
$tool = $ref->newInstance(
    new Attendant\ContextEngine(),
    null
);
$build = $ref->getMethod('buildBrief');
$build->setAccessible(true);
$sampleBrief = $build->invoke(
    $tool,
    Attendant\CustomerModel::merge(null, [
        'business_name' => 'Acme School',
        'customer_model' => [
            'org_type' => 'school',
            'org_name' => 'Acme School',
            'objective' => 'public website',
            'constraints' => ['cost_sensitive'],
        ],
        'package' => 'basic',
        'known_facts' => ['package=basic', 'chose:Website'],
        'open_questions' => ['When do you need to launch?'],
    ]),
    'explicit_human',
    ['reason' => 'Asked for a person', 'suggested_next_action' => 'Call them'],
    ['page_id' => 'prices', 'path' => '/prices']
);
foreach (['summary', 'requirements', 'decisions', 'unresolved', 'customer', 'recommendation', 'reason_code', 'suggested_next_action'] as $key) {
    AttendantTest::assertTrue(array_key_exists($key, $sampleBrief), "built brief has {$key}");
}
AttendantTest::assertContains('Acme', (string) ($sampleBrief['summary'] ?? ''), 'brief summary names org');

$turn = (string) file_get_contents(dirname(__DIR__, 2) . '/src/TurnEngine.php');
AttendantTest::assertTrue(str_contains($turn, 'isHumanControlled'), 'TurnEngine pauses when human-controlled');
AttendantTest::assertTrue(str_contains($turn, 'llm_skipped'), 'TurnEngine marks llm_skipped');

$ops = dirname(__DIR__, 4) . '/sleekly-dash/backend/controllers/AttendantOperatorController.php';
AttendantTest::assertTrue(is_file($ops), 'AttendantOperatorController exists');
$opsSrc = (string) file_get_contents($ops);
AttendantTest::assertTrue(str_contains($opsSrc, 'function takeover'), 'operator takeover');
AttendantTest::assertTrue(str_contains($opsSrc, 'function resume'), 'operator resume');
AttendantTest::assertTrue(str_contains($opsSrc, 'idempotency'), 'operator message idempotency');

$msgApi = dirname(__DIR__, 2) . '/messages.php';
AttendantTest::assertTrue(is_file($msgApi), 'visitor messages.php exists');
