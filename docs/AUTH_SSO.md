# Admin Auth — Performante email + password

**Status:** Active (Clerk SSO retired)  
**Scope:** Administrator surfaces only — not marketing visitors or attendant customers.

---

## Model

```text
Operator email + password (dash_users)
        │
        ▼
┌────────────────────────────┐
│ Performante (/performante) │  ← single public operator door
└────────────┬───────────────┘
             │ PHP session + sb_operator_token cookie
             │ Domain=.sleeklybuilt.pro
    ┌────────┼────────┬────────────┐
    ▼        ▼        ▼            ▼
  /dash   Discovery  Blog admin  Content Loom
                                 (loom.sleeklybuilt.pro)
```

Phone Admin APK keeps **operator device tokens** (no email login).

---

## Rules

1. No public signup on Performante.
2. Password reset via Gmail SMTP (`SMTP_*` + `MAIL_FROM`).
3. Reset links land on `/performante/reset-password?token=…`.
4. Discovery verifies `sb_operator_token` (HS256, same secret as `MOBILE_JWT_SECRET`).
5. Content Loom (`AUTH_PROVIDER=performante`) verifies via Dash `GET /api/auth/me` (forwards cookies); local Loom login is disabled.
6. Clerk keys are ignored even if still present in env.

---

## Env

```env
# sleekly-dash / php-fpm
DASH_ADMIN_EMAIL=you@gmail.com
DASH_ADMIN_PASS=…          # first boot only; then change via reset
MOBILE_JWT_SECRET=…        # ≥32 chars
SESSION_COOKIE_DOMAIN=.sleeklybuilt.pro
MAIL_FROM=noreply@sleeklybuilt.pro
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USER=you@gmail.com
SMTP_PASS=…                # Gmail App Password

# Discovery
MOBILE_JWT_SECRET=…        # same as dash
PERFORMANTE_URL=https://sleeklybuilt.pro/performante

# Content Loom (/etc/content-loom/.env)
AUTH_ENABLED=true
AUTH_PROVIDER=performante
PERFORMANTE_URL=https://sleeklybuilt.pro/performante
SLEEKLY_DASH_URL=https://sleeklybuilt.pro
```

---

## Surfaces

| Surface | Auth |
|---------|------|
| `/performante` | Email + password → destinations (includes Content Loom) |
| `/dash` | Same PHP session |
| Discovery | `sb_operator_token` cookie (redirects to Performante if missing) |
| Content Loom | Performante SSO via Dash `/api/auth/me` (no local login) |
| admin-mobile | Operator device token |
