<?php

declare(strict_types=1);

use Attendant\CommercialStateMachine;
use Attendant\ContextEngine;
use Attendant\CustomerModel;
use Attendant\CustomerModelUpdater;
use Attendant\ExpertiseLibrary;
use Attendant\PromptComposer;
use Attendant\SkillActivator;

fwrite(STDOUT, "\n[customer model + expertise]\n");

$updater = new CustomerModelUpdater();

$d1 = $updater->fromMessage(null, 'I need a website for my learning institution', ['page_id' => 'home']);
AttendantTest::assertSame('school', $d1['customer_model']['org_type'] ?? null, 'detect school org_type');
AttendantTest::assertSame('websites', $d1['service_id'] ?? null, 'website intent → websites service');
AttendantTest::assertTrue(
    in_array($d1['commercial_state'], [
        CommercialStateMachine::QUALIFICATION,
        CommercialStateMachine::RECOMMENDATION,
    ], true),
    'school website moves past discovery'
);

$d2 = $updater->fromMessage($d1, 'We will go with Business Basic', ['page_id' => 'prices']);
AttendantTest::assertSame('basic', $d2['package'] ?? null, 'Business Basic persists as package');
AttendantTest::assertSame('basic', $d2['recommendation']['package'] ?? null, 'recommendation package set');
AttendantTest::assertSame(CommercialStateMachine::RECOMMENDATION, $d2['commercial_state'] ?? null, 'state recommendation');

$d3 = $updater->fromMessage($d2, 'What do you recommend for us?', ['page_id' => 'home']);
AttendantTest::assertSame('school', $d3['customer_model']['org_type'] ?? null, 'org_type survives later turn');
AttendantTest::assertSame('basic', $d3['package'] ?? null, 'package survives later turn');

$known = CustomerModel::knownSummary($d3);
AttendantTest::assertTrue(
    count(array_filter($known, static fn ($k) => str_starts_with((string) $k, 'org_type='))) === 1,
    'do_not_reask includes org_type'
);
AttendantTest::assertTrue(
    count(array_filter($known, static fn ($k) => str_contains((string) $k, 'package=basic'))) >= 1,
    'do_not_reask includes package'
);

$promptView = CustomerModel::forPrompt($d3);
AttendantTest::assertTrue(isset($promptView['do_not_reask']), 'prompt view has do_not_reask');
AttendantTest::assertSame('school', $promptView['customer_model']['org_type'] ?? null, 'prompt customer org_type');

AttendantTest::assertTrue(
    !CommercialStateMachine::canTransition(CommercialStateMachine::DISCOVERY, CommercialStateMachine::PAYMENT),
    'cannot jump discovery → payment'
);
AttendantTest::assertSame(
    CommercialStateMachine::DISCOVERY,
    CommercialStateMachine::transition(CommercialStateMachine::DISCOVERY, CommercialStateMachine::PAYMENT),
    'illegal transition kept'
);
AttendantTest::assertSame(
    CommercialStateMachine::QUALIFICATION,
    CommercialStateMachine::transition(CommercialStateMachine::DISCOVERY, CommercialStateMachine::QUALIFICATION),
    'legal transition allowed'
);

$lib = new ExpertiseLibrary();
$selected = $lib->select(
    ['page_id' => 'websites', 'visible_service_id' => 'websites'],
    $d3,
    'school website credibility enquiries',
    2,
    2
);
AttendantTest::assertTrue($selected['cards'] !== [], 'expertise selects at least one card');
$cardIds = array_map(static fn ($c) => (string) ($c['id'] ?? ''), $selected['cards']);
AttendantTest::assertTrue(in_array('business-basic', $cardIds, true), 'business-basic card selected for school site');

$ctx = new ContextEngine($lib);
$blocks = $ctx->build(
    ['current_url' => 'http://localhost/websites', 'page_id' => 'websites', 'visible_service_id' => 'websites'],
    $d3,
    null,
    [],
    'school website'
);
AttendantTest::assertTrue(isset($blocks['customer_json'], $blocks['commercial_json'], $blocks['expertise_json']), 'context has model blocks');
$customerDecoded = json_decode($blocks['customer_json'], true);
AttendantTest::assertSame('school', $customerDecoded['customer_model']['org_type'] ?? null, 'injected customer org_type');
$expertiseDecoded = json_decode($blocks['expertise_json'], true);
AttendantTest::assertTrue(($expertiseDecoded['cards'] ?? []) !== [], 'injected expertise cards');

$composer = new PromptComposer();
$skills = (new SkillActivator())->activate('I need a website for my school', ['page_id' => 'home']);
$composed = $composer->compose($skills, ['update_customer_model', 'get_product'], $blocks, []);
AttendantTest::assertContains('do_not_reask', $composed['system'], 'system prompt includes do_not_reask guidance');
AttendantTest::assertContains('business-basic', $composed['system'], 'system prompt includes selected expertise card');

$answerTools = (new SkillActivator())->allowedTools(['answer_question', 'understand_intent']);
AttendantTest::assertTrue(in_array('update_customer_model', $answerTools, true), 'update_customer_model allow-listed');

$merged = CustomerModel::merge($d3, [
    'customer_model' => ['worries' => ['cost']],
    'known_facts' => ['cost_sensitive'],
]);
AttendantTest::assertTrue(in_array('cost', $merged['customer_model']['worries'] ?? [], true), 'merge appends worries');
AttendantTest::assertSame('school', $merged['customer_model']['org_type'] ?? null, 'merge keeps org_type');
