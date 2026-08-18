<?php

declare(strict_types=1);

/**
 * Pick gallery screenshots: homepage + a small set of main nav pages only.
 */
final class TemplateScreenshotPageSelector
{
    /** Homepage + inner pages (gallery thumbnails slice is 6). */
    public const MAX_PAGES = 6;

    private const SKIP_DIR_PREFIXES = [
        'template-info/',
        'product/',
        'products/',
        'post/',
        'posts/',
        'blogs/',
        'blog-posts/',
        'projects/',
        'project/',
        'services/',
        'service/',
        'class/',
        'classes/',
        'category/',
        'categories/',
        'blog-categories/',
        'blogcategory/',
        'authors/',
        'author/',
        'tag/',
        'tags/',
        'cart/',
        'checkout/',
        'order/',
        'orders/',
        'search/',
        'utility/',
        'detail/',
        'details/',
    ];

    private const SKIP_BASENAMES = [
        '401.html',
        '404.html',
        '500.html',
        'checkout.html',
        'cart.html',
        'order.html',
        'orders.html',
        'signin.html',
        'sign-in.html',
        'signup.html',
        'sign-up.html',
        'login.html',
        'register.html',
        'reset-password.html',
        'reset_password.html',
        'forgot-password.html',
        'password.html',
        'protected.html',
        'protected-page.html',
        'license.html',
        'licenses.html',
        'licensing.html',
        'changelog.html',
        'change-log.html',
        'styleguide.html',
        'style-guide.html',
        'instructions.html',
        'cookie-policy.html',
        'privacy-policy.html',
        'privacy.html',
        'terms.html',
        'terms-of-service.html',
        'terms-of-use.html',
        'search.html',
        'coming-soon.html',
        'password-protected.html',
    ];

    private const PREFERRED_BASENAMES = [
        'about.html' => 100,
        'about-us.html' => 99,
        'about-1.html' => 98,
        'about-2.html' => 97,
        'services.html' => 95,
        'service.html' => 94,
        'shop.html' => 93,
        'store.html' => 92,
        'menu.html' => 91,
        'menu-1.html' => 90,
        'menu-2.html' => 89,
        'contact.html' => 88,
        'contact-us.html' => 87,
        'contact-1.html' => 86,
        'contact-2.html' => 85,
        'gallery.html' => 84,
        'portfolio.html' => 83,
        'blog.html' => 82,
        'news.html' => 81,
        'team.html' => 80,
        'projects.html' => 79,
        'work.html' => 78,
        'classes.html' => 77,
        'pricing.html' => 76,
        'price.html' => 75,
        'faq.html' => 74,
        'reservation.html' => 73,
        'book-a-table.html' => 72,
        'booking.html' => 71,
        'home-2.html' => 60,
        'home-3.html' => 59,
        'home2.html' => 58,
        'ecommerce-menu.html' => 50,
    ];

