# Security chunks 1–3 smoke checklist

Run after deploy (or against staging):

```bash
# Chunk 1 — docroot
curl -sI "https://sleeklybuilt.pro/php/.env" | head -1          # expect 404
curl -sI "https://sleeklybuilt.pro/ulndash/" | head -1         # expect 404
curl -sI "https://sleeklybuilt.pro/.git/config" | head -1      # expect 404
curl -sI "https://sleeklybuilt.pro/sleekly-dash/backend/.env" | head -1  # expect 404
curl -sf "https://sleeklybuilt.pro/health"                      # expect ok

# Chunk 2 — mutations retired; payment path intact
curl -s "https://sleeklybuilt.pro/portfolio/api/update_status.php?id=1&status=taken"  # 410 JSON
curl -s -X POST "https://sleeklybuilt.pro/portfolio/api/order.php" -H 'Content-Type: application/json' -d '{}'  # 410
# Webhook without FLUTTERWAVE_SECRET_HASH / bad hash must fail (check logs / 4xx)

# Chunk 3 — Clerk
php sleekly-dash/backend/tests/ClerkTokenAuthTest.php
# /api/auth/login with password must 403 when Clerk JWKS+issuer+allowlist set
```

Local PHP:

```bash
php sleekly-dash/backend/tests/ClerkTokenAuthTest.php
php -l portfolio/api/quote.php
```
