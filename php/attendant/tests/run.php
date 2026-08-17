<?php

declare(strict_types=1);

/**
 * Layer A — deterministic attendant regression suite.
 * Usage: php php/attendant/tests/run.php
 *
 * Live Layer B: ATTENDANT_LIVE_EVAL=1 GEMINI_API_KEY=… php php/attendant/tests/live_eval.php
 */

require_once dirname(__DIR__) . '/bootstrap.php';
require_once __DIR__ . '/helpers.php';

fwrite(STDOUT, "SleeklyBuilt Attendant — Layer A\n");

$dbAvailable = false;
try {
    attendant_pdo()->query('SELECT 1 FROM attendant_sessions LIMIT 1');
    $dbAvailable = true;
} catch (Throwable $e) {
    AttendantTest::skip('database unavailable: ' . $e->getMessage());
}

require __DIR__ . '/cases/php_lint.php';
require __DIR__ . '/cases/schema_and_prompt.php';
require __DIR__ . '/cases/registry_and_knowledge.php';
require __DIR__ . '/cases/company_documents.php';
require __DIR__ . '/cases/customer_model.php';
require __DIR__ . '/cases/behavior_escalation.php';
require __DIR__ . '/cases/escalation_operator.php';
require __DIR__ . '/cases/adversarial_access.php';
require __DIR__ . '/cases/decision_ui.php';
require __DIR__ . '/cases/catalogue_and_skills.php';
require __DIR__ . '/cases/order_payment_honesty.php';
require __DIR__ . '/cases/tools_and_confirmation.php';
require __DIR__ . '/cases/telemetry_and_failures.php';
require __DIR__ . '/cases/missing_key.php';

if ($dbAvailable) {
    require __DIR__ . '/cases/integration_db.php';
}

exit(AttendantTest::summary());
