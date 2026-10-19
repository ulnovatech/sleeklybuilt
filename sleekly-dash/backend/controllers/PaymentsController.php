<?php

declare(strict_types=1);

/**
 * Admin MoMo payment queue + verify (Phase 3).
 * Client cannot reach these endpoints; verified only via explicit confirm.
 */

require_once __DIR__ . '/../../../php/payments/db.php';
require_once __DIR__ . '/../../../php/payments/momo_schema.php';
require_once __DIR__ . '/../../../php/payments/matching.php';
require_once __DIR__ . '/../../../php/payments/packages.php';
require_once __DIR__ . '/../../../php/payments/activate.php';
require_once __DIR__ . '/../../../php/payments/notify.php';
require_once __DIR__ . '/../../../php/payments/ingestion.php';
require_once __DIR__ . '/../../../php/payments/providers/ProviderRegistry.php';

class PaymentsController
{
    private PDO $pdo;

    public function __construct(?PDO $pdo = null)
    {
        $this->pdo = $pdo ?? uln_payment_pdo();
        uln_ensure_payment_verify_tables($this->pdo);
        uln_ensure_payment_provider_config($this->pdo);
        uln_ensure_payment_activation_tables($this->pdo);
        uln_ensure_payment_notification_tables($this->pdo);
    }

    private function requireAdmin(?array $actor): void
    {
        $role = (string) ($actor['role'] ?? '');
        if ($role !== 'admin') {
            respond(['error' => 'Only admins can manage payment verification.'], 403);
        }
    }

    private function actorLabel(?array $actor): string
    {
        return trim((string) ($actor['email'] ?? $actor['name'] ?? $actor['username'] ?? $actor['id'] ?? 'admin'));
    }

    public function queue(array $query): array
    {
        $filter = strtolower(trim((string) ($query['filter'] ?? 'awaiting')));
        $allowed = ['awaiting', 'ambiguous', 'unmatched', 'verified', 'rejected', 'overpaid', 'all'];
        if (!in_array($filter, $allowed, true)) {
            $filter = 'awaiting';
        }

        $counts = $this->counts();

        $sql = 'SELECT c.id AS claim_id, c.claim_ref, c.provider, c.status AS claim_status,
                       c.claimed_payer_name, c.claimed_payer_phone, c.submitted_at, c.metadata,
                       s.id AS session_id, s.customer_name, s.customer_email, s.customer_phone,
                       s.country_code, s.package, s.amount_ugx, s.template_key, s.status AS session_status
                FROM payment_claims c
                INNER JOIN payment_sessions s ON s.id = c.payment_session_id';
        $params = [];

        if ($filter === 'awaiting') {
            $sql .= " WHERE c.status = 'awaiting_verification'";
        } elseif ($filter === 'verified') {
            $sql .= " WHERE c.status IN ('verified','partial')";
        } elseif ($filter === 'overpaid') {
            $sql .= " WHERE c.status = 'overpaid'";
        } elseif ($filter === 'rejected') {
            $sql .= " WHERE c.status IN ('rejected','not_found')";
        } elseif ($filter === 'ambiguous') {
            $sql .= " WHERE c.status = 'ambiguous'";
        } elseif ($filter === 'unmatched') {
            // Unmatched queue is transaction-centric; claim list left empty.
            $sql .= ' WHERE 1 = 0';
        }

        $sql .= ' ORDER BY c.submitted_at ASC LIMIT 200';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $items = array_map(fn(array $row) => $this->mapQueueRow($row), $rows);

        $unmatched = [];
        if ($filter === 'unmatched' || $filter === 'all') {
            $txnRows = $this->pdo->query(
                "SELECT id, provider, transaction_reference, actual_payer_phone, actual_payer_name,
                        amount_ugx, transaction_at, notes, status, created_at
                 FROM payment_transactions
                 WHERE status = 'unmatched'
                 ORDER BY created_at DESC
                 LIMIT 100"
            )->fetchAll();
            foreach ($txnRows as $txn) {
                $txn['suggested_claims'] = uln_payment_suggest_claims_for_txn($this->pdo, $txn);
                $unmatched[] = $txn;
            }
        }

        return [
            'filter' => $filter,
            'counts' => $counts,
            'items' => $items,
            'unmatched_transactions' => $unmatched,
        ];
    }

