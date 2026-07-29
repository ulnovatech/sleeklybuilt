# Template Import & Gallery — Chunked Implementation Plan

> **Purpose:** Turn the current manual `wget` + ad-hoc cleanup workflow into a reliable, UI-driven pipeline inside **Unldash**, while keeping portfolio previews stable, seller-free, and commercially usable.
>
> **Scope:** Sales gallery previews on UlnovaTech infrastructure — not a Webflow clone, not a raw HTML handoff product.
>
> **Last updated:** 2026-07-17

---

## Executive summary

| Layer | What we store | Why |
|-------|---------------|-----|
| **Preview artifact** | Cleaned HTML locally on our server | Control URLs, scrub seller docks, inject UlnovaTech CTA |
| **Assets (default)** | Remote Webflow CDN (`cdn.prod.website-files.com`) | Fast import, smaller disk, good enough for gallery |
| **Assets (selective)** | Local only when required | Rebrand-critical images, 404s, legal archive for paid deliverables |
| **Editable source (MVP)** | `catalog.json` metadata + optional section profile | Simple Unldash forms — not prettified Webflow HTML |
| **Editable source (later)** | Section inventory / rebuild pipeline | Only if staff need deeper customization before client build |

**Do not** treat mirrored Webflow HTML as the client deliverable. Delivery remains: customize → publish in Webflow/Framer/code.

---

## Current state (baseline)

| Item | Status | Notes |
|------|--------|-------|
| Manual `wget --mirror` | Works for acquisition | `--level=1` vs `--mirror` tension; no quotas; cookie in CLI |
| `rename_template.php` | **Misnamed / stale** | Hardcodes `Health`, wrong path, DB-only, no auth |
| `portfolio/portfolio/catalog.json` | **Canonical metadata** | Folder name = stable template ID |
| `portfolio/portfolio/cta.js` | **Runtime dock + scrubber** | Injects purchase CTA; kills `.hireus-badge-wrapper` |
| Unldash `/templates` | **Implemented** | Responsive library, import/review/publish drawer, history, metadata editor |
| Asset strategy today | **Hybrid controlled** | HTML local; CDN assets inventoried and probed before review |
| Full offline mirror | Not implemented | Would need asset rewrite + link checker |

---

## Architecture target

```
┌─────────────────────────────────────────────────────────────────┐
│ Unldash UI  (/templates)                                        │
│  Import drawer → Job progress → Review → Publish / Discard      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST /api/template-imports
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ ulndash/backend/api.php (authenticated)                         │
│  TemplateImportController → template_import_jobs (MySQL)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ spawn CLI worker (job id only)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ scripts/template-import-worker.php                              │
│  validate → acquire → scrub → validate → stage → (publish)      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  /tmp/import-staging   portfolio/portfolio   catalog.json
  (unique per job)      /<slug>/index.html    (file lock)
```

**Hard rules**
- Never pass user URL into a shell string — structured args / allowlisted host only.
- Never publish partial imports — staging first, atomic move on Publish.
- Never expose importer on `backend/public/index.php` (unauthenticated router).
- Runtime `cta.js` scrubber stays as **fallback**, not primary defense.

---

## Chunk map (dependency order)

| Chunk | Name | Depends on | Outcome |
|-------|------|------------|---------|
| **0** | Foundations & spec lock | — | Shared contracts, paths, security rules |
| **1** | Import job model + worker skeleton | 0 | DB table, CLI worker, job lifecycle |
| **2** | Safe acquisition (wget wrapper) | 1 | Validated download into staging |
| **3** | Offline scrub pipeline | 2 | Seller-free HTML at import time |
| **4** | Asset strategy (hybrid + selective localize) | 3 | CDN default, optional local mirror |
| **5** | Publish + catalog integration | 3, 4 | Atomic publish, `catalog.json` update |
| **6** | Unldash Templates UI | 1, 5 | `/templates` page, import flow, job status |
| **7** | Metadata editor (not raw HTML) | 5, 6 | Edit title/category/aliases in UI |
| **8** | Validation, QA, rollback | 5 | Link check, preview smoke, discard/rollback |
| **9** | Hardening & ops | 1–8 | Rate limits, logs, deploy, docs |
| **10** | Future — section editor | 7 | Structured section inventory (optional) |
| **11** | Future — full rebuild track | 10 | React/Astro migration (separate product) |

