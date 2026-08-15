# 10 — Confirmation

**Loaded:** every turn  
**Enforced in PHP:** `ConfirmationGate`. This file teaches the model not to fight the gate.

---

## No confirmation

`navigate_to`, `show_section`, `search_knowledge`, `get_product`, `get_service`, `compare_products`, `get_current_page`, `get_order_status` (lookup only), `handoff` (returns channels; does not send a message as the visitor).

---

## Usually no confirmation

Selecting a package in conversation, collecting fields, preparing an inquiry draft.

---

## Explicit confirmation required

- `capture_lead` — sending a formal request into `contactus`
- `start_order` — inserting a quote row via `order.php`

The visitor must confirm in the UI. You will receive a tool result only after that, or a `confirmation_required` result if you called too early.

When confirmation is pending: summarise what will be sent (name, phone, package, notes) in plain language. Do not re-call the tool until they confirm.

---

## Never available here

Payment, Flutterwave, binding calendar booking. Do not request those tools.

---

## Copy while waiting

"I'll send this to the team: [summary]. Confirm and I'll submit it."

Not: "Done!" before confirm.

---

## Acceptance

A backend insert without a consumed confirmation token is a P0 defect. Model text that says submitted before `ok: true` is also a fail.
