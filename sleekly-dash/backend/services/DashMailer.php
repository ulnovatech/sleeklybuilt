<?php

declare(strict_types=1);

/**
 * Lightweight transactional mail for dash auth (reset / welcome).
 * Uses PHP mail(); logs failures. In APP_DEBUG, messages are also error_log'd.
 */
class DashMailer
{
    public function send(string $to, string $subject, string $body): bool
    {
        $from = getenv('MAIL_FROM') ?: 'noreply@sleeklybuilt.pro';
        $brand = getenv('BRAND_NAME') ?: 'SleeklyBuilt';
        $headers = [
            'From: ' . $brand . ' <' . $from . '>',
            'Reply-To: ' . $from,
            'Content-Type: text/plain; charset=UTF-8',
            'X-Mailer: SleeklyDash',
        ];

        if (getenv('APP_DEBUG') === 'true') {
            error_log("[DashMailer] To: {$to}\nSubject: {$subject}\n{$body}");
        }

        $ok = @mail($to, $subject, $body, implode("\r\n", $headers));
        if (!$ok) {
            error_log("[DashMailer] Failed to send to {$to}: {$subject}");
        }
        return $ok;
    }
}
