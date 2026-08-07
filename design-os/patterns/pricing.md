# Pricing Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Landing Page Intelligence, Cards Component, Tables Component, Typography System, Color System, Accessibility Intelligence

---

# Purpose

The Pricing Pattern defines how a product presents what it costs and helps a visitor choose a plan with confidence.

A pricing page is not a price list.

A pricing page is a decision instrument. Its job is to move a qualified visitor from uncertainty to a specific choice.

If a visitor leaves unable to say which plan applies to them, the page failed regardless of how attractive the cards looked.

Every unclear price becomes a support ticket, a refund request, or a lost sale.

---

# When To Use

Use this pattern when:

- the product has two or more purchasable plans
- price depends on a period, a quantity, or a tier
- prospects self-serve and compare before contacting anyone
- a paid upgrade path exists inside the product
- an enterprise or custom tier requires a sales conversation

---

# When Not To Use

Do not use this pattern when:

- there is exactly one price with no options — state it on the page where the decision happens
- pricing is entirely negotiated — publish a value page with a contact path instead of fake tiers
- the screen is a checkout — use the Checkout pattern; pricing sells, checkout collects
- the user has already purchased — show plan management in Settings, not the marketing comparison

The most common product mistake is publishing four tiers when the business has two real customer segments.

---

# User Goal

The visitor is answering three questions in order:

```
Which plan is for someone like me?

↓

What will I actually pay?

↓

What happens if I choose wrong?

```

The first question must be answerable without scrolling on mobile.

The third question is the one products avoid, and it is the one that closes the decision.

---

# User Journey

```
Arrives with a rough sense of need

↓

Locates the plan matching their size or use case

↓

Reads the real total, including period and currency

↓

Checks the two or three features that matter to them

↓

Tests the edge case: cancellation, limits, overage

↓

Commits, or opens a contact path

↓

Returns later to verify the number they remembered
```

The last step matters. Pricing must be memorable and consistent, or trust erodes between visit and purchase.

---

# UX Flow

## Entry

Visitors arrive from three directions, and each needs different handling:

- marketing pages, evaluating fit for the first time
- inside the product, hitting a limit and looking for the next tier up
- a shared link or comparison article, verifying a specific claim

The in-product path must show the current plan marked and only the upgrades that are genuinely available.

---

## Orient

Within the first viewport the visitor must be able to determine:

- how many plans exist
- which one is recommended, and why in one line
- the billing period currently shown
- the currency currently shown

Recommendation must be justified, not decorated. "Most popular" with no basis is noise. "Best for teams of 5 to 20" is a decision aid.

---

## Compare

Comparison happens at two depths:

```
Plan cards

↓

Three to five differentiating features each

↓

Full feature matrix

↓

Individual feature explanation
```

Plan cards carry only differences. Listing features shared by every plan inside every card makes real differences invisible.

---

## Resolve

The visitor tests their specific case:

- what a seat costs when they add the sixth person
- what happens at the usage limit
- whether tax is added
- whether they can leave

Each of these must be answerable on the page, not only in a help article.

---

## Commit

One primary action per plan, labeled with what happens next.

"Start 14-day trial" and "Buy Pro" are different promises. Use the true one.

