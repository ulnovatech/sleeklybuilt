# Sleekly Attendant — UX Gate Artifacts

**Status:** Chunk 1 complete — UI implementation may begin in Chunk 2  
**Date:** 2026-10-23  
**Route (planned):** `/products/attendant`  
**Product:** Sleekly Attendant (subscription marketing + order path)  
**Governing plan:** Sleekly Attendant product page, catalogue identity and ordering

This file satisfies `.cursor/rules/ui-ux-gate.mdc` for the Attendant product marketing surface and Uganda order journey.  
**No page UI, routes, or payment PHP in Chunk 1** — copy SoT is `marketing/src/config/attendantProduct.js`.

---

## Design OS docs that govern this work

| Layer | Documents |
| --- | --- |
| Routing | `design-os/INDEX.md` — product marketing page + “Build a site attendant” + checkout/pricing |
| Intelligence | Content Intelligence (via FAQ / hero patterns); Mobile First; Accessibility Intelligence |
| Patterns | `product_details` (decision screen), `hero_sections`, `feature_sections`, `pricing`, `faq`, `checkout`, `multi_step_form`, `attendant` (live demo widget only) |
| Systems | Color, Design Tokens, Typography, Empty / Loading / Error States, Motion |
| Marketing | `marketing/DESIGN.md`, `packages/design-foundation/DESIGN.md` (Meridian) |

**Composition note:** This is a **subscription product marketing page** with a short order funnel — not an ecommerce SKU PDP and not a multi-tier SaaS pricing matrix. Use product-details decision questions, a single-plan pricing block (Pricing pattern “one price” guidance), FAQ for objections, Checkout + multi-step form for Uganda MoMo claim, and Attendant pattern only for the existing global widget / “Try it live”.

---

## 1. Users and goals

| Who | Why they are here | Primary goal | Fear |
| --- | --- | --- | --- |
| Business owner (Uganda) | Heard of AI attendant / found product | Understand fit → pay first month → get setup | Fake AI promises, surprise fees, broken install |
| Business owner (international) | Same | Understand fit → request invoice | MoMo-only payment; no self-serve |
| Returning site visitor | Exploring SleeklyBuilt products | See how Attendant differs from “build a site” | Confusion with the site’s own chat widget |
| Assistive-tech user | Same journeys | Keyboard, labels, reduced motion, honest states | Decorative demo that looks interactive but isn’t |

**Primary action (product page):** Start Uganda order **or** international order request.  
**Secondary action:** Try the live demo / see how it works.  
**Not the primary action:** Generic “Start a project” (reserved for undecided / top nav).

---

## 2. User journeys

### Journey A — Discover → decide (marketing)

```
Home spotlight / Products card / Cmd+K / SEO
        ↓
/products/attendant
        ↓
Scan hero (what + for whom + next step)
        ↓
Confirm problem fit → capabilities → demo honesty
        ↓
Read install truth + price (UG / International)
        ↓
Primary CTA (region-appropriate)
```

### Journey B — Uganda order (MoMo claim)

```
CTA “Let’s Set Up Your AI Attendant”
        ↓
/portfolio-app/order/attendant
        ↓
Business + website (URL optional / hosted-link option)
        ↓
Contact details
        ↓
Review (price, inclusions, exclusions, manual renewal — no usage number)
        ↓
PayStep (MTN / Airtel claim — not marked paid)
        ↓
Claim waiting → team verifies → contact for business details & setup
```

### Journey C — International order request

```
International CTA
        ↓
/contact?intent=ai-attendant
        ↓
Existing contact form → Requests inbox → invoice follow-up
```

### Journey D — Live demo (same page)

```
“Try it live”
        ↓
Opens existing global attendant (one instance) with starter prompt
        ↓
Visitor chats with SleeklyBuilt’s own attendant on this site
        ↓
Labelled illustration remains available for supported sequence only
```

---

## 3. UX flows (screen-level)

### Product page flow

```
Entry
  → Hero orients (name, category, tagline, CTAs, visual)
  → Problem prose (four scenarios — not a card grid)
  → Capabilities (alternating feature rows)
  → Demo: live button + labelled illustration steps
  → How it works (five steps; team review called out)
  → Installation statuses (available vs not)
  → Pricing (UG / International switch; one plan)
  → Trust (knows / can / cannot / human)
  → FAQ
  → Final CTA (same regional split)
```

### Order form flow (Chunk 6)

```
Step 1 Business → Step 2 Contact → Step 3 Review → Step 4 Pay
  → Success path: awaiting verification (never “paid” until backend)
  → Error / unavailable providers: recover or quote/contact path
```

One primary action per step. Progressive disclosure for hosted-link vs website URL.

---

## 4. Screen layouts

