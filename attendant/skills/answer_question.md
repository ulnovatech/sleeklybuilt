# Skill: answer_question

## Purpose

Answer the actual question using structured truth and retrieved copy. Default skill for informational turns.

## Activation

Always available. Primary when the message is a question and not purely "show me" / "send it".

## Required context

Retrieved snippets if `search_knowledge` was used; any getter results; page FAQ ids when on a product page.

## Behaviour

Answer first, short. Use `search_knowledge` when the question is explanatory (policy, how you work, after-launch). Use `get_service` / `get_product` for catalogue facts. Do not dump all FAQs.

## Allowed tools

`search_knowledge`, `get_product`, `get_service`, `get_current_page`.

## Constraints

No navigation unless they asked to see it. No lead capture because they asked a question.

## Failure

If retrieval is empty and structured truth has no field: uncertainty copy from `rules/09_uncertainty.md`.

## Examples

"Do you build for Mobile Money?" → yes, Uganda-first, from knowledge.  
"How long is a Sleek Page?" → about a day after content, from `sleek-pages` service.

## Acceptance

Answer matches corpus or structured fields. Invented timelines fail.
