<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class GetOrderStatusTool implements AttendantTool
{
    public function name(): string
    {
        return 'get_order_status';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Look up order/payment status by tx_ref and phone via the portfolio order-status API logic.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'tx_ref' => ['type' => 'string'],
                    'phone' => ['type' => 'string'],
                    'countryCode' => ['type' => 'string'],
                ],
                'required' => ['tx_ref', 'phone'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $txRef = trim((string) ($args['tx_ref'] ?? $args['reference'] ?? ''));
        $phone = trim((string) ($args['phone'] ?? ''));
        $countryCode = trim((string) ($args['countryCode'] ?? '+256'));

        if ($txRef === '' || $phone === '') {
            return ToolResults::fail(
                $this->name(),
                'validation_error',
                'Payment reference and phone number are required.'
            );
        }

        require_once dirname(__DIR__, 3) . '/leads/rate_limit.php';
        require_once dirname(__DIR__, 3) . '/payments/packages.php';
        require_once dirname(__DIR__, 3) . '/lib/phone.php';
        require_once dirname(__DIR__, 4) . '/portfolio/api/lib/schema.php';

        if (!uln_rate_limit_allows('order_status', 20, 3600)) {
            return ToolResults::fail($this->name(), 'rate_limited', 'Too many status checks. Please try again later.');
        }

        $pdo = $ctx->pdo;
        if (!$pdo instanceof \PDO) {
            return ToolResults::fail($this->name(), 'backend_error', 'I couldn\'t look that up just now.');
        }

        try {
            uln_ensure_order_payments_table($pdo);
            $stmt = $pdo->prepare('SELECT * FROM order_payments WHERE tx_ref = ? LIMIT 1');
            $stmt->execute([$txRef]);
            $payment = $stmt->fetch();
            if (!$payment) {
                return ToolResults::fail(
                    $this->name(),
                    'not_found',
                    'No order found with that reference. Check your payment confirmation SMS or email.'
                );
            }

            $fullPhone = preg_replace('/\s+/', '', $countryCode . $phone);
            $storedPhone = preg_replace('/\s+/', '', ($payment['country_code'] ?? '') . ($payment['customer_phone'] ?? ''));
            if (!uln_phones_match($storedPhone, $fullPhone) && !uln_phones_match((string) $payment['customer_phone'], $phone)) {
                return ToolResults::fail(
                    $this->name(),
                    'unauthorized',
                    'Phone number does not match this order reference.'
                );
            }

            $packages = uln_packages();
            $packageMeta = $packages[$payment['package']] ?? [
                'title' => ucfirst((string) $payment['package']),
                'price_ugx' => 0,
            ];

            return ToolResults::ok($this->name(), [
                'reference' => $payment['tx_ref'],
                'status' => $payment['status'],
                'package' => $payment['package'],
                'package_title' => $packageMeta['title'] ?? null,
                'amount' => $payment['amount'] ?? null,
                'currency' => $payment['currency'] ?? 'UGX',
                'template_key' => $payment['template_key'] ?? null,
            ]);
        } catch (\Throwable $e) {
            return ToolResults::fail($this->name(), 'backend_error', 'I couldn\'t look that up just now.');
        }
    }
}
