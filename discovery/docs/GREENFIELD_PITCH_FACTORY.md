# Greenfield Pitch Factory

Product plan for daily rotational discovery, overnight purify, a frozen morning list, a recoverable dumpster, and overlay pitching by channel.

Related: [V1_CHARTER.md](V1_CHARTER.md) · [OPERATING_MODEL.md](OPERATING_MODEL.md) · [DISCOVERY_PLANS.md](DISCOVERY_PLANS.md) · [P5_DISCOVERY_CHARTER.md](P5_DISCOVERY_CHARTER.md) · [ACQUISITION_TIERS.md](ACQUISITION_TIERS.md) · [SETUP_RESOURCES.md](SETUP_RESOURCES.md)

Status: **locked direction** — factory loop F0–F5 implemented.

---

## North star

**Every weekday at 07:00 EAT, the operator opens a frozen list of ~100 phone-ready local businesses with no owned website, harvested yesterday, and pitches them from the list overlay — one channel at a time — without leaving the page.**

Everything else that was discovered sits in a **dumpster** (hold / yard): sortable, operable, recoverable. It is not today’s work and it is not deleted.

If a day does not produce that morning list, the factory failed — even if raw discovery “worked.”

### One-line test

> Can a solo operator sit down at 07:00, pitch yesterday’s best greenfield leads before lunch, and ignore the rest until they choose to open the dumpster?

If no → unfinished.

---

## Locked product choices

| Choice | Decision |
|--------|----------|
| ICP | First **owned website** (greenfield). Social-only, Maps-only, phone-only, link-in-bio = in. Real website = out of this flight. |
| Daily volume | **~100** Places-backed keepers after purify. Other live sources are **additionals**, not a second 100. |
| Modernize / redesign | **Not sourced** into the morning list. Dumpster miss reason `has_website` or suppress. |
| Harvest shape | **Many small runs** (country × city × industry), not one global run. |
| Markets | **Tiered.** Core countries you can close, then expand, then probe. Not every UN country equally. |
| “Districts” | **Named cities** in geo (not “All cities”). Neighbourhoods later if needed. |
| Business types | Full catalogue **rotated** over weeks; overweight high no-site types. |
| Clocks | **Harvest today ≠ sell today.** Pitch list = **yesterday’s** purified cohort. |
| Freeze | **07:00 EAT.** Daytime harvest feeds **tomorrow**. |
| Demand exception | Hot Reddit/paste that matches a real local may jump the same-day list. |
| Dumpster | Remainder after the cut. Recoverable inventory with **miss reasons**. |
| Pitch surface | Stay on the list. **Overlay.** Primary action = Pitch. |
| Channels | **WhatsApp, Phone, Email, Follow-up** — rewrite per channel, no auto-send, then **Record**. |
| Intelligence | Case File first, then AI writer. Partial evidence → conservative copy. |
| Auto-send | Never. Copy / wa.me / mailto / call, then record. |

---

## Operating loop

```text
Tiered plans (Website build, greenfield)
  → Cron ticks all day (city × industry rotation, yield-weighted)
  → Places fills ~100-capable harvest; CSE / Meta / social / CSV / Reddit overlay
  → Holding pool (dirty, not pitchable)
  → Night purify (~22:00–06:30 EAT)
  → Cut: Morning list (~100) | Dumpster (the rest + miss reasons)
  → 07:00 EAT freeze
  → Overlay pitch by channel → Record → Pipeline (CONTACTED)
  → Outcomes → yieldScore / suppress empty segments → smarter rotation
```

### Two clocks

| Clock | Window | Output |
|-------|--------|--------|
| Harvest | ~07:00–22:00 EAT | Raw accounts into **tomorrow’s** cohort |
| Purify | ~22:00–06:30 EAT | Rank, greenfield confirm, phone, crawl, Case File for keepers |
| Sell | 07:00 EAT onward | Frozen **morning list** + optional dumpster work |

### Three surfaces (must not mix)

| Surface | Question | Primary action |
|---------|----------|----------------|
| **Pitch today** | Who do I contact now? | Pitch (recommended channel) |
| **Dumpster** | What did we find that is not today? | Sort, promote, snooze, suppress |
| **Pipeline** | Who is already in motion? | Follow-up, proposal, close |

A lead leaves Pitch today when outreach is recorded (or skipped to dumpster). Pipeline is not the morning stack.

---

## Source mix (reach vs overlay)

