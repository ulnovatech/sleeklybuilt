# Acquisition tiers

Five tiers for lead acquisition, ordered by cost and invasiveness. Higher tiers run only when lower tiers fail or for high-value targets.

## Tier 1 — API (Google Places)

- **Module:** `modules/discovery/src/providers/places/`
- **Budget:** `google_places` monthly cap
- **Modes:** standard, boost (disabled in economy)
- **Dormant:** circuit / `GOOGLE_ACQUISITION_DISABLED` → lifecycle `dormant`; discover skips Places; `places_enrich` returns clean no-op (no review/rescore fan-out). Plan B scoring uses multi-source corroboration (`+3` / `+5` cap) from `discoveryEvidence` instead of Places reviews

## Tier 1b — OpenStreetMap (Geofabrik / Overpass) — Plan B

- **Module:** `modules/discovery/src/providers/osm/`
- **Primary:** local Geofabrik Uganda POI index (`pnpm discovery:osm-geofabrik`)
- **Refresh:** weekly (stale &gt; 7 days); cron hint `0 3 * * 0` Africa/Kampala — [PLAN_B_OPS_RUNBOOK.md](PLAN_B_OPS_RUNBOOK.md)
- **Fallback:** Overpass + Nominatim when extract absent, extract returns zero hits, or `OSM_FORCE_OVERPASS=true`
- **Cost:** $0 · ODbL

## Tier 2 — Public search (Brave / CSE)

- **Module:** `modules/discovery/src/providers/public-search.ts`
- **Credential:** `BRAVE_SEARCH_API_KEY` (Plan B primary) and/or CSE when Google circuit closed
- **Budget:** `brave_search`, `google_cse` daily caps (Bing retired / legacy-gated)
- **Config:** API keys in Settings
- **Pagination:** 1–3 pages per query (10 results/page) by acquisition mode
- **Classifier:** `search-result-classifier.ts` — drops directories/articles; keeps business + social profile URLs
- **Scope:** general web queries (industry + location, contact intent) — no `site:` social queries (see Tier 2b)

## Tier 2b — Social search (Brave / CSE `site:`)

- **Module:** `modules/discovery/src/providers/social/social-search-provider.ts`
- **Budget:** shares Tier 2 `brave_search` / `google_cse` daily caps
- **Queries:** `build-social-search-queries.ts` — TikTok, LinkedIn company, YouTube, X/Twitter
- **Factory Plan B:** `filters.socialSearch = youtube` — YouTube channels only (no TikTok / LinkedIn / X)
- **Parser:** `parse-social-search-result.ts` — social profiles only; respects plan `socialSearch` filter; Facebook/Instagram handled by Meta Graph (Tier 2c)
- **ToS note:** uses public search engine results only — no headless scraping of social platforms

## Tier 2c — Meta Graph (Facebook / Instagram)

- **Module:** `modules/discovery/src/providers/meta/meta-graph-provider.ts`
- **Credential:** `META_GRAPH_API_TOKEN` + Pages Search App Review (gate via `pnpm discovery:meta-probe` / `META_PAGES_SEARCH_READY`)
- **Endpoint:** `GET /pages/search` (not deprecated `/search?type=page|place`)
- **Budget:** `meta_graph` daily cap

## Tier 3 — HTTP crawl

- **Module:** `modules/intelligence/src/crawl/`
- **Extracts:** email, phone, contact links from HTML
- **Status:** `accounts.crawl_status` — `ok`, `blocked`, `unreachable`, etc.

## Tier 4 — Browser automation (Playwright)

- **Module:** `modules/intelligence/src/browser/`
- **Enable:** `BROWSER_AUTOMATION_ENABLED=true`
- **Trigger:** boost run, `crawl_status=blocked`, `reachability=none`, score ≥ threshold
- **Cap:** `BROWSER_DAILY_CAP` (default 10)
- **Timeout:** 30s per session

## Tier 5 — Custom scrape (Reddit demand)

- **Provider:** `modules/discovery/src/providers/custom/reddit-intent-provider.ts`
- **Orchestration:** `modules/intent/src/custom-scrape-service.ts`
- **Enable:** `CUSTOM_SCRAPE_ENABLED=true`
- **Output:** demand signals only (`signal_class=demand`) via `createDemandUnique` — **not** bulk account creation
- **Rate limit:** 1 request / 5 seconds (`CUSTOM_SCRAPE_MIN_INTERVAL_MS`)
- **Budget:** `custom_scrape` daily cap (default 50 via `CUSTOM_SCRAPE_DAILY_CAP`)

### Reddit endpoints

| Item | Value |
|------|--------|
| URL template | `https://www.reddit.com/r/{subreddit}/new.json?limit=25` |
| Default subreddits | `forhire`, `entrepreneur`, `smallbusiness` |
| User-Agent | `AgencyPlatformBot/1.0 (+custom-scrape; demand-only)` |
| `source_url` | `https://www.reddit.com` + post `permalink` (dedup key) |
| Signal source | `reddit_custom` |

### Health / degraded status

- Health stored in `platform.intent.customScrape.health` (settings DB)
- **Degraded:** last 3 days with poll attempts all failed
- Shown on Discovery → Sources panel and `/api/discovery/sources`
- Poll manually: Intent page → **Poll Reddit now**, or `pnpm custom-scrape:poll`

### Maintenance notes

- Reddit may block requests without a proper User-Agent or at high volume — respect 5s interval
- Subreddits configurable via settings `intent.customScrape.redditSubreddits` (max 5)
- To add a directory provider later: implement `DirectoryProvider` in `providers/custom/` with the same demand-only ingest path
