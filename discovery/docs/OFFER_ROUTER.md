# Offer Router — Pitch Product Selection

**Status:** Implemented (v1) — router + draft fact pack + writer contract + offer chip  
**Purpose:** Deterministic map from Case File / BOI evidence → **one** SleeklyBuilt product line + **one** marketing URL for controlled drafts.  
**Related:** [GREENFIELD_PITCH_FACTORY.md](GREENFIELD_PITCH_FACTORY.md) · [OPERATING_MODEL.md](OPERATING_MODEL.md) · `modules/intelligence/src/boi/resolve-selected-offer.ts` · `modules/intelligence/src/boi/map-pains-to-solutions.ts` · `marketing/src/site.config.js`

---

## North star

When the operator asks for a pitch, the writer already knows:

1. **What is true** about the business (Case File — unchanged)  
2. **What we sell them** (one product line)  
3. **Where to send them** (one deep link — never the homepage)  
4. **How to ask** (short, edged, human)

The router is **rules-first**. The LLM does not choose the product. It only writes from `selectedOffer`.

---

## Product catalog (canonical)

Base: `https://sleeklybuilt.pro` (or `NEXT_PUBLIC` / agency `siteUrl` when wired).

| `productLine` | Label (visitor words) | URL path | Typical package band |
|---------------|----------------------|----------|----------------------|
| `sleek_pages` | Sleek Page | `/sleek-pages` | `basic` |
| `websites` | Website | `/websites` | `smart` or `premium` |
| `mobile_apps` | Mobile app | `/mobile-apps` | custom (no deposit package default) |
| `app_plus_site` | App + website | `/mobile-apps` primary; mention `/websites` in copy only if needed | custom |
| `business_systems` | Business system | `/business-systems` | custom |
| `website_modules` | Site add-on (booking / forms / shop) | `/websites` or `/business-systems` by module | existing site only |

**Forbidden link:** `/` (homepage).  
**Allowed secondary (email only, optional):** `/prices`, `/portfolio-app/`, `/contact?intent=project` — never instead of the primary product URL.

---

## Inputs the router may use

### Opportunity types (`deriveOpportunityType`)

| ID | Meaning |
|----|---------|
| `greenfield` | No owned website (incl. social-only / link-in-bio) |
| `demand_response` | Hot intent signal present |
| `redesign` | Has site + mobile (and often trust) gaps |
| `modernize` | Has site + lighter trust/HTTPS gaps |
| `general` | Weak signal — validate before hard sell |

### Digital gap IDs (`buildDigitalGaps`)

| ID | Role in routing |
|----|-----------------|
| `no_website` | Greenfield primary |
| `social_only` | Greenfield; Sleek Page bias |
| `link_in_bio_only` | Greenfield; Sleek Page bias |
| `missing_online_booking` | Module / systems if site exists; else fold into site offer |
| `missing_email_capture` | Module on existing site; else include in website pitch |
| `missing_analytics` | Soft upsell — never sole product |
| `missing_ecommerce` | Websites (shop) or systems |
| `not_mobile_friendly` | Redesign → `websites` |
| `no_https` | Modernize → `websites` (or HTTPS module language) |
| `website_unreachable` | Treat carefully — verify before hard product claim |
| `crawl_blocked` | Soft evidence — do not invent gaps |

### Structured pain IDs (`buildStructuredPains` + review keywords)

| ID | Role |
|----|------|
| `pain:no_web_presence` | Greenfield |
| `pain:review:no_website` | Greenfield |
| `pain:review:online_presence` | Greenfield / social |
| `pain:review:hard_to_book` | Booking module or systems |
| `pain:booking_gap` | Booking module or systems |
| `pain:lead_capture_gap` | Forms module |
| `pain:measurement_gap` | Soft |
| `pain:commerce_gap` | Shop / ecommerce on websites |
| `pain:website_quality` | Redesign / modernize → websites |
| `pain:review:outdated` | Redesign → websites |
| `pain:review:cant_find` | Local SEO language on websites |
| `pain:review:contact` | WhatsApp/contact path on Sleek Page or websites |
| `pain:intent:*` | Demand — accelerate; product still from presence gaps |

### Industry hints (optional boosters — never alone)

Use when industry / category text matches (case-insensitive substring). These **raise** app/systems priority only when presence already implies complexity or demand says so.

