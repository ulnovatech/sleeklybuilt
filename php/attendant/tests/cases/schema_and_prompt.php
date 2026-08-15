<?php

declare(strict_types=1);

use Attendant\PromptComposer;
use Attendant\SchemaValidator;
use Attendant\SkillActivator;
use Attendant\ToolResults;

fwrite(STDOUT, "\n[schema + prompt]\n");

$validator = new SchemaValidator();

$badContext = $validator->validateContext(['page_id' => 'home']);
AttendantTest::assertTrue(!$badContext['ok'], 'context requires current_url');

$okContext = $validator->validateContext([
    'current_url' => 'http://localhost/',
    'page_id' => 'home',
]);
AttendantTest::assertTrue($okContext['ok'] ?? false, 'valid home context');

$unknownPage = $validator->validateContext([
    'current_url' => 'http://localhost/x',
    'page_id' => 'mars-catalogue',
]);
AttendantTest::assertTrue(($unknownPage['ok'] ?? false) && ($unknownPage['value']['page_id'] ?? '') === 'unknown', 'unknown page_id remapped');

$failResult = ToolResults::fail('navigate_to', 'unknown_destination', 'Nope');
$checkFail = $validator->validateToolResult($failResult);
AttendantTest::assertTrue($checkFail['ok'] ?? false, 'tool-result failure shape validates');

$badSuccess = [
    'ok' => true,
    'tool' => 'capture_lead',
    'code' => 'ok',
    'side_effects' => 'writes_lead',
    'confirmation_required' => true,
    'user_safe_error' => null,
    'data' => null,
    'summary' => null,
];
$checkBad = $validator->validateToolResult($badSuccess);
AttendantTest::assertTrue(!($checkBad['ok'] ?? true), 'ok:true cannot set confirmation_required');

$composer = new PromptComposer();
$skills = (new SkillActivator())->activate('hello', ['page_id' => 'home']);
$blocks = [
    'page_json' => '{}',
    'visible_json' => '{}',
    'draft_json' => '{}',
    'pending_json' => 'null',
    'company_json' => '{}',
    'retrieved_json' => '[]',
];
$composed = $composer->compose($skills, ['get_current_page'], $blocks, []);
AttendantTest::assertContains('rules/00_', implode(',', $composer->ruleFiles()), 'rules include 00');
for ($i = 0; $i <= 12; $i++) {
    $prefix = sprintf('rules/%02d_', $i);
    $found = false;
    foreach ($composer->ruleFiles() as $rel) {
        if (str_starts_with($rel, $prefix)) {
            $found = true;
            break;
        }
    }
    AttendantTest::assertTrue($found, "rule file {$prefix}* present");
}
AttendantTest::assertContains('SleeklyBuilt Attendant', $composed['system'], 'system prompt loaded from contract');
AttendantTest::assertSame($skills, $composed['skill_ids'], 'composed skill ids match activator');
