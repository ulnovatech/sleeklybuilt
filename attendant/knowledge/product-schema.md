# Product schema (structured truth)

A **product** is a SKU the attendant can fetch with `get_product`.

## Kinds

### `orderable_package`

From `uln_packages()` / `GET /portfolio/api/packages.php`.

| Field | Example |
| --- | --- |
| `id` | `basic` \| `smart` \| `premium` |
| `kind` | `orderable_package` |
| `title` | Start Smart Package |
| `price_ugx` | 400000 |
| `deposit_ugx` | 80000 |
| `currency` | `UGX` |
| `badge` | `popular` \| `best-value` \| null |
| `orderable` | true |

These are the only `package` values allowed in `start_order`.

### `display_package`

From marketing `pricing.js` (copied into attendant knowledge JSON by the build script).

| Field | Example |
| --- | --- |
| `id` | `starter` \| `business-basic` \| `standard-growth` \| `pro-ecommerce` \| `custom-web` \| app ids |
| `kind` | `display_package` |
| `title` | Business Basic |
| `price_ugx` | 400000 or null |
| `price_label` | for "from" quotes |
| `ideal_for` | string |
| `features` | string[] |
| `orderable` | false |
| `cta_path` | `/portfolio-app/order` or `/contact?intent=project` |

Never pass `id` to `order.php` as `package`.

### `layout`

From `GET /portfolio/api/portfolios.php` / catalog.json.

| Field | Notes |
| --- | --- |
| `id` | folder/template key |
| `kind` | `layout` |
| `title` | public title |
| `collection` | `websites` \| `sleek-pages` |
| `layout_fit` | from businessFit |
| `business_types` | ids |
| `orderable` | true if published |

Use `id` as `template` in `start_order`.

## Governance

Build script must not silently drop `orderable_package`. If PHP packages and JSON diverge, PHP `uln_packages()` wins at tool time.

## Acceptance

`get_product` returns one kind. Tests reject display ids in order payloads.
