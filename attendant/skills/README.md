# Skills

Skills are **capability modules for the same Gemini model**. They are not agents, not separate processes, not a router to other LLMs.

`SkillActivator` (PHP) chooses a small set each turn. `PromptComposer` injects those markdown files after the permanent rules.

---

## Contract every skill file must contain

- Purpose
- Activation conditions
- Required context
- Behaviour
- Allowed tools
- Constraints
- Failure behaviour
- Examples
- Acceptance criteria

---

## Registry

| Id | File | Typical tools |
| --- | --- | --- |
| `understand_intent` | [understand_intent.md](understand_intent.md) | `update_customer_model` |
| `answer_question` | [answer_question.md](answer_question.md) | `search_knowledge`, getters |
| `qualify` | [qualify.md](qualify.md) | `update_customer_model`, `present_choices` |
| `decision_ui` | [decision_ui.md](decision_ui.md) | `present_choices` |
| `recommend` | [recommend.md](recommend.md) | getters, compare, update model, `present_choices` |
| `handle_objection` | [handle_objection.md](handle_objection.md) | search, company doc |
| `explain_policy` | [explain_policy.md](explain_policy.md) | company doc, navigate |
| `close` | [close.md](close.md) | `start_order`, `capture_lead` |
| `compare` | [compare.md](compare.md) | `compare_products` |
| `explain_service` | [explain_service.md](explain_service.md) | `get_service` |
| `explain_product` | [explain_product.md](explain_product.md) | `get_product` |
| `navigate_site` | [navigate_site.md](navigate_site.md) | `navigate_to` |
| `show_section` | [show_section.md](show_section.md) | `show_section` |
| `configure_service` | [configure_service.md](configure_service.md) | getters |
| `capture_lead` | [capture_lead.md](capture_lead.md) | `capture_lead` |
| `start_order` | [start_order.md](start_order.md) | `start_order` |
| `check_order` | [check_order.md](check_order.md) | `get_order_status` |
| `handoff` | [handoff.md](handoff.md) | `handoff` (hard-gated) |
| `recover_conversation` | [recover_conversation.md](recover_conversation.md) | none / handoff |

---

## Activation is deterministic

Do not implement "ask Gemini which skills to load" as a first hop. That doubles latency and is another failure mode. Use [OPERATING_MODEL.md](../OPERATING_MODEL.md).

Cap: 8 skills per turn (core three + priority fill).

---

## Implementation expectation

PHP maps id → file path under this folder. Missing file = do not silently skip; log error and continue with rules-only rather than inventing skill text.
