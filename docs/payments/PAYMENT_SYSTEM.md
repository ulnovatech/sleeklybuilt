# SleeklyBuilt Payment, Verification & Reconciliation System

> **UX gate (Phase 0):** [`UX-GATE.md`](./UX-GATE.md) — approve before implementation. Merchant config: [`MERCHANT_CODES.md`](./MERCHANT_CODES.md).

## 1. Purpose

This document defines the complete production payment system to be built for SleeklyBuilt.

The system is designed around SleeklyBuilt's current payment reality:

* SleeklyBuilt accepts **MTN Mobile Money** and **Airtel Money** merchant payments.
* Customers pay through the existing mobile-money networks.
* The web application does **not initially have direct real-time access to MTN/Airtel transaction APIs**.
* Therefore, payment verification is deliberately handled through an **administrator verification workflow**.
* The system must nevertheless provide a polished, trustworthy, highly automated customer experience.
* The architecture must allow official MTN/Airtel API integration to be added later without redesigning the entire payment/order system.

The objective is not to build a fake payment gateway.

The objective is to build a **SleeklyBuilt payment checkout, payment-claim, transaction-matching, verification, reconciliation, receipt and notification system around real MTN/Airtel merchant payments.**

---

# 2. Core Product Definition

SleeklyBuilt's payment system should allow a customer to:

1. Select a service/package.
2. See the exact amount due.
3. Choose MTN or Airtel.
4. Identify who will make the payment where necessary.
5. Receive simple payment instructions.
6. Complete the payment through the actual mobile-money network.
7. Tap **"I've completed payment."**
8. Wait while SleeklyBuilt verifies the actual merchant transaction.
9. Automatically receive confirmation and a receipt after verification.

The customer should **not** have to understand SleeklyBuilt's internal reconciliation process.

The customer should **not** have to type transaction references.

The customer should **not** have to repeatedly enter information already known by the system.

The administrator is responsible for entering the authoritative transaction information from the merchant account/SMS/account record.

The system then performs the matching work.

---

# 3. Absolute Payment Principle

The most important rule in the entire system is:

> **A customer claim is not proof of payment.**

A customer clicking:

> "I've completed payment"

must never directly change an order to `PAID`.

The system must distinguish between:

### A. Payment Claim

What the customer says happened.

Example:

> "I have paid UGX 400,000."

This is untrusted input.

### B. Actual Transaction Evidence

What the SleeklyBuilt administrator observes in the MTN/Airtel merchant account or authoritative merchant notification.

Example:

> MTN transaction
> UGX 400,000
> Payer: 077X XXX 123
> Registered name: JOHN DOE
> Reference: MM123456789
> 09 Sep 2026, 12:41

This is the financial evidence.

### C. Verified Payment

An authorized administrator has reviewed the actual transaction, the system has performed the matching analysis, and the administrator explicitly confirms that the transaction belongs to the relevant order/payment obligation.

Only this state is financially authoritative.

Therefore:

**CLAIM ≠ TRANSACTION ≠ VERIFIED PAYMENT**

This distinction must exist throughout the database, backend, frontend and audit system.

---

# 4. Customer Reference-Entry Rule

## ABSOLUTE RULE

**The customer must NEVER be asked to enter a mobile-money transaction reference.**

The customer must never be asked to:

* type a transaction reference
* paste a transaction reference
* upload a transaction-reference screenshot as a normal requirement
* manually provide a transaction ID
* copy a transaction ID from an SMS
* enter an SMS confirmation number

The transaction reference belongs to the **administrator verification process**.

The administrator obtains it from the actual MTN/Airtel merchant transaction record and enters it into the admin system.

This removes unnecessary customer friction and prevents the payment process from depending on customers accurately transcribing transaction data.

---

# 5. Current Business Reality

The current architecture is:

```text
CUSTOMER
   ↓
SLEEKLYBUILT CHECKOUT
   ↓
MTN / AIRTEL PAYMENT INSTRUCTIONS
   ↓
CUSTOMER PAYS
   ↓
MTN/AIRTEL MERCHANT SYSTEM
   ↓
MERCHANT SMS / ACCOUNT RECORD
   ↓
ADMINISTRATOR
   ↓
SLEEKLYBUILT ADMIN VERIFICATION
   ↓
MATCH ACTUAL TRANSACTION
   ↓
VERIFY PAYMENT
   ↓
RECEIPT
   ↓
CUSTOMER NOTIFICATION
   ↓
ORDER / PACKAGE ACTIVATION
```

The physical/mobile-money transaction currently exists outside the web application.

The SleeklyBuilt application therefore must not pretend that it can see a transaction that it has not actually received or been told about.

The administrator is the current bridge between:

```text
MTN/Airtel financial infrastructure
              ↓
       SleeklyBuilt system
```

This is intentional.

It is preferable to a fragile unofficial SMS-scraping system.

---

# 6. No Unofficial SMS Automation Requirement

The initial production system should **not depend on an Android phone listening for merchant SMS messages and forwarding them to the server.**

Such automation may be investigated in the future, but it must not become a foundational dependency.

The payment system must work reliably with:

**manual transaction observation + structured admin entry + system matching.**

Later, official MTN/Airtel APIs can replace the transaction-evidence collection step.

The rest of the payment architecture should remain intact.

---

# 7. Customer Identity, Payer Identity and Contact Identity

The system must never assume that these are the same person or phone number.

There are three distinct concepts.

## 7.1 Customer

The person/business purchasing the SleeklyBuilt service.

Example:

```text
Customer:
John Doe
```

## 7.2 Payer

The person whose mobile-money account actually sends the money.

Example:

```text
Payer:
John Doe
Phone:
077X XXX 123
```

or:

```text
Payer:
Jane Doe
Phone:
070X XXX 456
```

because someone else may pay on behalf of the customer.

## 7.3 Communication Contact