    private function counts(): array
    {
        $out = [
            'awaiting' => 0,
            'ambiguous' => 0,
            'verified' => 0,
            'overpaid' => 0,
            'rejected' => 0,
            'unmatched' => 0,
        ];
        $rows = $this->pdo->query(
            "SELECT status, COUNT(*) AS n FROM payment_claims GROUP BY status"
        )->fetchAll();
        foreach ($rows as $row) {
            $st = (string) $row['status'];
            $n = (int) $row['n'];
            if ($st === 'awaiting_verification') {
                $out['awaiting'] = $n;
            } elseif ($st === 'ambiguous') {
                $out['ambiguous'] = $n;
            } elseif ($st === 'overpaid') {
                $out['overpaid'] = $n;
            } elseif (in_array($st, ['verified', 'partial'], true)) {
                $out['verified'] += $n;
            } elseif (in_array($st, ['rejected', 'not_found'], true)) {
                $out['rejected'] += $n;
            }
        }
        $out['unmatched'] = (int) $this->pdo->query(
            "SELECT COUNT(*) FROM payment_transactions WHERE status = 'unmatched'"
        )->fetchColumn();

        return $out;
    }

    private function mapQueueRow(array $row): array
    {
        $meta = json_decode((string) ($row['metadata'] ?? ''), true);
        if (!is_array($meta)) {
            $meta = [];
        }
        $packages = uln_packages();
        $pkg = $packages[$row['package']] ?? null;

        return [
            'claim_id' => (int) $row['claim_id'],
            'claim_ref' => $row['claim_ref'],
            'provider' => $row['provider'],
            'status' => $row['claim_status'],
            'customer_name' => $row['customer_name'],
            'customer_email' => $row['customer_email'],
            'customer_phone' => $row['customer_phone'],
            'country_code' => $row['country_code'],
            'package' => $row['package'],
            'package_title' => $meta['package_title'] ?? ($pkg['title'] ?? $row['package']),
            'amount_ugx' => (int) $row['amount_ugx'],
            'amount_label' => uln_format_ugx((int) $row['amount_ugx']),
            'claimed_payer_name' => $row['claimed_payer_name'],
            'claimed_payer_phone' => $row['claimed_payer_phone'],
            'submitted_at' => $row['submitted_at'],
            'template_key' => $row['template_key'],
        ];
    }

    public function show(int $claimId): array
    {
        $row = $this->fetchClaim($claimId);
        if (!$row) {
            respond(['error' => 'Claim not found'], 404);
        }

        $verifications = $this->pdo->prepare(
            'SELECT v.*, t.transaction_reference, t.amount_ugx AS txn_amount, t.actual_payer_phone
             FROM payment_verifications v
             INNER JOIN payment_transactions t ON t.id = v.payment_transaction_id
             WHERE v.payment_claim_id = ?
             ORDER BY v.verified_at DESC'
        );
        $verifications->execute([$claimId]);

        $receipt = $this->pdo->prepare(
            'SELECT receipt_number, amount_ugx, currency, issued_at, status
             FROM payment_receipts WHERE payment_claim_id = ? ORDER BY id DESC LIMIT 1'
        );
        $receipt->execute([$claimId]);

        $activation = $this->pdo->prepare(
            'SELECT result, order_id, website_order_id, template_reserved, activated_by, activated_at
             FROM payment_activations WHERE payment_claim_id = ? LIMIT 1'
        );
        $activation->execute([$claimId]);

        $notifications = $this->pdo->prepare(
            'SELECT channel, status, attempts, last_error, sent_at
             FROM payment_notification_events WHERE payment_claim_id = ? ORDER BY id ASC'
        );
        $notifications->execute([$claimId]);

        return [
            'claim' => $this->mapClaimDetail($row),
            'verifications' => $verifications->fetchAll(),
            'receipt' => $receipt->fetch() ?: null,
            'activation' => $activation->fetch() ?: null,
            'notifications' => $notifications->fetchAll(),
        ];
    }

