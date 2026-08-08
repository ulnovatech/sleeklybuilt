<?php

declare(strict_types=1);

/**
 * Public marketing contact settings (single row).
 * GET /api/public/site-contact — unauthenticated projection
 * GET|PATCH /api/settings/site-contact — session operators
 */
class SettingsController
{
    private PDO $pdo;

    private const ROW_ID = 1;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getPublicContact(): array
    {
        return $this->publicProjection($this->loadOrSeed());
    }

    public function getSiteContact(): array
    {
        return $this->adminProjection($this->loadOrSeed());
    }

    public function updateSiteContact(array $body): array
    {
        $current = $this->loadOrSeed();
        $next = $this->normalizeInput($body, $current);
        $errors = $this->validate($next);
        if ($errors !== []) {
            respond(['error' => 'Validation failed', 'details' => $errors], 422);
        }

        $stmt = $this->pdo->prepare(
            'UPDATE site_contact_settings SET
                brand_name = :brand_name,
                email = :email,
                location = :location,
                address_note = :address_note,
                phones_json = :phones_json,
                primary_phone = :primary_phone,
                whatsapp_url = :whatsapp_url,
                social_json = :social_json,
                logo_path = :logo_path
             WHERE id = :id'
        );
        try {
            $stmt->execute([
                ':brand_name' => $next['brand_name'],
                ':email' => $next['email'],
                ':location' => $next['location'],
                ':address_note' => $next['address_note'],
                ':phones_json' => json_encode($next['phones'], JSON_UNESCAPED_SLASHES),
                ':primary_phone' => $next['primary_phone'],
                ':whatsapp_url' => $next['whatsapp_url'],
                ':social_json' => json_encode($next['social'], JSON_UNESCAPED_SLASHES),
                ':logo_path' => $next['logo_path'],
                ':id' => self::ROW_ID,
            ]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'site_contact_settings')) {
                respond([
                    'error' => 'Contact settings table is missing. Run apply_site_contact_settings_migration.php first.',
                ], 503);
            }
            throw $e;
        }

        if ($stmt->rowCount() === 0) {
            // Row missing after table exists — insert defaults then update
            $this->ensureRow($next);
        }

