# Spacing System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Layout Intelligence, Typography System, Design Tokens

---

# Purpose

The Spacing System defines the rules for distance, rhythm, grouping, and visual breathing room throughout the product.

Spacing is not empty space.

Spacing communicates:

- hierarchy
- relationships
- importance
- structure
- quality

Poor spacing makes interfaces feel amateur even when individual components are good.

---

# Core Philosophy

Do not place elements.

Compose relationships.

The distance between elements tells users whether things belong together.

---

# Spacing Decision Model

Every spacing decision follows:

```
Relationship

↓

Hierarchy

↓

Density

↓

Platform Context

↓

Spacing Token

↓

Review
```

---

# Base Unit

Design OS uses an 8-point spacing system.

Primary unit:

```
8px
```

Most spacing decisions should be multiples of 8.

---

# Why 8px

The system creates:

- consistency
- predictable rhythm
- faster development
- easier responsive scaling

---

# Spacing Tokens

Approved scale:

```
0px

4px

8px

12px

16px

24px

32px

40px

48px

64px

80px

96px

128px
```

---

# Token Usage

## 0px

Purpose:

No separation.

Use carefully.

---

## 4px

Purpose:

Micro spacing.

Examples:

- icon to label
- compact metadata
- inline elements

---

## 8px

Purpose:

Small relationship.

Examples:

- button icon spacing
- list item details

---

## 12px

Purpose:

Compact grouping.

Examples:

- form labels
- small cards

---

## 16px

Purpose:

Default component spacing.

Examples:

- inputs
- buttons
- rows

---

## 24px

Purpose:

Content grouping.

Examples:

- card sections
- related blocks

---

## 32px

Purpose:

Major internal separation.

Examples:

- section content
- dashboard modules

---

## 40–48px

Purpose:

Large component separation.

Examples:

- page sections
- hero content

---

## 64px+

Purpose:

Major page rhythm.

Examples:

- landing page sections
- major transitions

---

# Relationship Rule

Related elements:

Closer spacing.

Example:

```
Title

8px

Description
```

---

Unrelated elements:

Greater spacing.

Example:

```
Section A


64px


Section B
```

---

# Component Spacing

---

# Buttons

Internal padding:

Recommended:

Vertical:

12–16px

Horizontal:

20–24px

---

# Inputs

Recommended:

Height:

48–56px

Internal padding:

16px

---

# Cards

Avoid excessive padding.

Recommended:

Small:

16px

Medium:

24px

Large:

32px

---

# Lists

Rows should breathe.

Recommended:

48–72px row height depending on complexity.

---

# Forms

Group:

Related fields:

16–24px

Separate sections:

32–48px

---

# Navigation

Mobile bottom navigation:

Adequate touch spacing.

Desktop sidebar:

Clear grouping.

Avoid crowded menus.

---

# Page Layout Spacing

Every page should define:

---

# Outer Padding

Mobile:

16–24px

Tablet:

24–32px

Desktop:

32–64px

---

# Section Spacing

Small:

32px

Medium:

48px

Large:

64–96px

---

# Grid Gap

Use consistent gaps.

Common:

16px

24px

32px

---

# Density Modes

Products may require different spacing density.

---

# Comfortable Mode

Used for:

- consumer apps
- marketing
- onboarding

Characteristics:

More whitespace

Larger spacing

---

# Balanced Mode

Default.

Used for:

- SaaS
- ecommerce
- general apps

---

# Compact Mode

Used for:

- dashboards
- analytics
- enterprise tools

Characteristics:

Efficient spacing

Higher information density

---

# Mobile Spacing Rules

Mobile requires:

- comfortable touch areas
- clear grouping
- reduced clutter

Avoid:

- cramped interfaces
- tiny gaps
- desktop spacing copied directly

---

# Desktop Spacing Rules

Desktop allows:

- larger section separation
- wider layouts
- supporting information

But whitespace must remain purposeful.

---

# Negative Space

Empty space should create:

- focus
- hierarchy
- calm

Never fill empty space simply because it exists.

---

# Spacing and Cards

Anti-pattern:

```
Card
16px gap
Card
16px gap
Card
16px gap
Card
```

Creates:

- repetitive rhythm
- template feeling
- visual fatigue

Prefer:

- grouped sections
- varied hierarchy
- meaningful separation

---

# Spacing and Typography

Typography and spacing work together.

Large heading:

Requires breathing room.

Small metadata:

Requires tighter grouping.

Never design spacing independently from text.

---

# Responsive Spacing

Spacing should adapt.

Example:

Desktop:

64px section gap

Mobile:

40px section gap

Do not preserve desktop spacing blindly.

---

# Spacing Anti-Patterns

Never create:

- random margins
- inconsistent padding
- excessive whitespace
- cramped layouts
- every section with identical gaps
- card-heavy layouts

---

# Spacing System Output

Example:

```
Base Unit

8px


Density

Balanced


Page Padding

Mobile

16px

Desktop

48px


Component Padding

24px


Section Gap

64px


Grid Gap

24px
```

---

# QA Checklist

Before approval:

- [ ] Uses spacing tokens
- [ ] Related content is grouped
- [ ] Hierarchy is visible
- [ ] Mobile spacing feels natural
- [ ] No random margins
- [ ] Density matches product type
- [ ] Layout feels calm

---

# Final Rule

Spacing is invisible architecture.

When spacing is correct, users do not notice empty areas.

They only feel that everything belongs exactly where it should.