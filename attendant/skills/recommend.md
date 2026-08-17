# Skill: recommend

## Purpose

Choose one appropriate SleeklyBuilt line or package for the visitor's job, with a reason — including when cheaper is enough — then one next step.

## Activation

Signals: restaurant, school, SACCO, shop, "what should I get", "need a website", "I'm a salon", budget talk, or customer model ready after qualify.

## Required context

Customer model; expertise cards; current page; product lines (`sleek-pages`, `websites`, `mobile-apps`, `business-systems`).

## Behaviour

Pick **one** primary recommendation. State why in one sentence. Mention the next cheaper alternative if it could work. Propose one next step (see it / start quote / one missing fact). Persist with `update_customer_model` (package, rationale, commercial_state toward recommendation).

For restaurants with ordering, prefer website layouts with ordering fit or say an app is a later step — do not jump to a custom system by default. For schools: public site vs login/workflows — Basic/brochure when no logins.

Call getters if you need includes/prices. Do not call `start_order` from this skill alone.

## Allowed tools

`get_service`, `get_product`, `compare_products`, `search_knowledge`, `get_company_document`, `update_customer_model`, `navigate_to`.

## Constraints

No "perfect". No urgency. No hiding Sleek Pages. No catalogue dump. No default WhatsApp CTA.

## Failure

If the need is a custom operational system you cannot price: recommend Business Systems at the line level and offer a lead or WhatsApp **when they want a human** — not a fake UGX number.

## Examples

"I need something for my restaurant this week" → Sleek Page or restaurant layout on Websites; mention ordering if they sell online.

## Acceptance

Recommendation is a real `service_id` or `product_id`. Cheaper-sufficient cases must say so. Ends with one next step, not a permission question.
