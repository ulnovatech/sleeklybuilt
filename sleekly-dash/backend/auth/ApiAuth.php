<?php

require_once __DIR__ . '/SessionAuth.php';
require_once __DIR__ . '/MobileTokenAuth.php';
require_once __DIR__ . '/ServiceTokenAuth.php';

/**
 * Unified gate: session cookie (web), Bearer JWT (mobile), or hashed service token
 * (integrations only — enforced in requireAuth via request path).
 */
class ApiAuth
{
    public function __construct(
        private SessionAuth $session,
        private MobileTokenAuth $mobile,
        private ?ServiceTokenAuth $service = null,
    ) {
    }

    public function user(): ?array
    {
        if ($this->mobile->authenticateRequest()) {
            return $this->mobile->user();
        }

        if ($this->service !== null && $this->service->authenticateRequest()) {
            return $this->service->user();
        }

        return $this->session->user();
    }

    public function requireAuth(?string $path = null): void
    {
        $user = $this->user();
        if ($user === null) {
            http_response_code(401);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode([
                'error' => 'Unauthorized',
                'message' => 'Please sign in to continue.',
            ]);
            exit;
        }

        $via = (string) ($user['auth_via'] ?? '');
        if ($via === 'service_token') {
            $path = $path ?? '';
            if (!str_starts_with($path, '/api/integrations')) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Service tokens may only access /api/integrations/*.',
                ]);
                exit;
            }
        }
    }
}