---

## Chunk 0 — Foundations & spec lock

**Goal:** One source of truth before code spreads.

### Deliverables
- [x] Confirm canonical paths:
  - Templates: `portfolio/portfolio/<folder-id>/`
  - Catalog: `portfolio/portfolio/catalog.json`
  - CTA: `portfolio/portfolio/cta.js` (absolute inject: `/portfolio/portfolio/cta.js`)
- [x] Retire `portfolio/api/rename_template.php`; it now returns HTTP `410 Gone` and performs no mutation
- [x] Restrict source hosts to valid subdomains of `webflow.io`
- [x] Define folder-id rule: lowercase full hostname, e.g. `willey-fragrance.webflow.io`
- [x] Define import states: `queued | running | scrubbing | validating | ready | published | rolled_back | failed | discarded`
- [x] Encode these contracts in `ulndash/backend/config/TemplateImportPolicy.php`

### Acceptance criteria
- [x] Preview artifact is explicitly not the client deliverable
- [x] Foundational contracts have executable tests
- [x] Security checklist is locked below

### Security checklist
- [x] Only HTTPS `*.webflow.io` source URLs are accepted; credentials and custom ports are rejected
- [ ] Resolve and revalidate DNS/redirect targets; reject private and reserved addresses (Chunk 2)
- [ ] Invoke the downloader with structured arguments; never interpolate input into a shell command (Chunk 2)
- [x] Do not accept or expose browser cookies in the v1 UI
- [ ] Enforce byte, file-count, redirect, retry, and runtime limits (Chunk 2)
- [ ] Download only into a job-specific non-public staging directory (Chunk 2)
- [x] Publish by validated atomic move; never serve partial imports (Chunk 5)
- [x] Keep `catalog.json` updates behind an exclusive stable lock file (Chunk 5)
- [ ] Scrub seller markup and URLs before publication (Chunk 3)
- [x] Keep template import routes behind the existing Unldash authentication gate

### Files implemented
- `docs/TEMPLATE_IMPORT_PLAN.md` (this doc)
- `ulndash/backend/config/TemplateImportPolicy.php`
- `ulndash/backend/tests/TemplateImportPolicyTest.php`
- `portfolio/api/rename_template.php`

---

## Chunk 1 — Import job model + worker skeleton

**Goal:** Async job infrastructure without wget yet.

### Deliverables
- [x] MySQL migration: `template_import_jobs`
  ```sql
  -- illustrative
  id, status, source_url, slug, title, category,
  staging_path, report_json, error_message,
  created_by, created_at, updated_at, published_at
  ```
- [x] `TemplateImportController.php` — create job, get status, list jobs
- [x] Routes in `ulndash/backend/api.php` (auth required):
  - `POST /api/template-imports`
  - `GET /api/template-imports`
  - `GET /api/template-imports/{id}`
- [x] `scripts/template-import-worker.php` — atomically claims a queued job and initializes private staging
- [x] Database uniqueness prevents concurrent active jobs for the same Webflow hostname
- [x] Production deploy applies the idempotent migration
- [ ] Spawn the worker with **numeric job ID only** after the acquisition phase is installed (Chunk 2)

### Acceptance criteria
- [x] Authenticated POST creates a validated job in `queued`
- [x] Worker transitions `queued → running`, records timestamps/report, and creates private staging
- [x] Unauthenticated GET/POST requests return `401`
- [x] No user-controlled shell fragments
- [x] Queue/claim lifecycle passes against production MySQL

Automatic background launch is now active. The controller passes only the
numeric job ID; the worker owns the complete
`queued → running → scrubbing → ready|failed` lifecycle.

### Risks
- Long HTTP request if worker runs inline — **must** background the worker

---

## Chunk 2 — Safe acquisition (wget wrapper)

**Goal:** Replace manual wget with a controlled downloader.

