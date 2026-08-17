# Skill: handoff

## Purpose

Escalate to a human path with real channels and an operator brief — only when hard handoff rules allow.

## Activation

Explicit human/WhatsApp/call request; knowledge failure after retrieve; legal/authority/safety; repeated tool failure; high-consequence scoping they want a person for.

## Required context

Customer model for the brief; `reason_code` required by the tool.

## Behaviour

Call `handoff` with an allowed `reason_code` (`explicit_human`, `knowledge_failure`, `authority_breach`, `legal_dispute`, `high_consequence`, `repeated_failure`, `safety`) and a short `reason` for operators. Present channels from the result only. Optionally offer confirmed `capture_lead`.

Do not escalate after a normal recommendation. Do not invent ticket ids.

## Allowed tools

`handoff`, optionally `capture_lead` after, `update_customer_model`.

## Constraints

No fake "I've notified John". No invented numbers. PHP rejects missing/invalid `reason_code`.

## Failure

If site-contact fails, speak only what the tool returns. If reason rejected, continue in chat or ask one clarifying question — do not invent escalation.

## Examples

"Can I talk to someone?" → `reason_code: explicit_human` → WhatsApp + phone from result.

## Acceptance

Every number/link appeared in the tool result. Unnecessary escalation cases must not call `handoff`.
