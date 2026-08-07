# Product Details Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Ecommerce Intelligence, Ecommerce Component, Cards Component, Data Display System, Feedback System, Mobile First

---

# Purpose

The Product Details Pattern defines the complete solution for the screen where a shopper decides to buy one specific item.

A product detail page is not a catalogue entry.

It is the last screen before money moves, and it must answer every question that would otherwise stop the purchase.

If a shopper leaves because they could not tell whether the item fits, arrives in time, or can be returned, the page failed regardless of how good the photography was.

---

# When To Use

Use this pattern when:

- a single purchasable item needs full evaluation before a decision
- the item has variants such as size, colour, capacity, or duration
- availability, delivery time, or condition affects the decision
- the shopper needs specifications, dimensions, or compatibility
- social proof influences confidence

---

# When Not To Use

Do not use this pattern when:

- the item is one of many being compared — use the catalogue with a quick-view, and keep the detail page for commitment
- the purchase is a subscription plan — use the Pricing pattern
- the item is configured through a multi-step process such as insurance or a custom build — use a guided configurator
- the page exists only to hold marketing copy with no purchase action

The most common product mistake is a detail page that describes the item beautifully but never states whether it is in stock in the shopper's size.

---

# User Goal

The shopper is answering four questions in order:

```
Is this the right thing?

↓

Is this the right version of it?

↓

Can I get it, and when?

↓

What if it's wrong?
```

The first three must be answerable within the first two viewports on mobile.

The fourth, returns and guarantees, must be on the page and not only in the site footer.

---

# User Journey

```
Arrives from search, category, ad, or a shared link

↓

Confirms this is the item they meant

↓

Selects the variant that applies to them

↓

Reads price, total, and availability for that variant

↓

Checks the one specification that decides it

↓

Scans reviews for the failure mode they fear

↓

Adds to cart, or saves for later

↓

Continues shopping or proceeds to checkout
```

Products forget the "saves for later" branch, and it is often the majority of first visits.

A shopper who cannot save the item will lose it and buy nothing.

---

# UX Flow

## Entry

Shoppers arrive from four directions:

- category browse, with a rough intent and no variant chosen
- search, often with a variant already in mind, such as a size in the query
- an external link or ad, landing on a specific variant that must be pre-selected
- a returning visit, where a previously chosen variant should be restored

A deep link that names a variant must open with that variant selected, its price shown, and its gallery active.

---

## Identify

The first viewport establishes identity without ambiguity:

- product name in full, including the distinguishing detail
- primary image of the selected variant, not a generic hero
- current price with any reference price and the saving
- rating summary with review count
- availability of the selected variant

A shopper must never have to scroll to learn the price.

---

## Configure

Variant selection is the highest-risk interaction on the page.

```
Variant option chosen

↓

Price, image, and availability update together

↓

Unavailable combinations are visibly marked, not hidden

↓

The chosen combination is stated in one line
```

Options that would produce an unavailable combination stay visible and are marked unavailable, because hiding them makes the shopper believe the option does not exist.

---

## Commit

One primary action: add to cart, or buy now where a single-item express path is genuinely supported.

Secondary actions are save for later and share.

The primary action must state the variant it will add: "Add to cart · Blue, Medium".

---

## Verify

After adding, the shopper needs to know it worked and to choose between two paths without hunting:

- continue shopping
- go to cart

Never auto-navigate to the cart. It ends the browse session by force.

---

## Extend

Below the decision, the page supports deeper evaluation:

