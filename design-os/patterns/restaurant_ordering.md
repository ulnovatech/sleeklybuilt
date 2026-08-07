# Restaurant Ordering Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Ecommerce Intelligence, Bottom Sheets, Ecommerce Component, Mobile Intelligence, Feedback System, Mobile First

---

# Purpose

The Restaurant Ordering Pattern defines how a hungry person goes from opening a menu to eating.

Food ordering is not general ecommerce with different products.

It differs in four ways that change every design decision: the item is customised more often than not, availability changes hour by hour, the order type determines the entire fulfilment path, and the customer waits in real time for a physical outcome.

If a customer cannot tell whether the kitchen is open, how long the food will take, or what they will actually be charged, the order does not happen.

---

# When To Use

Use this pattern when:

- prepared food or drink is ordered for immediate or scheduled fulfilment
- items require customisation such as size, protein, sides, or removals
- fulfilment differs by order type: dine-in, pickup, or delivery
- the kitchen can accept, reject, or delay an order after payment
- the customer needs live progress until the food arrives

---

# When Not To Use

Do not use this pattern when:

- the goods are shelf-stable and shipped — use the standard catalogue and Product Details patterns
- the transaction is a table reservation with no food selection — use the Booking pattern
- the purchase is a recurring meal subscription — use the Pricing pattern for plan selection and this pattern for the weekly choice
- the venue only needs a menu to read, in which case a menu page without a cart is the honest solution

The most common product mistake is shipping a generic ecommerce cart into a restaurant, so the customer discovers at checkout that the kitchen closed twenty minutes ago.

---

# User Goal

The customer is answering four questions in order:

```
Is this place open and able to feed me?

↓

What do I want, made the way I want it?

↓

What will it cost and when will it arrive?

↓

Is it actually coming?
```

The first question must be answered before the menu is browsed, not at checkout.

The fourth question is where most of the customer's time in the product is spent, and it is the most neglected screen.

---

# User Journey

```
Opens the menu with a rough craving

↓

Confirms the venue is open and the order type available

↓

Browses by category or searches for a specific dish

↓

Opens an item and customises it

↓

Adds it to the cart and continues or checks out

↓

Chooses order type and timing

↓

Reviews the real total including fees and tax

↓

Pays

↓

Watches live progress until pickup or delivery

↓

Receives the food, and can reorder in one action
```

The reorder branch is the highest-value path in the product and is usually buried.

---

# UX Flow

## Establish Context

Before the menu, the product must resolve three facts and display them:

- is the venue accepting orders right now
- which order types are available
- for delivery, is this address in range

```
Open until 22:30 · Pickup 15 min · Delivery 35 min
```

If the venue is closed, say so at the top and offer scheduling rather than letting the customer build a cart that cannot be placed.

---

## Browse

Menus are long, and category navigation carries the browse:

```
Category strip

↓

Section of items

↓

Item detail

↓

Customisation
```

Rules:

- categories are horizontally scrollable and sticky, and the active category updates as the customer scrolls
- each item row shows name, one-line description, price, and image where photography exists
- unavailable items stay visible, greyed, and labeled "Sold out today" rather than being removed, because their absence looks like an incomplete menu
- dietary and allergen markers appear on the row, not only in the detail view

---

## Customise

Customisation is the defining interaction of this pattern.

```
Required choices first

↓

Included choices next

↓

Paid extras last

↓

Removals and notes at the end
```

Rules:

- required choices are marked and block adding until resolved
- every paid option shows its price increment inline: "Extra chicken +$3.00"
- the running item total updates with every change and is always visible
- selection limits are stated before they are hit: "Choose up to 2 sides"
- free-text notes are accepted but the interface must state what the kitchen can honour, because a note the kitchen ignores creates a complaint

---

## Cart

The cart is a review surface, not a receipt.

Each line shows the item, its customisations in full, its quantity, and its line total.

Customisations must be editable from the cart. A customer who chose the wrong size should not need to delete and rebuild the item.

---

## Order Type And Timing

Order type changes price, timing, and required information, so it must be chosen before payment and shown as chosen.

