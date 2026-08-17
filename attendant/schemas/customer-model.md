# customer-model schema

Companion for [customer-model.json](customer-model.json). Stored in `attendant_conversations.draft_json` (plus indexed `commercial_state` column).

## Purpose

The Attendant keeps a **Customer & Situation Model** across turns:

WHO → ACHIEVE → WHY → WHAT MATTERS → WORRIES → UNKNOWNS → RECOMMEND → NEXT STEP

Do not re-ask facts already in `customer_model` / `known_facts` / focus fields.

## Commercial states

`discovery` → `qualification` → `recommendation` → `agreement` → `order` → `payment` → `complete`  
Branch: `escalated`

Transitions are enforced in `CommercialStateMachine` (PHP); the model must not invent a later state without tools/evidence.

## Expertise

Selective cards from `attendant/expertise/` are injected separately — never the whole folder.
