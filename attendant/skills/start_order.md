# Skill: start_order

## Purpose

Create a **quote** row via `POST /portfolio/api/order.php` after confirmation. Not payment.

## Activation

They want to order a layout / package and have accepted submitting a request.

## Required context

`template` (catalog key or `attendant-inquiry`), `fullName`, `phone`, `countryCode` default `+256`, `businessName` optional, `notes`, `package` in `{basic, smart, premium}`.

## Behaviour

Confirm summary including package title from `uln_packages()`. After success:

1. Report that it is a **request / quote**, not a paid order.
2. Server emits **payment handoff** `client_action` to `portfolio-order` (`/portfolio-app/order`) so the visitor continues in the existing Flutterwave checkout.
3. Do **not** call `payment-init.php`, invent a second payment stack, or collect card/MoMo fields in chat.

## Allowed tools

`start_order` (gated). Optionally `navigate_to` `portfolio-order` if the visitor asks again for checkout.

## Constraints

No display package ids. No `payment-init`. Source tagged attendant. Never claim payment succeeded without `get_order_status`.

## Failure

Missing template/name/phone: do not call. Backend error: not submitted.

## Examples

Smart + layout `willey-fragrance` + name + phone → confirm → insert `website_orders` → open `/portfolio-app/order?template=…&package=smart`.

## Acceptance

Success text iff `order.php` returned success. Payment language without checkout / status tool fails.
