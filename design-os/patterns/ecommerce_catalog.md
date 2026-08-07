# Ecommerce Catalog Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Ecommerce Intelligence, Layout Intelligence, Cards Component, Search Component, Lists Component, Empty States System, Loading States System, Error States System

---

# Purpose

The Ecommerce Catalog Pattern defines the complete solution for screens whose job is to help someone find a product worth buying.

A catalog is not a database view with pictures.

A catalog is a narrowing device. Every control on the page exists to reduce a large set to a considered set.

If a user scrolls a catalog for two minutes and cannot name a single candidate, the catalog failed regardless of how many products it contained.

---

# When To Use

Use this pattern when:

- more items exist than a user can evaluate at once
- items share comparable attributes such as price, size, colour, or rating
- the user is choosing rather than retrieving
- discovery, comparison, and selection happen in one continuous session

---

# When Not To Use

Do not use this pattern when:

- the user already knows the exact item — use Search with direct results
- fewer than eight items exist — present them as a single list with no filtering chrome
- items are not comparable to each other — use a curated landing section
- the primary task is reordering a previous purchase — use an order history list

The most common product mistake is shipping faceted filtering for a catalogue of twelve products, which adds ceremony without reducing effort.

---

# User Goal

The primary goal is always one of three:

```
What is available?

↓

Which of these fits my constraints?

↓

Is this specific item the right one?
```

The catalog owns the first two questions completely and hands the third to the product detail screen.

A catalog must let a first-time visitor apply their single most important constraint within two interactions.

---

# User Journey

```
Arrives with an intent, precise or vague

↓

Scans the first screen for relevance

↓

Applies the constraint that matters most

↓

Reduces the set to a comparable size

↓

Compares two or three candidates

↓

Opens one candidate for detail

↓

Returns to the narrowed set if rejected

↓

Adds to cart and continues or checks out
```

The return step is the one products forget.

A catalog that loses scroll position, filters, or page number on back navigation forces the user to redo the entire narrowing they just completed.

---

# UX Flow

## Entry

The user arrives from:

- a navigation category, browsing without a formed intent
- a search query, expecting the query reflected in the result header
- a campaign or ad link, expecting the promised subset already filtered
- a back navigation from a product, expecting their previous state intact

Each entry sets a different starting filter state, and each must be visible.

A campaign link that silently pre-applies filters looks like a broken catalog when the count seems too low.

---

## Scan

Within the first viewport, the user must be able to determine:

- what kind of products this page contains
- how many results exist
- which filters are currently active
- the price range they are looking at

---

## Narrow

Every filter action follows the same contract:

```
Filter selected

↓

Result count updates

↓

Grid updates

↓

Active filter appears as a removable chip
```

A filter the user cannot see is a filter the user cannot undo.

Undoable narrowing is what makes users willing to narrow aggressively.

---

## Compare

Comparison happens by scanning cards side by side, so cards must expose the attributes people actually compare.

Price, a differentiating attribute, and availability belong on the card. Everything else belongs on the detail screen.

---

## Select

The catalog surfaces the purchase action where the item does not require a decision, and defers it where it does.