### Deliverables
- [x] URL validator:
  - HTTPS only
  - Host matches `*.webflow.io` allowlist
  - DNS resolve + reject private/reserved IPs (SSRF)
  - Re-validate on each redirect (max 5)
- [x] Wget profile (structured argument array, not pasted CLI):
  ```text
  --mirror (or controlled recursion — see note below)
  --convert-links
  --adjust-extension
  --page-requisites
  --no-parent
  --restrict-file-names=windows
  --domains=<template-host>
  --reject=mp4,zip,exe
  --timeout=30
  --tries=2
  --wait=1
  ```
- [x] Quotas: 500 MB, 2,000 files, 15-minute runtime, 5 redirects, 2 network tries
- [x] Private job-specific staging under `TEMPLATE_IMPORT_STAGING_DIR` (OS temp default)
- [x] No cookie input or authenticated-source profile in v1
- [x] Job report: pages, files, bytes, remote asset hosts, duration, redirects
- [x] Install GNU wget in the production PHP worker image
- [x] Launch worker in the background with numeric job ID only

The downloader spans only the source Webflow hostname. Webflow CDN CSS,
images, fonts, and JavaScript therefore remain remote by design, matching the
locked hybrid-asset strategy.

### Design decision: recursion depth
| Mode | Use when |
|------|----------|
| **Shallow (level 1–2)** | Fast gallery import; homepage + key pages |
| **Deep mirror** | Full multi-page template; slower, larger |

**Recommendation:** Default shallow for Unldash MVP; “Full site import” toggle for deep mirror.

### Acceptance criteria
- [x] Live `https://willey-fragrance.webflow.io/` imports to private staging
- [x] Invalid URL / private-address source fails with a clear job error
- [x] Any acquisition failure marks the job failed and recursively removes staging
- [x] Real background launch completes to `ready` on production

---

## Chunk 3 — Offline scrub pipeline (primary mole defense)

**Goal:** Seller docks and marketplace links removed **at import**, not only via runtime JS.

### Deliverables
- [x] HTML processor (DOM-based, per `.html` file):
  - Remove `.hireus-badge-wrapper`, `.hireus-*`, `.w-webflow-badge`
  - Strip/neutralize `href` containing: `webocean`, `webflow.com/templates`, `webflow.com/dashboard`
  - Remove inline scripts that re-inject seller promos (if detected)
- [x] Inject before `</body>` on **every** HTML page:
  ```html
  <script src="/portfolio/portfolio/cta.js" defer></script>
  ```
  Use **absolute** path so nested pages (`post/foo.html`) work.
- [x] Preserve source `<title>`; catalog metadata owns the gallery display title
- [x] Scrub report: files touched, nodes/links/scripts removed, CTAs injected
- [x] Remove compact “Designed by WebOcean / Powered by Webflow” attribution rows

### Keep runtime scrubber
- `cta.js` remains fallback for:
  - Templates imported before this pipeline
  - Late DOM injection edge cases

### Acceptance criteria
- [x] Willey import contains no WebOcean dock, seller URLs, or seller attribution
- [x] Every imported HTML page contains exactly one absolute CTA script
- [x] Existing preview dock remains protected by `#uln-preview-root`

### Reference (known mole markup)
- `.hireus-badge-wrapper` with links to `webocean-agency.webflow.io` and `webflow.com/templates/...`

---

## Chunk 4 — Asset strategy (hybrid + selective localize)

**Goal:** Reliable previews without mandatory full offline mirror.

### Default (MVP): HTML local + CDN remote
- Keep `cdn.prod.website-files.com` URLs for CSS, images, fonts
- Fast, small, matches current production behavior

### Selective localize (import options)
| Trigger | Action |
|---------|--------|
| User uploads replacement logo/hero | Save to `assets/img/` locally; rewrite references |
| Link checker finds 404 on CDN asset | Download + rewrite or flag warning |
| “Archive mode” toggle on import | Download all same-origin + Webflow CDN assets; rewrite URLs |

