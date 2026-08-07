<?php

declare(strict_types=1);

/**
 * Stable contracts shared by the template-import API and CLI worker.
 *
 * Network resolution and private-address rejection belong to the acquisition
 * layer. This policy intentionally validates only the immutable source and
 * filesystem rules agreed for the importer.
 */
final class TemplateImportPolicy
{
    public const STATES = [
        'queued',
        'running',
        'scrubbing',
        'validating',
        'ready',
        'published',
        'rolled_back',
        'failed',
        'discarded',
    ];

    public const TERMINAL_STATES = [
        'published',
        'rolled_back',
        'failed',
        'discarded',
    ];

    public const CTA_PUBLIC_PATH = '/portfolio/portfolio/cta.js';

    /** Product-line collections (distinct from industry `category`). */
    public const COLLECTIONS = [
        'websites',
        'sleek-pages',
    ];

    public const DEFAULT_COLLECTION = 'websites';

    /**
     * Normalize and validate a product-line collection id.
     *
     * @throws InvalidArgumentException when the value is present but invalid
     */
    public static function normalizeCollection(mixed $value, bool $required = true): string
    {
        $collection = strtolower(trim((string) ($value ?? '')));
        if ($collection === '') {
            if ($required) {
                throw new InvalidArgumentException(
                    'Collection is required. Use websites or sleek-pages.',
                    422
                );
            }

            return self::DEFAULT_COLLECTION;
        }

        if (!in_array($collection, self::COLLECTIONS, true)) {
            throw new InvalidArgumentException(
                'Collection must be one of: ' . implode(', ', self::COLLECTIONS) . '.',
                422
            );
        }

        return $collection;
    }

    public static function isKnownCollection(string $collection): bool
    {
        return in_array(strtolower(trim($collection)), self::COLLECTIONS, true);
    }

    public static function projectRoot(): string
    {
        $path = realpath(__DIR__ . '/../../..');

        if ($path === false) {
            throw new RuntimeException('Unable to resolve the UlnovaTech project root.');
        }

        return $path;
    }

    public static function portfolioDirectory(): string
    {
        return self::resolveExistingPath(
            self::projectRoot() . '/portfolio/portfolio',
            'portfolio directory'
        );
    }

    public static function catalogPath(): string
    {
        return self::resolveExistingPath(
            self::portfolioDirectory() . '/catalog.json',
            'template catalog'
        );
    }

    public static function stagingRoot(): string
    {
        $configured = trim((string) getenv('TEMPLATE_IMPORT_STAGING_DIR'));

        return $configured !== ''
            ? rtrim($configured, '/\\')
            : rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'ulnovatech-template-imports';
    }

    public static function logDirectory(): string
    {
        $configured = trim((string) getenv('TEMPLATE_IMPORT_LOG_DIR'));

        return $configured !== ''
            ? rtrim($configured, '/\\')
            : self::stagingRoot() . DIRECTORY_SEPARATOR . 'worker-logs';
    }

    public static function profileRoot(): string
    {
        $configured = trim((string) getenv('TEMPLATE_PROFILE_DIR'));

        return $configured !== ''
            ? rtrim($configured, '/\\')
            : self::stagingRoot() . DIRECTORY_SEPARATOR . 'template-profiles';
    }

    public static function isKnownState(string $state): bool
    {
        return in_array($state, self::STATES, true);
    }

    public static function isTerminalState(string $state): bool
    {
        return in_array($state, self::TERMINAL_STATES, true);
    }

    /**
     * Return the canonical folder ID for an allowed source URL.
     *
     * The full Webflow hostname is the stable ID, matching the existing
     * catalog convention (for example, willey-fragrance.webflow.io).
     */
    public static function folderIdFromSourceUrl(string $sourceUrl): ?string
    {
        $sourceUrl = trim($sourceUrl);
        if ($sourceUrl === '' || filter_var($sourceUrl, FILTER_VALIDATE_URL) === false) {
            return null;
        }

        $parts = parse_url($sourceUrl);
        if (!is_array($parts)) {
            return null;
        }

        if (strtolower((string) ($parts['scheme'] ?? '')) !== 'https') {
            return null;
        }

        if (isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) {
            return null;
        }

        $host = strtolower(rtrim((string) ($parts['host'] ?? ''), '.'));
        if (!self::isAllowedSourceHost($host)) {
            return null;
        }

        return $host;
    }

    public static function isAllowedSourceHost(string $host): bool
    {
        $host = strtolower(rtrim(trim($host), '.'));

        return preg_match(
            '/\A(?=.{1,253}\z)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+webflow\.io\z/D',
            $host
        ) === 1;
    }

    private static function resolveExistingPath(string $path, string $label): string
    {
        $resolved = realpath($path);
        if ($resolved === false) {
            throw new RuntimeException("Unable to resolve the canonical {$label}.");
        }

        return $resolved;
    }
}