Single-variant items support quick add. Multi-variant items open a variant chooser rather than guessing.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Header · Category name   │
├──────────────────────────┤
│ [ Search this category ] │
├──────────────────────────┤
│ Filter ▾   Sort ▾    124 │  sticky
├──────────────────────────┤
│ ●Under £50 ✕  ●Blue ✕    │  active chips
├──────────────────────────┤
│ ┌──────────┐┌──────────┐ │
│ │  image   ││  image   │ │
│ │ Title    ││ Title    │ │
│ │ £42      ││ £38      │ │
│ │ ★4.6 (81)││ Low stock│ │
│ │ [ Add ]  ││ [ Add ]  │ │
│ └──────────┘└──────────┘ │
│ ┌──────────┐┌──────────┐ │
│ │  ...     ││  ...     │ │
│ └──────────┘└──────────┘ │
├──────────────────────────┤
│ [ Load more ]  24 of 124 │
└──────────────────────────┘
│ Bottom navigation        │
└──────────────────────────┘
```

Mobile rules:

- Two cards per row is the default. One card per row only when the image must carry fine detail such as fabric or artwork.
- Filter and sort open as bottom sheets, never as inline dropdown menus.
- The filter bar is sticky so narrowing is always one tap away from any scroll position.
- The result count sits next to the filter control because it is the feedback for filtering.
- Active filter chips scroll horizontally and each chip removes itself when tapped.
- Card touch targets, including the quick add control, are minimum 44×44.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Header · Category · Search                 │
├────────────────────────────────────────────┤
│ Filter ▾  Sort ▾            124 results    │
├────────────────────────────────────────────┤
│ ●Under £50 ✕   ●Blue ✕   Clear all         │
├──────────────┬──────────────┬──────────────┤
│ Card         │ Card         │ Card         │
├──────────────┼──────────────┼──────────────┤
│ Card         │ Card         │ Card         │
├──────────────┴──────────────┴──────────────┤
│ ‹ 1 2 3 4 5 ›                              │
└────────────────────────────────────────────┘
```

Three columns, filters still in a sheet, pagination becomes visible because the viewport shows enough rows for page boundaries to feel meaningful.

---

## Desktop

```
┌───────────────┬────────────────────────────────────────┐
│ Category      │ Running Shoes · 124 results            │
│ ─────────     │ Sort: Recommended ▾   Grid ▾ List ▾    │
│ Price         ├────────────────────────────────────────┤
│ ☐ Under £50   │ ●Under £50 ✕  ●Blue ✕     Clear all    │
│ ☐ £50–£100    ├──────────┬──────────┬──────────┬───────┤
│ ☐ £100+       │ Card     │ Card     │ Card     │ Card  │
│               ├──────────┼──────────┼──────────┼───────┤
│ Colour        │ Card     │ Card     │ Card     │ Card  │
│ ☐ Black (48)  ├──────────┼──────────┼──────────┼───────┤
│ ☐ Blue (22)   │ Card     │ Card     │ Card     │ Card  │
│               ├──────────┴──────────┴──────────┴───────┤
│ Availability  │ ‹ 1 2 3 4 5 ›        Showing 1–24      │
│ ☐ In stock    │                                        │
└───────────────┴────────────────────────────────────────┘
```

Desktop rules:

- Filters become a persistent left rail because permanently visible filters get used more than hidden ones.
- Four columns is the practical ceiling. Five produces cards too small to compare.
- Facet counts are shown next to each option so users can predict the outcome before clicking.
- The result header stays fixed to the top of the results column during scroll so the count and sort remain reachable.

---

# Component Hierarchy

```
CatalogPage
├── CatalogHeader
│   ├── CategoryTitle
│   ├── ResultCount
│   ├── InlineSearch
│   └── ViewToggle              grid | list
├── FilterRail                  desktop
│   └── FacetGroup ×n
│       ├── FacetLabel
│       ├── FacetOption ×n
│       │   ├── Checkbox
│       │   ├── OptionLabel
│       │   └── OptionCount
│       └── ShowMoreFacets
├── FilterSheet                 mobile and tablet
│   ├── SheetHeader
│   ├── FacetGroup ×n
│   └── SheetFooter
│       ├── ClearAllAction
│       └── ApplyAction         shows live count
├── SortControl
├── ActiveFilterBar
│   ├── FilterChip ×n
│   └── ClearAllAction
├── ProductGrid
│   └── ProductCard ×n
│       ├── ProductMedia
│       │   ├── PrimaryImage
│       │   └── StatusBadge     sale | low stock | sold out
│       ├── ProductTitle
│       ├── PriceBlock
│       │   ├── CurrentPrice
│       │   └── CompareAtPrice  conditional
│       ├── RatingSummary
│       ├── VariantSwatches     optional
│       └── QuickAddAction
├── PaginationControl
└── CatalogStates
    ├── SkeletonGrid
    ├── EmptyCatalogState
    ├── NoResultsState
    └── LoadErrorState
```