```
Dine-in    → table number, no fees, immediate
Pickup     → collection time, no delivery fee
Delivery   → address, delivery fee, distance-based estimate
```

Timing offers "as soon as possible" with a real estimate, or a scheduled slot with real capacity.

Never present a slot the kitchen cannot honour.

---

## Pay

The total must be complete before the payment step: subtotal, tax, delivery fee, service charge, and tip if applicable.

Any fee revealed after the customer commits is a cancellation.

---

## Track

After payment, the customer's attention moves entirely to progress.

```
Received

↓

Accepted by kitchen

↓

Preparing

↓

Ready · or · Out for delivery

↓

Completed
```

Each stage shows a time expectation. Each transition is pushed, not polled by the customer refreshing.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Adaobi Kitchen      ⋯    │
│ Open until 22:30         │
│ [Pickup 15m][Delivery 35m]│
├──────────────────────────┤
│ 🔍 Search the menu       │
├──────────────────────────┤
│ Popular Rice Grills Sides│  sticky
├──────────────────────────┤
│ POPULAR                  │
│ ┌──┐ Jollof Rice         │
│ │▤ │ Smoky party jollof  │
│ └──┘ $12.00          [+] │
├──────────────────────────┤
│ ┌──┐ Suya Platter        │
│ │▤ │ Spicy beef skewers  │
│ └──┘ $18.00          [+] │
├──────────────────────────┤
│ ┌──┐ Egusi Soup   SOLD   │
│ │▤ │ Available tomorrow  │
│ └──┘ $14.00              │
├──────────────────────────┤
│ RICE                     │
│ ...                      │
└──────────────────────────┘
│ 3 items · $42.00  [View] │  sticky
└──────────────────────────┘
```

Item customisation opens as a bottom sheet, not a new page:

```
┌──────────────────────────┐
│ ▬▬▬                    ✕ │
│ ┌──────────────────────┐ │
│ │      item image      │ │
│ └──────────────────────┘ │
│ Jollof Rice        $12.00│
│ Smoky party jollof with  │
│ scotch bonnet.           │
│ 🌶 Spicy · Contains: nuts│
├──────────────────────────┤
│ Size · required          │
│ ○ Regular         +$0.00 │
│ ● Large           +$4.00 │
├──────────────────────────┤
│ Protein · choose up to 2 │
│ ☑ Grilled chicken +$3.00 │
│ ☐ Beef            +$4.00 │
│ ☐ Fish            +$5.00 │
├──────────────────────────┤
│ Remove                   │
│ ☐ No onions              │
├──────────────────────────┤
│ Notes for the kitchen    │
│ [                      ] │
│ We'll pass this on but   │
│ can't guarantee changes. │
├──────────────────────────┤
│ [ − ] 1 [ + ]            │
│ [ Add to order · $19.00 ]│
└──────────────────────────┘
```

Mobile rules:

- the menu is the default screen; nothing precedes it except venue status
- the category strip is sticky and reflects scroll position
- customisation is a bottom sheet so the menu position is never lost
- the sheet's add action is pinned and always shows the current item total
- the cart bar is sticky, shows item count and total, and never covers the last item in a section
- quick-add is offered only for items with no required choices; everything else opens the sheet

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Adaobi Kitchen · Open until 22:30          │
│ [ Pickup 15 min ] [ Delivery 35 min ]      │
├──────────────┬─────────────────────────────┤
│ Popular      │ POPULAR                     │
│ Rice         │ ┌───┐ Jollof Rice  $12  [+] │
│ Grills       │ │ ▤ │ Smoky party jollof    │
│ Sides        │ └───┘                       │
│ Drinks       │ ┌───┐ Suya Platter $18  [+] │
│              │ │ ▤ │ Spicy beef skewers    │
│              │ └───┘                       │
├──────────────┴─────────────────────────────┤
│ Your order · 3 items · $42.00   [ Review ] │
└────────────────────────────────────────────┘
```

