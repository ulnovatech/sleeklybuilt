# Iconography System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Component Intelligence, Typography System, Accessibility Intelligence, Design Tokens

---

# Purpose

The Iconography System defines how icons are selected, designed, sized, aligned, colored, and used across the product.

Icons are supporting language.

They communicate:

- actions
- navigation
- status
- objects
- relationships

They should improve understanding, not replace it.

A poor icon system makes products feel inconsistent and unfinished.

---

# Core Philosophy

A professional interface does not use icons because they look attractive.

Every icon should answer one question faster than text alone.

If an icon requires explanation, it has failed.

If an icon is ambiguous, combine it with text.

---

# Icon Decision Pipeline

Every icon decision follows:

```
User Intent

↓

Meaning

↓

Icon Selection

↓

Visual Consistency

↓

Context Check

↓

Accessibility Review

↓

Approval
```

---

# Icon Principles

Icons should be:

- simple
- recognizable
- consistent
- meaningful
- visually balanced

Avoid decorative icons.

---

# Primary Roles

Icons exist for five purposes.

---

# Navigation

Examples:

- Home
- Search
- Profile
- Settings

---

# Actions

Examples:

- Edit
- Delete
- Save
- Share
- Download

---

# Status

Examples:

- Success
- Error
- Warning
- Information

---

# Objects

Examples:

- Folder
- Cart
- Camera
- Calendar

---

# Communication

Examples:

- Message
- Notification
- Phone
- Email

---

# Icon Style Rules

Every product must choose one primary icon style.

Do not mix:

- outlined
- filled
- rounded
- sharp
- hand drawn

Choose one family. Maintain one stroke weight and one corner language.

---

## Outline Icons

Characteristics:

- lightweight
- modern
- clean

Good for:

- SaaS
- productivity
- dashboards

Preferred default for most interfaces.

---

## Filled Icons

Characteristics:

- stronger visual weight
- easier recognition

Good for:

- mobile navigation
- consumer apps
- selected state
- emphasis
- active navigation

Use filled as a state change within an outlined system, not as a second library.

---

## Rounded Icons

Characteristics:

- friendly
- approachable

Good for:

- lifestyle products
- consumer experiences

---

## Sharp Icons

Characteristics:

- precise
- technical

Good for:

- enterprise
- professional tools

---

# Consistency Rules

Never mix:

- random icon families
- different stroke widths
- different corner styles
- inconsistent visual weights
- multiple competing libraries

---

# Icon Weight

Maintain one visual weight across the product.

Example:

Thin interface

↓

Thin icons

Bold interface

↓

Bold icons

---

# Icon Sources

Preferred:

- established icon libraries
- custom systems built intentionally

Examples:

- Lucide
- Material Symbols
- Heroicons
- Phosphor
- Tabler Icons
- SF Symbols (Apple platforms)

Do not use random icon downloads.

Do not combine icon libraries.

---

# Icon Sizing System

Approved token scale:

```
icon-xs

16px


icon-sm

20px


icon-md

24px


icon-lg

32px


icon-xl

48px
```

Rare metadata use:

```
12px
```

Only when density is intentional and contrast remains readable.

---

# Usage Guidelines

## 12px

Metadata.

Rare.

---

## 16px (icon-xs)

Compact interfaces.

Examples:

- table actions
- small controls

---

## 20px (icon-sm)

Button icons and dense toolbars.

---

## 24px (icon-md)

Default interface icons.

Primary navigation.

---

## 32px (icon-lg)

Feature icons.

---

## 48px+ (icon-xl)

Illustrative icons and empty-state accents.

---

# Default Size

Most interface icons:

24px

---

# Icon Placement

Icons should have clear relationships to labels and controls.

Button:

```
Icon

8px

Label
```

Navigation:

```
Icon

Label
```

---

# Alignment Rules

Icons align with text.

Never visually float.

Center optically.

Not mathematically.

Consider:

- optical size
- baseline alignment
- spacing relative to typography

---

# Icon Buttons

Icon-only buttons require:

