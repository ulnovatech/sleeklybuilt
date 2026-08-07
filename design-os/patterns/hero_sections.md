# Hero Sections Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Landing Page Intelligence, Typography Intelligence, Layout Intelligence, Buttons Component, Landing Pages Component, Product Classifier

---

# Purpose

The Hero Sections Pattern defines the complete solution for the first screen a visitor sees, where they decide in seconds whether to stay.

A hero is not a banner.

A hero is an orientation device. It answers what this is, who it is for, and what to do next, before the visitor has decided to invest attention.

If a visitor can describe how the page looked but not what the product does, the hero failed regardless of how striking it was.

---

# When To Use

Use this pattern when:

- a visitor arrives with no prior context about the product
- the page's job is persuasion rather than task completion
- the first screen must establish category, audience, and next action
- traffic arrives from mixed sources with mixed levels of understanding

---

# When Not To Use

Do not use this pattern when:

- the visitor is signed in and arrived to do work — use an application shell
- the page is documentation, a legal page, or a support article — use a page header
- the page is a step in a funnel where the visitor already committed — a hero re-sells something already sold and adds a scroll
- the page's content is the value, such as a blog post — the title is the hero

The most common product mistake is placing a full-height hero on every page of a site, forcing visitors to scroll past a re-introduction on pages they navigated to deliberately.

---

# User Goal

The primary goal is always one of three:

```
What is this?

↓

Is it for someone like me?

↓

What happens if I click?
```

A hero must answer all three above the fold, on a 667px-tall mobile viewport, without scrolling.

---

# User Journey

The visitor's scan and decision sequence:

```
Lands with a question or a click they half-regret

↓

Reads the headline in under two seconds

↓

Matches or fails to match it against their situation

↓

Glances at the visual to place the product in a category

↓

Reads the subheadline only if the headline earned it

↓

Checks the action to understand the commitment

↓

Either clicks, scrolls for evidence, or leaves
```

The headline carries almost the entire decision.

Everything else in a hero exists to support a sentence the visitor reads once, quickly, and usually while deciding whether to close the tab.

---

# UX Flow

## Entry

The visitor arrives from:

- an advertisement, expecting the ad's promise repeated in the headline
- a search result, expecting their query's language on the page
- a referral or word of mouth, needing category orientation more than persuasion
- a direct visit, usually returning, wanting the fastest route past the hero

Message match matters most for paid traffic. A hero whose headline does not echo the advertisement that produced the click feels like a mistaken landing and is abandoned immediately.

---

## Orient

Within the first viewport, the visitor must be able to determine:

- the product category in plain language
- who it is for
- the single primary action
- that a real product exists behind the page

---

## Commit Or Continue

Every hero offers exactly two paths:

```
Primary action

↓

or

↓

Continue scrolling for evidence
```

A hero with three competing actions has no primary action.

The secondary path is a low-commitment alternative, not a second equal button. A text link, a demo trigger, or the page itself continuing downward all serve this role.

---

## Reassure

Directly beneath the action, one line reduces the perceived cost of clicking.

This line does real work: no card required, free for 14 days, 2-minute setup, cancel anytime. It removes the specific hesitation the button creates.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ☰  Logo          [ Try ] │  56px
├──────────────────────────┤
│                          │  32px
│ Weekly reports that      │
│ write themselves         │  headline
│                          │
│ Connect your tools once. │
│ Reports arrive every     │  subheadline
│ Monday at 9am.           │
│                          │
│ ┌──────────────────────┐ │
│ │   Start free         │ │  48px, full width
│ └──────────────────────┘ │
│ No card required         │  reassurance
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │   product visual     │ │
│ │   16:10              │ │
│ └──────────────────────┘ │
│                          │
│ Trusted by 400 teams     │  ← fold at 667px
├──────────────────────────┤
│ next section peeks       │
└──────────────────────────┘
```

Mobile rules:

- Headline before anything else. A hero image above the headline pushes the message below the fold on the most common phone height.
- Headline 30 to 36px, maximum three lines, line height 1.15.
- Subheadline 16 to 18px, maximum two lines, line height 1.5.
- Exactly one button, full width, minimum 48px tall, with 16px gutters.
- The visual sits below the action, not above it, because the action must be reachable without scrolling.
- Never full-viewport-height. A hero that fills exactly 100vh hides the fact that the page continues, and visitors do not scroll pages that appear to have ended.
- The next section peeks by at least 24px at the bottom of the viewport, which is the cheapest possible scroll affordance.
- Total hero height on mobile stays under 620px so the peek survives on a 667px screen with browser chrome.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Logo      Product  Pricing  Docs   [ Try ] │
├────────────────────────────────────────────┤
│         Weekly reports that write          │
│                themselves                  │
│      Connect your tools once. Reports      │
│        arrive every Monday at 9am.         │
│        [ Start free ]   See a demo         │
│              No card required              │
│ ┌────────────────────────────────────────┐ │
│ │           product visual               │ │
│ └────────────────────────────────────────┘ │
│   Logo  Logo  Logo  Logo  Logo             │
└────────────────────────────────────────────┘
```

