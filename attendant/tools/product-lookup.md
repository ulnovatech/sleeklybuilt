# Tools: product lookup

## `get_product`

**Purpose:** Structured product record by id.

**Input:** `{ "id": string, "kind"?: "orderable_package"|"display_package"|"layout" }`

If `kind` omitted, look up in order: orderable, display, layout. If ambiguous, return `ok: false`, `code: ambiguous_id`.

**Auth:** session. Side effects: none.

**Success:** product object per knowledge/product-schema.md. Orderable prices from `uln_packages()` at request time.

**Failure:** `not_found`.

**User-visible:** model quotes fields.

---

## `compare_products`

**Purpose:** Server-built comparison so the model cannot subtract the wrong currencies.

**Input:** `{ "ids": string[], "kind"?: string }`  
`ids` length 2–3.

**Success:** `{ items: [product, …], differences: [{ field, values: [] }] }` including price fields when same kind.

**Failure:** mixed kinds without explicit `kind`, unknown id, wrong arity.

**Side effects:** none.

---

## Acceptance

Unit tests: `business-basic` is display; `smart` is orderable; comparing them without kind fails or returns a labelled mixed-kind error, never a single fake table of deposits.
