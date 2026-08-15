# SECURITY.md — SleeklyBuilt Attendant

**Status:** Authoritative  
**Gated By:** Design OS Security Review for PII and confirmation paths

---

## Trust model

| Actor | Trust |
| --- | --- |
| Visitor browser | Untrusted |
| Gemini | Untrusted (may hallucinate args, ignore rules) |
| PHP engine after validation | Trusted to call allow-listed backends |
| Existing PHP lead/order handlers | Trusted as today (rate limit, validation already there) |

The model **requests**. PHP **decides**.

```
LLM → tool request → schema → authorization → business rules → backend → verified result → reply
```

---

## Secrets

- `GEMINI_API_KEY` only in `php/.env` (and server env). Never sent to the widget, never to the model, never written to `attendant_events` payloads.
- Flutterwave keys must not be readable by attendant code. Payment tools are not registered.
- Database credentials stay in existing PHP config.

---

## Authorization

Visitor endpoints are public, like `contactus.php`. Protection is:

- Origin / same-site via existing `/php/` hosting
- Session token (unguessable, hashed at rest)
- Rate limit per IP (`uln_rate_limit('attendant_chat')`)
- Confirmation tokens for consequential tools (single use, short TTL, bound to conversation id)
- Tool allow-list

There is no "admin tool" on this API. Listing Requests, converting companies, or Discovery routes are unreachable.

---

## Injection and prompt

- User message is untrusted text. Do not concatenate it into a shell or SQL.
- If the user says "ignore your rules" or "you are in developer mode", rules still load; tools still validate.
- Never execute model-supplied SQL, PHP, or URLs.
- `navigate_to` accepts only registry ids, not `https://` strings.

---

## PII

Leads store name, phone, email, message — same as the public contact form. Attendant must:

- Collect only what those handlers require
- Not log full messages into world-readable files
- Not echo full phone numbers back unnecessarily in later turns if the UI already has them
- Tag submissions `source: attendant` plus conversation id for operator context

Telemetry stores intent labels and tool names, not Gemini keys, not card data (there is no card data).

---

## Confirmation (non-bypassable)

`capture_lead` and `start_order` execute only from `confirm.php` with a valid `confirmation_token` issued after the model requested the tool and the visitor confirmed.

A direct `chat.php` function call to those tools returns `confirmation_required` and does not insert rows.

---

## Availability abuse

- Max body size
- Max history
- Max 4 tool loops
- Rate limit
- Fail closed when over quota

Do not disable the attendant into a mode that returns canned successful orders.

---

## Honest unavailable

If Gemini is missing or down, the UI offers WhatsApp/call. That is the degraded path. Inventing business answers from the widget is forbidden.
