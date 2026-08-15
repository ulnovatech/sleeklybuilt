# context schema

Companion notes for [context.json](context.json). Client payload on each `chat.php` turn.

Required: `current_url`, `page_id`.

`page_id` enum: `home`, `sleek-pages`, `websites`, `mobile-apps`, `business-systems`, `products`, `contact`, `about`, `prices`, `track-order`, `portfolio`, `unknown`.

Optional: `section_id` (max 80), `path` (max 512), `query` (string map), `visible_product_id`, `visible_product_kind` (`orderable_package` | `display_package` | `layout`), `visible_service_id` (the four lines), `recent_page_ids` (max 8).

`additionalProperties`: false.

Unknown `page_id` from the client must be stored as `unknown`, never used as a navigation target.
