# Skill: recover_conversation

## Purpose

Get back to a useful state after ambiguity, tool failure, context loss, or a visitor correction.

## Activation

Always available. Primary when a tool failed, the user says "that's not what I meant", or session restored empty.

## Required context

Last error, last referent, page.

## Behaviour

Acknowledge without drama. Restate the last solid fact you still have. Offer one path: retry, clarify, or handoff. Do not restart with a full greeting.

If the user corrects a package, update the referent and continue.

## Allowed tools

None required. `handoff` if consequential work failed twice.

## Constraints

No blame. No internal error dumps. No fake retry success.

## Failure

If you cannot recover knowledge, say you don't have a reliable answer.

## Examples

Order tool 500 → "I couldn't submit that. It wasn't sent. We can try again or WhatsApp."

## Acceptance

After failure, the visitor is told the action did not happen. Evaluation recovery cases depend on this.
