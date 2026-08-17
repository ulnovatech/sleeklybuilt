<?php

declare(strict_types=1);

use Attendant\BanPhraseChecker;
use Attendant\ContextEngine;
use Attendant\EscalationPolicy;
use Attendant\SkillActivator;
use Attendant\Tools\HandoffTool;
use Attendant\ToolContext;
use Attendant\ToolResults;

fwrite(STDOUT, "\n[behavior + escalation]\n");

$activator = new SkillActivator();

$recSkills = $activator->activate('what should I get for my school website?', ['page_id' => 'home']);
AttendantTest::assertTrue(in_array('recommend', $recSkills, true), 'recommend skill on school ask');
AttendantTest::assertTrue(!in_array('handoff', $recSkills, true), 'handoff NOT default on recommend ask');

$qualSkills = $activator->activate('I need a website for my learning institution', ['page_id' => 'home']);
AttendantTest::assertTrue(in_array('qualify', $qualSkills, true), 'qualify on need-statement');

$objSkills = $activator->activate('AI is cheaper though', ['page_id' => 'websites']);
AttendantTest::assertTrue(in_array('handle_objection', $objSkills, true), 'handle_objection on AI cost');

$polSkills = $activator->activate('Can I get a refund?', ['page_id' => 'home']);
AttendantTest::assertTrue(in_array('explain_policy', $polSkills, true), 'explain_policy on refund');

$closeSkills = $activator->activate("Let's do Business Basic and get started", ['page_id' => 'prices']);
AttendantTest::assertTrue(in_array('close', $closeSkills, true), 'close on get started');

$humanSkills = $activator->activate('Can I talk to someone on WhatsApp?', ['page_id' => 'home']);
AttendantTest::assertTrue(in_array('handoff', $humanSkills, true), 'handoff on explicit human');

$recTools = $activator->allowedTools(['recommend']);
AttendantTest::assertTrue(in_array('update_customer_model', $recTools, true), 'recommend allows update_customer_model');
AttendantTest::assertTrue(!in_array('handoff', $recTools, true), 'recommend skill does not allow handoff tool');

AttendantTest::assertTrue(
    EscalationPolicy::normalizeCode('explicit_human') === EscalationPolicy::EXPLICIT_HUMAN,
    'normalize explicit_human'
);
AttendantTest::assertTrue(EscalationPolicy::normalizeCode('because_i_feel_like_it') === null, 'reject invent reason');

$badGate = EscalationPolicy::validateHandoffArgs(['reason' => 'just checking'], '');
AttendantTest::assertTrue(($badGate['ok'] ?? true) === false, 'handoff without allowed reason fails policy');

$goodGate = EscalationPolicy::validateHandoffArgs(['reason_code' => 'explicit_human'], '');
AttendantTest::assertTrue(($goodGate['ok'] ?? false) === true, 'explicit_human allowed');

$inferred = EscalationPolicy::inferFromMessage('please connect me to WhatsApp');
AttendantTest::assertSame(EscalationPolicy::EXPLICIT_HUMAN, $inferred, 'infer WhatsApp as explicit_human');

$handoff = new HandoffTool(new ContextEngine(), null);
$ctx = new ToolContext('conv-test', ['page_id' => 'home', 'current_url' => 'http://localhost/']);

$denied = $handoff->execute(['reason' => 'default cta after recommend'], $ctx);
AttendantTest::assertTrue(($denied['ok'] ?? true) === false, 'handoff tool rejects soft reason');
AttendantTest::assertSame('escalation_not_allowed', $denied['code'] ?? null, 'escalation_not_allowed code');

$allowed = $handoff->execute([
    'reason_code' => 'explicit_human',
    'reason' => 'Visitor asked for WhatsApp',
], $ctx);
AttendantTest::assertTrue(($allowed['ok'] ?? false) === true, 'handoff ok with explicit_human');
AttendantTest::assertTrue(!empty($allowed['data']['whatsapp_url']) || !empty($allowed['data']['primary_phone']), 'channels present');
AttendantTest::assertSame('explicit_human', $allowed['data']['reason_code'] ?? null, 'reason_code echoed');
AttendantTest::assertTrue(isset($allowed['data']['operator_brief']), 'operator brief present');

AttendantTest::assertTrue(BanPhraseChecker::isClean('For a school, I\'d go with Business Basic.'), 'clean expert reply');
AttendantTest::assertTrue(!BanPhraseChecker::isClean('Certainly! That is a great question.'), 'bans Certainly + great question');
$hits = BanPhraseChecker::find('Would you like me to show you the packages?');
AttendantTest::assertTrue(in_array('would you like me to', $hits, true), 'bans permission loop');

// Skill files exist for new ids
foreach (['qualify', 'close', 'handle_objection', 'explain_policy'] as $skillId) {
    $path = attendant_contract_dir() . DIRECTORY_SEPARATOR . 'skills' . DIRECTORY_SEPARATOR . $skillId . '.md';
    AttendantTest::assertTrue(is_file($path), "skill file {$skillId}.md exists");
}

$failShape = ToolResults::fail('handoff', 'escalation_not_allowed', 'Nope');
AttendantTest::assertTrue(($failShape['ok'] ?? true) === false, 'tool fail shape ok flag');
