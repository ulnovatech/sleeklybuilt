# Checkout Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Ecommerce Component, Ecommerce Intelligence, Forms System, Feedback System, Mobile First, Accessibility Intelligence  
**Gated By:** Security Review

---

# Purpose

The Checkout Pattern defines the complete solution for converting an intention to buy into a completed order.

Checkout is the only screen in a commerce product where every additional element costs money.

The user has already decided. Everything after that decision is friction, doubt, or reassurance, and the interface must remove the first two while supplying the third.

A checkout succeeds when a first-time buyer on a phone, on a poor connection, with a card that might be declined, ends up with an order they understand or a clear reason why they do not.

---

# When To Use

Use this pattern when:

- money changes hands for goods or services
- a total must be assembled from items, delivery, tax, and discounts
- payment details must be collected securely
- an order record is created at the end
- fulfilment depends on address or contact details

---

# When Not To Use

Do not use this pattern when:

- the resource is time-bound and capacity-limited — use the Booking Pattern for slot selection, then this pattern for payment
- the transaction is a recurring subscription change — use a plan-change flow with proration display
- the item is free — collect only what fulfilment needs, never a payment step
- the purchase is a quote requiring human approval — use a request flow with status
- the amount is unknown until after delivery — use authorisation plus a later capture flow, with the pending amount stated

The most common product mistake is copying a multi-step checkout for a single-item digital purchase. If there is nothing to deliver and nothing to choose, one screen is the correct answer.

---

# User Goal

The primary goal is always one of four:

```
Buy this, now, with the least effort

↓

Confirm the total before I commit

↓

Know when and how it arrives

↓

Fix a payment problem without starting again
```

The second goal is the most underserved. Unexpected totals at the final step are the largest single source of abandonment that design can control.

Show the full total, including delivery and tax, as early as it can be computed.

---

# User Journey

```
Decides to buy

↓

Reviews what is in the cart

↓

Chooses how to receive it

↓

Sees the true total

↓

Enters payment

↓

Confirms

↓

Receives proof and expectations

↓

Tracks or receives the order

↓

Returns to buy again, faster
```

The last step is what checkout design is actually for.

A checkout that stores nothing forces a returning customer through the identical eight minutes, and the second purchase never happens on a phone.

---

# UX Flow

## Entry

The user arrives from:

- the cart, with several items and no urgency
- a product page buy-now action, with one item and high urgency
- a saved cart email, resuming an abandoned attempt
- a payment retry link, after a decline

Buy-now must skip the cart review step entirely. Forcing a single-item buyer through a cart page adds a step to the highest-intent path in the product.

---

## Review Cart

```
Items with images, variants, quantities

↓

Line prices and any per-item discount

↓

Editable quantity and removal

↓

Subtotal, with delivery and tax stated as pending if not yet known
```

Rules:

- Show the variant chosen, not only the product name. "Blue, Large" prevents the most common return reason.
- Removal is undoable for ten seconds. Accidental removal at this stage is expensive.
- Stock changes are surfaced here, before the user invests any effort.
- Never hide the total behind "calculated at next step" when it can be computed now.

---

## Identify

Ask for contact before address, because contact is what makes recovery possible.

```
Email

↓

Offer to continue as guest, prominently

↓

Offer sign in for saved details, equally prominently
```

Rules:

- Guest checkout is the default path, not a link in small text. Requiring account creation to buy is the second largest controllable cause of abandonment.
- If the email matches an existing account, say so and offer sign-in without blocking the guest path.
- Account creation is offered after the order is placed, when the user has a reason: tracking and reordering.

---

## Deliver

```
Address, with autocomplete

↓

Available delivery methods with real dates and real prices

↓

Selected method reflected in the total immediately
```

Rules:

- Delivery options show a date, not a duration. "Arrives Tue 10 March" beats "3–5 business days" because the user does not want to do arithmetic.
- Address autocomplete reduces the largest source of failed deliveries. A manual entry path must always remain available.
- Digital-only orders skip this stage entirely; never show an address form for a downloadable product.

---

## Pay

```
Express wallets first

↓

Card, as the default explicit method

↓

Alternative local methods where relevant

↓

Billing address, defaulted to the delivery address
```