- specifications as structured data
- reviews with the ability to find relevant ones
- related items that serve completion or alternative, and are labeled as such

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ‹ Back        ♡   Share  │
├──────────────────────────┤
│                          │
│      Gallery 1 / 6       │
│      swipe · tap to zoom │
│                          │
│      ● ○ ○ ○ ○ ○         │
├──────────────────────────┤
│ Aeron Task Chair         │
│ ★ 4.6 (218 reviews)      │
│ $1,395  was $1,595       │
│ Save $200                │
├──────────────────────────┤
│ Colour · Graphite        │
│ [■][■][■][■]             │
│ Size · B (medium)        │
│ [ A ][ B ][ C ]          │
├──────────────────────────┤
│ ✓ In stock               │
│ Delivered Fri 14 Aug     │
│ Free returns for 30 days │
├──────────────────────────┤
│ Overview · 3 lines       │
│ Read more                │
├──────────────────────────┤
│ Specifications        ▾  │
│ Reviews               ▾  │
│ Delivery & returns    ▾  │
├──────────────────────────┤
│ Frequently bought with   │
│ horizontal scroll        │
└──────────────────────────┘
│ $1,395   [ Add to cart ] │  sticky
└──────────────────────────┘
```

Mobile rules:

- gallery occupies at most 60% of the first viewport, so price and variants are partly visible and invite scrolling
- swipe for gallery, with a tap target for full-screen zoom; never pinch-only
- sticky bottom bar carries the price and the primary action, appearing once the inline action scrolls out of view
- variant swatches are minimum 44×44 with 8px gaps
- long content is collapsed into accordions, with only overview expanded
- never place add-to-cart above the variant selectors

---

## Tablet

```
┌────────────────────────────────────────────┐
│ ‹ Back                          ♡   Share  │
├──────────────────────┬─────────────────────┤
│                      │ Aeron Task Chair    │
│      Gallery         │ ★ 4.6 (218)         │
│   main + thumbs      │ $1,395  was $1,595  │
│                      │                     │
│                      │ Colour · Graphite   │
│                      │ [■][■][■][■]        │
│                      │ Size · B            │
│                      │ [ A ][ B ][ C ]     │
│                      │                     │
│                      │ ✓ In stock          │
│                      │ Delivered Fri 14 Aug│
│                      │ [ Add to cart ]     │
│                      │ ♡ Save for later    │
├──────────────────────┴─────────────────────┤
│ Specifications · Reviews · Delivery tabs   │
├────────────────────────────────────────────┤
│ Related items · 3 per row                  │
└────────────────────────────────────────────┘
```

The decision column is fixed at a readable width and never stretches. Gallery takes the remaining space.

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Home › Office › Chairs › Aeron Task Chair                    │
├─────────┬──────────────────────────┬─────────────────────────┤
│ Thumbs  │                          │ Aeron Task Chair        │
│ ┌─┐     │                          │ ★ 4.6 (218 reviews)     │
│ │ │     │        Main image        │ $1,395  was $1,595      │
│ └─┘     │     hover to zoom        │ Save $200 · incl. VAT   │
│ ┌─┐     │                          │                         │
│ │ │     │                          │ Colour · Graphite       │
│ └─┘     │                          │ [■][■][■][■]            │
│ ┌─┐     │                          │ Size · B (medium)       │
│ │ │     │                          │ [ A ][ B ][ C ]         │
│ └─┘     │                          │ Size guide              │
│         │                          │                         │
│         │                          │ ✓ In stock · 4 left     │
│         │                          │ Delivered Fri 14 Aug    │
│         │                          │ [   Add to cart   ]     │
│         │                          │ ♡ Save    ⇄ Compare     │
│         │                          │ Free 30-day returns     │
├─────────┴──────────────────────────┴─────────────────────────┤
│ Overview │ Specifications │ Reviews (218) │ Delivery         │
├──────────────────────────────────────────────────────────────┤
│ Specification table · 2 columns · grouped                    │
├──────────────────────────────────────────────────────────────┤
│ Reviews · rating breakdown · filter by size · sorted         │
├──────────────────────────────────────────────────────────────┤
│ Frequently bought with · 4 items                             │
│ Similar alternatives · 4 items                               │
└──────────────────────────────────────────────────────────────┘
```

Desktop rules:

- the decision column sticks while the gallery scrolls, so the price and action stay reachable
- hover zoom is an enhancement; a click still opens the full-screen viewer for shoppers who do not hover
- breadcrumbs are real navigation, reflecting the path the shopper took where possible
- extra width buys specification detail and review filtering, not larger images

---

# Component Hierarchy

```
ProductDetailPage
├── Breadcrumbs
├── ProductGallery
│   ├── GalleryMainView
│   ├── GalleryThumbnailStrip
│   │   └── GalleryThumbnail ×n
│   ├── GalleryZoomViewer
│   └── GalleryMediaBadge          video or 360 label
├── ProductSummary
│   ├── ProductTitle
│   ├── RatingSummary
│   │   ├── StarDisplay
│   │   └── ReviewCountLink
│   ├── PriceBlock
│   │   ├── CurrentPrice
│   │   ├── ReferencePrice
│   │   ├── SavingLabel
│   │   └── TaxNote
│   └── ShortDescription
├── VariantSelector
│   ├── VariantGroup ×n
│   │   ├── VariantGroupLabel
│   │   ├── SelectedValueLabel
│   │   └── VariantOption ×n
│   ├── SizeGuideAction
│   └── VariantUnavailableNotice
├── AvailabilityBlock
│   ├── StockStatus
│   ├── DeliveryEstimate
│   └── ReturnsSummary
├── PurchaseActions
│   ├── QuantityStepper
│   ├── AddToCartAction
│   ├── SaveForLaterAction
│   └── ShareAction
├── StickyPurchaseBar              mobile and desktop on scroll
├── DetailSections
│   ├── SpecificationTable
│   ├── ReviewsSection
│   │   ├── RatingBreakdown
│   │   ├── ReviewFilters
│   │   ├── ReviewItem ×n
│   │   └── ReviewsEmptyState
│   └── DeliveryReturnsPanel
└── RelatedItems
    ├── CompletionCarousel
    └── AlternativesCarousel
```

