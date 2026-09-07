# Public access — SleeklyBuilt production

**Canonical host:** `https://sleeklybuilt.pro`  
**Discovery:** `https://discovery.sleeklybuilt.pro`  
**Origin:** Linode `172.238.122.106` (Frankfurt) behind **Cloudflare** (Flexible SSL → origin HTTP `:80`)

Legacy GCE IP / nip.io access is retired for public SEO. Keep Linode nip.io Host headers only as emergency smoke fallbacks on the VM.

| Surface | URL |
|---------|-----|
| Hub (marketing, `/dash`, PHP APIs) | https://sleeklybuilt.pro/ |
| Hub (www) | https://www.sleeklybuilt.pro/ (prefer 301 → apex in Cloudflare) |
| Hub health | https://sleeklybuilt.pro/health |
| Operator bridge (noindex, Clerk) | https://sleeklybuilt.pro/performante — **Alt+P** (or **Alt+Shift+P**); destinations only after allowlisted sign-in |
| Discovery UI / API | https://discovery.sleeklybuilt.pro/ |
| Discovery health | https://discovery.sleeklybuilt.pro/api/health |
| Sitemap | https://sleeklybuilt.pro/sitemap.xml |
| robots.txt | https://sleeklybuilt.pro/robots.txt |

nginx: hub is `default_server` for apex, `www`, and bare IP. Discovery matches `discovery.sleeklybuilt.pro` only.

## Env on the VM

`/opt/sleeklybuilt/env/docker.sleeklybuilt.env`:

```env
BASE_URL=https://sleeklybuilt.pro
ALLOWED_ORIGINS=https://sleeklybuilt.pro,https://www.sleeklybuilt.pro,https://discovery.sleeklybuilt.pro,http://172.238.122.106
```

`/opt/sleeklybuilt/env/docker.discovery.env`:

```env
NEXT_PUBLIC_APP_URL=https://discovery.sleeklybuilt.pro
```

After changing Discovery `NEXT_PUBLIC_*`, rebuild `discovery-web` (baked at image build time).

Marketing builds should use:

```env
VITE_SITE_URL=https://sleeklybuilt.pro
VITE_GA_MEASUREMENT_ID=G-ER55WHMLGZ
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_ADMIN_USER_ID=user_...
```

GA4 is injected by `marketing/src/components/seo/Analytics.jsx` at build time when that ID is set. Do **not** also paste Google’s manual `<head>` snippet — that would double-count.

## Smoke

From the public internet (after Cloudflare DNS):

```bash
curl -sI https://sleeklybuilt.pro/health
curl -sI https://www.sleeklybuilt.pro/health
curl -s https://discovery.sleeklybuilt.pro/api/health
curl -s https://sleeklybuilt.pro/sitemap.xml | head
```

On the VM (localhost, Host headers):

```bash
curl -sf -H 'Host: sleeklybuilt.pro' http://127.0.0.1/health
SMOKE_HOST=sleeklybuilt.pro bash infra/scripts/smoke-sleeklybuilt.sh http://127.0.0.1
curl -sf -H 'Host: discovery.sleeklybuilt.pro' http://127.0.0.1/api/health
# Unsigned /performante must be 200 and must not include "Operator destinations" in HTML.
```

## DNS / TLS

See [`CLOUDFLARE_DNS.md`](./CLOUDFLARE_DNS.md). SEO automation: [`PERFORMANTE.md`](./PERFORMANTE.md).

GCE-era runbook (historical): [`DEPLOY_GCLOUD.md`](./DEPLOY_GCLOUD.md). Linode runbook: [`DEPLOY_LINODE.md`](./DEPLOY_LINODE.md).
