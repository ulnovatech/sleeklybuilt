# service schema

Companion notes for [service.json](service.json).

Required: `id`, `label`, `href`, `page_id`.

`id` enum: `sleek-pages`, `websites`, `mobile-apps`, `business-systems`.

Optional: `tagline`, `keywords[]`, `faq_ids[]`, `canonical_id` (when the lookup used an alias), `hint` (e.g. layout_fit ordering).

`additionalProperties`: false.
