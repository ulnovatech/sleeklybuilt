# OBSERVABILITY.md — SleeklyBuilt Attendant

**Status:** Authoritative (as-built Chunk 3H)

---

## Purpose

Every conversation produces internal telemetry so quality is measurable. Subjective "it seems fine" is not an operational signal.

---

## Event catalogue (`attendant_events.event_type`)

| Event | When | Notes |
| --- | --- | --- |
| `session_created` | `session.php` | New visitor session |
| `chat_turn_start` / `chat_turn_complete` / `chat_error` | `TurnEngine` | Per visitor turn |
| `tool_call` | Each tool attempt | `meta.handoff` / `meta.payment_handoff` flags may also be set |
| `confirm_attempt` / `confirm_rejected` | `confirm.php` | Write-tool confirmation |
| `choice_selected` / `choice_cancelled` / `choice_rejected` | `choice.php` | Decision UI |
| `escalation` | Successful `handoff` tool | First-class; includes `reason_code` |
| `operator_takeover` | Admin takeover API | Operator inbox |
| `payment_handoff` | Confirmed quote → portfolio checkout path | Never Flutterwave charge |
| `retrieval_access_denied` | Visitor denied INTERNAL/SYSTEM company doc | Doc-leak gate |

---

## Required event fields

Stored on `attendant_events` (and/or structured logs). One row per notable step.

| Field | When |
| --- | --- |
| `conversation_id` | always when known |
| `session_id` | hashed session row id, not raw token |
| `page_id` | each user turn |
| `section_id` | when known |
| `intent` | activator or labelled |
| `active_skills` | list |
| `retrieved_ids` | knowledge chunk ids |
| `tool_name` | each call |
| `tool_ok` | boolean |
| `latency_ms` | turn and Gemini call |
| `prompt_tokens` / `completion_tokens` | if API returns |
| `error_code` | on failure |
| `meta_json` | scrubbed; may include `conversion`, `reason_code`, `path` |

---

## Never log

- `GEMINI_API_KEY`
- Raw `session_token`
- Flutterwave secrets (should never be in process)
- Full system prompt on every turn in production (store hash + skill list; full prompt only when `APP_DEBUG=true`)
- Other visitors' conversations in a client response
- INTERNAL/SYSTEM company document bodies

---

## Correlation

Lead notify and `contactus` rows should include conversation id (`source: attendant`). Operators in Requests / Attendant inbox can match a submission to a thread.

---

## Dashboards

No requirement to build a Sleekly Dash page in this version. Query `attendant_events`. Admin-mobile Attendant inbox is the operator thread UI, not a telemetry dashboard.

---

## Alerting (production)

- Spike in `tool_ok=false`
- Spike in Gemini errors / `chat_error`
- Rate-limit 429 storms
- Confirmation execute failures after visitor confirm
- Spike in `retrieval_access_denied` (possible probing)
- Daily token budget threshold

Alerts go to existing ops email/FCM channels used for leads if desired.
