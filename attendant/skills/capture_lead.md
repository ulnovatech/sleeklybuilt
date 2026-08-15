# Skill: capture_lead

## Purpose

Submit a real inquiry through `POST /php/contactus.php` after confirmation.

## Activation

They want the team to follow up in writing; contact details offered; custom project; "send this to someone".

## Required context

`name`, `phone`, `email`, `subject`, `message`, `intent` (from `contactIntents`: `project`, `pricing`, `order`, `partnership`, `broken`, `other` when known).

## Behaviour

If fields missing, ask only the missing ones. Then wait for confirmation UI. After `ok: true`, report the `reference` from the handler.

Include in message: conversation id, page, and what they asked for.

## Allowed tools

`capture_lead` (gated).

## Constraints

Never say sent without `ok: true`. Rate limit errors: tell them to wait or use WhatsApp.

## Failure

400 from handler: explain the field. 500: "I couldn't complete that just now. It wasn't sent."

## Examples

Name + phone + email collected → confirm summary → tool → "Sent. Reference MSG-00xx."

## Acceptance

Row in `contactus` / notify path. Fabricated reference fails.
