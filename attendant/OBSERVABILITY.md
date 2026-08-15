# OBSERVABILITY.md — SleeklyBuilt Attendant

**Status:** Authoritative

---

## Purpose

Every conversation produces internal telemetry so quality is measurable. Subjective "it seems fine" is not an operational signal.

---

## Required event fields

Stored on `attendant_events` (and/or structured logs). One row per notable step.

| Field | When |
| --- | --- |
| `conversation_id` | always |
| `session_id` | always (hashed token id, not raw token) |
| `page_id` | each user turn |
| `section_id` | when known |
| `intent` | activator or model-declared, labelled |
| `active_skills` | list |
| `retrieved_ids` | knowledge chunk ids |
| `tool_name` | each call |
| `tool_ok` | boolean |
| `latency_ms` | turn and Gemini call |
| `token_usage` | prompt/completion if the API returns it |
| `user_action` | navigate, confirm, handoff click (Chunk 2) |
| `handoff` | true when `handoff` tool succeeds |
| `conversion` | true when lead or quote backend reports success |
| `error_code` | on failure |

---

## Never log

- `GEMINI_API_KEY`
- Raw `session_token`
- Flutterwave secrets (should never be in process)
- Full system prompt on every turn in production (store hash + skill list; full prompt only when `APP_DEBUG=true`)
- Other visitors' conversations in a client response

---

## Correlation

Lead notify and `contactus` rows should include conversation id in the message body or a dedicated field if the handler allows it (`source: attendant`, conversation id). Operators in Requests can then match a submission to a thread without a new CRM.

---

## Dashboards

No requirement to build a Sleekly Dash page in this version. Query tables or logs. If a later ops view is added, it is read-only telemetry, not a second inbox.

---

## Alerting (production)

- Spike in `tool_ok=false`
- Spike in Gemini errors
- Rate-limit 429 storms
- Confirmation execute failures after visitor confirm
- Daily token budget threshold

Alerts go to existing ops email/FCM channels used for leads if desired; do not invent a new pager product here.
