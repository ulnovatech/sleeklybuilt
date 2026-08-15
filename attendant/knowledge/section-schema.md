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

`plans`, `tax-note`, `pricing-faq`, `price-currency`, `price-tax`, `price-negotiable`, `price-deposit`, `price-wrong-plan`.

## Contact

`contact`.

## Behaviour

`show_section` fails if `section_id` is not on the target page (or not globally unique). Do not treat query strings as sections.

## Widget (Chunk 2)

Elements that should highlight need `id` and `data-attendant-section="{section_id}"` where missing.

## Acceptance

Unknown section never returns `ok: true`.
