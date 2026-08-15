# Tool: get_service

**Purpose:** Structured service line.

**Input:** `{ "id": string }`  
Ids: `sleek-pages`, `websites`, `mobile-apps`, `business-systems`.

**Aliases (optional map, not new services):** `restaurant_websites` → `websites` + hint `layout_fit: ordering`. Aliases return `canonical_id` so the model speaks Websites.

**Auth:** session. Side effects: none.

**Success:** service record + optional `hint`.

**Failure:** `not_found`.

**User-visible:** explanation and recommendation.

**Acceptance:** Unknown id fails. Alias does not change `start_order` package ids.