| Hint group | Examples | Bias |
|------------|----------|------|
| `simple_local` | salon, barber, cafe, restaurant, church, clinic (solo), boutique | `sleek_pages` |
| `multi_page` | hotel, school, NGO, law, real estate, agency | `websites` |
| `commerce` | shop, store, supermarket, pharmacy retail | `websites` (+ ecommerce language) |
| `ops_heavy` | SACCO, logistics, inventory, POS, HR, fleet | `business_systems` |
| `app_likely` | delivery, marketplace, fintech, booking platform, ride | `mobile_apps` / `app_plus_site` |

Until industry taxonomy is richer, treat hints as **soft scores**, not hard locks.

---

## Selection algorithm (deterministic)

Evaluate **top-down**. First hard match wins. Emit exactly one `selectedOffer`.

### Step 0 — Safety

- If Case File `status === blocked` or account suppressed → **no offer**; draft generation already fails closed.  
- If `website_unreachable` is the only strong gap and no `no_website` / social-only → product = `websites`, ask = verify URL first; **do not** claim “you have no site.”

### Step 1 — Demand + presence

| Condition | `productLine` | Package | Why (short) |
|-----------|---------------|---------|-------------|
| `opportunityType === demand_response` AND greenfield gaps (`no_website` \| `social_only` \| `link_in_bio_only` \| `pain:no_web_presence`) | Prefer `sleek_pages` if `simple_local` or social/link-in-bio; else `websites` | `basic` / `smart` | Hot intent + no owned site → fast launch |
| `demand_response` AND has real website + (`not_mobile_friendly` \| `pain:website_quality` \| `pain:review:outdated`) | `websites` | `smart`/`premium` | Demand + broken site |
| `demand_response` AND `ops_heavy` / `app_likely` industry | `business_systems` or `mobile_apps` | custom | Demand names the product class |

### Step 2 — Greenfield (factory morning list default)

| Condition | `productLine` | Package | Link |
|-----------|---------------|---------|------|
| `social_only` OR `link_in_bio_only` | `sleek_pages` | `basic` | `/sleek-pages` |
| `no_website` / `pain:no_web_presence` + `simple_local` | `sleek_pages` | `basic` | `/sleek-pages` |
| `no_website` + (`multi_page` \| `commerce`) | `websites` | `smart` | `/websites` |
| `no_website` + phone-only, no industry hint | `sleek_pages` | `basic` | `/sleek-pages` |
| Else greenfield | `sleek_pages` | `basic` | `/sleek-pages` |

**Rationale:** Factory ICP is first owned presence. Sleek Page is the honest “live fast” offer; full website when category clearly needs multi-page / shop.

### Step 3 — Has website (not morning-list primary, still needed for dumpster / modernize)

| Condition | `productLine` | Link |
|-----------|---------------|------|
| `not_mobile_friendly` OR `pain:review:outdated` OR redesign type | `websites` | `/websites` |
| `missing_ecommerce` OR `pain:commerce_gap` | `websites` (shop language) | `/websites` |
| `missing_online_booking` OR `pain:booking_gap` OR `pain:review:hard_to_book` | `website_modules` → prefer `/business-systems` if booking is operational core; else `/websites` | see table |
| `missing_email_capture` OR `pain:lead_capture_gap` only | `website_modules` | `/websites` |
| `no_https` / modernize only | `websites` | `/websites` |
| `ops_heavy` industry + existing site | `business_systems` | `/business-systems` |

### Step 4 — App / systems (explicit, rare in greenfield factory)

Only if Step 2–3 did not already lock a presence offer **and**:

- Intent title/snippet clearly asks for app / Android / iOS / MoMo app, **or**  
- Industry in `app_likely` / `ops_heavy` **and** demand_response  

| Condition | `productLine` | Primary URL |
|-----------|---------------|-------------|
| App requested, no site | `app_plus_site` | `/mobile-apps` (copy may mention website second) |
| App requested, has site | `mobile_apps` | `/mobile-apps` |
| Ops platform / SACCO / inventory language | `business_systems` | `/business-systems` |

### Step 5 — Fallback

| Condition | Offer |
|-----------|--------|
| Anything else with contact path | `websites` + ask to validate need — still link `/websites`, not `/` |
| No usable evidence | Do not invent product; opener-only / operator rewrite |

---

## Output shape (`selectedOffer`)

Inject into draft fact pack (and Case File sales brief when implemented):

