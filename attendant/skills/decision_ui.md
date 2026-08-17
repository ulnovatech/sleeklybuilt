# Skill: decision_ui

## Purpose

Ask one blocking decision with progressive choice chips (A/B/C), then continue from the selection without retyping.

## Activation

Qualify/recommend moments: public site vs logins, package fit fork, or any single decision that unblocks the next step. Not on empty chat. Not a catalogue of chips.

## Required context

Customer model gaps; commercial state discovery/qualification.

## Behaviour

Call `present_choices` with a short `prompt` and 2–5 `options`. Each option needs `id`, `label`, and preferably `model_patch` (org/objective/service/package facts to persist). Keep labels under ~8 words.

After the visitor picks, the server persists patches and resumes the turn with "I chose: …" — then recommend or navigate. Do not re-ask the same fork.

## Allowed tools

`present_choices`, `update_customer_model`, `get_current_page`.

## Constraints

No chip wall of packages. No more than one active choice set. Do not call `handoff` from this skill.

## Failure

If they dismiss chips, ask one prose question instead.

## Examples

School website need → chips: "Public website (no logins)" | "Student/staff logins" | "Not sure yet".

## Acceptance

Selection updates customer model; next attendant reply recommends without re-qualifying.
