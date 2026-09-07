# Working tree partition (Chunk 0)

After git recovery, **real content diffs** vs `origin/main` (`e68a503`) were reduced from ~2k noisy paths to ~150 modified + ~40 intentional untracked files.

This map assigns remaining dirty paths to later chunks. **Do not squash into one commit.** Each chunk should commit only its bucket (plus shared docs when that chunk owns them).

Recovery narrative: [`GIT_RECOVERY.md`](GIT_RECOVERY.md).

## Rules

- **Do not commit:** `ulndash/`, `uln-blog/`, `marketing/.env.production`, `infra/secrets/*` (except `.gitkeep`), `_deploy_tmp/`, orphan hashed Vite copies.
- **Ambiguous buckets** (`2-or-9`, `6-or-8`, `review-misc`): open the file when starting that chunk; prefer the lower-number security/workflow chunk if the change is behavioral.
- **Submodule** `sleekly-blog`: dirty content stays in the submodule repo; parent only records the gitlink when you intentionally bump it.

## Chunk → paths

### Chunk 0 — meta (this recovery)

- `.gitignore`
- `docs/GIT_RECOVERY.md`
- `docs/WORKING_TREE_PARTITION.md`

### Chunk 1 — nginx / docroot / deploy strip

- `.github/workflows/deploy.yml`
- `.htaccess`
- `infra/docker-compose.prod.yml`
- `infra/docker-compose.yml`
- `infra/nginx/conf.d/discovery.conf`
- `infra/nginx/conf.d/sleeklybuilt.conf`
- `infra/scripts/linode-remote-deploy.sh`
- `infra/scripts/linode-rsync-deploy.sh`
- `infra/scripts/linode-setup-env.sh`
- `infra/scripts/linode-sync-repo.sh`
- `infra/scripts/prod-deploy-stack.sh`
- Ignore-only trees: `ulndash/` (on disk, not for git)

### Chunk 2 — portfolio mutations / payment

- `portfolio/api/order.php`
- `portfolio/api/update_status.php`
- `portfolio/order.php`
- Related when touching payment: `portfolio/api/payment-*.php` (if modified in a later refresh)

### Chunk 3 — Clerk / auth hardening

- `sleekly-dash/backend/auth/ClerkTokenAuth.php`
- `sleekly-dash/backend/auth/ApiAuth.php`
- `sleekly-dash/backend/controllers/AuthController.php`
- `sleekly-dash/frontend/src/context/AuthContext.jsx`
- `sleekly-dash/frontend/src/lib/`
- `sleekly-dash/frontend/src/services/api.js`
- `admin-mobile/src/context/AuthContext.jsx`
- `admin-mobile/src/services/api.js`
- `discovery/apps/dashboard/src/lib/admin-allowlist.ts`
- `discovery/apps/dashboard/src/lib/auth.ts`
- `discovery/apps/dashboard/src/middleware.ts`
- `discovery/packages/config/src/env.ts`

### Chunk 4 — CRM journeys

- `sleekly-dash/frontend/src/pages/*` (Login, Register, Forgot/Reset, GAnalytics, Templates, …)
- `sleekly-dash/frontend/src/components/{KPICard,LineChartNeon,TeamUsersPanel}.jsx`
- `sleekly-dash/backend/api.php`, `api/ga.php`, screenshot/push services as needed
- `dash/.htaccess`, `dash/index.html`

### Chunk 5 — admin-mobile prod contract

- `admin-mobile/.env.example`
- `admin-mobile/package.json`, `package-lock.json`
- `admin-mobile/src/lib/`
- `admin-mobile/src/pages/LoginPage.jsx`

### Chunk 6 — marketing / form honesty

- `marketing/src/components/forms/GamifiedContactForm.jsx`
- `marketing/src/components/forms/NewsletterForm.jsx`
- `marketing/src/lib/useFormSubmit.js`
- `php/contactus.php`, `php/newsletter.php`
- Plus marketing pages/layout that only fix copy/a11y (see 6-or-8)

### Chunk 7 — Discovery ops

- All remaining `discovery/**` dirty paths (settings, intelligence drafts, OFFER_ROUTER, sign-up redirect, env example, …)

### Chunk 8 — shared public Design OS foundation

- Prefer marketing token/CSS sources and `design-os/**` when touched
- Marketing shell files in `6-or-8` that are visual-system only

### Chunk 9 — portfolio + blog UI alignment

- `portfolio/frontend/**` (non-mutation)
- `blog/.htaccess`
- `sleekly-blog` submodule dirty files (commit inside submodule)

### Chunk 10–11 — attendant extract / mount

- `marketing/src/components/attendant/**` (when changed)
- `php/attendant/**` (API/session continuity)
- `attendant/**` knowledge docs only if product-facing copy must match

### Chunk 12 — Performante auth

- `docs/PERFORMANTE.md`
- `marketing/src/components/performante/`
- `marketing/src/config/performanteDestinations.js`
- `marketing/src/pages/PerformantePage.jsx`

### Chunk 13 — release ops / docs

- `docs/AUTH_SSO.md`, `docs/CLOUDFLARE_DNS.md`, `docs/DEPLOY_GCLOUD.md`, `docs/REBRAND_CUTOVER.md`
- `infra/README.md`, `infra/env/*`, remaining smoke scripts
- `scripts/build-production.*`, `scripts/cloud-ship.ps1`, `scripts/seo/`

## Ambiguous / review-misc

Triage when the owning chunk starts:

| Paths | Suggested home |
| --- | --- |
| `php/{appdev,graphdes,marketing}requests.php`, `submit_order.php`, `webdesigninq.php`, `config.php` | Chunk 2 or 6 (security/honesty) |
| `portfolio/api/{catalog,portfolios,portfolio-detail,rename_template}.php`, `portfolio/{cta,index}.html`, nested webflow index tweaks | Chunk 2 (if auth/CORS) else 9 |
| Root legacy HTML (`about.html`, `index.html`, `marketing.html`, `prices.html`, …), `assets/img/*`, `assets/js/contact-form.js` | Usually **do not ship**; keep local or delete after confirming unused |
| Root `package.json` / `package-lock.json` | Chunk 13 or monorepo hygiene |

## How to start Chunk 1

1. Confirm `git fsck --full --no-dangling` still exits 0.
2. Stage only Chunk 1 paths from the list above.
3. Leave other dirty files unstaged.

## Snapshot command

```powershell
git fsck --full --no-dangling
git status --short
git diff --stat HEAD
git submodule status
```
