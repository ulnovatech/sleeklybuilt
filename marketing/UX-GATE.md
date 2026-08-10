# SleeklyBuilt Marketing Hub — UX Gate Artifacts

**Version:** 2.0  
**Status:** Wave 9 gate open — see `marketing/REDESIGN-WAVE-9.md`. Phases 0–8 remain historical (`PHASE-8-APPROVAL.md`, 96/100).  
**Date:** 2026-08-08 (Wave 9); 2026-08-07 (Phases 0–8 archive)  
**Governing plan:** System redesign Wave 9 (typography → spatial → forms → nav → color)  
**Product classification:** Marketing / Agency (+ Portfolio / Projects for gallery + order)

This file satisfies `.cursor/rules/ui-ux-gate.mdc` and `design-os/prompts/redesign.md`.  
**No user-facing UI for Wave 9 may be implemented until that surface’s §15 artifact is recorded and the governing pattern is opened in the implementation turn.**

Active decision memo: [`REDESIGN-WAVE-9.md`](./REDESIGN-WAVE-9.md).

---

# 0. Change motivation

## 0A. Wave 9 motivation (active — 2026-08-08)

Legitimate reasons for this redesign wave:

1. **Display typography costs trust.** Instrument Serif + theatrical hero sizing reads as a lifestyle brochure, not a calm systems studio; body type is acceptable and must be preserved.
2. **Spatial hierarchy is uneven.** Loud heroes, giant decorative numerals, and uneven section air produce eye fatigue and “theme-y” scrolling rather than a restful F/Z scan.
3. **Forms are competent but not appetizing.** Flattened contact (Phase 7) improved a11y; it did not deliver a guided reward loop. Prospects need progress, chunking, and review-before-send.
4. **Marketing vs Projects feel like two products.** Header/footer grammar, focus, CTA, and base-path behavior diverge; brand family is broken.
5. **Color mood risks parchment boutique** over operational confidence; emerald/gold DNA stays, canvas and accent discipline need recalibration.

Not a motivation: redesign for novelty alone. Phase 8 remains valid for prior scope; Wave 9 re-audits and supersedes only the decisions listed in §15.2 and `REDESIGN-WAVE-9.md`.

## 0B. Phases 0–8 motivation (historical — 2026-08-07)

1. The site cannot yet express the product line split (Sleek Pages vs Websites vs Apps vs Systems) — product pages are shells.
2. Accessibility and honesty defects in shipped code (reduced motion, unverifiable stats, mixed icon libraries) block Design OS final approval.
3. Inconsistency between Design OS patterns and current screens makes extension expensive.
4. Appearance costing trust: generic agency clichés and incomplete conversion paths weaken conversion.

---

# 1. Users of record

| Persona | Dependence | Cost of change |
| --- | --- | --- |
| Prospect (owner / ops lead) | Discovers services, browses work, contacts | Low memory; high first-impression cost |
| Returning buyer | Tracks order via `/track-order`, re-contacts | High — must keep reference + phone lookup |
| Existing client (WhatsApp / email) | Direct contact channels, newsletter | Medium — preserve phone/email/WhatsApp |
| Staff (support) | Receive form submissions, order status | Medium — form fields and order API shape |
| Assistive-tech users | Keyboard, screen reader, reduced motion | High — must not regress Cmd+K, focus, motion |
| Integrators | Deep links to `/portfolio-app/`, contact form POST | High — preserve URLs and API contracts |

---

# 2. Inherited constraints

- Ten marketing routes plus external `/portfolio-app/` must keep resolving (or redirect).
- Primary CTA label: **Start a project** → `/contact`.
- Contact form posts to `/php/contactus.php`.
- Order lookup posts to `order-status.php` with `tx_ref` + phone.
- Layout catalog from `portfolios.php?collection=websites|sleek-pages`.
- Cmd/Ctrl+K opens command palette.
- Brand tokens in `marketing/DESIGN.md` / `index.css` — Design OS owns role names.
- Mobile-first; touch targets ≥ 44×44; no fabricated proof.

---

# 3. Classification output

| Dimension | Value |
| --- | --- |
| Category | Agency website (marketing) |
| Secondary | Portfolio (projects gallery), Landing (home) |
| Users | Professional / executive buyers |
| Mindset | Learn → Contact |
| Personality | Premium, Confident, Modern |
| Density | Low (pages); Medium (gallery) |
| Device | Phone first |
| Navigation | Required (brand / multi-intent) |
| Primary conversion | Start a project / contact |
| Secondary | See work / browse layouts (informational) |

**Governing docs (site-wide):**

- `design-os/INDEX.md` → agency + redesign + visual foundation routes
- `design-os/prompts/agency_website.md`
- `design-os/prompts/redesign.md`
- `design-os/intelligence/landing_page_intelligence.md`
- `design-os/intelligence/content_intelligence.md`
- Patterns: `hero_sections`, `feature_sections`, `faq`, `contact`, `pricing`, `multi_step_form`, `search`
- Systems: design tokens, color, typography, motion, empty/loading/error
- Reviews: visual, UX, accessibility, mobile, final_approval
- **Wave 9 active:** `marketing/REDESIGN-WAVE-9.md` + UX-GATE §15