Rules:

- Express payment appears at the top of the payment step and, where supported, at the cart. It removes every field at once.
- Card fields use a single formatted number input, expiry, and security code. Nothing else.
- Card type is detected and displayed from the number; never ask the user to select it.
- Never require the security code to be entered twice, and never disable paste.

---

## Confirm

Review is the last honest moment.

```
Items · Delivery method and date · Address · Payment method · Full total breakdown · Terms
```

Every line must be editable from here without losing anything else.

The final action names the outcome and the amount: "Pay €84.50". Never "Submit" or "Continue".

---

## Recover

The failure path is part of the pattern, not an exception to it.

```
Payment declined

↓

Order preserved, cart intact

↓

Reason stated in useful terms

↓

Alternative method offered

↓

Retry in place
```

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ← Checkout               │
│ ● Contact ○ Delivery ○ Pay│
├──────────────────────────┤
│ ORDER SUMMARY        ▼   │
│ 3 items · €84.50         │
│ tap to expand            │
├──────────────────────────┤
│ Contact                  │
│ Email                    │
│ ┌──────────────────────┐ │
│ │ a@example.com        │ │
│ └──────────────────────┘ │
│ We send your receipt and │
│ tracking here.           │
│                          │
│ ☐ Text me delivery       │
│   updates                │
├──────────────────────────┤
│ Delivery address         │
│ ┌──────────────────────┐ │
│ │ Start typing…        │ │
│ └──────────────────────┘ │
│ Enter address manually   │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Continue to delivery │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ 🔒 Secure · Returns 30d  │
└──────────────────────────┘
```

Mobile rules:

- One stage per screen with a visible three-step progress indicator. More than three steps reads as a long form.
- The order summary is collapsed but its total is always visible in the collapsed header. The total must never require expansion to read.
- The primary action is full-width and sits above the keyboard fold when the last field is focused.
- Correct input types throughout: email, tel, and numeric for card and postal fields.
- Autofill tokens on every field so platform autofill completes address and card in one tap.
- Express wallet buttons appear at the top of the first step, because they end the flow immediately.
- Trust signals are a single quiet line, not a row of badges.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Checkout        ● Contact ○ Delivery ○ Pay │
├─────────────────────────┬──────────────────┤
│ Contact                 │ ORDER SUMMARY    │
│ Email [             ]   │ ┌──┐ Linen shirt │
│                         │ │  │ Blue · L ×1 │
│ Delivery address        │ └──┘      €45.00 │
│ [                    ]  │ ┌──┐ Cotton socks│
│ City   [            ]   │ │  │ Grey ×2     │
│ Postcode [ ]  Country ▾ │ └──┘      €18.00 │
│                         │                  │
│ [ Continue to delivery ]│ Subtotal  €63.00 │
│                         │ Delivery   €6.50 │
│                         │ Tax       €15.00 │
│                         │ ───────────────  │
│                         │ Total     €84.50 │
└─────────────────────────┴──────────────────┘
```

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Store                                    🔒 Secure checkout  │
├─────────────────────────────────────┬────────────────────────┤
│ ● Contact  ● Delivery  ○ Payment    │ ORDER SUMMARY          │
│                                     │                        │
│ Contact                    Edit     │ ┌──┐ Linen shirt       │
│ a@example.com                       │ │  │ Blue · L      ×1  │
│                                     │ └──┘         €45.00    │
│ Deliver to                 Edit     │ ┌──┐ Cotton socks      │
│ 12 Riverside Drive, Nairobi         │ │  │ Grey          ×2  │
│                                     │ └──┘         €18.00    │
│ Delivery method                     │                        │
│ ● Standard · arrives Tue 10 Mar     │ Discount SPRING10      │
│   €6.50                             │              −€6.30    │
│ ○ Express · arrives Fri 6 Mar       │ Subtotal     €56.70    │
│   €14.00                            │ Delivery      €6.50    │
│                                     │ Tax          €15.00    │
│ Payment                             │ ──────────────────     │
│ [ Apple Pay ]  [ Google Pay ]       │ Total        €84.50    │
│ ───────────── or ────────────────   │                        │
│ Card number [                  ] 💳 │ 30-day returns         │
│ Expiry [    ]  CVC [   ]            │ Free returns on all    │
│ ☑ Billing address same as delivery  │ orders                 │
│                                     │                        │
│ [           Pay €84.50           ]  │                        │
└─────────────────────────────────────┴────────────────────────┘
```

Desktop rules:

- Two columns: the form on the left, a persistent expanded order summary on the right. The total never leaves the screen.
- Completed stages collapse into one editable line each. Accordion, never separate pages.
- Site navigation is removed. Checkout has exactly one exit, forward, plus a route back to the cart.
- Never introduce upsells beside the payment fields.

---

# Component Hierarchy

```
CheckoutPage
├── CheckoutHeader
│   ├── BrandMark
│   ├── SecurityIndicator
│   └── BackToCartLink
├── StepIndicator
├── OrderSummaryPanel
│   ├── CollapsedHeader           mobile, total always visible
│   ├── LineItem ×n
│   │   ├── Thumbnail
│   │   ├── Title
│   │   ├── VariantLabel
│   │   ├── QuantityStepper
│   │   ├── LinePrice
│   │   └── RemoveAction
│   ├── PromoCodeField
│   ├── TotalsBreakdown
│   │   ├── SubtotalRow
│   │   ├── DiscountRow
│   │   ├── DeliveryRow
│   │   ├── TaxRow
│   │   └── TotalRow
│   └── ReassurancePanel
├── ContactStage
│   ├── EmailField
│   ├── GuestContinueAction
│   ├── SignInAction
│   ├── SmsUpdatesToggle
│   └── ExistingAccountNotice
├── DeliveryStage
│   ├── AddressAutocomplete
│   ├── ManualAddressFields
│   ├── SavedAddressList
│   ├── DeliveryMethodOption ×n
│   │   ├── MethodName
│   │   ├── ArrivalDate
│   │   └── MethodPrice
│   └── DeliveryNotesField
├── PaymentStage
│   ├── ExpressWalletGroup
│   ├── PaymentMethodOption ×n
│   ├── CardFieldGroup
│   │   ├── CardNumberField
│   │   ├── ExpiryField
│   │   ├── SecurityCodeField
│   │   └── CardBrandIndicator
│   ├── BillingAddressToggle
│   ├── SaveCardToggle
│   └── FieldError ×n
├── ReviewStage
│   ├── StageSummary ×3          each editable
│   ├── TermsAcknowledgement
│   ├── FormError
│   └── PayAction
└── ConfirmationScreen
    ├── OrderReference
    ├── ArrivalExpectation
    ├── ReceiptDestination
    ├── OrderItems
    ├── TrackAction
    ├── CreateAccountOffer
    └── SupportRoute