### 4A. `/products/attendant` (mobile-first)

```
[Site header — global attendant launcher remains]

Hero (one composition)
  brand-adjacent product name + category
  tagline + supporting line + outcome
  primary CTA | secondary “See how it works”
  illustrative browser+chat (or screenshot later)

Problem (prose blocks)
Capabilities (feature_sections rhythm)
Demo (#demo)
How it works
Installation
Pricing (#pricing)
Trust
FAQ (PeopleAskSection)
Final CTA band (product-specific — not generic agency)

[Site footer]
```

**Hierarchy:** one primary focus (fit + setup CTA); secondary (demo); supporting (FAQ, trust).  
**Mobile:** vertical stack; CTAs clear of launcher; touch ≥ 44×44.  
**Desktop:** expand rhythm; keep one primary CTA per viewport; respect docked attendant `lg:pr-[380px]` when open.

### 4B. Homepage spotlight (Chunk 4)

Compact band after WhatWeBuild: name, one-line benefit, preview, “Meet Sleekly Attendant”. Four-ways grid unchanged.

### 4C. `/order/attendant` (Chunk 6)

Short guided form + PayStep + ClaimWaitingPage. Checkout pattern: remove friction after decision; never invent paid success.

---

## 5. Component structure

| Surface | Components (planned) | Data |
| --- | --- | --- |
| Product page | `AttendantProductPage` + section components under `marketing/src/components/attendant/` | `attendantProduct.js` |
| SEO | `usePageSeo` + `seo/routes.js` entry | same |
| Live demo | existing `useAttendant` / `openWithPrompt` | Attendant package |
| Illustration | step controls; `prefers-reduced-motion` | demoSteps in config |
| Pricing switch | UG / International toggle; one plan card | `pricing` in config |
| FAQ | `PeopleAskSection` | `faq` in config |
| Home / Products | spotlight + catalogue card + Cmd+K | `spotlight`, `catalogue` in config |
| Order | `AttendantOrder`, generalized `PayStep`, `ClaimWaitingPage` | subscription product id |

Reuse Meridian tokens; no new hex; no second chat widget.

---

## 6. States (mandatory)

### Product page

| State | Behaviour |
| --- | --- |
| Default | Full narrative from config |
| Loading (lazy route) | Existing marketing route suspense / skeleton |
| Demo illustration | Controls idle / active step; reduced motion = static step |
| Live demo | Opens panel; if session/API fails, attendant’s own error + WhatsApp path |
| Pricing region | Uganda default; switch updates price/CTA only (no FX conversion) |
| Error (images) | Alt text; no broken layout |

### Order / Pay (Chunks 5–6)

| State | Behaviour |
| --- | --- |
| Loading providers | Skeleton / spinner on PayStep |
| Empty / unavailable | Honest providers-unavailable + contact/quote path |
| Validation | Inline field errors; do not intimidate |
| Submitting | Disable duplicate submit |
| Claim created | `awaiting_verification`, `paid=false` |
| Verified | Subscription next-steps copy only |
| Error | What failed + how to retry / WhatsApp |

### Empty (catalogue / spotlight)

Not empty surfaces in Chunk 1; when home/products integrate, card is always present (static content).

---

## 7. Honesty constraints (non-negotiable)

- **No numeric usage allowance** on page, FAQ, or order review until metering exists.
- **No “unlimited”.**
- Install: team setup / hosted link — **not** self-serve plugin, Shopify app, or one-click.
- Live demo = SleeklyBuilt’s attendant on this site — label clearly.
- Illustrations labelled “Illustration”.
- Cannot: bookings, payments in chat, CRM delivery, WhatsApp automation, multiple websites (unless quoted).
- Renewals: manual monthly MoMo; no auto-charge; international = invoice request.

---

## 8. Accessibility & motion

- Semantic headings; FAQ expand/collapse keyboard accessible.
- Visible focus; labels not placeholders-only on order form.
- Contrast per Meridian tokens.
- Motion 150–300ms; illustration autoplay off when `prefers-reduced-motion`.
- Demo and CTAs must not trap focus or cover pricing on mobile.

---

## 9. Chunk boundary

| Chunk | Gate |
| --- | --- |
| **1 (this file + config)** | Journey, layout, components, states, copy SoT — **done when grep for usage quotas is clean** |
| 2 | Product page UI + SEO |
| 3 | Live demo wiring |
| 4 | Home / catalogue / Cmd+K / CTAs |
| 5 | Isolated `attendant-monthly` backend |
| 6 | Order frontend |
| 7 | Visuals, verify, ship |

---

## 10. Approval for Chunk 1

UX gate artifacts and content contract are ready for Chunk 2 implementation.  
No user-facing UI was shipped in this chunk.
