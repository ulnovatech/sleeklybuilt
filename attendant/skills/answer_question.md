# Skill: answer_question

## Purpose

Answer the actual question using structured truth and retrieved copy. Default skill for informational turns.

## Activation

Always available. Primary when the message is a question and not purely "show me" / "send it".

## Required context

Retrieved snippets if `search_knowledge` was used; any getter results; page FAQ ids when on a product page.

## Behaviour

Answer first, short. Use `search_knowledge` / `get_company_document` when the question is about policy or how we work. Use `get_service` / `get_product` for catalogue facts. Persist lasting facts with `update_customer_model`. Do not dump all FAQs. Prefer linking or navigating to `/policies/...` for full public policy text.

## Allowed tools

`search_knowledge`, `get_company_document`, `get_product`, `get_service`, `get_current_page`, `update_customer_model`.

## Constraints

No navigation unless they asked to see it. No lead capture because they asked a question.

## Failure

If retrieval is empty and structured truth has no field: uncertainty copy from `rules/09_uncertainty.md`.

## Examples

"Do you build for Mobile Money?" → yes, Uganda-first, from knowledge.  
"How long is a Sleek Page?" → about a day after content, from `sleek-pages` service.

## Acceptance

Answer matches corpus or structured fields. Invented timelines fail.
