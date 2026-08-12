# Database migrations

Run SQL files against the same database as `sleekly-dash/backend/.env` (`DB_NAME`, default `sleeklybuilt`).

**CRM foundation (required for `/dash` Companies + Interactions):**

```bash
php sleekly-dash/backend/scripts/apply_crm_foundation_migration.php
```

**Competitors (required for Competition page):**

```bash
mysql -u root -p sleeklybuilt < migrations/001_competitors.sql
```

Or paste `001_competitors.sql` into phpMyAdmin and execute.

## Bulk import (CSV / XLSX)

- **Companies:** `POST /api/import/companies` — headers: `name` (required), `industry`, `website_url` or `website`, `has_website`, `location`, `contact_person`, `contact_method`, `contact_phone`, `contact_email`, `contact_whatsapp`, `status`, `priority`, `last_contact_date`, `notes`.
- **Competitors:** `POST /api/import/competitors` — headers: `name` (required), plus optional fields matching the `competitors` table (`threat_level`, `tags`, `strengths`, `weaknesses`, profile columns, `is_active`, `notes`). List-like fields can use commas or newlines in one cell.

Legacy Excel `.xls` (binary) is not supported; re-save as `.xlsx` or `.csv`.

**Prospects (cold-call list):**

```sql
-- paste contents of migrations/002_prospects.sql in phpMyAdmin
```

API: `GET/POST /api/prospects`, `GET /api/prospects/stats`, `PUT/DELETE /api/prospects/:id`, `POST /api/prospects/:id/convert`, `POST /api/import/prospects`.

**Admin mobile app (push + contacted tracking):**

```bash
php sleekly-dash/backend/scripts/apply_admin_mobile_migrations.php
```

Or from repo root:

```powershell
npm run setup:admin-mobile
```

Creates `admin_devices` (FCM tokens) and `lead_contacts` (contacted workflow). See `admin-mobile/BUILD.md`.

**Public marketing contact (Settings page):**

```bash
php sleekly-dash/backend/scripts/apply_site_contact_settings_migration.php
```

APIs: `GET /api/public/site-contact` (no auth), `GET|PATCH /api/settings/site-contact` (session).

**Dash accounts (login, register, forgot password):**

```bash
php sleekly-dash/backend/scripts/apply_dash_users_migration.php
```

Creates `dash_users` + `dash_password_resets`, and seeds the first admin from `DASH_ADMIN_USER` / `DASH_ADMIN_EMAIL` / `DASH_ADMIN_PASS(_HASH)` when the table is empty.

Auth APIs:

- `POST /api/auth/login` — email (or legacy username) + password
- `POST /api/auth/register` — open when no users exist, or when `DASH_ALLOW_PUBLIC_SIGNUP=true`
- `POST /api/auth/forgot-password` / `POST /api/auth/reset-password`
- `GET /api/auth/capabilities` — whether signup is open
- `GET|POST /api/auth/users` — team management (session admin)
- `DELETE /api/auth/users/:id` — deactivate

**Discovery bridge (service API):**

```bash
php sleekly-dash/backend/scripts/apply_discovery_bridge_migration.php
php sleekly-dash/backend/scripts/mint_integration_token.php --name=discovery
```

Adds `discovery_account_id` / score / payload on prospects, outcome fields on companies, and `integration_tokens`. Endpoints (Bearer service token only for machine callers):

- `POST /api/integrations/prospects` — idempotent upsert by `discovery_account_id`
- `GET /api/integrations/outcomes?since=&limit=`
- `GET /api/integrations/catalog`
- `GET /api/integrations/inbound?since=`