    private function fetchClaim(int $claimId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.id AS claim_id, c.claim_ref, c.provider, c.status AS claim_status,
                    c.payer_is_customer, c.claimed_payer_name, c.claimed_payer_phone,
                    c.submitted_at, c.metadata,
                    s.id AS session_id, s.session_ref, s.customer_name, s.customer_email,
                    s.customer_phone, s.country_code, s.business_name, s.notes, s.package,
                    s.amount_ugx, s.currency, s.template_key, s.merchant_identifier_snapshot,
                    s.status AS session_status
             FROM payment_claims c
             INNER JOIN payment_sessions s ON s.id = c.payment_session_id
             WHERE c.id = ?
             LIMIT 1'
        );
        $stmt->execute([$claimId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private function mapClaimDetail(array $row): array
    {
        $base = $this->mapQueueRow($row);
        $base['session_id'] = (int) $row['session_id'];
        $base['session_ref'] = $row['session_ref'];
        $base['business_name'] = $row['business_name'];
        $base['notes'] = $row['notes'];
        $base['payer_is_customer'] = (bool) (int) $row['payer_is_customer'];
        $base['merchant_identifier_snapshot'] = $row['merchant_identifier_snapshot'];
        $base['session_status'] = $row['session_status'];
        $base['currency'] = $row['currency'];
        return $base;
    }

    public function matchPreview(int $claimId, array $body, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $row = $this->fetchClaim($claimId);
        if (!$row) {
            respond(['error' => 'Claim not found'], 404);
        }

        $txn = $this->normalizeTxnInput($body, (string) $row['provider']);
        $analysis = uln_payment_match_analyze($this->pdo, $row, $txn);

        return [
            'claim_id' => $claimId,
            'analysis' => $analysis,
            'transaction_preview' => $txn,
        ];
    }

    /**
     * @return array{provider:string,transaction_reference:string,actual_payer_phone:string,actual_payer_name:?string,amount_ugx:int,transaction_at:string,notes:?string,merchant_context:?string}
     */
    private function normalizeTxnInput(array $body, string $defaultProvider): array
    {
        $provider = strtolower(trim((string) ($body['provider'] ?? $defaultProvider)));
        if (!in_array($provider, ['mtn', 'airtel'], true)) {
            respond(['error' => 'Validation failed', 'details' => ['provider' => 'Must be mtn or airtel']], 422);
        }
        $ref = trim((string) ($body['transaction_reference'] ?? $body['reference'] ?? ''));
        $phone = trim((string) ($body['actual_payer_phone'] ?? $body['payer_phone'] ?? ''));
        $name = trim((string) ($body['actual_payer_name'] ?? $body['payer_name'] ?? ''));
        $amount = (int) ($body['amount_ugx'] ?? $body['amount'] ?? 0);
        $at = trim((string) ($body['transaction_at'] ?? ''));
        $notes = trim((string) ($body['notes'] ?? ''));

        $errors = [];
        if ($ref === '') {
            $errors['transaction_reference'] = 'Required';
        }
        if ($phone === '') {
            $errors['actual_payer_phone'] = 'Required';
        }
        if ($amount <= 0) {
            $errors['amount_ugx'] = 'Required';
        }
        if ($at === '') {
            $errors['transaction_at'] = 'Required';
        } else {
            $ts = strtotime($at);
            if ($ts === false) {
                $errors['transaction_at'] = 'Invalid date/time';
            } else {
                $at = date('Y-m-d H:i:s', $ts);
            }
        }
        if ($errors !== []) {
            respond(['error' => 'Validation failed', 'details' => $errors], 422);
        }

        return [
            'provider' => $provider,
            'transaction_reference' => mb_substr($ref, 0, 120),
            'actual_payer_phone' => mb_substr($phone, 0, 64),
            'actual_payer_name' => $name !== '' ? mb_substr($name, 0, 255) : null,
            'amount_ugx' => $amount,
            'transaction_at' => $at,
            'notes' => $notes !== '' ? $notes : null,
            'merchant_context' => mb_substr(trim((string) ($body['merchant_context'] ?? '')), 0, 120) ?: null,
        ];
    }

    public function confirm(int $claimId, array $body, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $actorLabel = $this->actorLabel($actor);

        $row = $this->fetchClaim($claimId);
        if (!$row) {
            respond(['error' => 'Claim not found'], 404);
        }
        if (!in_array((string) $row['claim_status'], ['awaiting_verification', 'ambiguous', 'not_found'], true)) {
            respond(['error' => 'This claim is already closed (' . $row['claim_status'] . ').'], 409);
        }

        $txnInput = $this->normalizeTxnInput($body, (string) $row['provider']);
        $analysis = uln_payment_match_analyze($this->pdo, $row, $txnInput);

        // Wrong-amount / no-claim attach: store evidence, leave claim open
        if (!empty($body['save_as_unmatched'])) {
            return $this->saveTxnAsUnmatched($txnInput, $this->actorLabel($actor), $claimId);
        }

        // Ambiguous: require explicit acknowledgement
        if (($analysis['confidence'] ?? '') === 'ambiguous' && empty($body['force_confirm'])) {
            respond([
                'error' => 'Match is ambiguous. Review competing claims or set force_confirm to proceed.',
                'analysis' => $analysis,
                'code' => 'ambiguous',
            ], 409);
        }

        // Duplicate merchant reference
        $dup = $this->pdo->prepare(
            'SELECT id, status FROM payment_transactions WHERE provider = ? AND transaction_reference = ? LIMIT 1'
        );
        $dup->execute([$txnInput['provider'], $txnInput['transaction_reference']]);
        $existing = $dup->fetch();
        if ($existing && (string) $existing['status'] === 'allocated') {
            respond($this->duplicateReferencePayload((int) $existing['id']), 409);
        }

        $amountCheck = (string) ($analysis['checks']['amount'] ?? '');
        $resultStatus = 'verified';
        if ($amountCheck === 'partial') {
            $resultStatus = 'partial';
        } elseif ($amountCheck === 'over') {
            $resultStatus = 'overpaid';
            if (empty($body['accept_overpay'])) {
                respond([
                    'error' => 'This looks like an overpayment. Review the excess, then confirm with accept_overpay.',
                    'analysis' => $analysis,
                    'code' => 'overpayment',
                ], 409);
            }
        }

        try {
            $this->pdo->beginTransaction();

            if ($existing && (string) $existing['status'] === 'unmatched') {
                $txnId = (int) $existing['id'];
                $upd = $this->pdo->prepare(
                    'UPDATE payment_transactions SET
                        actual_payer_phone = ?, actual_payer_name = ?, amount_ugx = ?,
                        transaction_at = ?, notes = ?, merchant_context = ?, status = ?
                     WHERE id = ?'
                );
                $upd->execute([
                    $txnInput['actual_payer_phone'],
                    $txnInput['actual_payer_name'],
                    $txnInput['amount_ugx'],
                    $txnInput['transaction_at'],
                    $txnInput['notes'],
                    $txnInput['merchant_context'],
                    'allocated',
                    $txnId,
                ]);
            } elseif ($existing) {
                $this->pdo->rollBack();
                respond(['error' => 'Transaction reference already exists with status ' . $existing['status']], 409);
            } else {
                $ins = $this->pdo->prepare(
                    'INSERT INTO payment_transactions
                     (provider, transaction_reference, actual_payer_phone, actual_payer_name, amount_ugx,
                      transaction_at, merchant_context, notes, status, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $ins->execute([
                    $txnInput['provider'],
                    $txnInput['transaction_reference'],
                    $txnInput['actual_payer_phone'],
                    $txnInput['actual_payer_name'],
                    $txnInput['amount_ugx'],
                    $txnInput['transaction_at'],
                    $txnInput['merchant_context'],
                    $txnInput['notes'],
                    'allocated',
                    $actorLabel,
                ]);
                $txnId = (int) $this->pdo->lastInsertId();
            }

            $received = (int) $txnInput['amount_ugx'];
            $expected = (int) $row['amount_ugx'];
            $allocAmount = min($received, $expected);
            $alloc = $this->pdo->prepare(
                'INSERT INTO payment_allocations
                 (payment_transaction_id, payment_session_id, payment_claim_id, allocated_amount, allocated_by)
                 VALUES (?, ?, ?, ?, ?)'
            );
            $alloc->execute([
                $txnId,
                (int) $row['session_id'],
                $claimId,
                $allocAmount,
                $actorLabel,
            ]);

            $ver = $this->pdo->prepare(
                'INSERT INTO payment_verifications
                 (payment_claim_id, payment_transaction_id, result, confidence, matching_summary, notes, verified_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $ver->execute([
                $claimId,
                $txnId,
                $resultStatus,
                $analysis['confidence'],
                json_encode($analysis, JSON_UNESCAPED_UNICODE),
                trim((string) ($body['verification_notes'] ?? '')) ?: null,
                $actorLabel,
            ]);

            $sessionStatus = match ($resultStatus) {
                'partial' => 'partially_paid',
                'overpaid' => 'overpaid',
                default => 'verified',
            };
            $this->pdo->prepare('UPDATE payment_claims SET status = ? WHERE id = ?')
                ->execute([$resultStatus, $claimId]);
            $this->pdo->prepare('UPDATE payment_sessions SET status = ? WHERE id = ?')
                ->execute([$sessionStatus, (int) $row['session_id']]);

            $receiptNumber = uln_generate_receipt_number();
            // Receipt shows actual amount received (overpay transparency).
            $this->pdo->prepare(
                'INSERT INTO payment_receipts
                 (receipt_number, payment_claim_id, payment_session_id, payment_transaction_id, amount_ugx, currency, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                $receiptNumber,
                $claimId,
                (int) $row['session_id'],
                $txnId,
                $received,
                $row['currency'] ?? 'UGX',
                'issued',
            ]);

            uln_payment_audit(
                $this->pdo,
                'payment_claim',
                (string) $claimId,
                'confirm_payment',
                $actorLabel,
                ['status' => $row['claim_status']],
                [
                    'status' => $resultStatus,
                    'transaction_id' => $txnId,
                    'receipt_number' => $receiptNumber,
                    'received_ugx' => $received,
                    'allocated_ugx' => $allocAmount,
                    'analysis' => $analysis,
                ]
            );

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            respond(['error' => 'Could not confirm payment.', 'details' => getenv('APP_DEBUG') === 'true' ? $e->getMessage() : null], 500);
        }

        // Phase 4 — activation + notify AFTER financial commit (R10: notify failure must not un-verify)
        $activation = null;
        $notifications = null;
        try {
            $activation = uln_momo_activate_after_verify($this->pdo, $claimId, $actorLabel);
        } catch (Throwable $e) {
            error_log('MoMo activation after confirm failed claim=' . $claimId . ': ' . $e->getMessage());
            uln_payment_audit(
                $this->pdo,
                'payment_claim',
                (string) $claimId,
                'activate_failed',
                $actorLabel,
                null,
                ['error' => $e->getMessage()]
            );
        }

        try {
            $notifications = uln_momo_notify_after_verify($this->pdo, $claimId, false);
        } catch (Throwable $e) {
            error_log('MoMo notify after confirm failed claim=' . $claimId . ': ' . $e->getMessage());
        }

        $out = $this->show($claimId);
        $out['activation'] = $activation ?? $out['activation'];
        $out['notification_result'] = $notifications;

        return $out;
    }

    public function retryNotify(int $claimId, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $row = $this->fetchClaim($claimId);
        if (!$row) {
            respond(['error' => 'Claim not found'], 404);
        }
        if (!in_array((string) $row['claim_status'], ['verified', 'partial', 'overpaid'], true)) {
            respond(['error' => 'Can only retry notifications for verified, partial, or overpaid claims.'], 409);
        }

        // Ensure activation exists before notify (idempotent)
        try {
            uln_momo_activate_after_verify($this->pdo, $claimId, $this->actorLabel($actor));
        } catch (Throwable $e) {
            error_log('MoMo activate on notify-retry: ' . $e->getMessage());
        }

        $notifications = uln_momo_notify_after_verify($this->pdo, $claimId, true);
        uln_payment_audit(
            $this->pdo,
            'payment_claim',
            (string) $claimId,
            'notify_retry',
            $this->actorLabel($actor),
            null,
            $notifications
        );

        $out = $this->show($claimId);
        $out['notification_result'] = $notifications;
        return $out;
    }

    public function reject(int $claimId, array $body, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $actorLabel = $this->actorLabel($actor);
        $row = $this->fetchClaim($claimId);
        if (!$row) {
            respond(['error' => 'Claim not found'], 404);
        }

        $status = strtolower(trim((string) ($body['status'] ?? 'rejected')));
        if (!in_array($status, ['rejected', 'not_found'], true)) {
            $status = 'rejected';
        }
        $notes = trim((string) ($body['notes'] ?? ''));

        $this->pdo->prepare('UPDATE payment_claims SET status = ? WHERE id = ?')->execute([$status, $claimId]);
        $this->pdo->prepare('UPDATE payment_sessions SET status = ? WHERE id = ?')
            ->execute([$status, (int) $row['session_id']]);

        uln_payment_audit(
            $this->pdo,
            'payment_claim',
            (string) $claimId,
            $status === 'not_found' ? 'mark_not_found' : 'reject_claim',
            $actorLabel,
            ['status' => $row['claim_status']],
            ['status' => $status, 'notes' => $notes]
        );

        return $this->show($claimId);
    }

    public function recordUnmatched(array $body, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $actorLabel = $this->actorLabel($actor);
        $txnInput = $this->normalizeTxnInput($body, 'mtn');

        $dup = $this->pdo->prepare(
            'SELECT id FROM payment_transactions WHERE provider = ? AND transaction_reference = ? LIMIT 1'
        );
        $dup->execute([$txnInput['provider'], $txnInput['transaction_reference']]);
        if ($dup->fetch()) {
            respond(['error' => 'Transaction reference already recorded.', 'code' => 'duplicate_reference'], 409);
        }

        $ins = $this->pdo->prepare(
            'INSERT INTO payment_transactions
             (provider, transaction_reference, actual_payer_phone, actual_payer_name, amount_ugx,
              transaction_at, merchant_context, notes, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $ins->execute([
            $txnInput['provider'],
            $txnInput['transaction_reference'],
            $txnInput['actual_payer_phone'],
            $txnInput['actual_payer_name'],
            $txnInput['amount_ugx'],
            $txnInput['transaction_at'],
            $txnInput['merchant_context'],
            $txnInput['notes'],
            'unmatched',
            $actorLabel,
        ]);
        $id = (int) $this->pdo->lastInsertId();

        uln_payment_audit(
            $this->pdo,
            'payment_transaction',
            (string) $id,
            'record_unmatched',
            $actorLabel,
            null,
            $txnInput
        );

        return ['success' => true, 'transaction_id' => $id, 'status' => 'unmatched'];
    }

    public function markAmbiguous(int $claimId, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $row = $this->fetchClaim($claimId);
        if (!$row) {
            respond(['error' => 'Claim not found'], 404);
        }
        if (!in_array((string) $row['claim_status'], ['awaiting_verification', 'not_found'], true)) {
            respond(['error' => 'Only open claims can be marked ambiguous.'], 409);
        }
        $this->pdo->prepare("UPDATE payment_claims SET status = 'ambiguous' WHERE id = ?")->execute([$claimId]);
        uln_payment_audit(
            $this->pdo,
            'payment_claim',
            (string) $claimId,
            'mark_ambiguous',
            $this->actorLabel($actor),
            ['status' => $row['claim_status']],
            ['status' => 'ambiguous']
        );
        return $this->show($claimId);
    }

    public function unmatchedCandidates(int $txnId, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $stmt = $this->pdo->prepare('SELECT * FROM payment_transactions WHERE id = ? LIMIT 1');
        $stmt->execute([$txnId]);
        $txn = $stmt->fetch();
        if (!$txn) {
            respond(['error' => 'Transaction not found'], 404);
        }

        return [
            'transaction' => $txn,
            'suggested_claims' => uln_payment_suggest_claims_for_txn($this->pdo, $txn),
        ];
    }

    public function attachUnmatched(int $txnId, array $body, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $claimId = (int) ($body['claim_id'] ?? 0);
        if ($claimId <= 0) {
            respond(['error' => 'claim_id is required'], 422);
        }

        $stmt = $this->pdo->prepare("SELECT * FROM payment_transactions WHERE id = ? AND status = 'unmatched' LIMIT 1");
        $stmt->execute([$txnId]);
        $txn = $stmt->fetch();
        if (!$txn) {
            respond(['error' => 'Unmatched transaction not found'], 404);
        }

        $payload = [
            'provider' => $txn['provider'],
            'transaction_reference' => $txn['transaction_reference'],
            'actual_payer_phone' => $txn['actual_payer_phone'],
            'actual_payer_name' => $txn['actual_payer_name'],
            'amount_ugx' => (int) $txn['amount_ugx'],
            'transaction_at' => $txn['transaction_at'],
            'notes' => $txn['notes'],
            'merchant_context' => $txn['merchant_context'],
            'force_confirm' => !empty($body['force_confirm']),
            'accept_overpay' => !empty($body['accept_overpay']),
            'verification_notes' => trim((string) ($body['verification_notes'] ?? 'Attached from unmatched queue')),
        ];

        return $this->confirm($claimId, $payload, $actor);
    }

    /**
     * @param array<string,mixed> $txnInput
     */
    private function saveTxnAsUnmatched(array $txnInput, string $actorLabel, ?int $fromClaimId = null): array
    {
        $dup = $this->pdo->prepare(
            'SELECT id, status FROM payment_transactions WHERE provider = ? AND transaction_reference = ? LIMIT 1'
        );
        $dup->execute([$txnInput['provider'], $txnInput['transaction_reference']]);
        $existing = $dup->fetch();
        if ($existing) {
            if ((string) $existing['status'] === 'allocated') {
                respond($this->duplicateReferencePayload((int) $existing['id']), 409);
            }
            return [
                'success' => true,
                'transaction_id' => (int) $existing['id'],
                'status' => 'unmatched',
                'already_recorded' => true,
                'from_claim_id' => $fromClaimId,
            ];
        }

        $ins = $this->pdo->prepare(
            'INSERT INTO payment_transactions
             (provider, transaction_reference, actual_payer_phone, actual_payer_name, amount_ugx,
              transaction_at, merchant_context, notes, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $note = (string) ($txnInput['notes'] ?? '');
        if ($fromClaimId) {
            $note = trim($note . "\n[From claim #{$fromClaimId}]");
        }
        $ins->execute([
            $txnInput['provider'],
            $txnInput['transaction_reference'],
            $txnInput['actual_payer_phone'],
            $txnInput['actual_payer_name'],
            $txnInput['amount_ugx'],
            $txnInput['transaction_at'],
            $txnInput['merchant_context'],
            $note !== '' ? $note : null,
            'unmatched',
            $actorLabel,
        ]);
        $id = (int) $this->pdo->lastInsertId();

        uln_payment_audit(
            $this->pdo,
            'payment_transaction',
            (string) $id,
            'record_unmatched',
            $actorLabel,
            null,
            array_merge($txnInput, ['from_claim_id' => $fromClaimId])
        );

        return [
            'success' => true,
            'transaction_id' => $id,
            'status' => 'unmatched',
            'already_recorded' => false,
            'from_claim_id' => $fromClaimId,
            'message' => 'Transaction saved as unmatched. The customer claim stays open.',
        ];
    }

    private function duplicateReferencePayload(int $transactionId): array
    {
        $link = $this->pdo->prepare(
            'SELECT c.id AS claim_id, c.claim_ref, c.status
             FROM payment_allocations a
             INNER JOIN payment_claims c ON c.id = a.payment_claim_id
             WHERE a.payment_transaction_id = ?
             ORDER BY a.id DESC LIMIT 1'
        );
        $link->execute([$transactionId]);
        $row = $link->fetch() ?: null;

        return [
            'error' => 'This merchant transaction reference is already allocated to another payment.',
            'code' => 'duplicate_reference',
            'transaction_id' => $transactionId,
            'existing_claim_id' => $row ? (int) $row['claim_id'] : null,
            'existing_claim_ref' => $row['claim_ref'] ?? null,
            'existing_claim_status' => $row['status'] ?? null,
        ];
    }

    public function adapterStatus(?array $actor): array
    {
        $this->requireAdmin($actor);
        $registry = new UlnPaymentProviderRegistry();

        return [
            'production_evidence_path' => $registry->productionEvidencePath(),
            'adapters' => $registry->capabilityReport(),
            'policy' => [
                'sms_scraping' => 'forbidden',
                'auto_verify_from_adapter' => false,
                'ingest_lands_in' => 'unmatched',
                'notes' => 'Official MTN/Airtel adapters are stubs until credentials + HTTP clients exist. Manual admin entry is production.',
            ],
        ];
    }

    public function adapterPull(string $providerId, array $body, ?array $actor): array
    {
        $this->requireAdmin($actor);
        $dryRun = !array_key_exists('dry_run', $body) || $body['dry_run'] !== false;
        // Force dry_run true unless explicitly false AND provider enabled — still stubs will error.
        $result = uln_payment_pull_from_adapter($providerId, [
            'since' => $body['since'] ?? null,
            'limit' => isset($body['limit']) ? (int) $body['limit'] : 20,
        ], $dryRun);

        uln_payment_audit(
            $this->pdo,
            'payment_adapter',
            $providerId,
            'adapter_pull_attempt',
            $this->actorLabel($actor),
            null,
            [
                'dry_run' => $dryRun,
                'error' => $result['error'],
                'result_count' => count($result['results'] ?? []),
            ]
        );

        return $result;
    }

    public function webhookIngest(string $providerId, array $raw, ?array $actor = null): array
    {
        // Webhooks may be unauthenticated later with provider signatures; for now admin-only or signature TBD.
        $registry = new UlnPaymentProviderRegistry();
        $adapter = $registry->get($providerId);
        if (!$adapter || $providerId === 'manual') {
            respond(['error' => 'Unknown provider webhook'], 404);
        }

        $caps = $adapter->capabilities();
        if (!$adapter->isEnabled()) {
            respond([
                'error' => 'Provider adapter is not enabled.',
                'code' => 'adapter_disabled',
                'capabilities' => $caps,
            ], 503);
        }

        try {
            $normalized = $adapter->normalizeRawTransaction($raw);
        } catch (Throwable $e) {
            respond(['error' => 'Could not normalize webhook payload', 'details' => $e->getMessage()], 422);
        }

        // Even when enabled, refuse live ingest until can_webhook is true (stubs stay false).
        if (empty($caps['can_webhook'])) {
            respond([
                'error' => 'Webhook ingestion is not live for this adapter yet.',
                'code' => 'webhook_not_implemented',
                'capabilities' => $caps,
                'normalized_preview' => $normalized,
            ], 501);
        }

        return uln_payment_ingest_normalized_transaction(
            $this->pdo,
            $normalized,
            $providerId . '_webhook',
            false
        );
    }
}