Centred composition, text measure capped at 40 characters for the headline and 60 for the subheadline, secondary action appears as a text link beside the primary button.

---

## Desktop

```
┌───────────────────────────────────────────────────────────┐
│ Logo    Product  Solutions  Pricing  Docs   Sign in [Try] │
├───────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌────────────────────────────┐ │
│ │ EYEBROW               │  │                            │ │
│ │                       │  │                            │ │
│ │ Weekly reports        │  │      product visual        │ │
│ │ that write            │  │      16:10, real UI        │ │
│ │ themselves            │  │                            │ │
│ │                       │  │                            │ │
│ │ Connect your tools    │  └────────────────────────────┘ │
│ │ once. Reports arrive  │                                 │
│ │ every Monday at 9am.  │                                 │
│ │                       │                                 │
│ │ [ Start free ]  Demo →│                                 │
│ │ No card required      │                                 │
│ └───────────────────────┘                                 │
├───────────────────────────────────────────────────────────┤
│  Trusted by      Logo   Logo   Logo   Logo   Logo         │
└───────────────────────────────────────────────────────────┘
```

Desktop rules:

- Headline 48 to 64px, maximum two lines, line height 1.1. Beyond 64px, a long headline wraps unpredictably across viewport widths.
- Headline measure caps at 24 to 30 characters per line, which is far narrower than body text and is what makes a large headline scannable rather than a wall.
- Text column takes 45% of the width, the visual 55%, in a split composition.
- The hero occupies 70 to 85% of viewport height, never 100%, so the following section is visibly present.
- Proof strip sits at the bottom of the hero, inside the first viewport, because credibility is most valuable before the visitor decides to scroll.
- Maximum content width 1280px with the composition centred, so ultrawide monitors do not separate the headline from the visual by empty space.

---

# Variant Catalog

## Variant A — Split With Product Visual

```
┌──────────────┬──────────────────┐
│ Headline     │                  │
│ Subheadline  │   product UI     │
│ [ CTA ]      │                  │
└──────────────┴──────────────────┘
```

Software products whose interface communicates value on sight.

Correct when the product is visual, the interface is polished, and seeing it removes the need to explain it. Requires a genuinely presentable screenshot.

---

## Variant B — Centred With Wide Visual Below

```
┌─────────────────────────────────┐
│           Headline              │
│          Subheadline            │
│           [ CTA ]               │
│ ┌─────────────────────────────┐ │
│ │      wide product visual    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

Products with a broad audience and a single dominant message.

Correct when the headline must carry maximum weight and the visual is wide, such as a dashboard or a canvas interface. The most forgiving variant for uncertain content.

---

## Variant C — Text-Only With Proof

```
┌─────────────────────────────────┐
│           EYEBROW               │
│           Headline              │
│          Subheadline            │
│    [ CTA ]     Secondary →      │
│  Logo Logo Logo Logo Logo       │
└─────────────────────────────────┘
```

Services, agencies, and products with nothing worth showing yet.

Correct when a screenshot would weaken the claim. A text-only hero with strong proof outperforms a hero carrying a fabricated interface mockup.

---

## Variant D — Hero With Inline Capture

```
┌─────────────────────────────────┐
│           Headline              │
│          Subheadline            │
│ ┌───────────────────┐┌────────┐ │
│ │ your@email.com    ││ Start  │ │
│ └───────────────────┘└────────┘ │
│ Free for 14 days · No card      │
└─────────────────────────────────┘
```

Products where signup is genuinely one field.

Correct when reducing the click count materially improves conversion and the backend truly needs only that field. Prohibited when the form is a lie that leads to a five-step signup.

---

## Variant E — Ecommerce Category Hero

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │  lifestyle image            │ │
│ │  Winter Collection          │ │
│ │  [ Shop now ]               │ │
│ └─────────────────────────────┘ │
│  Free returns · Ships in 24h    │
└─────────────────────────────────┘
```

