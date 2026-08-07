# Feature Sections Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Landing Page Intelligence, Layout Intelligence, Typography Intelligence, Cards Component, Landing Pages Component, Spacing System

---

# Purpose

The Feature Sections Pattern defines the complete solution for the middle of a marketing page, where a visitor decides whether the product does the thing they need.

A feature section is not a specification list.

A feature section is a translation layer. It converts what the product does into what changes for the person reading.

If a visitor finishes a feature section able to describe the capability but unable to describe the outcome, the section failed regardless of how well it was designed.

---

# When To Use

Use this pattern when:

- a visitor has read the hero and needs evidence before acting
- the product's value requires more than one sentence to establish
- differentiation depends on how something works, not just that it exists
- the buying decision involves evaluating fit against a specific workflow

---

# When Not To Use

Do not use this pattern when:

- the product is self-evident and the hero already closed the case — go straight to pricing
- the content is a specification comparison — use a table
- every item is a single line with no supporting proof — use a compact feature grid instead of full sections
- the page is a documentation index rather than a persuasion surface

The most common product mistake is building eight alternating feature sections because the template had eight slots, producing a page nobody scrolls to the end of.

---

# User Goal

The primary goal is always one of three:

```
Does this solve my actual problem?

↓

How does it work in practice?

↓

Do I believe it works?
```

A feature section must answer the first question in its heading alone, before the visitor reads any body copy or looks at any image.

---

# User Journey

The visitor's scan and decision sequence:

```
Arrives from the hero with partial interest

↓

Scans section headings while scrolling quickly

↓

Stops at the heading naming their problem

↓

Reads the supporting sentence

↓

Looks at the visual to verify the claim is real

↓

Checks for proof that someone else got the result

↓

Either continues scanning for the next relevant capability

↓

Or converts, because the objection that brought them here is resolved
```

The stop is the whole game.

Visitors scroll marketing pages at speed and read only headings until one heading describes their situation, which means a heading naming a feature rather than an outcome is skipped even when the feature is exactly what they need.

---

# UX Flow

## Entry

The visitor arrives from:

- the hero, scrolling continuously with mild interest
- an anchor link from navigation, seeking one specific capability
- a search engine result targeting a specific problem phrase
- a comparison page, verifying a claim made elsewhere

An anchor arrival must land with the section heading at the top of the viewport plus clearance, not with the section's midpoint centred.

---

## Scan

Within any single section's viewport, the visitor must be able to determine:

- what outcome this section promises
- who it is for, when the product serves multiple audiences
- what it looks like in the product
- whether to keep reading or keep scrolling

---

## Understand

Every section follows the same internal contract:

```
Outcome heading

↓

One supporting sentence

↓

Visual evidence

↓

Optional proof point

↓

Optional inline action
```

A section missing the visual is a paragraph.

A section missing the outcome heading is a specification.

---

## Believe

Claims without evidence lower trust rather than leaving it unchanged.

Each section should carry evidence proportional to how surprising its claim is. An ordinary claim needs a product screenshot. An extraordinary claim needs a named customer, a number, or a demonstration.

---

## Act

Not every section needs a call to action.

