<?php

declare(strict_types=1);

/**
 * Provider-agnostic MoMo match analysis (admin assist — human confirms).
 */

require_once __DIR__ . '/momo_schema.php';

/**
 * @param array<string,mixed> $claimRow joined claim+session
 * @param array<string,mixed> $txn
 * @return array{confidence:string,summary:list<string>,checks:array<string,bool|string>,competing:list<array>}
 */
function uln_payment_match_analyze(PDO $pdo, array $claimRow, array $txn): array
{
    $checks = [];
    $summary = [];

    $providerOk = strtolower((string) ($claimRow['provider'] ?? '')) === strtolower((string) ($txn['provider'] ?? ''));
    $checks['provider'] = $providerOk;
    $summary[] = $providerOk ? 'Provider matches.' : 'Provider does not match the claim.';

    $expected = (int) ($claimRow['amount_ugx'] ?? 0);
    $actual = (int) ($txn['amount_ugx'] ?? 0);
    if ($actual === $expected) {
        $checks['amount'] = 'exact';
        $checks['expected_ugx'] = $expected;
        $checks['received_ugx'] = $actual;
        $checks['balance_ugx'] = 0;
        $checks['excess_ugx'] = 0;
        $summary[] = 'Amount matches exactly.';
    } elseif ($actual < $expected) {
        $checks['amount'] = 'partial';
        $checks['expected_ugx'] = $expected;
        $checks['received_ugx'] = $actual;
        $checks['balance_ugx'] = $expected - $actual;
        $checks['excess_ugx'] = 0;
        $summary[] = 'PARTIAL: required ' . number_format($expected) . ', received ' . number_format($actual)
            . ', remaining ' . number_format($expected - $actual) . '.';
    } elseif ($actual > $expected) {
        $checks['amount'] = 'over';
        $checks['expected_ugx'] = $expected;
        $checks['received_ugx'] = $actual;
        $checks['balance_ugx'] = 0;
        $checks['excess_ugx'] = $actual - $expected;
        $summary[] = 'OVERPAYMENT: required ' . number_format($expected) . ', received ' . number_format($actual)
            . ', excess ' . number_format($actual - $expected) . '. Administrator review required.';
    } else {
        $checks['amount'] = 'none';
        $checks['expected_ugx'] = $expected;
        $checks['received_ugx'] = $actual;
        $checks['balance_ugx'] = null;
        $checks['excess_ugx'] = null;
        $summary[] = 'Amount could not be compared.';
    }

    $claimedPhone = (string) ($claimRow['claimed_payer_phone'] ?? '');
    $customerPhone = (string) (($claimRow['country_code'] ?? '') . ($claimRow['customer_phone'] ?? ''));
    $txnPhone = (string) ($txn['actual_payer_phone'] ?? '');
    $phoneOk = uln_payment_phones_match($txnPhone, $claimedPhone)
        || uln_payment_phones_match($txnPhone, $customerPhone);
    $checks['payer_phone'] = $phoneOk;
    $summary[] = $phoneOk ? 'Payer phone matches the claim.' : 'Payer phone does not clearly match.';

    $claimedName = strtoupper(trim((string) ($claimRow['claimed_payer_name'] ?? '')));
    $txnName = strtoupper(trim((string) ($txn['actual_payer_name'] ?? '')));
    $nameOk = false;
    if ($claimedName !== '' && $txnName !== '') {
        $nameOk = $claimedName === $txnName
            || str_contains($txnName, $claimedName)
            || str_contains($claimedName, $txnName);
    }
    $checks['payer_name'] = $nameOk;
    if ($txnName === '') {
        $summary[] = 'Registered payer name was not entered.';
    } else {
        $summary[] = $nameOk ? 'Payer name looks consistent.' : 'Payer name differs from the claim.';
    }

    $competing = [];
    $stmt = $pdo->prepare(
        "SELECT c.id, c.claim_ref, s.customer_name, s.amount_ugx, s.package, c.submitted_at
         FROM payment_claims c
         INNER JOIN payment_sessions s ON s.id = c.payment_session_id
         WHERE c.status = 'awaiting_verification'
           AND c.provider = ?
           AND s.amount_ugx = ?
           AND c.id <> ?
         ORDER BY c.submitted_at ASC
         LIMIT 5"
    );
    $stmt->execute([
        strtolower((string) $txn['provider']),
        $actual,
        (int) ($claimRow['claim_id'] ?? $claimRow['id'] ?? 0),
    ]);
    foreach ($stmt->fetchAll() as $row) {
        $competing[] = [
            'claim_id' => (int) $row['id'],
            'claim_ref' => $row['claim_ref'],
            'customer_name' => $row['customer_name'],
            'amount_ugx' => (int) $row['amount_ugx'],
            'package' => $row['package'],
            'submitted_at' => $row['submitted_at'],
        ];
    }
    $checks['competing'] = count($competing);
    if ($competing === []) {
        $summary[] = 'No competing open claims with the same amount.';
    } else {
        $summary[] = 'Other open claims have the same provider and amount — review carefully.';
    }

    $score = 0;
    if ($providerOk) {
        $score += 2;
    }
    if (($checks['amount'] ?? '') === 'exact') {
        $score += 2;
    } elseif (in_array($checks['amount'] ?? '', ['partial', 'over'], true)) {
        $score += 1;
    }
    if ($phoneOk) {
        $score += 2;
    }
    if ($nameOk) {
        $score += 1;
    }
    if ($competing !== []) {
        $score -= 2;
    }

    if ($score >= 6 && $competing === [] && ($checks['amount'] ?? '') === 'exact') {
        $confidence = 'high';
    } elseif ($score >= 4 && $competing === []) {
        $confidence = 'medium';
    } elseif ($competing !== [] || !$providerOk) {
        $confidence = 'ambiguous';
    } else {
        $confidence = 'low';
    }

    return [
        'confidence' => $confidence,
        'summary' => $summary,
        'checks' => $checks,
        'competing' => $competing,
    ];
}

