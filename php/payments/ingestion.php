<?php

declare(strict_types=1);

/**
 * Transaction ingestion — adapter/webhook → unmatched queue (idempotent).
 * Never auto-verifies. Admin still confirms matches (human-in-the-loop).
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/momo_schema.php';
require_once __DIR__ . '/providers/ProviderRegistry.php';
require_once __DIR__ . '/providers/normalize.php';
require_once __DIR__ . '/matching.php';

/**
 * @param array<string,mixed> $normalized from uln_payment_normalized_txn / adapter
 * @return array{status:string,transaction_id:?int,created:bool,suggested_claims:list<array>,message:string}
 */
function uln_payment_ingest_normalized_transaction(
    PDO $pdo,
    array $normalized,
    string $actor = 'adapter',
    bool $dryRun = false
): array {
    uln_ensure_payment_verify_tables($pdo);

    // Validate via shared normalizer (re-run for safety)
    $txn = uln_payment_normalized_txn(
        (string) $normalized['provider'],
        (string) $normalized['transaction_reference'],
        (string) $normalized['actual_payer_phone'],
        (int) $normalized['amount_ugx'],
        (string) $normalized['transaction_at'],
        $normalized['actual_payer_name'] ?? null,
        (string) ($normalized['currency'] ?? 'UGX'),
        $normalized['merchant_context'] ?? null,
        $normalized['evidence_reference'] ?? null,
        $normalized['notes'] ?? null,
        (string) ($normalized['source'] ?? 'adapter')
    );

    $suggested = uln_payment_suggest_claims_for_txn($pdo, $txn);

    $dup = $pdo->prepare(
        'SELECT id, status FROM payment_transactions WHERE provider = ? AND transaction_reference = ? LIMIT 1'
    );
    $dup->execute([$txn['provider'], $txn['transaction_reference']]);
    $existing = $dup->fetch();

    if ($existing) {
        return [
            'status' => (string) $existing['status'],
            'transaction_id' => (int) $existing['id'],
            'created' => false,
            'suggested_claims' => $suggested,
            'message' => 'Transaction reference already recorded (idempotent).',
            'dry_run' => $dryRun,
        ];
    }

    if ($dryRun) {
        return [
            'status' => 'would_create_unmatched',
            'transaction_id' => null,
            'created' => false,
            'suggested_claims' => $suggested,
            'message' => 'Dry run: would insert as unmatched for admin review.',
            'dry_run' => true,
            'preview' => $txn,
        ];
    }

    $ins = $pdo->prepare(
        'INSERT INTO payment_transactions
         (provider, transaction_reference, actual_payer_phone, actual_payer_name, amount_ugx,
          transaction_at, merchant_context, notes, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $notes = trim((string) ($txn['notes'] ?? ''));
    $sourceNote = 'source=' . ($txn['source'] ?? 'adapter');
    $notes = $notes === '' ? $sourceNote : ($notes . "\n" . $sourceNote);

    $ins->execute([
        $txn['provider'],
        $txn['transaction_reference'],
        $txn['actual_payer_phone'],
        $txn['actual_payer_name'],
        $txn['amount_ugx'],
        $txn['transaction_at'],
        $txn['merchant_context'],
        $notes,
        'unmatched',
        mb_substr($actor, 0, 120),
    ]);
    $id = (int) $pdo->lastInsertId();

    uln_payment_audit(
        $pdo,
        'payment_transaction',
        (string) $id,
        'ingest_unmatched',
        $actor,
        null,
        $txn
    );

    return [
        'status' => 'unmatched',
        'transaction_id' => $id,
        'created' => true,
        'suggested_claims' => $suggested,
        'message' => 'Ingested as unmatched. Admin must review and attach — never auto-verified.',
        'dry_run' => false,
    ];
}

/**
 * Attempt provider fetch → ingest. Stubs refuse until official HTTP clients exist.
 *
 * @return array{adapter:array,results:list<array>,error:?string}
 */
function uln_payment_pull_from_adapter(string $providerId, array $options = [], bool $dryRun = true): array
{
    $registry = new UlnPaymentProviderRegistry();
    $adapter = $registry->get($providerId);
    if (!$adapter) {
        throw new InvalidArgumentException('Unknown provider adapter: ' . $providerId);
    }

    $caps = $adapter->capabilities();
    if ($providerId === 'manual') {
        return [
            'adapter' => $caps,
            'results' => [],
            'error' => 'Manual adapter does not pull. Use Payments UI.',
        ];
    }

    try {
        $rows = $adapter->fetchRecentTransactions($options);
    } catch (Throwable $e) {
        return [
            'adapter' => $caps,
            'results' => [],
            'error' => $e->getMessage(),
        ];
    }

    $pdo = uln_payment_pdo();
    $results = [];
    foreach ($rows as $raw) {
        $normalized = is_array($raw) && isset($raw['transaction_reference'])
            ? $raw
            : $adapter->normalizeRawTransaction(is_array($raw) ? $raw : []);
        $results[] = uln_payment_ingest_normalized_transaction(
            $pdo,
            $normalized,
            $adapter->providerId() . '_pull',
            $dryRun
        );
    }

    return [
        'adapter' => $caps,
        'results' => $results,
        'error' => null,
    ];
}