Reuse rules:

- `PriceBlock` is the single implementation of price, saving, and tax presentation across catalogue, detail, cart, and checkout.
- `VariantOption` is one component with selected, available, unavailable, and out-of-stock variants.
- Related item cards are the product's standard catalogue card, not a detail-page-specific one.

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

## Variant Selection

1. The option shows selection immediately, before any request completes.
2. Price, availability, delivery estimate, and gallery update together as one visual change, never staggered.
3. If a combination is unavailable, the option remains visible, marked unavailable, and the reason is stated: "Blue isn't available in size C."
4. Selecting an unavailable option offers the nearest alternative rather than silently doing nothing.
5. The selected combination is written to the URL so the exact variant can be shared.
6. Screen readers receive a polite announcement: "Size B selected. 1,395 dollars. In stock."

Never reset a previously chosen option when another option changes, unless the combination is impossible; in that case say what was changed and why.

## Variant Goes Out Of Stock While Selected

This is a real and frequent failure, and it must be handled explicitly.

1. On add-to-cart, availability is re-checked server-side.
2. If the variant has sold out, the add fails and the reason is stated at the action, not in a toast that disappears.
3. The variant is marked out of stock in the selector.
4. The nearest available alternative is offered, and a back-in-stock notification is offered.

```
┌──────────────────────────────┐
│ ⚠  Graphite, size B just     │
│    sold out.                 │
│                              │
│    Size C is in stock, or we │
│    can email you when B      │
│    returns.                  │
│    [ Switch to size C ]      │
│    [ Notify me ]             │
└──────────────────────────────┘
```

Never add an unavailable item to the cart and let checkout discover the problem.

## Add To Cart

1. The action enters a loading state on itself, labeled "Adding…".
2. Success confirms inline, near the action, with the variant named and the cart count updated.
3. Focus stays on the page. The shopper is not navigated away.
4. A confirmation offers the two onward paths.
5. Failure states the cause and preserves the configuration.

```
✓ Added · Graphite, size B
[ View cart ]   Keep shopping
```

## Quantity Change

1. The stepper enforces the real limit and states it when reached: "4 available."
2. Manual entry is allowed and validated on blur.
3. Quantity above available stock is refused with the reason, not silently clamped without explanation.

## Gallery Interaction

1. Tap or click opens a full-screen viewer with the current image active.
2. The viewer supports swipe, arrow keys, and a visible close control.
3. Escape closes the viewer and returns focus to the thumbnail that opened it.
4. Video is never autoplayed with sound and always shows duration and controls.

## Review Filtering

1. Filters apply to the review list only; the page does not reload.
2. The active filter is stated above the list with a one-tap clear.
3. Review count updates and is announced politely.
4. Reviews mentioning the shopper's selected variant are surfaced first when that data exists.

---

# States

Each region owns its states. A failed review load must not prevent a purchase.

## Loading — First Visit

The purchase decision loads first. Reviews and related items load after.

```
Gallery       → 1:1 frame with shimmer
Title         → two 70% width bars
Price         → single 30% width block, exact final height
Variants      → 4 swatch frames + 3 pill frames
Availability  → one 50% width bar
Action        → full width button frame
```

Rules:

- reserve the exact price height so nothing shifts when it arrives
- never render a placeholder price
- the add-to-cart action is disabled until price and availability are known, and its disabled state is explained: "Checking availability"

---

## Loading — Variant Change

Keep the current content visible.

Dim only the price, availability, and gallery to 60% while the new variant resolves.

Disable the purchase action for the duration, because adding a stale variant is a real error.

Resolution should complete within 300ms; beyond one second, show a thin progress line at the top of the decision column.

---

## Loading — Add To Cart

The button is the progress surface.

```
[  Adding…                 ]
```

The rest of the page stays interactive so the shopper can keep reading.

---

## Empty — No Reviews Yet

A new product with no reviews must not show an empty five-star row.

