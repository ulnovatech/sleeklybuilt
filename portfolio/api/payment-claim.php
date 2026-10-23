<?php

declare(strict_types=1);

/**
 * Create MoMo payment session + customer claim.
 * Does NOT mark paid / verified. Customer never submits a MoMo transaction reference.
 *
 * Website path: package = basic|smart|premium, requires layout/template key.
 * Subscription path: product|package = attendant-monthly (isolated); no template catalog check.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/cors.php';
require_once __DIR__ . '/lib/schema.php';
require_once __DIR__ . '/../../../php/leads/rate_limit.php';
require_once __DIR__ . '/../../../php/payments/packages.php';

uln_portfolio_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

uln_rate_limit('payment_claim', 8, 3600);

$data = uln_json_input();

$productHint = trim((string) ($data['product'] ?? ''));
$packageId = trim((string) ($data['package'] ?? ''));
if ($packageId === '' && $productHint !== '') {
    $packageId = $productHint;
}
if ($packageId === '') {
    $packageId = 'basic';
}

$isSubscription = uln_is_subscription_product($packageId)
    || ($productHint !== '' && uln_is_subscription_product($productHint));

if ($isSubscription && $productHint !== '' && uln_is_subscription_product($productHint)) {
    $packageId = $productHint;
}

$fullName = trim((string) ($data['fullName'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$countryCode = trim((string) ($data['countryCode'] ?? '+256'));
$businessName = trim((string) ($data['businessName'] ?? ''));
$notes = trim((string) ($data['notes'] ?? ''));
$websiteUrl = trim((string) ($data['websiteUrl'] ?? $data['website'] ?? ''));
$needsHostedLink = !empty($data['needsHostedLink']) || !empty($data['hostedLink']);
$provider = strtolower(trim((string) ($data['provider'] ?? '')));
$payerIsCustomer = !isset($data['payerIsCustomer']) || (bool) $data['payerIsCustomer'];
$payerName = trim((string) ($data['payerName'] ?? ''));
$payerPhone = trim((string) ($data['payerPhone'] ?? ''));

if ($fullName === '' || $phone === '' || $email === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Full name, email, and phone are required.',
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

if (!in_array($provider, ['mtn', 'airtel'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Choose MTN or Airtel to continue.']);
    exit;
}

if (!$payerIsCustomer) {
    if ($payerName === '' || $payerPhone === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Enter the payer’s name and Mobile Money phone number.',
            'details' => [
                'payerName' => $payerName === '' ? 'Required' : null,
                'payerPhone' => $payerPhone === '' ? 'Required' : null,
            ],
        ]);
        exit;
    }
}

try {
    if ($isSubscription) {
        $product = uln_subscription_product_or_fail($packageId);
        $templateKey = (string) $product['template_key'];
        $amountUgx = (int) $product['amount_ugx'];
        $productTitle = (string) $product['title'];
        $productKind = 'subscription';

        if ($businessName === '') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Business name is required for Sleekly Attendant.',
            ]);
            exit;
        }

        if ($websiteUrl !== '' && !preg_match('#^https?://#i', $websiteUrl)) {
            $websiteUrl = 'https://' . $websiteUrl;
        }

        $noteParts = [];
        if ($notes !== '') {
            $noteParts[] = $notes;
        }
        if ($websiteUrl !== '') {
            $noteParts[] = 'Website: ' . $websiteUrl;
        }
        if ($needsHostedLink || $websiteUrl === '') {
            $noteParts[] = 'Delivery: hosted attendant link (or website TBD)';
        }
        $notes = implode("\n", $noteParts);
    } else {
        // Website deposit path — never accept subscription ids via uln_packages().
        if (uln_is_subscription_product($packageId)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Use the Attendant order form for this product.',
            ]);
            exit;
        }

        $templateKey = trim((string) ($data['template'] ?? $data['websiteName'] ?? ''));
        if ($templateKey === '') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Template, full name, email, and phone are required.',
            ]);
            exit;
        }

        $package = uln_package_or_fail($packageId);
        $amountUgx = (int) $package['deposit_ugx'];
        $productTitle = (string) $package['title'];
        $productKind = 'website';
    }
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

try {
    uln_ensure_payment_claims_tables($pdo);

    $providers = uln_load_active_payment_providers($pdo);
    $selected = null;
    foreach ($providers as $row) {
        if ($row['provider'] === $provider && $row['configured']) {
            $selected = $row;
            break;
        }
    }
    if ($selected === null) {
        http_response_code(503);
        echo json_encode([
            'success' => false,
            'message' => 'That payment method is not available right now. Try the other network or request a quote.',
            'code' => 'provider_unavailable',
        ]);
        exit;
    }

    if (!$isSubscription) {
        $stmt = $pdo->prepare(
            "SELECT id FROM templates
             WHERE (name = ? OR folder_name = ?)
               AND status = 'available'
             LIMIT 1"
        );
        $stmt->execute([$templateKey, $templateKey]);
        $template = $stmt->fetch();

        // Allow custom / no-catalog orders (quote path) when template row missing.
        if (!$template && $templateKey !== '' && !preg_match('/^[a-z0-9._-]+$/i', $templateKey)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid layout name.']);
            exit;
        }
    }

    $claimRef = uln_generate_claim_ref();
    $claimedPayerName = $payerIsCustomer ? $fullName : $payerName;
    $claimedPayerPhone = $payerIsCustomer
        ? preg_replace('/\s+/', '', $countryCode . $phone)
        : preg_replace('/\s+/', '', $payerPhone);

    $claimMeta = [
        'package_title' => $productTitle,
        'display_name' => $selected['display_name'],
        'product_kind' => $productKind,
    ];
    if ($isSubscription) {
        $claimMeta['website_url'] = $websiteUrl !== '' ? $websiteUrl : null;
        $claimMeta['needs_hosted_link'] = $needsHostedLink || $websiteUrl === '';
        $claimMeta['country'] = $countryCode;
    }

    $pdo->beginTransaction();

    $insertSession = $pdo->prepare(
        'INSERT INTO payment_sessions
         (session_ref, template_key, customer_name, customer_email, customer_phone, country_code,
          business_name, notes, package, amount_ugx, provider, merchant_identifier_snapshot, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertSession->execute([
        $claimRef,
        $templateKey,
        $fullName,
        $email,
        $phone,
        $countryCode,
        $businessName !== '' ? $businessName : null,
        $notes !== '' ? $notes : null,
        $packageId,
        $amountUgx,
        $provider,
        $selected['merchant_identifier'],
        'awaiting_verification',
    ]);
    $sessionId = (int) $pdo->lastInsertId();

    $insertClaim = $pdo->prepare(
        'INSERT INTO payment_claims
         (claim_ref, payment_session_id, provider, payer_is_customer, claimed_payer_name, claimed_payer_phone, status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertClaim->execute([
        $claimRef,
        $sessionId,
        $provider,
        $payerIsCustomer ? 1 : 0,
        $claimedPayerName,
        $claimedPayerPhone,
        'awaiting_verification',
        json_encode($claimMeta, JSON_UNESCAPED_UNICODE),
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'We’ve received your payment notification. We’ll verify it against our merchant account.',
        'claim_ref' => $claimRef,
        'status' => 'awaiting_verification',
        'amount_ugx' => $amountUgx,
        'amount_label' => uln_format_ugx($amountUgx),
        'provider' => $provider,
        'provider_label' => $selected['display_name'],
        'package' => $packageId,
        'package_title' => $productTitle,
        'product_kind' => $productKind,
        'customer_phone' => $phone,
        'country_code' => $countryCode,
        // Explicit: claim is not paid
        'paid' => false,
        'verified' => false,
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not record your claim. Please try again or contact us.',
    ]);
}
