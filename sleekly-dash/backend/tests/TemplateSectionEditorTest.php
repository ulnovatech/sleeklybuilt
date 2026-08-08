<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/TemplateSectionEditor.php';

$slug = 'section-editor-' . bin2hex(random_bytes(5)) . '.webflow.io';
$templateDirectory = TemplateImportPolicy::portfolioDirectory() . DIRECTORY_SEPARATOR . $slug;
$profileRoot = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'uln-section-test-' . bin2hex(random_bytes(6));
$previousProfileRoot = getenv('TEMPLATE_PROFILE_DIR');
$original = <<<'HTML'
<!doctype html>
<html>
<head><title>Section editor fixture</title></head>
<body>
  <section class="hero-section">
    <h1 class="hero-heading">Original headline</h1>
    <p class="hero-copy">Original supporting copy.</p>
    <img class="hero-image" src="https://cdn.prod.website-files.com/original.webp" alt="Original image">
    <a class="hero-link" href="/contact">Learn more</a>
  </section>
  <footer class="footer-section"><p>Original footer</p></footer>
  <script src="/portfolio/portfolio/cta.js" defer></script>
</body>
</html>
HTML;

putenv('TEMPLATE_PROFILE_DIR=' . $profileRoot);
try {
    if (!mkdir($templateDirectory, 0755)) {
        throw new RuntimeException('Unable to create the section editor fixture.');
    }
    file_put_contents($templateDirectory . DIRECTORY_SEPARATOR . 'index.html', $original);

    $editor = new TemplateSectionEditor();
    $profile = $editor->inventory($slug);
    if ($profile['totals']['sections'] < 2 || $profile['totals']['fields'] < 5) {
        throw new RuntimeException('Section extraction did not find the fixture fields.');
    }

    $fields = [];
    foreach ($profile['sections'] as $section) {
        foreach ($section['fields'] as $field) {
            $fields[$field['kind']][] = $field;
        }
    }
    $headline = array_values(array_filter(
        $fields['text'] ?? [],
        static fn (array $field): bool => $field['value'] === 'Original headline'
    ))[0] ?? null;
    $image = $fields['image_url'][0] ?? null;
    $link = $fields['link'][0] ?? null;
    if (!is_array($headline) || !is_array($image) || !is_array($link)) {
        throw new RuntimeException('Expected editable field kinds were not extracted.');
    }
    try {
        $editor->createDraft($slug, 'section-test', [
            'fingerprint' => $profile['fingerprint'],
            'edits' => [
                ['field_id' => $link['id'], 'value' => 'javascript:alert(1)'],
            ],
        ]);
        throw new RuntimeException('Unsafe section link unexpectedly passed validation.');
    } catch (InvalidArgumentException $e) {
        if ($e->getCode() !== 422) {
            throw $e;
        }
    }

    $draft = $editor->createDraft($slug, 'section-test', [
        'fingerprint' => $profile['fingerprint'],
        'edits' => [
            ['field_id' => $headline['id'], 'value' => 'A new production headline'],
            [
                'field_id' => $image['id'],
                'value' => 'https://cdn.prod.website-files.com/replacement.webp',
            ],
            ['field_id' => $link['id'], 'value' => '/book-a-call'],
        ],
    ]);
    if ($draft['change_count'] !== 3 || !is_file(
        $editor->draftFile($slug, $draft['token'], '', 'section-test')['path']
    )) {
        throw new RuntimeException('Private content draft was not created.');
    }

    $applied = $editor->applyDraft($slug, $draft['token'], 'section-test');
    if ($applied['status'] !== 'applied' || !$applied['can_rollback']) {
        throw new RuntimeException('Content draft was not applied.');
    }
    $live = (string) file_get_contents($templateDirectory . DIRECTORY_SEPARATOR . 'index.html');
    if (
        !str_contains($live, 'A new production headline') ||
        !str_contains($live, '/book-a-call') ||
        !str_contains($live, 'replacement.webp')
    ) {
        throw new RuntimeException('Applied content is missing expected field changes.');
    }

    $appliedProfile = $editor->inventory($slug);
    $appliedHeadline = null;
    foreach ($appliedProfile['sections'] as $section) {
        foreach ($section['fields'] as $field) {
            if ($field['kind'] === 'text' && $field['value'] === 'A new production headline') {
                $appliedHeadline = $field;
            }
        }
    }
    if (!is_array($appliedHeadline)) {
        throw new RuntimeException('Applied profile did not preserve editable field identity.');
    }
    $staleDraft = $editor->createDraft($slug, 'section-test', [
        'fingerprint' => $appliedProfile['fingerprint'],
        'edits' => [
            ['field_id' => $appliedHeadline['id'], 'value' => 'Stale draft headline'],
        ],
    ]);
    file_put_contents(
        $templateDirectory . DIRECTORY_SEPARATOR . 'index.html',
        $live . PHP_EOL
    );
    try {
        $editor->applyDraft($slug, $staleDraft['token'], 'section-test');
        throw new RuntimeException('Stale section draft unexpectedly overwrote live content.');
    } catch (RuntimeException $e) {
        if ($e->getCode() !== 409) {
            throw $e;
        }
    }
    file_put_contents($templateDirectory . DIRECTORY_SEPARATOR . 'index.html', $live);

    $rolledBack = $editor->rollback($slug);
    $restored = (string) file_get_contents($templateDirectory . DIRECTORY_SEPARATOR . 'index.html');
    if (
        $rolledBack['status'] !== 'rolled_back' ||
        hash('sha256', $restored) !== hash('sha256', $original)
    ) {
        throw new RuntimeException('Content rollback did not restore the exact original HTML.');
    }

    fwrite(STDOUT, "Template section extraction, preview, apply, and rollback passed.\n");
} finally {
    removeSectionTestDirectory($templateDirectory);
    removeSectionTestDirectory($profileRoot);
    if ($previousProfileRoot === false) {
        putenv('TEMPLATE_PROFILE_DIR');
    } else {
        putenv('TEMPLATE_PROFILE_DIR=' . $previousProfileRoot);
    }
}

function removeSectionTestDirectory(string $path): void
{
    if (!is_dir($path)) {
        return;
    }
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($iterator as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            @rmdir($entry->getPathname());
        } else {
            @unlink($entry->getPathname());
        }
    }
    @rmdir($path);
}
