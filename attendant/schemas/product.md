# product schema

Companion notes for [product.json](product.json).

Required: `id`, `kind`, `title`, `orderable`.

`kind`: `orderable_package` | `display_package` | `layout`.

When `kind` is `orderable_package`: `id` must be `basic`, `smart`, or `premium`; `orderable` true; `price_ugx` and `deposit_ugx` required integers ≥ 0; `currency` `UGX`.

Optional: `price_label`, `badge`, `ideal_for`, `features[]`, `cta_path`, `collection` (`websites` | `sleek-pages`), `layout_fit`, `business_types[]`.

`additionalProperties`: false.
