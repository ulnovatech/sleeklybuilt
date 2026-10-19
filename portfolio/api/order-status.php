<?php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/cors.php';
require_once __DIR__ . '/lib/schema.php';
require_once __DIR__ . '/../../../php/leads/rate_limit.php';
require_once __DIR__ . '/../../../php/payments/packages.php';
require_once __DIR__ . '/../../../php/lib/phone.php';

uln_portfolio_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

uln_rate_limit('order_status', 20, 3600);

$data = uln_json_input();
$txRef = trim($data['tx_ref'] ?? $data['reference'] ?? '');
$phone = trim($data['phone'] ?? '');
$countryCode = trim($data['countryCode'] ?? '+256');

if ($txRef === '' || $phone === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Payment reference and phone number are required.',
    ]);
    exit;
}

$fullPhone = preg_replace('/\s+/', '', $countryCode . $phone);

try {
    // MoMo claim refs (SB-PAY-*) — Phase 2+ track path (no Flutterwave)
    if (stripos($txRef, 'SB-PAY-') === 0) {
        require_once __DIR__ . '/../../../php/payments/momo_schema.php';
        uln_ensure_payment_claims_tables($pdo);

        $claimRef = strtoupper($txRef);
        $stmt = $pdo->prepare(
            'SELECT c.claim_ref, c.status AS claim_status, c.submitted_at, c.claimed_payer_phone, c.metadata,
                    s.customer_name, s.customer_phone, s.country_code, s.template_key, s.package, s.amount_ugx
             FROM payment_claims c
             INNER JOIN payment_sessions s ON s.id = c.payment_session_id
             WHERE c.claim_ref = ?
             LIMIT 1'
        );
        $stmt->execute([$claimRef]);
        $claim = $stmt->fetch();

        if (!$claim) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'No order found with that reference. Check your payment claim reference and try again.',
                'code' => 'not_found',
            ]);
            exit;
        }

        $phoneOk = uln_phones_match(
            ($claim['country_code'] ?? '') . ($claim['customer_phone'] ?? ''),
            $fullPhone
        ) || uln_phones_match($claim['customer_phone'], $phone)
            || uln_phones_match($claim['claimed_payer_phone'] ?? '', $phone)
            || uln_phones_match($claim['claimed_payer_phone'] ?? '', $fullPhone);

        if (!$phoneOk) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Phone number does not match this order reference.',
                'code' => 'phone_mismatch',
            ]);
            exit;
        }

        $packages = uln_packages();
        $packageMeta = $packages[$claim['package']] ?? [
            'title' => ucfirst((string) $claim['package']),
            'price_ugx' => 0,
        ];
        $meta = json_decode((string) ($claim['metadata'] ?? ''), true);
        if (is_array($meta) && !empty($meta['package_title'])) {
            $packageMeta['title'] = $meta['package_title'];
        }

        $st = (string) $claim['claim_status'];
        $verified = $st === 'verified' || $st === 'overpaid';
        $partial = $st === 'partial';
        $statusMap = [
            'awaiting_verification' => [
                'label' => 'Waiting for verification',
                'headline' => "We're checking your payment",
                'next_step' => 'We verify against our merchant account — usually within one working day. You do not need a MoMo transaction reference.',
            ],
            'verified' => [
                'label' => 'Payment confirmed',
                'headline' => 'Deposit verified — we\'ll start building soon',
                'next_step' => 'Our team will contact you for business details and next steps.',
            ],
            'partial' => [
                'label' => 'Partial payment received',
                'headline' => 'We received part of your deposit',
                'next_step' => 'Contact us about the remaining balance.',
            ],
            'overpaid' => [
                'label' => 'Payment received',
                'headline' => 'Deposit received — we\'ll start building soon',
                'next_step' => 'Your package is confirmed. Our team will contact you; if the amount differs from expected, we\'ll follow up.',
            ],
            'rejected' => [
                'label' => 'Could not verify yet',
                'headline' => "We couldn't match a payment yet",
                'next_step' => 'Contact us with your claim reference and we will help.',
            ],
            'not_found' => [
                'label' => 'Payment not found yet',
                'headline' => "We couldn't match a payment yet",
                'next_step' => 'If you already paid, contact us with your claim reference.',
            ],
            'ambiguous' => [
                'label' => 'Waiting for verification',
                'headline' => "We're checking your payment",
                'next_step' => 'Our team is reviewing your claim. Keep your reference handy.',
            ],
        ];
        $statusInfo = $statusMap[$st] ?? $statusMap['awaiting_verification'];

        $timeline = [
            ['id' => 'submitted', 'label' => 'Details submitted', 'done' => true],
            ['id' => 'claimed', 'label' => 'Payment claimed', 'done' => true],
            ['id' => 'deposit', 'label' => 'Deposit verified', 'done' => $verified || $partial],
            ['id' => 'build', 'label' => 'Project in progress', 'done' => false],
            ['id' => 'launch', 'label' => 'Ready to launch', 'done' => false],
        ];

        echo json_encode([
            'success' => true,
            'order' => [
                'reference' => $claim['claim_ref'],
                'status' => $st,
                'status_label' => $statusInfo['label'],
                'headline' => $statusInfo['headline'],
                'next_step' => $statusInfo['next_step'],
                'customer_name' => $claim['customer_name'],
                'template' => $claim['template_key'],
                'package' => $claim['package'],
                'package_title' => $packageMeta['title'],
                'deposit_label' => uln_format_ugx((int) $claim['amount_ugx']),
                'package_total_label' => (int) ($packageMeta['price_ugx'] ?? 0) > 0
                    ? uln_format_ugx((int) $packageMeta['price_ugx'])
                    : null,
                'template_reserved' => false,
                'submitted_at' => $claim['submitted_at'],
                'paid_at' => ($verified || $partial) ? $claim['submitted_at'] : null,
                'timeline' => $timeline,
            ],
        ]);
        exit;
    }

    uln_ensure_order_payments_table($pdo);

    $stmt = $pdo->prepare('SELECT * FROM order_payments WHERE tx_ref = ? LIMIT 1');
    $stmt->execute([$txRef]);
    $payment = $stmt->fetch();

    if (!$payment) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No order found with that reference. Check your payment confirmation SMS or email.',
            'code' => 'not_found',
        ]);
        exit;
    }

    $storedPhone = preg_replace('/\s+/', '', ($payment['country_code'] ?? '') . ($payment['customer_phone'] ?? ''));
    if (!uln_phones_match($storedPhone, $fullPhone) && !uln_phones_match($payment['customer_phone'], $phone)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Phone number does not match this order reference.',
            'code' => 'phone_mismatch',
        ]);
        exit;
    }

    $packages = uln_packages();
    $packageMeta = $packages[$payment['package']] ?? [
        'title' => ucfirst($payment['package']),
        'price_ugx' => 0,
    ];
    $status = $payment['status'];
    $templateReserved = false;

    if ($status === 'successful') {
        $stmt = $pdo->prepare(
            "SELECT status FROM templates
             WHERE (name = ? OR folder_name = ?)
               AND status IN ('reserved', 'taken')
             LIMIT 1"
        );
        $stmt->execute([$payment['template_key'], $payment['template_key']]);
        $templateReserved = (bool) $stmt->fetch();
    }

    $statusMap = [
        'pending' => [
            'label' => 'Awaiting payment',
            'headline' => 'Complete your deposit to start your build',
            'next_step' => 'Finish your deposit with MTN Mobile Money or Airtel Money, or start again from the portfolio.',
        ],
        'successful' => [
            'label' => 'Deposit confirmed',
            'headline' => 'Deposit confirmed — we\'ll start building soon',
            'next_step' => 'Our team will contact you within 24 hours for your business details.',
        ],
        'failed' => [
            'label' => 'Payment failed',
            'headline' => 'This payment did not go through',
            'next_step' => 'Try again from the portfolio or contact us for help.',
        ],
        'cancelled' => [
            'label' => 'Payment cancelled',
            'headline' => 'Checkout was cancelled',
            'next_step' => 'You can choose a template again anytime from our portfolio.',
        ],
    ];

    $statusInfo = $statusMap[$status] ?? $statusMap['pending'];

    $timeline = [
        ['id' => 'submitted', 'label' => 'Details submitted', 'done' => true],
        ['id' => 'deposit', 'label' => 'Deposit paid', 'done' => $status === 'successful'],
        ['id' => 'reserved', 'label' => 'Build scheduled', 'done' => $status === 'successful' && $templateReserved],
        ['id' => 'build', 'label' => 'Project in progress', 'done' => false],
        ['id' => 'launch', 'label' => 'Ready to launch', 'done' => false],
    ];

    echo json_encode([
        'success' => true,
        'order' => [
            'reference' => $payment['tx_ref'],
            'status' => $status,
            'status_label' => $statusInfo['label'],
            'headline' => $statusInfo['headline'],
            'next_step' => $statusInfo['next_step'],
            'customer_name' => $payment['customer_name'],
            'template' => $payment['template_key'],
            'package' => $payment['package'],
            'package_title' => $packageMeta['title'],
            'deposit_label' => uln_format_ugx((int) $payment['amount_ugx']),
            'package_total_label' => (int) ($packageMeta['price_ugx'] ?? 0) > 0
                ? uln_format_ugx((int) $packageMeta['price_ugx'])
                : null,
            'template_reserved' => $templateReserved,
            'submitted_at' => $payment['created_at'],
            'paid_at' => $payment['paid_at'],
            'timeline' => $timeline,
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not look up your order. Please try again.',
    ]);
}