Reuse rules:

- `ProductCard` is one component with variants. Never a card per category.
- The filter sheet and the filter rail render the same facet components with different containers.
- Skeletons render the same grid geometry as real cards so nothing shifts on arrival.

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

New state is understandable and reversible
```

## Applying A Filter

1. The option shows its selected state immediately, before any network response.
2. The result count enters a pending style while the query runs.
3. Cards fade to 60% opacity rather than being replaced by skeletons.
4. New results replace the grid, scroll returns to the top of the results region only, not the page.
5. A removable chip appears in the active filter bar.
6. The filter is written to the URL so the narrowed view is shareable and survives refresh.

On mobile the sheet stays open while the user selects multiple facets, and the apply button carries the live count: `Show 38 results`. This lets people build a compound filter without watching the grid move behind the sheet.

## Sorting

1. The sort control shows the chosen option immediately.
2. The grid reorders from the first result. Sorting always returns to page one because a page number means nothing after reordering.
3. The sort key is written to the URL.

Default sort must be a deliberate decision, documented, and never random. Relevance for search results, curated ranking for browse.

## Quick Add

1. Tapping quick add shows an inline pending state on the button itself.
2. On success the button becomes a confirmation for 2 seconds and the cart indicator increments.
3. The user stays in the catalog. The page must never navigate away on quick add.
4. If the item has multiple variants, quick add opens the variant chooser instead of adding, and the chooser presents only variants currently purchasable.

## Quick Add Failure

If the add fails because stock disappeared between render and click:

1. The button returns to its resting state.
2. An inline message replaces the price line: `Sold out while you were browsing.`
3. The card updates to its sold-out treatment.
4. The cart indicator does not change.

Never show a success toast and then silently drop the item.

## Pagination Versus Infinite Scroll

Choose deliberately, and choose once per catalog.

Use pagination when:

- users need to return to a known position
- the catalog is browsed repeatedly by the same people
- a footer contains content that matters
- results are compared across sessions

Use infinite scroll when:

- browsing is exploratory and position does not matter
- the primary device is mobile and the set is visually driven
- there is no meaningful footer

Use load-more when unsure. It gives the pace of infinite scroll with the position stability of pagination, and it is the correct default for most catalogs.

Whichever is chosen:

- the current position must be in the URL
- back navigation from a product must restore the exact scroll offset and loaded page count
- total result count is always visible, so users know the size of what they are working through

---

# States

Every region owns its own states. A failing facet count must not blank the grid.

## Loading — First Visit

Skeleton cards matching final card dimensions exactly, including the image aspect ratio.

```
Product card → image block + 2 text bars + price bar + button bar
Facet group  → label bar + 4 option bars
Result count → count bar
```

Render the number of skeletons that will fit the first viewport, not an arbitrary twelve.

No spinners. The grid geometry is known before data arrives.

---

## Loading — Refresh Or Filter Change

Keep the previous results visible at 60% opacity.

Disable the quick add controls during the transition so nobody adds an item that is about to disappear.

Show a thin progress line at the top edge of the results region.

Never replace known-good results with skeletons. A user who sees skeletons after clicking a filter cannot tell whether the filter worked.

---

## Empty — Catalog Has No Products

This is a merchandising state, not a user error.

```
┌──────────────────────────────┐
│        [illustration]        │
│                              │
│  Nothing here yet            │
│                              │
│  We're adding products to    │
│  this category this week.    │
│                              │
│  [ Browse all products ]     │
│  Notify me when it's ready   │
└──────────────────────────────┘
```

Never render an empty grid with functioning filters. Filtering nothing is a confusing experience.

---

## Empty — No Results For This Filter Combination

Different from having no products at all, and far more common.

Required:

- state which filters produced zero
- offer removal of the single most restrictive filter
- offer to clear everything
- show the nearest set that does have results

```
┌────────────────────────────────────────┐
│ No results for Blue · Under £50 ·      │
│ In stock                               │
│                                        │
│ Removing "Under £50" gives 22 results. │
│                                        │
│ [ Remove price filter ]  [ Clear all ] │
└────────────────────────────────────────┘
```

Facet options that would produce zero results are disabled and show a count of zero rather than being hidden. Hiding them makes the filter panel appear to change shape unpredictably.

---

## Error — Results Region Failed

The grid shows the failure. Filters, header, and navigation keep working.

```
┌──────────────────────────────┐
│ ⚠  Couldn't load products    │
│    Your filters are saved.   │
│    [ Retry ]                 │
└──────────────────────────────┘
```

Retry re-runs only the results query and preserves every active filter.

---

## Error — Page Failed

Only when nothing can load, including navigation.

Required: plain cause, a retry, and a route to support carrying a reference identifier.

---

## Partial — Some Facet Data Unavailable

When facet counts cannot be computed, render the facet options without counts rather than removing the facet.

Label the group honestly: `Counts unavailable`.

A filter that works without a count is more useful than a filter that vanished.

---

## Stale — Price Or Stock Changed Since Render

When a background revalidation finds a changed price on a visible card, update the price and mark it briefly rather than silently swapping the number.

For a card the user is actively interacting with, defer the update until the interaction ends.

---

## Success

Quick add confirms on the card itself, near the origin of the action.

```
┌──────────────┐
│    image     │
│ Trail Runner │
│ £42          │
│ [ ✓ Added ]  │
└──────────────┘
```

The cart indicator increments with a single subtle animation, and the confirmation reverts after 2 seconds so the card returns to a purchasable state.

---

## Permission-Limited — Restricted Or Region-Locked Items

When an item exists but cannot be purchased by this visitor, show the card with a clear reason rather than a disabled button with no explanation.

```
Not available in your region
[ See similar items ]
```

Never render a purchase button that fails on click.

---

# Mobile Behavior

- Touch targets minimum 44×44, including quick add and swatch controls.
- Filter and sort open as bottom sheets that can be dismissed by swipe and by an explicit close control.
- The filter sheet's apply button shows the live result count so users know the outcome before committing.
- Active filter chips are horizontally scrollable with a visible fade at the edge indicating more.
- Images use responsive sources sized to the actual rendered width, never desktop assets scaled down.
- Card text truncates to two lines maximum with the full title available on the detail screen.
- Never require pinch zoom to read a price.
- Pull to refresh revalidates stock and price without resetting filters.

---

# Desktop Expansion

Added space is spent on:

- a persistent filter rail so narrowing needs no modal
- facet counts that make filter outcomes predictable
- a fourth column, increasing comparable items per screen
- hover-revealed secondary imagery showing the product from another angle
- a list view option exposing more attributes per row for spec-driven comparison

Added space is never spent on:

- larger images that reduce the number of comparable items
- carousels of unrelated recommendations above the results
- promotional banners between grid rows that break the scanning rhythm

---

# Accessibility Requirements

- The result count lives in a polite live region so filter outcomes are announced: `38 results`.
- Facet checkboxes are real checkboxes with associated labels, grouped in a fieldset with a legend naming the facet.
- Active filter chips are buttons with accessible names stating the removal action: `Remove filter: Under £50`.
- Applying a filter moves focus nowhere. Focus stays on the control just used so keyboard users can continue selecting.
- The filter sheet traps focus while open, returns focus to the trigger on close, and closes on Escape.
- Each product card is a single primary link with an accessible name containing title, price, and availability. Quick add is a separate, adjacent tab stop.
- Availability and sale status are conveyed by text, not colour or badge colour alone, so the catalog survives greyscale.
- Price contrast meets 4.5:1 against the card surface. Compare-at prices meet the same ratio despite being de-emphasised.
- Pagination controls announce the current page and total pages.
- Infinite scroll and load-more announce arrivals politely: `24 more products loaded`.
- Respect reduced motion: cards appear rather than staggering in, and the added-to-cart confirmation cross-fades without scale.
- At 200% zoom the grid reflows to fewer columns without horizontal scrolling.

---

# Data Requirements

Before implementation, confirm for every catalog:

```
Source of truth for the product set