### Deliverables
- [x] Asset manifest per job: local files/bytes, remote count, and hosts
- [ ] Optional `--localize-assets` phase in worker
- [ ] URL rewriter for localized mode (prefix `/portfolio/portfolio/<slug>/assets/...`)
- [x] Post-import link checker (HEAD) for up to 12 allowlisted critical assets

Full archive/localization mode remains deferred. The MVP now performs its
manifest, validation, and remote asset probe during the worker's
`validating` phase, so warnings are visible before publication.

### Acceptance criteria
- Default import: preview renders with CDN assets
- Archive mode: homepage renders with zero external image 404s in report
- Disk usage logged per job

### What we explicitly do NOT promise offline
- Webflow Commerce checkout
- CMS dynamic collections
- Webflow forms backend
- IX2 interactions requiring live Webflow runtime beyond exported JS

Import report must **flag** these as “static preview limitations.”

---

## Chunk 5 — Publish + catalog integration

**Goal:** Atomic promotion from staging to live gallery.

### Deliverables
- [x] `POST /api/template-imports/{id}/publish`
- [x] `DELETE /api/template-imports/{id}` (discard staging)
- [x] `POST /api/template-imports/{id}/rollback`
- [x] Publish steps:
  1. Validate `index.html` exists
  2. Validate scrub report clean (no seller URLs)
  3. File lock on `catalog.json`
  4. Move staging → `portfolio/portfolio/<slug>/`
  5. Merge catalog entry:
     ```json
     "<slug>": {
       "title": "...",
       "description": "...",
       "category": "...",
       "aliases": []
     }
     ```
  6. Mark job `published`
- [x] Rollback: retain one hidden `.backup-<slug>-<timestamp>` revision
- [x] Preserve runtime imports and catalog entries across `rsync --delete` deployments

### Slug collision rules
- If slug exists: block publish unless JSON body contains `"force": true`
- Force replaces folder after backup

### Acceptance criteria
- [x] Publish makes template visible at `/portfolio/portfolio/<slug>/`
- [x] Catalog API returns new entry immediately
- [x] Discard removes staging with no public changes
- [x] Rollback restores folder and previous catalog metadata together

### Integrations
- `portfolio/api/lib/catalog.php` — use existing helpers
- `portfolio/api/portfolios.php` — list includes new template

---

## Chunk 6 — Unldash Templates UI

**Goal:** Simplest possible operator workflow — no terminal.

### UX (approved flow)

**User goal:** Import a licensed Webflow template and publish it to the gallery.

**Journey**
1. Open **Templates** (`/templates`)
2. Click **Import template**
3. Enter Webflow URL, title, category, and description; the hostname becomes the stable slug
4. Start import → watch progress
5. Review warnings + preview link
6. **Publish** or **Discard**

### Screen structure
```
/templates
├── Summary cards (published / importing / failed)
├── Template grid (live catalog)
└── Import drawer
    ├── URL + metadata form
    ├── Progress stepper
    ├── Report panel
    └── Publish | Discard
```

### Component hierarchy
- `TemplatesPage`
  - `TemplateSummary`
  - `TemplateGrid` → `TemplateCard`
  - `ImportTemplateDrawer`
  - `ImportProgress`
  - `ImportReport`
  - `PublishConfirmation`

### States (required)
| State | UI |
|-------|-----|
| Empty | CTA to import first template |
| Loading | Skeleton grid |
| Importing | Stepper + cancel |
| Ready | Sandboxed staged preview + report + publish |
| Error | Phase + message + retry |
| Success | Toast + grid refresh |

### Mobile
- Full-screen import sheet
- Sticky bottom Publish/Discard
- Sandboxed staged preview remains inside the full-screen sheet

### Deliverables
- [x] Route in `ulndash/frontend/src/main.jsx`: `/templates`
- [x] Sidebar link wired to the responsive page
- [x] `TemplatesAPI` and `TemplateImportsAPI` services
- [x] Poll active imports every 2s while running
- [x] Authenticated sandboxed static preview route for private staging
- [x] Mobile navigation drawer and full-screen import workflow

### Acceptance criteria
- [x] Operator completes import without SSH
- [x] Staged preview is shown before publish
- [x] Failed jobs show actionable error and safe discard/restart actions