- tooltip when needed
- accessible label
- clear meaning

Icons are not touch targets.

Buttons are.

Example:

24px icon

inside

48px touch area.

---

# Never Use Icon-Only For

Critical actions.

Examples:

- Delete
- Submit
- Payment
- Account changes

unless universally understood.

Important actions require text.

Good:

Delete with trash icon

Bad:

Trash icon alone

---

# Label Rules

Important actions require text.

Decorative icons must not carry meaning alone.

Interactive icons always need an accessible name.

---

# Color Rules

Icons inherit semantic colors.

Avoid:

random colored icons.

Examples:

Success

↓

Success color

Error

↓

Error color

Disabled

↓

Disabled color

Neutral actions inherit the surrounding text or control color.

---

# Navigation Icons

Navigation icons should:

- represent destinations clearly
- remain consistent
- support labels

Avoid:

decorative icons that do not communicate.

---

# Status Icons

Status icons require:

- text support when important
- consistent meanings

Example:

Success:

check icon + confirmation text

Never communicate status through color alone.

---

# Product-Specific Icon Language

Different products require different icon personalities.

---

# Consumer Apps

Prefer:

- friendly
- recognizable
- simple

---

# Enterprise Apps

Prefer:

- precise
- efficient
- information-focused

---

# Luxury Brands

Prefer:

- minimal
- refined
- restrained

---

# Developer Tools

Prefer:

- technical
- compact
- clear

---

# Icon Accessibility

Icons must consider:

## Meaning

Does the icon communicate clearly?

## Contrast

Is it visible against its background?

## Labels

Can assistive technology understand it?

## Decorative Icons

Should be hidden from assistive technologies.

## Interactive Icons

Require:

- accessible labels
- readable contrast
- keyboard support

---

# Animated Icons

Use carefully.

Allowed:

- loading states
- status changes
- confirming action
- communicating progress
- meaningful transitions

Avoid:

- decorative movement
- distracting loops
- decorative spinning

---

# Icon and Typography Relationship

Icons must visually balance with text.

Consider:

- optical size
- baseline alignment
- spacing

Never mathematically align only.

---

# Icon and Touch Relationship

Mobile icon buttons require:

minimum touch area:

44px

Preferred:

48px+

The icon itself can remain smaller.

Mobile icons should:

- remain recognizable
- maintain spacing
- support thumb interaction

Avoid tiny icon buttons.

---

# Icon Tokens

Example:

```
icon-xs

icon-sm

icon-md

icon-lg

icon-xl


icon-primary

icon-secondary

icon-disabled

icon-success

icon-error

icon-warning
```

---

# Icon Anti-Patterns

Never create:

- random emoji replacing interface icons
- inconsistent icon styles
- five icon styles in one product
- tiny invisible icons
- unexplained icon-only controls
- unlabeled destructive icons
- stretched icons
- excessive decorative icons
- multiple competing icon libraries
- color-only status meaning

---

# Iconography System Output

Example:

```
Product

Mobile Commerce App

Icon Style

Rounded Outline

Library

Lucide

Default Size

24px

Button Icons

20px

Navigation Icons

24px

Selected State

Filled

Touch Target

48px

Accessibility

Labels included

Semantic Colors

Success / Error / Disabled

Review

Pass
```

---

# Quality Model

Evaluate:

```
Recognition

30%


Consistency

25%


Accessibility

20%


Alignment

15%


Visual Quality

10%
```

---

# QA Checklist

Before approval:

- [ ] One icon library used
- [ ] Icon style is consistent
- [ ] Icons communicate meaning
- [ ] Sizes follow the token scale
- [ ] Interactive icons have labels
- [ ] Touch targets meet minimum size
- [ ] Colors follow semantic tokens
- [ ] Decorative icons are minimized
- [ ] Critical actions are not icon-only
- [ ] No decorative icon overload exists

---

# Final Rule

Icons are not decoration.

They are a language that should reduce thinking.

If users stop to interpret an icon, the interface has already become slower.

A strong icon system makes interfaces feel familiar before users understand why.