A page with a call to action after every section trains visitors to ignore all of them. Place inline actions only where a section resolves a decision, typically after the strongest proof and at the end of the sequence.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ SECTION EYEBROW          │
│                          │
│ Ship reports without     │
│ chasing anyone           │
│                          │
│ Data pulls itself from   │
│ the tools you already    │
│ use, every Monday at 9.  │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │   product visual     │ │
│ │   16:10              │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ ✓ Connects to 14 tools   │
│ ✓ No setup per report    │
│                          │
│ See how it works →       │
├──────────────────────────┤
│         64px gap         │
├──────────────────────────┤
│ next section             │
└──────────────────────────┘
```

Mobile rules:

- Text always precedes the visual. A visitor who sees an unexplained screenshot first scrolls past it.
- The alternating layout collapses entirely. Every section becomes text-then-visual in the same order, because alternating on mobile creates no visual variety and only reorders content unpredictably.
- Vertical rhythm carries the section boundary: 64px between sections, 24px between elements within a section. Dividers are unnecessary when spacing is disciplined.
- Visuals use a consistent aspect ratio across all sections so the page has a steady cadence during fast scrolling.
- Supporting bullets maximum three, each under 40 characters.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ SECTION EYEBROW                            │
│ Ship reports without chasing anyone        │
│ Data pulls itself from the tools you       │
│ already use, every Monday at 9.            │
│ ┌────────────────────────────────────────┐ │
│ │          product visual                │ │
│ └────────────────────────────────────────┘ │
│ ✓ Connects to 14 tools  ✓ No per-report    │
└────────────────────────────────────────────┘
```

Still stacked, but text measure is capped at 60 characters and centred, and supporting bullets move to a two-up row.

Side-by-side layouts begin only when each column can hold 45 characters of text without breaking, which does not happen reliably below 900px.

---

## Desktop

```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────┐   ┌─────────────────────────────┐ │
│ │ SECTION EYEBROW     │   │                             │ │
│ │                     │   │      product visual         │ │
│ │ Ship reports        │   │      16:10                  │ │
│ │ without chasing     │   │                             │ │
│ │ anyone              │   └─────────────────────────────┘ │
│ │                     │                                   │
│ │ Data pulls itself   │                                   │
│ │ from the tools you  │                                   │
│ │ already use.        │                                   │
│ │                     │                                   │
│ │ ✓ 14 integrations   │                                   │
│ │ ✓ No setup          │                                   │
│ │ See how it works →  │                                   │
│ └─────────────────────┘                                   │
├───────────────────────────────────────────────────────────┤
│                        96px gap                           │
├───────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐   ┌─────────────────────┐ │
│ │                             │   │ SECTION EYEBROW     │ │
│ │      product visual         │   │ Second outcome      │ │
│ │                             │   │ heading             │ │
│ └─────────────────────────────┘   └─────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

Desktop rules:

- Text column holds 45 to 60 characters per line. Wider columns are read more slowly and abandoned sooner.
- Alternating sides applies from the second section onward, and the first section always leads with text on the left in left-to-right locales.
- Section gap increases to 96px, larger than the mobile 64px, because a wider viewport needs more vertical separation to read as a boundary.
- Content is vertically centred against the visual only when the text block is shorter than the visual. Long text blocks align to the top.
- Maximum content width 1200px regardless of viewport, so a wide monitor does not stretch the measure.

---

# Variant Catalog

## Variant A — Alternating Split

```
┌──────────┬───────────────┐
│ text     │    visual     │
└──────────┴───────────────┘
┌───────────────┬──────────┐
│    visual     │ text     │
└───────────────┴──────────┘
```

Three to five capabilities, each needing a real product visual and a paragraph of explanation.

Correct when each capability is substantial enough to earn a full screen and the product's value is demonstrated visually.

---

## Variant B — Feature Grid

```
┌────────┬────────┬────────┐
│ icon   │ icon   │ icon   │
│ Title  │ Title  │ Title  │
│ 2 lines│ 2 lines│ 2 lines│
├────────┼────────┼────────┤
│ icon   │ icon   │ icon   │
└────────┴────────┴────────┘
```

Six to nine capabilities that are individually small but collectively convincing.

Correct for establishing breadth after depth has been established elsewhere. Each cell holds a heading under 30 characters and a description under 90 characters, and icons must be from one consistent set at one weight.

---

## Variant C — Centred Single Feature

```
┌───────────────────────────┐
│        EYEBROW            │
│    One outcome heading    │
│    Supporting sentence    │
│ ┌───────────────────────┐ │
│ │   wide product visual │ │
│ └───────────────────────┘ │
└───────────────────────────┘
```

One capability that is the entire reason the product exists.

Correct as the first feature section after a hero, giving the primary differentiator undivided attention before the page introduces anything else.

---

## Variant D — Feature With Inline Proof

```
┌──────────┬───────────────┐
│ Heading  │    visual     │
│ Copy     │               │
│ ┌──────┐ │               │
│ │ "It  │ │               │
│ │ cut  │ │               │
│ │ our  │ │               │
│ │ time"│ │               │
│ │ —Name│ │               │
│ └──────┘ │               │
└──────────┴───────────────┘
```

A capability whose claim is strong enough to invite doubt.

Correct where the promise is the one competitors also make. The quote must name a real person and organisation, and must speak to this specific capability rather than to the product generally.

---

## Variant E — Stepped Process Feature

```
┌───────────────────────────┐
│    1 ────── 2 ────── 3    │
│ ┌───────┐┌───────┐┌──────┐│
│ │Connect││ Map   ││ Send ││
│ │ tools ││fields ││      ││
│ └───────┘└───────┘└──────┘│
└───────────────────────────┘
```

A capability whose value lies in how few steps it takes.

Correct when the objection is effort rather than capability. Three to five steps maximum; beyond five, the process is the problem the page is trying to hide.

---

## Variant F — Comparison Feature

```
┌─────────────┬─────────────┐
│ BEFORE      │ AFTER       │
│ 4 hours     │ 4 minutes   │
│ 3 tools     │ 1 tool      │
│ Manual      │ Automatic   │
└─────────────┴─────────────┘
```

A capability that replaces an existing painful process.

Correct when visitors already have a workaround and the decision is switching cost. The before column must describe the honest current state, not a strawman, because a visitor who recognises the exaggeration discounts everything else on the page.

---

# Component Hierarchy

```
FeatureSectionGroup
└── FeatureSection ×n
    ├── SectionContainer
    │   └── LayoutOrientation      text-left | text-right | centred
    ├── FeatureContent
    │   ├── Eyebrow                optional, ≤ 24 characters
    │   ├── FeatureHeading
    │   ├── FeatureBody
    │   ├── BenefitList            optional, ≤ 3 items
    │   │   └── BenefitItem
    │   │       ├── CheckIcon
    │   │       └── BenefitText
    │   ├── InlineProof            optional
    │   │   ├── ProofQuote
    │   │   ├── ProofAttribution
    │   │   └── ProofAvatar
    │   └── FeatureAction          optional, text link or secondary button
    └── FeatureMedia
        ├── MediaFrame             fixed aspect ratio
        ├── ResponsiveImage
        ├── MediaFallback
        └── MediaCaption           optional
