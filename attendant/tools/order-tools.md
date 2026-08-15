# Tools: orders

## `start_order`

**Purpose:** Quote insert via `portfolio/api/order.php` (or shared insert + `uln_notify_lead('website_order')`).

**Confirmation:** required (same pending-token pattern as capture_lead).

**Input:**

| Field | Required | Notes |
| --- | --- | --- |
| `template` | yes | layout key or `attendant-inquiry` |
| `fullName` | yes | |
| `phone` | yes | |
| `countryCode` | no | default `+256` |
| `businessName` | no | |
| `package` | yes | `basic` \| `smart` \| `premium` only |
| `notes` | no | |

**Side effects:** `writes_quote`. Not payment. Not `templates.status` reserve (that happens on paid complete).

**Success:** `{ order_id, success: true }` from the API.

**Failure:** validation, rate limit (`website_order`), DB.

**User-visible:** request received, not "paid".

---

## `get_order_status`

**Purpose:** `POST /portfolio/api/order-status.php`.

**Confirmation:** none.

**Input:** `{ tx_ref, phone, countryCode }` as that API.

**Side effects:** none.

**Success:** pass through verified fields only (status, amounts if present).

**Failure:** not found / mismatch — `ok: false`, do not invent processing.

---

## Not registered

`payment-init`, `payment-verify`, `add_to_cart`, `submit_order` (legacy `php/submit_order.php`).

---

## Acceptance

PHPUnit-style tests: display id `starter` rejected. Confirmation missing → no INSERT. Status tool never returns `paid` unless the API body did.
