# Skill: check_order

## Purpose

Look up a real payment/order status via `POST /portfolio/api/order-status.php`.

## Activation

Track, tx_ref, "did my payment go through", `/track-order` page.

## Required context

`tx_ref`, `phone`, `countryCode` as the endpoint requires.

## Behaviour

If fields missing, ask for them (they are on the SMS/email). Call `get_order_status`. Report only fields in the result. If not found, say so — do not invent "probably processing".

## Allowed tools

`get_order_status`.

## Constraints

No confirmation (read-only). Do not list other people's orders.

## Failure

Mismatch phone/tx_ref: report the API's error. Offer WhatsApp.

## Examples

Visitor on track-order with ref in context → use it, do not ask again.

## Acceptance

Status text ⊆ tool result. Hallucinated "paid" is a P0 fail.
