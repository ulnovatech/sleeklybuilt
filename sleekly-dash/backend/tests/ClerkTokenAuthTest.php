<?php

declare(strict_types=1);

/**
 * Offline tests for ClerkTokenAuth configuration / fail-closed rules.
 * Usage: php tests/ClerkTokenAuthTest.php
 */

require_once __DIR__ . '/../auth/ClerkTokenAuth.php';

$failures = 0;
function assert_true(bool $cond, string $msg): void
{
    global $failures;
    if ($cond) {
        echo "PASS: {$msg}\n";
    } else {
        echo "FAIL: {$msg}\n";
        $failures++;
    }
}

function clearClerkEnv(): void
{
    foreach ([
        'CLERK_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_JWKS_URL',
        'CLERK_ISSUER',
        'CLERK_ADMIN_USER_ID',
        'CLERK_ADMIN_EMAIL',
        'CLERK_AUTHORIZED_PARTIES',
        'CLERK_JWT_AUD',
    ] as $key) {
        putenv($key);
    }
}

clearClerkEnv();
assert_true(ClerkTokenAuth::isConfigured() === false, 'unconfigured without JWKS/issuer/allowlist');
assert_true(ClerkTokenAuth::passwordLoginDisabled() === false, 'password allowed when unconfigured');

putenv('CLERK_PUBLISHABLE_KEY=pk_test_example');
putenv('CLERK_ADMIN_USER_ID=user_abc');
assert_true(ClerkTokenAuth::isConfigured() === false, 'publishable key alone is not enough');

putenv('CLERK_JWKS_URL=https://example.clerk.accounts.dev/.well-known/jwks.json');
putenv('CLERK_ISSUER=https://example.clerk.accounts.dev');
assert_true(ClerkTokenAuth::isConfigured() === true, 'configured with JWKS+issuer+allowlist');
assert_true(ClerkTokenAuth::passwordLoginDisabled() === true, 'password disabled when configured');

$auth = new ClerkTokenAuth();
assert_true($auth->authenticateRequest() === false, 'no bearer → authenticate fails closed');

clearClerkEnv();
putenv('CLERK_JWKS_URL=https://example.clerk.accounts.dev/.well-known/jwks.json');
putenv('CLERK_ISSUER=https://example.clerk.accounts.dev');
assert_true(ClerkTokenAuth::isConfigured() === false, 'allowlist required');

echo $failures === 0 ? "ClerkTokenAuthTest OK\n" : "ClerkTokenAuthTest FAILED ($failures)\n";
exit($failures === 0 ? 0 : 1);
