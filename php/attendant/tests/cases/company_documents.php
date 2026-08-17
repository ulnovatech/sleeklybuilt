<?php

declare(strict_types=1);

use Attendant\CompanyDocumentStore;
use Attendant\ConfirmationGate;
use Attendant\PageRegistry;
use Attendant\SkillActivator;
use Attendant\ToolRouter;
use Attendant\Tools\GetCompanyDocumentTool;
use Attendant\Tools\SearchKnowledgeTool;

fwrite(STDOUT, "\n[company documents + access]\n");

$store = new CompanyDocumentStore();
$public = $store->listPublicPolicies();
AttendantTest::assertTrue(count($public) >= 8, 'at least 8 PUBLIC policies listed');
$slugs = array_column($public, 'slug');
AttendantTest::assertTrue(in_array('privacy', $slugs, true), 'privacy slug listed');
AttendantTest::assertTrue(in_array('terms', $slugs, true), 'terms slug listed');

$privacy = $store->getBySlug('privacy', [CompanyDocumentStore::ACCESS_PUBLIC]);
AttendantTest::assertTrue(($privacy['ok'] ?? false) === true, 'PUBLIC privacy loads');
AttendantTest::assertContains('Privacy', (string) ($privacy['document']['title'] ?? ''), 'privacy title');

$internalById = $store->getById('18_attendant_authority_matrix', CompanyDocumentStore::VISITOR_ALLOWED);
AttendantTest::assertTrue(($internalById['ok'] ?? true) === false, 'INTERNAL authority denied to visitor');
AttendantTest::assertSame('forbidden', $internalById['code'] ?? null, 'INTERNAL code forbidden');

$systemById = $store->getById('20_attendant_company_truth', CompanyDocumentStore::VISITOR_ALLOWED);
AttendantTest::assertTrue(($systemById['ok'] ?? true) === false, 'SYSTEM_ONLY denied to visitor');
AttendantTest::assertSame('forbidden', $systemById['code'] ?? null, 'SYSTEM code forbidden');

$expertise = $store->getById('04_product_expertise', CompanyDocumentStore::VISITOR_ALLOWED);
AttendantTest::assertTrue(($expertise['ok'] ?? true) === false, 'ATTENDANT_INTERNAL expertise denied');

$profile = $store->getById('01_company_profile', CompanyDocumentStore::VISITOR_ALLOWED);
AttendantTest::assertTrue(($profile['ok'] ?? false) === true, 'CUSTOMER_CONTEXT profile allowed to visitor tools');

$hits = $store->search('authority matrix', CompanyDocumentStore::VISITOR_ALLOWED, 6);
foreach ($hits as $hit) {
    AttendantTest::assertTrue(
        !str_contains((string) ($hit['id'] ?? ''), '18_attendant_authority'),
        'search must not return INTERNAL authority doc'
    );
    AttendantTest::assertTrue(
        in_array((string) ($hit['access'] ?? ''), CompanyDocumentStore::VISITOR_ALLOWED, true),
        'search hit access visitor-allowed'
    );
}

$refundHits = $store->search('refund cancellation', CompanyDocumentStore::VISITOR_ALLOWED, 4);
AttendantTest::assertTrue($refundHits !== [], 'refund search finds PUBLIC policy');

$tool = new GetCompanyDocumentTool($store);
$ctx = new Attendant\ToolContext('test-conv', ['page_id' => 'home']);
$okDoc = $tool->execute(['slug' => 'payment'], $ctx);
AttendantTest::assertTrue(($okDoc['ok'] ?? false) === true, 'get_company_document payment ok');

$denied = $tool->execute(['id' => '20_attendant_company_truth'], $ctx);
AttendantTest::assertTrue(($denied['ok'] ?? true) === false, 'get_company_document SYSTEM fails');
AttendantTest::assertSame('unauthorized', $denied['code'] ?? null, 'SYSTEM tool code unauthorized');

$searchTool = new SearchKnowledgeTool(new Attendant\KnowledgeCorpus(), $store);
$merged = $searchTool->execute(['query' => 'privacy data'], $ctx);
AttendantTest::assertTrue(($merged['ok'] ?? false) === true, 'search_knowledge merges company');
$mergedIds = array_map(static fn ($h) => (string) ($h['id'] ?? ''), $merged['data']['hits'] ?? []);
foreach ($mergedIds as $id) {
    if (str_starts_with($id, 'company:')) {
        AttendantTest::assertTrue(!$store->isVisitorDeniedId($id), "merged hit {$id} not visitor-denied");
    }
}

$registry = new PageRegistry();
$pol = $registry->resolveNavigate('policies', 'privacy');
AttendantTest::assertSame('/policies/privacy', $pol['path'] ?? null, 'policies+privacy nested path');
AttendantTest::assertTrue(array_key_exists('hash', $pol) && $pol['hash'] === null, 'policies nested path has no hash');

$activator = new SkillActivator();
$answerTools = $activator->allowedTools(['answer_question']);
AttendantTest::assertTrue(in_array('get_company_document', $answerTools, true), 'answer_question allows get_company_document');