    /**
     * @return list<array{path:string,filename:string,label:string}>
     */
    public function select(string $siteRoot): array
    {
        $siteRoot = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $siteRoot), DIRECTORY_SEPARATOR);
        $index = $siteRoot . DIRECTORY_SEPARATOR . 'index.html';
        if (!is_file($index)) {
            throw new RuntimeException('Published template has no index.html.', 422);
        }

        $pages = [[
            'path' => 'index.html',
            'filename' => 'main.png',
            'label' => 'Home',
        ]];

        $candidates = $this->collectFromHomepage($siteRoot, $index);
        usort($candidates, function (array $a, array $b): int {
            if ($a['score'] !== $b['score']) {
                return $b['score'] <=> $a['score'];
            }
            return strcmp($a['path'], $b['path']);
        });

        $usedNames = ['main.png' => true];
        foreach ($candidates as $candidate) {
            if (count($pages) >= self::MAX_PAGES) {
                break;
            }
            $filename = $candidate['filename'];
            if (isset($usedNames[$filename])) {
                $filename = $this->uniqueFilename($candidate['path'], $usedNames);
            }
            $usedNames[$filename] = true;
            $pages[] = [
                'path' => $candidate['path'],
                'filename' => $filename,
                'label' => $candidate['label'],
            ];
        }

        return $pages;
    }

    public function shouldSkip(string $relativePath): bool
    {
        $relativePath = $this->normalizeRelative($relativePath);
        if ($relativePath === '' || $relativePath === 'index.html') {
            return $relativePath !== 'index.html';
        }

        if (str_contains($relativePath, '@')) {
            return true;
        }

        $lower = strtolower($relativePath);
        foreach (self::SKIP_DIR_PREFIXES as $prefix) {
            if (str_starts_with($lower, $prefix)) {
                return true;
            }
        }

        $base = basename($lower);
        if (in_array($base, self::SKIP_BASENAMES, true)) {
            return true;
        }

        foreach ([
            'license', 'licensing', 'changelog', 'change-log', 'styleguide', 'style-guide',
            'privacy-policy', 'cookie-policy', 'terms-of', 'trems-', 'signin', 'sign-in',
            'signup', 'sign-up', 'reset-password', 'reset_password', 'protected',
            '401', '404', 'checkout', 'cart',
        ] as $needle) {
            if (str_contains($base, $needle)) {
                return true;
            }
        }
        if (preg_match('/\A(privacy|terms|cookies?|legal)\.html\z/', $base) === 1) {
            return true;
        }

        // Nested CMS-style pages beyond one segment of marketing folders.
        $segments = explode('/', $lower);
        if (count($segments) > 2) {
            return true;
        }
        if (count($segments) === 2) {
            $dir = $segments[0];
            $allowedDirs = ['about', 'contact', 'services', 'menu', 'blog', 'shop', 'gallery', 'team'];
            if (!in_array($dir, $allowedDirs, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return list<array{path:string,filename:string,label:string,score:int}>
     */
    private function collectFromHomepage(string $siteRoot, string $indexPath): array
    {
        $html = file_get_contents($indexPath);
        if (!is_string($html) || $html === '') {
            return [];
        }

        $hrefs = [];
        if (preg_match_all('/\bhref\s*=\s*(["\'])(.*?)\1/i', $html, $matches)) {
            foreach ($matches[2] as $href) {
                $hrefs[] = html_entity_decode(trim((string) $href), ENT_QUOTES | ENT_HTML5);
            }
        }

        $seen = [];
        $out = [];
        foreach ($hrefs as $href) {
            $relative = $this->resolveInternalHtml($href);
            if ($relative === null || $relative === 'index.html' || isset($seen[$relative])) {
                continue;
            }
            if ($this->shouldSkip($relative)) {
                continue;
            }
            $absolute = $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
            if (!is_file($absolute)) {
                continue;
            }
            $seen[$relative] = true;
            $base = strtolower(basename($relative));
            $score = self::PREFERRED_BASENAMES[$base] ?? $this->fallbackScore($relative);
            $out[] = [
                'path' => $relative,
                'filename' => $this->filenameFor($relative),
                'label' => $this->labelFor($relative),
                'score' => $score,
            ];
        }

        return $out;
    }

    private function resolveInternalHtml(string $href): ?string
    {
        if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, 'mailto:')
            || str_starts_with($href, 'tel:') || str_starts_with($href, 'javascript:')
            || str_starts_with($href, 'data:')) {
            return null;
        }

        if (preg_match('#^https?://#i', $href) === 1) {
            return null;
        }

        $path = parse_url($href, PHP_URL_PATH);
        if (!is_string($path) || $path === '') {
            $path = explode('#', explode('?', $href)[0])[0];
        }
        $path = rawurldecode($path);
        $path = str_replace('\\', '/', $path);
        $path = ltrim($path, '/');
        if ($path === '' || str_contains($path, '..')) {
            return null;
        }
        if (str_ends_with($path, '/')) {
            $path .= 'index.html';
        }
        if (!str_ends_with(strtolower($path), '.html') && !str_ends_with(strtolower($path), '.htm')) {
            // Relative pretty paths often omit .html in Webflow exports.
            if (!str_contains(basename($path), '.')) {
                $path .= '.html';
            } else {
                return null;
            }
        }

        return $this->normalizeRelative($path);
    }

    private function normalizeRelative(string $path): string
    {
        $path = str_replace('\\', '/', trim($path));
        $path = ltrim($path, '/');
        $parts = [];
        foreach (explode('/', $path) as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }
            if ($segment === '..') {
                return '';
            }
            $parts[] = $segment;
        }
        return implode('/', $parts);
    }

    private function filenameFor(string $relative): string
    {
        $base = pathinfo(basename($relative), PATHINFO_FILENAME);
        $slug = strtolower((string) preg_replace('/[^a-z0-9]+/i', '_', $base));
        $slug = trim($slug, '_');
        if ($slug === '' || $slug === 'index') {
            $slug = 'page';
        }
        return $slug . '.png';
    }

    private function labelFor(string $relative): string
    {
        $base = pathinfo(basename($relative), PATHINFO_FILENAME);
        $label = str_replace(['-', '_'], ' ', $base);
        return ucwords(trim($label));
    }

    private function fallbackScore(string $relative): int
    {
        $depth = substr_count($relative, '/');
        return 40 - ($depth * 10);
    }

    /**
     * @param array<string,bool> $usedNames
     */
    private function uniqueFilename(string $relative, array $usedNames): string
    {
        $base = $this->filenameFor($relative);
        if (!isset($usedNames[$base])) {
            return $base;
        }
        $stem = pathinfo($base, PATHINFO_FILENAME);
        $n = 2;
        while (isset($usedNames[$stem . '_' . $n . '.png'])) {
            $n++;
        }
        return $stem . '_' . $n . '.png';
    }
}
