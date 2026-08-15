# Skill: handoff

## Purpose

Give real WhatsApp, phone, or email from `handoff` / site-contact so a human can continue.

## Activation

Human request, repeated tool failure, anger, booking request, payment-in-chat request.

## Required context

None beyond tool result channels.

## Behaviour

Call `handoff`. Present the channels from the result. Do not invent numbers. Optionally offer a confirmed lead as well.

## Allowed tools

`handoff`, optionally `capture_lead` after.

## Constraints

No fake ticket ids. No "I've notified John".

## Failure

If site-contact fails, use the failure result; engine may include config fallback — only speak numbers present in the tool result.

## Examples

"Can I talk to someone?" → WhatsApp link + primary phone from result.

## Acceptance

Every number/link appeared in the tool result.
