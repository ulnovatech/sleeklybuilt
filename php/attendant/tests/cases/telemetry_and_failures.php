<?php

declare(strict_types=1);

use Attendant\Telemetry;
use Attendant\ToolResults;

fwrite(STDOUT, "\n[telemetry + failures]\n");

$scrubbed = Telemetry::scrubMeta([
    'prompt_hash' => 'abc',
    'GEMINI_API_KEY' => 'secret-key',
    'session_token' => 'tok',
    'nested' => ['api_key' => 'x', 'ok' => true],
]);
AttendantTest::assertTrue(!isset($scrubbed['GEMINI_API_KEY']), 'telemetry strips GEMINI_API_KEY');
AttendantTest::assertTrue(!isset($scrubbed['session_token']), 'telemetry strips session_token');
AttendantTest::assertTrue(!isset($scrubbed['nested']['api_key']), 'telemetry strips nested api_key');
AttendantTest::assertSame('abc', $scrubbed['prompt_hash'] ?? null, 'telemetry keeps prompt_hash');

$fail = ToolResults::fail('capture_lead', 'backend_error', 'I couldn\'t complete that just now. It was not sent.');
AttendantTest::assertTrue(($fail['ok'] ?? true) === false, 'tool failure is not success');
AttendantTest::assertContains('not sent', mb_strtolower($fail['user_safe_error'] ?? ''), 'failure copy says not sent');

require_once dirname(__DIR__, 3) . '/leads/rate_limit.php';
AttendantTest::assertTrue(function_exists('uln_rate_limit_allows'), 'uln_rate_limit_allows available');
AttendantTest::assertTrue(defined('ATTENDANT_CHAT_RATE_MAX'), 'ATTENDANT_CHAT_RATE_MAX defined');
AttendantTest::assertTrue(defined('ATTENDANT_MAX_TOOL_ROUNDS') && ATTENDANT_MAX_TOOL_ROUNDS === 4, 'max tool rounds = 4');
AttendantTest::assertSame(60, ATTENDANT_CHAT_RATE_MAX, 'chat rate max is 60/hour window');