Enterprise commits to a conversation, and that path is described honestly.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Plans & pricing          │
├──────────────────────────┤
│ Monthly | Yearly −20%    │
│ USD $                    │
├──────────────────────────┤
│ RECOMMENDED              │
│ Pro                      │
│ $24 /user /month         │
│ billed yearly            │
│ Best for teams of 5–20   │
│ • Unlimited projects     │
│ • Advanced permissions   │
│ • Priority support       │
│ [   Start free trial   ] │
├──────────────────────────┤
│ Starter                  │
│ $9 /user /month          │
│ [ Choose Starter ]       │
├──────────────────────────┤
│ Enterprise               │
│ Custom pricing           │
│ [ Talk to sales ]        │
├──────────────────────────┤
│ Compare all features  ▾  │
├──────────────────────────┤
│ Pricing questions        │
│ accordion                │
└──────────────────────────┘
```

Mobile rules:

- one plan per row, full width, never a horizontal card carousel
- the recommended plan appears first, not in the middle
- period and currency controls sit above the first card and are sticky if the list is long
- the feature matrix is collapsed by default and opens as a single-plan-per-column scrollable table
- three differentiating bullets per card is the ceiling

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Plans & pricing                            │
│ Monthly | Yearly −20%              USD $   │
├─────────────────────┬──────────────────────┤
│ Starter             │ Pro   RECOMMENDED    │
│ $9 /user /month     │ $24 /user /month     │
│ • 3 projects        │ • Unlimited projects │
│ • Email support     │ • Advanced perms     │
│ [ Choose Starter ]  │ [ Start trial ]      │
├─────────────────────┴──────────────────────┤
│ Enterprise · Custom pricing                │
│ SSO, audit log, contractual SLA            │
│ [ Talk to sales ]                          │
├────────────────────────────────────────────┤
│ Feature matrix · 2 columns visible         │
└────────────────────────────────────────────┘
```

Two cards per row maximum. Enterprise takes a full-width band because its content is qualitative, not numeric.

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Plans & pricing        Monthly | Yearly −20%        USD $  ▾ │
├───────────────┬───────────────┬───────────────┬──────────────┤
│ Starter       │ Pro    ★      │ Business      │ Enterprise   │
│ $9            │ $24           │ $49           │ Custom       │
│ /user /month  │ /user /month  │ /user /month  │              │
│ 3 projects    │ Unlimited     │ Unlimited     │ Unlimited    │
│ Email support │ Priority      │ Dedicated CSM │ SLA-backed   │
│ [ Choose ]    │ [ Start ]     │ [ Choose ]    │ [ Contact ]  │
├───────────────┴───────────────┴───────────────┴──────────────┤
│ Feature matrix · sticky header row · grouped by category     │
│ Row label      │ Starter │ Pro │ Business │ Enterprise       │
├──────────────────────────────────────────────────────────────┤
│ Pricing FAQ · tax, cancellation, overage, seat changes       │
└──────────────────────────────────────────────────────────────┘
```

Desktop rules:

- four columns is the practical ceiling; a fifth makes every column unreadable
- the recommended column is emphasized by border and elevation, never by height that misaligns the action row
- all primary actions sit on the same baseline so the eye can compare
- the matrix header row sticks so column identity survives scrolling

---

# Component Hierarchy

```
PricingPage
├── PageHeader
│   ├── Title
│   └── Subtitle
├── PricingControls
│   ├── BillingPeriodToggle
│   │   └── SavingsBadge
│   └── CurrencySelector
├── PlanGrid
│   └── PlanCard ×n
│       ├── PlanName
│       ├── RecommendedBadge      conditional
│       ├── PriceDisplay
│       │   ├── Amount
│       │   ├── Unit
│       │   └── BillingNote
│       ├── AudienceLine
│       ├── DifferentiatorList
│       │   └── DifferentiatorItem ×3
│       ├── PlanAction
│       └── CurrentPlanIndicator  in-product only
├── EnterpriseBand
│   ├── ValueSummary
│   ├── RequirementList
│   └── ContactAction
├── FeatureMatrix
│   ├── MatrixToolbar
│   │   └── PlanColumnSelector    mobile and tablet
│   ├── MatrixCategoryGroup ×n
│   │   └── MatrixRow ×n
│   │       ├── FeatureLabel
│   │       ├── FeatureExplainer
│   │       └── PlanCell ×n
│   └── MatrixFooterActions
├── TaxAndCurrencyNote
└── PricingFaq
    └── FaqItem ×n
