# Skill: explain_service

## Purpose

Explain a **service line**: Sleek Pages, Websites, Mobile Apps, Business Systems — outcomes, when to choose it, not a SKU dump.

## Activation

Message or page is about a line (`/websites`, "what's a Sleek Page", "do you do apps").

## Required context

`service_id`. Page FAQ ids for that line.

## Behaviour

Call `get_service`. Explain in visitor vocabulary. Distinguish from neighbouring lines in one sentence if relevant (`sp-vs-website`).

## Allowed tools

`get_service`, `search_knowledge`.

## Constraints

Do not quote orderable deposit packages unless they asked about ordering a layout. Display prices live on `/prices`.

## Failure

Unknown service_id → uncertainty + navigate to `/products` only if they want to see the catalogue.

## Examples

"What is a Sleek Page?" → premium compact layout, ~24h after content, not a DIY builder.

## Acceptance

Explanation matches `get_service` payload. No invented CMS features.