---

# 4. Scope decision

## 4A. Wave 9 scope (active)

**Incremental redesign with systemic visual/interaction foundation** — not a wholesale product rewrite.

**In scope**

- Marketing hub UI/UX end-to-end (home, product pages, contact, pricing, about, track-order, 404, shared chrome).
- Shared navigation language between marketing and Projects/portfolio SPA.
- All customer-facing data-entry forms: contact, newsletter, track-order, Projects order wizard, Rainbow quote (fix or remove).
- Typography system, color mood, spacing rhythm, section composition, motion, states.

**Out of scope**

- Discovery dashboard / Sleekly Dash admin product UI.
- Fabricating testimonials, metrics, or sample business data.
- New product features unrelated to redesign quality.
- Changing primary CTA label or core API field contracts without a transition plan.

**Rollout:** foundation tokens → chrome → pages → forms → reviews. Prefer continuous deployable increments over a hard cutover.

## 4B. Phases 0–8 scope (historical)

**Incremental redesign** (default per redesign prompt).

- Keep Phases A–C shell (nav, search, five-section home skeleton, routes).
- Remediate defects first (tokens, motion, honesty, icons).
- Complete product/contact/pricing/gallery/form to patterns.
- Do not wholesale rewrite Header, Cmd+K, or route map without a named problem.

---

# 5. Preservation list

Do not change without a written finding and transition plan:

| Item | Reason |
| --- | --- |
| `/`, `/sleek-pages`, `/websites`, `/mobile-apps`, `/business-systems`, `/products`, `/contact`, `/about`, `/prices`, `/track-order` | Indexed / shared links |
| `/portfolio-app/` | Gallery and order flows |
| CTA copy **Start a project** | Muscle memory and consistency |
| Cmd/Ctrl+K search | Discovered keyboard path |
| Contact path ≤ 3 taps from any page | Agency decision criterion |
| Form field semantics (name, phone, email, subject, message) | Backend + support process |
| Contact `submission_key` + reference response | Idempotency + support |
| Order lookup (reference + phone) | Returning buyers |
| Portfolio order/pay API JSON contracts | Checkout continuity |
| Layout catalog `collection=websites\|sleek-pages` | Gallery scope |
| Flat main nav (5 items) on marketing | Fixed hash-link dead-end problem |
| Hero Variant C (no fabricated UI) | Honesty |
| Honesty / layout-not-template / no emoji icons | Content contract |

## 5.1 Wave 9 change register

| Change | Class | Transition |
| --- | --- | --- |
| Replace Instrument Serif with neo-grotesk display | Surface → structural (type system) | Update `DESIGN.md`, `index.html`, CSS roles; remove serif brand mark |
| Recalibrate cream → soft-neutral if needed | Surface | Token swap; document hex |
| Contact: flat → guided multi-step + review | Behavioural | Keep field semantics + draft key; add progress/steps; preserve a11y summary |
| Newsletter / Track Order: elevate labels + inline errors | Behavioural (light) | No API change |
| Projects order wizard: SR progress + field errors + review | Behavioural | Keep order/pay endpoints |
| Rainbow quote: fix real API or remove submit | Behavioural / structural | No fake `/api/developer-quote` |
| Shared header/footer grammar marketing ↔ Projects | Structural (chrome) | Visual parity; fix dead links / base path |
| Remove giant decorative numerals; normalize section rhythm | Surface | Spatial pass |
| Obsidian budget: reconcile PageHeader vs “3 dark bands” | Surface / system | Prefer light page headers or count carefully |

Items **not** changing: routes, Start a project, Cmd+K, contact POST shape, order-status shape, catalog API.

---

# 6. Behaviour inventory (all routes)

## 6.1 Home `/`

| Field | Current |
| --- | --- |
| Purpose | Orient visitor; show product lines; prove with live work; explain process; invite contact |
| Entry | Direct, brand, ads, nav logo, 404 recovery |
| Exits | Product pages, `/portfolio-app/`, `/contact`, footer, Cmd+K |
| Actions | Start a project, See our work, product cards, layout preview links, View all projects, form submit, channel links |
| Keyboard | Tab through header/CTA; Cmd+K |
| URL | `/` — anchors `#hero`, `#what-we-build`, `#work`, `#process`, `#contact` |
| States | Selected work: loading / ready / empty / error. Form: loading / success / field errors via toast. Hero: static only |
| Permissions | Public |
| Defaults | None |

**Agency IA gap:** missing Positioning, Problems We Solve, Proof (as dedicated trust), FAQ. Present: Hero, Services (as What we build), Process, Portfolio teaser, Contact band.

## 6.2 Sleek Pages `/sleek-pages`

| Field | Current |
| --- | --- |
| Purpose | Sell 24-hour premium layouts |
| Entry | Nav (badge New), search, home cards, footer |
| Exits | Contact, ContactCtaBand |
| Actions | Start a project only |
| States | None for gallery (not built) |
| Gap | Shell only — no features, FAQ, layout gallery |

## 6.3 Websites `/websites`

