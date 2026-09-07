<?php

/**
 * Verifies Clerk session JWTs (RS256 via JWKS) for admin SPA / mobile.
 * Fail-closed: requires JWKS URL, issuer, allowlist, and aud/azp when configured.
 * Single-operator allowlist: CLERK_ADMIN_USER_ID and/or CLERK_ADMIN_EMAIL.
 */
class ClerkTokenAuth
{
    private const CLOCK_SKEW_SECONDS = 60;
    private const JWKS_TTL_SECONDS = 3600;
    private const JWKS_STALE_GRACE_SECONDS = 300;

    private ?array $resolvedUser = null;

    public static function isConfigured(): bool
    {
        $jwks = trim(getenv('CLERK_JWKS_URL') ?: '');
        $issuer = trim(getenv('CLERK_ISSUER') ?: '');
        // Require both verification endpoints — publishable key alone is not enough.
        return $jwks !== ''
            && $issuer !== ''
            && (self::adminUserIds() !== [] || self::adminEmails() !== []);
    }

    /** When Clerk is configured, password login paths must be closed. */
    public static function passwordLoginDisabled(): bool
    {
        return self::isConfigured();
    }

    public function user(): ?array
    {
        return $this->resolvedUser;
    }

    public function authenticateRequest(): bool
    {
        $this->resolvedUser = null;
        if (!self::isConfigured()) {
            return false;
        }

        $token = $this->extractBearerToken();
        if ($token === null) {
            return false;
        }

        $payload = $this->verifyJwt($token);
        if ($payload === null) {
            return false;
        }

        $userId = (string) ($payload['sub'] ?? '');
        if ($userId === '') {
            return false;
        }

        $email = $this->emailFromClaims($payload);
        if (!$this->isAllowedOperator($userId, $email)) {
            return false;
        }

        $this->resolvedUser = [
            'id' => $userId,
            'email' => $email ?? '',
            'username' => $email ?? $userId,
            'display_name' => $email ?: $userId,
            'role' => 'admin',
            'is_active' => 1,
            'auth_via' => 'clerk',
            'logged_in_at' => isset($payload['iat']) ? gmdate('c', (int) $payload['iat']) : gmdate('c'),
        ];

        return true;
    }

    private static function adminUserIds(): array
    {
        $raw = getenv('CLERK_ADMIN_USER_ID') ?: getenv('CLERK_ADMIN_USER_IDS') ?: '';
        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }

    private static function adminEmails(): array
    {
        $raw = getenv('CLERK_ADMIN_EMAIL') ?: getenv('CLERK_ADMIN_EMAILS') ?: '';
        return array_values(array_filter(array_map(
            static fn ($s) => strtolower(trim($s)),
            explode(',', $raw)
        )));
    }

    /**
     * Authorized parties / audiences (comma-separated).
     * Typically the Clerk publishable key (pk_…) and/or JWT template aud values.
     */
    private static function authorizedParties(): array
    {
        $raw = getenv('CLERK_AUTHORIZED_PARTIES')
            ?: getenv('CLERK_JWT_AUD')
            ?: getenv('CLERK_PUBLISHABLE_KEY')
            ?: getenv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
            ?: '';
        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }

    private function isAllowedOperator(string $userId, ?string $email): bool
    {
        $ids = self::adminUserIds();
        $emails = self::adminEmails();

        $idOk = $ids === [] || in_array($userId, $ids, true);
        $emailOk = $emails === []
            || ($email !== null && $email !== '' && in_array(strtolower($email), $emails, true));

        // If both lists are set, require both (defense in depth).
        if ($ids !== [] && $emails !== []) {
            return $idOk && $emailOk;
        }
        if ($ids !== []) {
            return $idOk;
        }
        return $emailOk;
    }

    private function emailFromClaims(array $payload): ?string
    {
        foreach (['email', 'primary_email_address'] as $key) {
            if (!empty($payload[$key]) && is_string($payload[$key])) {
                return $payload[$key];
            }
        }
        if (!empty($payload['email_addresses'][0]['email_address'])) {
            return (string) $payload['email_addresses'][0]['email_address'];
        }
        return null;
    }

