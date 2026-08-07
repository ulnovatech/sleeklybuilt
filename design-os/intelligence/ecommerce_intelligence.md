# Ecommerce Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, UX Intelligence, Mobile Intelligence, Ecommerce Catalog Pattern, Product Details Pattern, Checkout Pattern

---

# Purpose

Ecommerce Intelligence decides how a commercial catalogue is structured, presented, priced, and honoured.

It answers the questions that determine whether a store converts and whether customers return:

- how the catalogue is organised, and in whose vocabulary
- what is promoted, and on what evidence
- how price is disclosed, and when the true total becomes visible
- how variants and availability are represented truthfully
- how much friction checkout is allowed to carry
- what happens after payment, when confidence is either earned or lost

The Ecommerce Catalog, Product Details, and Checkout patterns build the screens.

Ecommerce Intelligence decides what those screens must say.

---

# Core Philosophy

A store does not sell by persuading.

A store sells by removing uncertainty.

Every purchase decision is a risk calculation the customer performs silently:

- is this the right item
- will it arrive when I need it
- is this the real price
- what happens if it is wrong

Each unanswered question is a reason to leave.

Deception resolves a question temporarily and destroys the relationship permanently.

Honesty is not a compliance requirement. It is the conversion strategy.

---

# Ecommerce Decision Pipeline

Every store follows:

```
Product Classification

↓

Catalogue Complexity

↓

Buyer Decision Mode

↓

Taxonomy and Findability

↓

Merchandising Strategy

↓

Price Presentation

↓

Variant Strategy

↓

Availability Truthfulness

↓

Trust Requirements

↓

Cart Strategy

↓

Checkout Friction Budget

↓

Post-Purchase Confidence

↓

Handoff to Ecommerce Patterns
```

Never begin with a product grid.

---

# Step 1 — Classify Catalogue Complexity

Catalogue size and variance determine whether discovery is browse-led or search-led.

| Catalogue | Scale | Primary discovery | Requirements |
| --- | --- | --- | --- |
| Single offer | 1–10 items | Narrative | No search, no filters, story-led selling |
| Curated | 10–100 | Browse | Flat categories, sorting, no facets |
| Structured | 100–2,000 | Browse plus search | Categories, a small facet set, reliable search |
| Deep | 2,000–50,000 | Search | Ranking discipline, facets, saved comparisons |
| Marketplace | 50,000+, multi-seller | Search | Attribute normalisation, seller trust, duplicate control |

Rules:

- Do not build faceted search for a curated catalogue. Filters over a small catalogue add work without reducing it.
- Do not rely on browsing for a deep catalogue. Category trees deep enough to hold it are deeper than anyone will navigate.
- Attribute variance matters as much as count. A hundred items with twenty differentiating specs needs comparison tooling; a thousand near-identical items does not.

Consequence of misclassifying: either a store where nothing can be found, or a store buried in controls nobody uses.

---

# Step 2 — Classify the Buyer Decision Mode

The same catalogue serves different modes. Identify the dominant one and design for it.

## Replenishment

The customer knows exactly what they want and has bought it before.

Optimise:

- reorder from history in the fewest steps
- search by exact name, code, or previous order
- saved lists and default payment and address

Never force discovery on a replenishment buyer.

## Considered Comparison

The customer is choosing between candidates on specification or price.

Optimise:

- complete, consistent specifications across candidates
- side-by-side comparison
- reviews that address durability and fit
- clear differentiation between similar items in the same range

Missing specifications are the primary cause of abandonment in this mode, because the customer leaves to find them elsewhere and buys there.

## Inspiration

The customer is browsing without a target and may not buy today.

Optimise:

- imagery quality and scale
- collections and editorial grouping
- saving and returning
- gradual narrowing rather than filtering

## Urgent Need

A part has failed, a prescription is needed, a gift is dated.

Optimise:

- availability and delivery date before anything else
- compatibility confirmation
- the shortest path from arrival to payment

For this mode, delivery date is a more important fact than price.

## Gift Purchase

The buyer is not the user.

Optimise:

- navigation by recipient and occasion
- price-band entry points
- sizing uncertainty handling
- returns and exchange terms stated before purchase
- gift receipts and delayed delivery

Consequence of designing one mode only: a store that serves browsing beautifully and fails the customer who arrived to reorder a filter for their boiler.

---