Same shell pattern; secondary **Browse projects** → portfolio. Gap: features, FAQ, portfolio CTA section.

## 6.4 Mobile Apps `/mobile-apps`

Shell only. Gap: features, FAQ, MoMo/proof narrative.

## 6.5 Business Systems `/business-systems`

Shell only. Gap: features, FAQ, systems examples.

## 6.6 All Products `/products`

Shell; competing CTAs (Browse projects primary, Start a project ghost). Gap: product grid, FAQ, service re-homes.

## 6.7 Contact `/contact`

| Field | Current |
| --- | --- |
| Purpose | Convert inquiry |
| Entry | CTA everywhere, footer, search |
| Actions | Multi-step form, ContactInfoSection channels |
| States | Form loading/success/toast errors; no draft persistence; no reference code; channels below form on mobile (pattern wants channels first) |
| Gap | Full `patterns/contact.md` compliance |

## 6.8 About `/about`

| Field | Current |
| --- | --- |
| Purpose | Who we are / trust |
| Actions | None primary |
| States | Image onError fallback |
| Defect | `aboutStats` unverifiable counts + emoji icons; centered legacy layout; gray utility colors |

## 6.9 Pricing `/prices`

| Field | Current |
| --- | --- |
| Purpose | Compare packages; convert |
| Actions | Tab websites/apps; Get started per card (mixed destinations); track-order link |
| States | No empty/error for packages (static config); emoji on cards |
| Gap | `patterns/pricing.md` (matrix, FAQ, tax note, recommended plan rules) |

## 6.10 Track order `/track-order`

| Field | Current |
| --- | --- |
| Purpose | Returning buyer status |
| Actions | Lookup, reset, WhatsApp |
| States | Loading, success (order), toast errors; empty = form |
| Gap | Token/visual alignment; copy still says "Template" |

## 6.11 Not found `*`

Recovery: home CTA + product grid. Adequate as recovery pattern.

## 6.12 Global chrome

| Surface | Behaviour |
| --- | --- |
| Header | Fixed; tone hero/light; search; mobile drawer; Start a project |
| Cmd+K | Pages + products + live layouts; loading/error/empty |
| Footer | Obsidian; newsletter; useful + service links |
| FloatingContact | WhatsApp (legacy green hex) |
| ServiceInquiryModal | Mounted but unreachable from home after Phase C |

---

# 7. Findings list

| Finding | Evidence | Who | Impact | Class |
| --- | --- | --- | --- | --- |
| No `prefers-reduced-motion` | `index.css` `scroll-behavior: smooth`; Reveal still OK but no CSS guard | Assistive-tech | A11y block | **Defect** |
| Unverifiable About stats | `aboutStats` 232+/521+/1463+/13 + emoji | All prospects | Honesty / Design OS ban | **Defect** |
| Mixed icon libraries | FA in 4 section files + FI elsewhere | Maintainers / visual consistency | Iconography ban | **Inconsistency** |
| Hero fold risk | `min-h-[85vh]` + `pt-36` | Mobile visitors | Action may be below fold | **Limitation** |
| Home missing agency sections | No Positioning / Problems / Proof / FAQ | Prospects | Incomplete trust narrative | **Limitation** |
| Product pages are shells | Header + CTA only | Product seekers | Cannot evaluate fit | **Limitation** |
| Token binding ~60% | Missing overlay/muted/disabled/secondary/danger/status surfaces; no motion/shadow/z tokens | Dev / review | Final approval judgment gate | **Limitation** |
| Focus ring = emerald; also gold rings | Components use both | Keyboard users | Inconsistent focus | **Inconsistency** |
| Pricing emoji + gray tokens | PriceCard | Buyers | Copy/icon rules | **Resolved** (Phase 4) |
| Contact not pattern-complete | No reference, draft, channels-first mobile | Inquirers | Friction / trust | **Resolved** (Phase 4; form field a11y remains Phase 7) |
| Form placeholders as labels | GamifiedContactForm | A11y | Forms system ban | **Resolved** (Phase 7) |
| Form errors via toast only | No field-linked errors | Inquirers | Recoverability | **Friction** |
| proof.js still says "templates" | Customer-facing | Copy rule | Brand language | **Inconsistency** |
| Products page CTA competition | Browse primary vs Start ghost | Converters | Agency one-primary rule | **Friction** |
| Unreachable inquiry modal | App.jsx still mounts | — | Dead code path | **Limitation** |
| `rounded-2xl` off radius scale | Widespread | Visual system | Preference | **Preference** |
| ServiceInquiryModal dead | No home openers | — | Dead code | **Resolved** (Phase 3 — removed) |

**Usage evidence note:** Live analytics baselines are not available in-repo ("we do not know"). Do not invent traffic figures. Instrument conversion paths before Phase 8 claims victory.

---

# 8. Gate artifacts by screen

For each screen: User Journey → UX Flow → Screen Layout → Component Structure → Empty / Loading / Error → Named Design OS docs.

---

## 8.1 Home `/`

### Named docs

`agency_website`, `landing_page_intelligence`, `content_intelligence`, `hero_sections` (Variant C), `feature_sections`, `faq`, `contact` (closing band), `search`, motion + empty/loading/error systems.

