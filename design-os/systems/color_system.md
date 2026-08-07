# Color System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Color Intelligence, Design Tokens, Typography System, Elevation System, Accessibility

---

# Purpose

The Color System defines the structure of color inside the product.

Color Intelligence decides *which* colors a product should use.

The Color System decides *how* those colors are organized, named, applied, and enforced.

Without this system, teams produce:

- twenty shades of the same grey
- buttons that change color per screen
- text that fails contrast in dark mode
- accents that stop meaning anything

The Color System converts a palette into infrastructure.

---

# Core Philosophy

A product does not have colors.

A product has color roles.

```
Role

↓

Token

↓

Value
```

Components must never reference a value.

Components reference a role.

This is what allows themes, dark mode, and rebrands without touching component code.

---

# System Architecture

```
Palette Ramps

↓

Semantic Roles

↓

Component Tokens

↓

State Variants

↓

Contrast Validation
```

Each layer may only depend on the layer above it.

---

# Layer 1 — Palette Ramps

A ramp is an ordered scale of one hue.

Every ramp uses the same step scale so hues remain interchangeable.

```
50
100
200
300
400
500
600
700
800
900
950
```

## Required Ramps

```
neutral

brand

success

warning

danger

info
```

## Optional Ramps

```
accent

secondary
```

Add an optional ramp only when a real role requires it.

---

## Ramp Construction Rules

- `50–200` are surfaces and tints.
- `300–400` are borders and disabled content.
- `500–600` are actions and emphasis.
- `700–900` are text and pressed states.
- `950` is reserved for deep backgrounds.

Steps must be perceptually even.

Never generate ramps by mathematically lightening a single hex value.

Adjust hue slightly across the ramp so light steps do not look washed and dark steps do not look muddy.

---

## Neutral Ramp Is Not Grey

The neutral ramp carries the product's temperature.

Choose one bias and hold it:

Warm neutral

Used for editorial, hospitality, lifestyle, premium print-like products.

Cool neutral

Used for technical, financial, analytical, enterprise products.

True neutral

Used when brand color must dominate completely.

A pure `#000000` and a pure `#FFFFFF` next to a biased neutral ramp will read as a mistake.

Decide the extremes deliberately.

---

# Layer 2 — Semantic Roles

Semantic roles are the only names product code should use.

---

## Surface Roles

```
surface-base

surface-raised

surface-sunken

surface-overlay

surface-inverse
```

Definitions:

`surface-base`

The page canvas.

`surface-raised`

Cards, panels, popovers. Sits above base.

`surface-sunken`

Wells, inputs, code blocks. Sits below base.

`surface-overlay`

Modal scrims and sheet backdrops.

`surface-inverse`

Bands that flip the tier for emphasis.

---

## Content Roles

```
content-primary

content-secondary

content-muted

content-disabled

content-inverse

content-link
```

Rules:

- `content-primary` carries headings and body copy.
- `content-secondary` carries supporting copy and labels.
- `content-muted` carries metadata only. Never instructions.
- `content-disabled` is never used to communicate information.
- `content-inverse` is required whenever `surface-inverse` exists.

---

## Border Roles

```
border-subtle

border-default

border-strong

border-focus
```

`border-subtle` separates content in the same group.

`border-default` separates groups.

`border-strong` marks selection and active containers.

`border-focus` is reserved for keyboard focus and nothing else.

---

## Action Roles

```
action-primary

action-primary-hover

action-primary-active

action-secondary

action-secondary-hover

action-danger

action-danger-hover

action-disabled
```

There is exactly one `action-primary` per product.

If a screen appears to need two primary actions, the screen has two competing goals.

Fix the screen, not the palette.

---

## Status Roles

```
status-success

status-success-surface

status-warning

status-warning-surface

status-danger

status-danger-surface

status-info

status-info-surface
```

Every status requires a pair:

A strong value for icons, text, and borders.

A surface value for the container fill.

Never place strong status color behind text.

---

## Focus Role

```
focus-ring
```

The focus ring must:

- reach 3:1 contrast against both adjacent surfaces
- remain visible on brand-colored buttons
- never be removed
- never be replaced by a color change alone

---

# Layer 3 — Component Tokens

Component tokens resolve to semantic roles.

Example:

```
button-primary-background   → action-primary
button-primary-text         → content-inverse
button-primary-border       → transparent

card-background             → surface-raised
card-border                 → border-subtle

input-background            → surface-sunken
input-border                → border-default
input-border-focus          → border-focus
input-placeholder           → content-muted
```

A component token may never point directly at a ramp step.

If a component needs a value no role provides, the role layer is incomplete.

Add the role.

Do not bypass it.

---

# Layer 4 — State Variants

Every interactive color needs a full state set.

```
default

hover

active

focus

selected

disabled

loading
```

## State Derivation Rules

Hover

Move one ramp step toward the dark end on light themes.

Move one step toward the light end on dark themes.

Active

Move two steps in the same direction as hover.

Selected

Use a tint surface plus a strong border. Never rely on fill alone.

Disabled

Reduce contrast, never opacity of the whole component. Opacity on a nested element produces unpredictable results over gradients.

Loading

Keep the container color stable. Only the content changes.

Never let a button change color while it is loading. Users read that as a state change they did not cause.

---

# Contrast Requirements

Non-negotiable minimums:

```
Body text                4.5:1

Large text (24px+)       3:1

Icons carrying meaning   3:1

Borders on controls      3:1

Focus indicator          3:1

Disabled text            no minimum, but never load-bearing
```

## Validation Rule

Contrast is validated against the actual rendered surface, not the theoretical one.

Text on `surface-raised` sitting on a gradient must be checked against the darkest and lightest point of that gradient.

---