The phone number/email/WhatsApp destination SleeklyBuilt should use to communicate with the customer.

Example:

```text
Customer:
John Doe

Payment made by:
Jane Doe
070X XXX 456

Customer communication:
John's WhatsApp
075X XXX 888
```

These must remain separate.

---

# 8. Why This Separation Is Necessary

Consider:

Customer A submits:

```text
Payer:
077X XXX 123

Contact me on:
075X XXX 888
```

Another person could maliciously submit:

```text
Payer:
077X XXX 123

Contact me on:
070X XXX 999
```

The system must not conclude that the second person's contact number is associated with the payment simply because they claimed the same payer number.

The actual merchant transaction is authoritative.

The system should use:

```text
Actual transaction payer
        +
Actual transaction details
        +
Existing order/payment session
        +
Customer claim
        +
Amount
        +
Timing
        +
Other matching signals
```

to determine the correct relationship.

The customer's communication contact remains a separate customer attribute.

---

# 9. Core Domain Model

The payment architecture should contain at least the following concepts.

```text
Customer
 ├── Contacts
 └── Orders
       └── PaymentSessions
             ├── PaymentClaims
             └── PaymentTransactions
                    └── PaymentAllocations
                          └── Receipt
```

Supporting entities:

* Customer
* Contact
* Order
* Package / Service
* PaymentSession
* PaymentClaim
* PaymentTransaction
* PaymentAllocation
* PaymentVerification
* Receipt
* Notification
* AuditEvent

The exact database naming may adapt to the existing application architecture, but these domain concepts must not be lost.

---

# 10. Customer

A customer represents the commercial party purchasing from SleeklyBuilt.

Potential fields:

```text
id
name
business_name
email
primary_contact_id
created_at
updated_at
```

Customer information should be reused across future orders.

Customers should not repeatedly fill in information that already exists.

---

# 11. Contact

Contacts should be separated from the customer record.

Potential fields:

```text
id
customer_id
type
value
label
is_primary
is_verified
created_at
updated_at
```

Supported contact types may include:

* phone
* WhatsApp
* email

The system should support a preferred communication contact independently of the payer.

---

# 12. Order

The order represents the commercial obligation.

Example:

```text
Order:
SB-ORD-10482

Customer:
John Doe

Package:
Business Basic Website

Required:
UGX 400,000

Paid:
UGX 0

Balance:
UGX 400,000
```

Payment belongs fundamentally to an **order/payment obligation**, not directly to a person.

---

# 13. Package / Service

The package defines what the customer is buying.

Example:

```text
Business Basic Website
Price: UGX 400,000
```

The payment system must know:

* package/service
* required amount
* currency
* payment rules
* whether partial payment is allowed
* whether activation requires full payment

The payment verification process must therefore compare the actual transaction against the customer's actual commercial obligation.

---

# 14. Payment Session

A Payment Session represents a specific attempt to pay for an order.

Example:

```text
Payment Session:
PS-20260909-10482

Order:
SB-ORD-10482

Expected:
UGX 400,000

Provider:
MTN

Created:
09 Sep 2026
```

This prevents old payment attempts from being casually mixed with new orders.

A payment session may contain:

* expected amount
* provider
* expected payer
* customer
* order
* creation time
* expiration
* payment instructions
* current payment status

---

# 15. Payment Claim

When the customer presses:

> **I've completed payment**

the system creates a payment claim.

Example:

```text
Payment Claim
----------------
Order: SB-ORD-10482
Customer: John Doe
Provider selected: MTN
Claimed payer: 077X XXX 123
Communication contact: 075X XXX 888
Claim submitted: 12:43
```

The claim is **not payment confirmation**.

It means only:

> The customer says the payment has been made.

The system must preserve this distinction.

---

# 16. Customer Checkout Experience

The checkout should be mobile-first.

The customer should experience something approximately like:

```text
Business Basic Website

UGX 400,000

Payment method

○ MTN Mobile Money
○ Airtel Money

Who is paying?

● Me
○ Someone else

Payment contact

075X XXX 888
[Change]

[ Continue to Payment ]
```

If the customer already has a known payer number, the system should default intelligently to it.

Do not ask the same questions repeatedly.

---

# 17. Payer Selection

If the customer's existing phone number is expected to be the payer:

```text
Paying with:

077X XXX 123

✓ Use this number
```

If someone else will pay:

```text
Someone else is paying

Payer phone:
[ Enter number ]
```

Only ask for the additional information when necessary.

The customer's communication contact should remain separate.

---

# 18. Payment Instructions

After provider selection, show simple instructions.

Example:

```text
Pay UGX 400,000 using MTN Mobile Money.

Merchant:
SleeklyBuilt

Merchant Code:
XXXXXX

[ Pay / Open USSD ]

After completing the payment:

[ I've completed payment ]
```

Equivalent Airtel instructions should be shown for Airtel.

Where the device/browser supports a useful USSD/dial action, provide it.

Where it does not, provide an easy copy/action fallback.

The implementation must use verified current provider instructions and must not invent USSD syntax.

---

# 19. "I've Completed Payment"

This button is a **claim action**, not a payment action.

When clicked:

```text
Payment submitted

We've received your payment notification.

We'll verify the transaction and confirm your payment shortly.

You don't need to send us a transaction reference.
```

The system creates a PaymentClaim.

It must NOT:

* mark the order paid
* issue a receipt
* activate the package
* claim the transaction exists
* send a "payment successful" notification

---

# 20. Payment State Machine

The system should support a clear payment lifecycle.

Primary states:

```text
CREATED
    ↓
AWAITING_PAYMENT
    ↓
CUSTOMER_SUBMITTED
    ↓
AWAITING_VERIFICATION
    ↓
VERIFIED
    ↓
RECEIPTED
    ↓
ORDER_ACTIVATED
```

Exception states:

