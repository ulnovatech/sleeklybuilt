<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

final class TemplatePublishValidator
{
    private const SELLER_PATTERN =
        '~hireus-|webocean|webflow\.com/(?:templates|dashboard|made-in-webflow)|' .
        'purchase\s+website|transform\s+this\s+example\s+website~i';

    /**
     * @return array{html_files:int,files:int,bytes:int,remote_assets:array<int,string>}
     */
    public function validate(string $siteDirectory): array
    {
        if (!is_dir($siteDirectory) || is_link($siteDirectory)) {
            throw new RuntimeException('Staged template site is not a valid directory.', 422);
        }
        if (!is_file($siteDirectory . DIRECTORY_SEPARATOR . 'index.html')) {
            throw new RuntimeException('Staged template has no index.html.', 422);
        }

        $htmlFiles = 0;
        $files = 0;
        $bytes = 0;
        $remoteAssets = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($siteDirectory, FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isLink()) {
                throw new RuntimeException('Staged template contains a symbolic link.', 422);
            }
            if (!$file->isFile()) {
                continue;
            }

            $files++;
            $bytes += $file->getSize();
            if (strtolower($file->getExtension()) !== 'html') {
                continue;
            }

            $htmlFiles++;
            foreach ($this->validateHtml($file->getPathname()) as $url) {
                $remoteAssets[$url] = true;
            }
        }

        if ($htmlFiles < 1) {
            throw new RuntimeException('Staged template contains no HTML files.', 422);
        }

        return [
            'html_files' => $htmlFiles,
            'files' => $files,
            'bytes' => $bytes,
            'remote_assets' => array_keys($remoteAssets),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function validateHtml(string $path): array
    {
        $html = file_get_contents($path);
        if (!is_string($html) || trim($html) === '') {
            throw new RuntimeException("Unable to read staged HTML: {$path}", 422);
        }
        if (preg_match(self::SELLER_PATTERN, $html) === 1) {
            throw new RuntimeException("Seller promotion remains in staged HTML: {$path}", 422);
        }

        $previousLibxmlState = libxml_use_internal_errors(true);
        $document = new DOMDocument('1.0', 'UTF-8');
        $loaded = $document->loadHTML($html, LIBXML_NONET | LIBXML_COMPACT);
        libxml_clear_errors();
        libxml_use_internal_errors($previousLibxmlState);
        if (!$loaded) {
            throw new RuntimeException("Unable to parse staged HTML: {$path}", 422);
        }

        $ctaCount = 0;
        foreach ($document->getElementsByTagName('script') as $script) {
            if (
                $script instanceof DOMElement &&
                $script->getAttribute('src') === TemplateImportPolicy::CTA_PUBLIC_PATH
            ) {
                $ctaCount++;
            }
        }
        if ($ctaCount !== 1) {
            throw new RuntimeException(
                "Staged HTML must contain exactly one absolute UlnovaTech CTA: {$path}",
                422
            );
        }

        $assets = [];
        foreach ($document->getElementsByTagName('*') as $element) {
            if (!$element instanceof DOMElement) {
                continue;
            }
            foreach (['src', 'poster'] as $attribute) {
                $this->collectRemoteUrl($element->getAttribute($attribute), $assets);
            }
            if ($element->hasAttribute('srcset')) {
                foreach (explode(',', $element->getAttribute('srcset')) as $candidate) {
                    $url = preg_split('/\s+/', trim($candidate))[0] ?? '';
                    $this->collectRemoteUrl($url, $assets);
                }
            }
            if (
                strtolower($element->tagName) === 'link' &&
                preg_match(
                    '~\b(?:stylesheet|icon|preload|modulepreload)\b~i',
                    $element->getAttribute('rel')
                ) === 1
            ) {
                $this->collectRemoteUrl($element->getAttribute('href'), $assets);
            }
        }

        return array_keys($assets);
    }

    /**
     * @param array<string, true> $assets
     */
    private function collectRemoteUrl(string $url, array &$assets): void
    {
        if (preg_match('~^https://~i', $url) === 1) {
            $assets[$url] = true;
        }
    }
}