## Banned Combinations

Record these explicitly in the product's palette documentation:

- mid-ramp brand color as body text on dark surfaces
- status colors as body text
- `content-muted` on `surface-sunken`
- any pairing below 4.5:1 used for instructions or errors

A banned combination should be impossible to reach through a component API, not merely discouraged in prose.

---

# The 60-30-10 Enforcement

Color Intelligence recommends the balance.

The Color System enforces it structurally:

60%

Neutral surfaces and neutral text.

30%

Brand-adjacent structure — headings, links, tints.

10%

Accent. Primary actions and single emphasis moments.

Practical test:

Screenshot any viewport.

Count accent elements.

More than one competing accent means the hierarchy has failed.

---

# Dark Mode

Dark mode is a separate theme, not an inversion.

## Required Adjustments

Surfaces

Elevation moves *up* in lightness on dark themes. A raised card is lighter than the base, never darker.

Text

Never pure white. Use the `100` or `50` step of the neutral ramp to avoid halation.

Brand color

Mid-ramp brand colors that pass on light backgrounds usually fail on dark. Shift to a lighter ramp step for text and keep the original step for fills.

Shadows

Shadows barely read on dark surfaces. Communicate elevation with surface lightness and borders instead.

Status colors

Desaturate slightly. Fully saturated red and green vibrate against dark surfaces.

---

## Dark Mode Rule

Both themes must be defined at the same time.

A product that ships light-only and adds dark later will always contain hardcoded values that leak.

---

# Gradients

A gradient is a surface treatment, not a color role.

Permitted uses:

- brand atmosphere on hero and emphasis bands
- depth on large empty surfaces
- data visualization ranges

## Gradient Requirements

Any gradient used behind content must:

- resolve to a solid seat color at the edge where content meets the next section
- include grain or dither if it spans more than 40% of a viewport
- pass contrast at its lightest and darkest point
- never carry meaning

Banded gradients on 8-bit displays are the most common cause of a product looking cheap at full size while looking fine in a design tool.

---

# Transparency

Transparent colors are only safe when the surface beneath them is known.

Rules:

- Scrims may be transparent.
- Borders may be transparent.
- Text may never be transparent.
- Status surfaces may not be transparent over unknown content.

If a value must be transparent, define what it is allowed to sit on.

---

# Color and Data Visualization

Charts have their own constraints because they use color as data.

## Categorical Series

Maximum six distinguishable series.

Beyond six, group the remainder into "Other" or change the visualization.

Series must differ in lightness as well as hue so they survive greyscale printing and color blindness.

## Sequential Series

Use a single ramp.

Light equals low. Dark equals high. Never reverse this per chart.

## Diverging Series

Use two ramps meeting at a neutral midpoint.

The midpoint must be a real value, usually zero, not the visual center.

## Chart Rules

- Never reuse `status-danger` for a neutral category.
- Never encode a value only in color. Pair with label, position, or pattern.
- Keep the same series color for the same series across every chart in the product.

---

# Color Blindness

Roughly one in twelve men has reduced color discrimination.

Requirements:

- Success and error must differ by icon or text, not only hue.
- Red and green must never be adjacent as the only distinction in a chart.
- Selected states must include a border or checkmark.
- Required fields must not be marked by color alone.

Test rule:

Convert the screen to greyscale.

If any information disappears, the screen is not finished.

---

# Theming

The role layer makes theming mechanical.

A theme is a complete set of role values.

```
theme

├── surface roles
├── content roles
├── border roles
├── action roles
├── status roles
└── focus role
```

## Theme Rules

- Themes never add roles. They only supply values.
- A component that works in one theme must work in all themes with no changes.
- Theme switching must not cause layout shift.
- The user's system preference is the default. An explicit user choice overrides it and persists.

---

# Implementation Requirements

The system is only real if it is enforced in code.

Required:

- Roles defined once, in one file, as the single source of truth.
- Ramps not exposed to component code.
- A lint rule or review gate that rejects raw color values in components.
- Both themes generated from the same role definitions.

If a developer can type a hex value into a component and pass review, there is no color system.

---

# Color System Output

Example:

```
Product

Field Service Platform


Neutral Bias

Cool


Brand Ramp

Indigo


Accent

Amber, single role


Surfaces

base / raised / sunken / overlay / inverse


Content

primary / secondary / muted / disabled / inverse


Action Primary

indigo-600


Status

success green / warning amber / danger red / info blue


Themes

Light + Dark, defined together


Contrast

AA verified, AAA on body copy


Charts

Six categorical series, lightness-differentiated


Greyscale Test

Pass


Review

Pass
```

---

# Failure Conditions

The color system has failed when:

- Components contain raw color values.
- The same visual role has more than one token.
- Dark mode required component changes.
- Accent color appears more than once per viewport.
- Status colors are used decoratively.
- Contrast passes in the design tool but fails in the build.
- Adding a theme requires editing components.
- Greyscale removes information.

---

# QA Checklist

Before approval:

- [ ] Every ramp has defined step meanings
- [ ] Every semantic role has a value in every theme
- [ ] No component references a ramp step directly
- [ ] All interactive colors define all seven states
- [ ] Focus ring passes 3:1 on every background it appears on
- [ ] Body text passes 4.5:1 on every surface it appears on
- [ ] Gradients resolve to a seat color at section edges
- [ ] Status colors pair strong and surface values
- [ ] Chart series are lightness-differentiated
- [ ] Greyscale test loses no information
- [ ] Banned combinations are documented and unreachable

---

# Final Rule

A color system is not a palette.

A palette is a set of options.

A system is a set of decisions already made, so that no screen has to make them again.

When color is systemized correctly, designers stop discussing which blue to use, and developers stop inventing one.