### User journey

Arrive cold or branded → understand what SleeklyBuilt builds → see proof → understand process → contact or browse work.

### UX flow

```
Land → Read hero (what / who / one action)
  → Scan product lines (choose path or continue)
  → Inspect live work (or recover from empty/error)
  → Read process
  → Optional FAQ (planned)
  → Contact form or channels
```

### Screen layout

**Mobile (implemented Phase 2)**

1. Obsidian hero (Variant C): brand eyebrow, outcome headline, lead, primary CTA, reassurance, commitment proof strip; no `min-h` / never 100vh; compact top padding so the action clears the fold.
2. Positioning — who we help.
3. Problems we solve — three problem → outcome columns.
4. What we build (4 product cards).
5. Selected work (3 cards from API).
6. How we work (3 steps).
7. FAQ — PeopleAsk Variant A (6 questions + deflection).
8. Let's talk (form + channels).

**Desktop:** same order; wider grids for cards and proof strip.

Hero CTA remains the first conversion moment; same label repeated in FAQ deflection and Let's talk.

### Component structure

```
HomePage
├── HeroSection (+ commitment proof strip)
├── PositioningSection
├── ProblemsWeSolveSection
├── WhatWeBuildSection
├── SelectedWorkSection
├── HowWeWorkSection
├── PeopleAskSection
└── LetsTalkSection
    ├── GamifiedContactForm
    └── ChannelList
```

### States

| Region | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Selected work | 3 skeletons | Honest empty + contact | Retry + open gallery | Cards |
| Contact form | Sending… | — | Linked field errors + assertive summary | Confirmation |
| Hero / static | — | — | Image N/A (text-only) | — |
| FAQ (planned) | Prefer SSR/static | Do not render if zero | — | Expanded answers |

---

## 8.2 Product pages (shared template)

Routes: `/sleek-pages`, `/websites`, `/mobile-apps`, `/business-systems`, `/products`.

### Named docs

`agency_website`, `feature_sections` Variant A, `faq` Variant A, `components/landing_pages`, `content_intelligence`. **Not** a full hero on every page — use `PageHeader`.

### User journey

Choose a product line from nav/home → understand fit (problem → outcome) → resolve objections (People ask) → contact or browse related gallery.

### UX flow

```
PageHeader (what / for whom / primary CTA)
  → 3–5 feature sections (text before media on mobile)
  → Optional mini-gallery (Sleek Pages / Websites only)
  → PeopleAsk (4–8)
  → ContactCtaBand (same CTA label)
```

### Screen layout

**Mobile:** stacked PageHeader → features → FAQ accordion (≥56px rows) → CTA band.  
**Desktop:** feature splits where justified; FAQ single column (no two-column Q grid).

### Component structure

```
ProductPageLayout
├── PageHeader
├── FeatureSectionGroup
├── LayoutsGallery* (Sleek Pages / Websites — Phase 6)
├── PeopleAskSection
└── ContactCtaBand
```

### States

| Region | Loading | Empty | Error |
| --- | --- | --- | --- |
| Feature media | Progressive image | Text-only section | Broken image still readable |
| Gallery* | Skeletons | Honest empty + contact | Retry |
| FAQ | Static preferred | Omit section if &lt;4 questions | — |

**Per-page primary CTA:** Start a project (except Products index may lead with product grid; primary conversion remains contact).

**Products `/products`:** grid of four lines first; one primary conversion (Start a project); Browse projects secondary.

---

## 8.3 Contact `/contact`

### Named docs

`patterns/contact.md`, `multi_step_form.md`, `forms_system`, `content_intelligence`, `error_states_system`.

### User journey

Decided to inquire → pick channel or form → submit → receive confirmation + what happens next.

### UX flow

```
PageHeader (promise: reply within one working day)
  → Mobile: channels first → form
  → Desktop: form + expectations / channels rail
  → Submit → confirmation page state (same URL)
```

### Screen layout

Mobile: channels (email / call / WhatsApp) above form; one field visible per step until Phase 7 may flatten; no map embed.  
Desktop: form left, faster options + self-service right.

### Component structure

```
ContactPage
├── PageHeader
├── ChannelPanel
├── ExpectationList (trustCommitments)
├── GamifiedContactForm → MultiStepContactForm
└── SubmissionConfirmation (page state)
```

### States

| State | Design |
| --- | --- |
| Loading first visit | Form interactive immediately |
| Submitting | Disable submit; process label |
| Field error | Linked to control; assertive summary |
| Rate limit / network | Recoverable message + retry; preserve draft |
| Success | Reference code; reply-from expectation; no new route |
| Empty channels | Hide channel panel |

---

## 8.4 About `/about`

### Named docs

`agency_website` (About), `content_intelligence`, visual language. No full marketing hero — page header pattern.

### User journey

Validate who is behind the work → trust → return to contact or work.

### UX flow

Header → story → differentiators → **verifiable** trust (commitments or named proof) → CTA.

### Screen layout

Left-aligned header; story + image; replace stats strip with `trustCommitments` or omit numbers.

### States

