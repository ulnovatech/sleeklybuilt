<?php

/**
 * Machine API for Discovery Intelligence ↔ sleekly-dash CRM bridge.
 * Auth: hashed Bearer service token (ServiceTokenAuth) or dashboard session.
 */
class IntegrationsController
{
    private PDO $pdo;
    private RequestsController $requests;

    public function __construct(PDO $pdo, RequestsController $requests)
    {
        $this->pdo = $pdo;
        $this->requests = $requests;
    }

    /**
     * POST /api/integrations/prospects
     * Idempotent upsert by discovery_account_id.
     */
    public function upsertProspect(array $data): array
    {
        $accountId = trim((string) ($data['discovery_account_id'] ?? ''));
        if ($accountId === '') {
            http_response_code(422);
            return ['error' => 'discovery_account_id is required'];
        }
        if (strlen($accountId) > 64) {
            http_response_code(422);
            return ['error' => 'discovery_account_id is too long'];
        }

        $name = trim((string) ($data['name'] ?? ''));
        if ($name === '') {
            http_response_code(422);
            return ['error' => 'name is required'];
        }

        $allowedPriority = ['high', 'medium', 'low'];
        $priority = (string) ($data['priority'] ?? 'medium');
        if (!in_array($priority, $allowedPriority, true)) {
            $priority = 'medium';
        }

        $score = null;
        if (array_key_exists('discovery_score', $data) && $data['discovery_score'] !== null && $data['discovery_score'] !== '') {
            $score = (int) $data['discovery_score'];
            if ($score < 0) {
                $score = 0;
            }
            if ($score > 100) {
                $score = 100;
            }
        }

        $payloadJson = null;
        if (array_key_exists('discovery_payload', $data) && $data['discovery_payload'] !== null) {
            if (is_string($data['discovery_payload'])) {
                $decoded = json_decode($data['discovery_payload'], true);
                $payloadJson = json_encode($decoded !== null ? $decoded : ['raw' => $data['discovery_payload']]);
            } else {
                $payloadJson = json_encode($data['discovery_payload']);
            }
        }

        $source = trim((string) ($data['source'] ?? 'Discovery Intelligence'));
        if ($source === '') {
            $source = 'Discovery Intelligence';
        }

        $industry = $this->nullableTrim($data['industry'] ?? null);
        $location = $this->nullableTrim($data['location'] ?? null);
        $phone = $this->nullableTrim($data['contact_phone'] ?? null);
        $email = $this->nullableTrim($data['contact_email'] ?? null);
        $method = $this->nullableTrim($data['contact_method'] ?? null) ?? 'phone';
        $notes = $this->nullableTrim($data['notes'] ?? null);

        $cols = $this->prospectColumns();
        $hasPhone = isset($cols['contact_phone']);
        $hasEmail = isset($cols['contact_email']);
        $hasMethod = isset($cols['contact_method']);

        $existing = $this->pdo->prepare(
            'SELECT id FROM prospects WHERE discovery_account_id = :aid LIMIT 1'
        );
        $existing->execute([':aid' => $accountId]);
        $row = $existing->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $id = (int) $row['id'];
            $set = [
                'name = :name',
                'industry = :industry',
                'location = :location',
                'source = :source',
                'priority = :priority',
                'notes = :notes',
                'discovery_score = :discovery_score',
                'discovery_payload = :discovery_payload',
                'updated_at = NOW()',
            ];
            $params = [
                ':name' => $name,
                ':industry' => $industry,
                ':location' => $location,
                ':source' => $source,
                ':priority' => $priority,
                ':notes' => $notes,
                ':discovery_score' => $score,
                ':discovery_payload' => $payloadJson,
                ':id' => $id,
                ':converted' => 'converted_to_company',
            ];
            if ($hasPhone) {
                $set[] = 'contact_phone = :contact_phone';
                $params[':contact_phone'] = $phone;
            }
            if ($hasEmail) {
                $set[] = 'contact_email = :contact_email';
                $params[':contact_email'] = $email;
            }
            if ($hasMethod) {
                $set[] = 'contact_method = :contact_method';
                $params[':contact_method'] = $method;
            }

            $stmt = $this->pdo->prepare(
                'UPDATE prospects SET ' . implode(', ', $set) .
                ' WHERE id = :id AND status != :converted'
            );
            $stmt->execute($params);

            // Always refresh score/payload even if converted (outcome linkage)
            if ($stmt->rowCount() === 0) {
                $soft = $this->pdo->prepare(
                    'UPDATE prospects SET
                        discovery_score = COALESCE(:discovery_score, discovery_score),
                        discovery_payload = COALESCE(:discovery_payload, discovery_payload),
                        updated_at = NOW()
                     WHERE id = :id'
                );
                $soft->execute([
                    ':discovery_score' => $score,
                    ':discovery_payload' => $payloadJson,
                    ':id' => $id,
                ]);
            }

            return [
                'created' => false,
                'updated' => true,
                'prospect' => $this->fetchProspect($id),
            ];
        }

