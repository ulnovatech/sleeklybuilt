<?php

require_once __DIR__ . '/SessionAuth.php';
require_once __DIR__ . '/MobileTokenAuth.php';
require_once __DIR__ . '/ServiceTokenAuth.php';
require_once __DIR__ . '/ClerkTokenAuth.php';

/**
 * Unified gate: Clerk JWT (admin SSO), session cookie (legacy web),
 * Bearer mobile HS256 (legacy), or hashed service token (integrations only).
 */
class ApiAuth
{
    public function __construct(
        private SessionAuth $session,
        private MobileTokenAuth $mobile,
        private ?ServiceTokenAuth $service = null,
        private ?ClerkTokenAuth $clerk = null,
    ) {
    }

    public function user(): ?array
    {
        if ($this->clerk !== null && $this->clerk->authenticateRequest()) {
            return $this->clerk->user();
        }

        // When Clerk SSO is required, do not fall through to password sessions / mobile HS256.
        if (ClerkTokenAuth::passwordLoginDisabled()) {
            if ($this->service !== null && $this->service->authenticateRequest()) {
                return $this->service->user();
            }
            return null;
        }

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
                'message' => ClerkTokenAuth::passwordLoginDisabled()
                    ? 'Sign in with Clerk to continue.'
                    : 'Please sign in to continue.',
                'auth_mode' => ClerkTokenAuth::passwordLoginDisabled() ? 'clerk' : 'password',
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

            $scopes = $user['scopes'] ?? null;
            if (!is_array($scopes) || $scopes === []) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Service token has no scopes.',
                ]);
                exit;
            }

            $required = ['integrations'];
            $hasScope = false;
            foreach ($required as $scope) {
                if (in_array($scope, $scopes, true) || in_array('*', $scopes, true)) {
                    $hasScope = true;
                    break;
                }
            }
            if (!$hasScope) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Service token missing required scope: integrations.',
                ]);
                exit;
            }
        }
    }
}
