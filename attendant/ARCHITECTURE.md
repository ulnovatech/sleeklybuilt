# ARCHITECTURE.md — SleeklyBuilt Attendant

**Status:** Authoritative  
**Runtime home:** `php/attendant/`  
**Contract home:** this directory

---

## Runtime shape

```
Visitor
  → Marketing widget (Chunk 2)
  → PHP Attendant HTTP
       session.php | chat.php (SSE) | confirm.php
  → Engine
       ConversationStore
       ContextEngine
       SkillActivator
       PromptComposer   ← loads attendant/prompts, rules, skills
       GeminiProvider   ← gemini-2.5-flash-lite only
       ToolRouter       ← schema → auth → business rules → backend
       ConfirmationGate
       Telemetry
  → Existing SleeklyBuilt backends
```

There is **one intelligence model**. There is **no model router**.

HTTP is **not** `sleekly-dash/backend/api.php`. That front controller forces `Content-Type: application/json` in bootstrap and would break SSE.

---

## Process for one turn

```
UNDERSTAND (context + history + user message)
    ↓
ACTIVATE SKILLS (deterministic registry)
    ↓
COMPOSE PROMPT (identity + rules + skills + retrieved knowledge + tools)
    ↓
GEMINI (function calling and/or text)
    ↓
IF tool request:
    VALIDATE schema
    AUTHORIZE (public visitor + confirmation class)
    BUSINESS RULES
    EXECUTE real backend
    VERIFY result object
    RETURN tool result to model
    LOOP (max 4)
    ↓
STREAM text to client
    ↓
EMIT client actions (navigate, highlight) only from validated registry hits
    ↓
LOG telemetry (no secrets)
```

Never: UNDERSTAND → pretend execution succeeded.

---

## Layers

### 1. Rules

Permanent constitution. Loaded every turn from `attendant/rules/*.md` in numeric order. The model does not get a choice to drop them.

### 2. Context

Built by `ContextEngine` from:

- Client page payload (`current_url`, `page_id`, `section_id`, visible product/service, recent pages)
- Conversation rows
- Draft configuration (selected package, business name, etc.)
- Active pending confirmation (if any)

Not the entire website.

### 3. Skills

Capability modules from `attendant/skills/*.md`. `SkillActivator` selects a small set. Same Gemini call.

### 4. Knowledge

- **Structured truth:** packages, ids, routes, order states, confirmation classes
- **Searchable:** FAQ and explanatory copy via `search_knowledge`
- **Runtime:** the context object

Prices the visitor can check out with: `uln_packages()` only.

### 5. Tools

Narrow functions. Each has input schema, side effects, success/failure result, user-visible behaviour. Specified in `attendant/tools/`. Implemented in `php/attendant/src/tools/`.

### 6. Provider abstraction

`LlmProvider` interface. Production implementation: `GeminiProvider` targeting **only** `gemini-2.5-flash-lite`.

HTTP transport:
- Google Generative Language API when `GEMINI_API_KEY` is a Google AI Studio key
- OpenRouter OpenAI-compatible API when the key starts with `sk-or-` (same locked model id `google/gemini-2.5-flash-lite`); `OPENROUTER_API_KEY` is a fallback if `GEMINI_API_KEY` is empty

A second implementation may exist **only** for tests (fixture replay). It must not be selectable in production config. No Discovery LLM clients, no Ollama, no alternate models.

---

## Data stores

MySQL (same database as contact leads), migration `sleekly-dash/backend/migrations/014_attendant.sql`:

| Table | Purpose |
| --- | --- |
| `attendant_sessions` | Opaque session token hash, IP/rate metadata |
| `attendant_conversations` | One thread per session (until expiry) |
| `attendant_messages` | Role, text, tool traces (no raw prompts dumped wholesale) |
| `attendant_pending_actions` | Confirmation tokens, payload, expiry |
| `attendant_events` | Telemetry |

Do not store API keys, Flutterwave secrets, or full prompt blobs containing keys.

---

## Client contract (Chunk 2)

The widget sends JSON:

- `session_token`
- `message`
- `page` context object matching `schemas/context.json`

The server streams SSE events:

- `message_delta` — text
- `client_action` — `{ type: "navigate"|"highlight", page_id, section_id, path, hash }`
- `confirmation_required` — `{ token, summary, tool }`
- `error` — `{ code, message }` (user-safe)
- `done` — `{ conversation_id }`

`path` and `hash` in `client_action` are **server-resolved** from the registry. The model requested semantic ids only.

---

## Trust boundary

The browser is untrusted. The model is untrusted. Only PHP after validation may call `contactus.php`, `order.php`, or `order-status.php`.

Tool names the model may emit are an allow-list. Unknown tools fail closed.

---

## Failure modes

| Condition | Engine behaviour | Visitor-visible |
| --- | --- | --- |
| Missing `GEMINI_API_KEY` | HTTP error from chat.php, event logged | "I can't reply just now." |
| Gemini 4xx/5xx | Fail closed, no fake text | Same |
| Backend 5xx on lead/order | Return tool failure to model | Must not claim sent |
| Invalid semantic destination | Tool failure | Ask or offer human |
| Rate limit | 429 | Existing rate-limit copy |

---

## File ownership

| Concern | Owner |
| --- | --- |
| Behaviour, prompts, skills | `attendant/` (this tree) |
| HTTP + Gemini + tools | `php/attendant/` |
| Widget | `marketing/src/components/attendant/` |
| Screen pattern | `design-os/patterns/attendant.md` |
| Schema of wire objects | `attendant/schemas/` |

Prompt text lives in this tree so tuning does not require hunting PHP strings.