        $insertCols = [
            'name', 'industry', 'location', 'source', 'priority', 'notes', 'status',
            'discovery_account_id', 'discovery_score', 'discovery_payload',
        ];
        $insertVals = [
            ':name', ':industry', ':location', ':source', ':priority', ':notes', ':status',
            ':discovery_account_id', ':discovery_score', ':discovery_payload',
        ];
        $params = [
            ':name' => $name,
            ':industry' => $industry,
            ':location' => $location,
            ':source' => $source,
            ':priority' => $priority,
            ':notes' => $notes,
            ':status' => 'not_contacted',
            ':discovery_account_id' => $accountId,
            ':discovery_score' => $score,
            ':discovery_payload' => $payloadJson,
        ];
        if ($hasPhone) {
            $insertCols[] = 'contact_phone';
            $insertVals[] = ':contact_phone';
            $params[':contact_phone'] = $phone;
        }
        if ($hasEmail) {
            $insertCols[] = 'contact_email';
            $insertVals[] = ':contact_email';
            $params[':contact_email'] = $email;
        }
        if ($hasMethod) {
            $insertCols[] = 'contact_method';
            $insertVals[] = ':contact_method';
            $params[':contact_method'] = $method;
        }

        $ins = $this->pdo->prepare(
            'INSERT INTO prospects (' . implode(', ', $insertCols) . ') VALUES (' . implode(', ', $insertVals) . ')'
        );
        $ins->execute($params);

        $id = (int) $this->pdo->lastInsertId();
        http_response_code(201);