# Step 3 — Decide Taxonomy and Findability

## Taxonomy

Categories must use customer vocabulary, not internal or supplier structure.

Rules:

- Name categories with the words customers use when they ask for the item aloud.
- Maximum three levels of category depth. Beyond that, use facets.
- Every item must be reachable from at least one category, and items reachable from none must be found before launch.
- Do not create a category with fewer items than makes it worth entering.

## Search

Search is required whenever the catalogue exceeds roughly a hundred items, and always when the dominant mode is replenishment or urgent need.

Decide:

- what fields are searchable, including codes, synonyms, and compatibility identifiers
- synonym and misspelling handling for domain terms
- whether results are ranked by relevance, availability, or margin, and disclose ranking when it is commercial
- what a zero-result query returns, which must be a broadened result set or a stated next action, never a dead end

## Facets

Facet only on attributes that satisfy all three conditions:

- present and accurate on nearly every item
- meaningful to the customer without explanation
- capable of excluding a substantial part of the catalogue

Rules:

- Show result counts per facet value.
- Never offer a facet value that returns nothing.
- Never facet on an internal classification the customer cannot define.
- Availability and delivery speed are facets, not afterthoughts.

Detailed behaviour belongs to the Ecommerce Catalog Pattern and the Search Pattern.

---

# Step 4 — Decide Merchandising Strategy

Merchandising is the decision about what a customer sees first when they have not chosen.

## Default Sort

- Search results: relevance.
- Category listings: best selling within a recent window, which reflects real demand.
- New arrivals: only when novelty is the actual value, as in fashion seasons.
- Price ascending as a default signals a discount store; choose it deliberately or not at all.

## Promotion Placement

Rules:

- Promotions may occupy positions the customer is not using to decide, never positions that carry decision content.
- A promoted item mixed into results must be labelled as promoted.
- The number of promotional slots must be fixed, so merchandising pressure cannot erode the listing.

## Personalisation

Personalise only when real signal exists.

- No history: show demand-based and category-representative items.
- Some history: recently viewed and continuation of an unfinished decision.
- Rich history: related purchases and replenishment reminders.

Never present a recommendation as personalised when it is a static list. Customers detect this quickly and it discredits every other claim on the page.

## Cross-Sell

Rules:

- Cross-sell on the product page must be genuinely related, either compatible, complementary, or an alternative in the same range.
- Cross-sell in the cart must be low-consideration additions only, and must never obscure the checkout action.
- Never cross-sell during payment.

---

# Step 5 — Decide Price Presentation

Price presentation is where most stores choose short-term conversion over trust, and pay for it in returns, disputes, and abandonment.

## Total Cost Visibility

Rule: disclose each cost component at the earliest point at which it is knowable.

- Tax convention follows the market: display tax-inclusive prices where customers expect them, tax-exclusive where business buyers expect them, and state which is shown.
- Shipping cost must be estimable before the customer enters payment details. If it depends on destination, ask for the destination early rather than revealing the cost late.
- Duties and import charges for cross-border orders must be stated before payment, including who pays them.
- Any surcharge, handling fee, or minimum-order fee must appear in the cart, not on the confirmation.

Discovering a cost at the final step is the most expensive abandonment in commerce, because the customer has already invested effort and now distrusts the store.

## Reference and Comparison Prices

- A struck-through comparison price is only permitted when the item was genuinely offered at that price, and the basis should be stateable.
- Never present a permanent discount. A price that is always reduced is simply the price, and presenting it otherwise trains customers to disbelieve all pricing.
- Percentage claims must be computed from the real reference price.

## Urgency and Scarcity

- Countdown timers are permitted only when the offer actually ends at that moment.
- Never reset a timer on reload.
- Never state demand pressure that is not measured.

Fabricated urgency converts once and is remembered.

## Structural Price Clarity

- Show unit price where sizes vary, so a larger pack can be compared honestly.
- Show the full billing cadence for subscriptions, including the price after any introductory period, the renewal date, and how to cancel.
- Show the total repayable for instalment options, not only the instalment amount.
- A "from" price must be reachable by a real, purchasable configuration.
- State currency explicitly when more than one market is served.

## Hidden Pricing

Price may be withheld only when it is genuinely determined by specification or negotiation.

When it is withheld, state what determines it and give a range or a typical figure.

"Contact us for pricing" with no context is a filter that removes qualified buyers.

