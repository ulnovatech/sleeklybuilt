# SleeklyBuilt Marketing Hub — UX Gate Artifacts

**Version:** 1.0  
**Status:** Phases 0–8 complete — see `marketing/PHASE-8-APPROVAL.md` (96/100).  
**Date:** 2026-08-07  
**Governing plan:** Design OS-aligned replan (Phases 0–8)  
**Product classification:** Marketing / Agency (+ Portfolio for gallery surfaces)

This file satisfies `.cursor/rules/ui-ux-gate.mdc` and `design-os/prompts/redesign.md` Phase 1 (Audit).  
**No user-facing UI may be implemented until the artifacts for that screen are recorded here.**

---

# 0. Change motivation

Legitimate reasons for continuing the reform:

1. The site cannot yet express the product line split (Sleek Pages vs Websites vs Apps vs Systems) — product pages are shells.
2. Accessibility and honesty defects in shipped code (reduced motion, unverifiable stats, mixed icon libraries) block Design OS final approval.
3. Inconsistency between Design OS patterns and current screens makes extension expensive.
4. Appearance costing trust: generic agency clichés and incomplete conversion paths weaken conversion.

Not a motivation: redesign for novelty alone.

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

- `design-os/INDEX.md` → agency route
- `design-os/prompts/agency_website.md`
- `design-os/prompts/redesign.md`
- `design-os/intelligence/landing_page_intelligence.md`
- `design-os/intelligence/content_intelligence.md`
- Patterns: `hero_sections`, `feature_sections`, `faq`, `contact`, `pricing`, `multi_step_form`, `search`
- Systems: design tokens, color, typography, motion, empty/loading/error
- Reviews: visual, UX, accessibility, mobile, final_approval

---

# 4. Scope decision

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
| Order lookup (reference + phone) | Returning buyers |
| Flat main nav (5 items) | Fixed hash-link dead-end problem |

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

---

# 14. Final rule

This document is the audit record and UX approval artifact.  
Implementation that skips a screen's section in §8 is a process defect under Design OS enforcement.

When Phase N starts, open the named pattern files again in that turn before writing UI code.
