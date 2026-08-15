# Tools: navigation

## `get_current_page`

**Purpose:** Return the page context the client already sent (normalized).

**Input:** none (or empty object).

**Auth:** session required.

**Side effects:** none.

**Success:** `{ page_id, path, section_id, visible_product_id, visible_service_id, recent_page_ids }`.

**Failure:** missing session.

**User-visible:** none unless the model mentions it.

**Do not:** scrape HTML.

---

## `navigate_to`

**Purpose:** Resolve a semantic page (and optional section) for the widget.

**Input:** `{ "page_id": string, "section_id"?: string }`

**Validation:** both ids in registry; `section_id` must belong to that page if present.

**Auth:** session. Confirmation: none.

**Side effects:** `client_navigation`. Server does not change the browser; it returns path/hash.

**Success:** `{ page_id, section_id, path, hash, external }`.

**Failure:** `unknown_destination`.

**User-visible:** widget navigates; model says it is taking them there.

---

## `show_section`

**Purpose:** Resolve a section highlight, remaining on the current page when possible.

**Input:** `{ "section_id": string, "page_id"?: string }`

**Validation:** registry. Default `page_id` = current.

**Side effects:** `client_navigation` (hash + highlight flag).

**Success:** `{ page_id, section_id, path, hash, highlight: true }`.

**Failure:** `unknown_section`.

**User-visible:** scroll + highlight.

---

## Acceptance

No successful result contains a path that is not in the registry. Model-supplied `https://` is rejected at schema (additionalProperties / pattern `^[a-z0-9-]+$` on ids).