---

# Step 6 — Decide Variant Strategy

## Variant or Separate Product

Treat options as variants of one product when the customer is making one decision and choosing an attribute within it, such as size or colour.

Treat them as separate products when the choice is a different decision, such as a different capacity tier with different capability, or a bundle versus a single item.

Consequence of over-merging: a variant selector that hides meaningful differences, producing wrong purchases and returns.

Consequence of over-splitting: near-duplicate listings that dilute reviews and confuse search results.

## Variant Presentation Rules

- Maximum three variant axes. Beyond that, use a configurator or split the product.
- Every option must show its own availability state before selection, not after.
- Every option that changes price must show the change before selection.
- Options with visual differences must change the imagery on selection.
- Never require the customer to select a combination in order to discover it does not exist.

## Unavailable Combinations

Decide the behaviour explicitly:

- disable the option and state why, which is preferable to hiding it because hiding removes the customer's ability to understand the range
- offer a restock notification where restock is intended
- offer the nearest available alternative where it is not

## Defaults

- Preselect a variant only when a genuine default exists, such as the most commonly purchased size.
- Never preselect a variant that is out of stock.
- Never preselect the most expensive option by default.

---

# Step 7 — Decide Availability Truthfulness

Stock representation is a promise. Every state must be defined and every state must be real.

Required states and their meaning:

- In stock: available now and dispatchable within the stated window.
- Low stock: only when a real count is known and near a defined threshold. If the count is shown, it must be the true count.
- Backorder: not held, but ordered, with a stated expected date.
- Preorder: not yet released, with a stated release date and a stated charge point.
- Out of stock: unavailable, with restock intent stated as known or unknown.
- Discontinued: never returning, with an alternative offered.

Rules:

- Never invent a low-stock count to create pressure.
- Never show a generic "in stock" for items dispatched from a supplier with an unknown lead time; state the lead time.
- Revalidate stock at cart entry and again at payment, because the honest failure is at checkout and the dishonest failure is after payment.
- If stock is lost between payment and dispatch, the recovery path is proactive contact with options, not silence.

Consequence of untruthful availability: cancellation after payment, which produces refunds, support cost, and a customer who will not return.

---

# Step 8 — Select Trust Signals by Risk

Trust requirements scale with perceived risk. Assess risk first.

Risk factors:

- price magnitude relative to the customer's normal spend
- brand unfamiliarity
- delivery uncertainty or long lead times
- fit, sizing, or compatibility uncertainty
- sensitivity of the data collected
- cost and effort of returning the item
- consequence of the item being wrong, which is highest for medical, safety, and professional equipment

## The Trust Ladder

Apply in order. Each rung is stronger than decoration and cheaper than fabrication.

1. Policy clarity: returns window, return cost, shipping timelines, contact route, and who the seller legally is.
2. Verifiable specifics: exact dimensions, materials, compatibility lists, weights, included contents, and country of dispatch.
3. Real imagery: the actual item, at scale, from multiple angles, including in-use context.
4. Third-party validation: payment marks, certifications, and accreditations that genuinely apply.
5. Social proof: review counts and distributions where reviews are real and unfiltered, including negative ones.
6. Risk reversal: guarantees, free returns, trial periods, and stated refund timelines.

## When Strong Proof Is Unavailable

New stores have no reviews and no volume. The correct response is never to fabricate.

Substitute:

- greater specificity, since detail is itself evidence of competence
- transparency about the operation, including who is behind it and where items ship from
- risk reversal, because a store willing to absorb the return cost is making a credible statement
- responsiveness, with a real contact route and a stated response time
- provenance, such as supplier or manufacturer detail where it is verifiable

Fabricated reviews, invented customer counts, and unearned badges are prohibited without exception. They transfer risk to the customer while claiming to remove it.

---

# Step 9 — Decide Cart Strategy

## Cart Model

- Direct to checkout, no cart: correct for single-item purchases and services.
- Mini cart with continued browsing: correct when multi-item orders are common.
- Persistent full cart page: correct when orders are large, itemised, or approved by someone else.

Choose from average items per order, not from convention.

## Cart Requirements

The cart is where the purchase decision is confirmed, so it must contain:

- line-level quantity change and removal without page loss
- the real order total, including tax and shipping when computable, or an explicit statement of what remains to be calculated
- delivery estimate per line when lines dispatch separately
- stock revalidation with clear handling of anything no longer available
- save for later, so removal is not the only option
- the applied promotion and its actual effect on the total

