# Button Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Core Interactive Component

---

# Purpose

The Button System defines how users trigger actions, submit tasks, navigate, and interact with products.

Buttons are not decorative elements.

They represent decisions and actions.

A strong button system creates:

* clear hierarchy
* predictable behavior
* accessible interaction
* consistent product language

---

# Core Principle

Every button should communicate:

```text
What will happen?

How important is this action?

Can the user confidently click it?
```

---

# Button Architecture

```text
Action Intent

↓

Button Variant

↓

Visual Style

↓

Interaction State

↓

Accessibility Behavior
```

---

# Button Types

## Primary Button

Purpose:

The most important action.

Examples:

* Save Changes
* Checkout
* Create Account
* Start Project

Rules:

* strongest visual emphasis
* one primary action per area when possible

---

## Secondary Button

Purpose:

Important but less dominant actions.

Examples:

* Cancel
* View Details
* Learn More

Rules:

* visually distinct from primary
* should not compete

---

## Tertiary Button

Purpose:

Low-emphasis actions.

Examples:

* secondary navigation
* optional actions

Rules:

* minimal visual weight

---

## Destructive Button

Purpose:

Actions that remove or damage data.

Examples:

* Delete Account
* Remove Item

Requirements:

* clear warning
* confirmation when necessary

---

## Icon Button

Purpose:

Compact actions.

Examples:

* search
* close
* edit
* settings

Requirements:

* accessible label
* tooltip when meaning is unclear

---

# Button Anatomy

A button consists of:

```text
Icon (Optional)

↓

Label

↓

Loading Indicator (Optional)
```

---

# Button Sizes

The system should define predictable sizes.

Example:

```text
Small

Compact actions


Medium

Default usage


Large

High emphasis actions
```

---

# Button States

Every button requires:

```text
Default

Hover

Focus

Pressed

Loading

Disabled
```

---

# Default State

Purpose:

Normal available interaction.

Requirements:

* clear contrast
* readable label
* obvious action

---

# Hover State

Purpose:

Provide feedback.

Should communicate:

"The element is interactive."

Avoid:

* excessive movement
* distracting effects

---

# Focus State

Purpose:

Support keyboard users.

Requirements:

* visible focus indicator
* sufficient contrast

Never remove focus styles.

---

# Pressed State

Purpose:

Confirm activation.

Can use:

* subtle scale
* color change
* shadow change

---

# Loading State

Purpose:

Communicate processing.

Rules:

* prevent duplicate actions
* preserve button meaning
* show progress

Example:

```text
Saving...
```

---

# Disabled State

Purpose:

Communicate unavailable action.

Rules:

* explain why possible
* maintain readability

Avoid:

* extremely faded disabled buttons

---

# Button Hierarchy Rules

Within one interface area:

Preferred:

```text
1 Primary Action

2 Secondary Actions

3 Supporting Actions
```

Avoid:

* multiple competing primary buttons

---

# Button Text Rules

Good button labels:

* describe action
* use verbs
* create confidence

Good:

```text
Create Project

Download Report

Complete Purchase
```

Weak:

```text
Continue

Submit

Click Here
```

when context is unclear.

---

# Icon Usage Rules

Icons may:

* improve recognition
* reduce scanning effort

Icons should not:

* replace unclear labels
* introduce confusion

---

# Button Placement

Buttons should appear where decisions happen.

Examples:

Forms:

```text
Input Completion

↓

Submit Action
```

Cards:

```text
Information

↓

Relevant Action
```

Dialogs:

```text
Decision

↓

Confirmation Action
```

---

# Mobile Button Rules

Mobile buttons require:

* larger touch targets
* clear spacing
* thumb-friendly placement

Recommended:

* full-width primary actions when appropriate
* avoid tiny icon-only actions

---

# Accessibility Requirements

Buttons must support:

* keyboard interaction
* screen readers
* visible focus
* sufficient contrast

Requirements:

* use actual button elements
* provide accessible names
* do not rely only on icons

---

# Button Anti-Patterns

Reject:

* unclear labels
* too many primary actions
* inconsistent sizing
* fake buttons made from text
* hidden interaction states
* disabled buttons without explanation

---

# Button Review Questions

Before approval:

```text
Is the action obvious?

Is hierarchy clear?

Are states complete?

Is the button accessible?

Does it match the product language?

Does it work on mobile?
```

---

# Final Rule

Buttons are promises.

A user clicks because they expect a specific outcome.

A great button system makes those outcomes clear, predictable, and trustworthy.
