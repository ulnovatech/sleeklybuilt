<?php

require_once __DIR__ . '/SessionAuth.php';
require_once __DIR__ . '/MobileTokenAuth.php';
require_once __DIR__ . '/ServiceTokenAuth.php';
require_once __DIR__ . '/ClerkTokenAuth.php';
require_once __DIR__ . '/OperatorDeviceTokenAuth.php';

/**
 * Unified gate: Clerk JWT (admin SSO), operator device token (phone APK),
 * session cookie (legacy web), Bearer mobile HS256 (legacy), or hashed
 * service token (integrations only).
 */
class ApiAuth
{
    public function __construct(
        private SessionAuth $session,
        private MobileTokenAuth $mobile,
        private ?ServiceTokenAuth $service = null,
        private ?ClerkTokenAuth $clerk = null,
        private ?OperatorDeviceTokenAuth $device = null,
    ) {
    }

    public function user(): ?array
    {
        // Phone APK device tokens.
        if ($this->device !== null && $this->device->authenticateRequest()) {
            return $this->device->user();
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
                'message' => 'Please sign in to continue.',
                'auth_mode' => 'password',
            ]);
            exit;
        }

        $via = (string) ($user['auth_via'] ?? '');
        $path = $path ?? '';

        if ($via === 'operator_device_token') {
            if (!OperatorDeviceTokenAuth::pathAllowed($path)) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Operator device tokens may only access mobile CRM and attendant routes.',
                ]);
                exit;
            }

            $scopes = $user['scopes'] ?? null;
            if (!is_array($scopes) || $scopes === []) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Operator device token has no scopes.',
                ]);
                exit;
            }

            $normalizedPath = '/' . ltrim($path, '/');
            $needsAttendant = str_starts_with($normalizedPath, '/api/attendant');
            $hasMobile = in_array('mobile', $scopes, true) || in_array('*', $scopes, true);
            $hasAttendant = in_array('attendant', $scopes, true) || in_array('*', $scopes, true);

            // Minted tokens carry both scopes; either covers attendant routes.
            if ($needsAttendant && !$hasAttendant && !$hasMobile) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Operator device token missing attendant or mobile scope.',
                ]);
                exit;
            }

            if (!$needsAttendant && !$hasMobile) {
                http_response_code(403);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'error' => 'Forbidden',
                    'message' => 'Operator device token missing mobile scope.',
                ]);
                exit;
            }

            return;
        }

        if ($via === 'service_token') {
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

            $hasScope = in_array('integrations', $scopes, true) || in_array('*', $scopes, true);
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