Which attributes are filterable

Which attributes are sortable

Facet count computation and its freshness

Stock accuracy window

Price currency, tax treatment, and display rule

Variant model: how many axes, how many values

Default sort order and its justification

Page size for each breakpoint

Behavior when the inventory service is unavailable

Which items are hidden versus shown as unavailable
```

A facet that is offered but not backed by clean attribute data will return misleading results, and users abandon a filter permanently after it lies to them once.

Never expose a filter whose underlying attribute is incomplete across the catalog.

---

# Performance Requirements

- First row of product cards visible under one second on a warm cache.
- Above-the-fold product images are eagerly loaded with explicit width and height. Everything below is lazy loaded.
- Images are served in a modern format at the exact rendered size per breakpoint.
- Filtering returns in under 400ms, or the pending state must be visible for at least 200ms so the transition does not flicker.
- Facet counts are computed server-side in the same query as the results, never as a second round trip per facet.
- A superseded filter request is cancelled when the user changes the filter again.
- Load-more appends without re-rendering existing cards.
- The grid uses a fixed aspect ratio container for images so no layout shift occurs during image load.

---

# Anti-Patterns

Never build:

- a catalog where applying a filter reloads the entire page
- filters whose effect is invisible because no chips or counts are shown
- infinite scroll that loses position on back navigation
- a quick add that navigates to the cart and abandons the browsing session
- quick add on a multi-variant product that silently picks a variant
- facet options that disappear when their count reaches zero
- sold-out products removed from results without explanation when a user explicitly filtered for them
- a grid of cards with different heights caused by variable title length
- price shown in a colour that fails greyscale against a sale price
- a sort control with no default stated, producing a different order on each visit
- more than four columns of products on desktop
- promotional interstitials injected between grid rows
- a result count that does not update when filters change

---

# Pattern Output Example

```
Product

