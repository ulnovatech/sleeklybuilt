# FAQ Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Landing Page Intelligence, UX Intelligence, Search Component, Navigation System, Motion System, Accessibility Intelligence

---

# Purpose

The FAQ Pattern defines the complete solution for sections whose job is to remove the last objection standing between a visitor and a decision.

An FAQ is not a dumping ground for content nobody could place elsewhere.

An FAQ is a deflection surface. Every question it answers is a support ticket that never gets written and a purchase that does not stall.

If a visitor reads an FAQ and still leaves to contact support with a question that was on the page, the FAQ failed at findability rather than at content.

---

# When To Use

Use this pattern when:

- a predictable set of objections blocks conversion
- support receives the same questions repeatedly
- the product has terms, limits, or conditions that buyers verify before committing
- a page needs to answer edge cases without disrupting its main narrative

---

# When Not To Use

Do not use this pattern when:

- the question is universal and blocking — put the answer in the main page copy, not behind a collapsed row
- the content is a complete knowledge base — use a dedicated help centre with categories and search as the primary interface
- there are fewer than four questions — write them as plain prose under a heading
- the FAQ is being used to hide unfavourable information such as cancellation terms

The most common product mistake is burying the pricing model inside an accordion. If the majority of visitors need an answer, it is not frequently asked, it is required reading.

---

# User Goal

The primary goal is always one of three:

```
Does this apply to me?

↓

What happens in my specific case?

↓

Who do I ask if it is not here?
```

An FAQ must let a visitor locate a relevant question by scanning headings alone, without expanding anything.

---

# User Journey

The visitor's scan and decision sequence:

```
Reaches the FAQ carrying one unresolved doubt

↓

Scans question headings for a match

↓

Recognises their own words in a question

↓

Expands it

↓

Reads an answer short enough to finish

↓

Either resolves the doubt and returns to the primary action

↓

Or escalates to support with context already gathered
```

The recognition step decides everything.

A visitor matches on their own phrasing, not the company's, so questions written in internal vocabulary are invisible even when the answer sits directly beneath them.

---

# UX Flow

## Entry

The visitor arrives from:

- scrolling to the bottom of a landing or pricing page, carrying a specific objection
- a deep link from an email, ad, or support reply pointing at one question
- an internal search result matching an answer's body text
- a "still have questions" link elsewhere on the site

A deep link must arrive with the target question already expanded, scrolled into view, and visually indicated.

---

## Scan

Within the section's first viewport, the visitor must be able to determine:

- what topics this FAQ covers
- roughly how many questions exist
- whether the questions are grouped
- whether search is available

Collapsed questions must be visually scannable as a list of complete sentences. A row reading `Billing` is not a question and cannot be matched against a doubt.

---

## Locate

Location happens by one of three routes, in order of cost to the visitor:

```
Scan headings

↓

Jump via group

↓

Search within the FAQ
```

Search appears only above twelve questions. Below that, search costs more attention than it saves.

---

## Resolve

An answer must be readable in under thirty seconds.

If an answer needs more than 120 words, the answer is a summary with a link to a full article, not a wall of text inside an accordion row.

---

## Escalate

Every FAQ ends with a route out.

The escalation block is not a failure state. It is the designed exit for the minority whose question is genuinely unlisted, and it must be as considered as the questions themselves.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Frequently asked         │
│ questions                │
├──────────────────────────┤
│ 🔍 Search questions      │  if >12 questions
├──────────────────────────┤
│ Billing  Delivery  Setup │  chips, horizontal
├──────────────────────────┤
│ When am I charged?    ▾  │
├──────────────────────────┤
│ Can I cancel anytime? ▾  │
├──────────────────────────┤
│ Can I cancel anytime? ▴  │
│                          │
│ Yes. Cancel from your    │
│ account settings and     │
│ billing stops at the end │
│ of the current period.   │
│ Read the full policy →   │
├──────────────────────────┤
│ Do you offer refunds? ▾  │
├──────────────────────────┤
│ Still have questions?    │
│ [ Message support ]      │
│ Typical reply: 2 hours   │
└──────────────────────────┘
```

Mobile rules:

- Full-width rows. The entire row is the trigger, giving a target far exceeding 44×44.
- The chevron sits on the trailing edge and rotates 180° over 200ms to indicate state.
- Question text wraps rather than truncating. A truncated question cannot be matched.
- Group chips scroll horizontally and filter rather than navigate, keeping the visitor in place.
- Answer text is left-aligned at the same indent as the question, not indented further, which preserves the scanning column.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Frequently asked questions                 │
│ Everything about billing, delivery, setup  │
├────────────────────────────────────────────┤
│ 🔍 Search questions                        │
├────────────────────────────────────────────┤
│ All   Billing   Delivery   Setup           │
├────────────────────────────────────────────┤
│ When am I charged?                      ▾  │
├────────────────────────────────────────────┤
│ Can I cancel anytime?                   ▾  │
├────────────────────────────────────────────┤
│ Do you offer refunds?                   ▾  │
├────────────────────────────────────────────┤
│  Still have questions?  [ Message support ]│
└────────────────────────────────────────────┘
```

