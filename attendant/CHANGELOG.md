# CHANGELOG.md — SleeklyBuilt Attendant contract

**Format:** Reverse chronological.

---

# 0.5 — 2026-08-15 — Evaluation / hardening (2B)

## Added

- `php/attendant/tests/` Layer A runner + cases (schema, registry, catalogue, confirmation, missing key, telemetry)
- Optional `live_eval.php` gated by `ATTENDANT_LIVE_EVAL=1`
- `marketing/scripts/check-attendant-widget.mjs` Chunk 2 acceptance checks
- CI job `attendant-layer-a`
- npm scripts: `test:attendant`, `test:attendant:widget`, `test:attendant:live`

## Changed

- Telemetry recursively scrubs secrets from `meta_json`
- Rate-limit constants on attendant HTTP endpoints
- Error UI includes WhatsApp CTA; confirm telemetry marks `conversion`

---

# 0.4 — 2026-08-15 — Marketing widget (2A)

## Added

- `marketing/src/components/attendant/*` — Provider, Launcher, Panel, Header, Composer, confirm/empty/error/transcript parts
- Page context + SSE client + confirm client; navigate/highlight via registry paths
- Gold launcher only (WhatsApp/call moved into panel header)

## Changed

- `Layout.jsx` mounts `AttendantRoot` instead of `FloatingContact`

---

# 0.3 — 2026-08-15 — Knowledge / tools (1C)

## Added

- Curated knowledge under `php/attendant/knowledge/` (pages, services, display packages, corpus)
- Eleven tools wired to real backends (`uln_contact_submit`, `uln_website_order_quote`, `uln_packages`, portfolio catalog, site_contact_settings)
- TurnEngine tool loop (max 4) with SSE `client_action` / `confirmation_required`
- `php/attendant/scripts/smoke_1c.php`

## Changed

- `php/contactus.php` delegates to shared `uln_contact_submit`
- Skill allow-list includes `search_knowledge`; dropped nonexistent `list_products`

---

# 0.2 — 2026-08-15 — Domain / Gemini / HTTP (1B)

## Added

- `php/attendant/` engine: ConversationStore, ConfirmationGate, SchemaValidator, Telemetry, ContextEngine, SkillActivator, PromptComposer, GeminiProvider, TurnEngine, ToolRouter stub
- HTTP: `session.php`, `chat.php` (SSE), `confirm.php`
- Migration `014_attendant.sql` + `php/attendant/scripts/apply_attendant_migration.php`
- `GEMINI_API_KEY` documented in `php/.env.example`

## Notes

Tools are fail-closed stubs until 1C. Missing Gemini key returns a real SSE `error` (no placeholder reply).

---

# 0.1.1 — 2026-08-15 — Schema JSON

## Added

- `schemas/*.json` — conversation, context, product, service, page, action, tool-result (JSON Schema draft 2020-12)

## Changed

- Schema README: `.json` files are authoritative for validation; companion `.md` explains intent

---

# 0.1 — 2026-08-14 — Contract 1A

## Added

- Authoritative `attendant/` tree: product spec, architecture, two-chunk implementation plan, operating model, performance, evaluation, security, observability
- Rules 00–12, skills, knowledge schemas, tool specs, prompts, testing cases, schema contracts
- Design OS pattern `design-os/patterns/attendant.md` and INDEX route "Build a site attendant"
- Brand: SleeklyBuilt Attendant. No visitor-facing other company names

## Notes

Runtime engine (`php/attendant/`) and marketing widget are subsequent implementation chunks. This revision is the contract those chunks must implement.
