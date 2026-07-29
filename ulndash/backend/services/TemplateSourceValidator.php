<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

final class TemplateSourceValidator
{
    private const MAX_REDIRECTS = 5;
    private const REQUEST_TIMEOUT_SECONDS = 20;

    /**
     * @return array{final_url:string,source_host:string,redirects:array<int,string>,resolved_ips:array<int,string>}
     */
    public function validate(string $sourceUrl): array
    {
        if (!extension_loaded('curl')) {
            throw new RuntimeException('PHP cURL is required for template source validation.');
        }

        $sourceHost = TemplateImportPolicy::folderIdFromSourceUrl($sourceUrl);
        if ($sourceHost === null) {
            throw new InvalidArgumentException(
                'Source URL must be HTTPS on a valid *.webflow.io hostname.',
                422
            );
        }

        $currentUrl = $sourceUrl;
        $redirects = [];
        $allIps = [];

        for ($attempt = 0; $attempt <= self::MAX_REDIRECTS; $attempt++) {
            $currentHost = TemplateImportPolicy::folderIdFromSourceUrl($currentUrl);
            if ($currentHost === null || !hash_equals($sourceHost, $currentHost)) {
                throw new RuntimeException(
                    'Template source redirected outside its original Webflow hostname.',
                    422
                );
            }

            $ips = $this->resolvePublicAddresses($currentHost);
            $allIps = array_values(array_unique(array_merge($allIps, $ips)));
            $response = $this->head($currentUrl, $currentHost, $ips);

            if ($response['status'] >= 300 && $response['status'] < 400) {
                if ($response['location'] === null) {
                    throw new RuntimeException(
                        "Template source returned HTTP {$response['status']} without a redirect location.",
                        422
                    );
                }
                if ($attempt === self::MAX_REDIRECTS) {
                    throw new RuntimeException('Template source exceeded the redirect limit.', 422);
                }

                $currentUrl = $this->resolveRedirectUrl($currentUrl, $response['location']);
                $redirects[] = $currentUrl;
                continue;
            }

            if ($response['status'] < 200 || $response['status'] >= 300) {
                throw new RuntimeException(
                    "Template source is unavailable (HTTP {$response['status']}).",
                    422
                );
            }

            return [
                'final_url' => $currentUrl,
                'source_host' => $sourceHost,
                'redirects' => $redirects,
                'resolved_ips' => $allIps,
            ];
        }

        throw new RuntimeException('Template source validation did not complete.');
    }

    /**
     * @return array<int, string>
     */
    private function resolvePublicAddresses(string $host): array
    {
        $records = dns_get_record($host, DNS_A | DNS_AAAA);
        $ips = [];

        if (is_array($records)) {
            foreach ($records as $record) {
                $ip = $record['ip'] ?? $record['ipv6'] ?? null;
                if (is_string($ip) && $ip !== '') {
                    $ips[] = $ip;
                }
            }
        }

        if ($ips === []) {
            $ipv4 = gethostbynamel($host);
            if (is_array($ipv4)) {
                $ips = $ipv4;
            }
        }

        $ips = array_values(array_unique($ips));
        if ($ips === []) {
            throw new RuntimeException('Template source hostname did not resolve.', 422);
        }

        foreach ($ips as $ip) {
            if (
                filter_var(
                    $ip,
                    FILTER_VALIDATE_IP,
                    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
                ) === false
            ) {
                throw new RuntimeException(
                    'Template source resolved to a private or reserved address.',
                    422
                );
            }
        }

        return $ips;
    }

    /**
     * @param array<int, string> $ips
     * @return array{status:int,location:?string}
     */
    private function head(string $url, string $host, array $ips): array
    {
        $headers = [];
        $curl = curl_init();
        if ($curl === false) {
            throw new RuntimeException('Unable to initialize source validation.');
        }

        $pinIp = current(array_filter(
            $ips,
            static fn (string $ip): bool => !str_contains($ip, ':')
        ));
        if (!is_string($pinIp) || $pinIp === '') {
            $pinIp = $ips[0];
        }
        $resolve = [
            sprintf(
                '%s:443:%s',
                $host,
                str_contains($pinIp, ':') ? '[' . $pinIp . ']' : $pinIp
            ),
        ];

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_NOBODY => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => self::REQUEST_TIMEOUT_SECONDS,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_USERAGENT => 'UlnovaTech-Template-Importer/1.0',
            CURLOPT_RESOLVE => $resolve,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_HEADERFUNCTION => static function ($handle, string $line) use (&$headers): int {
                $length = strlen($line);
                $separator = strpos($line, ':');
                if ($separator !== false) {
                    $name = strtolower(trim(substr($line, 0, $separator)));
                    $headers[$name] = trim(substr($line, $separator + 1));
                }
                return $length;
            },
        ]);

        $ok = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if ($ok === false) {
            throw new RuntimeException(
                'Template source validation failed: ' . ($error !== '' ? $error : 'network error'),
                422
            );
        }

        return [
            'status' => $status,
            'location' => isset($headers['location']) ? (string) $headers['location'] : null,
        ];
    }

    private function resolveRedirectUrl(string $baseUrl, string $location): string
    {
        $location = trim($location);
        if ($location === '') {
            throw new RuntimeException('Template source returned an empty redirect.', 422);
        }

        if (filter_var($location, FILTER_VALIDATE_URL) !== false) {
            return $location;
        }

        $base = parse_url($baseUrl);
        if (!is_array($base) || !isset($base['scheme'], $base['host'])) {
            throw new RuntimeException('Unable to resolve template source redirect.', 422);
        }

        if (str_starts_with($location, '//')) {
            return $base['scheme'] . ':' . $location;
        }

        $authority = $base['scheme'] . '://' . $base['host'];
        if (str_starts_with($location, '/')) {
            return $authority . $this->normalizePath($location);
        }

        $basePath = (string) ($base['path'] ?? '/');
        $directory = str_ends_with($basePath, '/')
            ? $basePath
            : substr($basePath, 0, (int) strrpos($basePath, '/') + 1);

        return $authority . $this->normalizePath($directory . $location);
    }

    private function normalizePath(string $path): string
    {
        $suffix = '';
        $queryAt = strpos($path, '?');
        if ($queryAt !== false) {
            $suffix = substr($path, $queryAt);
            $path = substr($path, 0, $queryAt);
        }

        $segments = [];
        foreach (explode('/', $path) as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }
            if ($segment === '..') {
                array_pop($segments);
                continue;
            }
            $segments[] = $segment;
        }

        return '/' . implode('/', $segments) . $suffix;
    }
}
