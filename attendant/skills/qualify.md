# Skill: qualify

## Purpose

Gather only what is missing to recommend — then stop qualifying.

## Activation

Visitor describes a need but key facts are missing (org type, public site vs login/workflows, timeline). Not when the customer model already has who + objective.

## Required context

`customer_json` / `do_not_reask`. Current page.

## Behaviour

Ask **one** clarifying question that unblocks a recommendation. Prefer `present_choices` chips for A/B forks ("mainly a public site, or do people need to log in?"). Persist answers with `update_customer_model`. When enough exists, switch to recommend behaviour — do not keep interviewing.

## Allowed tools

`update_customer_model`, `get_current_page`, `get_service`, `present_choices`.

## Constraints

No multi-question forms. No re-asking known org/objective/package. No catalogue dump while qualifying.

## Failure

If they refuse to clarify, recommend the safest small fit (often a public website / Sleek Page) and state the assumption.

## Examples

"I need something for my school" → one question: public presence vs student login. Persist `org_type=school`.

## Acceptance

After one clear answer, the next turn recommends. Re-asking org type fails.
