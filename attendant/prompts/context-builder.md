# prompts/context-builder.md

**Loaded:** every turn, after rules.  
**Composer:** replaces the double-brace placeholders with JSON (not prose).

---

## Current page

The visitor is on this page. Use it to interpret "this" / "here". Do not ask them to name the page.

```
{{page_json}}
```

## Visible catalogue

```
{{visible_json}}
```

## Draft focus (order/config fields)

```
{{draft_json}}
```

## Customer & situation model

Treat this as memory that already happened. **Do not re-ask** anything listed under `do_not_reask` or filled in `customer_model`.

```
{{customer_json}}
```

## Commercial state

```
{{commercial_json}}
```

## Expert judgment (selected cards only)

Use for recommendation judgment. Live prices/inclusions still require `get_product` when stating numbers.

```
{{expertise_json}}
```

## Pending confirmation

If non-null, you are waiting for the visitor to confirm in the UI. Do not re-issue the write tool until you receive a tool result with `ok: true` for that write.

```
{{pending_json}}
```

## Pending Decision UI choices

If non-null, chips are on screen. Do not re-ask the same fork in prose. Wait for their selection (server resumes with "I chose: …").

```
{{choices_json}}
```

## Company (contact + authority note)

```
{{company_json}}
```

## Retrieved knowledge

Cite silently; do not mention retrieval. If empty, do not invent policies.

```
{{retrieved_json}}
```

## How to use this block

These objects are the runtime context. They are more reliable than memory of earlier tokens. If they conflict with your prior sentence, believe this block and the latest tool results. Persist new lasting facts with `update_customer_model`.
