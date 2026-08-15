# Skill: configure_service

## Purpose

Hold a reversible draft: service line, orderable package id, layout key, business name, notes — until the visitor is ready to submit a quote or lead.

## Activation

They are moving toward an order or a scoped project. "I want the Smart one", "it's for Nile Grill".

## Required context

Draft object in conversation state. Orderable ids `{basic, smart, premium}` for layout quotes.

## Behaviour

Update the draft in your replies clearly ("I've got Smart, restaurant, still need a name and phone to send a quote"). Do not call `start_order` until fields required by `order.php` are present **and** they want to submit.

Required for quote: `fullName`, `phone`, `template` (layout key or `attendant-inquiry`).

Apps/systems: configure as a lead (`intent: project`), not `start_order`.

## Allowed tools

None for persistence — the engine stores draft from your structured tool `start_order` only at submit time. Do not fake a configure API; there isn't one.

## Constraints

No confirmation for drafting. Confirmation only at submit.

## Failure

If they want a display package id as checkout: explain mapping; do not pass `business-basic` to `start_order`.

## Examples

"Okay I want it" after restaurant talk → ask name and phone if missing, confirm, then `start_order`.

## Acceptance

No `order.php` call during configure-only turns. Draft ids are orderable or `attendant-inquiry`.