PaymentFailureRegion
├── DeclineExplanation
├── AlternativeMethodList
├── RetryAction
└── SupportRoute
```

Reuse rules:

- `TotalsBreakdown` is one component rendered identically in cart, checkout, review, confirmation, and receipt. Two implementations produce two totals.
- Address fields are one component used for delivery and billing, so validation and autocomplete behave identically.
- The order summary is the same component collapsed on mobile and expanded on desktop, not two components.

---

# Interaction Flow

Every interaction resolves:

```
Action

↓

Immediate feedback

↓

Result

↓

The user knows the total and what happens next
```

## Changing Quantity

1. The stepper updates immediately.
2. The line price and every total enter a pending style with the previous values still legible.
3. Server-recalculated totals replace them within the same layout, no shift.
4. If stock is insufficient, the quantity snaps back to the available amount and states it: "Only 2 left. Quantity set to 2."

Never allow a quantity the warehouse cannot honour to reach the payment step.

## Applying A Discount Code

1. The field accepts input case-insensitively and trims whitespace.
2. On submit, the field shows a pending state; totals do not flicker.
3. On success, the discount appears as its own labeled line with the code named, and the saving is stated.
4. On failure, the message says which condition failed.

```
SPRING10 does not apply to sale items.
Your order contains 1 sale item.

