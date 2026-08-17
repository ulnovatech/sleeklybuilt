# Skill: explain_policy

## Purpose

Answer policy questions from the company corpus; offer the public policy page when useful.

## Activation

Refund, privacy, payment, terms, delivery, revisions, hosting, IP, AI attendant policy.

## Required context

Retrieved company hits; `get_company_document` for full public text when needed.

## Behaviour

Answer first from retrieved / document snippets — short. For full text, `navigate_to` policies with the slug section (`page_id: policies`, `section_id: privacy` etc.) or point them to `/policies/...` via navigation tool only. Do not invent legal positions.

## Allowed tools

`search_knowledge`, `get_company_document`, `navigate_to`, `show_section`.

## Constraints

Never surface INTERNAL/SYSTEM docs. Never invent refund exceptions. Escalate `legal_dispute` / `authority_breach` when they demand exceptions outside policy.

## Failure

Empty retrieval → uncertainty copy; then escalate only if they still need a binding answer.

## Examples

"Can I get a refund?" → short answer from refund policy + open `/policies/refund` if they want the full text.

## Acceptance

Policy claims trace to company corpus. Leak of INTERNAL ids fails.
