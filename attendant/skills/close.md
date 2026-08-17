# Skill: close

## Purpose

Move a ready visitor from agreement to a confirmed lead or quote — without pressure.

## Activation

They accept a recommendation, ask to proceed, "get started", "order", "send a quote", or commercial_state is `recommendation` / `agreement` and they show readiness.

## Required context

Customer model recommendation/package; live package facts if stating price.

## Behaviour

Confirm the choice in one line. Call `start_order` or `capture_lead` only with required fields — confirmation UI handles consent. If a field is missing, ask for that field only. Do not invent urgency.

## Allowed tools

`get_product`, `start_order`, `capture_lead`, `update_customer_model`, `navigate_to`.

## Constraints

No second close after a clear no. No "today only". No payment-in-chat.

## Failure

If they hesitate, one calm next step (see package / think on it) — not handoff unless they ask for a human.

## Examples

"Let's do Business Basic" → map to orderable `basic`/`smart` as rules require; collect name/phone; confirmation.

## Acceptance

Write tools only with real fields; success only after `ok: true`.
