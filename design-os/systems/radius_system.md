# Radius System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Design Tokens, Elevation System, Component Intelligence, Visual Language

---

# Purpose

The Radius System defines how rounded corners and shape relationships are applied throughout a product.

Radius contributes to:

- product personality
- visual consistency
- component recognition
- interaction quality

Radius is not decoration. It is a constrained vocabulary that makes related surfaces feel like one product.

---

# Core Philosophy

Do not choose rounded corners by taste in the moment.

Every radius decision must answer:

```
Brand personality

↓

Component role

↓

Approved token

↓

Consistency check
```

If a value is not on the scale, it is not allowed.

---

# Radius Decision Pipeline

```
Product Personality

↓

Choose Radius Style Family

↓

Map Components To Tokens

↓

Validate Hierarchy

↓

Responsive Review

↓

Accessibility Review
```

---

# Radius Scale

A product defines a limited set of radius tokens. Do not invent off-scale values.

Approved scale:

```
radius-none     0px
radius-xs       2px
radius-sm       4px
radius-md       8px
radius-lg       12px
radius-xl       20px
radius-2xl      32px
radius-full     9999px
```

Products may omit tokens they will never use. They may not add one-off pixel values beside the scale.

---

# When To Use Each Radius

## radius-none (0px)

Use when:

- dense data tables and admin grids need maximum information clarity
- technical or enterprise products adopt a sharp personality
- separators, rules, and full-bleed media must feel architectural

Do not use when:

- consumer apps need approachable controls
- touch targets benefit from softer hit areas

---

## radius-xs (2px)

Use when:

- slight softening is needed without losing precision
- small chips, tags, or compact badges sit inside dense layouts
- charts and tool UIs need almost-square geometry

---

## radius-sm (4px)

Use when:

- secondary controls in dense interfaces
- compact inputs in data-heavy forms
- nested elements inside larger rounded containers

Rule: nested radius should be smaller than parent radius so inner corners do not collide visually.

---

## radius-md (8px)

Use when:

- default buttons in balanced products
- standard text inputs, selects, and search fields
- common content cards and list rows

This is the default working radius for most SaaS and ecommerce UI.

---

## radius-lg (12px)

Use when:

- primary feature cards
- image containers in catalogs
- medium dialogs and popovers
- grouped control clusters that need stronger containment

---

## radius-xl (20px)

Use when:

- marketing feature panels
- large media frames
- prominent empty-state containers
- mobile sheets that need a distinct top edge

Do not use on small controls. Large radius on tiny targets looks accidental.

---

## radius-2xl (32px)

Use when:

- hero marketing surfaces
- onboarding panels
- large promotional modules that must feel soft and premium

Limit usage. If everything is 2xl, nothing feels special.

---

## radius-full (pill)

Use when:

- avatar masks
- icon-only circular buttons that are truly circular
- status dots
- intentionally pill-shaped filters or tags in consumer products

Do not use when:

- long text buttons become stadium shapes that hurt scanability
- form fields become pills and reduce edge affordance
- every chip, button, and badge competes as a pill

---

# Radius Style Families

Choose one family per product. Do not mix sharp enterprise tables with soft consumer pills unless product areas are explicitly branded as separate surfaces.

## Sharp

Tokens center on `none` / `xs` / `sm`.

Use for: data systems, professional tools, dense admin.

## Balanced

Tokens center on `sm` / `md` / `lg`.

Use for: SaaS, ecommerce, general products.

## Soft

Tokens center on `md` / `lg` / `xl`, with selective `full`.

Use for: lifestyle apps, creative consumer products.

---

# Component Mapping Rules

## Buttons

- Primary and secondary share one radius token
- Size changes padding, not shape language
- Icon-only circular buttons may use `full`; text buttons should not by default

## Inputs

- Text fields, selects, and search share one token
- Validation and focus states do not change radius
- Textareas match input radius on the edges users see first

## Cards

- Default content cards: `md` or `lg`
- Interactive cards match sibling non-interactive cards unless elevation already separates them
- Do not round cards heavily to compensate for weak spacing

## Modals, Popovers, Sheets

- Desktop modals: `lg` or `xl`
- Mobile bottom sheets: top corners `xl` or `2xl`, bottom flush to device edge
- Nested menus inside modals use smaller radius than the modal

## Images And Media

- Thumbnails follow card radius or one step smaller
- Full-bleed heroes: `none`
- Avatars: `full` or a documented squircle token if the brand requires it

---

# Radius Hierarchy

Related components must feel like one family.

```
Control (button/input)     → smaller or equal
Container (card)           → medium
Overlay (modal/sheet)      → equal or larger
Marketing surface          → largest, rare
```

If a child radius exceeds its parent, the composition usually fails.

---

# Responsive Rules

Radius may increase slightly on mobile for grouping, but token names stay stable.

Allowed:

- mobile sheet top radius one step larger than desktop modal

Forbidden:

- changing button radius between breakpoints without a documented reason
- introducing a new pixel value only for one breakpoint

---

# Accessibility Rules

Radius must not become the only way to perceive a control boundary.

Support with:

- contrast
- borders or focus rings
- spacing

Avoid extreme pills on long labels that reduce readable button shape and hit-area clarity.

---

# Radius Anti-Patterns

Reject:

- random corner values outside the scale
- every component inventing its own radius
- pill-everything interfaces
- large radius on dense data tables
- mixing sharp and soft families in one workflow without intent
- using rounding to hide weak hierarchy or spacing
- nested corners where child radius exceeds parent

---

# Radius System Output

Example:

```
Product

SaaS analytics dashboard

Style Family

Balanced / slightly sharp

Token Map

Buttons          radius-sm
Inputs           radius-sm
Cards            radius-md
Modals           radius-lg
Sheets (mobile)  radius-xl (top)
Avatars          radius-full
Tables           radius-none

Nested Rule

Inner controls use radius-xs inside radius-md cards

Exceptions

None

Review

Pass
```

---

# Failure Conditions

The radius system fails when:

- Off-scale pixel values appear in production
- Buttons, inputs, and cards feel like different products
- Pills are used as a default rather than a deliberate exception
- Mobile and desktop invent conflicting shape languages
- Rounding is used to mask layout problems

---

# Review Questions

Before approval:

- Is every radius value on the approved scale?
- Does the style family match product personality?
- Are buttons, inputs, and cards recognizably related?
- Is each token used for the right component role?
- Do nested radii decrease correctly?
- Would removing a large radius improve clarity anywhere?

---

# Final Rule

Radius is a silent brand signal.

A small, consistent shape vocabulary makes interfaces feel intentional. An unlimited shape vocabulary makes them look unfinished.