```

Reuse rules:

- `PlanCard` is one component with a recommended variant. Never a separate component per tier.
- `PriceDisplay` is the only place currency and period formatting is implemented, so no two surfaces can disagree.
- The matrix uses the product's standard table with sticky headers, not a bespoke grid.

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

## Billing Period Toggle

1. The toggle updates immediately with no page reload.
2. Every price recalculates in place; nothing else on the page moves.
3. The displayed unit changes with the price so the number is never ambiguous: "$24 /user /month, billed yearly".
4. The savings badge states the real difference, calculated from the actual prices, not a rounded marketing claim.
5. The selection is written to the URL so a shared link shows the same numbers.
6. Under reduced motion, prices replace instantly; otherwise a 200ms crossfade is acceptable. Never animate digits counting.

Yearly pricing must never be shown as a monthly-looking number without the billing note. That is the single most common source of pricing disputes.

## Currency Change

1. Currency is detected from account or locale and shown explicitly, never assumed silently.
2. Changing currency reloads prices from the priced catalog, not a client-side conversion.
3. If a plan is unavailable in a currency, say so in the card rather than hiding the plan.
4. The chosen currency persists for the session and is carried into checkout.

Never display a converted estimate that differs from what checkout will charge.

## Matrix Row Inspection

1. Feature labels with non-obvious meaning carry an inline explainer, triggered by tap or click, not hover alone.
2. The explainer opens as a popover on desktop and a bottom sheet on mobile.
3. Cell values are text or an icon plus text. A bare checkmark with no accessible name is not acceptable.
4. Numeric limits are stated in the cell: "10 GB" rather than a check that hides the number.

## Plan Selection

1. The action shows a pressed state and then a loading state on itself.
2. Selection carries plan, period, and currency into the next screen without re-asking.
3. If the visitor is signed out, authentication happens after selection and returns to checkout with the choice intact.
4. If the visitor already has the selected plan, the action reads "Current plan" and is not interactive.
5. Downgrades state their consequence before proceeding: "Downgrading to Starter will archive 4 projects."

## Enterprise Contact

1. The form asks for the minimum needed to route the conversation: name, work email, company size.
2. Submission confirms with a real expectation: "We'll reply within one business day."
3. If submission fails, entered values are preserved and an alternative channel is offered.
4. Never present enterprise as a price the visitor can compute; present it as a scope conversation.

---

# States

Each region owns its own states. A failed currency lookup must not blank the plans.

## Loading — First Visit

Prices come from a catalog and may not be instant. Reserve their space.

```
Plan card   → name bar + price block frame + 3 bullet bars + button frame
Matrix      → category header + 6 skeleton rows
```

Rules:

- render plan names and feature lists from static content immediately if only the price is dynamic
- never show a placeholder number such as "$0" or "—" that could be mistaken for a real price
- reserve exact price height so the action row does not jump when prices arrive

---

## Loading — Period Or Currency Change

Keep the previous prices visible.

Dim the price block to 60% and show a thin progress line at the top of the plan grid.

Disable plan actions only while the new prices are unresolved, because a click on a stale price is a mis-sale.

Never replace known prices with skeletons for a control change.

---

## Empty — No Plans Available

Occurs when a region, currency, or account type has no purchasable plans configured.

Required content: what is unavailable, why, and the human path.

```
┌──────────────────────────────┐
│ Plans aren't available in    │
│ your region yet.             │
│                              │
│ Tell us where you are and    │
│ we'll price it for you.      │
│                              │
│ [ Talk to sales ]            │
└──────────────────────────────┘
```

---

## Empty — Filtered Matrix Has No Differences

When a visitor filters the matrix to a category where the selected plans are identical, say so rather than showing an ambiguous blank.

```
Starter and Pro include the same security features.

[ Compare all categories ]   [ Add Business ]
```

---

## Error — Price Unavailable For One Plan

The plan shows the failure, the page keeps working.

```
┌──────────────────────────────┐
│ Pro                          │
│ ⚠  Price unavailable         │
│    [ Retry ]                 │
│    [ Talk to sales ]         │
└──────────────────────────────┘
```

A plan with an unknown price must never expose a purchase action.

---

## Error — Page Failed

Only when no pricing can load.

Required: cause in plain language, retry, a contact route, and a reference identifier for support.

```
We can't load pricing right now.

