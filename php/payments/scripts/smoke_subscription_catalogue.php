<?php

/**
 * Isolation smoke for subscription vs website packages (no DB).
 *   php php/payments/scripts/smoke_subscription_catalogue.php
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/packages.php';

$failed = 0;
function assert_true(bool $cond, string $label): void
{
    global $failed;
    if ($cond) {
        echo "OK  {$label}\n";
    } else {
        echo "FAIL {$label}\n";
        $failed++;
    }
}

$website = uln_packages();
assert_true(isset($website['basic'], $website['smart'], $website['premium']), 'website packages present');
assert_true(!isset($website['attendant-monthly']), 'attendant-monthly not in uln_packages()');

$subs = uln_subscription_products();
assert_true(isset($subs['attendant-monthly']), 'attendant-monthly in subscription catalogue');
assert_true(($subs['attendant-monthly']['amount_ugx'] ?? 0) === 49000, 'first month amount 49000');
assert_true(($subs['attendant-monthly']['kind'] ?? '') === 'subscription', 'kind is subscription');
assert_true(($subs['attendant-monthly']['template_key'] ?? '') === 'sleekly-attendant', 'sentinel template_key');

assert_true(uln_is_subscription_product('attendant-monthly'), 'is_subscription true');
assert_true(!uln_is_subscription_product('basic'), 'basic is not subscription');

try {
    uln_package_or_fail('attendant-monthly');
    assert_true(false, 'uln_package_or_fail rejects attendant-monthly');
} catch (InvalidArgumentException $e) {
    assert_true(true, 'uln_package_or_fail rejects attendant-monthly');
}

$sub = uln_subscription_product_or_fail('attendant-monthly');
assert_true(($sub['title'] ?? '') === 'Sleekly Attendant: first month', 'subscription title');

exit($failed > 0 ? 1 : 0);