```
┌──────────────────────────────┐
│ No reviews yet               │
│                              │
│ Be the first to review this  │
│ chair after it arrives.      │
│                              │
│ [ Write a review ]           │
└──────────────────────────────┘
```

Never display "0.0 ★" or an average computed from no data.

---

## Empty — No Reviews Match The Filter

Distinct from having no reviews at all.

```
No reviews from buyers of size C.

[ Clear filter ]   [ Show all 218 reviews ]
```

---

## Empty — No Related Items

Remove the section rather than showing an empty carousel. An empty shelf reads as a broken page.

---

## Error — Variant Data Failed

The variant selector shows the failure and the purchase action is withheld.

```
┌──────────────────────────────┐
│ ⚠  We can't confirm sizes    │
│    right now.                │
│    [ Retry ]                 │
└──────────────────────────────┘
```

Never allow a purchase when the variant's price or stock is unknown.

---

## Error — Add To Cart Failed

State the cause distinctly, because the recovery differs:

- out of stock: offer alternative and notification
- quantity exceeded: state the available number
- session expired: sign in and restore the configuration
- network failure: retry with the configuration intact

```
┌──────────────────────────────┐
│ ⚠  We couldn't add this.     │
│    Your selection is saved.  │
│    [ Try again ]             │
└──────────────────────────────┘
```

---

## Error — Page Failed

Only when the product itself cannot load.

Distinguish a genuinely removed product from a temporary failure. A discontinued item shows alternatives and never a generic error.

```
This chair has been discontinued.

Three current alternatives:
[ ... ]   [ ... ]   [ ... ]
```

---

## Partial — Low Stock

Scarcity must be factual or absent.

```
✓ In stock · 4 left
```

Only display a remaining count when the number is real. Manufactured urgency is a trust cost that outlasts the sale.

---

## Partial — Delivery Estimate Unknown

Say what is known rather than omitting the topic.

```
In stock. Delivery date is calculated at checkout from your postcode.
```

---

## Success — Added To Cart

Confirmation names the variant, updates the cart indicator, and offers both paths without stealing the session.

---

## Permission-Limited — Price Requires Sign-In

In trade or wholesale contexts where price is account-specific, say so plainly instead of showing a misleading public price.

```
Sign in to see your trade price.
[ Sign in ]   Apply for an account
```

---

# Mobile Behavior

- Touch targets minimum 44×44 for swatches, steppers, and gallery controls, with 8px minimum separation.
- Sticky purchase bar appears only after the inline action leaves the viewport, and shows the current price so the shopper never scrolls back to check.
- Gallery is swipeable with visible position dots and a count, so the shopper knows how many images exist.
- Full-screen zoom is reachable by a tap target, not only pinch, because pinch is undiscoverable.
- Accordions for specifications, reviews, and delivery; only overview open by default.
- Size guide opens in a bottom sheet, not a new page, so the selection is not lost.
- Related items scroll horizontally with a peeking next card to indicate more content.
- Never require horizontal scroll for variant options; wrap them instead.
- Images are served at device resolution with explicit dimensions to prevent layout shift.

---

# Desktop Expansion

Added space is spent on:

- a sticky decision column so price, variant, and action stay available during long scrolls
- the full specification table visible without expansion
- review filtering by rating, variant, and recency alongside the list
- hover zoom as an enhancement over the click-to-open viewer
- keyboard shortcuts for gallery navigation

Added space is never spent on:

- larger hero images that push the price below the fold
- a second column of marketing copy
- autoplaying video in the gallery slot
- more related-item carousels than the shopper can evaluate

---

# Accessibility Requirements

- Variant groups are radio groups with a group label; the selected value is exposed as text next to the label, not only by swatch appearance.
- Colour swatches always carry a text name. Colour alone is never the only identifier.
- Unavailable options use `aria-disabled` with an accessible name that includes the reason, and remain focusable so the shopper can discover why.
- Price and availability changes are announced through a polite live region containing the variant, the new price, and the new stock status.
- Add-to-cart success and failure are announced; failure uses assertive politeness because the shopper is waiting on the result.
- The rating summary has a text equivalent: "Rated 4.6 out of 5 from 218 reviews".
- The gallery is keyboard navigable, the viewer traps focus while open, Escape closes it, and focus returns to the trigger.
- Images have descriptive alternative text stating the view, not the file name: "Graphite chair, side view showing lumbar support".
- The specification table uses real table semantics with row headers.
- Saving and stock urgency survive greyscale, using text and iconography rather than red alone.
- At 200% zoom the decision column reflows below the gallery without clipping the action.
- Reduced motion disables gallery auto-transitions, zoom easing, and carousel scrolling animation.
- The sticky bar never overlaps the last focusable element; page padding accounts for its height.

