# Section schema

Sections are highlightable regions. Ids match existing DOM ids / FAQ ids in marketing.

## Record

| Field | Type |
| --- | --- |
| `section_id` | string |
| `page_id` | string (home of the section) |
| `hash` | string without `#` (usually same as section_id) |
| `label` | string |
| `highlight` | boolean — widget may add a temporary outline |

## Home (`home`)

`hero`, `positioning`, `problems`, `what-we-build`, `work`, `process`, `faq`, `contact`, plus FAQ items `how-long`, `how-much`, `after-launch`, `uganda`, `get-started`, `see-work`.

## Product pages

`features`, `faq`, `layouts` (sleek-pages, websites), `browse-layouts`, FAQ items: `sp-*`, `web-*`, `app-*`, `sys-*`.

## Products index

`catalogue`, `product-guide`, `guide-{categoryId}`, `all-*` FAQ ids.

## Prices

`hero`, `plans`, `tax-note`, `pricing-faq`, FAQ items `price-*`, plus display package cards:
`starter`, `business-basic`, `standard-growth`, `pro-ecommerce`, `ecommerce-app`, `restaurant-app`, `sacco-app`, `school-app`, `custom-web`, `custom-app`.

## Product line pages

Shared ids (`hero`, `features`, `faq`, `layouts`) are page-scoped: `show_section` must include the current `page_id` (or a unique section id). Ambiguous ids without `page_id` fail closed.

## Policies

Path-segment nav (`/policies/{slug}`). Section ids: `terms`, `privacy`, `payment`, `refund`, `delivery`, `revisions`, `support`, `ip`, `hosting`, `ai-attendant`. DOM stamps use the same slug; client highlights via `section_id` when `hash` is null.

## Contact

`contact`.

## Behaviour

`show_section` fails if `section_id` is not on the target page (or not globally unique when page is omitted). Do not treat query strings as sections.

## Widget (Chunk 2 / 3E)

Elements that should highlight need `id` and `data-attendant-section="{section_id}"` where missing. `Section` and package cards stamp both. Client `applyClientAction` focuses `hash` or `section_id` (retries for async policy pages).

## Acceptance

Unknown section never returns `ok: true`.