Content width caps at 68 characters per line for answer text even though the container is wider.

---

## Desktop

```
┌──────────────────────────────────────────────────────────┐
│                Frequently asked questions                │
│         Everything about billing, delivery, setup        │
├───────────────────┬──────────────────────────────────────┤
│ 🔍 Search         │ When am I charged?               ▾   │
│                   ├──────────────────────────────────────┤
│ All          (18) │ Can I cancel anytime?            ▴   │
│ Billing       (6) │                                      │
│ Delivery      (5) │ Yes. Cancel from your account        │
│ Setup         (4) │ settings and billing stops at the    │
│ Security      (3) │ end of the current period. You keep  │
│                   │ access until then.                   │
│                   │ Read the full policy →               │
│                   ├──────────────────────────────────────┤
│                   │ Do you offer refunds?            ▾   │
├───────────────────┴──────────────────────────────────────┤
│  Still have questions?   [ Message support ]  2h reply   │
└──────────────────────────────────────────────────────────┘
```

Desktop rules:

- The category rail is sticky so group switching is available at any scroll depth.
- Counts next to each group tell the visitor how much material sits behind a filter.
- Answers never exceed a 68-character measure regardless of container width.
- Two-column question grids are prohibited. They break the vertical scan and cause reflow jumps when one column expands.

---

# Variant Catalog

## Variant A — Simple Accordion

```
┌────────────────────────────────┐
│ Question one               ▾   │
├────────────────────────────────┤
│ Question two               ▾   │
├────────────────────────────────┤
│ Question three             ▾   │
└────────────────────────────────┘
```

Four to eight questions, no grouping, no search.

Correct for a landing page or pricing page closing section where the objections are few and known.

---

## Variant B — Grouped Accordion

```
┌────────────────────────────────┐
│ BILLING                        │
│ Question                   ▾   │
│ Question                   ▾   │
├────────────────────────────────┤
│ DELIVERY                       │
│ Question                   ▾   │
│ Question                   ▾   │
└────────────────────────────────┘
```

Nine to twenty questions across two to five clearly distinct topics.

Correct when visitors arrive with topic-shaped intent, such as a checkout page where questions split cleanly between payment and shipping.

---

## Variant C — Searchable FAQ

```
┌────────────────────────────────┐
│ 🔍 Search questions            │
├────────────────────────────────┤
│ 3 results for "refund"         │
│ Do you offer refunds?      ▾   │
│ How long do refunds take?  ▾   │
│ Refunds on annual plans    ▾   │
└────────────────────────────────┘
```

More than twelve questions where visitors arrive with precise vocabulary.

Correct for support-adjacent pages and any FAQ that receives direct traffic from search engines or support replies.

---

## Variant D — Two-Column With Category Rail

```
┌──────────┬─────────────────────┐
│ All  (18)│ Question        ▾   │
│ Billing  │ Question        ▾   │
│ Delivery │ Question        ▾   │
│ Setup    │ Question        ▾   │
└──────────┴─────────────────────┘
```

Fifteen or more questions on a dedicated FAQ page with sustained desktop traffic.

Correct when the FAQ is a destination rather than a page section.

---

## Variant E — Inline Contextual FAQ

```
┌────────────────────────────────┐
│ PRO PLAN            £29/month  │
│ ...plan details...             │
│                                │
│ What counts as a seat?     ▾   │
│ Can I change plans mid-cycle?▾ │
└────────────────────────────────┘
```

Two to four questions placed directly beside the decision they unblock.

Correct when a specific objection attaches to a specific element, such as a plan tier or a shipping option. Answers here must be under 40 words.

---

## Variant F — FAQ With Deflection Panel

```
┌────────────────────────────────┐
│ Questions accordion            │
├────────────────────────────────┤
│ Didn't find it?                │
│ [ Chat ] [ Email ] [ Docs ]    │
│ Average reply 2 hours          │
└────────────────────────────────┘
```

Any FAQ where support cost is the primary motivation for the section.

Correct when the business goal is measurable ticket reduction. The panel must be persistent at the end of the list, not a floating widget that obscures answers.

