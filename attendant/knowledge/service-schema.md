# Service schema (structured truth)

A **service** is a product **line**, not a price SKU.

## Ids (locked to marketing `productLines`)

| id | Path | Job |
| --- | --- | --- |
| `sleek-pages` | `/sleek-pages` | Fast personalised layout, ~24h after content |
| `websites` | `/websites` | Multi-page, CMS, gallery, shop as scoped |
| `mobile-apps` | `/mobile-apps` | Android/iOS, Mobile Money |
| `business-systems` | `/business-systems` | Dashboards, CRM, POS, custom ops |

## Record

| Field | Type |
| --- | --- |
| `id` | string |
| `label` | string |
| `tagline` | string |
| `href` | path |
| `page_id` | same as nav page |
| `keywords` | string[] (visitor synonyms; "template" → sleek-pages) |
| `faq_ids` | section ids on that page |
| `order_path` | `capture_lead` vs gallery vs `/portfolio-app/order` |

Copy for features/FAQ is **searchable knowledge**, not duplicated as prices here.

## Behaviour

`get_service` returns this record plus optional retrieved FAQ answers. Recommendations bind to a service id before a SKU.

## Acceptance

Unknown service id fails the tool. The model must not mint `restaurant_websites` as a service id unless it is added to the registry as an alias mapped to `websites` + fit `ordering`.
