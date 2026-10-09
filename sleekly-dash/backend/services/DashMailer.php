<?php

declare(strict_types=1);

/**
 * Transactional mail for dash auth (reset / welcome).
 * Prefers SMTP (Gmail) when SMTP_HOST + SMTP_USER + SMTP_PASS are set;
 * falls back to PHP mail().
 */
class DashMailer
{
    public function send(string $to, string $subject, string $body): bool
    {
        $from = getenv('MAIL_FROM') ?: 'noreply@sleeklybuilt.pro';
        $brand = getenv('BRAND_NAME') ?: 'SleeklyBuilt';

        if (getenv('APP_DEBUG') === 'true') {
            error_log("[DashMailer] To: {$to}\nSubject: {$subject}\n{$body}");
        }

        if ($this->smtpConfigured()) {
            try {
                $ok = $this->sendSmtp($to, $subject, $body, $from, $brand);
                if ($ok) {
                    return true;
                }
            } catch (Throwable $e) {
                error_log('[DashMailer] SMTP failed: ' . $e->getMessage());
            }
        }

        $headers = [
            'From: ' . $brand . ' <' . $from . '>',
            'Reply-To: ' . $from,
            'Content-Type: text/plain; charset=UTF-8',
            'X-Mailer: SleeklyDash',
        ];
        $ok = @mail($to, $subject, $body, implode("\r\n", $headers));
        if (!$ok) {
            error_log("[DashMailer] Failed to send to {$to}: {$subject}");
        }
        return $ok;
    }

    private function smtpConfigured(): bool
    {
        return trim((string) (getenv('SMTP_HOST') ?: '')) !== ''
            && trim((string) (getenv('SMTP_USER') ?: '')) !== ''
            && trim((string) (getenv('SMTP_PASS') ?: '')) !== '';
    }

    private function sendSmtp(
        string $to,
        string $subject,
        string $body,
        string $from,
        string $brand,
    ): bool {
        $host = trim((string) getenv('SMTP_HOST'));
        $port = (int) (getenv('SMTP_PORT') ?: 587);
        $user = trim((string) getenv('SMTP_USER'));
        $pass = (string) getenv('SMTP_PASS');
        $encryption = strtolower(trim((string) (getenv('SMTP_ENCRYPTION') ?: 'tls')));

        $remote = ($encryption === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;
        $fp = @stream_socket_client(
            $remote,
            $errno,
            $errstr,
            20,
            STREAM_CLIENT_CONNECT,
            stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]])
        );
        if (!$fp) {
            throw new RuntimeException("SMTP connect failed: {$errstr} ({$errno})");
        }
        stream_set_timeout($fp, 20);

        $this->expect($fp, 220);
        $this->cmd($fp, 'EHLO sleeklybuilt.pro', 250);

        if ($encryption === 'tls') {
            $this->cmd($fp, 'STARTTLS', 220);
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('SMTP STARTTLS failed');
            }
            $this->cmd($fp, 'EHLO sleeklybuilt.pro', 250);
        }

        $this->cmd($fp, 'AUTH LOGIN', 334);
        $this->cmd($fp, base64_encode($user), 334);
        $this->cmd($fp, base64_encode($pass), 235);

        $this->cmd($fp, 'MAIL FROM:<' . $from . '>', 250);
        $this->cmd($fp, 'RCPT TO:<' . $to . '>', 250);
        $this->cmd($fp, 'DATA', 354);

        $payload = [
            'From: ' . $brand . ' <' . $from . '>',
            'To: <' . $to . '>',
            'Subject: ' . $this->encodeHeader($subject),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: SleeklyDash',
            '',
            str_replace(["\r\n", "\r"], "\n", $body),
            '.',
        ];
        fwrite($fp, implode("\r\n", $payload) . "\r\n");
        $this->expect($fp, 250);
        $this->cmd($fp, 'QUIT', 221);
        fclose($fp);
        return true;
    }

    private function cmd($fp, string $line, int $expectCode): void
    {
        fwrite($fp, $line . "\r\n");
        $this->expect($fp, $expectCode);
    }

    private function expect($fp, int $code): void
    {
        $response = '';
        while (($line = fgets($fp, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        if (!str_starts_with(trim($response), (string) $code)) {
            throw new RuntimeException('SMTP unexpected response: ' . trim($response));
        }
    }

    private function encodeHeader(string $value): string
    {
        if (preg_match('/^[\x20-\x7E]+$/', $value)) {
            return $value;
        }
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }
}