Retail category and campaign pages.

Correct when the product is the image and desire precedes explanation. Text overlays must sit on a controlled region of the image with a scrim, never over arbitrary photography.

---

## Variant F — Application Landing Hero

```
┌─────────────────────────────────┐
│           Headline              │
│          Subheadline            │
│  [ App Store ] [ Google Play ]  │
│ ┌────────┐                      │
│ │ phone  │  4.8 ★  12k ratings  │
│ │ frame  │                      │
│ └────────┘                      │
└─────────────────────────────────┘
```

Mobile applications distributed through stores.

Correct when the conversion is a store install. Store badges are the primary action and must use official assets at their required minimum sizes. A rating figure must be real and current.

---

# Component Hierarchy

```
HeroSection
├── HeroContainer
│   └── CompositionVariant     split | centred | text-only | media-background
├── HeroContent
│   ├── Eyebrow                optional, ≤ 30 characters
│   ├── HeroHeadline
│   ├── HeroSubheadline
│   ├── HeroActions
│   │   ├── PrimaryAction
│   │   └── SecondaryAction    optional, visually subordinate
│   ├── ReassuranceLine        ≤ 40 characters
│   └── InlineCaptureForm      Variant D only
│       ├── EmailInput
│       ├── SubmitAction
│       ├── ValidationMessage
│       └── SuccessMessage
├── HeroMedia
│   ├── MediaFrame             fixed aspect ratio
│   ├── ResponsiveImage
│   ├── VideoLoop              optional, muted
│   ├── MediaScrim             media-background variant only
│   └── MediaFallback
└── HeroProof
    ├── ProofLabel             ≤ 30 characters
    ├── LogoStrip              4 to 6 logos
    └── MetricProof            optional, real figures only
```

Reuse rules:

- `HeroSection` is one component driven by a composition property. Never a bespoke hero per page.
- Primary and secondary actions use the product's standard button component, so focus rings, sizing, and disabled behaviour match the rest of the site.
- The proof strip is shared with other pages so logo treatment and greyscale rules stay consistent.

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

## Primary Action Click

1. The button shows a pressed state within 100ms.
2. If navigation is instant, no loading state is needed.
3. If the destination takes longer than 400ms, the button enters a pending state with its label replaced by a spinner and an accessible busy announcement.
4. The button width does not change when its label is replaced, which prevents the entire hero from reflowing at the moment of highest intent.

## Inline Capture Submission

1. Validation runs on blur, not on every keystroke, so the visitor is not told their half-typed address is invalid.
2. On submit, the button enters a pending state and the input becomes read-only rather than disabled, keeping the typed value visible and announced.
3. On success, the entire form is replaced in place by a confirmation with the next step.
4. On failure, the input retains the typed value, an error appears beneath the field, and focus moves to the input.

Never clear a typed email on error. Retyping an address after a server failure is the point most visitors abandon.

## Scroll Cue

1. The next section peeks into the viewport, which is the primary cue.
2. Where an explicit indicator is used, it is a static element or animates no more than 4px, and disappears after the first scroll.
3. Animated scroll indicators that loop indefinitely are prohibited. Persistent motion in the first viewport competes with the headline.

## Media Loop

1. Any looping demonstration is muted, has no audio track, and runs 8 seconds or less.
2. It pauses when the hero scrolls out of view.
3. It does not play at all under reduced motion, falling back to its poster frame.
4. It carries a visible pause control on hover and focus.

## Sticky Header Transition