| Role | Source | Job |
|------|--------|-----|
| Always-on reach | Google Places / Maps | Volume for the ~100 |
| Cheap frequency | CSE public search (prospect focus), Meta Graph | Same segments; social-only Maps missed |
| Optional | TikTok `site:` only; Bing if CSE exhausted | Do not steal CSE from prospect queries |
| High-intent overlay | Reddit custom scrape, paste, RSS | Best closes; not the 100 |
| Operator list | CSV | Known no-site names |
| Off for this flight | Browser automation, boost pagination, Place Details review-pain, Modernization campaign | Wrong ICP or wasted Places |

Discover order stays: Places → public search → Meta → social → CSV. **Ingest discipline:** do not keep `websiteClass=real` on the morning path.

Places planning volume: on the order of **15–25 Text Search calls/day** for ~8–12 standard city×industry runs, if real-website listings are dropped before the 100. Skip review Details for this flight.

---

## Rotation (media plan)

Segment = **country × city × industry**.

Each cron tick buys **one** segment. Worker already ticks Discovery Plans (~60s) and `POST /api/discovery/plans/tick`.

**Exploit:** `yieldScore` (qualified + 2× high-opportunity + new accounts + wins − losses).  
**Explore:** never-run segments first while scores are 0; keep ~1/8 slots for oldest/unseen so winners do not starve new cities.  
**Kill:** 3 empty runs → 7-day suppress (already in plan yield).

### Market tiers

| Tier | Weight of daily Places | Example |
|------|------------------------|---------|
| A — can close (language, pay, timezone) | ~60% | Start 1–3 countries |
| B — similar SMB density | ~30% | Promote winners to A |
| C — probe | ~10% | One new country/week |

### Recommended plans (two, not fifty)

**Plan A — Core reach:** campaign `website_build`, sources `google_maps` (+ live additionals), presence greenfield, prospect focus on, standard profile, named Tier A cities, every ~2 hours in active hours, **10–12 runs/day**, 1 concurrent.

**Plan B — Explore:** same filters, Tier B / leftover industries, **1–2 runs/day**, lower priority.

**Demand:** Reddit poll in parallel; not a discover fan-out.

High no-site types first: Restaurant, Salon & Spa, Automotive, Construction, Retail, Fitness, Hospitality. Defer Technology / Web Development / Marketing Agency / Education.

Default `maxRunsPerDay` of 8 is in the right band; 12 if keepers are thin. ~8–20 keepers per good run → ~8–12 runs for ~100.

---

## Night purify → dumpster

Night job stamps a **cohort date** (the sell morning).

Keep if: greenfield (no owned site after crawl), OPERATIONAL, phone, not suppressed, not already pursued.

Rank: score, reviews/proof of life, WhatsApp screening, demand match, Tier A geo.

Cut top ~100 → morning list. Remainder → dumpster with **miss reason**.

Pre-compute **recommended channel:** WhatsApp if `wa_ready` / probable, else phone, else email. Pre-warm Case File so 07:00 is not a spinner.

If purify fails: do **not** ship a dirty 100. Last good cohort or explicit failure state.

### Dumpster

Not trash. Recoverable inventory.

Open from Pitch today: **View dumpster (N)**. Same workspace, second mode or sheet.

Must have: search, sort, filter by miss reason / geo / industry / source, row overlay, bulk ops.

| Miss reason | Typical op |
|-------------|------------|
| Over the 100 | Promote to tonight / tomorrow |
| No phone | Enrich or leave |
| Real website | Leave or suppress |
| Duplicate | Merge |
| Wrong geo | Retag or leave |
| Already pursued | Leave |
| Closed / junk | Suppress |

Ops: promote, pitch anyway (breaks freeze on purpose), snooze, suppress, mark has website, restore to morning list (mistake recovery).

Dumpster may be re-ranked on later nights (bench, not grave).

---

## Overlay pitch (list never unmounts)

Row click → right sheet. List stays. Next/prev. After Record → next unpitched in today’s 100.

```text
Main: Case File (who, why greenfield, proof, phone, Maps)
Sticky: Pitch
  [ WhatsApp | Phone | Email | Follow-up ]
  Generate → edit → copy / open channel → Record
```

Mobile: details then pinned Pitch.

Not a full CRM in the overlay. Proposals/notes behind **More**. Rare **Open full record**.

Writer uses Case File only. Switching channel **rewrites**. Record is what moves the lead to Pipeline (CONTACTED).

Channels (already in product):

| Channel | Output | Send |
|---------|--------|------|
| WhatsApp | Short message, one ask | Copy + wa.me → Record |
| Phone | 15s open, hook, evidence, ask, objections | Call → Record |
| Email | Subject + body | Copy / mailto → Record |
| Follow-up | Shorter second touch | Same as last channel → Record |

---

## Daily scoreboard

