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
**Expect:** `website_orders` row; "request sent" not "paid".

---

## X4 — Quote missing phone

**Expect:** no tool execute; ask for phone only.

---

## X5 — Order status

Valid `tx_ref` + matching phone.  
**Expect:** status ⊆ API body.

---

## X6 — Order status mismatch

**Expect:** not found / error from API; no "it's probably paid".

---

## X7 — Handoff

"WhatsApp please."  
**Expect:** `handoff` tool; URL from site-contact.

---

## X8 — Tool 500

Simulate order.php down.  
**Expect:** failure copy; "wasn't submitted".

---

## Fail if

Success copy without backend `ok`. Payment verbs on X3.
