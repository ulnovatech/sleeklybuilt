# Font Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, Design Constitution, Visual Language

---

# Purpose

Font Intelligence is responsible for selecting the most appropriate typography for a product.

Typography is the single most influential visual decision in an interface.

It determines:

- personality
- trust
- readability
- hierarchy
- perceived quality

A poor font choice can make an excellent product appear amateur.

A great font choice can make an ordinary interface feel premium.

Font selection is therefore an intelligence problem—not a design preference.

---

# Core Philosophy

Never choose fonts because they are popular.

Never choose fonts because they look beautiful.

Choose fonts because they best communicate the product's personality, purpose, audience, and level of information density.

Typography is strategy.

---

# Decision Pipeline

Every project follows this order:

```
Product Classification
        ↓
Brand Personality
        ↓
Reading Environment
        ↓
Information Density
        ↓
Typography Strategy
        ↓
Font Selection
        ↓
Type Scale
        ↓
Quality Review
```

Never skip a step.

---

# Step 1 — Understand the Product

Identify:

- Product category
- User type
- Emotional tone
- Information density
- Reading duration
- Device priority

Typography depends on context.

---

# Step 2 — Determine the Personality

Choose up to three dominant traits.

Examples:

Professional

Friendly

Luxury

Technical

Corporate

Creative

Minimal

Editorial

Playful

Elegant

Bold

Calm

Every font decision must reinforce these traits.

---

# Step 3 — Determine Reading Style

Classify the interface.

Examples:

Mostly navigation

Mostly forms

Mostly dashboards

Mostly documentation

Mostly marketing

Mostly ecommerce

Mostly messaging

Mostly data

Typography changes dramatically depending on reading behavior.

---

# Step 4 — Determine Reading Distance

Estimate how the interface will be consumed.

Examples:

Quick scanning

Continuous reading

Data analysis

Content creation

Decision making

This affects:

- font size
- spacing
- weight
- hierarchy

---

# Font Categories

## Neutral Sans

Characteristics

- Modern
- Clean
- Professional
- Universal

Best for:

- SaaS
- CRM
- Dashboards
- Admin Panels
- Productivity
- AI Products

Examples:

- Inter
- Geist
- IBM Plex Sans

---

## Humanist Sans

Characteristics

- Friendly
- Warm
- Readable
- Natural

Best for:

- Healthcare
- Education
- Restaurants
- Communities
- Customer Portals

Examples:

- Source Sans
- Nunito Sans
- Lato

---

## Geometric Sans

Characteristics

- Modern
- Bold
- Startup
- Marketing

Best for:

- Landing pages
- Agencies
- Creative products
- Consumer apps

Examples:

- Manrope
- Plus Jakarta Sans
- Satoshi

---

## Technical Sans

Characteristics

- Precise
- Engineering
- Analytical

Best for:

- Developer tools
- Infrastructure
- Security
- APIs
- DevOps

Examples:

- IBM Plex Sans
- Inter
- Geist

---

## Editorial Serif

Characteristics

- Premium
- Sophisticated
- Luxury
- Publishing

Best for:

- Blogs
- Luxury brands
- Editorial
- High-end marketing

Examples:

- Newsreader
- Spectral
- Libre Baskerville

Use sparingly.

---

# Preferred Font Families

Design OS maintains a curated list.

## Tier 1

Use whenever appropriate.

- Inter
- Geist
- Manrope
- Plus Jakarta Sans
- IBM Plex Sans
- Source Sans 3

---

## Tier 2

Specialized.

- Newsreader
- Spectral
- Nunito Sans
- Lora
- Work Sans

---

Avoid outdated defaults unless intentionally required.

Examples:

- Arial
- Helvetica (unless platform-native)
- Verdana
- Tahoma
- Times New Roman

---

# Font Selection Matrix

## SaaS

Primary

Inter

Alternatives

Geist

IBM Plex Sans

---

## AI Products

Primary

Geist

Alternatives

Inter

Manrope

---

## CRM

Primary

Inter

Alternative

IBM Plex Sans

---

## Dashboards

Primary

Inter

Alternative

Geist

---

## Ecommerce

Primary

Plus Jakarta Sans

Alternative

Manrope

---

## Restaurant

Primary

Manrope

Alternative

Nunito Sans

---

## Healthcare

Primary

Source Sans 3

Alternative

IBM Plex Sans

---

## Education

Primary

Source Sans 3

Alternative

Nunito Sans

---

## Agency

Primary

Manrope

Alternative

Geist

---

## Portfolio

Primary

Manrope

Alternative

Inter

---

## Editorial

Primary

Newsreader

Body

Source Sans 3

---

# Typography Hierarchy

Typography should establish hierarchy before color.

Priority:

Display

↓

Heading

↓

Section

↓

Body

↓

Supporting

↓

Caption

↓

Metadata

Never compensate for weak hierarchy using color alone.

---

# Weight Strategy

Prefer restraint.

Recommended:

Regular

Medium

Semibold

Avoid overusing Bold.

Reserve heavy weights for moments of high importance.

---

# Line Length

Ideal reading width:

45–75 characters

Avoid:

Extremely wide paragraphs

Extremely narrow columns

---

# Line Height

Body text

Approximately 1.5–1.7

Headings

Approximately 1.1–1.3

Dense dashboards may require tighter spacing.

---

# Letter Spacing

Maintain optical balance.

Do not aggressively modify tracking unless creating display typography.

---

# Mobile Typography

Typography should prioritize readability.

Never shrink text to fit layouts.

Adapt layouts instead.

Body text should remain comfortable for prolonged reading.

---

# Dark Mode

Typography should remain highly legible.

Avoid low-contrast gray text.

Favor readability over stylistic subtlety.

---

# Accessibility

Typography must support:

- scaling
- zoom
- reduced vision
- high contrast
- screen readers

Accessibility always overrides aesthetics.

---

# Font Pairing Rules

Use:

One primary family.

Optionally one secondary family.

Never use three unrelated typefaces in the same product.

Consistency creates trust.

---

# Font Intelligence Output

The module should produce:

```
Primary Typeface

Inter

Fallback

system-ui

Category

Neutral Sans

Personality

Professional
Modern
Trustworthy

Display Weight

700

Heading Weight

600

Body Weight

400

Scale

8-point modular

Reading Density

Medium

Body Size

16px

Body Line Height

1.6

Heading Style

Semibold

Mobile Optimized

Yes

Accessibility

WCAG compliant
```

This output feeds:

- Typography System
- Layout Intelligence
- Component Intelligence
- Design Tokens

---

# Failure Conditions

Font selection fails if:

- It conflicts with the product personality.
- Readability is sacrificed.
- Multiple unrelated fonts are mixed.
- Decorative fonts dominate UI.
- Hierarchy depends on font size alone.
- Typography becomes visually inconsistent.

If any condition fails,

repeat the selection process.

---

# Final Rule

Typography should never make users notice the font.

It should make them notice how effortless the interface feels to read.

When typography is correct, users trust the product before they consciously evaluate it.

That is the objective of Font Intelligence.