| Metric | Target |
|--------|--------|
| Morning list size (greenfield + phone, cohort = yesterday) | ~100 |
| Crawl still no real site | ≥ 85% |
| Ready by 07:00 EAT | Yes or explicit fail |
| Modernize on morning list | ~0 |
| Additionals without Maps match | Bonus, not filler |
| Dumpster with miss reasons | 100% of remainder |
| Pitches recorded from overlay | Operator throughput (aim: morning list before EOD) |

---

## What already exists (do not rebuild)

- Discovery Plans: matrix, cadence, tick, `yieldScore`, empty-streak suppress, `website_build` campaign, greenfield presence filter
- Sources: Places, CSE/Bing, Meta, social search, CSV, Reddit demand
- Scoring / work queue default **greenfield** lane; `websiteClass`; Case File; channel drafts; Queue inspector overlay
- Worker plan tick ~60s; HTTP `/api/discovery/plans/tick`

Gaps vs this north star: **cohort freeze**, **night cut + dumpster**, **Places ingest skip real websites**, **explore quota vs pure highest-yield**, **Pipeline/leads overlay pitch bay**, **07:00 Today opens on Pitch today not raw runs**.

---

## Chunks

Ship in this order. A chunk is done only when the operator-visible loop for that slice works — not when a table exists.

### Phase 0 — Point the factory (no new surface)

| ID | Chunk | Done when |
|----|--------|-----------|
| **F0-A** | Lock Tier A countries + first city list + 8 vs 12 daily slots | Catalogue in `plans/factory-markets.ts`; Plan A 12/day, Plan B 2/day |
| **F0-B** | Credentials live: Places required; CSE key if using search; Reddit already on | `GET /api/discovery/sources` includes `factory`; Discovery → Provider status shows Places required + CSE CX-without-key; scheduler skips Maps plans with `skipped_credentials`; `pnpm discovery:factory-health` |
| **F0-C** | Two plans live: Plan A Website-build core, Plan B explore | `pnpm discovery:seed-factory` or worker startup; named cities; greenfield + prospect focus; no All cities; no modernization plan |
| **F0-D** | Places cap sized for ~15–25 Text Search/day | Default / floor **600**/month |

**North-star contribution:** harvest actually runs all day.

Seed (idempotent; will not overwrite existing factory plans):

```bash
pnpm discovery:seed-factory
pnpm discovery:factory-health
```

`pnpm discovery:factory-health -- --probe` spends one Places Text Search (Kampala restaurant) when a key is present. It does **not** mint Google keys. Paste a Places API (New) key in **Settings → API credentials**. A Programmable Search widget `cx=` is not a CSE JSON API key — overlay still needs `GOOGLE_CSE_API_KEY` plus CX.

Factory plans are Places-only. Missing Places does **not** block CSV-only manual runs (`ready` stays “any configured source”). The scheduler skips Factory A/B until Places is configured.

---

### Phase 1 — Harvest hygiene (the 100 is greenfield)

| ID | Chunk | Done when |
|----|--------|-----------|
| **F1-A** | Drop `websiteClass=real` from morning-path ingest (keep none + link-in-bio) | Factory/greenfield plan runs set `drop_real_websites`; Places ingest + discover stage skip owned sites |
| **F1-B** | Prospect-focus default on factory plans; social search TikTok-only or off | Factory sources stay Places-only (social off); `filters.socialSearch=tiktok` if overlay enabled; plan discover uses plan.sources |
| **F1-C** | Explore floor (~1/8 slots never-run / oldest) so yield winners do not starve new cities | `pickNextTarget` every 8th run orders by oldest/`lastRunAt` null first |
| **F1-D** | Cohort stamp on accounts/runs (`harvestDate` / `sellDate`) | Plan morning runs stamp EAT harvest date and sell date = harvest+1; Tuesday harvest cannot sell Tuesday |

**North-star contribution:** volume is the right *kind* of lead.

---

### Phase 2 — Night purify + 07:00 freeze

| ID | Chunk | Done when |
|----|--------|-----------|
| **F2-A** | Night job: dedupe, greenfield+crawl confirm, phone gate, OPERATIONAL, suppress/pursued skip | Dirty pool ≠ morning list. `FactoryPurifyService` gates harvest rows (`drop_real_websites` + `harvestDate`) |
| **F2-B** | Rank + cut ~100; miss reasons on remainder | Every leftover has a reason (`suppressed`, `already_pursued`, `has_website`, `no_phone`, `not_operational`, `over_cut`) |
| **F2-C** | Freeze at 07:00 EAT; Today opens on **Pitch today** for that cohort | Copy states “Ready from yesterday’s harvest”; daytime worker skips purify (`inWindow: false`); `/leads?pitchToday=1` |
| **F2-D** | Pre-warm Case File + recommended channel for the 100 | Overlay opens without a long first load. Worker promotes keepers to Pipeline then stores `case_file` JSON; pre-warm failure does not unfreeze |
| **F2-E** | Purify failure state | No silent dirty 100. Empty harvest or throw → `failed` + last frozen `fallbackCohortId`. Operator CLI: `pnpm discovery:purify` (`--force` rebuilds a frozen day) |

