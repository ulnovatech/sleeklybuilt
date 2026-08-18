# SleeklyBuilt infrastructure (GCE VM / Docker)

## Cloud-first default workflow

Primary daily workflow is cloud deploy and live validation. Local containers, local DBs, and local API/runtime are optional fallback only.

From repo root:

```powershell
# stage explicitly (recommended)
git add <paths>

# one-command ship: commit -> push -> watch deploy -> smoke live URLs
npm run ship:cloud -- -Message "your commit message"
```

Notes:
- Add `-StageAll` only when you intentionally want all working-tree changes included.
- Override defaults when needed:
  - `-Workflow deploy.yml`
  - `-HubUrl http://hub.34.66.94.12.nip.io/`
  - `-DiscoveryUrl http://discovery.34.66.94.12.nip.io/api/health`

## Quick start (local)

From repo root:

```bash
# 1. Build static output
npm run build:linux

# 2. (Optional) Copy env template and edit secrets
cp infra/env/docker.sleeklybuilt.env.example infra/env/docker.sleeklybuilt.env

# 3. Start stack
docker compose -f infra/docker-compose.yml up -d --build

# 4. Smoke test
npm run docker:smoke
```

Site: **http://localhost:8080** (override with `HTTP_PORT`).

## Full stack (sleeklybuilt + Discovery)

From repo root:

```bash
# 1. Build static output for the main site
npm run build:linux

# 2. (Optional) Copy env templates and edit secrets
cp infra/env/docker.sleeklybuilt.env.example infra/env/docker.sleeklybuilt.env
cp infra/env/docker.discovery.env.example infra/env/docker.discovery.env

# 3. Start everything (mysql + php-fpm + nginx + postgres + discovery-web + worker)
npm run docker:full

# Or explicitly:
docker compose -f infra/docker-compose.full.yml up -d --build
```

| Endpoint | URL |
|----------|-----|
| Main site | http://localhost:8080 |
| Discovery UI (direct) | http://localhost:3000 |
| Discovery via nginx | http://discovery.34.66.94.12.nip.io (prod) or hosts-file override for local |

Run migrations manually if needed:

```bash
docker compose -f infra/docker-compose.full.yml run --rm discovery-migrate
```

Stop full stack:

```bash
npm run docker:full:down
```

Smoke tests:

```bash
npm run docker:smoke              # sleeklybuilt only
npm run docker:smoke:discovery    # discovery only
npm run docker:smoke:full         # both
```

### Discovery-only overlay

Add Discovery to an already-running sleeklybuilt stack:

```bash
npm run docker:discovery
```

## Production (Google Compute Engine)

| Step | Doc / script |
|------|----------------|
| Host bootstrap (Docker, UFW, `/opt/sleeklybuilt`) | [`gcloud/bootstrap.sh`](./gcloud/bootstrap.sh) |
| Env templates + server layout | [`env/README.md`](./env/README.md) |
| Cloudflare DNS | [`docs/CLOUDFLARE_DNS.md`](../docs/CLOUDFLARE_DNS.md) |
| Operator runbook | [`docs/DEPLOY_GCLOUD.md`](../docs/DEPLOY_GCLOUD.md) |
| CI / deploy | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |
| Legacy Oracle | [`oracle/bootstrap.sh`](./oracle/bootstrap.sh), [`docs/DEPLOY_ORACLE.md`](../docs/DEPLOY_ORACLE.md) |

Production compose (full stack, port 80):

```bash
export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env

docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml up -d --build
```

SleeklyBuilt-only production:

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d
```

## Services

| Service | Image | Role |
|---------|-------|------|
| `nginx` | nginx:1.27-alpine | Serves `public_html`, proxies PHP to FPM, proxies Discovery subdomain |
| `php-fpm` | `infra/php/Dockerfile` | PHP 8.2 + mysqli, pdo_mysql, mbstring |
| `mysql` | mysql:8.0 | Database `sleeklybuilt` |
| `postgres` | postgres:16-alpine | Discovery Intelligence database `agency_platform` |
| `discovery-web` | Lead Discover `Dockerfile` (target `web`) — build context `DISCOVERY_BUILD_CONTEXT` | Next.js dashboard on port 3000 |
| `discovery-worker` | same (target `worker`) | Background job queue worker |
| `discovery-migrate` | same (target `worker`) | One-shot Drizzle migrations on startup |

## Environment

See [`env/README.md`](./env/README.md) for production checklists and `/opt/sleeklybuilt` layout.

| Variable | Default | Purpose |
|----------|---------|---------|
| `PUBLIC_HTML_PATH` | `../public_html` | Build output (relative to `infra/`) |
| `SLEEKLYBUILT_ENV_FILE` | `./env/docker.sleeklybuilt.env.example` | Mounted as `php/.env` + `sleekly-dash/backend/.env` |
| `DISCOVERY_ENV_FILE` | `./env/docker.discovery.env.example` | Env for discovery-web, worker, migrate |
| `DISCOVERY_BUILD_CONTEXT` | `../../lead discover - sleekly` | Docker build context for Discovery (sibling source of truth). On GCE after rsync: `../discovery` |
| `HTTP_PORT` | `8080` | Host port for nginx |
| `DISCOVERY_HTTP_PORT` | `3000` | Host port for discovery-web (direct access) |
| `MYSQL_ROOT_PASSWORD` | `root_dev_change_me` | MySQL root |
| `MYSQL_PASSWORD` | `sleeklybuilt_dev_change_me` | App user password (must match `DB_PASS` in env file) |
| `POSTGRES_PASSWORD` | `discovery_dev_change_me` | Discovery Postgres (must match `DATABASE_URL`) |

## Database

First boot runs `infra/mysql/init/01-init.sql`. Import your schema dump as `02-schema.sql`, or run CRM migrations after start:

```bash
docker compose -f infra/docker-compose.yml exec php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/apply_admin_mobile_migrations.php
```

## Layout

```
infra/
├── docker-compose.yml            # nginx + php-fpm + mysql
├── docker-compose.discovery.yml  # postgres + discovery-web + worker (+ nginx discovery.conf)
├── docker-compose.full.yml       # includes sleeklybuilt + discovery
├── docker-compose.prod.yml       # port 80, restart always
├── env/
│   ├── README.md
│   ├── docker.sleeklybuilt.env.example
│   ├── docker.discovery.env.example
│   └── sleeklybuilt.env.example    # naming alias doc
├── gcloud/
│   └── bootstrap.sh              # Ubuntu AMD64 host prep (primary)
├── oracle/
│   └── bootstrap.sh              # Legacy Oracle ARM64/AMD64 host prep
├── mysql/init/
├── nginx/                        # see nginx/README.md
├── php/Dockerfile
└── scripts/
    ├── smoke-sleeklybuilt.sh
    ├── smoke-discovery.sh
    ├── smoke-full.sh
    └── wait-for-db.sh

discovery/                        # junction → ../../lead discover - sleekly (local)
# Docker default build context (from infra/):
#   ../../lead discover - sleekly
# Override on VM: DISCOVERY_BUILD_CONTEXT=../discovery
```
