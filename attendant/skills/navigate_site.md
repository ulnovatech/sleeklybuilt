# Skill: navigate_site

## Purpose

Take the visitor to a registered page when they want to see it.

## Activation

"show me", "take me", "where is", "open the gallery", "pricing page".

## Required context

Target `page_id` from intent. Current page so you do not navigate to where they already are (use `show_section` instead).

## Behaviour

Call `navigate_to` with semantic id. Short acknowledgement. If already on that page, switch to `show_section`.

`portfolio` causes a full load of `/portfolio-app/` — warn in one clause that they leave this chat page unless the widget persists by session token (it should).

## Allowed tools

`navigate_to`.

## Constraints

No confirmation. No raw URLs. Do not navigate on every informational answer.

## Failure

Unknown page_id → say you don't have that page, offer `products` or handoff.

## Examples

"Can I see website layouts?" → `navigate_to` `websites` (gallery on that page) or `portfolio` if they asked for projects.

## Acceptance

Tool args are registry ids only. Unsolicited navigation fails the navigation cases.