[ Remove sale item ]  [ Try another code ]
```

"Invalid code" is never sufficient. The user knows the code exists; they need to know why it did not work here.

## Selecting A Delivery Method

1. Selection is immediate and the total updates in the same interaction.
2. The arrival date is recalculated and restated, not left showing the previous method's date.
3. If a method becomes unavailable for the entered address, it is removed and the removal is explained once.

## Entering Card Details

1. The number field formats in groups as the user types and detects the brand, showing it inline.
2. Focus advances automatically from a complete number to expiry, and from complete expiry to the security code, but backspace always returns.
3. Validation of format happens on blur. Validity of the card is decided by the processor, never guessed at client side beyond a checksum.
4. Paste is supported in every field, including the security code.
5. The security code has a help affordance explaining where to find it, including the front-of-card case.

## Placing The Order

1. The pay action shows its amount and, on press, becomes "Paying…" with a spinner and cannot be pressed twice.
2. The request carries an idempotency key so a network retry can never charge twice.
3. All fields become read-only rather than disabled.
4. Beyond five seconds add: "Still processing. Do not close this page or press back."
5. On success, route to confirmation and clear the cart only then.

## Payment Declined

This is the defining failure of the pattern.

```
┌──────────────────────────────────────────┐
│ ⚠ Your card was declined                 │
│                                          │
│   Your bank declined the payment. You    │
│   have not been charged and your order   │
│   is still here.                         │
│                                          │
│   Most declines are resolved by using a  │
│   different card or contacting your bank.│
│                                          │
│   [ Try a different card ]               │
│   [ Pay with Apple Pay ]                 │
│   Reference: PAY-9042                    │
└──────────────────────────────────────────┘
```

Rules:

- Never lose the cart, the address, or the delivery choice.
- Clear only the card fields; keep everything else.
- State plainly that no charge occurred, because the user's first fear is a double charge.
- Offer at least one alternative method as a single action.
- Move focus to the failure region and announce it assertively.
- Never expose raw processor codes. Translate them into the user's next action.

## 3-D Secure Or Bank Authentication

1. Before redirecting or opening the challenge, state what is about to happen: "Your bank needs to confirm this payment."
2. The challenge opens in a modal frame over the checkout, keeping the order context visible where the provider permits it.
3. If the challenge window is closed or times out, return to the payment step with everything intact and state that the payment was not completed.
4. Never leave the user on a blank screen after a bank redirect. The return path is designed, not inherited.

## Item Sold Out During Checkout

```
┌──────────────────────────────────────────┐
│ ⚠ Linen shirt (Blue, L) just sold out    │
│                                          │
│   It has been removed and your total is  │
│   now €39.50. Nothing has been charged.  │
│                                          │
│   In stock: Blue, M · Grey, L            │
│                                          │
│   [ Swap to Blue, M ]  [ Continue ]      │
└──────────────────────────────────────────┘
```

Recalculate before charging, never after. A charge for an unfulfillable item becomes a refund and a complaint.

---

# States

## Loading — First Visit

```
Step indicator   → renders immediately
Order summary    → line skeletons matching item count from the cart
Totals           → subtotal from cached cart, delivery and tax marked pending
Contact fields   → rendered and focusable immediately
Express wallets  → button-shaped skeletons until availability resolves
```

Fields are interactive before wallet availability resolves, so a user with no wallet never waits.

If wallet availability cannot be determined within two seconds, hide the wallet group rather than holding the page.

---

## Loading — Recalculating Totals

Triggered by quantity, address, discount, or delivery method changes.

- Keep previous totals visible at 60% opacity with a thin progress line above the total row.
- Never blank a price. A blank total during recalculation reads as an error and stalls the purchase.
- Disable the pay action while totals are pending, with the reason available: "Updating your total."
- Cancel superseded calculations so an earlier response cannot restore a stale total.

---

## Loading — Submitting Payment

- Pay action becomes "Paying…" with a spinner; label retains the amount in its accessible name.
- Fields read-only, express wallets disabled.
- A non-dismissible inline notice states that the page must not be closed.
- No full-screen overlay that hides the order context.

---

## Empty — Cart Is Empty

Reachable by direct navigation, by session expiry, or after an order.

```
┌──────────────────────────────────────────┐
│              [illustration]              │
│                                          │
│  Your cart is empty                      │
│                                          │
│  Anything you add is saved here for 30   │
│  days, even if you close the tab.        │
│                                          │
│  [ Continue shopping ]                   │
│  View your last order                    │
└──────────────────────────────────────────┘
```

Never render a checkout form with a zero total. It reads as broken and the user cannot tell whether their order went through.

---

## Empty — No Delivery Options For This Address

Different from an empty cart and far more frustrating.

```
┌──────────────────────────────────────────┐
│ We do not deliver to this postcode yet   │
│                                          │
│ Nothing in your cart ships to 90210.     │
│                                          │
│ [ Try a different address ]              │
│ [ Collect in store instead ]             │
│ Tell me when you ship here               │
└──────────────────────────────────────────┘
```

Name the constraint. If only one item is the problem, say which item.

---

## Error — Field Level

```
Card number
┌──────────────────────────────┐
│ 4242 4242 4242 42            │
└──────────────────────────────┘
⚠ This card number is incomplete.
```

Rules:

- Validate on blur; never mark a field red while the user is still typing it.
- Once shown, clear the message the moment the value becomes valid.
- Reserve the message space so no layout shift occurs.
- Never place an error message where the on-screen keyboard will cover it; scroll the field and its message into view together.

---

## Error — Submission Blocked

When the form cannot be submitted, summarise and route.

```
┌──────────────────────────────────────────┐
│ ⚠ 2 details need attention               │
│   · Card expiry is in the past           │
│   · Postcode does not match the city     │
└──────────────────────────────────────────┘
```

Each line is a link that moves focus to the field. The summary receives focus and is announced assertively.

---

## Error — Payment System Unreachable

Distinct from a decline, and the distinction matters enormously.

```
┌──────────────────────────────────────────┐
│ ⚠ We could not reach the payment service │
│                                          │
│   Your card was not charged and your     │
│   order was not placed.                  │
│                                          │
│   [ Try again ]                          │
│   Reference: PAY-9051                    │
└──────────────────────────────────────────┘
```

## Error — Uncertain Outcome

The hardest state: the request timed out and the outcome is unknown.

```
┌──────────────────────────────────────────┐
│ We are confirming your payment           │
│                                          │
│ Do not pay again. We are checking with   │
│ your bank and will email you within a    │
│ few minutes either way.                  │
│                                          │
│ Reference: PAY-9058                      │
│ [ Check status ]                          │
└──────────────────────────────────────────┘
```

This state must exist. Without it, the user retries and is charged twice, which is why the idempotency key is mandatory.

---

## Partial / Stale Data

When tax or delivery cost cannot be finalised at the time of display:

```
Tax  calculated at payment
```

When prices changed since the item was added:

```
Linen shirt is now €48.00, previously €45.00.
[ Keep ]  [ Remove ]
```

Never silently change a price the user has already seen. Silent increases read as deception even when they are routine.

---

## Success

```
┌──────────────────────────────────────────┐
│ ✓ Order confirmed                        │
│                                          │
│ Order ORD-10482                          │
│ Arrives Tuesday 10 March                 │
│ Receipt sent to a@example.com            │
│                                          │
│ 2 items · €84.50 paid with Visa ••42     │
│ Delivering to 12 Riverside Drive, Nairobi│
│                                          │
│ [ Track this order ]                     │
│                                          │
│ Save your details for next time?         │
│ [ Create an account ]                    │
│                                          │
│ Changed your mind? You can cancel free   │
│ within 1 hour.  Contact support          │
└──────────────────────────────────────────┘
```

Required: order reference, arrival expectation, where the receipt went, amount and masked payment method, destination, tracking route, and the cancellation window.

Account creation is offered here, after the purchase, where it has an obvious benefit.

---

## Permission-Limited

Age-restricted or region-restricted items must be caught before payment.

```
This item cannot be delivered to your region.