Categories become a vertical list. The cart remains a bar until the checkout step.

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Adaobi Kitchen · Open until 22:30 · Lagos                    │
│ [ Dine-in ] [ Pickup 15 min ] [ Delivery 35 min ]   🔍       │
├───────────┬────────────────────────────────┬─────────────────┤
│ Popular   │ POPULAR                        │ Your order      │
│ Rice      │ ┌───┐ Jollof Rice   $12   [+]  │                 │
│ Grills    │ │ ▤ │ Smoky jollof           │ Jollof Rice ×1  │
│ Sides     │ └───┘                          │ Large, chicken  │
│ Drinks    │ ┌───┐ Suya Platter  $18   [+]  │ Edit     $19.00 │
│ Desserts  │ │ ▤ │ Spicy skewers          │                 │
│           │ └───┘                          │ Suya ×1  $18.00 │
│           │ ┌───┐ Egusi Soup  SOLD OUT     │                 │
│           │ │ ▤ │ Back tomorrow          │ Subtotal $37.00 │
│           │ └───┘                          │ Tax       $2.78 │
│           │                                │ Delivery  $3.50 │
│           │ RICE                           │ Total    $43.28 │
│           │ ...                            │ [ Checkout ]    │
└───────────┴────────────────────────────────┴─────────────────┘
```

Desktop rules:

- three columns: categories, menu, persistent cart
- the cart is always visible so the total is never a surprise at checkout
- customisation opens as a centred dialog with the menu dimmed behind it
- extra width buys full customisation visibility without scrolling, not larger food photography

---

# Component Hierarchy

```
OrderingPage
├── VenueHeader
│   ├── VenueName
│   ├── OpenStatus
│   ├── OrderTypeSelector
│   │   └── OrderTypeOption ×3
│   └── FulfilmentEstimate
├── MenuSearch
├── CategoryNav
│   └── CategoryTab ×n
├── MenuSection ×n
│   ├── SectionHeader
│   └── MenuItemRow ×n
│       ├── ItemThumbnail
│       ├── ItemName
│       ├── ItemDescription
│       ├── DietaryMarkers
│       ├── ItemPrice
│       ├── QuickAddAction        no-required-choice items only
│       └── SoldOutBadge          conditional
├── ItemCustomiser                bottom sheet · dialog
│   ├── ItemHero
│   ├── ItemDescription
│   ├── AllergenNotice
│   ├── OptionGroup ×n
│   │   ├── GroupLabel
│   │   ├── GroupConstraint       required · choose up to n
│   │   └── OptionRow ×n
│   │       ├── OptionLabel
│   │       ├── PriceIncrement
│   │       └── UnavailableBadge
│   ├── RemovalGroup
│   ├── KitchenNoteField
│   ├── QuantityStepper
│   └── AddToOrderAction
├── CartBar                       mobile · tablet
├── CartPanel                     desktop
│   ├── CartLine ×n
│   │   ├── LineName
│   │   ├── LineCustomisations
│   │   ├── LineQuantity
│   │   ├── LineTotal
│   │   ├── EditLineAction
│   │   └── RemoveLineAction
│   ├── PriceBreakdown
│   └── CheckoutAction
├── FulfilmentStep
│   ├── OrderTypeConfirm
│   ├── TableNumberField          dine-in
│   ├── AddressPicker             delivery
│   ├── TimingSelector
│   └── SlotAvailabilityNotice
└── OrderStatusTracker
    ├── StatusTimeline
    ├── EstimateDisplay
    ├── CourierPanel              delivery
    ├── VenueContactAction
    └── OrderSummary
```

Reuse rules:

- `ItemCustomiser` is one component rendered as a bottom sheet on mobile and a dialog on desktop, with identical logic.
- `PriceBreakdown` is the single implementation of totals, used in cart, checkout, and receipt so no two disagree.
- `OptionRow` handles selected, unselected, unavailable, and limit-reached in one component.

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

New state is understandable
```

## Order Type Change

1. Selection updates immediately.
2. Fees, estimates, and required fields recalculate together.
3. If the cart contains an item unavailable for the new type, such as a dine-in-only dish, say so and offer to remove it rather than silently dropping it.
4. If switching to delivery and no address is known, ask for it before showing an estimate rather than showing a generic one.
5. The cart is preserved across the change.

