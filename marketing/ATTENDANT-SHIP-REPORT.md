# Sleekly Attendant — Chunk 7 ship report

**Date:** 2026-10-23  
**Scope:** Product page, catalogue identity, Uganda MoMo subscription order (Chunks 1–7)  
**Deploy / commit:** Not requested — local complete; live product URL not yet published

---

## Done when (Chunk 7)

| Criterion | Result |
| --- | --- |
| Authentic attendant UI as optimised WebP under `marketing/public/assets/attendant/` | Pass — `panel-mobile.webp`, `panel-desktop.webp` + `CREDITS.md` |
| Full verify (widget single-instance + product wiring) | Pass — `node marketing/scripts/check-attendant-widget.mjs` |
| Independent UI + functionality critics | Pass with Majors fixed (see below) |
| No published usage quota / “unlimited” | Pass |
| Website `/order` path unchanged | Pass — still `GamifiedOrderWizard`; Attendant isolated |
| Ship report written | This file |

---

## Surfaces shipped (code)

| Surface | Path / entry |
| --- | --- |
| UX gate | `marketing/ATTENDANT-UX-GATE.md` |
| Copy SoT | `marketing/src/config/attendantProduct.js` |
| Product page | `/products/attendant` → `AttendantProductPage.jsx` |
| Live demo | `openWithPrompt` on global widget only |
| Discovery | Homepage spotlight, Products card, Cmd+K, `productCtas` |
| Backend | `uln_subscription_products()` / `attendant-monthly`; claim → activate → notify |
| Order UI | `/order/attendant` → PayStep → ClaimWaitingPage |

---

## Critic Majors — disposition

### Functionality

1. **Push deep-link `attendant_subscription`** — Fixed: `RequestsController` source map + payment summary; `PushNotificationService` title.
2. **PayStep unavailable dead-end with `hideQuoteRequest`** — Fixed: contact CTA via `hubHref('contact?intent=ai-attendant')`.

### UI visual

1. **Order / claim pill radii** — Fixed: `rounded-dos-lg` / `rounded-dos-xl` on Attendant order + claim.
2. **Mobile launcher clearance** — Fixed: `max-lg:pb-24` on order + claim shells.
3. **Emerald CTAs on light surfaces** — Fixed: spotlight + pricing `variant="emerald"`.
4. **Hero copy density** — Fixed: dropped redundant category line under eyebrow.
5. **Spotlight honesty** — Fixed: “Illustration — not a live chat session”.
6. **Pricing tabs a11y** — Fixed: `aria-controls`, `tabpanel`, arrow-key tab navigation.

---

## Verification notes

- Live home still lacks `/products/attendant` until marketing deploy (expected).
- Screenshots captured from the **live** global attendant on `sleeklybuilt.pro` and wired into the product hero visual.
- Claim waiting never marks “paid” until verified; subscription copy distinguishes setup vs website deposit.

---

## Not in this chunk

- Commit, push, or production deploy (ask when ready).
- Attendant engine rewrite or Discovery hunts.
- Auto-renew / card checkout for international (invoice via contact remains).

---

## Suggested next step

When ready to publish: commit Chunks 1–7, deploy marketing + portfolio + payment/dash backends together so product URL, order path, and push deep-links land in one cut.