[ Remove item and continue ]  [ Change address ]
```

Never take a payment for an order that fulfilment will reject.

---

# Mobile Behavior

- Touch targets minimum 44×44 including quantity steppers and remove actions, with 8px separation between adjacent destructive and non-destructive controls.
- One stage per screen, three stages maximum, with back preserving every entered value.
- The order total is visible in the collapsed summary header at all times, without expansion.
- Input types and autofill tokens on every field: email, tel, postal-code, cc-number, cc-exp, cc-csc, so platform autofill works.
- Card scanning via the device camera is offered where the platform supports it.
- Express wallets appear first, because they complete the entire purchase in one authentication.
- The keyboard never covers the field being edited or its error message.
- No modals for stages; modals collapse when the keyboard opens.
- Session and cart survive backgrounding the browser for at least 30 days.
- Never require pinch zoom to read the totals breakdown.

---

# Desktop Expansion

Added space is spent on:

- a persistent expanded order summary so the total is always visible
- accordion stages with completed stages collapsed to one editable line
- delivery methods with dates and prices compared side by side
- keyboard-only completion from email field to pay action

Added space is never spent on:

- upsells or recommendations beside payment fields
- a row of trust badges
- newsletter signup inside the payment stage
- site navigation, which must be removed from checkout entirely

---

# Accessibility Requirements

- Tab order is exactly visual order within each stage, and moving to a new stage places focus on that stage's heading.
- Every field has a persistent visible label, programmatically associated. Placeholder-only labelling is prohibited, particularly on card fields where an error clears the placeholder and leaves an unlabelled box.
- Card number, expiry, and security code are separate labelled fields, each announcing its own format requirement.
- Field errors are linked to their field so label, value, and error are announced together.
- The submission summary is focusable, announced assertively, and each item moves focus to its field.
- Totals live in a polite live region announcing the new total after recalculation: "Total updated. 84 euros 50."
- Payment failure is announced assertively and focus moves to the failure region.
- The pay action's accessible name includes the amount, so a screen reader user hears what they are committing to.
- Progress through stages is announced as position and label: "Step 2 of 3, Delivery."
- Bank authentication frames trap focus and are labelled; the return path restores focus to the payment stage.
- Price changes and stock changes are announced assertively, because they alter what the user is agreeing to.
- All text meets 4.5:1. The total row is distinguished by weight and size as well as colour.
- Error and success states carry an icon and text, so they survive greyscale and colour blindness.
- Reduced motion: no sliding stage transitions, no animated total counting, no spinner pulsing beyond a simple rotation.
- At 200% zoom the two-column desktop layout stacks with the summary above the form and the total remains visible.
- No time limit on completing checkout; where a reservation expires, warn before expiry and offer extension.

---

# Data Requirements

Before implementation, confirm:

```
Price source of truth and currency, including display and charge currency


