# Schemas

Wire and store shapes for the SleeklyBuilt Attendant. PHP validators load the `.json` files.

| File | Role |
| --- | --- |
| [conversation.json](conversation.json) | Stored conversation + draft + messages |
| [context.json](context.json) | Client page context on each chat turn |
| [product.json](product.json) | Orderable, display, and layout products |
| [service.json](service.json) | Product lines |
| [page.json](page.json) | Semantic navigation pages |
| [action.json](action.json) | SSE client navigate/highlight actions |
| [tool-result.json](tool-result.json) | Every tool response |

Companion `.md` files explain intent. If prose and JSON disagree, **JSON wins** for validation; update both in the same change.

## Acceptance

Engine rejects payloads that fail these schemas. Display package ids never satisfy `orderable_package`. Write tools never report `ok: true` with `confirmation_required: true`.