**North-star contribution:** 07:00 list exists and is trustworthy.

Worker ticks purify between 22:00–07:00 EAT. Daytime harvest feeds tomorrow. Operator:

```bash
pnpm discovery:purify
```

---

### Phase 3 — Dumpster

| ID | Chunk | Done when |
|----|--------|-----------|
| **F3-A** | Dumpster as second mode from Pitch today (count on the button) | Click **View dumpster (N)** from Today or Pitch today → `/leads?dumpster=1` remainder list, not a SQL dump |
| **F3-B** | Sort/filter: miss reason, geo, industry, source, score, date | Chips + search; Over the 100 is one tap |
| **F3-C** | Ops: promote, snooze, suppress, mark has website, restore, pitch anyway | Bulk + row inspector; dumpster ≠ suppress list. Restore joins Pitch today; pitch anyway creates a pursuit without adding to the frozen 100 |
| **F3-D** | Later nights may re-rank dumpster into a new cut | Next purify benches previous `over_cut` / `no_phone` (not suppressed, not snoozed) into the new ranking pool |

**North-star contribution:** the rest of discovery is usable, not lost.

---

### Phase 4 — Overlay pitch factory

| ID | Chunk | Done when |
|----|--------|-----------|
| **F4-A** | Pitch today + Pipeline list: row → sheet overlay, no route away | ✅ Row opens `?selected=` overlay; close clears selection; list stays mounted |
| **F4-B** | Overlay = Case File + sticky channel composer (WA / Phone / Email / Follow-up) | ✅ `PitchOverlayDrawer`: Case File body, composer in drawer footer; More → full `/leads/[id]` |
| **F4-C** | Generate uses Case File; channel switch rewrites; copy/open + Record | ✅ Reuses `ChannelPitchComposer`; Record → CONTACTED via outreach API |
| **F4-D** | After Record, auto-advance to next unpitched in the cohort | ✅ Fetches unpitched keepers by rank; advances `selected` |
| **F4-E** | Same overlay on dumpster with Promote primary | ✅ Restore primary in footer; Case File + composer when `leadId` exists |

**North-star contribution:** pitching is the easy next action.

---

### Phase 5 — Close the loop

| ID | Chunk | Done when |
|----|--------|-----------|
| **F5-A** | Scoreboard on Today: keepers, dumpster size, pitches recorded, purify status | ✅ Today card: four tiles + integrity strip; `/api/factory/cohort` includes `scoreboard` |
| **F5-B** | Win/loss → segment yield already in plans; show it on Pitch today (“this city type works”) | ✅ Factory plan target `yieldScore` / won-lost on Today and Pitch today banner |
| **F5-C** | Hot demand same-day jump (optional, last) | ✅ Phone-ready greenfield demand jumps the frozen list (front rank); dirty harvest stays out |

**North-star contribution:** the factory is measurable and self-tuning.

---

## Sequence (do not reorder)

```text
F0 credentials + two plans
  → F1 ingest hygiene + cohorts
  → F2 night purify + 07:00 freeze
  → F3 dumpster
  → F4 overlay pitch
  → F5 scoreboard / learning
```

F3 and F4 can overlap after F2-C (dumpster empty of ops is still a list; overlay can start on Pitch today only). **Do not** build overlay pitch on a live mixed queue before freeze exists — that recreates today’s firehose.

---

## Out of scope (this north star)

- Auto-send email or WhatsApp
- Equal spend across all countries
- Filling the 100 with modernize leads
- Market Hunter (separate product)
- Replacing sleekly-dash as the system of record for closed deals

---

## Definition of done (factory)

The north star is true on a normal weekday:

1. Worker + Plan A ran across Tier A cities and types.  
2. Night purify produced a cohort.  
3. At 07:00 EAT, Pitch today shows ~100 greenfield + phone (or a honest shortfall).  
4. Dumpster holds the rest with reasons.  
5. Operator pitches from overlay by channel and records without opening `/leads/[id]`.  
6. Today’s new Maps hits are **not** on today’s pitch list.

Until then, individual APIs and screens can work and the factory is still unfinished.