## Item Customisation

1. Opening the customiser preserves menu scroll position.
2. Required groups are marked and the add action is disabled with the reason stated: "Choose a size to continue."
3. Each selection updates the item total immediately.
4. Reaching a selection limit disables remaining options in that group and states why: "You've chosen 2 of 2 sides."
5. Adding closes the sheet, confirms briefly, and returns the customer to their exact menu position.
6. The cart bar total updates and is announced politely.

## Editing A Cart Line

1. Edit reopens the customiser with every previous choice restored.
2. Saving replaces the line rather than adding a duplicate.
3. If an option chosen earlier has since sold out, it is flagged on open and must be resolved before saving.

## Item Sells Out While In The Cart

Kitchens run out mid-session, and this must be handled before payment.

1. Availability is re-validated when the customer opens the cart and again at checkout.
2. Unavailable lines are marked in place, not removed.
3. The total updates only after the customer resolves each line.

```
┌──────────────────────────────┐
│ ⚠  Egusi Soup just sold out. │
│                              │
│    Remove it, or swap for    │
│    Okra Soup at the same     │
│    price.                    │
│    [ Swap ]  [ Remove ]      │
└──────────────────────────────┘
```

Never place an order containing an unavailable item and let the kitchen resolve it by phone.

## Venue Closes Mid-Session

1. The venue header updates to closed with the next opening time.
2. The cart is preserved.
3. Checkout switches from immediate to scheduled, and the earliest honourable slot is offered.

```
Adaobi Kitchen just closed for the night.
Your order is saved. Earliest slot: tomorrow 11:30.

[ Schedule for 11:30 ]   [ Keep my order for later ]
```

## Checkout And Payment

1. The complete total, including every fee and tax, is shown before the payment control.
2. Submitting disables the action and shows progress on it.
3. Payment failure keeps the cart entirely intact and states the cause.
4. Success moves directly to tracking, never to a bare receipt.

## Order Rejected By The Kitchen

Acceptance is not guaranteed by payment, and the rejection path must be designed.

1. Rejection is pushed to the customer immediately, not discovered on a refresh.
2. The reason is stated in the venue's words where provided.
3. Refund status is stated with a real timeframe.
4. Recovery options are offered in order of usefulness.

```
┌──────────────────────────────┐
│ Adaobi Kitchen couldn't take │
│ your order                   │
│                              │
│ "We've run out of goat meat  │
│ for tonight."                │
│                              │
│ $43.28 refunded to your card │
│ Usually arrives in 3–5 days  │
│                              │
│ [ Order something else ]     │
│ [ Find nearby restaurants ]  │
│ Contact support · #A-8841    │
└──────────────────────────────┘
```

## Live Status Updates

1. Status changes arrive by push, and the tracking screen updates without customer action.
2. Each stage shows its own expectation, not just the final one.
3. Delays are announced with a revised estimate and a reason, before the original estimate expires.
4. When the estimate slips more than once, offer contact and cancellation where the kitchen permits it.
5. For delivery, courier position updates at a useful frequency with a text fallback for customers who cannot use a map.

```
┌──────────────────────────────┐
│ ● Received          19:42    │
│ ● Accepted          19:43    │
│ ◐ Preparing         now      │
│   Ready around 20:05         │
│ ○ Out for delivery           │
│ ○ Delivered                  │
│                              │
│ Running 10 minutes late.     │
│ The kitchen is busier than   │
│ expected.                    │
│ [ Call the restaurant ]      │
└──────────────────────────────┘
```

---

# States

Each region owns its states. A failed courier location must not hide the order status.

## Loading — First Visit

Venue status and categories load first, because they gate everything else.

```
Venue header   → name bar + status bar + 2 pill frames
Category strip → 5 pill frames
Menu rows      → thumbnail square + 2 text bars + price bar ×6
```

Reserve thumbnail dimensions exactly so rows do not shift as images arrive.

