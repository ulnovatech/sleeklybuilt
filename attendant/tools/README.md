# Tools

Tools are the only way the attendant changes the world or reads live business state.

PHP implements one class per tool under `php/attendant/src/tools/`. The model receives JSON Schema declarations. Unknown names fail closed.

There is no `do_anything()`.

---

## Shared result shape

See [schemas/tool-result.json](../schemas/tool-result.json).

Every tool returns `ok`, `code`, `user_safe_error` (when not ok), `data`, `side_effects`.

`side_effects` is `none` | `client_navigation` | `writes_lead` | `writes_quote`.

---

## Confirmation classes

| Class | Tools |
| --- | --- |
| none | getters, search, navigate, show_section, compare, get_order_status, handoff, get_current_page |
| required | `capture_lead`, `start_order` |

Payment tools are not registered.

---

## Index

| File | Tools |
| --- | --- |
| [navigation.md](navigation.md) | `get_current_page`, `navigate_to`, `show_section` |
| [knowledge-search.md](knowledge-search.md) | `search_knowledge` |
| [product-lookup.md](product-lookup.md) | `get_product`, `compare_products` |
| [service-lookup.md](service-lookup.md) | `get_service` |
| [lead-capture.md](lead-capture.md) | `capture_lead` |
| [order-tools.md](order-tools.md) | `start_order`, `get_order_status` |
| [handoff.md](handoff.md) | `handoff` |

---

## Implementation expectation

Each tool validates input against its schema, then either returns data or calls an existing backend. Simulated `ok: true` is forbidden. If the backend is down, `ok: false`.
