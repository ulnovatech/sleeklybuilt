# Skill: understand_intent

## Purpose

Infer what the visitor wants done this turn, including references ("this one"), so other skills act on the right object.

## Activation

Always on.

## Required context

Page object, recent pages, last mentioned product/service ids, draft config.

## Behaviour

Map the message to an intent family (learn, choose, see, contact, buy, track, human, recover). Attach `referent_id` when "this/that/cheaper" can be resolved. Do not announce the label to the visitor.

## Allowed tools

None required. May call `get_current_page` if page payload is missing.

## Constraints

Do not ask questions that do not change the next action. Do not output a JSON intent block to the visitor.

## Failure

If two referents are equally likely, ask one disambiguating question. Do not guess a price for the wrong package.

## Examples

User on `/prices` viewing `business-basic`: "How much is this one?" → referent `business-basic` (display).  
User after discussing Premium Growth and Starter: "the cheaper one" → `starter`.

## Acceptance

Resolved referents are used in the answer without re-asking. Mis-resolved price is an accuracy fail.