Never render prices as placeholders, and never enable add actions before availability is known.

---

## Loading — Customiser Open

Option groups may be fetched per item. Show the item hero and name immediately, then the groups.

```
Group label    → 30% width bar
Option rows    → 3 rows with label bar and price bar
```

The add action stays disabled and labeled "Loading options" until groups resolve.

---

## Loading — Order Submission

The payment action is the progress surface.

```
[  Placing your order…      ]
```

Rules:

- the cart is not cleared until the order is confirmed accepted for submission
- duplicate submission is prevented by disabling the control, not by relying on the customer
- if submission exceeds 10 seconds, show "Still confirming with the restaurant" rather than failing silently

---

## Loading — Status Refresh

Keep the last known status visible with its timestamp.

```
Preparing · updated 19:51
```

Never blank the timeline while refreshing. A customer watching progress must always see progress.

---

## Empty — Cart Empty

```
┌──────────────────────────────┐
│ Your order is empty          │
│                              │
│ Add something from the menu   │
│ and it'll show up here.       │
│                              │
│ [ Browse popular items ]      │
└──────────────────────────────┘
```

---

## Empty — Search Found Nothing

```
Nothing on the menu matches "sushi".

Adaobi Kitchen serves West African food.
[ Clear search ]   [ See popular items ]
```

State what the venue does serve. A bare "no results" leaves the customer with no next step.

---

## Empty — Category Has No Available Items

Distinct from an empty menu. The category exists but everything in it is sold out today.

```
All desserts are sold out today.
They're usually back by 11:00 tomorrow.

[ See what's available ]
```

---

## Empty — No Delivery Coverage

```
┌──────────────────────────────┐
│ We don't deliver to          │
│ 12 Marina Road yet.          │
│                              │
│ Pickup is available, 15 min  │
│ away.                        │
│                              │
│ [ Switch to pickup ]         │
│ [ Try another address ]      │
└──────────────────────────────┘
```

---

## Error — Option Group Failed To Load

The item cannot be added safely, and the add action is withheld.

```
┌──────────────────────────────┐
│ ⚠  We can't load the options │
│    for this dish.            │
│    [ Retry ]                 │
└──────────────────────────────┘
```

Never allow an item with required choices to be added without them.

---

## Error — Add To Order Failed

```
┌──────────────────────────────┐
│ ⚠  We couldn't add that.     │
│    Your choices are saved.   │
│    [ Try again ]             │
└──────────────────────────────┘
```

Every selection is preserved. Rebuilding a customised item is the fastest way to lose an order.

---

## Error — Payment Failed

State the cause distinctly, because each has a different fix:

- declined: try another payment method, cart intact
- expired card: update details inline, cart intact
- network interruption: verify whether the order was placed before retrying, so the customer is not charged twice

```
┌──────────────────────────────┐
│ ⚠  Your card was declined.   │
│    Your order is still here. │
│    [ Try another card ]      │
└──────────────────────────────┘
```

---

## Error — Order Rejected

Handled in full in Interaction Flow. The essential requirements are an immediate push, a stated reason, refund certainty, and a recovery route.

---

## Error — Tracking Unavailable

The order exists even when live tracking does not.

```
┌──────────────────────────────┐
│ Live tracking is unavailable │
│ right now.                   │
│                              │
│ Your order was accepted at   │
│ 19:43, ready around 20:05.   │
│ [ Call the restaurant ]      │
└──────────────────────────────┘
```

Never imply an order is lost because a tracking service failed.

---

## Partial — Some Items Unavailable At Checkout

The cart shows exactly which lines are affected and blocks payment until each is resolved. The total does not update until then.

---

## Partial — Estimate Range Only

When timing cannot be precise, show the range honestly.

```
Ready between 20:00 and 20:20
```

A single fake minute-precise time is worse than an honest range.

---

## Success — Order Placed

```
┌──────────────────────────────┐
│ ✓ Order placed · #A-8841     │
│   Adaobi Kitchen accepted it │
│   at 19:43.                  │
│                              │
│   Pickup ready around 20:05  │
│   12 Marina Road              │
│                              │
│   [ Track order ]            │
│   Add to calendar             │
└──────────────────────────────┘
```

