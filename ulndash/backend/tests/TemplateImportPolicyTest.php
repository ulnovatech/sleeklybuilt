<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

function assertSameValue(mixed $expected, mixed $actual, string $message): void
{
    if ($expected !== $actual) {
        fwrite(
            STDERR,
            sprintf(
                "FAIL: %s\nExpected: %s\nActual: %s\n",
                $message,
                var_export($expected, true),
                var_export($actual, true)
            )
        );
        exit(1);
    }
}

assertSameValue(
    'willey-fragrance.webflow.io',
    TemplateImportPolicy::folderIdFromSourceUrl('https://willey-fragrance.webflow.io/'),
    'An allowed Webflow URL should produce its full hostname as folder ID.'
);

assertSameValue(
    'nested.preview.webflow.io',
    TemplateImportPolicy::folderIdFromSourceUrl('https://NESTED.PREVIEW.WEBFLOW.IO/path'),
    'Allowed hostnames should be normalized to lowercase.'
);

foreach ([
    'http://example.webflow.io/',
    'https://webflow.io/',
    'https://webflow.io.evil.example/',
    'https://example.com/',
    'https://user:pass@example.webflow.io/',
    'https://example.webflow.io:8443/',
] as $sourceUrl) {
    assertSameValue(
        null,
        TemplateImportPolicy::folderIdFromSourceUrl($sourceUrl),
        "Disallowed source URL accepted: {$sourceUrl}"
    );
}

assertSameValue(
    true,
    TemplateImportPolicy::isKnownState('scrubbing'),
    'The scrubbing phase should be a known import state.'
);
assertSameValue(
    false,
    TemplateImportPolicy::isKnownState('complete'),
    'Unknown states must be rejected.'
);
assertSameValue(
    true,
    TemplateImportPolicy::isTerminalState('published'),
    'Published should be terminal.'
);
assertSameValue(
    false,
    TemplateImportPolicy::isTerminalState('ready'),
    'Ready should await publish or discard.'
);
assertSameValue(
    true,
    TemplateImportPolicy::isTerminalState('rolled_back'),
    'Rolled back should be terminal.'
);

$expectedPortfolio = realpath(__DIR__ . '/../../../portfolio/portfolio');
$expectedCatalog = realpath(__DIR__ . '/../../../portfolio/portfolio/catalog.json');

assertSameValue(
    $expectedPortfolio,
    TemplateImportPolicy::portfolioDirectory(),
    'The canonical portfolio path should resolve to portfolio/portfolio.'
);
assertSameValue(
    $expectedCatalog,
    TemplateImportPolicy::catalogPath(),
    'The canonical catalog path should resolve to catalog.json.'
);
assertSameValue(
    '/portfolio/portfolio/cta.js',
    TemplateImportPolicy::CTA_PUBLIC_PATH,
    'CTA injection must use an absolute path for nested template pages.'
);

fwrite(STDOUT, "TemplateImportPolicy tests passed.\n");
