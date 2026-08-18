<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

final class TemplateScreenshotLauncher
{
    public function launch(int $jobId): void
    {
        if ($jobId < 1) {
            throw new InvalidArgumentException('Screenshot job ID must be positive.');
        }

        $worker = realpath(__DIR__ . '/../scripts/template-screenshot-worker.php');
        if ($worker === false) {
            throw new RuntimeException('Template screenshot worker script is unavailable.');
        }

        $logDirectory = TemplateImportPolicy::logDirectory();
        if (
            !is_dir($logDirectory) &&
            !mkdir($logDirectory, 0700, true) &&
            !is_dir($logDirectory)
        ) {
            throw new RuntimeException('Unable to create the template worker log directory.');
        }

        $logPath = $logDirectory . DIRECTORY_SEPARATOR . "screenshots-{$jobId}.log";

        if (PHP_OS_FAMILY === 'Windows') {
            $this->launchWindows($worker, $jobId, $logPath);
            return;
        }

        $command = sprintf(
            'nohup %s %s %d >> %s 2>&1 < /dev/null & echo $!',
            escapeshellarg(PHP_BINARY),
            escapeshellarg($worker),
            $jobId,
            escapeshellarg($logPath)
        );
        $output = [];
        $exitCode = 0;
        exec($command, $output, $exitCode);
        $pid = trim((string) ($output[0] ?? ''));
        if ($exitCode !== 0 || !ctype_digit($pid)) {
            throw new RuntimeException('Unable to launch the template screenshot worker.');
        }
    }

    /**
     * @param list<array{path:string,filename:string,label:string}> $pages
     * @return array<string, mixed>
     */
    public function capture(string $slug, string $siteRoot, string $baseUrl, array $pages): array
    {
        $script = realpath(__DIR__ . '/../scripts/template-screenshots/capture.mjs');
        if ($script === false) {
            throw new RuntimeException('Screenshot capture script is unavailable.');
        }

        $node = $this->resolveNodeBinary();
        $payload = [
            'slug' => $slug,
            'siteRoot' => $siteRoot,
            'baseUrl' => $baseUrl,
            'pages' => $pages,
            'viewport' => ['width' => 1280, 'height' => 720],
            'executablePath' => $this->resolveChromiumPath(),
        ];

        $tmp = tempnam(sys_get_temp_dir(), 'tplshot');
        if ($tmp === false) {
            throw new RuntimeException('Unable to allocate screenshot job payload.');
        }
        $inputPath = $tmp . '.json';
        $outputPath = $tmp . '.out.json';
        @unlink($tmp);
        file_put_contents(
            $inputPath,
            json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)
        );

        try {
            $command = [
                $node,
                $script,
                '--input=' . $inputPath,
                '--output=' . $outputPath,
            ];

            $descriptor = [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ];
            $process = proc_open($command, $descriptor, $pipes, dirname($script), null, [
                'bypass_shell' => true,
            ]);
            if (!is_resource($process)) {
                throw new RuntimeException('Unable to start Puppeteer screenshot process.');
            }

            fclose($pipes[0]);
            $stdout = stream_get_contents($pipes[1]) ?: '';
            $stderr = stream_get_contents($pipes[2]) ?: '';
            fclose($pipes[1]);
            fclose($pipes[2]);
            $code = proc_close($process);

            if ($code !== 0) {
                throw new RuntimeException(
                    'Screenshot capture failed: ' . trim($stderr !== '' ? $stderr : $stdout)
                );
            }

            if (!is_file($outputPath)) {
                throw new RuntimeException('Screenshot capture did not write a result file.');
            }
            $decoded = json_decode((string) file_get_contents($outputPath), true);
            if (!is_array($decoded)) {
                throw new RuntimeException('Screenshot capture returned invalid JSON.');
            }
            return $decoded;
        } finally {
            @unlink($inputPath);
            @unlink($outputPath);
        }
    }

    private function resolveNodeBinary(): string
    {
        $configured = trim((string) getenv('TEMPLATE_SCREENSHOT_NODE'));
        if ($configured !== '') {
            return $configured;
        }

        if (PHP_OS_FAMILY === 'Windows') {
            $where = [];
            exec('where node 2>NUL', $where);
            if (!empty($where[0]) && is_file($where[0])) {
                return $where[0];
            }
            throw new RuntimeException(
                'Node.js is required for gallery screenshots. Install Node 20+ or set TEMPLATE_SCREENSHOT_NODE.'
            );
        }

        $paths = ['/usr/local/bin/node', '/usr/bin/node'];
        foreach ($paths as $path) {
            if (is_executable($path)) {
                return $path;
            }
        }
        $which = trim((string) shell_exec('command -v node 2>/dev/null'));
        if ($which !== '' && is_executable($which)) {
            return $which;
        }

        throw new RuntimeException(
            'Node.js is required for gallery screenshots. Install Node 20+ or set TEMPLATE_SCREENSHOT_NODE.'
        );
    }

    private function resolveChromiumPath(): ?string
    {
        $configured = trim((string) getenv('TEMPLATE_SCREENSHOT_CHROMIUM'));
        if ($configured !== '') {
            return $configured;
        }

        $candidates = [
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
        ];
        foreach ($candidates as $path) {
            if (is_executable($path)) {
                return $path;
            }
        }
        return null;
    }

    private function launchWindows(string $worker, int $jobId, string $logPath): void
    {
        $log = fopen($logPath, 'ab');
        if ($log === false) {
            throw new RuntimeException('Unable to open the screenshot worker log.');
        }

        $process = proc_open(
            [
                'cmd.exe',
                '/C',
                'start',
                '',
                '/B',
                PHP_BINARY,
                $worker,
                (string) $jobId,
            ],
            [
                0 => ['file', 'NUL', 'r'],
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
            throw new RuntimeException('Unable to launch the template screenshot worker.');
        }
        proc_close($process);
        fclose($log);
    }
}
