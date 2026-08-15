# Tool: capture_lead

**Purpose:** Insert a real contact row via existing `php/contactus.php` logic (include or HTTP to self). Prefer calling the same functions as that script (insert + `uln_notify_lead`) rather than duplicating SQL.

**Confirmation:** required. Execute only from `confirm.php` with a valid token. A model call during `chat.php` creates a pending action and returns `ok: false`, `code: confirmation_required`, `data: { summary }`.

**Input:**

```
name, phone, email, subject, message, intent?, submission_key?
```

All of name, phone, email, subject, message required (same as the public form). Engine appends `source: attendant` and `conversation_id` onto message if not present.

**Auth:** session + confirmation token. Rate limit: reuse `uln_rate_limit('contactus')` or a dedicated attendant bucket that still protects the table.

**Side effects:** `writes_lead`. Email/FCM notify as today.

**Success:** `{ reference, status: "success" }` matching contactus JSON.

**Failure:** validation, rate limit, DB. `ok: false`. Nothing claimed sent.

**User-visible:** reference string.

**Acceptance:** Integration test hits real insert or fails closed. No fixture that returns MSG-0000 without DB.
