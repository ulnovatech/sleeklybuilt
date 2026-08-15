# tool-result schema

Companion notes for [tool-result.json](tool-result.json). Every tool returns this shape.

Required: `ok` (boolean), `tool` (string), `code` (string), `side_effects`.

`side_effects`: `none` | `client_navigation` | `writes_lead` | `writes_quote`.

Optional: `data`, `user_safe_error`, `confirmation_required`, `summary`.

When `ok` is false, `code` is one of: `validation_error`, `unknown_destination`, `unknown_section`, `not_found`, `ambiguous_id`, `confirmation_required`, `unauthorized`, `rate_limited`, `backend_error`, `unsupported`.

When `ok` is true, `confirmation_required` must be false.

`additionalProperties`: false.

The visitor never sees this object raw. The model sees it as a function response. Success sentences require `ok: true`.
