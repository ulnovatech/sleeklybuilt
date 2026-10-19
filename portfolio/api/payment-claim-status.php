<?php

declare(strict_types=1);

/**
 * Public claim status lookup: claim_ref + phone (no MoMo transaction reference).
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/cors.php';
require_once __DIR__ . '/lib/schema.php';
require_once __DIR__ . '/../../../php/leads/rate_limit.php';
require_once __DIR__ . '/../../../php/payments/packages.php';

uln_portfolio_cors(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

uln_rate_limit('payment_claim_status', 30, 3600);

$data = $_SERVER['REQUEST_METHOD'] === 'POST' ? uln_json_input() : $_GET;
$claimRef = strtoupper(trim((string) ($data['claim_ref'] ?? $data['ref'] ?? '')));
$phone = preg_replace('/\D+/', '', (string) ($data['phone'] ?? ''));

if ($claimRef === '' || $phone === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Enter your payment reference and phone number.',
    ]);
    exit;
}

try {
    uln_ensure_payment_claims_tables($pdo);
    uln_ensure_payment_verify_tables($pdo);

    $stmt = $pdo->prepare(
        'SELECT s.session_ref, s.template_key, s.customer_name, s.customer_email, s.customer_phone,
                s.country_code, s.package, s.amount_ugx, s.currency, s.provider, s.status AS session_status,
                c.claim_ref, c.status AS claim_status, c.submitted_at, c.claimed_payer_phone, c.metadata
         FROM payment_claims c
         INNER JOIN payment_sessions s ON s.id = c.payment_session_id
         WHERE c.claim_ref = ?
         LIMIT 1'
    );
    $stmt->execute([$claimRef]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No payment claim matches that reference.',
            'code' => 'not_found',
        ]);
        exit;
    }

    $customerDigits = preg_replace('/\D+/', '', (string) $row['customer_phone']);
    $payerDigits = preg_replace('/\D+/', '', (string) ($row['claimed_payer_phone'] ?? ''));
    $fullCustomer = preg_replace('/\D+/', '', (string) ($row['country_code'] . $row['customer_phone']));

    $phoneOk =
        str_ends_with($fullCustomer, $phone)
        || str_ends_with($customerDigits, $phone)
        || ($payerDigits !== '' && str_ends_with($payerDigits, $phone))
        || str_ends_with($phone, $customerDigits)
        || ($payerDigits !== '' && str_ends_with($phone, $payerDigits));

    // Also allow last 9 digits match (UG local).
    if (!$phoneOk && strlen($phone) >= 9) {
        $tail = substr($phone, -9);
        $phoneOk =
            str_ends_with($customerDigits, $tail)
            || str_ends_with($fullCustomer, $tail)
            || ($payerDigits !== '' && str_ends_with($payerDigits, $tail));
    }

    if (!$phoneOk) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No payment claim matches those details.',
            'code' => 'not_found',
        ]);
        exit;
    }

    $claimStatus = (string) $row['claim_status'];
    $meta = json_decode((string) ($row['metadata'] ?? ''), true);
    if (!is_array($meta)) {
        $meta = [];
    }

    $verified = $claimStatus === 'verified' || $claimStatus === 'overpaid';
    $partial = $claimStatus === 'partial';

    $statusLabel = match ($claimStatus) {
        'awaiting_verification' => 'Waiting for verification',
        'verified' => 'Payment verified',
        'overpaid' => 'Payment received (overpaid)',
        'partial' => 'Partial payment received',
        'rejected' => 'Could not verify yet',
        'not_found' => 'Payment not found yet',
        'ambiguous' => 'Waiting for verification',
        default => 'In progress',
    };

    $receiptNumber = null;
    if ($verified || $partial) {
        $r = $pdo->prepare(
            'SELECT receipt_number FROM payment_receipts WHERE payment_claim_id = (
                SELECT id FROM payment_claims WHERE claim_ref = ? LIMIT 1
             ) ORDER BY id DESC LIMIT 1'
        );
        $r->execute([$claimRef]);
        $receiptNumber = $r->fetchColumn() ?: null;
    }

    echo json_encode([
        'success' => true,
        'claim_ref' => $row['claim_ref'],
        'status' => $claimStatus,
        'status_label' => $statusLabel,
        'amount_ugx' => (int) $row['amount_ugx'],
        'amount_label' => uln_format_ugx((int) $row['amount_ugx']),
        'provider' => $row['provider'],
        'provider_label' => $meta['display_name'] ?? strtoupper((string) $row['provider']),
        'package' => $row['package'],
        'package_title' => $meta['package_title'] ?? $row['package'],
        'customer_name' => $row['customer_name'],
        'submitted_at' => $row['submitted_at'],
        'paid' => $verified || $partial,
        'verified' => $verified,
        'receipt_number' => $receiptNumber,
        'message' => $verified
            ? 'Payment confirmed. We’ve received your payment and your package is confirmed. Our team will contact you about next steps.'
            : ($partial
                ? 'We received part of the deposit. Contact us about the balance.'
                : 'We’re checking your payment against our merchant account — usually within one working day.'),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not load status. Please try again.',
    ]);
}
