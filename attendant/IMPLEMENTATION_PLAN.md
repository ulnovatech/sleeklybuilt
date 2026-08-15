# IMPLEMENTATION_PLAN.md — SleeklyBuilt Attendant

**Status:** Authoritative  
**Execution:** two chunks. Chunk 2 does not start until Chunk 1 works via curl.

This is not an MVP plan. It is dependency order toward the complete production subsystem.

---

## Chunk 1 — Attendant brain

Deliverable: a working API. No marketing chrome.

### 1A — Contract (this tree + Design OS pattern)

Done when:

- Every file listed in [README.md](README.md) exists and is substantial
- `schemas/*.json` present and valid JSON Schema
- Brand is SleeklyBuilt throughout
- `design-os/patterns/attendant.md` exists with mandatory pattern sections
- INDEX routes `"Build a site attendant"`
- `node scripts/validate-design-os.mjs` passes

### 1B — Domain, Gemini, HTTP

- PHP validators load `schemas/*.json`
- Migration `014_attendant.sql` applied
- `ConversationStore`, `ConfirmationGate`
- `GeminiProvider` + `PromptComposer` loading this directory
- `session.php`, `chat.php` (SSE), `confirm.php`

**Done (2026-08-15):** engine under `php/attendant/`; smoke via `php php/attendant/scripts/smoke_1b.php`. Without `GEMINI_API_KEY`, chat emits SSE `error` (`missing_api_key`) then `done`. With key, streams `message_delta` then `done`.

### 1C — Knowledge, skills, tools

- Page/section registry matching `marketing/src/App.jsx`
- Structured packages from `uln_packages()` plus labelled display packages
- Keyword retrieval corpus
- Skill activator
- Eleven tools, fail-closed, real backends

**Done (2026-08-15):** `php/attendant/knowledge/*`, ProductCatalogue/ServiceCatalogue/KnowledgeCorpus/PageRegistry, eleven tools under `src/Tools/`, ToolRouter + confirmation-gated writes, TurnEngine tool loop (max 4). Smoke: `php php/attendant/scripts/smoke_1c.php`.

Done when:

- Tools hit `contactus` / `uln_contact_submit`, `uln_website_order_quote`, order-status tables, packages, portfolios catalog, site-contact
- Confirmation cannot be bypassed
- Navigation payloads never contain model-invented URLs

---

## Chunk 2 — Site presence

Deliverable: the attendant on the marketing hub, plus evaluation.

### 2A — Widget

`marketing/src/components/attendant/*` per `design-os/patterns/attendant.md`. Replaces the FloatingContact cluster. Page context, navigate/highlight, confirm UI, full states.

**Done (2026-08-15):** AttendantRoot mounted from Layout (launcher + panel). Session/SSE/confirm client, situated empty copy, WA/call in header, client_action navigate/highlight. One gold launcher — FloatingContact cluster removed from Layout.

### 2B — Evaluation and hardening

Cases in `testing/` executed as PHP tests. Live Gemini eval only with `ATTENDANT_LIVE_EVAL=1`. Rate limit, telemetry, missing-key UI.

**Done (2026-08-15):**
- Layer A: `php php/attendant/tests/run.php` (also `npm run test:attendant`)
- Widget checks: `npm run test:attendant:widget`
- Live Layer B: `ATTENDANT_LIVE_EVAL=1 npm run test:attendant:live`
- CI job `attendant-layer-a` (MySQL + migration + Layer A + widget + marketing build)
- Telemetry secret scrub; rate-limit constants; error UI WhatsApp CTA

---

## Explicitly not in either chunk

Multiple models, WhatsApp channel, voice, Flutterwave from chat, Discovery CRM writes, portfolio-app widget, a second Requests inbox.

---

## Order of code after 1A

1. Schemas + migration + store + confirmation tokens
2. Gemini provider + prompt composer + streaming chat
3. Knowledge + nav registry + skill activation
4. Tools
5. Widget
6. Regression + hardening

Do not reverse this to "put a chat box up first."
