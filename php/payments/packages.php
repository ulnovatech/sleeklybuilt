<?php

/**
 * Website package pricing — server-side source of truth for deposits.
 * Subscription SKUs live in uln_subscription_products() and must never enter uln_packages().
 */
function uln_packages(): array
{
    return [
        'basic' => [
            'title' => 'Basic Launch Package',
            'price_ugx' => 250000,
            'deposit_ugx' => 50000,
            'badge' => null,
        ],
        'smart' => [
            'title' => 'Start Smart Package',
            'price_ugx' => 400000,
            'deposit_ugx' => 80000,
            'badge' => 'popular',
        ],
        'premium' => [
            'title' => 'Premium Growth Package',
            'price_ugx' => 700000,
            'deposit_ugx' => 140000,
            'badge' => 'best-value',
        ],
    ];
}

function uln_package_or_fail(string $packageId): array
{
    $packages = uln_packages();
    if (!isset($packages[$packageId])) {
        throw new InvalidArgumentException('Invalid package selected.');
    }

    return $packages[$packageId];
}

/**
 * Isolated subscription catalogue (MoMo claim path). Not selectable via website order wizard.
 *
 * @return array<string, array{title:string,amount_ugx:int,kind:string,template_key:string}>
 */
function uln_subscription_products(): array
{
    return [
        'attendant-monthly' => [
            'title' => 'Sleekly Attendant: first month',
            'amount_ugx' => 49000,
            'kind' => 'subscription',
            'template_key' => 'sleekly-attendant',
        ],
    ];
}

function uln_subscription_product_or_fail(string $productId): array
{
    $products = uln_subscription_products();
    if (!isset($products[$productId])) {
        throw new InvalidArgumentException('Invalid subscription product selected.');
    }

    return $products[$productId];
}

function uln_is_subscription_product(string $productId): bool
{
    return isset(uln_subscription_products()[$productId]);
}

function uln_format_ugx(int $amount): string
{
    return 'UGX ' . number_format($amount);
}