1. The header begins transparent over the hero where the design calls for it.
2. On scrolling past the hero, it gains a solid background over 200ms.
3. The transition never changes the header's height, which would shift the entire page under the visitor.

---

# States

Every region owns its own states. A failed hero image must not delay the headline.

## Loading — First Visit

Text renders first, always, from server-rendered markup with a self-hosted font using an immediate fallback swap.

The headline must never be invisible while a web font loads. A blank first viewport for 800ms is the most expensive loading state on any marketing site.

Media frames reserve their aspect ratio with a neutral surface.

```
┌──────────────────────────┐
│ Weekly reports that      │  text present immediately
│ write themselves         │
│ [ Start free ]           │
│ ┌──────────────────────┐ │
│ │   reserved 16:10     │ │  frame reserved
│ └──────────────────────┘ │
└──────────────────────────┘
```

No skeleton shimmer. The hero is not application data.

---

## Loading — Media Progressive Fill

1. The frame reserves exact dimensions.
2. A blurred low-quality placeholder derived from the real image renders.
3. The full image cross-fades over 300ms.

The placeholder must share the image's dominant colours so the transition is a sharpening rather than a jump.

---

## Loading — Action Pending

The primary button holds its width and shows a spinner in place of its label, with an accessible busy state announced once.

The reassurance line stays visible throughout, since it is the reason the visitor committed.

---

## Empty — No Proof Available

A new product with no customers renders the hero without a proof strip.

Never render placeholder logos, invented counts, or a label reading "trusted by leading companies" with no logos beneath it.

The honest substitute is a concrete non-social proof: an open-source repository, a founding team credential, a specific guarantee, or nothing at all.

---

## Empty — No Product Visual Available

Use Variant C, text-only with proof.

Never fill the space with an abstract gradient blob, a stock photograph of a laptop, or a fabricated interface mockup. Visitors recognise a mockup that is not a real product, and it costs more credibility than an empty column.

---

## Error — Hero Image Never Loads

The frame keeps its dimensions and shows a neutral surface. No broken-image icon, no alt text rendered as a large block of visible text in a decorative frame.

For media-background variants, the background falls back to a solid colour drawn from the image's dominant tone, chosen in advance to guarantee 4.5:1 contrast against the overlaid text.

The hero must remain fully readable and fully actionable with zero images loaded. This is the single most important hero failure test.

---

## Error — Inline Capture Failed

```
┌─────────────────────────────────┐
│ ┌───────────────────┐┌────────┐ │
│ │ jo@company.com    ││ Start  │ │
│ └───────────────────┘└────────┘ │
│ ⚠ We couldn't reach the server. │
│   Your address is saved — try   │
│   again.                        │
└─────────────────────────────────┘
```

The typed value persists, the message names the cause, and retry is one tap.

---

## Error — Page Failed

Only when nothing renders. Required: plain cause, retry, and a route to support with a reference identifier.

---

## Long-Copy Overflow

Headlines exceeding three lines on mobile or two lines on desktop must be rewritten, not truncated. A truncated headline loses the clause that named the outcome.

Subheadlines exceeding two lines on mobile are rewritten to one idea.

Where the content system cannot guarantee length, the headline wraps to a hard maximum of four lines and the hero grows, but the primary action must remain above the fold on a 667px viewport. If it cannot, the copy is too long.

---

## JavaScript Disabled

The entire hero renders: headline, subheadline, visual, actions, proof.

The primary action is a real link or a real form submission, never a button whose only behaviour comes from a script.

Looping video falls back to its poster frame.

Any entrance animation is opt-in through script, so its absence leaves the hero fully visible rather than blank.

---

## Success — Inline Capture Completed

```
┌─────────────────────────────────┐
│ ✓ Check your inbox              │
│   We sent a link to             │
│   jo@company.com                │
│   Didn't arrive? Resend         │
└─────────────────────────────────┘
```

The confirmation replaces the form in place, repeats the address so the visitor can verify it, and offers recovery without a page change.

Focus moves to the confirmation heading so screen reader users receive the result.

---

## Permission-Limited — Region Restricted Offer

When the primary offer is unavailable in the visitor's region, change the action rather than letting it fail after the click.

```
Not available in your region yet.
[ Join the waitlist ]
```

