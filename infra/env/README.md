# Environment files (GCE VM / Docker)

Secrets and runtime configuration live **outside git**. Copy the `.example` templates on the server, then edit values for production.

## Server layout

```
/opt/sleeklybuilt/
├── secrets/                    # Never commit — chmod 600
│   └── service-account.json    # GCP/Firebase (GA + FCM)
├── env/                        # dir chmod 700; *.env files chmod 644 (php-fpm www-data must read mounts)
│   ├── docker.sleeklybuilt.env     # MySQL CRM + PHP (from docker.sleeklybuilt.env.example)
│   └── docker.discovery.env      # Postgres + Discovery (from docker.discovery.env.example)
├── public_html/                # Built static output (rsync from CI or local build)
└── repo/                       # Git checkout (infra/, scripts/, …)
                                # Discovery source of truth is sibling Lead Discover tree;
                                # on VM, rsync that tree into repo/discovery and set
                                # DISCOVERY_BUILD_CONTEXT=../discovery
```

Compose is run from `repo/` with paths pointing at the layout above. **Important:** Docker Compose loads variable substitution from `.env` next to the *first* `-f` compose file (`infra/.env`), not only from the repo root. Copy compose DB passwords there:

```bash
# On the VM — keep in sync with /opt/sleeklybuilt/env/*.env DB passwords
cp /opt/sleeklybuilt/repo/.env /opt/sleeklybuilt/repo/infra/.env   # or write MYSQL_* / POSTGRES_* into infra/.env
chmod 600 /opt/sleeklybuilt/repo/infra/.env
```

```bash
cd /opt/sleeklybuilt/repo
export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env

docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml up -d --build
```

## Templates

| Template | Live file (gitignored) | Used by |
|----------|------------------------|---------|
| `docker.sleeklybuilt.env.example` | `docker.sleeklybuilt.env` | `mysql`, `php-fpm`, `nginx` (via mounted `.env`) |
| `docker.discovery.env.example` | `docker.discovery.env` | `postgres`, `discovery-web`, `discovery-worker`, `discovery-migrate` |

See also [`sleeklybuilt.env.example`](./sleeklybuilt.env.example) — naming alias for the sleeklybuilt template.

## Production checklist (sleeklybuilt)

1. `BASE_URL=http://hub.34.66.94.12.nip.io` (or future custom domain)
2. `APP_DEBUG=false`
3. `ALLOWED_ORIGINS` — hub + discovery temporary hosts (see [`docs/ACCESS.md`](../../docs/ACCESS.md))
4. `DASH_ADMIN_PASS_HASH` — bcrypt hash; **unset** `DASH_ADMIN_PASS`
5. Run `php sleekly-dash/backend/scripts/apply_dash_users_migration.php` so `dash_users` is created and the env admin is seeded
6. Prefer creating additional operators in Dash → Settings → Team (keep `DASH_ALLOW_PUBLIC_SIGNUP` off in production)
7. `MOBILE_JWT_SECRET` — `openssl rand -hex 32`
8. `DB_PASS` / `MYSQL_PASSWORD` — strong password, must match in compose env
9. Copy `secrets/service-account.json` → `public_html/sleekly-dash/backend/service-account.json` (or mount via volume)
10. Set `FCM_PROJECT_ID` when using admin mobile push

## Production checklist (discovery)

1. `NEXT_PUBLIC_APP_URL=http://discovery.34.66.94.12.nip.io` (rebuild discovery-web after change)
2. `ALLOW_DEV_AUTH=false`
3. `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. `POSTGRES_PASSWORD` / `DATABASE_URL` — strong credentials
5. `CRON_SECRET` — random string for scheduled HTTP jobs
6. `SLEEKLY_DASH_BASE_URL` — usually `http://nginx` on the same compose network
7. `SLEEKLY_DASH_SERVICE_TOKEN` — service token for Discovery → sleekly-dash integrations (leave empty until bridge is enabled)
## First-time setup on VM

```bash
sudo mkdir -p /opt/sleeklybuilt/{secrets,env,public_html,repo}
sudo chown -R deploy:deploy /opt/sleeklybuilt

cp /opt/sleeklybuilt/repo/infra/env/docker.sleeklybuilt.env.example /opt/sleeklybuilt/env/docker.sleeklybuilt.env
cp /opt/sleeklybuilt/repo/infra/env/docker.discovery.env.example /opt/sleeklybuilt/env/docker.discovery.env
chmod 700 /opt/sleeklybuilt/env
# 644 required: bind-mounted into php-fpm as www-data (uid 33). Dir stays 700.
chmod 644 /opt/sleeklybuilt/env/*.env
chmod 600 /opt/sleeklybuilt/secrets/*
```

**If CRM returns `DB connection failed` with empty details:** check that `/opt/sleeklybuilt/env/docker.sleeklybuilt.env` is world-readable (`644`), then `docker compose … up -d --force-recreate php-fpm` and recreate nginx.

Full operator steps: [`docs/DEPLOY_GCLOUD.md`](../../docs/DEPLOY_GCLOUD.md). Legacy Oracle: [`docs/DEPLOY_ORACLE.md`](../../docs/DEPLOY_ORACLE.md).