Success lands on tracking, because that is where the customer's attention already is.

---

## Success — Order Completed

Completion closes the loop and enables the highest-value repeat action.

```
Delivered at 20:14. Enjoy.

[ Reorder this ]   [ Rate your order ]
```

---

## Permission-Limited — Dine-In Without A Table

When dine-in requires a table code the customer does not have, explain how to get it rather than blocking silently.

```
Dine-in needs the code on your table.
Ask a staff member, or switch to pickup.
```

---

# Mobile Behavior

- Touch targets minimum 44×44 for option rows, steppers, and quick-add, with 8px minimum separation.
- The customiser is a bottom sheet with a drag handle, dismissible by swipe down, and it asks before discarding a part-built item.
- The sheet's add action is pinned above the safe area and always shows the current item total.
- The cart bar is pinned and page padding accounts for its height so the last menu item is reachable.
- The category strip is horizontally scrollable with the active category auto-scrolled into view during vertical scroll.
- Menu images are lazy loaded at device resolution with reserved dimensions.
- Kitchen notes open the keyboard with the field scrolled above it, and the add action remains visible.
- Tracking supports background push notifications, and the tracking screen resumes at the current stage when reopened.
- Delivery maps offer a text-only alternative view for low bandwidth and for customers who cannot interpret a map.
- Never require pinch zoom to read a price or a dietary marker.

---

# Desktop Expansion

Added space is spent on:

- a persistent cart with a full price breakdown, so the total is never a surprise
- the full customiser visible without scrolling
- categories as a vertical list with the active section highlighted
- keyboard flow: type-ahead menu search, Enter to open an item, Escape to close the customiser
- side-by-side tracking with the order summary during the wait

Added space is never spent on:

- full-bleed food photography that pushes the menu below the fold
- a multi-column menu grid that breaks scanning order
- promotional carousels between menu sections
- a hero video of the restaurant

---

# Accessibility Requirements

- Option groups are radio groups when single-choice and checkbox groups when multi-choice, each with a group label stating the constraint.
- Price increments are part of each option's accessible name: "Extra chicken, plus 3 dollars".
- The running item total is in a polite live region so each change is announced with the new figure.
- Sold-out items use `aria-disabled` with an accessible name including the reason, and remain focusable so the customer learns why.
- The cart bar total is announced politely on change: "3 items, 42 dollars."
- Dietary and allergen markers have text equivalents. A chilli glyph alone is not an accessible spice indicator.
- Allergen information is text within the item, never only an icon legend elsewhere.
- The customiser traps focus while open, Escape closes it with a discard prompt if choices were made, and focus returns to the item row that opened it.
- Status changes on the tracking screen are announced politely; a rejection or a significant delay is announced assertively because it requires a decision.
- The status timeline conveys stage state by icon and text, never colour alone, so it survives greyscale.
- Courier location has a text alternative stating distance and estimated arrival.
- At 200% zoom the menu remains a single readable column and the sheet's add action remains visible.
- Reduced motion removes sheet slide animation, timeline pulses, and map panning.

---

# Data Requirements

Before implementation, confirm for every menu item:

```
Availability schedule by day and hour

Real-time stock where the kitchen tracks it

Which order types the item supports

Option groups, constraints, and price increments

Whether options have independent availability

Allergen and dietary data source, and who maintains it

Preparation time contribution

Tax category
```

Also define, order-wide:

```
Venue opening hours and holiday exceptions

Order type availability by time of day

Delivery zone geometry and per-zone fees

Fee and tax computation, and the single service that owns it

Slot capacity model and how it is decremented

Whether the kitchen must accept, and the acceptance timeout

Rejection reasons and refund timing

Status event source and delivery mechanism

What happens to an order if the venue never responds
```

Never display a preparation estimate that is not derived from the kitchen's own data. An invented estimate is the single most damaging inaccuracy in this pattern.

---

# Performance Requirements

