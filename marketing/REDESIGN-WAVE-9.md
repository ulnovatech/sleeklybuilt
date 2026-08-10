# SleeklyBuilt — Redesign Wave 9 Decision Memo

**Status:** Gate open — documentation complete; UI implementation blocked until each surface’s §15 artifact in `UX-GATE.md` is followed.  
**Date:** 2026-08-08  
**Priority order:** Typography → Spatial rhythm → Gamified contact → Nav unification → Color mood polish  
**Supersedes for this wave:** Phase 8 display-type choice (Instrument Serif), Phase 7–8 flat-only contact shape, cream-as-parchment mood if cooler neutral wins, marketing/Projects nav divergence.

Phase 8 approval (`PHASE-8-APPROVAL.md`, 96/100) remains the historical record for Phases 0–8. It does **not** approve Wave 9. Wave 9 requires a new ≥95 approval record after implementation.

---

## 1. Classification

| Dimension | Value |
| --- | --- |
| Category | Agency website (marketing hub) |
| Secondary | Portfolio / Projects SPA (gallery + order), Landing (home) |
| Users | Professional / executive buyers; returning order trackers |
| Mindset | Learn → Trust → Contact / Order |
| Personality | Premium, Confident, Modern — calm systems studio |
| Density | Low (marketing pages); Medium (gallery / order wizard) |
| Device | Phone first |
| Navigation | Required; shared visual grammar across hub + Projects |
| Primary conversion | **Start a project** → `/contact` |
| Secondary | See work / browse layouts / order a layout |

---

## 2. INDEX routing (opened for this wave)

### Redesign path
- `design-os/INDEX.md` → Improving something that exists
- `design-os/prompts/redesign.md`
- `design-os/prompts/agency_website.md`
- `design-os/prompts/landing_page.md`
- `design-os/intelligence/product_classifier.md`

### Visual foundation
- Intelligence: `typography_intelligence`, `font_intelligence`, `color_intelligence`, `layout_intelligence`, `ux_intelligence`, `content_intelligence`, `responsive_intelligence`, `mobile_intelligence`, `accessibility_intelligence`, `motion_intelligence`, `navigation_intelligence`
- Systems: `design_tokens`, `color_system`, `typography_system`, `spacing_system`, `grid_system`, `layout_system`, `motion_system`, `forms_system`, `navigation_system`, `empty_states_system`, `loading_states_system`, `error_states_system`, `feedback_system`
- Reviews: `design_system_review`, `visual_review`, `ux_review`, `accessibility_review`, `mobile_review`, `responsive_review`, `animation_review`, `final_approval`

### Patterns (per surface)
| Surface | Patterns |
| --- | --- |
| Home | `hero_sections` (Variant C), `feature_sections`, `faq`, `contact` (closing band) |
| Product pages | `feature_sections`, `faq`, page header (not full hero) |
| Contact / enquiry | `contact`, `multi_step_form`, `forms_system` |
| Pricing | `pricing`, `faq` |
| Search | `search` |
| Track order / recovery | `error_recovery`, forms + feedback systems |
| Shared chrome | `components/navigation`, `navigation_system` |
| Projects order | `multi_step_form`, forms + error systems (order/pay contracts preserved) |

### Checklists before ship
`.cursor/checklists/` — `final-review`, `ux-checklist`, `ui-checklist`, `mobile-checklist`, `accessibility-checklist`

---

## 3. Locked product decisions (Wave 9)

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | **Replace Instrument Serif entirely** with a modern neo-grotesk display family | Display currently reads costume/editorial; body (Work Sans direction) stays; headings must signal systems-studio authority |
| D2 | **Guided multi-step** for customer info forms (marketing + Projects order/quote) | Appetite and completion psychology; chunk by decision group + review-before-send; preserve Phase 7 a11y contract |
| D3 | **Shared nav visual grammar** across marketing and Projects | One product family; IA may differ; placement/color/focus/CTA treatment must not |
| D4 | **Recalibrate cream toward quieter soft-neutral** if parchment mood persists after type change | Keep emerald structure + rare gold; document final hex in `DESIGN.md` |
| D5 | Hero remains **Variant C** (text + real proof); never fabricated UI | Honesty + `hero_sections` QA |
| D6 | Primary CTA remains **Start a project** → `/contact` | Preservation + agency one-conversion rule |
| D7 | Customer copy: **layout**, not template; no emoji iconography; no fabricated metrics | Content honesty |

### Multi-step vs field-count tension

