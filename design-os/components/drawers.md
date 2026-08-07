# Drawer Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Core Secondary Navigation And Context Component

---

# Purpose

The Drawer System defines how secondary content, navigation, tools, and contextual actions appear alongside the primary interface.

Drawers provide:

* additional workspace
* contextual information
* secondary workflows
* temporary access to controls

A drawer should extend the current experience, not replace the main interface.

---

# Core Principle

A drawer creates space without forcing navigation away.

Every drawer should answer:

```text id="z8m4qx"
Why does this content belong beside the current task?

Why is a drawer better than a page?

Can users easily return?
```

---

# Drawer Architecture

```text id="a6p9mw"
Trigger

↓

Overlay Layer

↓

Drawer Container

↓

Content Structure

↓

User Action

↓

Close Or Continue
```

---

# Drawer Types

## Navigation Drawer

Purpose:

Provide access to product sections.

Examples:

* mobile menus
* application navigation

Characteristics:

* persistent structure
* clear hierarchy

---

## Filter Drawer

Purpose:

Expose filtering controls.

Examples:

* ecommerce filters
* search refinement

Characteristics:

* temporary controls
* easy apply/reset

---

## Detail Drawer

Purpose:

Show additional information without leaving context.

Examples:

* user details
* order information
* item previews

---

## Action Drawer

Purpose:

Provide contextual tools.

Examples:

* editing controls
* settings
* configuration

---

# Drawer Anatomy

A drawer may contain:

```text id="b5v8kn"
Header

↓

Content Area

↓

Actions
```

---

# Drawer Header

Should include:

* clear title
* close action
* optional supporting information

Good:

```text id="k7m2qx"
Order Details
```

Weak:

```text id="p3w9nv"
Information
```

---

# Drawer Placement

Common placements:

```text id="n8q4mz"
Left Drawer

Navigation


Right Drawer

Details / Tools


Bottom Drawer

Mobile Actions
```

---

# Drawer States

Every drawer requires:

```text id="c4v8kp"
Closed

Opening

Open

Loading

Error

Closing
```

---

# Opening Behavior

Drawer animation should:

* show direction
* preserve context
* feel immediate

Avoid:

* slow cinematic movement

---

# Overlay System

Drawers often use overlays.

Overlay should:

* separate focus
* prevent accidental background interaction

Avoid:

* overly dark overlays
* hiding important context unnecessarily

---

# Drawer Width System

Define consistent sizes.

Example:

```text id="m9x2qa"
Compact

Small tools


Standard

Most drawers


Wide

Complex content
```

---

# Navigation Drawer Rules

Navigation drawers should:

* expose structure clearly
* highlight current location
* support keyboard access

Avoid:

* deep confusing menus

---

# Filter Drawer Rules

Filter drawers should provide:

* clear categories
* selected state
* apply/reset actions

Avoid:

* hidden filtering behavior

---

# Detail Drawer Rules

Detail drawers should:

* preserve original context
* avoid duplicating full pages
* focus on supporting information

---

# Mobile Drawer Rules

Mobile drawers often become:

* full-screen panels
* bottom sheets

Requirements:

* large touch targets
* easy dismissal
* clear navigation

---

# Accessibility Requirements

Drawers must support:

* keyboard navigation
* focus management
* screen readers
* escape dismissal when appropriate

Users must understand:

* when focus moves
* how to close

---

# Drawer Performance

Optimize:

* opening speed
* content loading
* transition smoothness

Avoid:

* loading heavy content before needed

---

# Drawer Anti-Patterns

Reject:

* replacing every page with drawers
* drawers inside drawers
* unclear close actions
* overly wide drawers
* hidden navigation
* complex workflows in small drawers

---

# Drawer Review Questions

Before approval:

```text id="r6p2mw"
Does this need a drawer?

Is the relationship to the current task clear?

Can users return easily?

Are interactions accessible?

Does it work on mobile?
```

---

# Final Rule

Drawers are extensions of context.

A great drawer gives users more capability while keeping them connected to their current task.
