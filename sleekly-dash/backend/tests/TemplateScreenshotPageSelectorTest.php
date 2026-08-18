<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/TemplateScreenshotPageSelector.php';

function assertTrue(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $message);
    }
    echo "OK: {$message}\n";
}

$selector = new TemplateScreenshotPageSelector();

assertTrue($selector->shouldSkip('template-info/license.html'), 'skip template-info');
assertTrue($selector->shouldSkip('product/gift-card.html'), 'skip product detail');
assertTrue($selector->shouldSkip('404.html'), 'skip 404');
assertTrue($selector->shouldSkip('checkout.html'), 'skip checkout');
assertTrue($selector->shouldSkip('signin.html'), 'skip signin');
assertTrue($selector->shouldSkip('style-guide.html'), 'skip style guide');
assertTrue($selector->shouldSkip('blog/my-post.html') || $selector->shouldSkip('post/my-post.html'), 'skip blog post');
assertTrue(!$selector->shouldSkip('about.html'), 'keep about');
assertTrue(!$selector->shouldSkip('contact.html'), 'keep contact');
assertTrue(!$selector->shouldSkip('shop.html'), 'keep shop');
assertTrue(!$selector->shouldSkip('testimonials.html'), 'keep testimonials (not terms)');

$root = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tplshot-' . bin2hex(random_bytes(4));
mkdir($root);
file_put_contents(
    $root . '/index.html',
    <<<'HTML'
<!doctype html><html><body>
<a href="about.html">About</a>
<a href="contact.html">Contact</a>
<a href="shop.html">Shop</a>
<a href="product/sku.html">Product</a>
<a href="404.html">Missing</a>
<a href="template-info/license.html">License</a>
<a href="blog.html">Blog</a>
<a href="menu.html">Menu</a>
<a href="checkout.html">Checkout</a>
<a href="https://example.com">External</a>
</body></html>
HTML
);
foreach (['about.html', 'contact.html', 'shop.html', 'blog.html', 'menu.html', 'product/sku.html', '404.html', 'checkout.html'] as $file) {
    $path = $root . '/' . $file;
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    file_put_contents($path, '<html><title>' . $file . '</title></html>');
}
mkdir($root . '/template-info', 0777, true);
file_put_contents($root . '/template-info/license.html', '<html></html>');

$pages = $selector->select($root);
assertTrue($pages[0]['filename'] === 'main.png', 'first page is main.png');
assertTrue(count($pages) <= TemplateScreenshotPageSelector::MAX_PAGES, 'respects max pages');
$paths = array_column($pages, 'path');
assertTrue(in_array('about.html', $paths, true), 'includes about');
assertTrue(!in_array('product/sku.html', $paths, true), 'excludes product detail');
assertTrue(!in_array('404.html', $paths, true), 'excludes 404');
assertTrue(!in_array('checkout.html', $paths, true), 'excludes checkout');

// Cleanup
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
);
foreach ($iterator as $file) {
    $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
}
rmdir($root);

echo "TemplateScreenshotPageSelector tests passed.\n";
