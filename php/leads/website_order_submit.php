<?php

declare(strict_types=1);

/**
 * Shared website quote insert (same path as portfolio/api/order.php).
 *
 * @param array{
 *   template:string,fullName:string,phone:string,package:string,
 *   countryCode?:string,businessName?:string,notes?:string
 * } $fields
 * @return array{ok:bool,success:bool,message:string,order_id?:int,http:int}
 */
function uln_website_order_quote(array $fields): array
{
    require_once __DIR__ . '/../config.php';
    require_once __DIR__ . '/notify.php';
    require_once __DIR__ . '/rate_limit.php';
    require_once __DIR__ . '/../payments/packages.php';

    if (!uln_rate_limit_allows('website_order', 12, 3600)) {
        return [
            'ok' => false,
            'success' => false,
            'message' => 'Too many submissions from your network. Please try again later.',
            'http' => 429,
        ];
    }

    $templateKey = trim((string) ($fields['template'] ?? $fields['websiteName'] ?? ''));
    $fullName = trim((string) ($fields['fullName'] ?? ''));
    $phone = trim((string) ($fields['phone'] ?? ''));
    $countryCode = trim((string) ($fields['countryCode'] ?? '+256'));
    $businessName = trim((string) ($fields['businessName'] ?? ''));
    $notes = trim((string) ($fields['notes'] ?? ''));
    $package = trim((string) ($fields['package'] ?? ''));

    if ($templateKey === '' || $fullName === '' || $phone === '' || $package === '') {
        return [
            'ok' => false,
            'success' => false,
            'message' => 'Template, full name, phone, and package are required.',
            'http' => 400,
        ];
    }

    $allowed = array_keys(uln_packages());
    if (!in_array($package, $allowed, true)) {
        return [
            'ok' => false,
            'success' => false,
            'message' => 'Invalid package. Use basic, smart, or premium.',
            'http' => 400,
        ];
    }

    $fullPhone = preg_replace('/\s+/', '', $countryCode . $phone);
    $details = "Package: {$package}\nTemplate: {$templateKey}\nSource: attendant";
    if ($businessName !== '') {
        $details .= "\nBusiness: {$businessName}";
    }
    if ($notes !== '') {
        $details .= "\nNotes: {$notes}";
    }

    try {
        $host = $DB['host'] === 'localhost' ? '127.0.0.1' : $DB['host'];
        $pdo = new PDO(
            sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $DB['port'], $DB['name']),
            $DB['user'],
            $DB['pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );

        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'INSERT INTO website_orders (template, name, phone, business, details) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $templateKey,
            $fullName,
            $fullPhone,
            $businessName,
            $details,
        ]);
        $orderId = (int) $pdo->lastInsertId();
        $pdo->commit();

        uln_notify_lead('website_order', [
            'source_id' => $orderId,
            'template' => $templateKey,
            'name' => $fullName,
            'phone' => $fullPhone,
            'business' => $businessName,
            'package' => $package,
            'notes' => $notes,
            'quote_only' => 'yes',
            'source' => 'attendant',
        ]);

        return [
            'ok' => true,
            'success' => true,
            'message' => "{$fullName}, your quote request was received. Pay the deposit anytime to reserve your template.",
            'order_id' => $orderId,
            'http' => 200,
        ];
    } catch (Throwable $e) {
        return [
            'ok' => false,
            'success' => false,
            'message' => 'Could not submit your request. Please try again.',
            'http' => 500,
        ];
    }
}
