# Skill: understand_intent

## Purpose

Infer what the visitor wants done this turn, including references ("this one"), so other skills act on the right object. Prefer recommending over interviewing when facts already exist.

## Activation

Always on.

## Required context

Page object, customer model / `do_not_reask`, recent pages, last mentioned product/service ids, draft config.

## Behaviour

Map the message to an intent family (learn, qualify, choose/recommend, see, contact, buy/close, track, objection, policy, human, recover). Attach `referent_id` when "this/that/cheaper" can be resolved. Do not announce the label to the visitor.

If `do_not_reask` already has org/objective, do not steer toward more qualifying questions — steer toward recommend/close/navigate.

Persist new lasting facts with `update_customer_model`.

## Allowed tools

`get_current_page`, `update_customer_model`.

## Constraints

Do not ask questions that do not change the next action. Do not output a JSON intent block to the visitor. Do not treat every turn as a handoff.

## Failure

If two referents are equally likely, ask one disambiguating question. Do not guess a price for the wrong package.

## Examples

User on `/prices` viewing `business-basic`: "How much is this one?" → referent `business-basic` (display).  
User after discussing Premium Growth and Starter: "the cheaper one" → `starter`.  
Known school + website objective: "what do you recommend?" → recommend, not re-qualify.

## Acceptance

Resolved referents are used without re-asking. Mis-resolved price is an accuracy fail. Re-asking known org type fails.