```ts
type SelectedOffer = {
  productLine:
    | 'sleek_pages'
    | 'websites'
    | 'mobile_apps'
    | 'app_plus_site'
    | 'business_systems'
    | 'website_modules';
  label: string;           // visitor-facing: "Sleek Page"
  url: string;             // absolute https://sleeklybuilt.pro/...
  packageId: string | null; // basic | smart | premium | null
  why: string;             // one line for operator + model
  matchedGapIds: string[];
  matchedPainIds: string[];
  ask: string;             // e.g. "Quick WhatsApp yes if a one-day launch would help"
};
```

**One product. One URL. One ask.**

---

## Writer contract (consumes router — does not choose)

When `selectedOffer` is present:

1. Homework beat — business name + evidence-backed pain only  
2. Offer beat — use `label` (and package title if `packageId` set)  
3. Optional edge beat — one evidence excerpt max  
4. Ask — use `ask` or channel-specific shortening  
5. Link — **only** `selectedOffer.url` (email / WhatsApp). Phone scripts **speak** the offer; no URL required  

### Channel length (unchanged caps)

| Channel | Max body | Link policy |
|---------|----------|-------------|
| WhatsApp | 420 | One product URL allowed |
| Email | 900 | One product URL in body |
| Phone | talk-track | No URL |
| Follow-up | 700 | Same product URL if still relevant |

### Voice (SleeklyBuilt writer lock)

- Brief, human, edged — not brochure  
- No “hope this finds you well”  
- No homepage  
- No listing multiple product lines  
- No fabricated metrics or reviews  
- Uganda/SMB cadence OK; slang optional, never forced  

---

## Mapping from today’s BOI solutions

Existing `solution:*` rows remain for BOI UI. Router **sits above** them:

| Today `solution:*` | Default `productLine` |
|--------------------|------------------------|
| `corporate_website` | `sleek_pages` or `websites` (by Step 2 rules) |
| `whatsapp_integration` | Fold into `sleek_pages` / `websites` language — not a separate outbound product |
| `online_booking` | `website_modules` / `business_systems` |
| `lead_capture` | `website_modules` → `/websites` |
| `analytics` | Never primary product |
| `ecommerce` | `websites` |
| `mobile_redesign` | `websites` |
| `https_modernize` | `websites` |
| `local_seo` | Soft language on `websites` / `sleek_pages` |

---

## Worked examples

| Lead | Signals | `selectedOffer` |
|------|---------|-----------------|
| Kampala salon, IG only, phone | `social_only`, greenfield | Sleek Page → `/sleek-pages`, package `basic` |
| Hotel, no site | `no_website`, multi_page | Website → `/websites`, `smart` |
| Clinic site, no booking | `missing_online_booking` | Modules / systems → `/business-systems` or `/websites` |
| Retailer site, no shop | `pain:commerce_gap` | Website shop → `/websites` |
| Delivery startup Reddit ask | demand + app language | Mobile app → `/mobile-apps` |
| SACCO, spreadsheets | ops_heavy + demand | Business system → `/business-systems` |

---

## Implementation order (when coding)

1. Add `SelectedOffer` type + `resolveSelectedOffer(caseFile | boi)` pure function + unit tests for the table above  
2. Extend agency preset with `productLines[]` `{ id, label, path }` (URLs from site config)  
3. Inject `selectedOffer` into `DraftFactPack`  
4. Update `channelInstructions` / `buildDraftPrompt` — require offer; allow that one URL  
5. Operator UI: show selected offer chip on draft panel (editable override later)  
6. Optional: persist override on lead for learning  

**Do not** fine-tune a model until (1)–(4) ship and operators edit winners for a few weeks.

---

## Explicit non-goals (v1)

- Multi-product pitches  
- Homepage links  
- Calendly / full booking calendar inside the draft  
- Auto-send  
- Claiming confirmed price in outbound without package band from catalog  

---

## Approval checklist

- [x] Every morning-list greenfield path resolves to `sleek_pages` or `websites` only  
- [x] Every `selectedOffer.url` path exists on marketing site  
- [x] WhatsApp may include exactly one product URL  
- [x] Router unit tests cover social-only, link-in-bio, hotel no-site, booking gap, demand+app  
- [x] Homepage never appears in allowlist  

v1 code: `resolveSelectedOffer` → `DraftFactPack.selectedOffer` → writer prompts → draft panel offer chip (read-only).
