<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

final class TemplateScrubber
{
    private const SELLER_URL_PATTERN =
        '~webocean|webflow\.com/(?:templates|dashboard|made-in-webflow)|' .
        'fiverr\.com/|themeforest\.net|buywebflowtemplate~i';

    /**
     * @return array{
     *   html_files:int,
     *   seller_nodes_removed:int,
     *   seller_links_neutralized:int,
     *   seller_scripts_removed:int,
     *   cta_scripts_injected:int
     * }
     */
    public function scrubDirectory(string $directory): array
    {
        if (!is_dir($directory)) {
            throw new RuntimeException('Template scrub directory does not exist.');
        }

        $stats = [
            'html_files' => 0,
            'seller_nodes_removed' => 0,
            'seller_links_neutralized' => 0,
            'seller_scripts_removed' => 0,
            'cta_scripts_injected' => 0,
        ];

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if (!$file->isFile() || strtolower($file->getExtension()) !== 'html') {
                continue;
            }

            $fileStats = $this->scrubFile($file->getPathname());
            $stats['html_files']++;
            foreach ($fileStats as $key => $value) {
                $stats[$key] += $value;
            }
        }

        if ($stats['html_files'] < 1) {
            throw new RuntimeException('No HTML files were available to scrub.');
        }

        return $stats;
    }

    /**
     * @return array{
     *   seller_nodes_removed:int,
     *   seller_links_neutralized:int,
     *   seller_scripts_removed:int,
     *   cta_scripts_injected:int
     * }
     */
    private function scrubFile(string $path): array
    {
        $html = file_get_contents($path);
        if (!is_string($html) || trim($html) === '') {
            throw new RuntimeException("Unable to read HTML page: {$path}");
        }

        $previousLibxmlState = libxml_use_internal_errors(true);
        $document = new DOMDocument('1.0', 'UTF-8');
        $loaded = $document->loadHTML(
            '<?xml encoding="UTF-8">' . $html,
            LIBXML_NONET | LIBXML_COMPACT
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previousLibxmlState);

        if (!$loaded) {
            throw new RuntimeException("Unable to parse HTML page: {$path}");
        }

        $xpath = new DOMXPath($document);
        $stats = [
            'seller_nodes_removed' => 0,
            'seller_links_neutralized' => 0,
            'seller_scripts_removed' => 0,
            'cta_scripts_injected' => 0,
        ];

        $sellerNodes = [];
        foreach ($xpath->query('//*[@class]') ?: [] as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }
            $classes = preg_split('/\s+/', trim($node->getAttribute('class'))) ?: [];
            foreach ($classes as $class) {
                if ($class === 'w-webflow-badge' || str_starts_with($class, 'hireus-')) {
                    $sellerNodes[] = $node;
                    break;
                }
            }
        }
        foreach ($sellerNodes as $node) {
            if ($node->parentNode !== null) {
                $node->parentNode->removeChild($node);
                $stats['seller_nodes_removed']++;
            }
        }

        foreach ($xpath->query('//a[@href]') ?: [] as $link) {
            if (!$link instanceof DOMElement || $link->parentNode === null) {
                continue;
            }
            $href = $link->getAttribute('href');
            $attribution = $this->attributionContainer($link);
            if (!$this->isSellerReference($href) && $attribution === null) {
                continue;
            }
            if ($attribution !== null && $attribution->parentNode !== null) {
                $attribution->parentNode->removeChild($attribution);
                $stats['seller_nodes_removed']++;
            } elseif ($link->parentNode !== null) {
                $link->parentNode->removeChild($link);
                $stats['seller_links_neutralized']++;
            }
        }

        $scriptsToRemove = [];
        foreach ($xpath->query('//script') ?: [] as $script) {
            if (!$script instanceof DOMElement || $script->parentNode === null) {
                continue;
            }
            $source = $script->getAttribute('src');
            $content = $script->textContent;
            if (
                $this->isSellerReference($source) ||
                $this->isSellerReference($content) ||
                stripos($content, 'hireus-') !== false
            ) {
                $scriptsToRemove[] = $script;
            }
        }
        foreach ($scriptsToRemove as $script) {
            if ($script->parentNode !== null) {
                $script->parentNode->removeChild($script);
                $stats['seller_scripts_removed']++;
            }
        }

        $existingCtaScripts = [];
        foreach ($xpath->query('//script[@src]') ?: [] as $script) {
            if (
                $script instanceof DOMElement &&
                preg_match('~(?:^|/)cta\.js(?:[?#].*)?$~i', $script->getAttribute('src')) === 1
            ) {
                $existingCtaScripts[] = $script;
            }
        }
        foreach ($existingCtaScripts as $script) {
            if ($script->parentNode !== null) {
                $script->parentNode->removeChild($script);
            }
        }

        $body = $document->getElementsByTagName('body')->item(0);
        if (!$body instanceof DOMElement) {
            throw new RuntimeException("HTML page has no body element: {$path}");
        }
        $cta = $document->createElement('script');
        $cta->setAttribute('src', TemplateImportPolicy::CTA_PUBLIC_PATH);
        $cta->setAttribute('defer', 'defer');
        $body->appendChild($cta);
        $stats['cta_scripts_injected'] = 1;

        $this->assertCleanDocument($document, $xpath, $path);

        $output = $document->saveHTML();
        if (!is_string($output) || $output === '') {
            throw new RuntimeException("Unable to serialize HTML page: {$path}");
        }
        $output = preg_replace('/^<\?xml encoding="UTF-8"\?>\s*/', '', $output) ?? $output;

        $temporary = $path . '.uln-tmp-' . bin2hex(random_bytes(4));
        if (file_put_contents($temporary, $output, LOCK_EX) === false) {
            throw new RuntimeException("Unable to write scrubbed HTML page: {$path}");
        }
        if (!rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException("Unable to replace scrubbed HTML page: {$path}");
        }

        return $stats;
    }

    private function assertCleanDocument(
        DOMDocument $document,
        DOMXPath $xpath,
        string $path
    ): void {
        foreach ($xpath->query('//*[@class]') ?: [] as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }
            $classes = preg_split('/\s+/', trim($node->getAttribute('class'))) ?: [];
            foreach ($classes as $class) {
                if ($class === 'w-webflow-badge' || str_starts_with($class, 'hireus-')) {
                    throw new RuntimeException("Seller markup remains after scrub: {$path}");
                }
            }
        }

        foreach ($xpath->query('//*[@href or @src]') ?: [] as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }
            if (
                $this->isSellerReference($node->getAttribute('href')) ||
                $this->isSellerReference($node->getAttribute('src'))
            ) {
                throw new RuntimeException("Seller URL remains after scrub: {$path}");
            }
        }

        $visibleText = preg_replace('/\s+/', ' ', $document->textContent) ?? '';
        if (
            stripos($visibleText, 'WebOcean') !== false ||
            stripos($visibleText, 'Purchase Website') !== false ||
            stripos($visibleText, 'transform this example Website') !== false
        ) {
            throw new RuntimeException("Seller promotion text remains after scrub: {$path}");
        }

        $ctaCount = 0;
        foreach ($xpath->query('//script[@src]') ?: [] as $script) {
            if (
                $script instanceof DOMElement &&
                $script->getAttribute('src') === TemplateImportPolicy::CTA_PUBLIC_PATH
            ) {
                $ctaCount++;
            }
        }
        if ($ctaCount !== 1) {
            throw new RuntimeException("CTA injection validation failed: {$path}");
        }
    }

    private function isSellerReference(string $value): bool
    {
        return $value !== '' && preg_match(self::SELLER_URL_PATTERN, $value) === 1;
    }

    private function attributionContainer(DOMElement $link): ?DOMElement
    {
        $href = $link->getAttribute('href');
        $isWebflowHome = preg_match(
            '~^https?://(?:www\.)?webflow\.com/?(?:[?#].*)?$~i',
            $href
        ) === 1;
        if (!$this->isSellerReference($href) && !$isWebflowHome) {
            return null;
        }

        $node = $link->parentNode;
        for ($level = 0; $level < 3 && $node instanceof DOMElement; $level++) {
            if (strtolower($node->tagName) === 'body') {
                break;
            }
            $text = trim(preg_replace('/\s+/', ' ', $node->textContent) ?? '');
            if (
                mb_strlen($text) <= 200 &&
                preg_match('~\b(?:designed|powered|created|template)\s+by\b~i', $text) === 1
            ) {
                return $node;
            }
            $node = $node->parentNode;
        }

        return null;
    }
}