        return $this->adminProjection($this->loadOrSeed());
    }

    private function ensureRow(array $next): void
    {
        $ins = $this->pdo->prepare(
            'INSERT INTO site_contact_settings (
                id, brand_name, email, location, address_note, phones_json,
                primary_phone, whatsapp_url, social_json, logo_path
             ) VALUES (
                :id, :brand_name, :email, :location, :address_note, :phones_json,
                :primary_phone, :whatsapp_url, :social_json, :logo_path
             )
             ON DUPLICATE KEY UPDATE
                brand_name = VALUES(brand_name),
                email = VALUES(email),
                location = VALUES(location),
                address_note = VALUES(address_note),
                phones_json = VALUES(phones_json),
                primary_phone = VALUES(primary_phone),
                whatsapp_url = VALUES(whatsapp_url),
                social_json = VALUES(social_json),
                logo_path = VALUES(logo_path)'
        );
        $ins->execute([
            ':id' => self::ROW_ID,
            ':brand_name' => $next['brand_name'],
            ':email' => $next['email'],
            ':location' => $next['location'],
            ':address_note' => $next['address_note'],
            ':phones_json' => json_encode($next['phones'], JSON_UNESCAPED_SLASHES),
            ':primary_phone' => $next['primary_phone'],
            ':whatsapp_url' => $next['whatsapp_url'],
            ':social_json' => json_encode($next['social'], JSON_UNESCAPED_SLASHES),
            ':logo_path' => $next['logo_path'],
        ]);
    }

    private function loadOrSeed(): array
    {
        try {
            $stmt = $this->pdo->prepare('SELECT * FROM site_contact_settings WHERE id = ? LIMIT 1');
            $stmt->execute([self::ROW_ID]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                return $this->hydrateRow($row);
            }
        } catch (PDOException $e) {
            // Table missing — fall through to defaults (migration not applied yet)
            if (str_contains($e->getMessage(), 'site_contact_settings') === false) {
                throw $e;
            }
        }

        return $this->defaults();
    }

    private function hydrateRow(array $row): array
    {
        $phones = $this->decodeJsonList($row['phones_json'] ?? '[]');
        $social = $this->decodeJsonObject($row['social_json'] ?? '{}');

        return [
            'brand_name' => (string) ($row['brand_name'] ?? 'SleeklyBuilt'),
            'email' => (string) ($row['email'] ?? 'sales@sleeklybuilt.pro'),
            'location' => (string) ($row['location'] ?? 'Kampala, Uganda'),
            'address_note' => (string) ($row['address_note'] ?? ''),
            'phones' => $phones !== [] ? $phones : $this->defaults()['phones'],
            'primary_phone' => (string) ($row['primary_phone'] ?? ''),
            'whatsapp_url' => (string) ($row['whatsapp_url'] ?? ''),
            'social' => array_merge($this->defaults()['social'], $social),
            'logo_path' => (string) ($row['logo_path'] ?? '/assets/img/sleeklybuilt-logo.png'),
            'updated_at' => $row['updated_at'] ?? null,
        ];
    }

    private function defaults(): array
    {
        return [
            'brand_name' => 'SleeklyBuilt',
            'email' => 'sales@sleeklybuilt.pro',
            'location' => 'Kampala, Uganda',
            'address_note' => 'Office under development',
            'phones' => ['+256 791779448', '+256 749594464', '+256 772169960'],
            'primary_phone' => '+256791779448',
            'whatsapp_url' => 'https://wa.me/256749594464',
            'social' => [
                'x' => 'https://x.com/sleeklybuilt',
                'instagram' => 'https://www.instagram.com/sleeklybuilt/?hl=en',
                'linkedin' => 'https://www.linkedin.com/company/sleeklybuilt/',
                'youtube' => 'https://www.youtube.com/@SleeklyBuilt',
            ],
            'logo_path' => '/assets/img/sleeklybuilt-logo.png',
            'updated_at' => null,
        ];
    }

    private function publicProjection(array $row): array
    {
        return [
            'brandName' => $row['brand_name'],
            'email' => $row['email'],
            'location' => $row['location'],
            'addressNote' => $row['address_note'],
            'phones' => $row['phones'],
            'primaryPhone' => $row['primary_phone'],
            'whatsapp' => $row['whatsapp_url'],
            'social' => $row['social'],
            'logo' => $row['logo_path'],
            'updatedAt' => $row['updated_at'],
        ];
    }

    private function adminProjection(array $row): array
    {
        return array_merge($this->publicProjection($row), [
            'brand_name' => $row['brand_name'],
            'address_note' => $row['address_note'],
            'primary_phone' => $row['primary_phone'],
            'whatsapp_url' => $row['whatsapp_url'],
            'logo_path' => $row['logo_path'],
        ]);
    }

    private function normalizeInput(array $body, array $current): array
    {
        $phones = $body['phones'] ?? $current['phones'];
        if (is_string($phones)) {
            $phones = preg_split('/[\n,]+/', $phones) ?: [];
        }
        if (!is_array($phones)) {
            $phones = $current['phones'];
        }
        $phones = array_values(array_filter(array_map(static function ($p) {
            return trim((string) $p);
        }, $phones), static fn($p) => $p !== ''));

        $socialIn = $body['social'] ?? $current['social'];
        if (!is_array($socialIn)) {
            $socialIn = $current['social'];
        }
        $social = [
            'x' => trim((string) ($socialIn['x'] ?? $current['social']['x'] ?? '')),
            'instagram' => trim((string) ($socialIn['instagram'] ?? $current['social']['instagram'] ?? '')),
            'linkedin' => trim((string) ($socialIn['linkedin'] ?? $current['social']['linkedin'] ?? '')),
            'youtube' => trim((string) ($socialIn['youtube'] ?? $current['social']['youtube'] ?? '')),
        ];

        return [
            'brand_name' => trim((string) ($body['brand_name'] ?? $body['brandName'] ?? $current['brand_name'])),
            'email' => trim((string) ($body['email'] ?? $current['email'])),
            'location' => trim((string) ($body['location'] ?? $current['location'])),
            'address_note' => trim((string) ($body['address_note'] ?? $body['addressNote'] ?? $current['address_note'])),
            'phones' => $phones,
            'primary_phone' => preg_replace('/\s+/', '', (string) ($body['primary_phone'] ?? $body['primaryPhone'] ?? $current['primary_phone'])) ?: '',
            'whatsapp_url' => trim((string) ($body['whatsapp_url'] ?? $body['whatsapp'] ?? $current['whatsapp_url'])),
            'social' => $social,
            'logo_path' => trim((string) ($body['logo_path'] ?? $body['logo'] ?? $current['logo_path'])),
        ];
    }

    private function validate(array $data): array
    {
        $errors = [];
        if ($data['brand_name'] === '') {
            $errors['brand_name'] = 'Brand name is required.';
        }
        if ($data['email'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email is required.';
        }
        if ($data['phones'] === []) {
            $errors['phones'] = 'Add at least one phone number.';
        }
        if ($data['whatsapp_url'] !== '' && !preg_match('#^https?://#i', $data['whatsapp_url'])) {
            $errors['whatsapp_url'] = 'WhatsApp URL must start with http:// or https://.';
        }
        foreach (['x', 'instagram', 'linkedin', 'youtube'] as $key) {
            $url = $data['social'][$key] ?? '';
            if ($url !== '' && !preg_match('#^https?://#i', $url)) {
                $errors["social.$key"] = 'Social URLs must start with http:// or https://.';
            }
        }
        return $errors;
    }

    private function decodeJsonList($raw): array
    {
        if (is_array($raw)) {
            return array_values(array_filter(array_map('strval', $raw)));
        }
        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            return [];
        }
        return array_values(array_filter(array_map(static fn($v) => trim((string) $v), $decoded)));
    }

    private function decodeJsonObject($raw): array
    {
        if (is_array($raw)) {
            return $raw;
        }
        $decoded = json_decode((string) $raw, true);
        return is_array($decoded) ? $decoded : [];
    }
}