```text
EXPIRED
CANCELLED
NOT_FOUND
UNMATCHED
AMBIGUOUS
REJECTED
PARTIALLY_PAID
OVERPAID
REFUND_REQUIRED
```

The exact state names may be adapted to the existing codebase, but the semantic distinction must remain.

---

# 21. Admin Verification Is the Financial Authority

The administrator is responsible for checking the actual merchant transaction.

The admin must have a dedicated payment verification queue.

Example:

```text
PAYMENT VERIFICATION

#10482
John Doe
Business Basic Website
UGX 400,000

Provider: MTN
Expected payer: 077X XXX 123
Claimed: 12:43
Status: Awaiting Verification

[Review]
```

---

# 22. Admin Transaction Entry

When reviewing a claim, the administrator enters the **actual transaction information observed in the merchant system**.

The admin form should contain:

### Provider

```text
MTN
Airtel
```

Provider may be pre-detected where possible, but admin must be able to correct it.

### Transaction Reference

The actual merchant transaction reference.

Example:

```text
MM123456789
```

### Actual Payer Phone

The phone number that actually paid.

```text
077X XXX 123
```

### Registered Payer Name

The name shown by the mobile-money transaction.

```text
JOHN DOE
```

### Amount Paid

```text
UGX 400,000
```

### Transaction Date/Time

```text
09 Sep 2026
12:41
```

### Optional Evidence

Where appropriate:

* screenshot
* merchant SMS evidence
* administrator notes

The system must distinguish actual transaction data from customer-submitted information.

---

# 23. Provider Auto-Detection

The provider may sometimes be obvious from:

* the selected checkout provider
* merchant account being reviewed
* transaction format
* administrator workflow
* future API metadata

The system may pre-fill:

```text
Provider: MTN
```

or:

```text
Provider: Airtel
```

However, the admin must be able to correct the provider.

The final transaction record must explicitly store the provider.

---

# 24. The Matching Engine

Once the admin enters the actual transaction, the system should perform the matching analysis.

This is where the system connects:

```text
ACTUAL MONEY
      ↓
ACTUAL TRANSACTION
      ↓
POSSIBLE PAYMENT CLAIMS
      ↓
CUSTOMER
      ↓
ORDER
      ↓
PACKAGE
```

The system should not simply search for one matching phone number.

It should compare multiple signals.

---

# 25. Matching Signals

Potential matching signals include:

### Provider

Does the transaction provider correspond to the payment session?

```text
MTN = MTN
✓
```

### Amount

Does the actual amount satisfy the payment requirement?

```text
Expected: UGX 400,000
Actual:   UGX 400,000

✓
```

### Payer Phone

Does the actual payer correspond to the expected payer?

```text
Expected:
077X XXX 123

Actual:
077X XXX 123

✓
```

### Registered Payer Name

Does the actual registered name reasonably correspond to the known payer/customer information?

This is a supporting signal, not absolute identity proof.

### Timing

Does the transaction time fall within a sensible relationship to the customer's payment claim?

Example:

```text
Claim:       12:43
Transaction: 12:41

✓
```

### Payment Session

Was the transaction plausibly made for this active payment session?

### Order

Does the amount correspond to the customer's outstanding order?

### Package

Does the amount correspond to the required package?

### Payment History

Has this transaction or payer already been associated with another order?

### Competing Orders

Are there multiple open orders that could legitimately correspond to the transaction?

---

# 26. Matching Result

After entering transaction details, the administrator should see a clear analysis.

Example:

```text
TRANSACTION MATCH ANALYSIS

Actual Transaction
------------------
Provider: MTN                  ✓
Amount: UGX 400,000            ✓
Payer: 077X XXX 123            ✓
Name: JOHN DOE                 ✓
Time: 12:41                     ✓
Reference: MM123456789

Potential Order
---------------
Order: SB-ORD-10482
Customer: John Doe
Package: Business Basic
Required: UGX 400,000
Balance: UGX 400,000

MATCH SIGNALS
--------------
Provider                         ✓
Amount                           ✓
Payer phone                      ✓
Customer relationship            ✓
Payment timing                   ✓
Active payment session           ✓
Competing order                  None

MATCH RESULT
-------------
HIGH CONFIDENCE MATCH

[ CONFIRM PAYMENT ]
[ Reject / Not This Payment ]
```

This is the key mechanism that turns manual transaction entry into an intelligent reconciliation process.

---

# 27. The System Should Do the Matching — Not the Admin

The administrator should not have to manually search through customers and guess where a transaction belongs.

The system should automatically search the relevant records.

The admin provides the actual transaction evidence.

The system determines the possible matches.

The admin reviews the evidence and explicitly confirms.

Therefore:

```text
ADMIN ENTERS FACTS
        ↓
SYSTEM ANALYZES
        ↓
SYSTEM PROPOSES MATCH
        ↓
ADMIN REVIEWS
        ↓
ADMIN CONFIRMS
```

This keeps the process efficient without giving the software unsafe financial authority.

---

# 28. High-Confidence Match

A transaction can be presented as a strong match when multiple independent signals agree.

Example:

```text
MTN
UGX 400,000
077X XXX 123
JOHN DOE
12:41
Active order for UGX 400,000
Single matching payment claim
```

The system can show:

> **High-confidence match**

But even a high-confidence match should require explicit administrator confirmation.

The system must not silently convert a suggestion into a verified payment.

---

# 29. Ambiguous Match

If multiple orders could match:

```text
Actual transaction:
MTN
UGX 400,000
077X XXX 123
```

and the same customer/payer has:

```text
Order A — UGX 400,000
Order B — UGX 400,000
```

the system must not guess.

Show:

```text
AMBIGUOUS PAYMENT

2 possible matches found.

1. Order SB-10482
2. Order SB-10501

Administrator decision required.
```

Admin must choose the correct allocation or resolve the issue manually.

---

# 30. Unmatched Transaction