---

# Data Requirements

Before implementation, confirm for every product:

```
Canonical variant matrix and which combinations exist

Price per variant, and whether tax is included

Reference price basis and how long it may be shown

Stock quantity per variant and its refresh frequency

Whether stock is reserved on add-to-cart or only at checkout

Delivery estimate source and the inputs it needs

Returns window and exclusions

Specification schema and units

Review source, moderation state, and variant association

Whether price visibility depends on the account
```

Never present a delivery date the fulfilment system has not committed to.

A saving computed against a reference price that was never charged is a legal and trust risk, not a design choice.

---

# Performance Requirements

- The first gallery image, title, price, and variant selector render within one second on a warm cache.
- The primary image is prioritised for loading; remaining gallery images load lazily.
- Images carry explicit width and height so no layout shift occurs.
- Variant changes resolve from data already loaded with the page where the matrix is small; only large matrices fetch on change.
- Reviews and related items load after the purchase decision is interactive, and never block it.
- Stock is verified server-side at add-to-cart, regardless of what the client last saw.
- Gallery zoom assets load on demand, not with the page.

---

# Anti-Patterns

Never build:

- a price the shopper must scroll to find
- variant options that disappear when unavailable instead of being marked
- an add-to-cart action placed above the variant selectors
- automatic navigation to the cart after adding, ending the browse session
- a countdown timer or "3 people are viewing" claim that is not measured
- a remaining-stock number that is not the real number
- colour swatches with no colour name
- a five-star row on a product with no reviews
- reviews that cannot be filtered on a product with hundreds of them
- an "out of stock" discovery that happens first at checkout
- a full-screen interstitial offer that covers the purchase action
- specification content written as marketing prose instead of structured values
- a discontinued product returning a generic error page
- pinch-zoom as the only way to see detail
- a sticky bar that covers content and cannot be dismissed or scrolled past

---

# Pattern Output Example

```
Product

Office Furniture Ecommerce


Primary Question

Is this the right chair, in my size, arriving in time?


Variant Axes

Colour ×4, Size ×3, matrix of 12 with 2 non-existent


Price Basis

Tax inclusive, reference price shown for 30 days maximum


Availability

Per-variant stock, verified server-side at add-to-cart


Delivery

Estimate from fulfilment API, postcode-refined at checkout


Primary Action

Add to cart, variant named on the button


Mobile

Gallery 60% of first viewport, sticky price and action bar


Unavailable Combination

Option visible, marked unavailable, reason stated, alternative offered


Sold-Out-While-Selected

Server re-check, inline failure, switch or notify options


Reviews

218, filterable by size and rating, variant-matched first


Related Items

Completion shelf and alternatives shelf, labeled separately


Accessibility

Radio-group variants, polite price and stock announcements


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Price is visible without scrolling on mobile
- [ ] Variant selectors appear before the purchase action
- [ ] Selecting a variant updates price, stock, delivery, and image together
- [ ] Unavailable combinations stay visible, marked, and explained
- [ ] The selected variant is in the URL and restores on a shared link
- [ ] A deep link with a variant opens with it pre-selected
- [ ] Stock is re-verified server-side at add-to-cart
- [ ] Sold-out-while-selected offers alternative and notification
- [ ] Adding to cart confirms inline and does not navigate away
- [ ] Save for later exists and works while signed out or prompts sign-in without losing the item
- [ ] Quantity limits state the real available number
- [ ] Reviews are filterable and the filtered-empty state differs from no-reviews
- [ ] No star rating is shown for a product with zero reviews
- [ ] Related item sections are removed when empty rather than shown blank
- [ ] Discontinued products show alternatives, not an error page
- [ ] Every colour has a text name
- [ ] Price and stock changes are announced politely to screen readers
- [ ] Gallery is keyboard operable and Escape returns focus correctly
- [ ] Images have dimensions and cause no layout shift
- [ ] Sticky bar does not obscure the last focusable element
- [ ] Savings and urgency survive greyscale
- [ ] 200% zoom keeps price and action reachable
- [ ] Reduced motion disables gallery and carousel animation

---

# Final Rule

A product detail page succeeds when the shopper has no unanswered question standing between them and the purchase.

Every element must justify itself against one question:

Does this remove a reason not to buy, or does it only decorate the item?

If it only decorates, it is competing with the decision. Remove it.
