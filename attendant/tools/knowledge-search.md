# Tool: search_knowledge

**Purpose:** Retrieve explanatory copy (FAQ, about, how we work) and visitor-allowed company/policy excerpts.

**Input:** `{ "query": string, "limit"?: number }`  
`query` 1–200 chars. `limit` default 4, max 6.

**Auth:** session.

**Side effects:** none.

**Implementation:** keyword/synonym search over curated FAQ chunks plus `CompanyDocumentStore` for `PUBLIC` and `CUSTOMER_CONTEXT` only. Each hit: `{ id, title, text, source, public_route? }`. Company ids are `company:{doc_id}`.

**Success:** `{ hits: [...] }` possibly empty.

**Failure:** invalid query.

**User-visible:** model may paraphrase hits. Empty hits → uncertainty rule, not invented policy. Prefer linking to `public_route` when present.

**Constraints:** Do not return orderable package prices from this tool. Prices go through `get_product`. Never return INTERNAL / OPERATOR / SYSTEM company docs.

**Acceptance:** Telemetry stores hit ids. Tests include a query for "Mobile Money" that returns the home FAQ chunk, not a hallucinated partner bank. Leak tests deny authority/SYSTEM docs.
