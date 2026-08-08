<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

final class TemplateImportLauncher
{
    public function launch(int $jobId): void
    {
        if ($jobId < 1) {
            throw new InvalidArgumentException('Worker job ID must be positive.');
        }

        $worker = realpath(__DIR__ . '/../scripts/template-import-worker.php');
        if ($worker === false) {
            throw new RuntimeException('Template import worker script is unavailable.');
        }

        $logDirectory = TemplateImportPolicy::logDirectory();
        if (
            !is_dir($logDirectory) &&
            !mkdir($logDirectory, 0700, true) &&
            !is_dir($logDirectory)
        ) {
            throw new RuntimeException('Unable to create the template worker log directory.');
        }
        if (is_link($logDirectory) || !is_writable($logDirectory)) {
            throw new RuntimeException('Template worker log directory is not writable.');
        }

        $logPath = $logDirectory . DIRECTORY_SEPARATOR . "job-{$jobId}.log";

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
            throw new RuntimeException('Unable to launch the template import worker.');
        }
    }

    private function launchWindows(string $worker, int $jobId, string $logPath): void
    {
        $log = fopen($logPath, 'ab');
        if ($log === false) {
            throw new RuntimeException('Unable to open the template worker log.');
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
            throw new RuntimeException('Unable to launch the template import worker.');
        }

        $exitCode = proc_close($process);
        fclose($log);
        if ($exitCode !== 0) {
            throw new RuntimeException('Template import worker launcher failed.');
        }
    }
}
