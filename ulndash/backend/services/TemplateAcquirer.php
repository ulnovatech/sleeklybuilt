<?php

declare(strict_types=1);

final class TemplateAcquirer
{
    private const MAX_BYTES = 524_288_000;
    private const MAX_FILES = 2_000;
    private const MAX_RUNTIME_SECONDS = 900;

    /**
     * @return array{
     *   output_directory:string,
     *   file_count:int,
     *   html_count:int,
     *   bytes:int,
     *   remote_hosts:array<int,string>,
     *   duration_seconds:float
     * }
     */
    public function acquire(
        string $sourceUrl,
        string $sourceHost,
        string $stagingPath
    ): array {
        $outputDirectory = $stagingPath . DIRECTORY_SEPARATOR . 'site';
        if (!mkdir($outputDirectory, 0700) && !is_dir($outputDirectory)) {
            throw new RuntimeException('Unable to create the template download directory.');
        }

        $logPath = $stagingPath . DIRECTORY_SEPARATOR . 'acquisition.log';
        $wget = trim((string) getenv('TEMPLATE_IMPORT_WGET_BINARY'));
        if ($wget === '') {
            $wget = 'wget';
        }

        $arguments = [
            $wget,
            '--recursive',
            '--level=2',
            '--convert-links',
            '--adjust-extension',
            '--page-requisites',
            '--no-parent',
            '--no-host-directories',
            '--https-only',
            '--domains=' . $sourceHost,
            '--directory-prefix=' . $outputDirectory,
            '--restrict-file-names=windows',
            '--timeout=30',
            '--dns-timeout=15',
            '--connect-timeout=15',
            '--read-timeout=30',
            '--tries=2',
            '--wait=1',
            '--random-wait',
            '--quota=500m',
            '--max-redirect=5',
            '--reject=*.mp4,*.mov,*.avi,*.zip,*.exe,*.dmg,*.iso',
            '--user-agent=Mozilla/5.0 (compatible; UlnovaTech-Template-Importer/1.0)',
            '--no-verbose',
            $sourceUrl,
        ];

        $startedAt = microtime(true);
        $exitCode = $this->run($arguments, $logPath, self::MAX_RUNTIME_SECONDS);
        $duration = round(microtime(true) - $startedAt, 3);

        if ($exitCode !== 0) {
            throw new RuntimeException(
                "Template download failed (wget exit {$exitCode}): " .
                $this->readLogTail($logPath)
            );
        }

        $inventory = $this->inventory($outputDirectory, $sourceHost);
        if (!is_file($outputDirectory . DIRECTORY_SEPARATOR . 'index.html')) {
            throw new RuntimeException('Template download did not produce an index.html.');
        }
        if ($inventory['html_count'] < 1) {
            throw new RuntimeException('Template download did not produce any HTML pages.');
        }

        return [
            'output_directory' => $outputDirectory,
            'file_count' => $inventory['file_count'],
            'html_count' => $inventory['html_count'],
            'bytes' => $inventory['bytes'],
            'remote_hosts' => $inventory['remote_hosts'],
            'duration_seconds' => $duration,
        ];
    }

    /**
     * @param array<int, string> $command
     */
    private function run(array $command, string $logPath, int $timeoutSeconds): int
    {
        $log = fopen($logPath, 'ab');
        if ($log === false) {
            throw new RuntimeException('Unable to open the acquisition log.');
        }

        $process = proc_open(
            $command,
            [
                0 => ['file', $this->nullDevice(), 'r'],
                1 => $log,
                2 => $log,
            ],
            $pipes,
            null,
            null,
            ['bypass_shell' => true]
        );
        if (!is_resource($process)) {
            fclose($log);
            throw new RuntimeException('Unable to start wget.');
        }

        $startedAt = microtime(true);
        $timedOut = false;
        do {
            $status = proc_get_status($process);
            if (!$status['running']) {
                break;
            }
            if (microtime(true) - $startedAt > $timeoutSeconds) {
                $timedOut = true;
                proc_terminate($process);
                usleep(500_000);
                $status = proc_get_status($process);
                if ($status['running']) {
                    proc_terminate($process, 9);
                }
                break;
            }
            usleep(200_000);
        } while (true);

        $lastStatus = $status;
        $exitCode = proc_close($process);
        fclose($log);

        if ($timedOut) {
            throw new RuntimeException(
                "Template download exceeded {$timeoutSeconds} seconds."
            );
        }

        if ($exitCode === -1 && isset($lastStatus['exitcode'])) {
            $exitCode = (int) $lastStatus['exitcode'];
        }

        return $exitCode;
    }

    /**
     * @return array{file_count:int,html_count:int,bytes:int,remote_hosts:array<int,string>}
     */
    private function inventory(string $directory, string $sourceHost): array
    {
        $fileCount = 0;
        $htmlCount = 0;
        $bytes = 0;
        $remoteHosts = [];

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isLink()) {
                throw new RuntimeException('Downloaded template contains a symbolic link.');
            }
            if (!$file->isFile()) {
                continue;
            }

            $fileCount++;
            $bytes += $file->getSize();
            if ($fileCount > self::MAX_FILES) {
                throw new RuntimeException(
                    'Template download exceeded the 2,000-file limit.'
                );
            }
            if ($bytes > self::MAX_BYTES) {
                throw new RuntimeException(
                    'Template download exceeded the 500 MB limit.'
                );
            }

            if (strtolower($file->getExtension()) !== 'html') {
                continue;
            }
            $htmlCount++;
            $html = file_get_contents($file->getPathname());
            if (!is_string($html)) {
                throw new RuntimeException('Unable to read a downloaded HTML page.');
            }
            preg_match_all(
                "~https?://([^/\\s\"'<>]+)~i",
                $html,
                $matches
            );
            foreach ($matches[1] ?? [] as $host) {
                $host = strtolower(rtrim((string) $host, '.'));
                if ($host !== '' && $host !== $sourceHost) {
                    $remoteHosts[$host] = true;
                }
            }
        }

        $hosts = array_keys($remoteHosts);
        sort($hosts);

        return [
            'file_count' => $fileCount,
            'html_count' => $htmlCount,
            'bytes' => $bytes,
            'remote_hosts' => $hosts,
        ];
    }

    private function readLogTail(string $logPath): string
    {
        if (!is_file($logPath)) {
            return 'no acquisition log was produced';
        }

        $size = filesize($logPath);
        if (!is_int($size)) {
            return 'acquisition log could not be read';
        }

        $handle = fopen($logPath, 'rb');
        if ($handle === false) {
            return 'acquisition log could not be opened';
        }

        $length = min($size, 8_192);
        if ($length > 0) {
            fseek($handle, -$length, SEEK_END);
        }
        $tail = stream_get_contents($handle);
        fclose($handle);

        $tail = trim(preg_replace('/\s+/', ' ', (string) $tail) ?? '');

        return $tail !== '' ? $tail : 'acquisition log was empty';
    }

    private function nullDevice(): string
    {
        return PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null';
    }
}
