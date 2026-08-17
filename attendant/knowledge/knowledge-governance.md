# Knowledge governance

## Three classes

| Class | Use | Must not |
| --- | --- | --- |
| Structured truth | prices, ids, paths, order states, confirmation class | embeddings as source of prices |
| Searchable | FAQ, about, how we work, company/policy corpus | silently override structured prices; leak INTERNAL/SYSTEM docs |
| Runtime | page, draft, history | dump full site |

## Company corpus (`attendant/company/`)

Canonical operating docs `01`–`20` with `manifest.json` access classes:

| Access | Visitor tools / public site |
| --- | --- |
| `PUBLIC` | Yes — chat tools + `/policies/:slug` |
| `CUSTOMER_CONTEXT` | Chat tools only (not listed as public policies) |
| `ATTENDANT_INTERNAL` / `OPERATOR_ONLY` / `SYSTEM_ONLY` | Never to visitors |

Enforcement is in `php/attendant/src/CompanyDocumentStore.php`, not prompt-only. Rebuild/promote docs with `scripts/generate-company-corpus.mjs` when source briefs change; production builds must copy `attendant/company/` into `public_html/attendant/company`.

## Customer model + expertise

- Draft payload: `CustomerModel` in `draft_json` (+ indexed `commercial_state` via migration 015).
- Deterministic updates: `CustomerModelUpdater` from visitor text and tool results; tool `update_customer_model` for explicit saves.
- Expertise: `attendant/expertise/` cards + guidance; `ExpertiseLibrary` injects a small selected set into the prompt each turn.
- Context: `customer_json`, `commercial_json`, `expertise_json` in `prompts/context-builder.md` — do not re-ask `do_not_reask` facts.

## Sources of truth (conflict order)

1. Live tool result this turn (`uln_packages()`, order-status, contactus response)
2. PHP-built knowledge JSON from those functions + curated corpus + company store
3. Marketing config copied into corpus (display packages, FAQs)
4. Never: model pretraining

If (3) disagrees with (1), say so and follow (1) for any action.

## Build

`php/attendant/scripts/build-knowledge.php` (Chunk 1C) writes `php/attendant/knowledge/*.json`. Curated markdown FAQs may live beside it. Company corpus lives under `attendant/company/`. Do not crawl the live web as a generic spider in v1; the site is already in-repo.

## Retrieval

Keyword + synonyms (template→layout, POS→business-systems). Max 6 chunks. Each chunk has a stable `id` for telemetry `retrieved_ids`. Company hits use ids `company:{doc_id}`.

## What is not knowledge

Discovery briefs, unpublished prices, other customers' orders, env files, Design OS prose (except this attendant contract loaded as rules, not as RAG), INTERNAL/SYSTEM company docs for visitors.

## Stale copy

When marketing FAQ or company docs change, rebuild knowledge / regenerate corpus. A weekly cron is enough; until then, operators rebuild on deploy.

## Acceptance

A price in a reply is traceable to structured truth or a tool result. Evaluation accuracy cases encode the expected numbers. Leak tests must fail if INTERNAL/SYSTEM docs appear in visitor search or `get_company_document`.
