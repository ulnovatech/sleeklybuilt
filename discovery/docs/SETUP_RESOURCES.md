# Setup resources — step-by-step guide

This platform uses **real APIs and real data only**. Mock/demo providers have been removed. Follow these steps in order to run discovery successfully.

See also: [P5_DISCOVERY_CHARTER.md](P5_DISCOVERY_CHARTER.md) · [ACQUISITION_TIERS.md](ACQUISITION_TIERS.md)

### Environment file (one place only)

| What | Where |
|------|--------|
| **Infrastructure** (database, auth, caps, feature flags) | Single `.env` at **project root** — copy from `.env.example` |
| **API keys** (Places, CSE, Brave, Meta, etc.) | **Settings → API credentials** in the dashboard (preferred) |

Do **not** duplicate env into `apps/dashboard/.env.local`. The app, worker, and `pnpm db:migrate` all load the root `.env` automatically.

Optional env vars for API keys exist only as **CI/production fallbacks** when Settings has no value.

---

## Step 1: PostgreSQL (required)

You already have PostgreSQL 18 installed.

1. Ensure database exists: `agency_platform`
2. In project root `.env` only (see `.env.example`):

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/agency_platform
```

Do not copy this into `apps/dashboard/.env.local`.

3. Run migrations:

```powershell
cd "c:\xampp\htdocs\lead discover - sleekly"
pnpm db:migrate
```

---

## Step 2: Google Places API (primary discovery — standard/boost)

In **standard** and **boost** run profiles, Places Text Search is the **primary** discovery source (`google_maps`). It fans out by industry + city with pagination.

### 2.1 Create a Google Cloud project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **Select a project** → **New Project**
4. Name it e.g. `demand-capture-platform` → **Create**

### 2.2 Enable billing

Places API requires a billing account (Google gives **$200/month free credit** on Maps Platform for most new accounts).

1. In Cloud Console: **Billing** → link a billing account
2. You will not be charged until you exceed free credits (monitor usage in console)

### 2.3 Enable Places API (New)

1. Go to **APIs & Services** → **Library**
2. Search **Places API (New)** (not the legacy Places API only)
3. Click **Enable**

Also enable if prompted:

- **Places API**

### 2.4 Create an API key

1. **APIs & Services** → **Credentials**
2. **Create credentials** → **API key**
3. Copy the key
4. **Restrict key** (recommended):
   - Application restrictions: **IP addresses** (your server IP) or none for local dev
   - API restrictions: restrict to **Places API (New)** and **Places API**

### 2.5 Add key in Settings UI (preferred)

Open **Settings → API credentials** → **Google Places API Key** (optional while dormant; Plan B uses OSM) → paste your key → **Save**.

Env var `GOOGLE_PLACES_API_KEY` is optional (CI fallback only when Settings is empty). While Places is dormant, factory harvest continues via OSM / Brave / Meta / CSV — see [PLAN_B_OPS_RUNBOOK.md](PLAN_B_OPS_RUNBOOK.md).

Check without printing secrets:

```powershell
pnpm discovery:factory-health
```

Expect `survivalMode=yes` and `Factory harvest ready: yes` when OSM is on. Optional Places probe (skipped when dormant):

```powershell
pnpm discovery:factory-health -- --probe
```

Night purify (operator, any hour). Freezes yesterday’s morning-path harvest into ~100 keepers for the sell date. `--force` rebuilds an already frozen day:

```powershell
pnpm discovery:purify
pnpm discovery:purify -- --force
```

### 2.6 Restart the app

```powershell
pnpm dev
```

Open **Discovery** → **Provider status** — expect **Plan B ready** / **Places dormant** while Google billing is down, or **Factory ready** with Maps when Places is active. A widget snippet `cse.js?cx=…` is **not** the backend CSE JSON API.

### 2.7 Test a run

1. Start the worker: `pnpm jobs:worker`
2. On Discovery, choose profile **standard** (not micro)
3. Example: Country **Uganda**, City **Kampala**, Industry **Restaurant**
4. Click **Run Discovery**

Results should include structured businesses: name, phone, website, city, rating/source URL — with `source=openstreetmap` (Plan B) or `source=google_maps` when Places is active. Run logs show per-provider totals (`Provider totals: openstreetmap: N, …`).

---

## Step 2b: Google Custom Search (optional factory overlay; required for micro/economy)

Public search is an overlay on the same factory segments — not a replacement for Places. In **micro** / `ACQUISITION_MODE=economy`, Places discovery is disabled (0 API calls) — use Brave/CSE + CSV.

The Programmable Search **website widget** (`cse.js?cx=…`) is not the JSON API. Factory overlay needs **both** a Custom Search **API key** and the engine **CX**. CX alone is stored but search stays off until the key is saved.

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/create)
2. Create a search engine (search the entire web)
3. Copy the **Search engine ID** → `GOOGLE_CSE_CX`
4. Enable **Custom Search API** in [Google Cloud Console](https://console.cloud.google.com/apis/library/customsearch.googleapis.com)
5. Create an API key → `GOOGLE_CSE_API_KEY`
6. In **Settings → API credentials**, enter **Google CSE API Key** and **Google CSE CX** → Save

Optional env fallbacks (only if Settings empty):

```
GOOGLE_CSE_API_KEY=your_key
GOOGLE_CSE_CX=your_cx_id
```

For economy-only operation add `ACQUISITION_MODE=economy`.

Free tier: **100 search queries/day** (tracked in budget governor as `google_cse`). While Google billing is suspended, CSE is dormant with Places — use Brave instead.

### Plan B: Brave Search (recommended when Google is dormant)

1. Create a key at [Brave Search API](https://api-dashboard.search.brave.com/)
2. **Settings → API credentials** → **Brave Search API Key** → Save
3. Optional env: `BRAVE_SEARCH_API_KEY` · daily cap `BRAVE_DAILY_CAP` (default 50)

Bing Web Search API was retired Aug 2025. Legacy Bing remains dead-code-gated behind `BING_SEARCH_LEGACY_ENABLED=true` + `BING_SEARCH_KEY` — prefer Brave.

---

## Step 3: Optional CSV import (no API)

Upload on **Discovery → CSV lead file** or edit the file at the configured path (`storage/imports/businesses.csv` by default).

1. **Template columns** (download from Discovery page or `/api/discovery/csv?template=1`):

```
name,industry,website,phone,email,city,country,source_url,google_maps_url,facebook_url,instagram_url
```

2. Parser handles quoted fields and header aliases (`business`, `company`, `url`, etc.)
3. Rows are filtered by country, city, and industry on each run (loose industry match)
4. CSV provider shows as **ready** when a valid file is uploaded (name column required)

**Limits:** 5MB · 10,000 data rows

---

## Step 3a: Meta Graph API (Facebook + Instagram discovery)

Optional Plan B supplemental discovery via **Pages Search** (`GET /{version}/pages/search`). Deprecated Graph `/search?type=page|place` is not used.

1. Create a [Meta Developer](https://developers.facebook.com/) app
2. Request **Page Public Metadata Access** / **Page Public Content Access** (App Review) for Pages Search
3. Generate a long-lived user or system-user token with the approved permissions
4. **Settings → API credentials** → **Meta Graph API Token** → Save
5. Probe capability: `pnpm discovery:meta-probe` (or `pnpm discovery:meta-probe --q="restaurant Kampala"`)

Optional env:

- `META_GRAPH_API_TOKEN` — token fallback
- `META_PAGES_SEARCH_READY=true|false` — force GREEN/RED after manual verification (prefer live probe)

**Endpoint:** `GET /v21.0/pages/search` — Facebook pages; linked `instagram_business_account` emits a separate Instagram row when present.

Without a token or with a RED gate, Meta is omitted from configured providers. Other sources (OSM, search, CSV) continue.

---

## Step 3b: Reddit demand (optional — not discovery fan-out)

Tier 5 custom scrape ingests **demand signals only** (not bulk business accounts).

```
CUSTOM_SCRAPE_ENABLED=true
```

Poll via **Add demand** or `pnpm custom-scrape:poll`. Shown on Discovery → Sources as **Reddit demand**.

---

## Step 3c: Geofabrik Uganda OSM extract (Plan B backbone)

Local named-POI index so Kampala runs do not depend on Overpass availability.

1. Refresh extract + build index (**weekly** — index older than 7 days is reported stale by `pnpm discovery:factory-health`):

```
pnpm discovery:osm-geofabrik
```

Optional: `--status`, `--download-only`, `--index-only`, `--probe` (Restaurant @ Kampala sample).

Suggested worker-host cron (Sunday 03:00 Africa/Kampala):

```
0 3 * * 0  cd /path/to/discovery && pnpm discovery:osm-geofabrik
```

2. Default paths (override with `OSM_PBF_PATH`):

```
storage/osm/uganda-latest.osm.pbf
storage/osm/uganda-pois.ndjson
storage/osm/uganda-pois.meta.json
```

Source: [Geofabrik Uganda](https://download.geofabrik.de/africa/uganda.html) (ODbL). Discover prefers the local index; falls back to Overpass + Nominatim when the index is missing, the extract returns no hits (ways not in the node index), or `OSM_FORCE_OVERPASS=true`.

---

## Wired sources (Discovery → Sources panel)

Only **implemented** providers appear here. Missing credentials = not shown as ready.

| Source | Role | Profile / mode | Credentials |
|--------|------|----------------|-------------|
| **Google Maps** | Primary discovery + verify | standard, boost | Settings → Google Places API Key |
| **OpenStreetMap** | Plan B structured POIs | all (default on) | Geofabrik extract (`pnpm discovery:osm-geofabrik`) or Overpass fallback |
| **Public search** | Supplemental discovery | all (when configured) | Settings → Brave and/or CSE keys |
| **Meta Graph** | Facebook + Instagram business discovery | all (when configured) | Settings → Meta Graph API Token |
| **Social search** | YouTube (factory) / optional TikTok·LinkedIn·X | all (when Brave/CSE configured) | Same keys as public search; factory filter = `youtube` |
| **CSV import** | Operator list | all (when valid file uploaded) | Upload on Discovery or `storage/imports/businesses.csv` |
| **Reddit demand** | Demand signals | opt-in | `CUSTOM_SCRAPE_ENABLED=true` |

**Discover stage order (standard/boost):** Places (if active) → OSM → public search → Meta Graph → social search → CSV.

---

## Phase 5 upcoming (not in UI until implemented)

These are on the [P5 roadmap](P5_DISCOVERY_CHARTER.md) — **no stub providers** in code until each ships:

| Source | Planned chunk |
|--------|----------------|
| Job boards / LinkedIn jobs API | Post-v1 |
| New-openings monitors | Post-v1 |

Facebook/Instagram **URLs** from crawl, CSV, or public search are stored on accounts today — that is not the same as Meta Graph discovery.

---

## Partial capabilities

| Capability | Status |
|------------|--------|
| Places ratings on discovery rows | Implemented |
| Places review text on top scorers | Implemented (`places_enrich` stage) |
| Review pain-keyword mining | Implemented (P5-D12 — BI `businessSignals` + `review_pain` signals post `places_enrich`) |

---

## Step 4: Deploy to production (later)

| Service | Purpose | Where to get it |
|---------|---------|-----------------|
| **Neon** | PostgreSQL | [neon.tech](https://neon.tech) — connection string → `DATABASE_URL` |
| **Vercel** | Host Next.js | [vercel.com](https://vercel.com) — connect repo |
| **Cloudflare R2** | File storage | [cloudflare.com](https://www.cloudflare.com/products/r2/) (optional) |

Set on Vercel:

- `DATABASE_URL`
- `GOOGLE_PLACES_API_KEY`
- `ALLOW_DEV_AUTH=false`
- Clerk keys when you add auth (Phase 9)

---

## Step 5: Troubleshooting

| Error | Fix |
|-------|-----|
| No discovery sources configured | Add `GOOGLE_PLACES_API_KEY`, Brave/CSE keys, or CSV file |
| Factory harvest blocked / skipped_credentials | Run `pnpm discovery:factory-health` — enable OSM (default) or add Brave/Meta; CSV alone does not mark factory ready; Places is optional while dormant |
| CSE shows CX but not ready | Add Custom Search **API key** (widget `cx=` is not enough) |
| Run stuck on pending | Start `pnpm jobs:worker` |
| Google Places API error 403 | Enable Places API (New), check billing, check key restrictions |
| Google Places API error 429 | Quota exceeded — wait or increase quota in Cloud Console |
| Zero businesses returned | Try broader industry, specific city, or standard profile (not micro) |
| Only search results, no Maps rows | Use **standard** profile; micro/economy disables Places discovery |

---

## Step 6: Cost control tips

1. Restrict API key to Places APIs only
2. Set **budget alerts** in Google Cloud Billing
3. Use **specific city** instead of **All cities** during testing (fewer API calls)
4. “All cities” runs one Places query per known city in `packages/geo` for that country
5. Use **micro** profile to test search/CSV without Places spend

---

## Quick checklist

- [ ] PostgreSQL running, `pnpm db:migrate` succeeded
- [ ] Root `.env` has `DATABASE_URL` (single file — no `apps/dashboard/.env.local`)
- [ ] `pnpm discovery:osm-geofabrik` (or accept Overpass fallback)
- [ ] `pnpm discovery:factory-health` → ready yes · survivalMode when Places dormant
- [ ] Optional: Brave Search key and/or Meta token (`pnpm discovery:meta-probe`)
- [ ] Optional: Places API (New) when billing is restored
- [ ] `pnpm jobs:worker` running (seeds factory plans on startup)
- [ ] Discovery → Plans shows Factory A (core) and Factory B (explore)
- [ ] Discovery → Provider status shows **Plan B ready** (or Factory ready when Places active)
- [ ] Test **standard** Kampala run returns Plan B businesses; logs show provider totals

When all boxes are checked, the system is running on **real discovery data**. See [PLAN_B_OPS_RUNBOOK.md](PLAN_B_OPS_RUNBOOK.md).
