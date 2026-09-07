# Admin Auth SSO — Clerk (single operator)

**Status:** Implemented  
**Scope:** All administrator surfaces only — not marketing visitors, portfolio buyers, or attendant customers.

---

## Model

```text
One Clerk user (the operator)
        │
        ▼
┌───────────────────┐
│  Clerk session    │
└─────────┬─────────┘
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
Discovery  /dash  admin-mobile
 (Next)   (React)  (Capacitor)
    │     │     │
    └─────┼─────┘
          ▼
   sleekly-dash PHP /api
   (Clerk JWT Bearer)
```

Machine paths stay **non-Clerk**: `CRON_SECRET`, `SLEEKLY_DASH_SERVICE_TOKEN`.

---

## Rules (no compromise)

1. **No `ALLOW_DEV_AUTH`** on admin surfaces. Local without Clerk keys → 401, not open console.
2. **No `X-Dev-User`**.
3. **No public admin signup** (Clerk: disable sign-ups; apps show Sign-in only).
4. **Allowlist:** only `CLERK_ADMIN_USER_ID` and/or `CLERK_ADMIN_EMAIL` may access. If both are set, PHP requires both.
5. **Legacy password login** to `/dash` and mobile username/password are disabled when Clerk is configured.
6. **Legacy `ulndash` API** must not be the live `/api` target.
7. **JWT verify fail-closed:** `CLERK_JWKS_URL` + `CLERK_ISSUER` required (publishable key alone is not enough). Mandatory `iss`, non-empty `kid`, and `azp`/`aud` must match `CLERK_AUTHORIZED_PARTIES` (defaults to publishable key).
8. **No debug mobile JWT secret** — `MOBILE_JWT_SECRET` required (≥32 chars) when legacy HS256 path is used.

---

## Env (required for production)

```env
# Discovery + dash + mobile (same Clerk application)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_ADMIN_USER_ID=user_...          # preferred (single account)
CLERK_ADMIN_EMAIL=you@sleeklybuilt.pro  # optional second check / PHP

# PHP (sleekly-dash)
CLERK_PUBLISHABLE_KEY=pk_live_...     # same pk; also used as default azp allowlist
CLERK_JWKS_URL=https://<your-clerk-frontend-api>/.well-known/jwks.json
CLERK_ISSUER=https://<your-clerk-frontend-api>
# Optional override (comma-separated). Defaults to CLERK_PUBLISHABLE_KEY.
# CLERK_AUTHORIZED_PARTIES=pk_live_...
CLERK_ADMIN_USER_ID=user_...
CLERK_ADMIN_EMAIL=you@sleeklybuilt.pro

# Vite apps
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
# Marketing /performante allowlist (same operator; baked at build)
VITE_CLERK_ADMIN_USER_ID=user_...
# VITE_CLERK_ADMIN_EMAIL=you@sleeklybuilt.pro
```

---

## Surfaces

| Surface | Auth |
|---------|------|
| Discovery UI + API | Clerk middleware + allowlist |
| `/dash` SPA | `@clerk/clerk-react` Sign-in; API calls send Clerk JWT |
| admin-mobile | Clerk Sign-in; Bearer = Clerk JWT |
| `/performante` (marketing) | Lazy route; Clerk Sign-in + same allowlist; destinations load only after allowlist |
| sleekly-dash `/api` | `ClerkTokenAuth` before session/mobile password |
| Cron / discovery→dash bridge | Secrets only |

---

## Explicit non-goals

- Customer / end-user accounts  
- Multi-tenant orgs  
- Keeping PHP mother-password login alongside Clerk in production  

---

## Cutover checklist

1. Create **one** Clerk user; disable Clerk application sign-ups.
2. Set `CLERK_ADMIN_USER_ID=user_…` (preferred) on Discovery, PHP, and document email fallback.
3. Set `CLERK_JWKS_URL` + `CLERK_ISSUER` on sleekly-dash PHP (from Clerk Frontend API).
4. Set `VITE_CLERK_PUBLISHABLE_KEY` for `/dash`, admin-mobile, and marketing (`/performante`); also set `VITE_CLERK_ADMIN_USER_ID` for the marketing build; rebuild all three.
5. Confirm root `/api` routes to `sleekly-dash/backend` (not `ulndash`).
6. Smoke: Discovery sign-in → `/ops`; `/dash` Sign-in → CRM; mobile Sign-in → inbox; `/performante` unsigned sees Sign-in only (no destinations); allowlisted operator sees destinations; cron with `CRON_SECRET` still works.