Tax calculation basis: inclusive or exclusive, by destination or origin


Delivery rate rules and how arrival dates are computed


Cut-off times affecting the promised arrival date


Stock reservation policy during checkout and its duration


Discount stacking rules and item eligibility


Idempotency key strategy for payment submission


Payment methods supported per region and currency


Whether payment is authorised then captured, or captured immediately


Decline reason mapping to user-facing guidance


Timeout and reconciliation policy for unknown-outcome payments


Cart persistence duration and whether it survives across devices


Guest order lookup mechanism and its token lifetime


Cancellation window and refund timeframe


Address validation provider and manual fallback


What is stored of the card, and by whom


Restricted items by region or age
```

Decline reason mapping must be written before build. A raw processor code shown to a customer is a support ticket; a mapped reason is a completed purchase on the second attempt.

The unknown-outcome reconciliation policy must exist before launch, because it will occur on the first day of real traffic.

---

# Performance Requirements

- The checkout screen is interactive under one second; it ships without the catalogue application's dependencies.
- The payment provider script loads at the payment stage, not on the cart page.
- Total recalculation returns under 500ms so the pay action is not blocked perceptibly.
- Address autocomplete responds within 300ms of typing, debounced, and degrades to manual entry on failure.
- Payment submission is idempotent end to end and safe to retry on the same key.
- Cart state persists server-side for signed-in users and in durable local storage for guests, surviving a browser crash.
- Images in the order summary are small, fixed-dimension thumbnails that never cause layout shift.
- Superseded recalculations are cancelled so a stale total cannot be restored.

---

# Anti-Patterns

Never build:

- mandatory account creation before purchase
- guest checkout hidden as a small link beneath a sign-up form
- delivery and tax revealed only at the final step
- a total that goes blank while recalculating
- delivery options expressed as "3–5 business days" with no date
- "Invalid code" as the only explanation for a rejected discount
- a submit button labelled "Continue" at the moment money is taken
- payment submission without an idempotency key
- clearing the cart or address after a declined card
- raw processor decline codes shown to customers
- a bank authentication redirect with no designed return path
- charging first and discovering the stock problem afterwards
- silently changing a price the user has already seen
- upsells, cross-sells, or newsletter fields inside the payment stage
- site navigation left in place, offering exits from the highest-value screen
- a row of security badges substituting for actual clarity
- placeholder-only labels on card fields
- disabling paste in the card or security code field
- asking the user to select their card brand
- a confirmation screen with no order reference
- a confirmation screen with no arrival expectation
- more than three visible steps in a mobile checkout
- a cart that empties when the session expires

---

# Pattern Output Example

```
Product

