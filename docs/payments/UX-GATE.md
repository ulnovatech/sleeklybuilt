# SleeklyBuilt MoMo Payment — UX Gate Artifacts

**Version:** 1.0  
**Status:** Phase 0–6 complete (2026-09-09) — MoMo claim → verify → activate → notify → reconciliation → adapter boundaries  
**Date:** 2026-09-09  
**Product:** MTN / Airtel merchant checkout, claim, admin verification, reconciliation  
**Classification:** Checkout (customer) + Admin panel (operator)  
**Governing plan:** MoMo Payment UX Plan  
**Specs:** [`PAYMENT_SYSTEM.md`](./PAYMENT_SYSTEM.md) · [`MERCHANT_CODES.md`](./MERCHANT_CODES.md)

This file satisfies `.cursor/rules/ui-ux-gate.mdc`, Design OS checkout + multi-step form patterns, and admin panel prompt.

**Stop rule:** No schema, API, or UI implementation PRs until Gates A–E below are approved (Gate E signed).

---

# Named Design OS docs (this work)

| Layer | Documents |
| --- | --- |
| Patterns | `design-os/patterns/checkout.md`, `design-os/patterns/multi_step_form.md` |
| Admin process | `design-os/prompts/admin_panel.md` |
| Systems | `design-os/systems/forms_system.md`, `loading_states_system.md`, `empty_states_system.md`, `error_states_system.md` |
| Reviews | `design-os/reviews/security_review.md` (**Gated By** — payment + PII) |
| Tokens | `packages/design-foundation/DESIGN.md` (Meridian) for portfolio checkout; sleekly-dash shell consistency for admin |
| Specs | `docs/payments/PAYMENT_SYSTEM.md`, `docs/payments/MERCHANT_CODES.md` |

---

# Absolute rules (signed checklist)

These are non-negotiable. Implementation that violates any item is incomplete.

| # | Rule | Pass |
| --- | --- | --- |
| R1 | Customer claim ≠ proof of payment. “I've completed payment” never sets order/`PAID`/`VERIFIED`. | ☐ |
| R2 | Customer is never asked for a MoMo / Airtel transaction reference, SMS ID, or screenshot as a normal requirement. | ☐ |
| R3 | Customer ≠ payer ≠ communication contact. Third-party payer is first-class. | ☐ |
| R4 | Only admin-entered merchant evidence + matching + **explicit** admin confirm creates a verified payment. | ☐ |
| R5 | Merchant codes/numbers come from dashboard config — never hardcoded in frontend source. | ☐ |
| R6 | Changing merchant config does not rewrite historical payment records. | ☐ |
| R7 | Client cannot mutate financial status via UI or API (server-controlled). | ☐ |
| R8 | Verify / allocate / correct actions require authenticated admin and leave an audit trail. | ☐ |
| R9 | Unmatched real transactions are preserved, not discarded. | ☐ |
| R10 | Notification failure does not un-verify a payment. Notifications are idempotent. | ☑ |
| R11 | Flutterwave is not shown on the new customer pay step. Historical `ULN-` track remains for old orders. | ☐ |
| R12 | No unofficial SMS scraping as a foundational dependency. | ☑ |

---

# Gate A — Intent

## A1. Client — Pay step

| Question | Answer |
| --- | --- |
| Who | Uganda SME / operator (or their helper) completing an order deposit |
| Why here | They chose a package and are ready to pay |
| Fear | Wrong merchant code; paying and being ignored; looking stupid; losing money |
| Next action | Pay in phone MoMo / Airtel, then tap **I've completed payment** |
| What matters | Exact UGX amount, active provider instructions, one primary CTA |
| What does not | Matching scores, tx refs, Flutterwave, internal queue language |

## A2. Client — Waiting / status