A hero that promises something the visitor cannot have is worse than a hero that offers them the closest real thing.

---

# Mobile Behavior

- Headline is the first element after the header, before any visual.
- Headline 30 to 36px, three lines maximum, at line height 1.15.
- One primary button, full width, minimum 48px tall, with a 44×44 minimum for any secondary text link's tap area.
- The action sits above the visual so it is reachable without scrolling.
- Total hero height under 620px, leaving the next section visibly peeking.
- Never 100vh, and never rely on vh units alone, since mobile browser chrome changes the real viewport height during scroll.
- Product screenshots are cropped to the meaningful region for mobile rather than scaled down.
- Looping video is disabled on cellular where the connection type is detectable, falling back to the poster frame.
- Proof strip logos wrap to two rows rather than shrinking below a legible size.
- The reassurance line sits directly under the button, within 8px, so it is read as part of the same decision.

---

# Desktop Expansion

Added space is spent on:

- a side-by-side composition letting the claim and the product be seen together
- a larger product visual with genuine legible interface detail
- a secondary low-commitment action beside the primary
- the proof strip inside the first viewport

Added space is never spent on:

- a headline wider than 30 characters per line
- a third action
- background video that competes with the headline for attention
- a hero stretched to 100vh on a tall monitor, leaving the next section entirely hidden
- carousels that rotate the headline, which guarantee most visitors never read the strongest message

---

# Accessibility Requirements

- The headline is the page's single top-level heading, and it is the first heading in the document order.
- The eyebrow is not a heading. It is a styled paragraph or part of the headline's accessible name.
- Tab order runs: skip link, header navigation, primary action, secondary action, then the rest of the page. The primary action must be reachable within a small number of tab presses.
- The primary action is a link when it navigates and a button when it submits. This distinction determines whether Enter and Space both work and whether it can be opened in a new tab.
- Text over imagery meets 4.5:1 contrast, verified against the lightest and darkest regions of the image rather than its average, with a scrim applied where the image varies.
- Where a scrim is required, it is part of the design, not an afterthought, and the fallback solid colour meets the same ratio.
- Decorative background media carries empty alt and is hidden from assistive technology.
- Product screenshots carry alt text describing what the interface shows, under 125 characters.
- The reassurance line is associated with the action so screen reader users hear the condition with the offer.
- Inline capture inputs have visible persistent labels, not placeholder-only labels, and errors are associated programmatically with the field.
- Form errors announce through a polite live region, and focus moves to the first invalid field.
- Looping media stops entirely under reduced motion, and entrance animation is disabled rather than shortened.
- All meaning survives greyscale, including the distinction between primary and secondary actions, which must differ in weight and not only in colour.
- At 200% zoom the split composition stacks, the headline stays within four lines, and the primary action remains reachable without horizontal scrolling.
- Logo strip images carry the company name as alt text, or empty alt where the label above already states the relationship.

---

# Data Requirements

Content requirements:

```
Eyebrow — maximum 30 characters, optional, category or audience only

Headline — maximum 60 characters, states the outcome, avoids company jargon,
            readable aloud in one breath

Subheadline — maximum 120 characters, explains the mechanism the headline claims

Primary action label — maximum 20 characters, verb-first, states what happens next

Secondary action label — maximum 24 characters, lower commitment than the primary

Reassurance line — maximum 40 characters, removes the specific cost of clicking

Media — real product interface or real photography, minimum 1600px wide source,
        cropped variant for mobile, fixed aspect ratio

Alt text — maximum 125 characters

Proof — 4 to 6 real customer logos with permission, or one real verifiable metric
```

Per variant:

```
Variant A  — real screenshot mandatory, 16:10 or 4:3
Variant B  — wide visual at 16:9 or 21:9, headline ≤ 50 characters
Variant C  — proof mandatory; without proof this variant has nothing
Variant D  — one field only; backend must genuinely accept one field
Variant E  — image with a controlled text region, scrim, guaranteed contrast
Variant F  — official store badges at required minimum size, real current rating
```

Never publish an invented customer count. Never publish a rating that is not live. Never write a headline that describes a category the product does not belong to.

---

# Performance Requirements

