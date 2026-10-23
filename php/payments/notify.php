<?php

declare(strict_types=1);

/**
 * MoMo payment notification layer (idempotent).
 * R10: notification failure must never un-verify a payment.
 */

require_once __DIR__ . '/momo_schema.php';
require_once __DIR__ . '/packages.php';
require_once __DIR__ . '/../leads/notify.php';

function uln_ensure_payment_notification_tables(PDO $pdo): void
{
    uln_ensure_payment_verify_tables($pdo);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_notification_events (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_key VARCHAR(160) NOT NULL,
            payment_claim_id INT UNSIGNED NOT NULL,
            channel VARCHAR(40) NOT NULL,
            status VARCHAR(40) NOT NULL DEFAULT 'pending',
            attempts INT UNSIGNED NOT NULL DEFAULT 0,
            last_error TEXT NULL,
            payload_json JSON NULL,
            sent_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_payment_notify_event (event_key),
            KEY idx_payment_notify_claim (payment_claim_id),
            KEY idx_payment_notify_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

/**
 * @return array{team:array,customer:array}
 */
function uln_momo_notify_after_verify(PDO $pdo, int $claimId, bool $forceRetry = false): array
{
    uln_ensure_payment_notification_tables($pdo);

    $stmt = $pdo->prepare(
        'SELECT c.id AS claim_id, c.claim_ref, c.status AS claim_status, c.provider, c.metadata,
                s.customer_name, s.customer_email, s.customer_phone, s.country_code,
                s.package, s.amount_ugx, s.template_key, s.business_name
         FROM payment_claims c
         INNER JOIN payment_sessions s ON s.id = c.payment_session_id
         WHERE c.id = ?
         LIMIT 1'
    );
    $stmt->execute([$claimId]);
    $row = $stmt->fetch();
    if (!$row) {
        throw new RuntimeException('Claim not found for notification.');
    }

    if (!in_array((string) $row['claim_status'], ['verified', 'partial', 'overpaid'], true)) {
        return [
            'team' => ['status' => 'skipped', 'reason' => 'not_verified'],
            'customer' => ['status' => 'skipped', 'reason' => 'not_verified'],
        ];
    }

    $receipt = $pdo->prepare(
        'SELECT receipt_number, amount_ugx FROM payment_receipts WHERE payment_claim_id = ? ORDER BY id DESC LIMIT 1'
    );
    $receipt->execute([$claimId]);
    $receiptRow = $receipt->fetch() ?: null;

    $activation = $pdo->prepare('SELECT * FROM payment_activations WHERE payment_claim_id = ? LIMIT 1');
    try {
        $activation->execute([$claimId]);
        $activationRow = $activation->fetch() ?: null;
    } catch (Throwable $e) {
        $activationRow = null;
    }

    $meta = json_decode((string) ($row['metadata'] ?? ''), true);
    if (!is_array($meta)) {
        $meta = [];
    }

    $packageTitle = $meta['package_title'] ?? null;
    $isSubscription = (($meta['product_kind'] ?? '') === 'subscription')
        || uln_is_subscription_product((string) $row['package']);

    if (!$packageTitle) {
        try {
            $packageTitle = $isSubscription
                ? uln_subscription_product_or_fail((string) $row['package'])['title']
                : uln_package_or_fail((string) $row['package'])['title'];
        } catch (Throwable $e) {
            $packageTitle = (string) $row['package'];
        }
    }

    $amountLabel = uln_format_ugx((int) ($receiptRow['amount_ugx'] ?? $row['amount_ugx']));
    $providerLabel = strtoupper((string) $row['provider']) === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money';
    $receiptNumber = (string) ($receiptRow['receipt_number'] ?? '');
    $isPartial = (string) $row['claim_status'] === 'partial';
    $isOverpaid = (string) $row['claim_status'] === 'overpaid';

    $team = uln_momo_notify_channel(
        $pdo,
        $claimId,
        'PAYMENT_VERIFIED:' . $claimId . ':team',
        'team_email',
        $forceRetry,
        function () use ($row, $amountLabel, $receiptNumber, $packageTitle, $activationRow, $isPartial, $isOverpaid, $isSubscription, $meta): void {
            $leadType = $isSubscription ? 'attendant_subscription' : 'website_order';
            $payload = [
                'source_id' => $activationRow['website_order_id'] ?? null,
                'template' => $row['template_key'],
                'name' => $row['customer_name'],
                'email' => $row['customer_email'],
                'phone' => preg_replace('/\s+/', '', ($row['country_code'] ?? '') . ($row['customer_phone'] ?? '')),
                'business' => $row['business_name'] ?? '',
                'package' => $row['package'],
                'package_title' => $packageTitle,
                'deposit_paid' => $amountLabel,
                'payment_ref' => $row['claim_ref'],
                'receipt' => $receiptNumber,
                'momo_status' => $isPartial ? 'partial' : ($isOverpaid ? 'overpaid' : 'verified'),
                'reserved_in_catalog' => $isSubscription
                    ? 'n/a'
                    : (!empty($activationRow['template_reserved']) ? 'yes' : 'no'),
            ];
            if ($isSubscription) {
                $payload['product_kind'] = 'subscription';
                $payload['onboarding'] = 'Collect business details and set up attendant';
                if (!empty($meta['website_url'])) {
                    $payload['website_url'] = $meta['website_url'];
                }
            }
            uln_notify_lead($leadType, $payload);
        }
    );

    $customerEmail = trim((string) ($row['customer_email'] ?? ''));
    $customer = ['status' => 'skipped', 'reason' => 'no_email'];
    if ($customerEmail !== '' && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        $customer = uln_momo_notify_channel(
            $pdo,
            $claimId,
            'PAYMENT_VERIFIED:' . $claimId . ':customer_email',
            'customer_email',
            $forceRetry,
            function () use ($row, $amountLabel, $receiptNumber, $packageTitle, $providerLabel, $isPartial, $isOverpaid, $customerEmail, $isSubscription): void {
                $brand = getenv('BRAND_NAME') ?: 'SleeklyBuilt';
                $from = getenv('MAIL_FROM') ?: 'noreply@sleeklybuilt.pro';
                if ($isSubscription) {
                    if ($isPartial) {
                        $subject = "[{$brand}] Partial Attendant payment — {$row['claim_ref']}";
                        $body = "Hi {$row['customer_name']},\n\n"
                          . "We've received part of your Sleekly Attendant payment ({$amountLabel}) via {$providerLabel}.\n\n"
                          . "Claim reference: {$row['claim_ref']}\n"
                          . ($receiptNumber !== '' ? "Receipt: {$receiptNumber}\n" : '')
                          . "Product: {$packageTitle}\n\n"
                          . "Please contact us about the remaining balance so we can complete verification.\n\n"
                          . "— {$brand}\n";
                    } else {
                        $subject = "[{$brand}] Attendant payment verified — {$row['claim_ref']}";
                        $body = "Hi {$row['customer_name']},\n\n"
                          . "Payment verified.\n\n"
                          . "We've received your {$amountLabel} payment via {$providerLabel} for {$packageTitle}.\n\n"
                          . ($receiptNumber !== '' ? "Receipt: {$receiptNumber}\n" : '')
                          . "Reference: {$row['claim_ref']}\n\n"
                          . "We will contact you to collect business details and set up your attendant.\n\n"
                          . "You do not need to send a Mobile Money transaction reference.\n\n"
                          . "— {$brand}\n";
                    }
                } elseif ($isPartial) {
                    $subject = "[{$brand}] Partial payment received — {$row['claim_ref']}";
                    $body = "Hi {$row['customer_name']},\n\n"
                      . "We've received part of your payment ({$amountLabel}) via {$providerLabel}.\n\n"
                      . "Claim reference: {$row['claim_ref']}\n"
                      . ($receiptNumber !== '' ? "Receipt: {$receiptNumber}\n" : '')
                      . "Package: {$packageTitle}\n\n"
                      . "Please contact us about the remaining balance so we can complete verification.\n\n"
                      . "— {$brand}\n";
                } elseif ($isOverpaid) {
                    $subject = "[{$brand}] Payment received — {$row['claim_ref']}";
                    $body = "Hi {$row['customer_name']},\n\n"
                      . "We've received your {$amountLabel} payment via {$providerLabel}.\n\n"
                      . "Receipt: {$receiptNumber}\n"
                      . "Reference: {$row['claim_ref']}\n"
                      . "Package: {$packageTitle}\n\n"
                      . "Your package is confirmed. If the amount differs from what you expected, our team will follow up.\n\n"
                      . "— {$brand}\n";
                } else {
                    $subject = "[{$brand}] Payment confirmed — {$row['claim_ref']}";
                    $body = "Hi {$row['customer_name']},\n\n"
                      . "Payment confirmed.\n\n"
                      . "We've received your {$amountLabel} payment via {$providerLabel}.\n\n"
                      . "Receipt: {$receiptNumber}\n"
                      . "Reference: {$row['claim_ref']}\n"
                      . "Package: {$packageTitle}\n\n"
                      . "Your package is confirmed. Our team will contact you about next steps.\n\n"
                      . "You do not need to send a Mobile Money transaction reference.\n\n"
                      . "— {$brand}\n";
                }

                $headers = 'From: ' . $brand . ' <' . $from . ">\r\n"
                    . 'Content-Type: text/plain; charset=UTF-8';

                if (getenv('APP_DEBUG') === 'true') {
                    error_log("[MoMoNotify] To: {$customerEmail}\nSubject: {$subject}\n{$body}");
                }

                $ok = @mail($customerEmail, $subject, $body, $headers);
                if (!$ok) {
                    throw new RuntimeException('mail() failed for customer receipt.');
                }
            }
        );
    }

    return ['team' => $team, 'customer' => $customer];
}

/**
 * @param callable():void $send
 * @return array{status:string,attempts:int,error:?string}
 */
function uln_momo_notify_channel(
    PDO $pdo,
    int $claimId,
    string $eventKey,
    string $channel,
    bool $forceRetry,
    callable $send
): array {
    $sel = $pdo->prepare('SELECT * FROM payment_notification_events WHERE event_key = ? LIMIT 1');
    $sel->execute([$eventKey]);
    $row = $sel->fetch();

    if ($row && (string) $row['status'] === 'sent' && !$forceRetry) {
        return [
            'status' => 'sent',
            'attempts' => (int) $row['attempts'],
            'error' => null,
        ];
    }

    if (!$row) {
        $pdo->prepare(
            'INSERT INTO payment_notification_events (event_key, payment_claim_id, channel, status, attempts)
             VALUES (?, ?, ?, ?, 0)'
        )->execute([$eventKey, $claimId, $channel, 'pending']);
        $sel->execute([$eventKey]);
        $row = $sel->fetch();
    }

    $attempts = (int) ($row['attempts'] ?? 0) + 1;

    try {
        $send();
        $pdo->prepare(
            "UPDATE payment_notification_events
             SET status = 'sent', attempts = ?, last_error = NULL, sent_at = NOW()
             WHERE event_key = ?"
        )->execute([$attempts, $eventKey]);

        return ['status' => 'sent', 'attempts' => $attempts, 'error' => null];
    } catch (Throwable $e) {
        $pdo->prepare(
            "UPDATE payment_notification_events
             SET status = 'failed', attempts = ?, last_error = ?
             WHERE event_key = ?"
        )->execute([$attempts, mb_substr($e->getMessage(), 0, 500), $eventKey]);

        error_log('MoMo notify failed [' . $channel . ']: ' . $e->getMessage());

        return [
            'status' => 'failed',
            'attempts' => $attempts,
            'error' => $e->getMessage(),
        ];
    }
}
