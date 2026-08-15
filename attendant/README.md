# SleeklyBuilt Attendant

This directory is the **authoritative engineering contract** for the SleeklyBuilt Attendant.

It is not a wiki. The PHP engine in `php/attendant/` must load the files under `prompts/`, `rules/`, and `skills/` at runtime. If code and these documents diverge, the documents are wrong or the code is wrong — fix the drift in the same change.

Visitor-facing name: **SleeklyBuilt Attendant**. Internal subsystem name: Attendant. Never describe this product as a generic chatbot.

---

## What this is

A natural-language operating interface to the SleeklyBuilt website and approved business systems.

The visitor talks. The attendant answers from structured truth and retrieved copy, navigates with a semantic registry, and performs only tools that hit real backends.

The model is **Gemini 2.5 Flash Lite**. There is one model. Escalation is context, skills, validation, and confirmation — not another LLM.

---

## What this is not

- A FAQ widget
- An autonomous browser
- A second CRM
- A second order or payment system
- A replacement for Sleekly Dash
- A Discovery Intelligence surface (Discovery stays operator-only)

---

## How to read this tree

| Path | Role |
| --- | --- |
| [PRODUCT_SPEC.md](PRODUCT_SPEC.md) | What it must accomplish, and what is refused |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Runtime shape, process, file ownership |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Two chunks; dependency order |
| [OPERATING_MODEL.md](OPERATING_MODEL.md) | How a turn is assembled and executed |
| [PERFORMANCE.md](PERFORMANCE.md) | Latency, tokens, cost, acceptance targets |
| [EVALUATION.md](EVALUATION.md) | How we know it is actually good |
| [SECURITY.md](SECURITY.md) | Trust boundary, confirmation, PII |
| [OBSERVABILITY.md](OBSERVABILITY.md) | What is logged, what is never logged |
| [CHANGELOG.md](CHANGELOG.md) | Contract revisions |
| [rules/](rules/) | Permanent behaviour. Loaded every turn |
| [skills/](skills/) | Capability modules. Injected when active |
| [knowledge/](knowledge/) | Schemas and governance for truth vs retrieval |
| [tools/](tools/) | Tool contracts bound to real backends |
| [prompts/](prompts/) | Composable instruction layers |
| [testing/](testing/) | Regression conversations |
| [schemas/](schemas/) | JSON Schema for wire and store objects |

UI is governed by Design OS: `design-os/patterns/attendant.md` (INDEX route: "Build a site attendant").

---

## Runtime map (Chunk 1+)

```
marketing widget  →  POST /php/attendant/session.php
                  →  POST /php/attendant/chat.php     (SSE)
                  →  POST /php/attendant/confirm.php
                         ↓
                  php/attendant/src/*  loads this directory
                         ↓
                  Gemini 2.5 Flash Lite
                         ↓
                  ToolRouter → existing PHP backends
```

Until Chunk 1 of [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) lands, this directory is the spec the engine must implement. Do not stub tools that pretend those backends succeeded.

---

## Locked backends

| Tool | Backend |
| --- | --- |
| `capture_lead` | `POST /php/contactus.php` |
| `start_order` | `POST /portfolio/api/order.php` (quote only) |
| `get_order_status` | `POST /portfolio/api/order-status.php` |
| products / packages | `uln_packages()` / `GET /portfolio/api/packages.php` |
| layouts | `GET /portfolio/api/portfolios.php` |
| `handoff` | `GET /api/public/site-contact` |
| navigation | semantic registry from marketing routes |

Checkout prices come from `uln_packages()` (`basic`, `smart`, `premium`). Marketing display packages in `marketing/src/config/pricing.js` are labelled display-only.

---

## Implementation expectation

An engineer who has never seen this subsystem should be able to implement or debug a turn using only this tree plus `php/attendant/`. If a document is too thin to do that, it is incomplete.
