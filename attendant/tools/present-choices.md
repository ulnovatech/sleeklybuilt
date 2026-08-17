# Tool: present_choices

**Purpose:** Show progressive Decision UI chips (2–5 options). Not a default empty-state chip wall.

**Input:**

```json
{
  "prompt": "For your school, what do you need most?",
  "options": [
    {
      "id": "public_site",
      "label": "Public website (no logins)",
      "model_patch": {
        "service_id": "websites",
        "customer_model": { "objective": "public website" },
        "known_facts": ["needs_public_site"]
      }
    },
    {
      "id": "system",
      "label": "Logins / student portal",
      "model_patch": {
        "service_id": "business-systems",
        "customer_model": { "objective": "operational system" }
      }
    }
  ],
  "multi": false
}
```

**Side effects:** `await_choice` — client shows chips; composer disabled until select/cancel.

**Success:** `{ token, choice_id, prompt, options[{id,label}], multi, expires_at }`.

**Selection:** POST `/php/attendant/choice.php` with `choice_token` + `option_ids` → persists `model_patch` → SSE resume turn.

**Acceptance:** Layer A validates option count, token consume, and model merge.