`multi_step_form.md` advises against steps when fewer than ~6–8 fields. Contact has ~5–6 inputs. Wave 9 still uses multi-step because:

1. Fields form **distinct validation groups** (intent → identity → brief → review).
2. Brief requires **progress, micro-success, and review-before-send** (motivation / abandonment problem).
3. Draft resume and confirmation remain first-class.

This is a documented override of Phase 8 “flat preferred,” not a silent regression.

---

## 4. Typography direction (Phase A — implemented)

- **Display / headings:** Plus Jakarta Sans (neo-grotesk, Google Fonts, license-clear). Instrument Serif removed.
- **Body / UI:** Work Sans retained.
- **Scale:** restrained fluid `clamp()`; hero max ~3.5rem; heading leading 1.15–1.25; body ≥16px, leading 1.55–1.6; measure 45–75ch.
- Removed dead `@fontsource/roboto` / `@fontsource/inter` imports.
- Soft-neutral canvas: cream `#f4f3ef` / cream-deep `#e6e4de` (D4 applied with type foundation).
- Projects SPA mirrors fonts + brand primitives in `portfolio/frontend`.

---

## 5. Spatial rhythm (Phase B — implemented)

- 8pt grid; `SectionBody` = `mt-8 md:mt-12` after headings.
- Content width `max-w-content` (75rem).
- Section cadence `py-16 md:py-24` (~64 / ~96).
- One primary focus per viewport; giant decorative numerals removed from process/features.
- Obsidian: hero + Let’s talk + footer; PageHeader compact; ContactCtaBand stays emerald (does not burn dark budget).
- Hero: one gold CTA; invert eyebrows use quiet cream.

---

## 6. Forms model (Phase C — implemented)

| Form | Model |
| --- | --- |
| Contact enquiry | Guided: Intent → You → Brief → Review → Confirmation (progress, micro-success, draft, a11y summary) |
| Newsletter | Short single-step with visible label + inline success/error |
| Track order | Short task form with inline field errors + recovery (PageHeader + semantic tokens) |
| Projects order wizard | Field-level errors, SR progress, review-before-pay/quote, emoji removed |
| Rainbow quote | Posts to real `/php/contactus.php` (idempotent key); hero CTA scrolls to form — no fake `/api/developer-quote` |

Preserve: Phase 7 labels, 44px targets, blur validation, assertive linked summary, drafts, `submission_key`, reference confirmation.

---

## 7. Navigation model (Phase D) — **Done** (2026-08-08)

- Left brand mark (Plus Jakarta Sans letter + wordmark), center/right links, one primary CTA.
- Same sticky/scroll, focus ring (`ring-dos` / inverse), mobile drawer language on both apps.
- Projects: only `/`, `/rainbow`, `/order*` routes; hub destinations via `hubHref()`; dead `/portfolio` / `/services` / in-app `/contact` removed.
- Marketing: `isNavItemActive` never marks `/portfolio-app/` as current; CTA `min-h-11`; track-order uses dark PageHeader (not light-top).
- Tokens-only sharing (CSS/Tailwind); no cross-SPA React coupling.

---

## 8. Color mood (Phase E) — **Done** (2026-08-08)

- 60% surface / 30% structure (ink + emerald) / 10% gold actions.
- Soft-neutral canvas confirmed: cream `#f4f3ef` / cream-deep `#e6e4de`.
- Gold: one accent per viewport (primary CTA); footer column labels use quiet cream (`eyebrow-invert`), not competing gold.
- Emerald never as text on obsidian.
- Token binding: FloatingContact; About PageHeader; Projects Home / FAQ / Order / OrderSuccess / Rainbow / CTA / PortfolioCard stripped of gray/blue/purple/green utility rainbow and fabricated Rainbow stats.

---

## 9. Out of scope

- Discovery dashboard / Sleekly Dash admin UI
- Fabricated testimonials or metrics
- Unrelated product features

---

## 10. Implementation order (after this memo + UX-GATE §15)

```
Gate (this doc + UX-GATE Wave 9)
  → A Typography + tokens
  → B Spatial rhythm + primitives
  → C Guided forms (marketing + Projects)
  → D Nav unification
  → E Color mood polish
  → Reviews + new ≥95 approval (`marketing/WAVE-9-APPROVAL.md` — **96/100**, 2026-08-08)
```

Do not implement UI for a surface until its §15 block in `marketing/UX-GATE.md` is complete and the governing pattern file is opened in that implementation turn.