Image fail → hide or logo fallback (existing). No fabricated metrics.

---

## 8.5 Pricing `/prices`

### Named docs

`patterns/pricing.md`, `faq` (PricingFaq), `content_intelligence`.

### User journey

Compare packages → pick tier or contact → optional track existing order.

### UX flow

```
Header → period/category controls → PlanGrid → optional matrix → PricingFaq → contact
```

### Screen layout

Mobile: one plan per row, recommended first, max 3 bullets, no horizontal carousel.  
Desktop: ≤4 columns; aligned CTAs.

### Component structure

```
PricesPage
├── PageHeader
├── PricingControls (websites | apps)
├── PlanGrid / PlanCard
├── TaxAndCurrencyNote
├── PricingFaq
└── Track order link (secondary)
```

### States

| State | Design |
| --- | --- |
| Empty plans | Honest empty + contact |
| Price unavailable | Disable purchase CTA on that card |
| Success | Navigate to contact/portfolio with context |

Remove emoji from cards. Use semantic tokens.

---

## 8.6 Track order `/track-order`

### Named docs

Forms system, feedback system, error recovery. Not a marketing landing pattern.

### User journey

Has payment reference → look up → read status / next step → support if stuck.

### UX flow

Form → loading → success panel OR error toast/inline → WhatsApp escape.

### States

Loading, empty form, not found, network error, success. Preserve reference wording; retire "Template" label → "Layout".

---

## 8.7 Not found

### Named docs

Error recovery, navigation.

### Journey / flow

Wrong URL → orient → home or product line.

### States

Static; product list from `productEntries`.

---

## 8.8 Command palette (global)

### Named docs

`components/search.md`, `patterns/search.md` (as applicable).

### States (already largely present)

Default / focus / typing / loading layouts / results / no results / error with retry. Preserve.

---

# 9. Cross-cutting state matrix (nine states)

Apply to every data-backed surface (home work, Sleek Pages gallery, Cmd+K layouts, track order):

| # | State | Required behaviour |
| --- | --- | --- |
| 1 | First load | Skeletons or progressive media; never blank |
| 2 | Refresh | Keep prior content visible where possible |
| 3 | Genuinely empty | Why + next action (contact / browse) |
| 4 | Filter excludes all | Clear filters + escalation (gallery Phase 6) |
| 5 | One region fails | Isolate failure; rest of page usable |
| 6 | Whole page fails | Title + recovery + escape |
| 7 | Stale / partial | Disclose; allow refresh |
| 8 | No permission | N/A for public marketing (note if API 403) |
| 9 | Success | Confirm outcome near action |

---

# 10. Primary conversion contract

- **One primary CTA label site-wide:** Start a project → `/contact`
- Secondary informational: See our work / Browse projects / View all projects
- Repeat same primary wording after hero, after proof, and at end (landing intelligence)
- Mobile sticky CTA only if dismissible and not covering content (optional later)

---

# 11. Honesty contract

- No invented client counts, ratings, logos, or ROI.
- Prefer `trustCommitments` and live published layouts as proof.
- Customer-facing copy: **layout**, not **template** (`DESIGN.md` §7).
- No emoji as iconography; single icon family (Feather / `react-icons/fi`).

---

# 12. Phase mapping (implementation after this gate)

| Phase | Gate dependency | Work |
| --- | --- | --- |
| 1 | §7 defects tokens/motion | **Done** — binding contract + reduced motion (2026-08-07) |
| 1b | §7 honesty | **Done** — aboutStats removed; trustCommitments on About; template→layout copy (2026-08-07) |
| 2 | §8.1 | **Done** — home agency IA, hero fold, Variant C proof, FAQ (2026-08-07) |
| 3 | §8.2 | **Done** — ProductPageLayout, four lines + /products, PeopleAsk, FA→FI, dead modal/sections removed (2026-08-07) |
| 4 | §8.3 / §8.5 | **Done** — Contact channels-first + reference/confirmation; Pricing cards/matrix/FAQ/tax note (2026-08-07) |
| 5 | §8.2 collection | **Done** — collection field E2E (2026-08-07) |
| 6 | §8.2 gallery | **Done** — LayoutsGallery nine-state + portfolio SPA websites scope (2026-08-07) |
| 7 | §8.3 form | **Done** — flat contact form: persistent labels, blur validation, linked assertive summary, 44px targets (2026-08-07) |
| 8 | Reviews | **Done** — final approval 96/100; `public_html` assembled (2026-08-07). Live host publish is operator step. |

---

# 13. Sign-off assumptions (override anytime)

1. About stats are **not** sourceable → replace with verifiable commitments (Phase 1b).
2. Hero uses **Variant C** (text + real proof strip), not fabricated product UI (Phase 2).
3. Wave 9: Instrument Serif is **fully replaced** (decision D1 in `REDESIGN-WAVE-9.md`).
4. Wave 9: guided multi-step contact + Projects forms (decision D2) supersedes Phase 8 flat-preferred for those flows.
5. Wave 9: marketing + Projects share one nav visual grammar (decision D3).

---

# 14. Final rule

