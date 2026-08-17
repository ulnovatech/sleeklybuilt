<?php

declare(strict_types=1);

/**
 * Public company policy documents (PUBLIC access only).
 *
 * GET ?slug=privacy | ?list=1
 * Returns JSON for the marketing policy pages (same markdown as attendant/company/).
 */

require_once __DIR__ . '/bootstrap.php';

attendant_handle_options();
attendant_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    attendant_json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$store = new Attendant\CompanyDocumentStore();

if (isset($_GET['list'])) {
    attendant_json_out([
        'ok' => true,
        'policies' => $store->listPublicPolicies(),
    ]);
}

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') {
    attendant_json_out(['ok' => false, 'error' => 'Missing slug'], 400);
}

$result = $store->getBySlug($slug, [Attendant\CompanyDocumentStore::ACCESS_PUBLIC]);
if (!($result['ok'] ?? false)) {
    $code = (string) ($result['code'] ?? 'not_found');
    attendant_json_out(
        ['ok' => false, 'code' => $code, 'error' => $code === 'forbidden' ? 'Forbidden' : 'Not found'],
        $code === 'forbidden' ? 403 : 404
    );
}

$doc = $result['document'];
attendant_json_out([
    'ok' => true,
    'id' => $doc['id'],
    'title' => $doc['title'],
    'slug' => $doc['slug'],
    'route' => $doc['public_route'],
    'markdown' => $doc['markdown'],
]);