```

Reuse rules:

- `FeatureSection` is a single component driven by an orientation property. Never a distinct component per section.
- `MediaFrame` reserves its aspect ratio before load, which is what prevents the page from jumping during a fast scroll.
- Proof blocks use the same testimonial primitive as the rest of the site, so attribution formatting never diverges.

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

## Scroll Reveal

1. Sections begin at 100% opacity in the served markup. Reveal is an enhancement applied only after scripts run.
2. Where reveal is used, elements animate opacity from 0 to 1 and translate 16px upward over 400ms with an ease-out curve.
3. The trigger fires when 20% of the section enters the viewport, so the animation completes before the visitor is reading.
4. Each section animates once. Re-animating on scroll-up is disorienting and makes fast scrolling feel broken.
5. Reveal never staggers by more than 80ms between elements within a section. Longer stagger makes fast scrollers read partially rendered content.

If a visitor scrolls faster than the animation, the content must already be visible. Content that depends on an animation completing is content that can be missed.

## Media Interaction

1. Static screenshots are not clickable and must not carry hover states, since a hover state promises an interaction that does not exist.
2. Where a visual is a video demonstration, it autoplays muted, loops, and carries no audio track at all.
3. Video shows a pause control on hover and focus, and pauses automatically when scrolled out of view to protect battery and bandwidth.
4. Where a visual expands to a lightbox, it must be a real button with an accessible name describing the enlarged content.

## Anchor Navigation

1. Navigation links to a feature section scroll with the heading positioned 32px below any sticky header.
2. Scrolling is instant when the visitor has reduced motion enabled, and smooth over a maximum of 500ms otherwise.
3. Focus moves to the section heading so keyboard and screen reader users arrive where sighted users arrive.

## Inline Action

1. A section-level action is visually secondary to the page's primary call to action, always.
2. Activating it either scrolls to the relevant destination on the same page or opens the relevant page, never both patterns on the same site.

---

# States

Every section owns its own states. A failed image must not collapse the layout.

## Loading — First Visit

Text renders immediately from server-rendered markup and never has a loading state.

Media frames reserve their exact aspect ratio with a neutral surface at the section's background tint, one step darker.

```
┌─────────────────────────────┐
│                             │
│      reserved 16:10         │
│                             │
└─────────────────────────────┘
```

No skeleton shimmer on marketing pages. Shimmer implies application data is loading and reads as slowness on a page that should feel instant.

---

## Loading — Media Progressive Fill

1. The frame reserves space.
2. A low-quality placeholder at approximately 20px wide renders blurred and scaled, matching the final image's dominant colours.
3. The full image cross-fades in over 300ms.

The placeholder must be derived from the real image. A generic grey block that jumps to a bright screenshot is more jarring than no placeholder.

---

## Empty — No Proof Available

When a section has no testimonial, number, or named customer to offer, the section renders without the proof block rather than with a placeholder.

Never render an empty quotation frame or an unnamed attribution such as "a happy customer". Anonymous proof reduces credibility below the level of no proof.

Where every section lacks proof, the page compensates with a single dedicated proof section rather than distributing weak evidence throughout.

---

## Empty — No Media Available

A section without a visual falls back to Variant B grid treatment or merges with an adjacent section.

A full-width feature section with a text column and an empty column reads as a broken page.

---

## Error — Image Never Loads

The frame retains its dimensions and renders a labelled fallback.

```
┌─────────────────────────────┐
│                             │
│    Weekly report view       │
│                             │
└─────────────────────────────┘
```

The fallback text is the image's alt text, which is why alt text must describe the content rather than say "screenshot".

The section remains fully comprehensible without the visual, which is the test every feature section must pass.

---

## Error — Video Fails To Play

Fall back to the video's poster frame as a static image.

Never show a broken player frame or a play button that does nothing.

---

## Long-Copy Overflow

Headings exceeding their character limit wrap to a maximum of three lines and never truncate. Truncated marketing copy loses the clause that carried the meaning.

Body copy exceeding four lines on mobile signals the section is trying to hold two ideas and should be split.

Benefit list items exceeding one line wrap rather than truncate, and the list is capped at three items so wrapping stays contained.

---

## JavaScript Disabled

All text, images, and links render and function normally.

Scroll reveal is opt-in through script, so its absence leaves content visible rather than invisible. A page whose content is hidden until an intersection observer runs is a page with no content for a crawler or a failed script.

Autoplaying video falls back to its poster frame.

---

## Success — Inline Action Completed

Where a section contains an inline form such as an integration lookup or a plan calculator, the result replaces the form in place.

```
┌─────────────────────────────┐
│ ✓ Your tools are supported  │
│   Slack, Notion, Linear     │
│   [ Start free ]            │
└─────────────────────────────┘
```

The confirmation carries the next action, because a visitor who has just received a positive answer is at their highest intent.

---

## Permission-Limited — Region Or Plan Restricted Capability

When a described capability is unavailable in the visitor's region or on lower plans, state it inside the section rather than in a page-level footnote.

```
Available on Business plans and above.
```

A visitor who discovers a restriction after signing up is more expensive than a visitor who never signs up.

---

# Mobile Behavior

- Text always precedes media within every section, without exception.
- Section gap 64px. Element gap 24px. Heading to body gap 12px.
- Headings 28 to 32px, body 16 to 18px, both at a line height of at least 1.5 for body text.
- Media spans full container width minus 16px gutters, and never breaks the gutter for a full-bleed effect that crops the important part of a screenshot.
- Screenshots are cropped for mobile to show the meaningful region rather than scaled down to illegibility. A desktop dashboard shrunk to 320px communicates nothing.
- Inline actions are full-width tappable rows at a minimum of 44px height, or text links with 44px of vertical tap area.
- Autoplaying video is disabled on cellular connections where the connection type is detectable.
- Maximum four feature sections before a conversion opportunity, because scroll depth falls sharply and a visitor convinced at section two should not have to reach section six to act.

---

# Desktop Expansion

Added space is spent on:

- side-by-side text and visual, letting the claim and the evidence be read together
- larger product visuals showing genuine interface detail rather than a suggestive blur
- alternating orientation creating rhythm across a long page
- inline proof placed beside the claim it supports

Added space is never spent on:

- widening the text measure past 60 characters
- adding a third column to a two-column section
- parallax backgrounds that fight the scroll
- full-bleed sections alternating with contained ones, which makes the page feel assembled from different templates

---

# Accessibility Requirements

- Each feature section is a `section` element with an accessible name derived from its heading.
- Headings follow a strict document outline. Every feature heading sits at the same level, and eyebrows are styled text inside the heading or a preceding paragraph, never a heading of their own.
- Eyebrow text is included in the heading's accessible name or is redundant with it, so screen reader users are not given a stream of disconnected category words.
- Product screenshots carry alt text describing what the interface shows and what state it is in, not "product screenshot". A decorative texture carries empty alt.
- Check icons in benefit lists are decorative and hidden from assistive technology, since the list semantics already convey grouping.
- Benefit lists are real list markup so their length is announced.
- Autoplaying video has no audio track, carries a pause control reachable by keyboard, and stops when the visitor prefers reduced motion.
- Scroll reveal is disabled entirely under reduced motion. Content appears at full opacity with no translation.
- Text over any image or gradient meets 4.5:1 contrast at every breakpoint, verified against the darkest and lightest regions of the image, not its average.
- Meaning never depends on colour. A green check and a red cross in a comparison variant both carry text labels.
- All content survives greyscale conversion, including before-and-after comparison columns.
- At 200% zoom, split sections stack into the mobile order and the text measure remains under 60 characters.
- Anchor navigation moves focus to the target heading, which must be focusable programmatically without entering the tab order.

---

# Data Requirements

Content requirements per section:

```
Eyebrow — maximum 24 characters, one or two words, optional

