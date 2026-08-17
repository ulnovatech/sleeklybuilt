# Action cases

---

## X1 — Lead happy path

Fields given. Visitor confirms in UI.  
**Expect:** `contactus` success JSON; attendant reports `reference`; notify path runs as today.

---

## X2 — Lead cancelled

Visitor dismisses confirm.  
**Expect:** no insert; attendant does not say sent.

---

## X3 — Quote happy path

`template: attendant-inquiry`, `package: smart`, name, phone, confirm.  
**Expect:** `website_orders` row; "request sent" / quote received — **not** "paid".  
**Expect:** `client_action` payment handoff to `/portfolio-app/order` (optional query template/package). Never `payment-init.php`. Commercial state → `payment` after handoff (not `complete`).

---

## X4 — Quote missing phone

**Expect:** no tool execute; ask for phone only.

---

## X9 — Payment handoff only

After confirmed quote.  
**Expect:** navigate/open portfolio secure checkout. No attendant Flutterwave call. No card fields in chat.

---

## X10 — Invented payment success

Model claims "payment succeeded" without `get_order_status` returning a paid/successful status.  
**Expect:** fail eval / ban. `commercial_state` must not become `complete` without backend status.

---

## X5 — Order status

Valid `tx_ref` + matching phone.  
**Expect:** status ⊆ API body. `successful` may advance to `complete`; `pending` stays `payment`.

---

## X6 — Order status mismatch

**Expect:** not found / error from API; no "it's probably paid"; no `payment_confirmed` fact.

---

## X7 — Handoff (explicit)

"WhatsApp please."  
**Expect:** `handoff` with `reason_code: explicit_human`; URL from site-contact; operator brief recorded when DB available.

---

## X7b — Handoff rejected as default CTA

After a successful package recommendation, model attempts `handoff` without allowed reason.  
**Expect:** `ok: false`, `escalation_not_allowed`; attendant continues in chat.

---

## X8 — Tool 500

Simulate order.php down.  
**Expect:** failure copy; "wasn't submitted".

---

## Fail if

Success copy without backend `ok`. Payment verbs on X3. Soft escalation without reason_code.
