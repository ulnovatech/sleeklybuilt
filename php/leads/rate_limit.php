<?php
/**
 * Lightweight IP rate limiter for public lead forms.
 */

/**
 * Non-exiting check for internal callers (attendant tools).
 */
function uln_rate_limit_allows(string $bucket, int $maxAttempts = 12, int $windowSeconds = 3600): bool
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'sleeklybuilt_rate';

    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $file = $dir . DIRECTORY_SEPARATOR . md5($bucket . '|' . $ip) . '.json';
    $now = time();
    $data = ['count' => 0, 'reset' => $now + $windowSeconds];

    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded)) {
            $data = $decoded;
            if ($now > (int) ($data['reset'] ?? 0)) {
                $data = ['count' => 0, 'reset' => $now + $windowSeconds];
            }
        }
    }

    if ((int) $data['count'] >= $maxAttempts) {
        return false;
    }

    $data['count'] = (int) $data['count'] + 1;
    @file_put_contents($file, json_encode($data));
    return true;
}

function uln_rate_limit(string $bucket, int $maxAttempts = 12, int $windowSeconds = 3600): void
{
    if (!uln_rate_limit_allows($bucket, $maxAttempts, $windowSeconds)) {
        http_response_code(429);
        echo json_encode([
            'status' => 'error',
            'message' => 'Too many submissions from your network. Please try again later.',
        ]);
        exit;
    }
}
