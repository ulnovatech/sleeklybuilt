<?php

declare(strict_types=1);

$root = dirname(__DIR__, 2);
$files = array_merge(
    glob($root . '/*.php') ?: [],
    glob($root . '/src/*.php') ?: [],
    glob($root . '/src/Tools/*.php') ?: [],
    glob($root . '/scripts/*.php') ?: []
);
$checked = 0;
foreach ($files as $path) {
    $out = [];
    $code = 0;
    exec('php -l ' . escapeshellarg($path) . ' 2>&1', $out, $code);
    AttendantTest::assertTrue(
        $code === 0,
        'php -l ' . str_replace($root . DIRECTORY_SEPARATOR, '', $path)
    );
    $checked++;
}
AttendantTest::assertTrue($checked >= 20, 'linted attendant PHP files');
