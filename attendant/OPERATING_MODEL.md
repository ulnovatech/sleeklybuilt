# OPERATING_MODEL.md — SleeklyBuilt Attendant

**Status:** Authoritative

This document defines how a single visitor turn is assembled. Implementers follow this, not ad-hoc prompt concatenation.

---

## Turn inputs

1. **Session** — hashed token; conversation id; expiry
2. **Page context** — from the client, validated against the page registry (unknown `page_id` is stored as `unknown`, never trusted as a destination)
3. **User message** — trimmed, length-capped (reject empty and oversized)
4. **History** — last N messages (see PERFORMANCE.md), excluding dropped tool traces older than the window
5. **Draft state** — selected service/product ids, collected contact fields not yet submitted
6. **Pending confirmation** — if a token is outstanding, the model is instructed to wait for yes/no, not to re-issue the tool

---

## Skill activation

`SkillActivator` is deterministic. It does not call Gemini.

| Signal | Skills added |
| --- | --- |
| Always | `understand_intent`, `answer_question`, `recover_conversation` |
| Page or message about a product line | `explain_product` or `explain_service` |
| Compare / vs / cheaper / difference | `compare` |
| Recommend / what should I get / restaurant/etc. | `recommend` |
| Show me / take me / where is | `navigate_site`, `show_section` |
| Contact / leave details / email me | `capture_lead` |
| Order / buy / quote / I want it | `configure_service`, `start_order` |
| Track / my order / tx_ref | `check_order` |
| Human / WhatsApp / call / manager | `handoff` |
| Consequential tool about to run | confirmation rules from `rules/10_confirmation.md` |

Cap active skill files so the composed prompt stays small. Prefer the tightest set that covers the turn.

**Escalation example (same model):**

- Browsing FAQ: `answer_question` + `explain_service`
- Complex fit: add `understand_intent`, `recommend`, `compare`
- "Okay I want it": add `configure_service`, `start_order`, confirmation constraints; hide execute until token confirmed

---

## Prompt composition order

Exactly this stack, implemented by `PromptComposer`:

```
prompts/system.md
  + rules/00 … 12 (always)
  + prompts/response-policy.md
  + prompts/context-builder.md  (filled with ContextEngine JSON)
  + prompts/skill-injection.md  (plus each active skill file)
  + retrieved knowledge snippets (ids + text, truncated)
  + tool declarations (JSON Schema from tools, only those allowed this turn)
  + conversation history
  + current user message
```

The composed instruction must be inspectable (logged as a hash + skill list, not necessarily the full text in production).

---

## Tool loop

1. Model returns text and/or function calls.
2. Each call: name allow-list → JSON Schema validate → confirmation class check → execute → `tool-result.json` shape.
3. Feed results back. Maximum **4** tool rounds per user message.
4. If the model tries `capture_lead` or `start_order` without a valid confirmation token, `ConfirmationGate` returns a failure result `confirmation_required` and the engine emits a `confirmation_required` SSE event. It does **not** execute.
5. After text is complete, emit `done`.

`get_current_page` returns the already-supplied context. It does not scrape HTML.

---

## Client actions

Only produced when `navigate_to` or `show_section` succeed. Payload contains registry-resolved `path` and `hash`. The widget applies them. If the destination is `/portfolio-app/`, that is a full page load (existing `isExternalHref` behaviour).

---

## Memory

Session-scoped only in this version. No cross-device identity. No "we remember you from last month" unless the same `session_token` is presented and unexpired.

Do not reset because the route changed. Do reset on explicit visitor clear, expiry, or new `session.php` after expiry.

---

## Operator view

There is no Attendant inbox in Sleekly Dash. Successful `capture_lead` and `start_order` already create rows that `RequestsController` lists. Telemetry is for engineering, not a second CRM.