- Venue status and the first menu section render within one second on a warm cache.
- Option groups load with the item on open, targeting under 300ms, and the add action states its disabled reason until they arrive.
- Menu images are lazily loaded, responsive, and dimension-reserved so no layout shift occurs during scroll.
- Availability is re-validated server-side on cart open and again at submission, regardless of what the client last saw.
- Totals are computed server-side. The client displays, it never calculates the charge.
- Status updates arrive by push or a persistent connection, not by an interval poll that drains the battery.
- Tracking reconnects automatically after a network interruption and reconciles to the true current stage.

---

# Anti-Patterns

Never build:

- a menu that lets a cart be built while the venue is closed, with the failure revealed at payment
- sold-out items removed from the menu instead of marked
- required option groups that can be skipped
- paid extras whose price appears only in the cart
- a customiser that loses selections when reopened for editing
- fees or service charges revealed after the payment step
- a minute-precise ready time that the kitchen never committed to
- a "no results" search state that does not say what the venue serves
- an order confirmation screen with no path to tracking
- a tracking screen that only advances when the customer pulls to refresh
- a rejected order communicated by email only
- a delay discovered by the customer after the promised time has already passed
- a cart cleared by a failed payment
- delivery estimates shown before the address is known
- allergen information available only as an unlabelled icon legend
- a full-screen promotion covering the menu on open

---

# Pattern Output Example

```
Product

Single-Venue Restaurant Ordering


Primary Question

Can this kitchen feed me what I want, and when?


Order Types

Dine-in with table code · Pickup · Delivery with zone fees


Venue Gate

Open status and estimates shown before the menu


Menu Structure

6 categories, sticky strip, scroll-synced active state


Customisation

Required groups first, priced extras inline, live item total


Sold-Out Handling

Item visible, marked, return time stated where known


Cart

Persistent on desktop, sticky bar on mobile, lines editable


Totals

Server-computed, complete before payment control


Kitchen Acceptance

Required, 3 minute timeout, rejection pushed with reason


Tracking

5 stages, pushed updates, per-stage estimates, delay reasons


Mid-Session Failures

Item sold out, venue closed, payment declined all handled with cart intact


Mobile

Bottom-sheet customiser, pinned totals, background push tracking


Accessibility

Priced option names, polite total announcements, text allergen data


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Open status and order type availability appear before the menu
- [ ] A closed venue offers scheduling instead of a dead cart
- [ ] Sold-out items stay visible, marked, and explained
- [ ] Required option groups block adding with the reason stated
- [ ] Every paid option shows its increment inline
- [ ] Selection limits are stated before they are reached
- [ ] The item total updates on every change and is announced
- [ ] Adding an item returns the customer to their exact menu position
- [ ] Cart lines show full customisations and are editable in place
- [ ] Editing a line replaces it rather than duplicating it
- [ ] Availability is re-validated at cart open and at submission
- [ ] An item selling out mid-session is resolved before payment
- [ ] A venue closing mid-session preserves the cart and offers a slot
- [ ] All fees and tax are visible before the payment control
- [ ] Payment failure preserves the cart entirely
- [ ] A network failure during submission cannot double-charge
- [ ] Kitchen rejection is pushed, with reason, refund timing, and recovery
- [ ] Tracking advances without customer action
- [ ] Each tracking stage carries its own estimate
- [ ] Delays are announced before the original estimate expires
- [ ] Tracking failure still shows the known order state
- [ ] Menu search zero-results states what the venue serves
- [ ] Delivery outside the zone offers pickup as an alternative
- [ ] Allergen and dietary data is text, not icon-only
- [ ] Completed orders offer one-action reorder
- [ ] Timeline state survives greyscale
- [ ] 200% zoom keeps the sheet's add action visible
- [ ] Reduced motion removes sheet and timeline animation

---

# Final Rule

A restaurant ordering experience succeeds when the customer knows, at every moment, whether their food is coming and when.

Every element must justify itself against one question:

Does this help the customer get the right food at the time they expect it?

If it only makes the menu look appetising while obscuring availability, price, or timing, it is working against the order. Remove it.