This document is the audit record and UX approval artifact.  
Implementation that skips a screen's section in §8 (Phases 0–8) or §15 (Wave 9) is a process defect under Design OS enforcement.

When Phase N / Wave 9 Phase A–E starts, open the named pattern files again in that turn before writing UI code.

---

# 15. Wave 9 — System redesign gate (active)

**Opened:** 2026-08-08  
**Memo:** `marketing/REDESIGN-WAVE-9.md`  
**Priority:** Typography → Spatial rhythm → Gamified contact → Nav unification → Color mood polish

## 15.0 INDEX routing confirmation

```
Classify (Agency + Marketing + Portfolio/Projects)
  → design-os/INDEX.md (redesign + agency + landing + visual foundation + forms + navigation)
  → Intelligence (typography, font, color, layout, UX, content, navigation, forms, a11y, motion, responsive, mobile)
  → Patterns (hero_sections Variant C, feature_sections, faq, contact, pricing, multi_step_form, search, error_recovery)
  → Systems (tokens, color, typography, spacing, grid, layout, motion, forms, navigation, empty/loading/error/feedback)
  → Components (navigation, forms, buttons, inputs, search, landing_pages)
  → UX gate artifacts (this §15)
  → Implement
  → Reviews + .cursor/checklists → new ≥95 approval (not Phase 8 reuse)
```

## 15.1 Wave 9 findings (re-audit)

| Finding | Evidence | Who | Impact | Class |
| --- | --- | --- | --- | --- |
| Display type off-putting | Instrument Serif on hero/section/brand; theatrical clamp sizes | Prospects | Trust / “theme site” | **Defect** (taste costing conversion) |
| Dead font imports | `main.jsx` Inter/Roboto vs Work Sans/Instrument in CSS | Maintainers | Bundle / inconsistency | **Inconsistency** |
| Spatial fatigue | Giant decorative numerals; uneven section air; hero loudness | Scrollers | Cognitive load | **Friction** |
| Contact not appetizing | Flat card; no progress/reward/review | Inquirers | Abandonment risk | **Friction** |
| Newsletter placeholder-as-label | `NewsletterForm.jsx` | A11y | Forms system ban | **Defect** |
| Track Order legacy + toast-only | gray/brand utilities; weak field errors | Returning buyers | Recoverability / visual debt | **Friction** |
| Marketing ≠ Projects chrome | Separate Header/Footer grammar; Projects dead routes; base path drift | All cross-app users | Unpredictable product family | **Inconsistency** |
| Projects order a11y weaker | Toast-only step validation; weak SR progress | Buyers | Completion / a11y | **Friction** |
| Rainbow quote broken | `fetch('/api/developer-quote')` nonexistent; hero can empty-submit | Quote seekers | Broken workflow | **Defect** |
| Unused portfolio ContactForm | Dead duplicate of hub contact | Maintainers | Drift risk | **Limitation** |
| Cream/parchment mood | Soft lifestyle vs systems studio | Prospects | Brand mismatch | **Preference** → calibrate if needed |
| Obsidian budget pressure | PageHeader + hero + mid + footer | Visual system | Rule conflict | **Inconsistency** |
| FloatingContact raw hex | WhatsApp green / blue utilities | Visual system | Token binding | **Resolved** Phase E — cream chip + emerald icons |

Resolved Phase 0–8 items remain closed unless regression is found.

## 15.2 Locked decisions (do not re-litigate in implementation)

See `REDESIGN-WAVE-9.md` §3. Summary: D1 replace serif; D2 guided forms; D3 shared nav; D4 soft-neutral if needed; D5 Variant C; D6 Start a project; D7 honesty.

## 15.3 Gate artifacts by surface (Wave 9)

For each: User Journey → UX Flow → Screen Layout → Component Structure → Empty / Loading / Error / Success → Named Design OS docs.

---

### 15.3.1 Shared chrome — Header / Nav / Footer / Mobile

#### Named docs

`navigation_intelligence`, `navigation_system`, `components/navigation`, `components/search`, `patterns/search`, `motion_system`, `accessibility_intelligence`, `mobile_intelligence`.

#### User journey

Orient (“where am I?”) → reach primary conversion or Projects → return home without relearning chrome when crossing hub ↔ `/portfolio-app/`.

#### UX flow

```
Land any route
  → Brand (left) + primary links + optional search + one primary CTA
  → Mobile: open drawer (≥44px) → same IA + CTA
  → Scroll: sticky header; tone adapts over dark/light without losing contrast
  → Cross-app: Projects link full-navigates to /portfolio-app/; hub link returns home
```

#### Screen layout

**Mobile:** brand + menu + CTA (or CTA inside drawer); drawer full-height; focus trap; Esc/close.  
**Desktop:** brand left; links center/right; search affordance; **Start a project** as sole primary gold/action.

Projects SPA: same mark, link style, focus rings, sticky behavior, drawer pattern; Projects-specific IA allowed; no dead `/portfolio` or unrouted `/services` etc.

#### Component structure

```
Marketing: Layout → Header → BrandMark, NavMenu, SearchTrigger, MobileNav, primary ActionLink
Projects:  Header / Footer matching grammar (tokens + structure), real routes only
Footer: useful links + newsletter (labels required) + legal/contact
```

