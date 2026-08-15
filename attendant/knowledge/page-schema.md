# Page schema (semantic navigation)

Pages are semantic. The model never owns URLs.

## Record

| Field | Type | Notes |
| --- | --- | --- |
| `page_id` | string | stable |
| `path` | string | begins with `/` |
| `title` | string | |
| `external` | boolean | true for `/portfolio-app/` |
| `section_ids` | string[] | |
| `default_service_id` | string \| null | |
| `default_product_kind` | string \| null | e.g. prices → display packages |

## Locked page_ids

`home`, `sleek-pages`, `websites`, `mobile-apps`, `business-systems`, `products`, `contact`, `about`, `prices`, `track-order`, `portfolio`.

Optional query context (not separate pages): `contact` + `intent`, `prices` + `category=websites|apps`.

## Resolution

`navigate_to({ page_id, section_id? })` → `{ path, hash, external }`. Unknown id → `ok: false`, `code: unknown_destination`.

## Implementation

PHP registry JSON generated from this contract. Changing a path updates the registry, not the prompts.

## Acceptance

Tests: every `App.jsx` route has a `page_id`. No tool success with an unregistered path.