Outdoor Equipment Store


Primary Question

Which of these fits my constraints?


Layout

Persistent filter rail + 4-column grid + pagination


Card Attributes

Image, title, price, rating, availability, quick add


Filter Model

Price, colour, size, brand, availability — all with counts


Default Sort

Curated ranking, documented in merchandising rules


Pagination

Load-more, 24 per page, position in URL


Quick Add

Single-variant only; multi-variant opens chooser


Mobile

Two columns, filter and sort as bottom sheets


Zero Results

Names the restrictive filter and offers targeted removal


Out Of Stock

Shown with reason and similar-item route, never hidden


Accessibility

Polite count announcements, greyscale-safe badges, 200% zoom verified


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The result count is visible and updates on every filter change
- [ ] Every active filter appears as a removable chip
- [ ] Filters, sort, and position are all encoded in the URL
- [ ] Back navigation from a product restores scroll, filters, and loaded pages
- [ ] Zero-result state names the restrictive filter and offers targeted removal
- [ ] Facet options with zero results are disabled, not hidden
- [ ] Filter loading dims existing results instead of showing skeletons
- [ ] Quick add keeps the user in the catalog
- [ ] Quick add on multi-variant items opens a chooser
- [ ] Quick add failure reverts cleanly and explains why
- [ ] Out-of-stock items state their status in text, not colour
- [ ] Cards have a fixed image ratio and no layout shift
- [ ] Mobile uses bottom sheets with a live count on apply
- [ ] Touch targets are 44×44 minimum
- [ ] Card and quick add are separate tab stops
- [ ] Filter sheet traps focus and restores it on close
- [ ] Grid reflows at 200% zoom without horizontal scroll
- [ ] Reduced motion respected on card entry and add confirmation

---

# Final Rule

A catalog earns its place by shortening the distance between too many options and one confident choice.

Every control must justify itself against one question:

Does this help the user eliminate something?

If it does not eliminate, it delays.