If the admin enters a real transaction but the system cannot identify the corresponding order:

```text
UNMATCHED TRANSACTION
```

The transaction should still be preserved.

It must not disappear.

It must not be falsely attached to the nearest customer.

It can remain in a reconciliation queue for later investigation.

---

# 31. Missing Transaction

If a customer claims payment but the administrator cannot find the transaction:

Do not tell the customer:

> "You didn't pay."

Instead:

```text
Payment verification pending

We received your payment submission, but the transaction has not yet been matched.

We'll continue reviewing it.
```

The admin can later update the record when the transaction becomes visible.

---

# 32. Wrong Amount

If:

```text
Expected: UGX 400,000
Actual:   UGX 300,000
```

the system should not mark the order fully paid.

It should show:

```text
PARTIAL PAYMENT

Required: UGX 400,000
Received: UGX 300,000
Remaining: UGX 100,000
```

If the business permits partial payment, the order remains partially paid.

If full payment is required before activation, activation does not occur.

---

# 33. Multiple Partial Payments

One order can have multiple verified transactions.

Example:

```text
Order:
UGX 400,000

Payment 1:
UGX 150,000 ✓

Payment 2:
UGX 250,000 ✓

Total:
UGX 400,000

Balance:
UGX 0
```

The system should calculate:

```text
Total Verified Payments
+
Allocations
=
Amount Paid

Amount Required - Amount Paid
=
Balance
```

Only the appropriate payment state should trigger activation.

---

# 34. Overpayment

If:

```text
Required: UGX 400,000
Actual:   UGX 450,000
```

the system must not silently pretend that the amount was exactly UGX 400,000.

Show:

```text
OVERPAYMENT

Required: UGX 400,000
Received: UGX 450,000
Excess:   UGX 50,000

Administrator review required.
```

The business can then determine the correct treatment.

---

# 35. Duplicate Transaction Protection

The system must prevent the same actual transaction from being verified twice.

Transaction references should have appropriate uniqueness/idempotency controls.

For example:

```text
Provider + Transaction Reference
```

should normally identify a unique transaction.

If the same transaction is entered again, the system should warn:

```text
Possible duplicate transaction

This transaction has already been recorded.
```

Do not create a second financial record accidentally.

---

# 36. Payment Allocation

A transaction and an order should not necessarily be the same database object.

Use a PaymentAllocation concept.

Example:

```text
Transaction:
MTN MM123456789
UGX 400,000

Allocation:
Order SB-10482
UGX 400,000
```

This makes future scenarios possible without corrupting the financial model.

For example:

* partial payment
* multiple transactions
* corrections
* multiple payments toward one order
* controlled allocation
* overpayments

---

# 37. Explicit Payment Verification

After reviewing the matching analysis, the administrator must explicitly confirm.

Example:

```text
TRANSACTION VERIFIED

Actual transaction:
MM123456789

Matched order:
SB-ORD-10482

Customer:
John Doe

Amount:
UGX 400,000

Package:
Business Basic Website

[ CONFIRM PAYMENT ]
```

Confirmation should require deliberate action.

The system then records:

```text
verified_by
verified_at
verification_id
verification_result
matching_details
```

---

# 38. Financial State Must Be Server-Controlled

The frontend must never be able to send:

```text
status = PAID
```

and cause a payment to become verified.

The backend must enforce:

```text
Customer claim
      ≠
Verified payment
```

Only an authorized server-side verification operation can create the authoritative verified-payment state.

---

# 39. Audit Trail

Every important payment event should be auditable.

Record:

```text
payment created
payment claim submitted
transaction entered
transaction edited
match calculated
verification reviewed
verification confirmed
verification rejected
payment allocated
receipt generated
notification sent
order activated
admin correction
reversal/refund event
```

Audit events should contain, where appropriate:

```text
actor
timestamp
action
entity
previous state
new state
metadata
```

Financial records must not be silently overwritten.

---

# 40. Admin Corrections

If an administrator enters an incorrect transaction:

Do not simply destroy the original evidence.

Instead:

```text
Original transaction entry
        ↓
Correction
        ↓
Audit event
```

The system should preserve an appropriate history of changes.

This is especially important for:

* transaction references
* payer phone
* amount
* provider
* verification status
* allocation
* receipt state

---

# 41. Receipt Generation

A receipt is generated only after payment is verified.

Never generate a receipt merely because the customer clicked:

> "I've completed payment."

The receipt must be based on verified financial information.

Example:

```text
SLEEKLYBUILT SOFTWARE TECHNOLOGIES

PAYMENT RECEIPT

Receipt:
SB-RCPT-10482

Customer:
John Doe

Service:
Business Basic Website

Amount Paid:
UGX 400,000

Provider:
MTN Mobile Money

Payer:
077X XXX XXX

Transaction:
MM123456789

Transaction Date:
09 Sep 2026

Verified:
09 Sep 2026

Status:
PAID
```

---

# 42. Receipt Number

Receipts should have unique SleeklyBuilt receipt numbers.

Example:

```text
SB-RCPT-10482
```

Receipt numbering must be generated server-side.

Receipt records should be linked to:

* customer
* order
* payment allocation(s)
* verified transaction(s)
* verification record

---

# 43. Receipt Must Reflect Actual Payment

The receipt should never blindly use the customer's claim.

If the customer claimed:

```text
UGX 400,000
```

but the verified transaction was:

```text
UGX 300,000
```

the receipt cannot say:

```text
UGX 400,000 PAID
```

The financial receipt must reflect verified data.

---

# 44. Customer Payment Status Page

After payment submission, the customer should receive a status page.

Example:

```text
PAYMENT STATUS

Business Basic Website
UGX 400,000

✓ Payment instructions provided
✓ Payment submitted
○ Merchant transaction verification
○ Payment confirmed
○ Receipt issued

Your payment is being verified.

You do not need to provide a transaction reference.
```

