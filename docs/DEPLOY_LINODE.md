# Deploy SleeklyBuilt to Linode (Docker)

Current production: **Linode `172.238.122.106`** behind Cloudflare at **`https://sleeklybuilt.pro`**. Public access: [`ACCESS.md`](./ACCESS.md). DNS: [`CLOUDFLARE_DNS.md`](./CLOUDFLARE_DNS.md).

Historical GCE / Oracle runbooks: [`DEPLOY_GCLOUD.md`](./DEPLOY_GCLOUD.md), [`DEPLOY_ORACLE.md`](./DEPLOY_ORACLE.md).

## Architecture

| Component | Runtime |
|-----------|---------|
| Marketing, blog, dash, portfolio, PHP APIs | nginx + php-fpm + MySQL |
| Discovery Intelligence | postgres + discovery-web + discovery-worker |
| TLS edge | Cloudflare Flexible SSL → origin HTTP `:80` |
| CI/CD | GitHub Actions → SSH/rsync → `docker compose` |
| Discovery host port | `127.0.0.1:3000` only (nginx proxies the public hostname) |

Server layout: [`infra/env/README.md`](../infra/env/README.md).

## GitHub Actions

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) (`Deploy to Linode`).

| Secret | Purpose |
|--------|---------|
| `LINODE_SSH_HOST` | VM IP or hostname (`172.238.122.106`) |
| `LINODE_SSH_PRIVATE_KEY` | Deploy user private key |
| `LINODE_SSH_USER` | SSH user (default `deploy` if unset) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Marketing `/performante` Clerk (baked at build) |
| `VITE_CLERK_ADMIN_USER_ID` | `/performante` allowlist |
| `VITE_GA_MEASUREMENT_ID` | Optional GA4 |

If `LINODE_SSH_*` are empty, the workflow falls back to `GCE_SSH_*` so existing production secrets still work. Prefer adding the Linode-named secrets.

CI also runs `npm run test:performante:auth` and `npm run seo:smoke` before `npm run build:linux`.

## First boot on the VM

```bash
# As root, once:
sudo bash /opt/sleeklybuilt/repo/infra/scripts/linode-setup-env.sh

# Fill Clerk (required — deploy fails closed without them):
#   /opt/sleeklybuilt/env/docker.sleeklybuilt.env
#     CLERK_PUBLISHABLE_KEY, CLERK_JWKS_URL, CLERK_ISSUER, CLERK_ADMIN_USER_ID
#   /opt/sleeklybuilt/env/docker.discovery.env
#     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_ADMIN_USER_ID
#   GitHub Actions: VITE_CLERK_PUBLISHABLE_KEY + VITE_CLERK_ADMIN_USER_ID

sudo -u deploy bash /opt/sleeklybuilt/repo/infra/scripts/validate-prod-env.sh
```

`validate-prod-env.sh` requires `APP_DEBUG=false`, HTTPS `BASE_URL` / `NEXT_PUBLIC_APP_URL`, `ALLOW_DEV_AUTH=false`, and real Clerk values (not placeholders). `prod-deploy-stack.sh` runs this before compose up.

## Deploy

Preferred: push `main` (or `workflow_dispatch`) and let Actions rsync + `prod-deploy-stack.sh`.

On-box alternative (as `deploy`):

```bash
sudo -u deploy bash /opt/sleeklybuilt/repo/infra/scripts/linode-remote-deploy.sh
```

Compose (what the stack script runs):

```bash
export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env
export DISCOVERY_BUILD_CONTEXT=../discovery

docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml up -d --build
```

## Backups

`prod-deploy-stack.sh` installs a daily cron (02:12) that runs [`infra/scripts/sleeklybuilt-backup.sh`](../infra/scripts/sleeklybuilt-backup.sh). Dumps land in `/opt/sleeklybuilt/backups/` and are deleted after 14 days.

Restore is **manual only**:

```bash
CONFIRM=YES bash /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-restore.sh \
  /opt/sleeklybuilt/backups/sleeklybuilt-YYYY-MM-DD.sql.gz

CONFIRM=YES bash /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-restore.sh \
  /opt/sleeklybuilt/backups/discovery-YYYY-MM-DD.sql.gz
```

## Smoke

From the public internet:

```bash
curl -sI https://sleeklybuilt.pro/health
curl -s https://discovery.sleeklybuilt.pro/api/health
curl -sI https://sleeklybuilt.pro/performante
```

On the VM (localhost, Host headers):

```bash
curl -sf -H 'Host: sleeklybuilt.pro' http://127.0.0.1/health
SMOKE_HOST=sleeklybuilt.pro bash infra/scripts/smoke-sleeklybuilt.sh http://127.0.0.1
curl -sf -H 'Host: discovery.sleeklybuilt.pro' http://127.0.0.1/api/health
```

Unsigned `/performante` must return 200 and must **not** include `Operator destinations` in the HTML. Destinations load only after an allowlisted Clerk session.

## Staging / secrets (operator-owned)

Do not put live secrets in git. Operator still owns:

- Rotating Linode SSH and DB passwords
- Filling Clerk, Sentry, Flutterwave, SMTP, Gemini, Firebase
- Approving the production deploy after CI is green