- The headline is visible within 1 second on a 4G connection, rendered from server markup.
- Fonts are self-hosted, preloaded, and use an immediate fallback swap so text is never invisible.
- The hero image is the page's largest contentful element and is eagerly loaded with high fetch priority. No lazy loading in the first viewport.
- Hero media declares intrinsic dimensions, contributing zero layout shift.
- Images are served in a modern format with breakpoint-specific sources; the mobile source is cropped, not scaled.
- Looping video is capped at 8 seconds and 2MB, is not preloaded, and never blocks first render.
- No animation library loads for the hero.
- Total hero payload under 400KB on mobile including the visual.
- Third-party scripts never render before the hero. A hero delayed by a tag manager is a hero most visitors never see.

---

# Anti-Patterns

Never build:

- a headline describing the company instead of the visitor's outcome
- a headline of abstract vocabulary such as "Empowering ambition at scale"
- three equally weighted buttons in one hero
- a rotating carousel of headlines
- a 100vh hero with no visible indication the page continues
- background video with audio, or video that autoplays under reduced motion
- text placed over uncontrolled photography without a scrim
- a fabricated interface mockup standing in for a product that does not look like that
- stock photography of people at laptops
- placeholder client logos or "trusted by leading companies" with nothing beneath
- invented user counts or ratings
- a primary action whose label is "Learn more", which states no outcome
- an inline email field that leads to a five-step signup
- an entrance animation that leaves the headline blank if a script fails
- a full hero on every page of a site, including pages the visitor navigated to on purpose
- a scroll indicator that loops forever, competing with the headline

---

# Pattern Output Example

```
Product

Reporting Automation Platform


Traffic Source

Mixed: paid search, referral, direct


Variant

Variant A — split with real product visual


Headline

"Weekly reports that write themselves" — 36 characters


Subheadline

"Connect your tools once. Reports arrive every Monday at 9am." — 60 characters


Primary Action

Start free — navigates to signup


Secondary Action

See a demo — text link, visually subordinate


Reassurance

No card required


Media

Real dashboard screenshot, 16:10, cropped variant for mobile


Proof

5 named customer logos inside the first viewport


Mobile

Headline first, action above visual, hero height 590px, next section peeks


Hero Height

78% of viewport on desktop, never 100vh


Image Failure

Hero fully readable and actionable with zero images loaded


No-JavaScript

Full hero renders; primary action is a real link


Accessibility

Single top-level heading, 4.5:1 over media, greyscale-safe action hierarchy


Performance

Headline visible under 1 second, hero payload 340KB mobile


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The headline states an outcome and is under 60 characters
- [ ] What it is, who it is for, and what to do next are all answerable from the first viewport
- [ ] Exactly one primary action exists
- [ ] Any secondary action is visually subordinate and lower commitment
- [ ] A reassurance line sits directly beneath the primary action
- [ ] Mobile places the headline first and the action above the visual
- [ ] The primary action is reachable on a 667px viewport without scrolling
- [ ] The hero is never 100vh and the next section peeks
- [ ] Product visuals show the real interface, cropped for mobile
- [ ] The hero is fully readable and actionable with zero images loaded
- [ ] Text over imagery meets 4.5:1 against the lightest and darkest image regions
- [ ] Proof is real and named, or absent — never placeholder logos
- [ ] No invented counts, ratings, or statistics
- [ ] Fonts never leave the headline invisible during load
- [ ] Hero media declares dimensions and causes no layout shift
- [ ] The headline is the single top-level heading and appears first in document order
- [ ] The primary action is a link when navigating and a button when submitting
- [ ] Inline capture preserves the typed value on error and moves focus to the field
- [ ] Inline capture success confirms in place and repeats the address
- [ ] Looping media is muted, pausable, and disabled under reduced motion
- [ ] Action hierarchy survives greyscale
- [ ] 200% zoom stacks the composition and keeps the action reachable
- [ ] Full hero renders with JavaScript disabled

---

# Final Rule

A hero earns its place by making a stranger understand, in one sentence, whether the rest of the page is worth their time.

Every element must justify itself against one question:

Does this help the visitor answer "is this for me?" faster?

If it does not, it is decoration standing between the visitor and the answer.