After verification:

```text
PAYMENT CONFIRMED ✓

We've received your UGX 400,000 payment via MTN Mobile Money.

Receipt:
SB-RCPT-10482

Your package is confirmed.
```

---

# 45. Notifications

Payment verification and communication routing should be separate concerns.

Possible notification channels:

* email
* WhatsApp
* SMS
* in-app notification

The payment engine should produce an event such as:

```text
PAYMENT_VERIFIED
```

The notification layer decides how to communicate it.

---

# 46. Communication Contact After Verification

Only after payment has been verified should the system use the stored customer communication contact for payment confirmation.

Example:

```text
Actual payer:
077X XXX 123

Customer:
John Doe

Communication:
075X XXX 888
```

The confirmation goes to:

```text
075X XXX 888
```

if that is the customer's designated communication contact.

The system must not replace the customer's contact with the payer's phone merely because the payer made the payment.

---

# 47. Example Successful Flow

### Step 1 — Customer

Customer selects:

```text
Business Basic Website
UGX 400,000
MTN
```

### Step 2 — System

Shows payment instructions.

### Step 3 — Customer

Pays UGX 400,000 to the SleeklyBuilt MTN merchant.

### Step 4 — Customer

Clicks:

```text
I've completed payment
```

System records:

```text
CUSTOMER_SUBMITTED
```

### Step 5 — Admin

Checks the actual merchant transaction.

Finds:

```text
MTN
MM123456789
077X XXX 123
JOHN DOE
UGX 400,000
12:41
```

### Step 6 — Admin enters transaction

The admin enters the actual details into SleeklyBuilt.

### Step 7 — System matches

System finds:

```text
Order:
SB-ORD-10482

Customer:
John Doe

Package:
Business Basic

Expected:
UGX 400,000

Payer:
077X XXX 123

Strong match
```

### Step 8 — Admin

Clicks:

```text
CONFIRM PAYMENT
```

### Step 9 — System

Creates verified payment.

### Step 10 — System

Generates:

```text
SB-RCPT-10482
```

### Step 11 — System

Marks the order paid and activates the relevant package according to business rules.

### Step 12 — System

Notifies the customer's designated communication contact.

---

# 48. Example Third-Party Payer Flow

Customer:

```text
John Doe
```

Payer:

```text
Jane Doe
070X XXX 456
```

Communication contact:

```text
John Doe
075X XXX 888
```

Actual merchant transaction:

```text
Airtel
070X XXX 456
JANE DOE
UGX 400,000
```

The system can match the transaction to John's order based on the payment session/order and other matching evidence.

It must not conclude:

```text
Customer = Jane Doe
```

Nor should it overwrite John's communication contact.

The financial record should preserve Jane as the actual payer.

---

# 49. Provider Abstraction

MTN and Airtel should exist behind a common payment-provider abstraction.

Conceptually:

```text
PaymentProvider
 ├── MTN
 └── Airtel
```

The common system should handle:

* payment sessions
* claims
* transaction records
* matching
* verification
* allocation
* receipts
* notifications
* reconciliation

Provider-specific logic should be isolated.

This prevents MTN-specific assumptions from spreading throughout the application.

---

# 50. Future API Integration

The architecture should anticipate eventual official payment APIs.

Current:

```text
MTN/Airtel
   ↓
Merchant account
   ↓
Admin observes transaction
   ↓
Admin enters transaction
```

Future:

```text
MTN/Airtel API
   ↓
SleeklyBuilt transaction ingestion
   ↓
Matching engine
   ↓
Admin review / appropriate automated verification
```

The important point is that **the transaction ingestion mechanism changes, not the whole payment architecture.**

The following should remain reusable:

* PaymentSession
* PaymentClaim
* PaymentTransaction
* PaymentAllocation
* Matching Engine
* Verification
* Receipt
* Notification
* Audit

---

# 51. Matching Engine Must Be Provider-Agnostic

The matching logic should work with both MTN and Airtel.

For example:

```text
provider
amount
payer_phone
payer_name
transaction_reference
transaction_time
payment_session
order
claim
```

Provider-specific adapters can normalize incoming data into the common transaction model.

---

# 52. Admin Verification Queue

The admin dashboard should provide a dedicated reconciliation workspace.

Possible sections:

```text
Payments

├── Awaiting Payment
├── Claims Awaiting Verification
├── Verified
├── Partial
├── Ambiguous
├── Unmatched
├── Overpaid
├── Rejected
└── Reconciliation History
```

The queue should prioritize unresolved financial actions.

---

# 53. Admin Verification Screen

The verification page should show both sides.

## Customer Claim

```text
Customer:
John Doe

Order:
SB-ORD-10482

Package:
Business Basic

Expected:
UGX 400,000

Provider selected:
MTN

Claimed payer:
077X XXX 123

Claim submitted:
12:43
```

## Actual Transaction

```text
Provider:
MTN

Reference:
MM123456789

Payer:
077X XXX 123

Registered name:
JOHN DOE

Amount:
UGX 400,000

Transaction time:
12:41
```

## Match Analysis

```text
Provider              ✓
Amount                ✓
Payer                 ✓
Name                  ✓
Timing                ✓
Order                 ✓
Competing matches     None
```

Then:

```text
HIGH CONFIDENCE MATCH

[ CONFIRM PAYMENT ]
[ MARK UNMATCHED ]
[ REJECT ]
```

---

# 54. Do Not Over-Automate the Final Decision

The system should automate:

* finding candidates
* comparing values
* detecting duplicates
* calculating balance
* identifying partial/overpayment
* identifying ambiguity
* preparing the verification decision

The administrator retains authority over the final financial confirmation.

This is the correct balance between automation and safety.

---

# 55. Customer Experience Principle

The customer should experience:

> **Pay → tell us you're done → wait → confirmed.**

Not:

