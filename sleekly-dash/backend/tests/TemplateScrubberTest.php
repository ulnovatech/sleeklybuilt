<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/TemplateScrubber.php';

$directory = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'uln-scrubber-' . bin2hex(random_bytes(5));
if (!mkdir($directory, 0700)) {
    throw new RuntimeException('Unable to create scrubber test directory.');
}

$html = <<<'HTML'
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Template</title></head>
<body>
  <main><h1>Keep this content</h1></main>
  <div class="hireus-badge-wrapper">
    <p>We help transform this example Website into your unique brand.</p>
    <a href="https://webocean-agency.webflow.io./">Check Details</a>
    <a href="https://webflow.com/templates/html/example-template">Purchase Website</a>
  </div>
  <a class="w-webflow-badge" href="https://webflow.com/">Made in Webflow</a>
  <footer>
    <div>Designed by <a href="https://webocean.io/">WebOcean</a></div>
    <div>Powered by <a href="https://webflow.com/">Webflow</a></div>
  </footer>
  <script>window.seller = "https://webocean.io/promo";</script>
  <script src="../cta.js" defer></script>
</body>
</html>
HTML;

$path = $directory . DIRECTORY_SEPARATOR . 'index.html';
file_put_contents($path, $html);

try {
    $scrubber = new TemplateScrubber();
    $report = $scrubber->scrubDirectory($directory);
    $clean = (string) file_get_contents($path);

    if (($report['html_files'] ?? 0) !== 1) {
        throw new RuntimeException('Scrubber did not report the HTML file.');
    }
    if (!str_contains($clean, 'Keep this content')) {
        throw new RuntimeException('Scrubber removed legitimate page content.');
    }
    if (
        stripos($clean, 'hireus-') !== false ||
        stripos($clean, 'webocean') !== false ||
        stripos($clean, 'webflow.com/templates') !== false ||
        stripos($clean, 'Powered by') !== false
    ) {
        throw new RuntimeException('Scrubber left seller promotion content behind.');
    }
    if (substr_count($clean, TemplateImportPolicy::CTA_PUBLIC_PATH) !== 1) {
        throw new RuntimeException('Scrubber did not inject exactly one absolute CTA.');
    }
    if (str_contains($clean, '../cta.js')) {
        throw new RuntimeException('Scrubber retained a relative CTA path.');
    }

    fwrite(STDOUT, "TemplateScrubber tests passed.\n");
} finally {
    @unlink($path);
    @rmdir($directory);
}
