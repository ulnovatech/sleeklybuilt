<?php

declare(strict_types=1);

use Attendant\KnowledgeCorpus;
use Attendant\PageRegistry;

fwrite(STDOUT, "\n[registry + knowledge]\n");

$registry = new PageRegistry();
$appRoutes = [
    'home' => '/',
    'sleek-pages' => '/sleek-pages',
    'websites' => '/websites',
    'mobile-apps' => '/mobile-apps',
    'business-systems' => '/business-systems',
    'products' => '/products',
    'contact' => '/contact',
    'about' => '/about',
    'prices' => '/prices',
    'track-order' => '/track-order',
];

foreach ($appRoutes as $pageId => $path) {
    $page = $registry->getPage($pageId);
    AttendantTest::assertTrue($page !== null, "App.jsx route page_id {$pageId} exists");
    AttendantTest::assertSame($path, $page['path'] ?? null, "{$pageId} path matches");
}

$portfolio = $registry->resolveNavigate('portfolio');
AttendantTest::assertTrue(($portfolio['external'] ?? false) === true, 'portfolio external');
AttendantTest::assertSame('/portfolio-app/', $portfolio['path'] ?? null, 'portfolio path');

$prices = $registry->resolveNavigate('prices', 'price-deposit');
AttendantTest::assertTrue($prices !== null && ($prices['hash'] ?? '') === 'price-deposit', 'N1-style prices#price-deposit');

$badSection = $registry->resolveNavigate('prices', 'not-real');
AttendantTest::assertTrue($badSection === null, 'unknown section fails closed');

$unknownPage = $registry->resolveNavigate('mars');
AttendantTest::assertTrue($unknownPage === null, 'unknown page_id fails closed');

$webHost = $registry->resolveShowSection('web-hosting', 'websites');
AttendantTest::assertTrue($webHost !== null && ($webHost['highlight'] ?? false) === true, 'N3 web-hosting highlight');

$corpus = new KnowledgeCorpus();
$hits = $corpus->search('Mobile Money', 4);
AttendantTest::assertTrue($hits !== [], 'Mobile Money corpus hit');
AttendantTest::assertContains('mobile money', mb_strtolower($hits[0]['text'] ?? ''), 'Mobile Money text from FAQ not invented');