[ Retry ]   Contact support · ref PRC-4471
```

---

## Stale — Price Changed Mid-Session

If prices change while the page is open, do not silently swap the number under a visitor about to click.

```
┌──────────────────────────────┐
│ Pricing was updated.         │
│ Refresh to see current       │
│ prices before continuing.    │
│ [ Refresh ]                  │
└──────────────────────────────┘
```

If a stale price reaches checkout, checkout must reject it and explain, never charge the new amount silently.

---

## Partial — Tax Not Yet Determined

Before an address is known, tax cannot be exact. Say what is and is not included.

```
$24 /user /month
Excludes VAT. Tax is calculated at checkout from your billing address.
```

Never show an exclusive price as if it were the final total, and never invent a tax estimate.

---

## Success — Plan Selected

Confirm the exact commitment before payment, restating every variable.

```
Pro · 8 users · billed yearly · USD
$2,304 per year before tax
Renews 5 Aug 2027 · Cancel any time

[ Continue to payment ]
```

---

## Permission-Limited — In-Product View

When a member without billing rights opens pricing, show plans as read-only and name the person who can act.

```
Only workspace owners can change the plan.
Ask Dana Okoro to upgrade.

[ Send upgrade request ]
```

Never present a purchase action that will fail on submission.

---

# Mobile Behavior

- Touch targets minimum 44×44; the period toggle segments are at least 44px tall.
- The period toggle is a two-segment control, not a switch, because a switch does not communicate which option is active.
- Currency is a native select so the platform picker handles long lists.
- The feature matrix scrolls horizontally with a visible edge affordance and a frozen feature-label column.
- On mobile the matrix defaults to two plan columns with a selector to swap which two, because three columns on a phone is unreadable.
- Prices never require pinch zoom; the price is the largest type on the card.
- Sticky period and currency controls collapse to a single compact bar on scroll, keeping both values visible.
- Enterprise contact opens a short form on its own screen, not a cramped modal.

---

# Desktop Expansion

Added space is spent on:

- all plan columns visible simultaneously with aligned action rows
- the full feature matrix in place, with sticky headers and no column swapping
- inline feature explainers adjacent to the row rather than behind a tap
- a seat or usage calculator beside the plans, so the visitor sees their own total
- keyboard operation, where the period toggle responds to arrow keys

Added space is never spent on:

- additional invented tiers
- decorative comparison graphics
- testimonial carousels that separate the plans from the matrix
- a fifth column that shrinks every other column below readability

---

# Accessibility Requirements

- Each plan card is a region with an accessible name that includes the plan name, price, unit, and billing period.
- The billing period toggle uses a radio group or tablist with roles and states, is operable with arrow keys, and announces the selected option.
- Price changes triggered by the toggle are announced through a polite live region: "Prices updated to yearly billing. Pro is now 24 dollars per user per month, billed yearly."
- Matrix cells never convey inclusion by icon alone. Each cell has text, or an icon with an accessible name of "Included" or "Not included".
- The recommended plan is identified in text within the card's accessible name, not by color or border alone.
- Currency symbols are paired with an ISO code in the accessible name so "$" is unambiguous.
- The matrix uses real table semantics with scoped header cells so a screen reader announces plan and feature for each cell.
- Focus order runs period toggle, currency, then plans in visual order, then matrix, then FAQ.
- Feature explainers are keyboard reachable, dismissible with Escape, and return focus to their trigger.
- Savings badges and discount emphasis survive greyscale, using text and weight rather than color alone.
- At 200% zoom the plan grid reflows to fewer columns without clipping prices or actions.
- Reduced motion removes price crossfades and badge animation.

---

# Data Requirements

Before implementation, confirm for every plan:

```
Canonical price per period and per currency