---

## Chunk 7 — Metadata editor (MVP “editable” layer)

**Goal:** Editable template info without raw HTML editing.

### Rationale
Prettified Webflow HTML is still unmaintainable. MVP editor = catalog fields.

### Editable fields
- `title`
- `description`
- `category`
- `aliases[]`
- `featured` (bool, optional)
- `preview_notes` (internal)

### Deliverables
- [x] `PATCH /api/templates/{slug}`
- [x] Edit drawer on template card in Unldash
- [x] Writes to `catalog.json` under a stable file lock and atomic replacement
- [ ] Optional: upload logo override → local `assets/img/logo.png` + manifest flag

### Acceptance criteria
- [x] Title change reflects in preview dock (`cta.js` reads catalog)
- [x] No HTML file edits required for metadata changes

### Explicitly deferred
- Monaco/code editor on `index.html`
- Prettier-on-export as “source”

---

## Chunk 8 — Validation, QA, rollback

**Goal:** No broken templates reach the public gallery.

### Deliverables
- [x] Post-scrub validators:
  - [x] `index.html` exists
  - [x] Zero seller URL/text patterns in HTML
  - [x] Exactly one absolute CTA script on all HTML files
  - [x] No `hireus` class remnants
  - [x] No symbolic links
- [x] Probe up to 12 allowlisted Webflow/font assets; record soft warnings
- [x] Smoke script: `infra/scripts/smoke-template-import.sh <slug>`
- [x] Rollback API restores the retained hidden backup
- [x] Import report JSON stores validation, asset probe, publish, and rollback data

### Acceptance criteria
- [x] Publish is always blocked if validation fails; force only resolves slug collision
- [x] Production integration test covers publish, forced replacement, rollback, seller rejection, asset probe, and discard

---

## Chunk 9 — Hardening & ops

**Goal:** Production-safe on GCE.

### Deliverables
- [x] Rate limit: configurable imports per hour per authenticated user
- [x] Audit log: actor and target for import/publish/replace/discard/rollback/metadata actions
- [x] Worker logs → `/opt/ulnovatech/logs/template-import/`
- [x] Cron: purge unreferenced staging dirs > 7 days and worker logs > 30 days
- [x] Persistent host mounts for private staging and logs across container replacement
- [x] Deploy: migrations, worker, PHP routes, persistent directories, and cron via GitHub Actions
- [x] Docs: operator runbook in `docs/TEMPLATE_IMPORT_RUNBOOK.md`
- [x] Public `rename_template.php` retired with `410 Gone`

### Acceptance criteria
- [x] Staging files and published imports survive deploy on persistent host paths
- [x] Secrets are excluded from job reports, UI responses, and sanitized audit details

---

## Chunk 10 — Section inventory editor

**Goal:** Structured editing beyond metadata — still not raw HTML.

### Approved UX
1. Open a published template and select **Edit page content**
2. Navigate confidently detected sections
3. Edit leaf text, image URL/alt, and safe link fields
4. Review before/after values beside a sandboxed private preview
5. Apply atomically or restore the single previous content revision

Desktop uses a section navigator and field workspace. Mobile uses a section
selector with sticky Review/Apply actions. Loading, no-safe-fields, stale
content conflict, draft expiry, validation failure, applying, and success
states are explicit.

### Deliverables
- [x] Conservative section extractor using semantic elements and Webflow class clusters
- [x] Persistent private profiles under `TEMPLATE_PROFILE_DIR`
- [x] Responsive Unldash structured field editor
- [x] Expiring private draft and sandboxed preview before apply
- [x] Fingerprint conflict detection for concurrent content changes
- [x] Atomic homepage regeneration with seller/CTA validation
- [x] One-step private content backup and rollback
- [x] Audit events without storing edited content values

### Safety boundary
- Only leaf text and explicit `img`/`a` attributes are editable
- Ambiguous nested markup is left read-only
- URLs reject executable and insecure schemes
- Raw HTML is never exposed in the editor
- Profiles, drafts, and backups remain outside `public_html`

---

## Chunk 11 — Future: full rebuild track

