# Deploy Discovery Intelligence (Demand Capture)

**Source of truth:** sibling Lead Discover tree [`../lead discover - sleekly/`](../../lead%20discover%20-%20sleekly/).  
`sleeklybuilt/discovery` is a local junction to that tree (C0). Details: [DISCOVERY_SOURCE.md](./DISCOVERY_SOURCE.md).

**Production target:** Google Compute Engine VM (Docker) alongside sleeklybuilt — see [DEPLOY_GCLOUD.md](./DEPLOY_GCLOUD.md).

This document covers **local setup** and **sidebar wiring**. For legacy Vercel/Neon hosting, see Lead Discover [`docs/DEPLOYMENT.md`](../../lead%20discover%20-%20sleekly/docs/DEPLOYMENT.md).

---

## Local setup

```powershell
cd "C:\xampp\htdocs\lead discover - sleekly"
pnpm install
copy .env.example .env
# Edit DATABASE_URL for local PostgreSQL
pnpm db:migrate
pnpm dev
```

Worker (required for discovery runs):

```powershell
pnpm jobs:worker
```

From sleeklybuilt root (uses the junction):

```powershell
npm run discovery:db:migrate
npm run dev:discovery
npm run discovery:jobs:worker
```

Docker (builds the sibling tree by default):

```powershell
npm run docker:discovery
# On VM after rsync: set DISCOVERY_BUILD_CONTEXT=../discovery
```

---

## Wire sleekly-dash sidebar

Edit `sleekly-dash/frontend/.env.production`:

```env
VITE_DISCOVERY_URL=https://discovery.sleeklybuilt.pro
```

Rebuild sleekly-dash:

```powershell
cd C:\xampp\htdocs\sleeklybuilt
npm run build
```

---

## Verify integration

1. Log into sleekly-dash → **Apps → Discovery Intelligence** opens Demand Capture.
2. Sign in on Discovery (Clerk in production; dev auth locally).
3. Run a small discovery test; confirm worker processes jobs.
4. Export outreach CSV → import in sleekly-dash **Prospects → Import**.

See [DISCOVERY_INTELLIGENCE.md](./DISCOVERY_INTELLIGENCE.md) for the full operator workflow.
