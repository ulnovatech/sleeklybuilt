<?php

declare(strict_types=1);

final class TemplateAssetProbe
{
    private const MAX_ASSETS = 12;
    private const ALLOWED_HOSTS = [
        'cdn.prod.website-files.com',
        'uploads-ssl.webflow.com',
        'd3e54v103j8qbb.cloudfront.net',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'ajax.googleapis.com',
    ];

    /**
     * @param array<int, string> $urls
     * @return array{checked:int,passed:int,warnings:array<int,string>}
     */
    public function probe(array $urls): array
    {
        if (!extension_loaded('curl')) {
            return [
                'checked' => 0,
                'passed' => 0,
                'warnings' => ['PHP cURL is unavailable; remote assets were not probed.'],
            ];
        }

        $approved = [];
        $warnings = [];
        foreach (array_values(array_unique($urls)) as $url) {
            $parts = parse_url($url);
            $scheme = strtolower((string) ($parts['scheme'] ?? ''));
            $host = strtolower((string) ($parts['host'] ?? ''));
            if ($scheme !== 'https' || !in_array($host, self::ALLOWED_HOSTS, true)) {
                $warnings[] = "Skipped unapproved remote asset: {$url}";
                continue;
            }
            $approved[] = $url;
            if (count($approved) >= self::MAX_ASSETS) {
                break;
            }
        }

        $multi = curl_multi_init();
        $handles = [];
        foreach ($approved as $url) {
            $curl = curl_init($url);
            if ($curl === false) {
                $warnings[] = "Unable to initialize asset probe: {$url}";
                continue;
            }
            curl_setopt_array($curl, [
                CURLOPT_NOBODY => true,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
                CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
                CURLOPT_USERAGENT => 'SleeklyBuilt-Template-Importer/1.0',
                CURLOPT_RETURNTRANSFER => true,
            ]);
            curl_multi_add_handle($multi, $curl);
            $handles[$url] = $curl;
        }

        do {
            $status = curl_multi_exec($multi, $running);
            if ($running > 0) {
                curl_multi_select($multi, 1.0);
            }
        } while ($running > 0 && $status === CURLM_OK);

        $passed = 0;
        foreach ($handles as $url => $curl) {
            $httpStatus = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            $error = curl_error($curl);
            if ($error === '' && $httpStatus >= 200 && $httpStatus < 400) {
                $passed++;
            } else {
                $warnings[] = sprintf(
                    'Remote asset probe failed (%s): %s',
                    $httpStatus > 0 ? "HTTP {$httpStatus}" : ($error ?: 'network error'),
                    $url
                );
            }
            curl_multi_remove_handle($multi, $curl);
            curl_close($curl);
        }
        curl_multi_close($multi);

        return [
            'checked' => count($handles),
            'passed' => $passed,
            'warnings' => $warnings,
        ];
    }
}
