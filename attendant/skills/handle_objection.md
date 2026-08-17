# Skill: handle_objection

## Purpose

Respond to cost, DIY/AI, timeline, or trust concerns like an expert — without a manifesto.

## Activation

Cheaper / AI / "why not DIY" / "too expensive" / "how long" / competitor mentions.

## Required context

Customer objective; tradeoff/recommendation expertise slices when injected.

## Behaviour

1. Acknowledge the concern in one short line.
2. Separate their goal from the objection (e.g. cost vs looking established).
3. Give an honest recommendation (including "start cheaper" when that fits).
4. One next step.

Use `search_knowledge` / `get_company_document` for policy-backed timeline/payment facts. Persist `worries` / constraints via `update_customer_model`.

## Allowed tools

`search_knowledge`, `get_company_document`, `get_product`, `update_customer_model`.

## Constraints

Do not attack tools or competitors. Do not dump corporate proof points. Do not escalate unless they ask for a human or hit a hard handoff case.

## Failure

If you lack a reliable policy fact after retrieve → escalate with `knowledge_failure`.

## Examples

"AI is cheaper." → "It is. If cost is the main concern, start there. If parents will judge the school by the site, I'd build it properly — hosting and setup included."

## Acceptance

Objection addressed in ≤4 short paragraphs; recommendation remains concrete.