Rules:

- Never surprise the customer with a total change between cart and payment.
- A cart must survive session interruption when identity is known, because carts are frequently built on one device and completed on another.
- Promotion code fields invite customers to leave and search for codes. Include one only when codes are genuinely part of the strategy, and keep it unobtrusive.

---

# Step 10 — Set the Checkout Friction Budget

Every field in checkout must justify its existence against the revenue it costs.

## Baseline

The irreducible set is:

- contact identity for order communication
- delivery destination
- delivery method
- payment credential

Anything beyond this must be defended.

## Field Decisions

Ask of each additional field:

- is it legally required
- is it operationally required to fulfil this order
- can it be collected after purchase instead
- can it be derived rather than asked

Common failures:

- phone number demanded when the carrier does not require it
- company field shown to consumers
- date of birth collected without a legal basis
- separate billing address requested by default rather than on divergence

## Account Creation

- Guest checkout is the default unless the product genuinely cannot fulfil without an account.
- Offer account creation after the purchase is complete, when the customer has a reason to want one and their details are already captured.
- Never place a login wall in front of a first purchase.

## Structure

- Single page when the total field count is small, roughly eight or fewer.
- Steps when the field count is larger or when payment must be isolated, with visible progress and the ability to return without data loss.
- Single-column layout, mobile-first, with correct input types so the appropriate keyboard appears.
- Address autofill and lookup where available, since address entry is the slowest part of any checkout.

## Errors

- Validate inline, at the field, as soon as the answer can be judged.
- Preserve all input on failure, especially after a declined payment.
- State what to do next on a declined payment, including trying an alternative method.
- Never clear a form and never return the customer to the beginning.

Consequence of an unbudgeted checkout: customers who have decided to buy, and who leave anyway, which is the most expensive loss in the funnel.

Implementation belongs to the Checkout Pattern.

---

# Step 11 — Decide Post-Purchase Confidence

The purchase is not the end of the decision. The period between payment and delivery is where trust is either confirmed or lost, and where repeat business is decided.

## Confirmation Requirements

Immediately after payment, the customer must have:

- an order reference they can quote
- itemised totals matching what they agreed, including tax and shipping
- the delivery window and destination as recorded
- the window during which the order can be changed or cancelled, and how
- a support route that does not require an account
- a durable copy that is not dependent on the browser session

## Tracking and Progress

Decide the fulfilment states the customer will be shown, and show only states that are real.

Rules:

- If tracking is not available, say so and give the expected dispatch date rather than an empty tracking view.
- Communicate delays proactively, before the customer notices. A delay disclosed early is an inconvenience; a delay discovered by the customer is a failure.
- Every notification must be actionable or informative, never both vague and frequent.

## Returns

Decide before launch, and state before purchase:

- the return window
- who pays return shipping
- the condition requirements
- the refund method and the time to refund
- whether exchange is offered

Rules:

- Returns must be initiable without contacting support for standard cases.
- Refund timing must be stated as a real range, not as "shortly".
- A restrictive return policy stated clearly is more trustworthy than a generous policy that is difficult to find.

## Repeat Purchase

Post-purchase is where replenishment begins.

Decide:

- whether reorder is a single action from order history
- whether subscription is genuinely appropriate, and how visible cancellation is
- what triggers a legitimate reminder, based on real consumption cycles rather than arbitrary marketing intervals

Post-purchase surfaces are handed to the Notifications Pattern, the Profile Pattern for order history, the Support Pattern for issue resolution, and the FAQ Pattern for policies.

---

# Product Content Requirements

Content decisions determine whether comparison is possible at all.

For every product, the following must exist before it is listed:

- a name that matches how customers refer to it
- specifications complete and consistently structured across the category, since inconsistent specifications make comparison impossible
- imagery showing the item, its scale, and its use
- what is included and what is not
- compatibility or fit information where relevance depends on it
- care, warranty, or lifespan information where it affects the decision

Rule: an item lacking the content required to decide should not be listed. An unanswerable listing produces a return or a support ticket.

---

# Mobile Commerce Decisions

Mobile is the majority context for browsing and increasingly for buying.

Decisions:

- the primary action must remain reachable while scrolling long product pages
- imagery must be legible without pinch zoom, with zoom available for detail
- variant selection must be operable with one thumb, with 44px minimum targets
- filters belong in a sheet that shows the result count before it is dismissed
- payment must accept platform wallets, because manual card entry is the largest mobile drop-off
- the total, including shipping, must be visible without scrolling in the cart

Never require desktop to complete a purchase, and never present a reduced catalogue on mobile.

---

# Handoff

When these decisions are resolved, hand off:

- listing, filtering, and sorting behaviour to the Ecommerce Catalog Pattern
- product page structure, variant interaction, and imagery to the Product Details Pattern
- cart and payment flow to the Checkout Pattern
- query handling and zero-result recovery to the Search Pattern
- order communication to the Notifications Pattern
- order history and reorder to the Profile Pattern
- policy content to the FAQ Pattern
- component behaviour to the Ecommerce Component and Cards Component

---

# Ecommerce Intelligence Output

Example:

```
Product

Independent Furniture Retailer


Catalogue

Structured, approximately 600 items, 40 categories


Dominant Buyer Mode

Considered comparison, secondary inspiration


Taxonomy

Room, then furniture type, then style — three levels maximum


Search

Required — name, material, dimension, and code searchable


Facets

Room, material, colour family, width range, availability, delivery speed


Default Sort

Best selling in the last 30 days


Price Presentation

Tax-inclusive, delivery estimated from postcode before payment,
unit price shown for sets, instalment total repayable disclosed


Reference Pricing

Comparison price only where the item sold at that price in the last 90 days


Variants

Two axes — finish and size
Availability and price delta shown per option
Imagery changes with finish
Unavailable finishes disabled with restock notification


Availability

Real counts only, supplier lead times stated per item,
revalidation at cart and at payment


Risk Profile

High — large spend, delivery uncertainty, expensive returns


Trust Signals

Dimensions with clearance requirements, real room photography,
delivery window with two-person delivery stated, 14-day return terms
with return cost stated, verified reviews with distribution shown


Proof Substitute For New Ranges

Material provenance, workshop detail, and free return on first order


Cart

Persistent page — multi-item orders common,
per-line delivery windows, save for later


Checkout

Guest default, single page, six fields, address lookup,
wallet payment first, account offered after purchase


Post Purchase

Order reference, itemised totals, delivery window,
48-hour change window, proactive delay contact,
self-serve returns, refund stated as 5–10 business days


Mobile

Sticky add to cart, one-thumb variant selection,
filter sheet with live counts, wallet payment


Handoff

Ecommerce Catalog Pattern, Product Details Pattern, Checkout Pattern


Review

Pass
```

---

# Failure Conditions

Ecommerce Intelligence fails when:

- The catalogue is organised by internal or supplier structure.
- Faceted search is built for a catalogue too small to need it.
- A deep catalogue relies on browsing alone.
- Shipping, tax, or duties first appear during payment.
- A comparison price refers to a price never charged.
- Urgency is manufactured rather than measured.
- Low-stock counts are decorative.
- A variant can be selected before its availability is known.
- Specifications are inconsistent across a category, making comparison impossible.
- Reviews, customer counts, or badges are fabricated.
- Account creation is required before a first purchase.
- Checkout collects fields nobody uses.
- The order total changes between cart and payment.
- Delays are discovered by the customer rather than disclosed by the store.
- Return terms are unstated, unfindable, or vague about cost.
- Mobile shows a reduced catalogue or requires desktop to pay.

---

# Review Questions

Before approval:

- Would a customer describe a category using the name it has been given?
- Can the dominant buyer mode complete its task in the fewest possible steps?
- Is the true total knowable before payment details are entered?
- Is every price claim defensible?
- Is every stock statement true?
- Can a customer discover an unavailable option without selecting it?
- Does this page contain everything needed to decide, or will the customer leave to find it?
- If there were no reviews, would this page still be credible?
- Does any field in checkout exist without a reason?
- Does the customer know what happens next the moment they pay?
- Can a return be started without contacting anyone?
- Could this store be operated as described, exactly as it is presented?

---

# Final Rule

Every element of a store either reduces uncertainty or adds it.

Reduce uncertainty with specifics, real imagery, honest prices, true availability, and clear terms.

Never reduce it with a claim the business cannot honour, because commerce is a promise, and every promise is eventually tested by delivery.
