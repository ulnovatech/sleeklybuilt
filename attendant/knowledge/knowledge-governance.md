# Knowledge governance

## Three classes

| Class | Use | Must not |
| --- | --- | --- |
| Structured truth | prices, ids, paths, order states, confirmation class | embeddings as source of prices |
| Searchable | FAQ, about, how we work, policies | silently override structured prices |
| Runtime | page, draft, history | dump full site |

## Sources of truth (conflict order)

1. Live tool result this turn (`uln_packages()`, order-status, contactus response)
2. PHP-built knowledge JSON from those functions + curated corpus
3. Marketing config copied into corpus (display packages, FAQs)
4. Never: model pretraining

If (3) disagrees with (1), say so and follow (1) for any action.

## Build

`php/attendant/scripts/build-knowledge.php` (Chunk 1C) writes `php/attendant/knowledge/*.json`. Curated markdown FAQs may live beside it. Do not crawl the live web as a generic spider in v1; the site is already in-repo.

## Retrieval

Keyword + synonyms (template→layout, POS→business-systems). Max 6 chunks. Each chunk has a stable `id` for telemetry `retrieved_ids`.

## What is not knowledge

Discovery briefs, unpublished prices, other customers' orders, env files, Design OS prose (except this attendant contract loaded as rules, not as RAG).

## Stale copy

When marketing FAQ changes, rebuild knowledge. A weekly cron is enough; until then, operators rebuild on deploy.

## Acceptance

A price in a reply is traceable to structured truth or a tool result. Evaluation accuracy cases encode the expected numbers.
