<?php
/**
 * Resolve Google service-account JSON for GA4 Data API and FCM.
 * Production: bind-mounted at /var/www/secrets/service-account.json (survives public_html rsync --delete).
 */
function sleeklybuilt_google_credentials_path(): ?string
{
    $candidates = [];
    foreach (['GA_CREDENTIALS_PATH', 'FCM_CREDENTIALS_PATH', 'GOOGLE_APPLICATION_CREDENTIALS'] as $key) {
        $value = trim((string) getenv($key));
        if ($value !== '') {
            $candidates[] = $value;
        }
    }
    $candidates[] = '/var/www/secrets/service-account.json';
    $candidates[] = '/opt/sleeklybuilt/secrets/service-account.json';
    $candidates[] = dirname(__DIR__) . '/service-account.json';

    foreach ($candidates as $path) {
        $resolved = sleeklybuilt_resolve_credentials_file($path);
        if ($resolved !== null) {
            return $resolved;
        }
    }
    return null;
}

function sleeklybuilt_resolve_credentials_file(string $path): ?string
{
    $path = trim($path);
    if ($path === '') {
        return null;
    }
    if (!preg_match('#^(/|[A-Za-z]:[\\\\/])#', $path)) {
        $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path), '/\\');
    }
    return is_file($path) ? $path : null;
}