> Pay → find SMS → copy reference → paste reference → upload screenshot → explain payment → enter phone → enter name → wait.

The second experience is unnecessarily painful.

SleeklyBuilt's system should absorb the complexity internally.

---

# 56. No Repetitive Customer Input

If the system already knows:

```text
Customer:
John Doe

Phone:
075X XXX 888

Email:
john@example.com
```

do not repeatedly ask for these.

Use the information already collected.

Provide:

```text
Contact:
075X XXX 888

[Change]
```

rather than asking the customer to type it again.

Only request new information when it is genuinely required.

---

# 57. Security Rules

Payment status must be server-controlled.

Customer input must be treated as untrusted.

Never trust:

```text
amount
paid status
verified status
transaction reference
provider
payer identity
```

when supplied by the client as authoritative financial evidence.

Customer-provided information is useful for matching, but not authoritative.

Actual transaction evidence comes from the merchant transaction record entered by the administrator or, later, an official provider API.

---

# 58. Authorization

Only authorized administrators should be able to:

* enter transaction evidence
* edit transaction evidence
* verify payments
* reject payments
* allocate transactions
* modify payment allocations
* issue corrections
* reverse financial states where permitted

Verification actions must be audited.

---

# 59. No Silent Financial Mutations

The system must not silently:

* change a verified amount
* change a payer
* move a payment between orders
* mark an order paid
* delete a transaction
* delete a receipt

Financial corrections should create traceable events.

---

# 60. Payment-to-Package Binding

The system must always know what the customer is actually paying for.

Example:

```text
Order:
SB-10482

Package:
Business Basic Website

Price:
UGX 400,000
```

When a payment is matched, the system must show the package/service.

This prevents a valid payment from being incorrectly interpreted as payment for another service.

---

# 61. Order Activation

Verification and activation should remain separate logical actions even if they happen immediately after each other.

Example:

```text
Payment:
VERIFIED

↓

Order:
PAID

↓

Package:
ACTIVATION ELIGIBLE

↓

Order:
ACTIVATED
```

The exact activation rule depends on the service.

For a service requiring full payment:

```text
Verified Paid >= Required Amount
```

may trigger activation.

For a deposit-based service:

```text
Verified Paid >= Required Deposit
```

may trigger the appropriate next stage.

---

# 62. Partial Payment Activation

The system must not hardcode:

```text
Any payment = activated
```

Instead, package/order rules should determine what happens.

For example:

```text
Deposit required:
UGX 100,000

Total:
UGX 400,000

Payment:
UGX 100,000

Result:
Deposit satisfied
Order can enter production queue
Balance remains UGX 300,000
```

---

# 63. Unmatched Payments Must Be Preserved

A real transaction that cannot currently be matched is still a real transaction.

Store it.

Example:

```text
Unmatched Transaction
---------------------
Provider: Airtel
Reference: AT123456
Payer: 070X XXX 456
Amount: UGX 400,000
Time: 13:02
```

It should enter:

```text
Reconciliation Queue
```

rather than being discarded.

---

# 64. Reconciliation

The system should eventually provide an administrator with a view of:

```text
Merchant transactions observed
        ↓
Matched
        ↓
Verified
        ↓
Allocated
        ↓
Unmatched
        ↓
Ambiguous
        ↓
Needs investigation
```

This creates an actual financial reconciliation layer rather than merely a checkout form.

---

# 65. Notifications Must Be Idempotent

If a payment is verified and the notification system retries, the customer should not receive ten confirmation messages.

Notification events should have appropriate identifiers/idempotency handling.

Example:

```text
PAYMENT_VERIFIED
payment_id = PAY-10482
```

The notification system can determine whether that event has already been successfully processed.

---

# 66. Receipt Notifications

After verification:

```text
Payment confirmed ✓

We've received your UGX 400,000 payment via MTN Mobile Money.

Receipt:
SB-RCPT-10482

Your Business Basic Website package is confirmed.
```

The exact channel depends on the available customer contact.

---

# 67. Failed Notifications

If email/SMS/WhatsApp delivery fails:

**Do not reverse the payment.**

The financial state remains:

```text
VERIFIED
```

Notification state is separate:

```text
Notification:
FAILED
```

The system can retry delivery later.

Payment verification must not depend on successful notification delivery.

---

# 68. Provider Failure vs Payment Failure

The system must distinguish:

```text
No transaction found
```

from:

```text
Provider temporarily unavailable
```

from:

```text
Customer did not pay
```

from:

```text
Payment exists but cannot yet be matched
```

These are different operational states.

Never collapse all of them into:

> Payment failed.

---

# 69. Expired Payment Sessions

Payment sessions should have appropriate lifecycle rules.

An old payment claim should not automatically attach to a new order simply because:

```text
same customer
same phone
same amount
```

If a session is expired, the system should treat it cautiously.

Late transactions can still be reviewed by an administrator, but automatic matching must account for session age.

---

# 70. Multiple Open Orders

If a customer has:

```text
Order A — UGX 400,000
Order B — UGX 400,000
Order C — UGX 150,000
```

and an actual:

```text
UGX 400,000
```

transaction arrives, the system must consider all relevant open obligations.

It must not blindly select the newest order.

Use:

* payment session
* claim
* timing
* payer
* package
* order status
* customer context
* competing matches

to determine the best candidate.

If ambiguity remains:

```text
AMBIGUOUS
```

---

# 71. One Payment Must Not Accidentally Pay Multiple Orders

A single transaction should not automatically be allocated to multiple unrelated orders.

The system must enforce allocation rules.

Example:

```text
Transaction:
UGX 400,000

Order A:
UGX 400,000

Order B:
UGX 400,000
```

The transaction cannot become:

```text
Order A = PAID
Order B = PAID
```

from one transaction.

---

# 72. Multiple Payments Can Pay One Order

This is explicitly supported.

