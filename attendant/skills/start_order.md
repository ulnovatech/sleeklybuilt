# Skill: start_order

## Purpose

Create a **quote** row via `POST /portfolio/api/order.php` after confirmation. Not payment.

## Activation

They want to order a layout / package and have accepted submitting a request.

## Required context

`template` (catalog key or `attendant-inquiry`), `fullName`, `phone`, `countryCode` default `+256`, `businessName` optional, `notes`, `package` in `{basic, smart, premium}`.

## Behaviour

Confirm summary including package title from `uln_packages()`. After success, report that it is a request to the team, not a paid order. If they want to pay a deposit, navigate `portfolio` order URL — do not call Flutterwave.

## Allowed tools

`start_order` (gated).

## Constraints

No display package ids. No `payment-init`. Source tagged attendant.

## Failure

Missing template/name/phone: do not call. Backend error: not submitted.

## Examples

Smart + layout `willey-fragrance` + name + phone → confirm → insert `website_orders`.

## Acceptance

Success text iff `order.php` returned success. Payment language without checkout fails.