    private function extractBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (!preg_match('/^Bearer\s+(\S+)$/i', trim($header), $matches)) {
            return null;
        }

        return $matches[1];
    }

    private function verifyJwt(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;
        $header = json_decode($this->b64urlDecode($headerB64), true);
        $payload = json_decode($this->b64urlDecode($payloadB64), true);
        if (!is_array($header) || !is_array($payload)) {
            return null;
        }

        if (($header['alg'] ?? '') !== 'RS256') {
            return null;
        }

        $kid = trim((string) ($header['kid'] ?? ''));
        if ($kid === '') {
            return null;
        }

        $pem = $this->pemForKid($kid);
        if ($pem === null) {
            return null;
        }

        $signingInput = $headerB64 . '.' . $payloadB64;
        $signature = $this->b64urlDecode($signatureB64);
        $ok = openssl_verify($signingInput, $signature, $pem, OPENSSL_ALGO_SHA256);
        if ($ok !== 1) {
            return null;
        }

        $now = time();
        if (!isset($payload['exp']) || $now >= ((int) $payload['exp'] + self::CLOCK_SKEW_SECONDS)) {
            return null;
        }
        if (isset($payload['nbf']) && $now + self::CLOCK_SKEW_SECONDS < (int) $payload['nbf']) {
            return null;
        }

        $issuer = rtrim((string) (getenv('CLERK_ISSUER') ?: ''), '/');
        $tokenIss = isset($payload['iss']) ? rtrim((string) $payload['iss'], '/') : '';
        if ($issuer === '' || $tokenIss === '' || $tokenIss !== $issuer) {
            return null;
        }

        if (!$this->audienceOrAzpAllowed($payload)) {
            return null;
        }

        return $payload;
    }

    private function audienceOrAzpAllowed(array $payload): bool
    {
        $allowed = self::authorizedParties();
        if ($allowed === []) {
            // Misconfiguration: isConfigured requires JWKS+issuer+allowlist, but parties
            // should also be set. Fail closed rather than accept any azp/aud.
            return false;
        }

        $candidates = [];
        if (isset($payload['azp']) && is_string($payload['azp']) && $payload['azp'] !== '') {
            $candidates[] = $payload['azp'];
        }
        if (isset($payload['aud'])) {
            if (is_string($payload['aud']) && $payload['aud'] !== '') {
                $candidates[] = $payload['aud'];
            } elseif (is_array($payload['aud'])) {
                foreach ($payload['aud'] as $aud) {
                    if (is_string($aud) && $aud !== '') {
                        $candidates[] = $aud;
                    }
                }
            }
        }

        if ($candidates === []) {
            return false;
        }

        foreach ($candidates as $candidate) {
            if (in_array($candidate, $allowed, true)) {
                return true;
            }
        }

        return false;
    }

    private function pemForKid(string $kid): ?string
    {
        $jwks = $this->loadJwks();
        if ($jwks === null) {
            return null;
        }

        foreach ($jwks['keys'] ?? [] as $key) {
            if (!is_array($key)) {
                continue;
            }
            if (($key['kid'] ?? '') !== $kid) {
                continue;
            }
            if (($key['kty'] ?? '') !== 'RSA') {
                continue;
            }
            return $this->jwkToPem($key);
        }

        return null;
    }

    private function loadJwks(): ?array
    {
        static $memory = null;
        static $memoryAt = 0;

        $now = time();
        if (is_array($memory) && ($now - $memoryAt) < self::JWKS_TTL_SECONDS) {
            return $memory;
        }

        $url = trim(getenv('CLERK_JWKS_URL') ?: '');
        if ($url === '') {
            return null;
        }

        $cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'sleeklybuilt_clerk_jwks_' . hash('sha256', $url) . '.json';
        $disk = $this->readJwksCacheFile($cacheFile);
        if ($disk !== null && ($now - (int) $disk['cached_at']) < self::JWKS_TTL_SECONDS) {
            $memory = $disk['jwks'];
            $memoryAt = (int) $disk['cached_at'];
            return $memory;
        }

        $fetched = $this->fetchJwks($url);
        if (is_array($fetched)) {
            $this->writeJwksCacheFile($cacheFile, $fetched, $now);
            $memory = $fetched;
            $memoryAt = $now;
            return $memory;
        }

        // Stale grace: use disk cache briefly if JWKS endpoint is unreachable.
        if ($disk !== null && ($now - (int) $disk['cached_at']) < (self::JWKS_TTL_SECONDS + self::JWKS_STALE_GRACE_SECONDS)) {
            $memory = $disk['jwks'];
            $memoryAt = (int) $disk['cached_at'];
            return $memory;
        }

        return null;
    }

    private function fetchJwks(string $url): ?array
    {
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 5,
                'ignore_errors' => true,
                'header' => "Accept: application/json\r\n",
            ],
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
        ]);
        $raw = @file_get_contents($url, false, $ctx);
        if ($raw === false) {
            return null;
        }
        $decoded = json_decode($raw, true);
        if (!is_array($decoded) || empty($decoded['keys']) || !is_array($decoded['keys'])) {
            return null;
        }

        return $decoded;
    }

    private function readJwksCacheFile(string $path): ?array
    {
        if (!is_file($path)) {
            return null;
        }
        $raw = @file_get_contents($path);
        if ($raw === false) {
            return null;
        }
        $decoded = json_decode($raw, true);
        if (!is_array($decoded) || empty($decoded['jwks']) || !is_array($decoded['jwks'])) {
            return null;
        }

        return [
            'jwks' => $decoded['jwks'],
            'cached_at' => (int) ($decoded['cached_at'] ?? 0),
        ];
    }

    private function writeJwksCacheFile(string $path, array $jwks, int $cachedAt): void
    {
        $payload = json_encode([
            'cached_at' => $cachedAt,
            'jwks' => $jwks,
        ]);
        if ($payload === false) {
            return;
        }
        @file_put_contents($path, $payload, LOCK_EX);
    }

    private function jwkToPem(array $jwk): ?string
    {
        $n = $this->b64urlDecode((string) ($jwk['n'] ?? ''));
        $e = $this->b64urlDecode((string) ($jwk['e'] ?? ''));
        if ($n === '' || $e === '') {
            return null;
        }

        $modulus = $this->asn1Integer($n);
        $publicExponent = $this->asn1Integer($e);
        $rsaPublicKey = $this->asn1Sequence($modulus . $publicExponent);
        $algorithmIdentifier = hex2bin('300d06092a864886f70d0101010500');
        if ($algorithmIdentifier === false) {
            return null;
        }
        $subjectPublicKeyInfo = $this->asn1Sequence(
            $algorithmIdentifier . $this->asn1BitString($rsaPublicKey)
        );

        return "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split(base64_encode($subjectPublicKeyInfo), 64, "\n")
            . "-----END PUBLIC KEY-----";
    }

    private function asn1Length(int $length): string
    {
        if ($length < 0x80) {
            return chr($length);
        }
        $temp = ltrim(pack('N', $length), "\x00");
        return chr(0x80 | strlen($temp)) . $temp;
    }

    private function asn1Integer(string $bytes): string
    {
        if ($bytes === '' || (ord($bytes[0]) & 0x80)) {
            $bytes = "\x00" . $bytes;
        }
        return "\x02" . $this->asn1Length(strlen($bytes)) . $bytes;
    }

    private function asn1Sequence(string $contents): string
    {
        return "\x30" . $this->asn1Length(strlen($contents)) . $contents;
    }

    private function asn1BitString(string $contents): string
    {
        $contents = "\x00" . $contents;
        return "\x03" . $this->asn1Length(strlen($contents)) . $contents;
    }

    private function b64urlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? '' : $decoded;
    }
}
