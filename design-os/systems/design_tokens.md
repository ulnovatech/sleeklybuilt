# Design Tokens System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Typography System, Spacing System, Color Intelligence, Component Intelligence, Design Constitution

---

# Purpose

The Design Tokens System defines the smallest reusable values that control the visual language of the product.

Tokens create consistency between:

- design decisions
- components
- code
- platforms
- future iterations

Instead of manually choosing values repeatedly, the product uses a shared design vocabulary.

---

# Core Philosophy

Do not design screens.

Design systems.

A professional product is not a collection of pages.

It is a collection of decisions that repeat intelligently.

---

# Token Architecture

Design OS uses three levels.

```
Global Tokens

↓

Semantic Tokens

↓

Component Tokens
```

---

# Global Tokens

Raw values.

They define the available design primitives.

Examples:

- colors
- spacing
- sizes
- radii
- shadows
- typography

---

# Semantic Tokens

Meaning-based decisions.

They describe purpose.

Examples:

Instead of:

```
blue-500
```

Use:

```
primary-action
```

Instead of:

```
gray-100
```

Use:

```
surface-secondary
```

---

# Component Tokens

Specific component decisions.

Examples:

Button:

```
button-height

button-radius

button-padding

button-color
```

---

# Color Tokens

Colors should be semantic.

---

# Brand Colors

Examples:

```
primary

secondary

accent
```

---

# Surface Colors

Examples:

```
background

surface

surface-raised

surface-overlay
```

---

# Text Colors

Examples:

```
text-primary

text-secondary

text-disabled

text-inverse
```

---

# Status Colors

Examples:

```
success

warning

error

info
```

---

# Color Rules

Never:

- hardcode random colors
- create unlimited shades
- use color without meaning

---

# Typography Tokens

Typography values should reference the Typography System.

Example:

```
font-family-base

font-size-body

font-size-heading

font-weight-medium

line-height-default
```

---

# Spacing Tokens

Reference:

Spacing System.

Example:

```
space-xs

space-sm

space-md

space-lg

space-xl
```

---

# Radius Tokens

Define shape personality.

Example:

```
radius-none

radius-small

radius-medium

radius-large

radius-pill
```

---

# Radius Personality

---

# Sharp

Used for:

- technical
- enterprise
- professional tools

---

# Rounded

Used for:

- consumer apps
- friendly products

---

# Soft

Used for:

- modern SaaS
- lifestyle products

---

# Extreme Rounded

Use carefully.

Avoid:

everything looking like a toy.

---

# Elevation Tokens

Reference:

Elevation System.

Example:

```
shadow-none

shadow-small

shadow-medium

shadow-large
```

---

# Motion Tokens

Reference:

Motion System.

Example:

```
duration-fast

duration-normal

duration-slow

ease-default
```

---

# Breakpoint Tokens

Avoid device-specific thinking.

Use content-based breakpoints.

Example:

```
small

medium

large

extra-large
```

---

# Z-Index Tokens

Layering must be controlled.

Example:

```
base

dropdown

sticky

modal

notification
```

---

# Component Token Examples

---

# Button

```
button-height

button-padding

button-radius

button-font

button-transition
```

---

# Card

```
card-padding

card-radius

card-border

card-shadow
```

---

# Input

```
input-height

input-radius

input-border

input-focus
```

---

# Navigation

```
nav-height

nav-background

nav-active-color
```

---

# Token Naming Rules

Names should describe:

Purpose.

Not appearance.

Bad:

```
green-button
```

Good:

```
success-action
```

---

Bad:

```
rounded-box
```

Good:

```
card-radius
```

---

# Theme Support

Tokens should enable:

- light mode
- dark mode
- brand variations
- future redesigns

without rewriting components.

---

# Platform Adaptation

The same tokens may power:

- web apps
- mobile apps
- design tools
- component libraries

---

# Token Ownership

Every token belongs to a system.

Examples:

Typography owns text sizes.

Spacing owns gaps.

Motion owns durations.

Components consume tokens.

---

# Token Anti-Patterns

Never create:

- duplicate values
- unexplained numbers
- component-specific colors everywhere
- inconsistent spacing values
- random radius choices

---

# Design Token Output

Example:

```
Product

Mobile Banking App


Typography

Inter


Primary Color

Brand Blue


Spacing

8pt System


Radius

Medium Rounded


Elevation

Subtle


Motion

300ms Standard


Theme

Light + Dark


Review

Pass
```

---

# Implementation Binding Contract

Design OS tokens are prose roles until a consuming app maps them to code.

## Mapping rule

```
Design OS semantic role

↓

CSS custom property or Tailwind theme key

↓

Component class / style
```

Components must reference the mapped token, never a raw hex, raw pixel spacing, or one-off radius, when a role exists.

## Example role → code shape

```
surface-base          →  --color-surface-base  /  bg-surface-base
content-primary       →  --color-content-primary  /  text-content-primary
action-primary        →  --color-action-primary  /  bg-action-primary
space-md              →  --space-md  /  p-md / gap-md
radius-medium         →  --radius-md  /  rounded-md
```

Exact naming is per application. The contract is: one role, one implementation key, no bypasses.

## Product-specific palettes

Brand hex values belong in the product repository (for example `marketing/DESIGN.md`), not in Design OS.

Design OS owns the role names and usage rules.

The product owns the hex assigned to those roles.

## Marketing hub reconciliation (SleeklyBuilt)

Illustrative map from `marketing/DESIGN.md` tokens into Color System roles:

```
cream                 →  surface-base (light)
cream-deep            →  surface-sunken / border-subtle (light)
obsidian              →  surface-inverse / surface-base (dark bands)
obsidian-raised       →  surface-raised (on inverse)
obsidian-line         →  border-default (on inverse)
ink                   →  content-primary (light)
ink-soft              →  content-secondary (light)
cream (on dark)       →  content-inverse / content-primary (on inverse)
emerald / emerald-deep→  action-primary / content-link (light contexts)
gold                  →  accent (single emphasis / primary CTA marker)
```

Gaps to close in the marketing app when binding:

- Explicit `status-*` roles if not already present
- Focus ring token distinct from gold/emerald
- Hover/active steps for action-primary
- Forbid raw hex in components once the map ships

## Enforcement

- Design System Review and UI checklists reject raw color/spacing when tokens exist.
- `.cursor/settings.json` sets `forbidRawColorWhenTokensExist` and `forbidRawSpacingWhenTokensExist`.
- Run `node scripts/validate-design-os.mjs` to keep the knowledge corpus structurally valid.

---

# QA Checklist

Before approval:

- [ ] Tokens have clear ownership
- [ ] Components consume tokens
- [ ] Values are consistent
- [ ] Themes can change easily
- [ ] No random hardcoded styles exist
- [ ] Design decisions are reusable
- [ ] Role → code map exists for the consuming app
- [ ] Raw hex/spacing in components is rejected in review when tokens exist

---

# Final Rule

Tokens are the DNA of the interface.

A professional product does not repeatedly choose design values.

It defines them once and lets the system scale.