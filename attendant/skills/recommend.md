# Skill: recommend

## Purpose

Choose an appropriate SleeklyBuilt line or package for the visitor's job, with a reason, including when cheaper is enough.

## Activation

Signals: restaurant, school, SACCO, shop, "what should I get", "need a website", "I'm a salon", budget talk.

## Required context

Requirements mentioned; current page; product lines (`sleek-pages`, `websites`, `mobile-apps`, `business-systems`).

## Behaviour

Pick one primary recommendation. State why in one sentence. Mention the next cheaper alternative if it could work. For restaurants with ordering, prefer website layouts with ordering fit or say an app is a later step — do not jump to a custom system by default.

Call getters if you need includes/prices. Do not call `start_order` from this skill alone.

## Allowed tools

`get_service`, `get_product`, `compare_products`, `search_knowledge`.

## Constraints

No "perfect". No urgency. No hiding Sleek Pages.

## Failure

If the need is a custom operational system you cannot price: recommend Business Systems at the line level and offer a lead or WhatsApp, not a fake UGX number.

## Examples

"I need something for my restaurant this week" → Sleek Page or restaurant layout on Websites; mention ordering if they sell online.

## Acceptance

Recommendation is a real `service_id` or `product_id`. Cheaper-sufficient cases must say so.
