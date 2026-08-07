# Bottom Sheet Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Core Mobile Interaction Component

---

# Purpose

The Bottom Sheet System defines how temporary content, actions, controls, and contextual information appear from the bottom of the screen.

Bottom sheets are optimized for:

* mobile interaction
* thumb accessibility
* quick actions
* contextual workflows

They provide additional functionality without requiring full navigation.

---

# Core Principle

Bottom sheets should feel like a natural extension of the current screen.

Every bottom sheet should answer:

```text id="v8m2qx"
Why should this appear from the bottom?

What task is the user completing?

Can the user easily return?
```

---

# Bottom Sheet Architecture

```text id="a7q4mn"
Trigger Action

↓

Sheet Animation

↓

Sheet Container

↓

Content Interaction

↓

Dismiss Or Complete
```

---

# Bottom Sheet Types

## Action Sheet

Purpose:

Present a small set of actions.

Examples:

* share options
* quick actions
* item actions

Characteristics:

* short
* focused
* immediate

---

## Modal Bottom Sheet

Purpose:

Temporarily interrupt with focused content.

Examples:

* forms
* confirmations
* selections

Characteristics:

* blocks background interaction

---

## Persistent Bottom Sheet

Purpose:

Remain visible while interacting with the main interface.

Examples:

* maps
* media controls
* filters

Characteristics:

* supports multitasking

---

## Expandable Bottom Sheet

Purpose:

Allow content to grow.

Examples:

* detail previews
* complex selections

States:

```text id="p9x4vk"
Collapsed

↓

Half Expanded

↓

Full Expanded
```

---

# Bottom Sheet Anatomy

A bottom sheet may contain:

```text id="m6q8zw"
Drag Handle

↓

Header

↓

Content

↓

Actions
```

---

# Drag Handle

Purpose:

Communicate:

"The sheet can move."

Rules:

* use only when draggable
* do not add decorative handles

---

# Sheet States

Every bottom sheet should define:

```text id="w5n2kp"
Closed

Opening

Collapsed

Expanded

Loading

Error

Closing
```

---

# Opening Animation

The sheet should:

* move naturally from the bottom
* preserve context
* feel responsive

Avoid:

* slow movement
* unnecessary bounce effects

---

# Dismissal Rules

Users should be able to dismiss through:

* swipe gesture
* close button
* outside tap (when appropriate)
* completed action

Avoid:

* trapping users unnecessarily

---

# Bottom Sheet Sizes

## Compact

Used for:

* quick actions
* menus

---

## Standard

Used for:

* selections
* filters
* short forms

---

## Expanded

Used for:

* detailed workflows
* larger content

---

# Action Hierarchy

Actions should remain clear.

Example:

```text id="c8m3vx"
Primary Action

↓

Secondary Actions

↓

Dismiss
```

---

# Mobile Interaction Rules

Bottom sheets are designed for touch.

Requirements:

* large touch targets
* comfortable spacing
* thumb-friendly controls

Avoid:

* desktop-sized controls
* dense layouts

---

# Forms In Bottom Sheets

Use when:

* the task is short
* context should remain visible

Avoid when:

* workflow requires many steps
* extensive typing is needed

Move complex workflows to pages.

---

# Bottom Sheet Accessibility

Requirements:

* keyboard support
* focus management
* screen reader announcements
* clear dismissal method

Touch gestures must have alternatives.

---

# Bottom Sheet Performance

Optimize:

* opening speed
* gesture response
* animation smoothness

Avoid:

* loading heavy content before interaction

---

# Bottom Sheet Anti-Patterns

Reject:

* using sheets for every interaction
* hidden dismissal
* overly tall sheets without reason
* complex workflows
* desktop dialogs copied to mobile
* unclear actions

---

# Bottom Sheet Review Questions

Before approval:

```text id="q7m4vx"
Is a bottom sheet the correct pattern?

Does it preserve context?

Are actions clear?

Can users dismiss easily?

Does it feel natural on mobile?

Is it accessible?
```

---

# Final Rule

Bottom sheets are mobile-first tools for maintaining context.

A great bottom sheet brings necessary actions closer to the user without disrupting their flow.