---

# Component Hierarchy

```
FaqSection
├── SectionHeader
│   ├── SectionHeading
│   └── SectionSubheading         optional
├── FaqSearch                     conditional, >12 questions
│   ├── SearchInput
│   ├── ClearAction
│   └── ResultSummary             live region
├── CategoryFilter                conditional, grouped variants
│   └── CategoryOption ×n
│       ├── CategoryLabel
│       └── CategoryCount
├── FaqList
│   └── FaqGroup ×n               grouped variants only
│       ├── GroupHeading
│       └── FaqItem ×n
│           ├── FaqQuestionButton
│           │   ├── QuestionText
│           │   └── StateChevron
│           └── FaqAnswerPanel
│               ├── AnswerBody
│               ├── AnswerLink        optional
│               └── HelpfulnessVote   optional
├── FaqEmptyState                 no search results
└── DeflectionPanel
    ├── DeflectionHeading
    ├── ContactAction ×n
    └── ResponseTimeNote
```

Reuse rules:

- `FaqItem` is the shared accordion primitive used elsewhere in the product, not an FAQ-specific implementation.
- The search input is the product's standard input component with an FAQ-scoped behaviour, so focus rings and clear affordances match everywhere.
- The deflection panel is the same contact block used on the contact page, keeping response-time claims in one place.

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

## Expanding A Question

1. The chevron rotates 180° over 200ms.
2. The panel expands with a height transition of 250ms using an ease-out curve.
3. Surrounding content moves down. The clicked question stays anchored at its original position so the visitor's eye does not lose it.
4. Focus stays on the question button. Focus must never jump into the answer body.
5. The question identifier is written to the URL fragment so the expanded state is linkable.

Multiple questions may be open simultaneously. Auto-collapsing a previous answer punishes visitors comparing two related answers, which is common in billing and delivery sections.

The only exception is Variant E, where the inline context is tight and one-at-a-time keeps the surrounding decision visible.

## Collapsing

1. The chevron rotates back over 200ms.
2. The panel collapses over 200ms, faster than expansion, because removal needs less explanation than arrival.
3. If content above the viewport collapses, the scroll position adjusts so the visitor's current reading position does not jump upward.

## Searching Within The FAQ

1. Search filters on keystroke with a 200ms debounce.
2. Matching happens against question text and answer body, because visitors search for words that appear in answers.
3. Matched terms are highlighted in the question text.
4. Matching questions expand automatically when three or fewer results remain, since at that point the visitor has already narrowed to a readable set.
5. The result count announces politely: `3 questions match "refund"`.
6. Clearing search restores the full list with all previously expanded questions still expanded.

Search never navigates away from the section.

## Deep Linking

1. A URL fragment naming a question scrolls that question into view with 24px of clearance above it.
2. The question expands without animation, since animating on arrival makes the page appear to still be loading.
3. The question receives a brief highlight treatment lasting 1.5 seconds so the visitor understands why they landed there.
4. If the fragment does not match a question, the FAQ renders normally, collapsed, with no error.

Deep links are how support teams answer tickets efficiently, so every question needs a stable, human-readable fragment that survives content reordering.

## Escalating To Support

1. The deflection action opens the contact route without leaving the page where possible.
2. Any question currently expanded is carried as context into the support form's subject line.
3. The stated response time must reflect real operating data and must state business hours if replies are not continuous.

---

# States

Every region owns its own states. A failed search must not collapse the question list.

## Loading — First Visit

For server-rendered FAQs there is no loading state, which is the correct implementation and the reason FAQs should not be client-fetched.

Where content is fetched, render skeleton rows matching final row height:

```
Question row → text bar at 60% width + chevron block
Category rail → 4 label bars
```

Never render a spinner in place of the section. The section height must be reserved so the page below does not shift.

---

## Loading — Answer Fetched On Demand

Only used where answers are long-form and pulled from a content service.

The panel opens immediately at a minimum height with a skeleton of three text bars, then fills. The panel must not resize twice.

```
┌────────────────────────────────┐
│ Can I cancel anytime?      ▴   │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬           │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬                 │
└────────────────────────────────┘
```

---

## Empty — No Questions Configured

The section must not render at all.

An FAQ heading above nothing is worse than no FAQ, because it signals an unfinished page. Rendering is conditional on content existing.

---

## Empty — No Search Results

```
┌────────────────────────────────────────┐
│ No questions match "invoice address"   │
│                                        │
│ Try a shorter search, or browse all    │
│ 18 questions.                          │
│                                        │
│ [ Clear search ]  [ Message support ]  │
└────────────────────────────────────────┘
```

