# Regression suite

Run Layer A on every attendant PHP change. Layer B before enabling the widget in production.

---

## Merge checklist (Chunk 1+)

- [x] ConfirmationGate: write tools without token do not INSERT
- [x] `package` enum `{basic,smart,premium}` only on `start_order`
- [x] Display ids never accepted as orderable
- [x] Navigation registry: all `App.jsx` routes resolve
- [x] Unknown page_id / section_id → `ok: false`
- [x] PromptComposer includes `rules/00` through `12`
- [x] Missing `GEMINI_API_KEY` → chat error, no canned success
- [x] Tool result `ok: false` cannot emit success SSE
- [x] Rate limit bucket exists for attendant chat
- [x] Telemetry row on tool call without API key in payload

---

## Live checklist (`ATTENDANT_LIVE_EVAL=1`)

Execute conversation C1–C6, adversarial A1–A8 (model+PHP), sales S1–S5, navigation N1–N6, actions X1–X8 against a non-production DB where possible.

Pass thresholds: PRODUCT_SPEC.md table. Fabricated actions: 0. Confirmation bypass: 0.

Smoke live runner: `php php/attendant/tests/live_eval.php` (subset).

---

## Chunk 2 extras

- [x] Widget empty state names current page
- [x] WhatsApp visible on error
- [x] Streaming not marked complete early
- [x] Confirm UI required for lead/quote
- [ ] `validate-design-os` still green (CI)
- [x] Marketing production build

Runners: `npm run test:attendant` · `npm run test:attendant:widget` · `npm run validate:design-os`
---

## Not in suite

Discovery CRM writes, Flutterwave charge, WhatsApp Business API.