Unit of pricing: per seat, per usage, flat

Whether the shown price is tax inclusive or exclusive

Minimum and maximum seats

Trial length and whether a card is required

Included quantities and overage rate

Downgrade consequences

Availability by region

Which features genuinely differ from the adjacent plan
```

Also define, page-wide:

```
Source of truth for the price catalog

How currency is selected and persisted

How period selection reaches checkout

Behavior when catalog and checkout disagree

Who is permitted to purchase
```

Never render a price the checkout system cannot honor. A price shown is a price promised.

---

# Performance Requirements

- Plan names, feature lists, and layout render from static content in the first paint; only prices await the catalog.
- Prices resolve within 500ms on a warm cache, and their space is reserved so nothing shifts.
- Period switching is a client-side recalculation from already-loaded catalog data, requiring no request.
- Currency change fetches only the price set, not the page.
- The feature matrix loads with the page on desktop and lazily on mobile where it is collapsed.
- No layout shift after prices arrive. The action row baseline is fixed before first paint.

---

# Anti-Patterns

Never build:

- a yearly price displayed as a monthly number without the billing basis stated
- "Most popular" applied to the tier the business wants to sell rather than the one users choose
- identical feature bullets repeated in every card, hiding the real differences
- checkmark-only matrix cells with no accessible name
- a tier whose price is "Contact us" purely to avoid publishing a number that exists
- prices that change between the pricing page and checkout
- tax excluded silently, so the invoice surprises the buyer
- five or more columns on desktop
- a horizontal card carousel on mobile that hides plans behind a swipe
- cancellation terms available only in a linked legal document
- a discount countdown timer that resets on reload
- a downgrade action that destroys data without warning
- currency converted client-side into a number checkout will not charge

---

# Pattern Output Example

```
Product

Team Project Management SaaS


Primary Question

Which plan fits a team of my size?


Plan Count

3 published, 1 contact-based


Pricing Unit

Per seat, per month


Period Toggle

Monthly / Yearly, real 20% saving, URL-persisted


Recommendation Basis

Best for teams of 5–20, stated in card


Currency

USD, EUR, NGN from priced catalog, no client conversion


Tax Basis

Exclusive, calculated at checkout from billing address


Matrix

4 categories, text-labeled cells, sticky header


Mobile

One card per row, recommended first, 2-column matrix with swap


Enterprise Path

Scope conversation, one business day reply commitment


Failure Handling

Per-plan price failure hides purchase action, offers sales route


Accessibility

Polite announcement on period change, greyscale-safe badges


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every price states its unit, period, and currency in one readable line
- [ ] Yearly pricing shown monthly always carries "billed yearly"
- [ ] The savings badge is computed from real prices
- [ ] Period and currency selections appear in the URL and reach checkout
- [ ] Plan cards list only differentiating features
- [ ] Recommendation carries a stated reason
- [ ] Matrix cells have text or accessible names, never bare icons
- [ ] Tax inclusion or exclusion is explicit before checkout
- [ ] A plan with an unresolved price exposes no purchase action
- [ ] Prices shown always match what checkout charges
- [ ] Stale prices are refreshed rather than silently swapped
- [ ] Cancellation and downgrade consequences are on the page
- [ ] Members without billing rights see a read-only view and a request path
- [ ] Mobile shows one card per row with the recommended plan first
- [ ] Matrix is readable on a phone with a frozen label column
- [ ] Desktop keeps action buttons on a shared baseline
- [ ] Period toggle is keyboard operable and announces changes politely
- [ ] Discount emphasis survives greyscale
- [ ] 200% zoom preserves prices and actions
- [ ] No layout shift when prices arrive

---

# Final Rule

A pricing page succeeds when a visitor can state, out loud and correctly, which plan they need and what it will cost them.

Every element must justify itself against one question:

Does this help the visitor choose, or does it only help us sell?

If it only helps us sell, it will cost trust later. Remove it.
