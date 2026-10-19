<?php

declare(strict_types=1);

/**
 * Shared helpers for provider adapters → common transaction model.
 *
 * Shape (PAYMENT_SYSTEM §51 / §75):
 * provider, transaction_reference, actual_payer_phone, actual_payer_name,
 * amount_ugx, currency, transaction_at, merchant_context, evidence_reference, notes, source
 */

function uln_payment_normalized_txn(
    string $provider,
    string $transactionReference,
    string $payerPhone,
    int $amountUgx,
    string $transactionAt,
    ?string $payerName = null,
    string $currency = 'UGX',
    ?string $merchantContext = null,
    ?string $evidenceReference = null,
    ?string $notes = null,
    string $source = 'adapter'
): array {
    $provider = strtolower(trim($provider));
    if (!in_array($provider, ['mtn', 'airtel'], true)) {
        throw new InvalidArgumentException('provider must be mtn or airtel');
    }
    $ref = trim($transactionReference);
    $phone = trim($payerPhone);
    if ($ref === '' || $phone === '' || $amountUgx <= 0) {
        throw new InvalidArgumentException('transaction_reference, payer phone, and positive amount are required');
    }
    $ts = strtotime($transactionAt);
    if ($ts === false) {
        throw new InvalidArgumentException('transaction_at is invalid');
    }

    return [
        'provider' => $provider,
        'transaction_reference' => mb_substr($ref, 0, 120),
        'actual_payer_phone' => mb_substr($phone, 0, 64),
        'actual_payer_name' => $payerName !== null && trim($payerName) !== ''
            ? mb_substr(trim($payerName), 0, 255)
            : null,
        'amount_ugx' => $amountUgx,
        'currency' => strtoupper($currency) ?: 'UGX',
        'transaction_at' => date('Y-m-d H:i:s', $ts),
        'merchant_context' => $merchantContext !== null
            ? mb_substr(trim($merchantContext), 0, 120)
            : null,
        'evidence_reference' => $evidenceReference,
        'notes' => $notes,
        'source' => $source,
    ];
}
