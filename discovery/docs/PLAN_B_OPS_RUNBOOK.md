# Plan B ops runbook

Weekday harvest while Google Places is **dormant** (code intact; billing/circuit off). Goal: frozen Pitch today keepers from OSM + optional Brave / Meta / YouTube / CSV — not Places parity.

**Related:** [SETUP_RESOURCES.md](SETUP_RESOURCES.md) · [OPERATING_MODEL.md](OPERATING_MODEL.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Health check (start of day / after deploy)

```bash
pnpm discovery:factory-health
pnpm discovery:seed-factory   # create/heal Factory A/B — every 2h weekdays EAT
```

Worker startup also runs `ensureFactoryPlans` (heals cadence to `everyHours: 2`, reactivates paused factory plans, restores `next_run_at`). Plan ticks run about once per minute inside `discovery-worker`; each due plan schedules the next city × industry run on that cadence.

Expect:

| Line | Healthy Plan B |
|------|----------------|
| `Places lifecycle: dormant · survivalMode=yes` | Places hibernating; harvest continues |
| `Factory harvest ready: yes` | OSM (default) and/or Brave/Meta |
| `Geofabrik: … fresh` | Local Uganda index &lt; 7 days old |
| `OpenStreetMap (free): ready` | Backbone on |
| `Public search …` / `Meta Graph …` | optional-off is OK if OSM ready |

Optional:

```bash
pnpm discovery:factory-health -- --probe   # skips Places Text Search when dormant
pnpm discovery:meta-probe                   # Pages Search App Review / token gate
pnpm discovery:osm-geofabrik -- --status    # extract paths + counts
```

Exit code `0` = factory ready; `1` = blocked (enable OSM or add Brave/Meta — CSV alone is not enough).

---

## 2. Geofabrik extract refresh (weekly)

| Item | Value |
|------|--------|
| Command | `pnpm discovery:osm-geofabrik` |
| Cadence | **Weekly** (stale after 7 days) |
| Suggested cron | `0 3 * * 0` (`Africa/Kampala`) on the **worker host** |
| Paths | `storage/osm/uganda-latest.osm.pbf`, `uganda-pois.ndjson`, `uganda-pois.meta.json` |
| Override | `OSM_PBF_PATH` |

Until the index exists or after a failed refresh, discover falls back to **Overpass** (slower / rate-limited). Factory stays ready with OSM enabled.

After refresh:

```bash
pnpm discovery:osm-geofabrik -- --probe
pnpm discovery:factory-health
```

---

## 3. Credentials (Plan B)

| Credential | Role | Where |
|------------|------|--------|
| *(none)* | OSM Overpass / Geofabrik disk | default on |
| Brave Search API key | Public search + YouTube `site:` | Settings → API credentials |
| Meta Graph token + Pages Search | Facebook / Instagram | Settings + `pnpm discovery:meta-probe` |
| CSV upload | Manual resilience | Discovery → CSV |
| Google Places key | Dormant until billing restored | Optional; do not block harvest |

Caps: `BRAVE_DAILY_CAP`, `META_GRAPH_DAILY_CAP` — see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 4. Prospect proof pipeline (reliability)

Stages (standard run): `discover → resolve_accounts → website_discover → contact_enrich → crawl → bi_enrich → derive_signals → score → places_enrich`.

| Classification | Meaning |
|----------------|---------|
| `confirmed_greenfield` | Adequate Brave website search completed; no credible owned site |
| `existing_website` | Credible owned site evidence (exclude from no-website Pitch today) |
| `uncertain` | Incomplete, stale, failed, or ambiguous search — **never** Pitch today |

**Rules:** Empty website field / budget skip / timeout ≠ no website. Pitch today keepers require `confirmed_greenfield` + usable phone + additional channel (email / evidenced social / WhatsApp-ready) + fresh proof (default 14 days). Evidence lives on `accounts.metadata.prospectProof` (versioned); Why-contact strip shows status, coverage, and reason — not raw JSON.

Purify miss reasons include `search_incomplete`, `uncertain_website`, `no_contact_channel` (bench-eligible) vs `has_website` / `already_pursued` (not bench).

---

## 5. Reading a discovery run

1. **Discovery → Sources** — Plan B ready / Places dormant badges; budget remaining.
2. Start or wait for factory plan tick (`pnpm jobs:worker` must be running).
3. Open run detail — **Provider totals** + website_discover / contact_enrich stage summaries.
4. Scan **Why contact** strip (greenfield status, website class, contactability, coverage) — no JSON.
5. Night purify → morning **Pitch today** (`/ops` → Open Pitch today).

Zero from all providers → check factory-health, Geofabrik status, Brave quota, Meta probe. One provider failing is OK (`allSettled`); others continue. Provider outages shrink the eligible pool — they must not lower the qualification bar.

---

## 6. Places dormant vs reactivate

| State | Behavior |
|-------|----------|
| Dormant | No Places discover / verify / enrich API; `places_enrich` soft-skips |
| Active | Places returns to registry order when key + circuit closed + mode allows |

Set `GOOGLE_ACQUISITION_DISABLED=true` to force dormant. Clear circuit / restore billing to reactivate — no code fork.

---

## 7. Failure cheat sheet

| Symptom | Action |
|---------|--------|
| Factory harvest ready: no | Enable OSM; or add Brave / Meta (CSV alone does not mark factory ready) |
| Geofabrik stale / missing | `pnpm discovery:osm-geofabrik` |
| Brave 429 / cap | Soft-skip search+YouTube; OSM/Meta continue |
| Meta empty / not ready | `pnpm discovery:meta-probe`; do not block OSM |
| Run stuck pending | Start `pnpm jobs:worker` |
| Pitch today empty | Night purify window; do not pitch mixed queue |

---

## 8. Acceptance smoke (ops)

```bash
pnpm discovery:factory-health
pnpm discovery:osm-geofabrik -- --status
pnpm discovery:acceptance
```

Then one Kampala **standard** factory run (Restaurant / Salon) and confirm discover logs show Plan B provider totals and keepers can form after purify.
