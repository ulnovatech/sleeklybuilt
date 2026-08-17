# Tool: get_company_document

**Purpose:** Load one visitor-allowed company or public policy document by id or public slug.

**Input:** `{ "id"?: string, "slug"?: string }` — at least one required.  
Examples: `slug: "privacy"`, `id: "06_privacy_policy"`.

**Auth:** session.

**Side effects:** none.

**Implementation:** `CompanyDocumentStore` with `VISITOR_ALLOWED` (`PUBLIC`, `CUSTOMER_CONTEXT`). Forbidden access returns `unauthorized` (not the document body).

**Success:** `{ id, title, slug, public_route, markdown }`.

**Failure:** missing id/slug, not found, unauthorized.

**User-visible:** Summarize; for long PUBLIC policies prefer navigate to `/policies/{slug}` via `navigate_to({ page_id: "policies", section_id: slug })`.

**Constraints:** Never return INTERNAL / OPERATOR / SYSTEM documents.

**Acceptance:** Layer A leak tests for authority matrix and company truth.