Heading — maximum 60 characters, states an outcome, contains a verb

Body — 15 to 40 words, one idea, explains the mechanism behind the outcome

Benefit items — maximum 3, each under 40 characters

Media — real product interface, minimum 1200px wide source, fixed aspect ratio shared across all sections

Alt text — maximum 125 characters, describes interface content and state

Proof — named person, role, and organisation, plus one specific outcome; optional but never anonymous

Action label — maximum 24 characters, verb-first
```

Per variant:

```
Variant A  — 3 to 5 sections, each with a distinct real screenshot
Variant B  — 6 to 9 cells, one icon set, headings ≤ 30 characters, descriptions ≤ 90 characters
Variant C  — 1 section, wide visual at 21:9 or 16:9, heading ≤ 50 characters
Variant D  — quote ≤ 140 characters, real attribution mandatory
Variant E  — 3 to 5 steps, step labels ≤ 20 characters
Variant F  — matched row count both columns, honest before-state, no invented numbers
```

Every claim must trace to something true about the product today.

Never publish a feature section describing unreleased functionality. Never publish a number without an internal source for it.

---

# Performance Requirements

- The first feature section's media is eagerly loaded. Every subsequent visual is lazy loaded with a root margin of roughly one viewport, so images arrive before they are scrolled into view.
- Every media frame declares intrinsic width and height, producing zero cumulative layout shift across the page.
- Images are served in a modern format with breakpoint-specific sources, and the mobile source is a cropped variant rather than a scaled one.
- Demonstration videos are capped at 8 seconds, under 2MB, and are not loaded at all on connections reporting reduced data preference.
- Scroll reveal uses an intersection observer and transform-only animation. Scroll event listeners driving animation are prohibited.
- No section loads a script solely for animation.
- Total marketing page media budget stays under 1.5MB for the initial viewport plus one screen of scroll.

---

# Anti-Patterns

Never build:

- headings that name features instead of outcomes, such as "Automated Workflow Engine"
- a page of eight alternating sections that all say the same thing at different lengths
- generic stock illustrations standing in for the product interface
- product screenshots too small or too blurred to read, which signal there is nothing to show
- a call to action after every single section
- benefit bullets that restate the heading in different words
- anonymous testimonials such as "Marketing Manager, Enterprise Company"
- invented statistics or percentages with no internal source
- before-and-after comparisons with a dishonest before column
- content hidden until a scroll animation triggers
- parallax or scroll-jacking that removes the visitor's control of the page
- alternating layouts on mobile, which only reorders content without adding rhythm
- text measures wider than 60 characters on desktop
- mixing full-bleed and contained sections without a consistent rule
- describing capability that is not yet shipped

---

# Pattern Output Example

```
Product

