# Typography System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Font Intelligence, Typography Intelligence, Design Tokens

---

# Purpose

The Typography System converts typography decisions into a reusable implementation standard.

It defines:

- font families
- font roles
- type scales
- weights
- line heights
- letter spacing
- responsive behavior
- usage rules

This system ensures every interface maintains consistent, intentional typography.

---

# Core Philosophy

Typography is not styling applied after layout.

Typography is part of the structure.

A product's hierarchy, readability, and personality depend on a disciplined type system.

---

# Typography Architecture

Every product must define:

```
Font Family

↓

Font Roles

↓

Type Scale

↓

Weights

↓

Line Heights

↓

Responsive Rules

↓

Component Usage
```

---

# Font Family Rules

Every product should use:

## Primary Typeface

Used for:

- interface text
- navigation
- headings
- buttons
- forms

---

## Secondary Typeface

Optional.

Used only when it creates meaningful contrast.

Examples:

- editorial products
- luxury brands
- marketing experiences

---

## Fallback Typeface

Always required.

Example:

```
Primary

Inter

Fallback

system-ui, sans-serif
```

---

# Font Role System

Every interface uses defined roles.

---

# Display

Purpose:

Large expressive statements.

Used for:

- hero sections
- major marketing moments

Characteristics:

- highest visual impact
- limited usage

Example:

```
Display

64px

Weight

700

Line Height

1.1
```

---

# Heading 1

Purpose:

Primary page title.

Used once per page when possible.

Example:

```
H1

48px desktop

36px mobile

Weight

700

Line Height

1.15
```

---

# Heading 2

Purpose:

Major sections.

Example:

```
H2

36px desktop

28px mobile

Weight

600

Line Height

1.2
```

---

# Heading 3

Purpose:

Subsections.

Example:

```
H3

24px

Weight

600

Line Height

1.3
```

---

# Body Large

Purpose:

Important introductory text.

Example:

```
18px

Weight

400

Line Height

1.6
```

---

# Body

Purpose:

Default interface reading.

Example:

```
16px

Weight

400

Line Height

1.6
```

---

# Body Small

Purpose:

Supporting information.

Example:

```
14px

Weight

400

Line Height

1.5
```

---

# Caption

Purpose:

Metadata and secondary labels.

Example:

```
12px

Weight

500

Line Height

1.4
```

---

# Label

Purpose:

Controls and interface elements.

Example:

```
14px

Weight

500

Line Height

1.2
```

---

# Type Scale

Use a controlled scale.

Recommended:

```
12
14
16
18
20
24
30
36
48
60
72
```

Do not create arbitrary sizes.

---

# Weight System

Approved weights:

```
400

Regular

↓

500

Medium

↓

600

Semibold

↓

700

Bold
```

Avoid excessive weight variation.

---

# Line Height System

Approved values:

```
Display

1.1

Headings

1.15 - 1.3

Body

1.5 - 1.7

Compact UI

1.3 - 1.5
```

---

# Letter Spacing

Default:

Natural font spacing.

Only adjust intentionally.

Examples:

Uppercase labels:

slightly increased spacing

Large display text:

optical adjustment

---

# Responsive Typography

Typography should scale intelligently.

Never simply shrink everything.

---

# Mobile

Priority:

Readability.

Recommended:

Body:

16px minimum

Headings:

Reduced moderately

Line height:

maintained

---

# Desktop

Use additional space for:

- larger hierarchy
- stronger emphasis
- improved scanning

---

# Component Typography Rules

---

# Buttons

Use:

Label typography

Example:

14–16px

500–600 weight

---

# Navigation

Use:

Body Small / Label

Avoid oversized navigation text.

---

# Cards

Hierarchy:

Title

↓

Supporting text

↓

Metadata

---

# Forms

Labels:

14px medium

Inputs:

16px regular

Errors:

14px

---

# Tables

Headers:

14px medium

Data:

14–16px regular

Numbers:

tabular figures where needed

---

# Marketing Pages

Can use:

larger display typography

more expressive hierarchy

stronger contrast

But readability remains the priority.

---

# Dashboard Typography

Optimize:

- scanning
- comparison
- density

Avoid:

oversized headings

decorative typography

---

# Dark Mode Rules

Avoid:

- thin fonts
- low contrast gray text
- tiny metadata

Typography must remain clear.

---

# Accessibility Requirements

Typography must support:

- browser zoom
- system scaling
- screen readers
- high contrast modes

Never lock typography.

---

# Implementation Tokens

Example:

```
font-family-primary

Inter


font-size-body

16px


font-size-heading

36px


font-weight-semibold

600


line-height-body

1.6
```

---

# Typography QA Checklist

Before approval:

- [ ] Font matches product personality
- [ ] Hierarchy is obvious
- [ ] Body text is readable
- [ ] Sizes follow scale
- [ ] Weights are consistent
- [ ] Mobile typography works
- [ ] Dark mode remains readable
- [ ] Accessibility supported

---

# Failure Conditions

Typography system fails when:

- Every component has custom sizes.
- Fonts are changed randomly.
- Hierarchy depends only on color.
- Text is too small.
- Weight usage becomes chaotic.
- Mobile readability is sacrificed.

---

# Final Rule

A strong typography system makes every screen feel designed by the same expert team.

The user should never encounter random text decisions.

Every word should have a place, a purpose, and a visual role.