        return [
            'created' => true,
            'updated' => false,
            'prospect' => $this->fetchProspect($id),
        ];
    }

    /**
     * GET /api/integrations/outcomes?since=&limit=
     */
    public function outcomes(array $query): array
    {
        $limit = isset($query['limit']) ? max(1, min(500, (int) $query['limit'])) : 100;
        $since = isset($query['since']) ? trim((string) $query['since']) : '';

        $sql = "SELECT id, name, industry, location, status, discovery_account_id,
                       closed_at, project_value_ugx, services_sold, loss_reason,
                       updated_at, created_at
                FROM companies
                WHERE status IN ('closed_won', 'closed_lost')";
        $params = [];

        if ($since !== '') {
            $sql .= ' AND COALESCE(closed_at, updated_at) > :since';
            $params[':since'] = $this->normalizeDatetime($since);
        }

        $sql .= ' ORDER BY COALESCE(closed_at, updated_at) ASC, id ASC LIMIT :limit';

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = array_map(function (array $row) {
            $services = $row['services_sold'] ?? null;
            if (is_string($services) && $services !== '') {
                $decoded = json_decode($services, true);
                $services = $decoded !== null ? $decoded : $services;
            }
            return [
                'company_id' => (int) $row['id'],
                'name' => $row['name'],
                'industry' => $row['industry'],
                'location' => $row['location'],
                'status' => $row['status'],
                'discovery_account_id' => $row['discovery_account_id'],
                'closed_at' => $row['closed_at'],
                'project_value_ugx' => $row['project_value_ugx'] !== null ? (int) $row['project_value_ugx'] : null,
                'services_sold' => $services,
                'loss_reason' => $row['loss_reason'],
                'updated_at' => $row['updated_at'],
                'created_at' => $row['created_at'],
            ];
        }, $rows);

        return [
            'data' => $data,
            'count' => count($data),
            'limit' => $limit,
            'since' => $since !== '' ? $since : null,
        ];
    }

    /**
     * GET /api/integrations/catalog
     */
    public function catalog(): array
    {
        $packagesFile = dirname(__DIR__, 3) . '/php/payments/packages.php';
        if (!is_file($packagesFile)) {
            http_response_code(500);
            return ['error' => 'Package catalog source missing'];
        }
        require_once $packagesFile;
        if (!function_exists('uln_packages')) {
            http_response_code(500);
            return ['error' => 'uln_packages() unavailable'];
        }

        $raw = uln_packages();
        $packages = [];
        foreach ($raw as $id => $pkg) {
            $packages[] = [
                'id' => (string) $id,
                'title' => $pkg['title'] ?? $id,
                'price_ugx' => isset($pkg['price_ugx']) ? (int) $pkg['price_ugx'] : null,
                'deposit_ugx' => isset($pkg['deposit_ugx']) ? (int) $pkg['deposit_ugx'] : null,
                'badge' => $pkg['badge'] ?? null,
            ];
        }

        return [
            'currency' => 'UGX',
            'brand' => 'SleeklyBuilt',
            'packages' => $packages,
            'services' => $this->defaultServices(),
        ];
    }

    /**
     * GET /api/integrations/inbound?since=&limit=
     */
    public function inbound(array $query): array
    {
        $since = isset($query['since']) ? trim((string) $query['since']) : '';
        $limit = isset($query['limit']) ? max(1, min(200, (int) $query['limit'])) : 50;

        $params = [
            'page' => 1,
            'per_page' => $limit,
            'sort' => 'submitted_at',
            'dir' => 'ASC',
        ];
        if ($since !== '') {
            $params['since'] = $this->normalizeDatetime($since);
        }

        $result = $this->requests->index($params);
        $rows = $result['data'] ?? [];

        return [
            'data' => $rows,
            'count' => count($rows),
            'total' => (int) ($result['total'] ?? count($rows)),
            'limit' => $limit,
            'since' => $since !== '' ? $since : null,
        ];
    }

    private function fetchProspect(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM prospects WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }
        if (isset($row['discovery_payload']) && is_string($row['discovery_payload']) && $row['discovery_payload'] !== '') {
            $decoded = json_decode($row['discovery_payload'], true);
            if ($decoded !== null) {
                $row['discovery_payload'] = $decoded;
            }
        }
        return $row;
    }

    /** @return array<string, true> */
    private function prospectColumns(): array
    {
        static $cache = null;
        if ($cache !== null) {
            return $cache;
        }
        $cache = [];
        $stmt = $this->pdo->query('SHOW COLUMNS FROM prospects');
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $col) {
            $cache[$col['Field']] = true;
        }
        return $cache;
    }

    private function nullableTrim($value): ?string
    {
        if ($value === null) {
            return null;
        }
        $t = trim((string) $value);
        return $t === '' ? null : $t;
    }

    private function normalizeDatetime(string $value): string
    {
        $ts = strtotime($value);
        if ($ts === false) {
            return $value;
        }
        return date('Y-m-d H:i:s', $ts);
    }

    /** @return list<array{id:string,name:string,category:string}> */
    private function defaultServices(): array
    {
        return [
            ['id' => 'website_build', 'name' => 'Website build (Basic Launch)', 'category' => 'websites'],
            ['id' => 'whatsapp', 'name' => 'WhatsApp Business Integration', 'category' => 'integrations'],
            ['id' => 'booking', 'name' => 'Online Booking System', 'category' => 'integrations'],
            ['id' => 'lead_capture', 'name' => 'Lead Capture & Contact Forms', 'category' => 'websites'],
            ['id' => 'analytics', 'name' => 'Analytics & Conversion Tracking', 'category' => 'growth'],
            ['id' => 'ecommerce', 'name' => 'E-commerce Setup', 'category' => 'websites'],
            ['id' => 'mobile_redesign', 'name' => 'Mobile-Responsive Redesign', 'category' => 'websites'],
            ['id' => 'https', 'name' => 'HTTPS & Site Security Upgrade', 'category' => 'websites'],
            ['id' => 'local_seo', 'name' => 'Local SEO & Google Maps Optimization', 'category' => 'growth'],
        ];
    }
}