Reporting Automation Platform


Primary Objection

Will this actually remove the manual work?


Section Count

4 sections, conversion opportunity after section 3


Sequence

C (primary differentiator) → A → D (proof) → B (breadth)


Heading Style

Outcome-first, verb required, ≤ 60 characters


Media

Real product screenshots, 16:10, cropped variants for mobile


Proof

One named customer quote attached to the strongest claim


Inline Actions

One only, after the proof section


Mobile

Text before media in every section, 64px section gap


Scroll Reveal

Opacity and 16px rise, 400ms, disabled under reduced motion


Image Failure

Alt text renders in the reserved frame; section stays comprehensible


No-JavaScript

All content visible; reveal is an enhancement only


Accessibility

Descriptive alt text, greyscale-safe comparison, 200% zoom stacks


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every section heading states an outcome, not a feature name
- [ ] Every heading is under 60 characters and contains a verb
- [ ] Body copy is one idea, 15 to 40 words
- [ ] Every visual shows the real product interface
- [ ] Screenshots are legible at the smallest breakpoint, cropped rather than scaled
- [ ] All media frames declare aspect ratio, producing no layout shift
- [ ] Alt text describes interface content and state, under 125 characters
- [ ] Image failure leaves the section fully comprehensible
- [ ] Proof is named and specific, or absent — never anonymous
- [ ] No invented statistics
- [ ] Comparison variants use an honest before-state
- [ ] Section count is four or fewer before a conversion opportunity
- [ ] Only one inline action across the section group
- [ ] Mobile places text before media in every section
- [ ] Section rhythm is consistent: 64px mobile, 96px desktop
- [ ] Text measure stays within 45 to 60 characters on desktop
- [ ] All content renders and is visible with JavaScript disabled
- [ ] Scroll reveal is disabled under reduced motion
- [ ] Autoplaying video is muted, pausable, and stops off-screen
- [ ] Heading outline is strictly levelled with no eyebrow headings
- [ ] 200% zoom stacks split sections into mobile order

---

# Final Rule

A feature section earns its place by turning a capability into a consequence the reader can picture.

Every section must justify itself against one question:

After reading only the heading, does the visitor know what changes for them?

If they only know what the product has, rewrite the heading.