/**
 * Suggest open claims that might match an unmatched merchant transaction.
 *
 * @return list<array>
 */
function uln_payment_suggest_claims_for_txn(PDO $pdo, array $txn, int $limit = 8): array
{
    $provider = strtolower((string) ($txn['provider'] ?? ''));
    $amount = (int) ($txn['amount_ugx'] ?? 0);
    $phone = (string) ($txn['actual_payer_phone'] ?? '');
    $digits = uln_payment_phone_digits($phone);
    $tail = strlen($digits) >= 9 ? substr($digits, -9) : $digits;

    $stmt = $pdo->prepare(
        "SELECT c.id AS claim_id, c.claim_ref, c.provider, c.status AS claim_status,
                c.claimed_payer_phone, c.submitted_at,
                s.customer_name, s.customer_phone, s.country_code, s.package, s.amount_ugx
         FROM payment_claims c
         INNER JOIN payment_sessions s ON s.id = c.payment_session_id
         WHERE c.status IN ('awaiting_verification', 'ambiguous', 'not_found')
           AND (? = '' OR c.provider = ?)
         ORDER BY c.submitted_at ASC
         LIMIT 40"
    );
    $stmt->execute([$provider, $provider]);
    $out = [];
    foreach ($stmt->fetchAll() as $row) {
        $score = 0;
        $reasons = [];
        if ($provider !== '' && strtolower((string) $row['provider']) === $provider) {
            $score += 2;
            $reasons[] = 'provider';
        }
        $expected = (int) $row['amount_ugx'];
        if ($amount > 0 && $expected === $amount) {
            $score += 3;
            $reasons[] = 'amount';
        } elseif ($amount > 0 && abs($expected - $amount) <= max(5000, (int) round($expected * 0.05))) {
            $score += 1;
            $reasons[] = 'amount_near';
        }
        $claimPhone = (string) (($row['country_code'] ?? '') . ($row['customer_phone'] ?? ''));
        if ($tail !== '' && (
            uln_payment_phones_match($phone, (string) $row['claimed_payer_phone'])
            || uln_payment_phones_match($phone, $claimPhone)
        )) {
            $score += 3;
            $reasons[] = 'phone';
        }
        if ($score < 3) {
            continue;
        }
        $out[] = [
            'claim_id' => (int) $row['claim_id'],
            'claim_ref' => $row['claim_ref'],
            'customer_name' => $row['customer_name'],
            'package' => $row['package'],
            'amount_ugx' => $expected,
            'provider' => $row['provider'],
            'submitted_at' => $row['submitted_at'],
            'score' => $score,
            'reasons' => $reasons,
        ];
    }
    usort($out, static fn($a, $b) => $b['score'] <=> $a['score']);

    return array_slice($out, 0, $limit);
}