| Question | Answer |
| --- | --- |
| Who | Same customer after claim |
| Why here | They paid (or think they did) and need to know if SleeklyBuilt saw it |
| Fear | Silent failure; being told “failed” when money left their phone |
| Next action | Wait; optionally refresh status or contact support |
| What matters | Honest state (“We're checking…”), claim/order reference they can keep, contact path |
| What does not | Fake “Payment confirmed” before verify; asking for SMS codes |

## A3. Admin — Verification queue

| Question | Answer |
| --- | --- |
| Who | SleeklyBuilt operator |
| Why here | People are waiting; merchant SMS/account shows money |
| Fear | Missing a claim; attaching money to the wrong order |
| Next action | Open oldest awaiting item → **Review** |
| What matters | Who, what package, how much, provider, age |
| What does not | Full CRM noise; settings buried under ops |

## A4. Admin — Verify detail

| Question | Answer |
| --- | --- |
| Who | Same operator with merchant SMS/account open |
| Why here | Enter what the merchant account shows; confirm match |
| Fear | Wrong attachment; marking paid without evidence |
| Next action | Enter txn fields → review match language → **Confirm payment** |
| What matters | Claim (read-only), evidence form, plain-English match, confirm |
| What does not | Auto-verify without confirm; overwriting customer contact with payer |

## A5. Admin — Payment settings

| Question | Answer |
| --- | --- |
| Who | Admin role |
| Why here | Change MTN code / Airtel number / instructions without a deploy |
| Fear | Breaking live checkout; changing history |
| Next action | Edit → **Save** |
| What matters | Active toggle per provider, merchant identifier, instruction text |
| What does not | Editing verified historical rows |

---

# Gate B — Journeys

## B1. Happy path

```text
Package → Contact → Project → Pay
  → Choose MTN (or Airtel)
  → (Payer = me, or someone else + payer phone)
  → See amount + merchant code/instructions
  → Pay in phone app / USSD
  → Tap "I've completed payment"
  → Claim created (AWAITING_VERIFICATION)
  → Waiting screen + claim/order reference shown
        ↓
Admin opens queue → Review
  → Enters merchant txn (provider, ref, payer phone, name, amount, time)
  → System match: high confidence
  → Confirm payment
  → Allocate → receipt → notify → order eligible for activation
        ↓
Customer status shows verified + receipt
```

## B2. Third-party payer

```text
Customer: John (contact WhatsApp 075…)
Payer: Jane (070…)
  → Instructions shown
  → Claim submitted with payer = Jane
  → Admin enters txn with payer 070…
  → Match uses payer phone, not contact WhatsApp
  → Contact remains John's WhatsApp (never overwritten by payer)
```

## B3. Wrong amount / partial

```text
Expected deposit: 400,000
Txn entered: 100,000
  → Match flags wrong/partial amount
  → Admin confirms as partial OR rejects / requests balance
  → Customer status: partially paid + balance remaining (plain language)
  → Never auto-activate full package unless deposit rules say so
```

## B4. Overpay

```text
Txn > expected
  → Match: overpaid / needs review
  → Admin confirms with note OR holds for ops
  → Receipt reflects actual amount paid
```

## B5. Ambiguous match

```text
Same payer phone, two open claims
  → System: AMBIGUOUS + competing candidates listed
  → Admin must choose order or leave unmatched
  → No silent attach
```

## B6. Unmatched transaction

```text
Admin enters txn that matches no claim
  → Stored as UNMATCHED in reconciliation queue
  → Not discarded
  → Can later attach when claim appears
```

## B7. Missing transaction (customer waiting)

```text
Customer claimed; admin sees no SMS yet
  → Claim stays AWAITING_VERIFICATION
  → Customer copy: still checking — not “payment failed”
  → Admin can mark NOT_FOUND / follow up after investigation
```

## B8. Duplicate merchant reference

```text
Same provider ref entered twice
  → Block second verify; show existing payment
  → Audit note
```

## B9. Notification fails

```text
Payment verified successfully
  → Notify WhatsApp/email fails
  → Payment remains VERIFIED
  → Retry notify without re-verify
```

## B10. Historical Flutterwave order

```text
Old ULN- tx_ref + phone on /track-order
  → Still works via existing order-status path
  → New MoMo claims use claim/session reference + phone
```

---

# Gate C — Screen layouts (mobile-first)

## C1. Client — Pay step

**Surface:** Portfolio wizard step `pay` in `/portfolio-app/order`  
**Replace:** Flutterwave “Pay deposit” redirect as primary  
**Keep:** Quote-only secondary path

```text
┌─────────────────────────────────────┐
│ Step indicator (package…pay)        │
│                                     │
│ Amount due                          │
│ UGX 400,000                    lg   │
│ Business Basic · deposit            │
│                                     │
│ Who is paying?                      │
│ ( ) Me   ( ) Someone else           │
│   [if else: name + MoMo phone]      │
│                                     │
│ Pay with                            │
│ [ MTN MoMo ]  [ Airtel Money ]      │
│                                     │
│ ┌ Instructions ─────────────────┐   │
│ │ Merchant code / number        │   │
│ │ Exact amount (copy)           │   │
│ │ USSD / tip from config        │   │
│ │ “Send the exact amount”       │   │
│ └───────────────────────────────┘   │
│                                     │
│ [ I've completed payment ]  primary │
│ [ Request a quote instead ]         │
│ Need help? Contact                  │
└─────────────────────────────────────┘
```

**Desktop:** same column, max readable width (~42–48ch for instructions); amount stays dominant.

### States — Pay step

| State | Behavior |
| --- | --- |
| Loading | Skeleton for amount + provider buttons while config loads |
| Empty providers | Both inactive → “Payments temporarily unavailable — request a quote or contact us” |
| Error (config) | Inline error + retry; quote still available |
| Validation | Payer-other requires name + phone before claim |
| Submitting claim | Primary button loading; prevent double submit |
| Success | Navigate to waiting / status with claim reference |
| Disabled | No package/amount → cannot claim |

---

## C2. Client — Waiting / claim confirmation

**Surface:** Post-claim page (replace Flutterwave-centric OrderSuccess for new path)

```text
┌─────────────────────────────────────┐
│ We're checking your payment         │
│                                     │
│ You said you paid UGX 400,000 via   │
│ MTN. We verify against our merchant │
│ account — usually within one        │
│ working day.                        │
│                                     │
│ Your reference                      │
│ SB-PAY-10482          [Copy]        │
│ Keep this + your phone to track.    │
│                                     │
│ Status: Waiting for verification    │
│                                     │
│ [ Track status ]  [ Contact us ]    │
└─────────────────────────────────────┘
```

**Never say:** “Payment confirmed” / “Paid successfully” on this screen.

### States — Waiting

| State | Behavior |
| --- | --- |
| Awaiting verification | Copy above |
| Verified | Success tone + receipt link + next steps |
| Partial | Amount received + balance due |
| Rejected / not found | Calm explanation + contact; no blame |
| Loading status | Skeleton / spinner on refresh |
| Error | “Couldn't load status” + retry |

---

## C3. Client — Track status

**Surface:** Marketing `/track-order` (extend)

**Lookup (new MoMo claims):** claim/order reference + phone (same trust bar as today, without MoMo SMS id).  
**Legacy:** `ULN-` + phone still supported.

```text
┌─────────────────────────────────────┐
│ Track your order                    │
│ Reference [____________]            │
│ Phone     [____________]            │
│ [ Check status ]                    │
│                                     │
│ (result panel: timeline)            │
│ Submitted → Claimed → Verified → …  │
└─────────────────────────────────────┘
```

### States — Track

| State | Behavior |
| --- | --- |
| Empty | Prompt for reference + phone |
| Not found | “No order with those details” + contact |
| Found awaiting | Timeline stops at “Waiting for verification” |
| Found verified | Timeline complete + receipt if available |
| Error | Network/server message + retry |

---

## C4. Admin — Verification queue

**Route:** `/payments` (new sidebar item in sleekly-dash)  
**Not:** buried only under Settings

```text
┌─ Payments ──────────────────────────┐
│ Awaiting (12)  Ambiguous  Unmatched │
│                                     │
│ Oldest first                        │
│ ┌─────────────────────────────────┐ │
│ │ John Doe · Business Basic       │ │
│ │ UGX 400,000 · MTN · 2h ago      │ │
│ │                        [Review] │ │
│ └─────────────────────────────────┘ │
│ …                                   │
└─────────────────────────────────────┘
```

### States — Queue

| State | Behavior |
| --- | --- |
| Loading | Row skeletons |
| Empty awaiting | “No payments waiting — you're clear” + link to unmatched if any |
| Error | Retry banner |
| Filters | Tabs/segments: Awaiting / Ambiguous / Unmatched / Recent verified |

---

## C5. Admin — Verify detail

**Route:** `/payments/:claimId` (or session id)

```text
Mobile (stack) / Desktop (two panes)

LEFT — Claim (read-only)          RIGHT — Actual transaction
Customer, package, expected UGX   Provider [MTN|Airtel]
Claimed payer + time              Reference *
Contact (label: do not overwrite) Payer phone *
                                  Registered name
                                  Amount *
                                  Date/time *
                                  Notes
                                  [Find match]
                                  Match panel (plain English)
                                  [ Confirm payment ] primary
                                  Unmatched | Reject | Wrong amount
```

### States — Verify

| State | Behavior |
| --- | --- |
| Loading claim | Skeletons both panes |
| Ready | Form enabled |
| Matching | Soft loading on match panel |
| High confidence | Green/neutral success language + Confirm enabled |
| Ambiguous | Warning + candidate list; Confirm requires explicit order choice |
| Duplicate ref | Block with link to existing payment |
| Confirming | Button busy; then success toast + back to queue |
| Error | Inline field/server errors; no silent success |

---

## C6. Admin — Settings → Payments

**Route:** section on `/settings` or `/settings/payments`

```text
┌─ Payment providers ─────────────────┐
│ MTN Mobile Money                    │
│ Status [ Active ▾ ]                 │
│ Merchant code [ ________ ]          │
│ Instructions  [ ________ ]          │
│ USSD tip      [ ________ ]          │
│                                     │
│ Airtel Money                        │
│ Status [ Active ▾ ]                 │
│ Merchant number [ ________ ]        │
│ Instructions / USSD …               │
│                                     │
│ [ Save changes ]                    │
│ Note: history unchanged             │
└─────────────────────────────────────┘
```

### States — Settings

| State | Behavior |
| --- | --- |
| Loading | Form skeletons |
| Dirty | Save enabled |
| Saving | Busy button |
| Success | Inline “Saved” near Save |
| Error | Field/server message |
| Validation | Require identifier when Active |

---

# Gate D — Component structure

## D1. Portfolio (customer)

| Component | Responsibility | Key states |
| --- | --- | --- |
| `GamifiedOrderWizard` (existing) | Steps package→contact→project→**pay** | progress, validation |
| `PayStep` (new) | Amount, payer mode, provider, instructions, claim CTA | loading config, submit, error |
| `ProviderToggle` | MTN / Airtel exclusive choice | disabled if inactive |
| `PaymentInstructionsCard` | Merchant id, amount, USSD, copy actions | empty provider |
| `PayerFields` | Me vs someone else | validation |
| `ClaimWaitingPage` | Post-claim waiting / verified | awaiting, verified, partial, error |
| `QuoteOnlyAction` (existing path) | Skip payment | — |

## D2. Marketing

| Component | Responsibility | Key states |
| --- | --- | --- |
| `TrackOrderPage` (extend) | Lookup by claim/ULN ref + phone | empty, not found, timeline |

## D3. Sleekly-dash (admin)

| Component | Responsibility | Key states |
| --- | --- | --- |
| `PaymentsQueuePage` | List claims / queues | loading, empty, error, filters |
| `PaymentQueueRow` | Summary + Review | — |
| `PaymentVerifyPage` | Claim + txn form + match + confirm | matching, ambiguous, confirming |
| `MerchantTxnForm` | Evidence fields | validation |
| `MatchAnalysisPanel` | Plain-English match result | high / ambiguous / none |
| `PaymentSettingsPanel` | Provider config | dirty, save, success |
| Sidebar link **Payments** | Ops entry | badge count optional later |

## D4. Shared domain language (UI copy)

| Internal state | Customer-facing label |
| --- | --- |
| `CUSTOMER_SUBMITTED` / `AWAITING_VERIFICATION` | Waiting for verification |
| `VERIFIED` | Payment confirmed |
| `PARTIALLY_PAID` | Partial payment received |
| `REJECTED` / `NOT_FOUND` | We couldn't match a payment yet |
| `AMBIGUOUS` | (admin only) Needs review |

---

# Gate E — Security & honesty review checklist

| # | Check | Pass |
| --- | --- | --- |
| E1 | No client endpoint can set verified/paid/allocated | ☑ |
| E2 | Verify / correct / allocate require dash auth + **admin** role | ☑ |
| E3 | Merchant identifiers only via settings API; not in Vite env as the source of truth for display | ☑ |
| E4 | Audit log: actor, action, entity, before/after on verify/allocate/correct | ☑ |
| E5 | Payer phone / MoMo refs treated as PII in logs (no full dump to analytics) | ☑ |
| E6 | Rate-limit claim creation and track lookup | ☑ |
| E7 | Idempotent verify on same merchant ref (duplicate protection) | ☑ |
| E8 | Receipt only after verify | ☑ |
| E9 | Contact fields never auto-replaced by payer fields | ☑ |
| E10 | Security Review pattern (`design-os/reviews/security_review.md`) run before Phase 3 ships | ☑ |

**Gate E sign-off:** product owner + implementer confirm R1–R12 and E1–E10 before Phase 1 code.

---

# Interaction copy (approved direction)

| Moment | Copy direction |
| --- | --- |
| Primary CTA | **I've completed payment** |
| Waiting | **We're checking your payment** — usually within one working day |
| Verified | **Payment confirmed** + amount + provider |
| Partial | **We received UGX X** — balance UGX Y still due |
| Admin confirm | **Confirm payment** (not “Approve claim”) |
| Settings note | Changing codes does not change past payments |

No emoji as icons. No unverifiable “instant” promises.

---

# Responsive behavior

| Breakpoint | Client pay | Admin verify |
| --- | --- | --- |
| Mobile | Single column; CTAs full width ≥44px | Stack claim then form |
| Tablet | Same, slightly wider measure | Stack or soft two-pane |
| Desktop | Centered pay column | Two-pane claim \| evidence |

---

# Phase 0 exit criteria

- [x] Gate A Intent recorded  
- [x] Gate B Journeys recorded  
- [x] Gate C Screen layouts + states recorded  
- [x] Gate D Component structure recorded  
- [x] Gate E Security checklist recorded  
- [x] **Human approval** of this document (2026-09-09 — unlock Phase 1+)

**Next:** Operate: set merchant codes, run migration, verify live claim→confirm path. Optional later: wire official MTN/Airtel HTTP clients per [`PROVIDER_ADAPTERS.md`](./PROVIDER_ADAPTERS.md).

---

# Approval

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Product / owner | Owner | 2026-09-09 | ☑ Approve Phase 0 → unlock Phase 1 |
| Implementer | Agent | 2026-09-09 | ☑ R1–R12 acknowledged; Phase 1–2 shipped (config + client claim) |