**Goal:** Separate product path for true code ownership.

### Options
- Rebuild template in React/Astro from design reference
- Import into Webflow workspace for client customization
- Framer migration for select templates

### Not in scope for gallery importer
This is a **project delivery** workflow, not an import checkbox.

---

## Wget command evolution

### Manual (today)
```bash
wget --mirror --convert-links --adjust-extension --page-requisites \
  --no-parent --level=1 \
  --accept=html,css,js,png,jpg,gif,svg,woff,woff2,ttf,webp \
  --restrict-file-names=windows \
  --user-agent="Mozilla/5.0 ..." \
  --wait=2 --random-wait \
  -P ./template_folder \
  https://example-template.webflow.io/
php rename_template.php  # deprecated
```

### Target (worker-managed)
- Config file per job: `staging/wget.conf`
- Domains allowlist includes template host + CDN
- Cookie from server secret path (not CLI history)
- Output → staging only
- Scrub → validate → user publishes

---

## Seller mole strategy (defense in depth)

| Layer | When | What |
|-------|------|------|
| **Import scrub** | Chunk 3 | Remove `.hireus-*`, strip seller URLs from HTML |
| **CSS hide** | Chunk 3 | Inject hide rules in processed HTML (optional inline) |
| **Runtime `cta.js`** | Existing | Fallback scrubber + UlnovaTech purchase dock |
| **Publish gate** | Chunk 8 | Block if seller patterns detected |

Known signatures:
- `.hireus-badge-wrapper`
- Copy: “transform this example Website”, “Purchase Website”, “Check Details”
- URLs: `webocean*`, `webflow.com/templates/*`

---

## Unldash integration points (codebase)

| Area | Path |
|------|------|
| Frontend routes | `ulndash/frontend/src/main.jsx` |
| Sidebar nav | `ulndash/frontend/src/components/Sidebar.jsx` (line ~68 `/templates`) |
| API router | `ulndash/backend/api.php` |
| Auth gate | `SessionAuth` + `ApiAuth::requireAuth()` |
| Import pattern reference | `ulndash/frontend/src/pages/ImportCSV.jsx` |
| Catalog lib | `portfolio/api/lib/catalog.php` |
| Live templates | `portfolio/portfolio/` |
| Preview CTA/scrubber | `portfolio/portfolio/cta.js` |

---

## MVP definition of done

An operator can:

1. Log into Unldash
2. Open **Templates**
3. Paste a licensed `*.webflow.io` URL
4. Wait for job completion
5. Preview staged template (seller mole gone, UlnovaTech dock present)
6. Edit title/category in UI
7. Publish to gallery
8. See template on portfolio listing + order flow with correct folder ID

---

## Suggested implementation order (sprints)

| Sprint | Chunks | Focus |
|--------|--------|-------|
| **S1** | 0, 1 | Jobs + worker skeleton + API |
| **S2** | 2, 3 | Download + scrub |
| **S3** | 5, 8 | Publish + validation |
| **S4** | 6, 7 | Unldash UI + metadata editor |
| **S5** | 4, 9 | Asset localize option + ops hardening |
| **S6+** | 10, 11 | Section editor / rebuild track (if needed) |

---

## Locked decisions (resolved in Chunk 0)

1. **Default import depth:** shallow (`--level=2`) for the MVP.
2. **Authenticated templates:** no cookie input or stored cookie profile in v1.
3. **Slug naming:** lowercase full source hostname (`willey-fragrance.webflow.io`).
4. **Source of truth:** `catalog.json` for published templates; MySQL only for import jobs.
5. **Authorization:** all authenticated Unldash users may import until role support exists.
6. **Asset storage:** cleaned HTML local; Webflow CDN resources remote by default.
7. **Editing model:** catalog metadata forms, not prettified Webflow HTML.

---

## Related docs

- `docs/ACCESS.md` — production URLs
- `docs/DEPLOY_GCLOUD.md` — deploy path for worker + public_html
- `portfolio/portfolio/catalog.json` — live catalog
- `portfolio/portfolio/cta.js` — preview dock + runtime scrubber
