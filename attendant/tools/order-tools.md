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

**Success data:** `{ order_id, package, template, success: true, paid: false, payment_handoff }`.

`payment_handoff` is a registry-resolved `client_action` to `/portfolio-app/order` (optional `?template=&package=`). Confirm API and TurnEngine emit it so the widget opens the **existing** Flutterwave checkout — the attendant never calls `payment-init.php`.

**Failure:** validation, rate limit (`website_order`), DB.

**User-visible:** quote / request received; open secure checkout. Never "paid".

---

## `get_order_status`

**Purpose:** Look up `order_payments` by `tx_ref` + phone (same truth as portfolio `order-status.php`).

**Confirmation:** none.

**Input:** `{ tx_ref, phone, countryCode }` as that API.

**Side effects:** none.

**Success:** pass through verified fields only (status, amounts if present). This is the **only** source of truth for payment language. `successful` / `paid` may advance commercial state to `complete`; `pending` stays `payment`.

**Failure:** not found / mismatch — `ok: false`, do not invent processing or paid.

---

## Not registered

`payment-init`, `payment-verify`, `add_to_cart`, `submit_order` (legacy `php/submit_order.php`).

Payment is **handoff-to-secure-flow** only (`page_id: portfolio-order`).

---

## Acceptance

PHPUnit-style tests: display id `starter` rejected. Confirmation missing → no INSERT. Status tool never returns `paid` unless the API body did. Handoff path contains `/portfolio-app/order` and never a Flutterwave host or `payment-init`.