#### States

| State | Design |
| --- | --- |
| Default / hover / focus / active | Semantic tokens; `ring-dos` / `ring-dos-inverse` |
| Scrolled | Solid surface; readable type |
| Mobile open | Drawer; body scroll lock; focus return on close |
| Cmd+K | Existing search states preserved |
| Cross-app | External full load; never false “active” on hub for Projects |

---

### 15.3.2 Home `/`

#### Named docs

`agency_website`, `landing_page_intelligence`, `content_intelligence`, `hero_sections` (Variant C), `feature_sections`, `faq`, `contact` (Let’s talk), typography + spacing + color systems.

#### User journey

Arrive → understand what SleeklyBuilt builds → trust approach → see real work → understand process → start a project or browse work.

#### UX flow

```
Hero (brand + one headline + one support + one CTA group + real proof)
  → Positioning
  → Problems → outcomes
  → What we build
  → Selected work (live)
  → How we work (no giant competing numerals)
  → FAQ
  → Let’s talk (guided form + channels)
```

#### Screen layout

**Mobile:** compact Variant C hero (no min-h / never 100vh); primary CTA above fold on ~667px; section rhythm ~64px; single column.  
**Desktop:** content ≤~1280px; section rhythm ~96px; left-aligned headings; one gold accent per viewport.

First viewport budget: brand, one headline, one short support, one CTA group, real proof — no stats strips, no dashboard clutter.

#### Component structure

```
HomePage
├── HeroSection
├── PositioningSection
├── ProblemsWeSolveSection
├── WhatWeBuildSection
├── SelectedWorkSection (shared layout-card pattern with gallery)
├── HowWeWorkSection
├── PeopleAskSection
└── LetsTalkSection → GamifiedContactForm + channels
```

#### States

| Region | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Selected work | Skeletons matching cards | Honest empty + contact | Isolated retry | Cards |
| Contact band | Form ready | — | Linked errors + summary | Confirmation / reference |
| FAQ | Static | Omit if zero | — | Expand/collapse |
| Hero | Text-first | — | Media optional | — |

---

### 15.3.3 Contact `/contact` + guided enquiry form

#### Named docs

`patterns/contact.md`, `patterns/multi_step_form.md`, `systems/forms_system.md`, `error_states_system`, `feedback_system`, `content_intelligence`, `accessibility_intelligence`.

#### User journey

Decide to inquire → answer one prompt at a time → auto-advance when valid → confirm & send → receive reference.

#### UX flow

```
Compact PageHeader (reply promise)
  → Conversational form (one prompt visible):
       Intent (tap → advance)
       Order ref if needed (Enter / Next)
       Name → Phone → Email → Message (Enter / Next)
       Ready? compact summary → Send only
  → Success: reference, reply-from, send another
```

No stacked “Let’s talk / Project enquiry / How can we reach you?” theatre. Progress = count + thin bar + segment dots. Draft persists. Intent-aware deflect links stay.

#### Screen layout

**Mobile:** compact form first on `/contact`; channels as escape hatch.  
**Desktop:** form + slim channel list; no heavy dual-column essay.

#### Component structure

```
ContactPage / LetsTalkSection
├── Compact header or short band copy
├── GamifiedContactForm (one-prompt auto-advance)
│   ├── Progress (n/N + bar + dots)
│   ├── Single question + one control
│   └── Send only on final prompt
├── ContactChannelPanel (explained: response + best-for)
└── SubmissionConfirmation
```

#### States

| State | Design |
| --- | --- |
| Idle / draft restored | Announce restore; fields filled |
| Step validation fail | Inline + optional step-level summary; stay on step |
| Submit validation fail | Focus summary; jump to field |
| Submitting | Disable controls; process label |
| Network / rate limit | Recoverable; draft kept |
| Success | Reference; focus status; no route change |
| Reduced motion | No decorative transitions |

**A11y contract (non-negotiable):** persistent labels, ≥44px targets, blur validation, `aria-invalid` / `describedby`, keyboard complete, focus management.

---

### 15.3.4 Product pages + `/products`

#### Named docs

`feature_sections`, `faq`, `agency_website`, `content_intelligence`, `ecommerce_catalog` (narrowing); gallery uses empty/loading/error systems + catalog contract.

#### User journey

Choose line **or** narrow by need → expand one capability → confirm fit → contact or product-line page.

#### UX flow

```
Product lines: PageHeader → features → optional LayoutsGallery → PeopleAsk → ContactCtaBand
/products: PageHeader → four lines → ProductGuide (tabs + nested disclosure) → PeopleAsk → ContactCtaBand
```

#### Screen layout

Stacked mobile; category chips scroll horizontally; one category panel; accordion nesting (one open detail at a time preferred); one primary CTA (**Start a project**).

#### Component structure

`ProductPageLayout` → PageHeader, features, LayoutsGallery*, PeopleAsk, ContactCtaBand.  
`/products` → PageHeader, product line grid, `ProductGuide`, PeopleAsk, ContactCtaBand.

#### States

