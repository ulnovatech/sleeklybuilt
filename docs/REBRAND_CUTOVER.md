# Rebrand cutover checklist (SleeklyBuilt)

## Done

### Local code
- Lovable drafts removed
- SleeklyBuilt naming across apps (`sleekly-dash`, `sleekly-blog`, contact settings, logos)
- Root `.htaccess` → `sleekly-dash/backend/api.php`
- MySQL DB `sleeklybuilt` + migration `012` applied locally
- Public API: `GET http://localhost/ulnovatech/api/public/site-contact` → `sales@sleeklybuilt.pro`
- GitHub repos: `ulnovatech/sleeklybuilt`, `ulnovatech/sleekly-blog`

### Production VM (`ulnovatech-prod`)
- Deploy root renamed: **`/opt/sleeklybuilt`**
- Env renamed: `docker.sleeklybuilt.env`
- `sleekly-dash` → `ulndash` symlink (CRM still served)
- Migration **012** applied; public contact live:
  - `http://34.66.94.12/api/public/site-contact`
- Nginx `discovery.conf` uses deferred upstream DNS (boot-safe)
- Discovery migrate OK; `DISCOVERY_ENV_FILE` pinned via `/opt/sleeklybuilt/repo/infra/.env`
- Cutover helpers: `infra/scripts/prod-apply-site-contact.sh`, `infra/scripts/prod-rebrand-cutover.sh`

## You still need to do

### 1. Local physical renames (Cursor lock)

Close Cursor, then double-click or run:

`scripts/RUN-AFTER-CLOSE-CURSOR-rebrand-renames.bat`

or:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\xampp\htdocs\ulnovatech\scripts\complete-local-rebrand-renames.ps1
```

Re-open Cursor on `C:\xampp\htdocs\sleeklybuilt`.

### 2. GitHub username

`ulnovatech` is a **user** (not an org). Rename in GitHub Settings → Account, then:

```bash
git remote set-url origin https://github.com/sleeklybuilt/sleeklybuilt.git
# update .gitmodules → https://github.com/sleeklybuilt/sleekly-blog.git
git submodule sync --recursive
```

### 3. Optional prod follow-ups
- Point DNS `sleeklybuilt.pro` / `discovery.sleeklybuilt.pro` at `34.66.94.12`
- Rename MySQL DB `ulnovatech` → `sleeklybuilt` and update `DB_NAME` in env
- Sync full rebranded `public_html` (marketing build + sleekly-dash UI Settings page)
- Fix discovery migrate if `DATABASE_URL` password drifts from `POSTGRES_PASSWORD` (hub CRM is independent)

### 4. Verify Settings → marketing
1. Open Sleekly Dash → Settings
2. Change public email → Save
3. Confirm `GET /api/public/site-contact` and marketing footer update
