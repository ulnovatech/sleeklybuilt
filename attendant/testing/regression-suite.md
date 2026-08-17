# Regression suite

Run Layer A on every attendant PHP change. Layer B before enabling the widget in production.

**Rubric:** [QUALITY_RUBRIC.md](../QUALITY_RUBRIC.md)

---

## Merge checklist (Chunks 1–3)

### Core honesty
- [x] ConfirmationGate: write tools without token do not INSERT
- [x] `package` enum `{basic,smart,premium}` only on `start_order`
- [x] Display ids never accepted as orderable
- [x] Navigation registry: all `App.jsx` routes resolve
- [x] Unknown page_id / section_id → `ok: false`
- [x] PromptComposer includes `rules/00` through `12`
- [x] Missing `GEMINI_API_KEY` → chat error, no canned success
- [x] Tool result `ok: false` cannot emit success SSE
- [x] Rate limit bucket exists for attendant chat
- [x] Telemetry scrub: no API key / session_token in meta

### Chunk 3 themes
- [x] Company PUBLIC policies; INTERNAL/SYSTEM denied (A9)
- [x] Customer model + expertise selective inject
- [x] Escalation hard gate; recommend does not default handoff
- [x] Decision UI choices SSE + choice.php
- [x] Policy path_segment nav + section stamps
- [x] Payment handoff to `/portfolio-app/order` only
- [x] Operator states + LLM pause + FCM type `attendant_escalation`
- [x] Telemetry: `escalation`, `operator_takeover`, `choice_selected`, `payment_handoff`, `retrieval_access_denied`
- [x] §55 operator brief fields present in `HandoffTool`

### Widget / CI
- [x] Widget empty state names current page
- [x] WhatsApp visible on error
- [x] Streaming not marked complete early
- [x] Confirm UI required for lead/quote
- [x] Decision UI + policy stamps + escalation poll in widget check
- [x] Marketing production build (CI)
- [x] Hub smoke script (`smoke_hub.php` / `npm run test:attendant:smoke`)
- [ ] `validate-design-os` still green (CI)

Runners: `php php/attendant/tests/run.php` · `php php/attendant/scripts/smoke_hub.php` · `node marketing/scripts/check-attendant-widget.mjs` · CI job `attendant-layer-a`

Optional hub HTTP: `ATTENDANT_SMOKE_BASE=https://sleeklybuilt.pro npm run test:attendant:smoke` (or local Apache base).

---

## Live checklist (`ATTENDANT_LIVE_EVAL=1`)

Execute qualification Q1–Q3, conversation C1–C6, adversarial A1–A10, sales S1–S7, navigation N1–N9, actions X1–X10 against a non-production DB where possible.

Pass thresholds: PRODUCT_SPEC.md + QUALITY_RUBRIC.md. Fabricated actions: 0. Confirmation bypass: 0. Doc leak: 0.

Smoke live runner: `ATTENDANT_LIVE_EVAL=1 php php/attendant/tests/live_eval.php`

---

## Not in suite

Discovery CRM writes, Flutterwave charge, WhatsApp Business API, visitor file attachments.
