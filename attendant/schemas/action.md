# action schema

Companion notes for [action.json](action.json). SSE `client_action` payload.

`type`: `navigate` | `highlight` | `none`.

When `type` is `navigate` or `highlight`: `page_id` and `path` are required. `path` starts with `/`.

Optional: `section_id`, `hash`, `external`, `highlight`.

`additionalProperties`: false. The model does not emit this object; PHP builds it from the registry after a successful nav tool.