Gallery nine-state matrix (§9); FAQ omit if &lt;4; media progressive / text-first on fail.  
Guide: tab selected / item expanded / hash deep-link to `#guide-<category>`.

---

### 15.3.5 Pricing `/prices`

#### Named docs

`patterns/pricing.md`, `faq`, `content_intelligence`.

#### User journey

Compare UGX packages → choose tier or contact → optional track order.

#### UX flow

Header → category controls → plan grid → matrix → FAQ → contact.

#### Screen layout

Mobile one card/row, recommended first; desktop ≤4 columns; tabular nums; tax/currency honesty; no emoji.

#### States

Empty plans → contact; unavailable price → disable that CTA; success → contact/portfolio with context.

---

### 15.3.6 Track order `/track-order`

#### Named docs

`forms_system`, `feedback_system`, `error_recovery`, semantic tokens (retire legacy gray/brand).

#### User journey

Has reference → enter reference + phone → see status → WhatsApp if stuck.

#### UX flow

Short form (proportionate — not fake multi-step) → loading → success panel OR inline field/network errors → escape channel.

#### States

Loading, empty, not found, network error, success. Labels required; inline errors preferred over toast-only. Copy: layout not template; align reference examples with real prefixes.

---

### 15.3.7 Newsletter (footer)

#### Named docs

`forms_system`, `feedback_system`.

#### User journey

Opt in with email → clear success near control.

#### UX flow

Labeled email + submit → loading → success / error with retry.

#### States

Default, submitting, success, error. **Visible label required** (placeholder is not a label).

---

### 15.3.8 Projects SPA — chrome + order + quote

#### Named docs

`multi_step_form`, `forms_system`, `navigation_system`, `error_states_system`, `feedback_system`. Backend contracts: `portfolio/api/order.php`, `payment-init.php`, `order-status.php`.

#### User journey (order)

Choose layout → configure package/options → contact details → review → quote/pay → success.

#### UX flow

```
Order page loads template (loading/error)
  → GamifiedOrderWizard steps with announced progress
  → Field-level validation per step
  → Review before submit/pay
  → Success / recoverable failure (data retained)
```

#### Rainbow quote

Either wire to an existing real endpoint with the same a11y/validation bar, or remove the submit affordance and document the missing dependency. **Forbidden:** mock success or invent `/api/developer-quote`.

#### Nav

Only real routes under production base `/portfolio-app/`. Shared visual grammar with marketing. Remove or redirect dead Header/Footer links.

#### States

Template loading/error; step errors; paying; quote success; payment init failure with retry. Remove unused `ContactForm.jsx` or fold into hub pattern — no second lead contract.

---

### 15.3.9 About / 404 / Cmd+K

- **About:** page header (not theatrical hero); trust commitments; no fabricated stats; Wave 9 type/spacing only.  
- **404:** recovery to home/products; Wave 9 chrome/type.  
- **Cmd+K:** preserve behaviour and layout-fetch states; restyle to new type/tokens only.

---

## 15.4 Wave 9 phase map (implementation after this gate)

| Phase | Gate dependency | Work | Status |
| --- | --- | --- | --- |
| Gate | §15 + memo | Routing, findings, preservation, artifacts | **Done** (2026-08-08) |
| A | §15.3 + typography systems | Replace display font; type scale; token foundation | **Done** (2026-08-08) — Plus Jakarta Sans + Work Sans; soft-neutral cream; restrained scale; Projects token mirror |
| B | §15.3.1–15.3.2 | Spatial rhythm; primitives; home recomposition | **Done** (2026-08-08) — SectionBody rhythm; quiet process/problem marks; shared LayoutCard; compact hero/PageHeader; ContactCtaBand semantic |
| C | §15.3.3–15.3.8 | Guided forms marketing + Projects | **Done** (2026-08-08) — multi-step contact; newsletter labels; track-order inline errors; order wizard field errors + review; Rainbow → real contactus; removed dead ContactForm |
| D | §15.3.1 / 15.3.8 | Nav unification + dead-link / base-path fix | **Done** (2026-08-08) — shared brand mark / sticky / `ring-dos` / drawer / one CTA; Projects IA real routes only; hub links via `hubHref`; marketing external never false-active; track-order removed from light-top set |
| E | Color systems + memo D4 | Soft-neutral mood polish; gold/obsidian discipline | **Done** (2026-08-08) — FloatingContact tokens; About PageHeader; footer quiet eyebrows; Projects retokened (no blue/purple/gray rainbow); Rainbow honesty (no fabricated stats) |
| F | Reviews | Checklists + new ≥95 approval doc | **Done** (2026-08-08) — drawer focus trap; Rainbow field errors; dead PricingCard removed; `WAVE-9-APPROVAL.md` **96/100** |

---

## 15.5 Measurement (redesign.md Phase 7)

In-repo analytics baseline is still unknown. Before claiming conversion wins:

- Instrument contact submit success / step abandonment if tooling exists.
- Smoke: hub home, contact, prices, portfolios API, portfolio-app order path.
- Qualitatively: first-viewport brand test; heading calmness; form appetite.

Do not invent traffic or conversion figures.