```text
Transaction 1:
UGX 100,000

Transaction 2:
UGX 150,000

Transaction 3:
UGX 150,000

Order:
UGX 400,000
```

Result:

```text
Paid:
UGX 400,000

Balance:
UGX 0
```

Each transaction remains individually traceable.

---

# 73. Evidence Model

The system should distinguish:

### Customer claim evidence

```text
Customer says:
"I paid."
```

from:

### Merchant transaction evidence

```text
Provider
Reference
Payer
Registered name
Amount
Date/time
```

from:

### Verification decision

```text
Admin:
Verified
```

This three-layer model is fundamental.

---

# 74. Suggested Conceptual Data Model

```text
CUSTOMER
    |
    +---- CONTACT
    |
    +---- ORDER
             |
             +---- PACKAGE / SERVICE
             |
             +---- PAYMENT_SESSION
                      |
                      +---- PAYMENT_CLAIM
                      |
                      +---- PAYMENT_ALLOCATION
                                  |
                                  +---- PAYMENT_TRANSACTION
                                  |
                                  +---- PAYMENT_VERIFICATION
                                             |
                                             +---- RECEIPT

NOTIFICATION
AUDIT_EVENT
```

A transaction should be independently identifiable.

An allocation links money to an order.

A verification records the decision that the transaction is valid for that allocation/order.

A receipt represents the customer-facing financial record.

---

# 75. Suggested PaymentTransaction Fields

Conceptually:

```text
id
provider
transaction_reference
actual_payer_phone
actual_payer_name
amount
currency
transaction_at
merchant_context
evidence_reference
notes
created_at
updated_at
```

The exact schema should conform to the existing application's conventions.

---

# 76. Suggested PaymentClaim Fields

Conceptually:

```text
id
payment_session_id
customer_id
order_id
claimed_payer_phone
communication_contact_id
submitted_at
status
metadata
```

The transaction reference does **not** belong here as customer input.

---

# 77. Suggested PaymentVerification Fields

Conceptually:

```text
id
payment_transaction_id
order_id
result
confidence
verified_by
verified_at
matching_summary
notes
```

This is where the explicit administrator decision is recorded.

---

# 78. Suggested PaymentAllocation Fields

Conceptually:

```text
id
payment_transaction_id
order_id
allocated_amount
allocated_at
allocated_by
```

This permits proper reconciliation.

---

# 79. Suggested Receipt Fields

Conceptually:

```text
id
receipt_number
customer_id
order_id
amount
currency
payment_ids
issued_at
status
```

---

# 80. Audit Event Fields

Conceptually:

```text
id
actor_id
action
entity_type
entity_id
timestamp
previous_state
new_state
metadata
```

---

# 81. What the Customer Knows vs What the Admin Knows

### Customer knows:

* package
* amount
* provider
* payment instructions
* payment submitted
* verification status
* receipt

### Customer does NOT need to know:

* internal matching score
* internal reconciliation queue
* competing candidate orders
* internal audit identifiers
* administrator notes
* internal transaction investigation logic

### Admin sees:

* customer claim
* order
* package
* expected amount
* actual transaction
* payer
* registered name
* reference
* timing
* candidate matches
* conflicts
* verification history
* allocation
* receipt state

---

# 82. Customer UX North Star

The experience should feel like:

```text
1. Choose service
2. Choose MTN/Airtel
3. Pay
4. Tap "I've completed payment"
5. Done
```

The customer should never be turned into a payment reconciliation clerk.

SleeklyBuilt handles the complexity.

---

# 83. Admin UX North Star

The administrator experience should feel like:

```text
1. Open payment queue
2. Open claim
3. Enter actual merchant transaction
4. System finds matching client/order
5. Review evidence
6. Confirm
7. Done
```

The administrator should not manually hunt through the entire CRM.

---

# 84. What the System Must Never Do

Never:

* mark paid from a customer button
* trust customer-entered transaction references
* ask customers for transaction references
* automatically attach ambiguous transactions
* overwrite customer contact with payer information
* treat payer and customer as automatically identical
* generate a receipt before verification
* activate a package before required payment is satisfied
* silently delete transaction records
* silently modify verified financial records
* use notification success as proof of payment
* use a payment claim as proof of payment
* assume the latest order is the correct order
* assume matching phone number alone proves ownership
* discard unmatched real transactions
* build production payment logic around unofficial SMS scraping

---

# 85. What the System Should Automate

Automate aggressively where it is safe.

The system should automatically:

* remember customer information
* reuse customer contacts
* create payment sessions
* create payment claims
* calculate expected amount
* display provider instructions
* find candidate orders
* compare transaction details
* calculate match confidence
* identify conflicting orders
* detect duplicate transactions
* calculate partial balances
* identify overpayments
* prepare the verification decision
* generate receipts after verification
* update order/payment balances
* trigger package activation according to rules
* send notifications
* maintain audit records

---

# 86. What Should Remain Human-Controlled

Keep explicit administrator authority over:

* confirming a transaction
* resolving ambiguous matches
* allocating unusual payments
* handling overpayments
* handling unmatched transactions
* correcting transaction information
* exceptional reversals/refunds
* unusual third-party payment situations

This creates a safe human-in-the-loop financial workflow.

---

# 87. Future Automation Boundary

If official MTN/Airtel APIs become available, the new architecture should be:

```text
Provider API
      ↓
Transaction Ingestion
      ↓
Normalization
      ↓
Matching Engine
      ↓
Verification Policy
      ↓
Admin Review where required
      ↓
Verified Payment
```

The existing customer checkout should not need to be rebuilt.

---

# 88. Production Quality Requirements

This is a real financial workflow.

It must not be implemented as:

* mock payment success
* demo transaction generation
* fake API responses
* hardcoded payment statuses
* frontend-only state
* TODO-based verification
* placeholder matching
* fake receipts
* simulated SMS confirmation

