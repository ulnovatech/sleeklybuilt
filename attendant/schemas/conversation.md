# conversation schema

Companion notes for [conversation.json](conversation.json). JSON is authoritative for validation.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sleeklybuilt.pro/attendant/schemas/conversation.json",
  "title": "AttendantConversation",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "session_id", "status", "created_at"],
  "properties": {
    "id": { "type": "string", "minLength": 8, "maxLength": 64 },
    "session_id": { "type": "string", "minLength": 8, "maxLength": 64 },
    "status": { "type": "string", "enum": ["active", "expired", "cleared"] },
    "created_at": { "type": "string" },
    "updated_at": { "type": "string" },
    "pending_action_id": { "type": ["string", "null"] },
    "draft": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "service_id": { "type": ["string", "null"] },
        "product_id": { "type": ["string", "null"] },
        "product_kind": { "type": ["string", "null"] },
        "package": { "type": ["string", "null"], "enum": ["basic", "smart", "premium", null] },
        "template": { "type": ["string", "null"] },
        "business_name": { "type": ["string", "null"] },
        "notes": { "type": ["string", "null"] }
      }
    },
    "messages": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "role", "created_at"],
        "properties": {
          "id": { "type": "string" },
          "role": { "type": "string", "enum": ["visitor", "attendant", "system"] },
          "text": { "type": "string" },
          "created_at": { "type": "string" },
          "tool_name": { "type": ["string", "null"] },
          "tool_ok": { "type": ["boolean", "null"] }
        }
      }
    }
  }
}
```
