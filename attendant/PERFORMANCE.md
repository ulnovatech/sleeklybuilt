# PERFORMANCE.md — SleeklyBuilt Attendant

**Status:** Authoritative  
**Cost model:** one API model, no GPU, no local inference.

---

## Latency targets

| Stage | Target |
| --- | --- |
| Session create | <200ms locally, <500ms typical hosted |
| Time to first streamed token | 1–4s under normal Gemini load |
| Tool round (lead/order HTTP) | bounded by existing PHP handlers; fail by 15s |
| Full turn with 0–2 tools | typically <12s |

If Gemini is slow, show streaming/waiting state. Do not fill with guessed answers.

---

## Token and context budget

Flash Lite is cheap; the limit is quality and latency, not thrift for its own sake.

| Item | Rule |
| --- | --- |
| History | Last 16 user/attendant messages, or ~4k tokens of history, whichever first |
| Retrieved snippets | Max 6 chunks, each ≤400 tokens |
| Structured truth | Only the records tools returned or the page's visible product — not the full catalogue every turn |
| Output | Soft cap ~400 tokens; brevity rules still apply |
| Tool loop | Max 4 |

Never paste `marketing/src` trees or the Design OS corpus into the model.

---

## Cost controls

- `GEMINI_API_KEY` server-side only
- Rate limit: `uln_rate_limit('attendant_chat', …)` per IP
- Reject messages over 4,000 characters
- No image/video understanding in this version
- Daily optional ceiling via telemetry (alert, do not silently fake replies when exceeded — fail closed)

---

## Knowledge retrieval performance

The site is small. Keyword + synonym search over a curated JSON corpus is the production retriever. Do not add a vector database to chase RAG fashion.

Structured lookups (`get_product`, `get_service`, packages) are O(1)/O(n) maps, not embeddings.

---

## Acceptance (from PRODUCT_SPEC)

Known facts ≥99%. Tools ≥99%. Navigation ≥98%. Context ≥95%. Fabricated actions 0. Confirmation bypass 0. Unnecessary clarification <10%. Verbose <10%.

Measurement: `testing/regression-suite.md` plus PHP tests. Live scoring requires `ATTENDANT_LIVE_EVAL=1` and is not a merge blocker for schema/tool unit tests.

---

## Widget performance (Chunk 2)

- No Gemini SDK in the browser
- Panel first paint from local state
- Transcript virtualization not required at expected length (<100 messages); if a thread exceeds that, still keep the composer responsive
- Respect `prefers-reduced-motion`