All payment state must be backed by real persistent data and server-side rules.

---

# 89. Implementation Architecture Principle

The system should be modular:

```text
Checkout
   ↓
Payment Session
   ↓
Payment Claim
   ↓
Transaction Ingestion
   ↓
Matching Engine
   ↓
Verification
   ↓
Allocation
   ↓
Receipt
   ↓
Notification
   ↓
Order Activation
```

Each stage should have a clear responsibility.

Do not mix:

```text
payment verification
customer notification
order activation
```

into one giant function.

---

# 90. Implementation Chunks

## Chunk 1 — Domain and Database

Implement:

* Customer/contact separation
* Orders
* Packages/services
* Payment sessions
* Payment claims
* Payment transactions
* Payment allocations
* Payment verification
* Receipts
* Notifications
* Audit events
* statuses/state transitions

No UI shortcuts that bypass the domain model.

---

## Chunk 2 — Customer Checkout

Implement:

* service/package selection
* amount display
* MTN/Airtel selection
* payer selection
* remembered customer data
* communication contact selection
* payment instructions
* USSD/dial/copy actions where appropriate
* "I've completed payment"
* payment status page

Absolutely no transaction-reference input.

---

## Chunk 3 — Admin Verification

Implement:

* verification queue
* customer claim view
* order/package context
* actual transaction entry
* provider selection/auto-detection
* transaction reference entry
* actual payer phone
* registered payer name
* amount
* transaction date/time
* evidence/notes
* matching engine
* candidate matching
* confidence result
* ambiguity handling
* unmatched handling
* explicit confirmation
* audit trail

---

## Chunk 4 — Receipt and Notification

Implement:

* receipt generation
* unique receipt numbers
* payment confirmation
* balance updates
* order state updates
* package activation rules
* customer notification
* notification retries
* customer payment status updates

---

## Chunk 5 — Edge Cases

Implement:

* partial payments
* multiple payments
* overpayments
* duplicate transactions
* duplicate claims
* ambiguous matches
* unmatched transactions
* expired payment sessions
* late transactions
* wrong provider
* wrong amount
* third-party payer
* failed notifications
* administrative corrections
* audit history

---

## Chunk 6 — Provider Abstraction

Ensure MTN and Airtel-specific implementation is isolated behind common interfaces.

The core payment engine must not be hardcoded around one provider.

---

## Chunk 7 — Future API Readiness

Create clean boundaries for future:

```text
MTN API adapter
Airtel API adapter
Transaction ingestion
Webhook/event ingestion
Automated transaction reconciliation
```

Do not implement unofficial automation simply to fill the current gap.

---

# 91. Testing Requirements

Tests must cover at minimum:

### Successful payment

```text
Claim
→ actual transaction
→ correct match
→ admin confirmation
→ verified
→ receipt
→ activation
```

### Customer never enters reference

Verify the customer UI/API does not require transaction reference.

### Third-party payer

Verify payer and customer remain separate.

### Wrong communication number

Verify payment verification does not replace the customer's communication contact.

### Same payer, multiple orders

Verify ambiguity is detected.

### Partial payment

Verify balance remains correct.

### Multiple payments

Verify cumulative allocation.

### Overpayment

Verify review state.

### Duplicate transaction

Verify duplicate protection.

### Unmatched transaction

Verify transaction is preserved.

### Missing transaction

Verify customer is not falsely told payment failed.

### Unauthorized verification

Verify non-admin users cannot verify payments.

### Client-side manipulation

Verify changing payment status in the browser cannot create a verified payment.

### Receipt integrity

Verify receipts are generated only from verified transactions.

### Notification failure

Verify payment remains verified even if notification fails.

---

# 92. Final Payment State Authority

The application must establish an unambiguous hierarchy:

```text
Customer claim
       ↓
Untrusted assertion

Actual merchant transaction
       ↓
Financial evidence

Administrator verification
       ↓
Authoritative application decision

Receipt
       ↓
Customer-facing financial record
```

This hierarchy should be reflected in both the code and database.

---

# 93. Final North-Star Rule

> **SleeklyBuilt must never infer that a customer has paid from a customer claim. Payment becomes financially authoritative only when an actual merchant transaction has been recorded, matched to the correct order/payment obligation, reviewed, and explicitly verified by an authorized administrator.**

---

# 94. Final Product Definition

The finished product is:

> **A polished mobile-money checkout and payment-reconciliation system for SleeklyBuilt that lets customers pay through MTN or Airtel with minimal friction, submit a payment claim without ever entering a transaction reference, and receive trustworthy confirmation and receipts only after the SleeklyBuilt administrator records the actual merchant transaction, the system matches it to the correct customer/order/package, and the administrator explicitly verifies the payment.**

The system should feel simple to the customer while performing sophisticated reconciliation internally.

```text
CUSTOMER EXPERIENCE

Choose service
      ↓
Choose MTN/Airtel
      ↓
Pay
      ↓
I've completed payment
      ↓
Wait
      ↓
Payment confirmed
      ↓
Receipt
```

while internally:

```text
CUSTOMER CLAIM
      ↓
PAYMENT SESSION
      ↓
ADMIN ENTERS ACTUAL TRANSACTION
      ↓
MATCHING ENGINE
      ↓
CUSTOMER / PAYER / ORDER / PACKAGE ANALYSIS
      ↓
MATCH CONFIDENCE
      ↓
AMBIGUITY / EXCEPTION DETECTION
      ↓
ADMIN EXPLICIT VERIFICATION
      ↓
PAYMENT ALLOCATION
      ↓
BALANCE CALCULATION
      ↓
RECEIPT
      ↓
ORDER ACTIVATION
      ↓
CUSTOMER NOTIFICATION
      ↓
AUDIT TRAIL
```

This is the complete payment architecture to build around the current SleeklyBuilt MTN/Airtel merchant setup.
