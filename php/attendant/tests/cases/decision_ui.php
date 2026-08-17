<?php

declare(strict_types=1);

use Attendant\ChoiceGate;
use Attendant\CustomerModel;
use Attendant\CustomerModelUpdater;
use Attendant\SkillActivator;
use Attendant\Tools\PresentChoicesTool;
use Attendant\ToolContext;
use Attendant\ToolResults;

fwrite(STDOUT, "\n[decision UI / choices]\n");

$activator = new SkillActivator();
$qual = $activator->activate('I need a website for my learning institution', ['page_id' => 'home']);
AttendantTest::assertTrue(in_array('decision_ui', $qual, true) || in_array('qualify', $qual, true), 'qualify/decision_ui on school need');
$tools = $activator->allowedTools(['decision_ui', 'qualify']);
AttendantTest::assertTrue(in_array('present_choices', $tools, true), 'present_choices allow-listed');

$skillPath = attendant_contract_dir() . DIRECTORY_SEPARATOR . 'skills' . DIRECTORY_SEPARATOR . 'decision_ui.md';
AttendantTest::assertTrue(is_file($skillPath), 'decision_ui skill file exists');

// PresentChoicesTool validation without DB: use a fake gate via anonymous — need real PDO for ChoiceGate.
// Unit-test option shaping through tool when PDO unavailable: skip create, test validation only.
$pdoOk = false;
try {
    $pdo = attendant_pdo();
    $pdo->query('SELECT 1 FROM attendant_pending_actions LIMIT 1');
    $pdoOk = true;
} catch (Throwable $e) {
    AttendantTest::skip('decision UI DB tests: ' . $e->getMessage());
}

if ($pdoOk) {
    $store = new Attendant\ConversationStore($pdo);
    $created = $store->createSession();
    $cid = $created['conversation_id'];
    $gate = new ChoiceGate($pdo);
    $tool = new PresentChoicesTool($gate);
    $ctx = new ToolContext($cid, ['page_id' => 'home', 'current_url' => 'http://localhost/']);

    $bad = $tool->execute(['prompt' => 'Only one?', 'options' => [['id' => 'a', 'label' => 'A']]], $ctx);
    AttendantTest::assertTrue(($bad['ok'] ?? true) === false, 'present_choices rejects <2 options');

    $ok = $tool->execute([
        'prompt' => 'For your school, what do you need most?',
        'options' => [
            [
                'id' => 'public_site',
                'label' => 'Public website (no logins)',
                'model_patch' => [
                    'service_id' => 'websites',
                    'customer_model' => ['org_type' => 'school', 'objective' => 'public website'],
                    'known_facts' => ['needs_public_site'],
                ],
            ],
            [
                'id' => 'system',
                'label' => 'Logins / student portal',
                'model_patch' => [
                    'service_id' => 'business-systems',
                    'customer_model' => ['objective' => 'operational system'],
                ],
            ],
        ],
    ], $ctx);
    AttendantTest::assertTrue(($ok['ok'] ?? false) === true, 'present_choices ok');
    AttendantTest::assertSame('await_choice', $ok['side_effects'] ?? null, 'await_choice side effect');
    AttendantTest::assertTrue(!empty($ok['data']['token']), 'choice token present');
    AttendantTest::assertSame(2, count($ok['data']['options'] ?? []), 'two options returned');

    $peek = $gate->peekActive($cid);
    AttendantTest::assertTrue($peek !== null, 'choice pending peekable');

    $updater = new CustomerModelUpdater();
    $selected = $peek['payload']['options'][0];
    $draft = $updater->fromChoiceSelection(null, [$selected]);
    AttendantTest::assertSame('websites', $draft['service_id'] ?? null, 'choice patch sets service_id');
    AttendantTest::assertSame('school', $draft['customer_model']['org_type'] ?? null, 'choice patch sets org_type');
    AttendantTest::assertSame('public website', $draft['customer_model']['objective'] ?? null, 'choice patch sets objective');

    $consumed = $gate->consume($cid, (string) $ok['data']['token']);
    AttendantTest::assertTrue($consumed !== null, 'choice token consumes once');
    AttendantTest::assertTrue($gate->peekActive($cid) === null, 'no pending after consume');

    $view = CustomerModel::forPrompt($draft);
    AttendantTest::assertTrue(isset($view['do_not_reask']) || isset($view['customer_model']), 'prompt view after choice');
}

$failShape = ToolResults::fail('present_choices', 'validation_error', 'Nope');
AttendantTest::assertTrue(($failShape['ok'] ?? true) === false, 'fail shape');
