# Tool: search_knowledge

**Purpose:** Retrieve explanatory copy (FAQ, about, how we work). Not prices.

**Input:** `{ "query": string, "limit"?: number }`  
`query` 1–200 chars. `limit` default 4, max 6.

**Auth:** session.

**Side effects:** none.

**Implementation:** keyword/synonym search over curated chunks. Each hit: `{ id, title, text, source }`.

**Success:** `{ hits: [...] }` possibly empty.

**Failure:** invalid query.

**User-visible:** model may paraphrase hits. Empty hits → uncertainty rule, not invented policy.

**Constraints:** Do not return orderable package prices from this tool. Prices go through `get_product`.

**Acceptance:** Telemetry stores hit ids. Tests include a query for "Mobile Money" that returns the home FAQ chunk, not a hallucinated partner bank.