Direct-to-Consumer Apparel Store


Primary Goal

Complete a first purchase on mobile in under 90 seconds


Layout

Three stages on mobile, two-column accordion on desktop, persistent summary


Guest Checkout

Default path; account offered on the confirmation screen


Total Disclosure

Delivery and tax shown at the contact stage from the entered postcode


Delivery Display

Named arrival dates with cut-off applied, price beside each method


Express Payment

Wallets at the top of the payment stage and on the cart


Stock Reservation

15 minutes from entering checkout, warned at 3 minutes remaining


Idempotency

Client-generated key per order attempt, reused across retries


Decline Handling

Mapped reasons, card fields cleared, everything else preserved, wallet offered


Unknown Outcome

Reconciliation screen, retry blocked, email within 5 minutes either way


Sold Out Mid-Checkout

Item removed before charge, total restated, variant swap offered


Confirmation

Order reference, arrival date, masked payment method, tracking, 1 hour free cancellation


Mobile

44×44 targets, full autofill tokens, card scan, collapsed summary with visible total


Accessibility

Amount in the pay action name, assertive decline announcement, polite total updates, 200% zoom stacks


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Guest checkout is the default, equally prominent path
- [ ] Buy-now skips the cart review step
- [ ] Delivery and tax are shown as early as they can be computed
- [ ] The total is visible at all times on mobile without expanding the summary
- [ ] Totals never blank during recalculation
- [ ] Delivery methods show real arrival dates
- [ ] Variant details appear on every line item
- [ ] Quantity cannot exceed available stock
- [ ] Discount failures name the failing condition
- [ ] Card brand is detected, never selected
- [ ] Paste works in every field including the security code
- [ ] The pay action states the amount
- [ ] Payment submission uses an idempotency key
- [ ] Declines preserve cart, address, and delivery choice
- [ ] Declines state that no charge occurred and offer an alternative method
- [ ] Processor codes are mapped to user-facing guidance
- [ ] Bank authentication has a designed return path for close and timeout
- [ ] Unknown-outcome state exists and blocks a second attempt
- [ ] Stock and price changes are caught before the charge
- [ ] Price changes are surfaced, never silently applied
- [ ] Empty cart shows guidance, never a zero-total form
- [ ] Undeliverable address names the constraint and offers alternatives
- [ ] Confirmation includes reference, arrival date, masked method, and tracking
- [ ] Account creation is offered after purchase, not before
- [ ] No upsells, badges, newsletters, or navigation inside checkout
- [ ] All fields have visible labels and correct autofill tokens
- [ ] Keyboard never covers the active field or its error
- [ ] Pay action accessible name includes the amount
- [ ] Declines announce assertively with focus moved to the failure
- [ ] 200% zoom stacks the layout with the total still visible
- [ ] Reduced motion respected

---

# Final Rule

Checkout is the only screen where every added element measurably costs revenue.

Every element must justify itself against one question:

Does this help the buyer complete the purchase or trust the total?

If the answer is no, remove it.
