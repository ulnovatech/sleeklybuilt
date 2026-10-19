<?php

declare(strict_types=1);

/**
 * MoMo post-verify activation (separate from financial verify).
 * Deposit satisfied → CRM website_orders + optional template reserve.
 * Partial → CRM note only; no catalog reserve.
 * Idempotent per claim.
 */

require_once __DIR__ . '/momo_schema.php';
require_once __DIR__ . '/packages.php';

function uln_ensure_payment_activation_tables(PDO $pdo): void
{
    uln_ensure_payment_verify_tables($pdo);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_activations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            payment_claim_id INT UNSIGNED NOT NULL,
            payment_session_id INT UNSIGNED NOT NULL,
            result VARCHAR(40) NOT NULL,
            order_id INT UNSIGNED NULL,
            website_order_id INT UNSIGNED NULL,
            template_reserved TINYINT(1) NOT NULL DEFAULT 0,
            activated_by VARCHAR(120) NULL,
            activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_payment_activations_claim (payment_claim_id),
            KEY idx_payment_activations_session (payment_session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

/**
 * @return array{already_activated:bool,result:string,reserved:bool,website_order_id:?int,order_id:?int,skipped_reason:?string}
 */
function uln_momo_activate_after_verify(PDO $pdo, int $claimId, string $actorLabel = 'system'): array
{
    uln_ensure_payment_activation_tables($pdo);

    $stmt = $pdo->prepare(
        'SELECT c.id AS claim_id, c.claim_ref, c.status AS claim_status, c.provider, c.metadata,
                s.id AS session_id, s.template_key, s.customer_name, s.customer_email,
                s.customer_phone, s.country_code, s.business_name, s.notes, s.package,
                s.amount_ugx, s.status AS session_status
         FROM payment_claims c
         INNER JOIN payment_sessions s ON s.id = c.payment_session_id
         WHERE c.id = ?
         LIMIT 1'
    );
    $stmt->execute([$claimId]);
    $row = $stmt->fetch();
    if (!$row) {
        throw new RuntimeException('Claim not found for activation.');
    }

    $existing = $pdo->prepare('SELECT * FROM payment_activations WHERE payment_claim_id = ? LIMIT 1');
    $existing->execute([$claimId]);
    $prior = $existing->fetch();
    if ($prior) {
        return [
            'already_activated' => true,
            'result' => (string) $prior['result'],
            'reserved' => (bool) (int) $prior['template_reserved'],
            'website_order_id' => $prior['website_order_id'] !== null ? (int) $prior['website_order_id'] : null,
            'order_id' => $prior['order_id'] !== null ? (int) $prior['order_id'] : null,
            'skipped_reason' => null,
        ];
    }

    $claimStatus = (string) $row['claim_status'];
    if (!in_array($claimStatus, ['verified', 'partial', 'overpaid'], true)) {
        return [
            'already_activated' => false,
            'result' => 'skipped',
            'reserved' => false,
            'website_order_id' => null,
            'order_id' => null,
            'skipped_reason' => 'Claim is not verified, partial, or overpaid.',
        ];
    }

    $depositSatisfied = in_array($claimStatus, ['verified', 'overpaid'], true);
    $templateKey = (string) $row['template_key'];
    $fullName = (string) $row['customer_name'];
    $phone = (string) $row['customer_phone'];
    $countryCode = (string) $row['country_code'];
    $businessName = (string) ($row['business_name'] ?? '');
    $notes = (string) ($row['notes'] ?? '');
    $package = (string) $row['package'];
    $amount = (int) $row['amount_ugx'];
    $claimRef = (string) $row['claim_ref'];
    $fullPhone = preg_replace('/\s+/', '', $countryCode . $phone);

    try {
        $packageMeta = uln_package_or_fail($package);
    } catch (Throwable $e) {
        $packageMeta = ['title' => $package, 'price_ugx' => 0];
    }

    $receipt = $pdo->prepare(
        'SELECT receipt_number FROM payment_receipts WHERE payment_claim_id = ? ORDER BY id DESC LIMIT 1'
    );
    $receipt->execute([$claimId]);
    $receiptNumber = (string) ($receipt->fetchColumn() ?: '');

    $details = "Package: {$package}\nTemplate: {$templateKey}";
    $details .= "\nDeposit: " . uln_format_ugx($amount);
    $details .= "\nPackage total: " . uln_format_ugx((int) ($packageMeta['price_ugx'] ?? 0));
    $details .= "\nPayment claim: {$claimRef}";
    $details .= "\nProvider: " . strtoupper((string) $row['provider']);
    $details .= "\nStatus: " . ($depositSatisfied ? 'Deposit verified (MoMo)' : 'Partial payment (MoMo)');
    if ($receiptNumber !== '') {
        $details .= "\nReceipt: {$receiptNumber}";
    }
    if ($businessName !== '') {
        $details .= "\nBusiness: {$businessName}";
    }
    if ($notes !== '') {
        $details .= "\nNotes: {$notes}";
    }

    $orderId = null;
    $reserved = false;
    $websiteOrderId = null;

    $pdo->beginTransaction();
    try {
        // Re-check idempotency inside txn
        $existing->execute([$claimId]);
        $race = $existing->fetch();
        if ($race) {
            $pdo->rollBack();
            return [
                'already_activated' => true,
                'result' => (string) $race['result'],
                'reserved' => (bool) (int) $race['template_reserved'],
                'website_order_id' => $race['website_order_id'] !== null ? (int) $race['website_order_id'] : null,
                'order_id' => $race['order_id'] !== null ? (int) $race['order_id'] : null,
                'skipped_reason' => null,
            ];
        }

        if ($depositSatisfied) {
            $tplStmt = $pdo->prepare(
                "SELECT * FROM templates
                 WHERE (name = ? OR folder_name = ?)
                   AND status = 'available'
                 LIMIT 1"
            );
            $tplStmt->execute([$templateKey, $templateKey]);
            $template = $tplStmt->fetch();

            if ($template) {
                $pdo->prepare(
                    'INSERT INTO orders (template_id, full_name, phone, country_code, business_name, notes, package)
                     VALUES (?, ?, ?, ?, ?, ?, ?)'
                )->execute([
                    $template['id'],
                    $fullName,
                    $phone,
                    $countryCode,
                    $businessName !== '' ? $businessName : null,
                    $notes !== '' ? $notes : null,
                    $package,
                ]);
                $orderId = (int) $pdo->lastInsertId();

                $pdo->prepare("UPDATE templates SET status = 'reserved', ordered_by = ? WHERE id = ?")
                    ->execute([$fullName, $template['id']]);
                $reserved = true;
            }
        }

        try {
            $pdo->prepare(
                'INSERT INTO website_orders (template, name, phone, business, details) VALUES (?, ?, ?, ?, ?)'
            )->execute([
                $templateKey,
                $fullName,
                $fullPhone,
                $businessName,
                $details,
            ]);
            $websiteOrderId = (int) $pdo->lastInsertId();
        } catch (Throwable $e) {
            // CRM table may be missing in some local envs — do not fail activation hard
            error_log('MoMo activation website_orders insert failed: ' . $e->getMessage());
        }

        $result = $depositSatisfied
            ? ($reserved ? 'deposit_activated' : 'deposit_recorded')
            : 'partial_recorded';

        $pdo->prepare(
            'INSERT INTO payment_activations
             (payment_claim_id, payment_session_id, result, order_id, website_order_id, template_reserved, activated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $claimId,
            (int) $row['session_id'],
            $result,
            $orderId,
            $websiteOrderId,
            $reserved ? 1 : 0,
            mb_substr($actorLabel, 0, 120),
        ]);

        if ($depositSatisfied) {
            $pdo->prepare("UPDATE payment_sessions SET status = 'order_activated' WHERE id = ?")
                ->execute([(int) $row['session_id']]);
        }

        uln_payment_audit(
            $pdo,
            'payment_claim',
            (string) $claimId,
            'activate_after_verify',
            $actorLabel,
            ['claim_status' => $claimStatus],
            [
                'result' => $result,
                'reserved' => $reserved,
                'website_order_id' => $websiteOrderId,
                'order_id' => $orderId,
            ]
        );

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    return [
        'already_activated' => false,
        'result' => $result,
        'reserved' => $reserved,
        'website_order_id' => $websiteOrderId,
        'order_id' => $orderId,
        'skipped_reason' => null,
    ];
}
