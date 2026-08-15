<?php

declare(strict_types=1);

/**
 * Minimal assertion helpers for attendant Layer A tests.
 */

final class AttendantTest
{
    private static int $passed = 0;
    private static int $failed = 0;
    private static int $skipped = 0;

    /** @var list<string> */
    private static array $failures = [];

    public static function assertTrue(bool $cond, string $label): void
    {
        if ($cond) {
            self::$passed++;
            fwrite(STDOUT, "  OK  {$label}\n");
            return;
        }
        self::$failed++;
        self::$failures[] = $label;
        fwrite(STDOUT, "  FAIL {$label}\n");
    }

    public static function assertSame(mixed $expected, mixed $actual, string $label): void
    {
        self::assertTrue($expected === $actual, $label . ' (expected ' . self::export($expected) . ', got ' . self::export($actual) . ')');
    }

    public static function assertContains(string $needle, string $haystack, string $label): void
    {
        self::assertTrue(str_contains($haystack, $needle), $label);
    }

    public static function skip(string $label): void
    {
        self::$skipped++;
        fwrite(STDOUT, "  SKIP {$label}\n");
    }

    public static function summary(): int
    {
        fwrite(STDOUT, "\nPassed: " . self::$passed . '  Failed: ' . self::$failed . '  Skipped: ' . self::$skipped . "\n");
        if (self::$failed > 0) {
            fwrite(STDERR, "Failures:\n- " . implode("\n- ", self::$failures) . "\n");
            return 1;
        }
        return 0;
    }

    private static function export(mixed $value): string
    {
        if (is_string($value)) {
            return json_encode($value) ?: '""';
        }
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }
        if ($value === null) {
            return 'null';
        }
        $json = json_encode($value);
        return $json === false ? gettype($value) : $json;
    }
}