The zero-result state is the highest-intent moment in the entire section. The visitor has a specific question and confirmed the page cannot answer it.

Escalation must be offered here, prefilled with the search term as the subject.

---

## Error — Search Unavailable

When search is backed by a service that fails, hide the search input and render the full question list.

```
Search is unavailable. All 18 questions are listed below.
```

A broken search box is worse than no search box because it implies the content is missing.

---

## Error — Answer Failed To Load

The panel stays open and shows the failure in place.

```
┌────────────────────────────────┐
│ Do you offer refunds?      ▴   │
│ ⚠ Couldn't load this answer.   │
│   [ Retry ]  Contact support   │
└────────────────────────────────┘
```

Other questions remain fully functional.

---

## Error — Page Failed

Only when nothing renders. Required: cause, retry, and a support route with a reference identifier.

---

## Long-Copy Overflow

An answer exceeding 120 words truncates at a natural paragraph break with a `Read more` link to the full article.

The accordion never scrolls internally. An internal scrollbar inside a collapsed-by-default panel is undiscoverable and traps mobile scroll gestures.

---

## JavaScript Disabled

Every answer must be present in the served markup and readable with all panels open.

Implementation uses native disclosure semantics so collapse behaviour degrades to fully expanded content rather than to hidden content.

An FAQ that renders as a list of unclickable questions without JavaScript has lost its entire content and its search engine visibility.

---

## Success — Helpfulness Feedback Submitted

Where a helpfulness vote is offered, the control replaces itself in place.

```
Was this helpful?  [ Yes ]  [ No ]
        ↓
Thanks — this helps us improve.
```

Selecting `No` reveals the escalation route immediately, because a visitor who says an answer did not help is stating an unresolved need.

---

## Permission-Limited — Account-Specific Answers

When an answer differs by plan or region, never show a generic answer that may be wrong for the reader.

State the condition and offer the specific route:

```
Refund windows depend on your plan.
[ Sign in to see your terms ]
```

---

# Mobile Behavior

- The entire question row is the trigger, giving a target height of at least 56px.
- Rows are separated by a 1px divider rather than card elevation, keeping the scanning column unbroken.
- Question text wraps to a maximum of three lines and never truncates.
- Answer text uses a minimum 16px size to prevent input zoom and to stay comfortably readable.
- Expanding near the bottom of the viewport scrolls just enough to reveal the first two lines of the answer, not the whole panel, which would push the question off-screen.
- Category chips filter in place rather than navigating to a new page.
- Search opens the standard keyboard with autocorrect enabled and no autocapitalisation.
- Deep-linked questions account for any sticky header when calculating scroll offset.

---

# Desktop Expansion

Added space is spent on:

- a sticky category rail with counts, making the scale of each topic visible
- a persistent search field rather than one behind an icon
- longer question headings that need no abbreviation
- keyboard navigation between questions with arrow keys

Added space is never spent on:

- a second column of questions, which destroys the vertical scan
- expanding the answer measure beyond 68 characters
- illustrations beside each answer that add height without adding meaning
- opening answers in a side panel, which separates the question from its answer

---

# Accessibility Requirements

- Each question is a `button` inside a heading element at the correct document level, so screen reader users can navigate the FAQ by heading.
- The question button carries `aria-expanded` reflecting its true state and `aria-controls` pointing at the answer panel.
- The answer panel is not removed from the accessibility tree while collapsed if content must remain findable by in-page find; use height collapse with hidden semantics consistently and document which approach is used.
- Tab order runs: search, category filter, question one, question two, and so on. An expanded answer's internal links enter the tab order immediately after their question.
- Expanding never moves focus. The visitor stays on the control they activated.
- Escape does not close accordions. Escape is reserved for overlays, and repurposing it here breaks the visitor's model.
- Arrow key navigation between question buttons is optional but, if implemented, must follow the accordion keyboard pattern with Home and End moving to first and last.
- Search result counts announce through a polite live region, never assertive, so typing is not interrupted on every keystroke.
- The chevron is decorative and hidden from assistive technology, since `aria-expanded` already conveys state.
- State is never conveyed by colour or chevron alone for sighted users; the panel's presence is the primary signal.
- Text contrast meets 4.5:1, including the de-emphasised category counts.
- Respect reduced motion: panels appear and disappear without height animation, and the chevron changes without rotation.
- At 200% zoom, question rows wrap rather than truncate and the category rail collapses above the list.

---

# Data Requirements

Content requirements per question:

```
Question text — maximum 80 characters, phrased in visitor vocabulary, ending in a question mark

Answer body — 25 to 120 words, leading with the direct answer in the first sentence

Category — one only; a question in two categories is two questions

Stable identifier — human-readable, used as the URL fragment, never derived from position

Optional deep link — one link maximum per answer, to canonical documentation

Search keywords — alternative phrasings visitors actually use, indexed but not displayed

Last reviewed date — internal, used to flag stale terms and prices
```

Per variant:

```
Variant A  — 4 to 8 questions, no category data required
Variant B  — 9 to 20 questions, 2 to 5 categories, each with at least 2 questions
Variant C  — 12+ questions, search keywords mandatory
Variant D  — 15+ questions, category counts computed, not authored
Variant E  — 2 to 4 questions, answers capped at 40 words
Variant F  — any count, plus contact routes and a real response-time figure
```

Section heading maximum 60 characters. Subheading maximum 120 characters.

Never publish a question whose answer restates the question. Never publish a response-time claim that operations cannot meet.

---

# Performance Requirements

- All questions and answers ship in the initial server-rendered markup. An FAQ is text and must not require a network round trip.
- The section adds no layout shift. Collapsed row heights are fixed and known before styles resolve.
- Search runs entirely client-side against the already-loaded content for sets under 200 questions.
- Height animations use transform and opacity where possible, and where height must animate, the animation is capped at 250ms to avoid long reflow chains.
- No icon library is loaded for a single chevron.
- Deep-link scroll happens after fonts settle, so the target does not drift.

---

# Anti-Patterns

Never build:

- an FAQ that hides pricing, cancellation terms, or delivery costs behind a collapsed row
- questions written in company vocabulary such as "How does entitlement provisioning work?"
- an accordion that force-closes the previously open answer while a visitor is comparing two answers
- answers that begin with restated context instead of the direct answer
- a two-column FAQ grid where expanding one column shifts the other
- questions rendered as unclickable text when JavaScript fails
- a search box that returns nothing and offers no escalation
- an FAQ with no route to a human
- a response-time promise the support team cannot meet
- questions ordered alphabetically rather than by frequency of concern
- answers containing more than one outbound link, splitting the visitor's attention at the moment of resolution
- URL fragments generated from list position, breaking every support link when a question is added
- an internal scrollbar inside an answer panel
- an FAQ section rendered with a heading and zero questions

---

# Pattern Output Example

```
Product

Subscription Software Pricing Page


Primary Objection

What happens to my billing if I change plans?


Variant

Variant B — grouped accordion, 14 questions, 3 categories


Categories

Billing (6), Access (5), Security (3)


Question Style

Visitor vocabulary, maximum 80 characters, question mark required


Answer Length

25 to 120 words, direct answer first sentence


Multi-Open

Allowed; billing comparisons require it


Deep Links

Stable slugs, used in support macros


Search

Not shown; 14 questions is below the threshold


Deflection

Persistent panel, chat and email, 2-hour stated reply


Zero Results

Not applicable without search


Mobile

Full-width rows, 56px minimum, three-line wrap


Accessibility

Heading-wrapped buttons, aria-expanded, no focus movement on expand


No-JavaScript

All answers rendered open


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every question is phrased in visitor vocabulary and ends in a question mark
- [ ] No blocking information is hidden behind a collapsed row
- [ ] Each answer leads with the direct answer in its first sentence
- [ ] Answers stay within 120 words or link out to a full article
- [ ] Questions are ordered by frequency of concern, not alphabetically
- [ ] Every question has a stable, human-readable URL fragment
- [ ] Deep links expand, scroll into view, and briefly highlight the target
- [ ] Multiple questions can be open at once, except in the inline variant
- [ ] Expanding does not move focus off the question button
- [ ] Collapsing above the viewport does not jump the reading position
- [ ] Search debounces, matches answer bodies, and announces counts politely
- [ ] Zero search results offer escalation prefilled with the search term
- [ ] Search failure hides the input and shows the full list
- [ ] Every FAQ ends with a real route to a human
- [ ] Stated response times match operational reality
- [ ] All content renders and is readable with JavaScript disabled
- [ ] Questions are buttons wrapped in correctly levelled headings with aria-expanded
- [ ] Mobile rows are at least 56px with wrapping question text
- [ ] Reduced motion removes height and rotation animation
- [ ] 200% zoom wraps rows without truncation

---

# Final Rule

An FAQ earns its place by resolving doubt at the exact moment doubt would otherwise end the visit.

Every question must justify itself against one question:

If this were removed, would someone contact support or leave?

If the answer is no, it is not frequently asked, and it does not belong.
