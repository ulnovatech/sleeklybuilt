# Dialog Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Core Focused Interaction Component

---

# Purpose

The Dialog System defines how temporary, focused interactions appear when the user must make a decision, provide information, or complete a critical task.

Dialogs create:

* focus
* confirmation
* controlled interruption
* task completion

A dialog should help users complete a specific action, not interrupt unnecessarily.

---

# Core Principle

Dialogs are interruptions with responsibility.

Every dialog should answer:

```text
What requires attention?

Why can this not happen inline?

What decision must the user make?
```

---

# Dialog Architecture

```text
Trigger Action

↓

Backdrop Layer

↓

Dialog Container

↓

Content Structure

↓

User Action

↓

Result Feedback
```

---

# Dialog Anatomy

A dialog may contain:

```text
Header

↓

Description

↓

Main Content

↓

Actions
```

---

# Dialog Types

## Confirmation Dialog

Purpose:

Confirm important actions.

Examples:

* deleting data
* leaving unsaved work
* cancelling a process

Requirements:

* explain consequence
* provide clear actions

---

## Form Dialog

Purpose:

Collect small amounts of information.

Examples:

* create item
* rename file
* add member

Use when:

* task is short

Avoid:

* placing complex workflows inside dialogs

---

## Alert Dialog

Purpose:

Communicate important information.

Examples:

* system warnings
* critical notifications

Requirements:

* clear message
* clear next action

---

## Full-Screen Dialog

Purpose:

Handle complex mobile experiences.

Examples:

* advanced forms
* editors
* multi-step flows

---

# Dialog Structure

## Title

Should:

* describe purpose
* explain action

Good:

```text
Delete Project?
```

Weak:

```text
Warning
```

---

## Description

Should explain:

* consequence
* context
* required action

---

## Actions

Actions should be clear.

Example:

```text
Primary:

Delete Project


Secondary:

Cancel
```

---

# Dialog Hierarchy

Actions should follow importance:

```text
Primary Action

↓

Secondary Action

↓

Dismiss
```

Avoid:

* equal visual weight for conflicting actions

---

# Dialog States

Every dialog should support:

```text
Opening

Active

Submitting

Success

Error

Closing
```

---

# Opening Behavior

Requirements:

* clear transition
* maintain context
* preserve user orientation

Avoid:

* unexpected appearance

---

# Active State

While open:

* focus remains inside dialog
* background interaction is blocked when required

---

# Loading State

For actions requiring processing:

Show:

* progress indicator
* disabled duplicate actions
* status feedback

Example:

```text
Saving...
```

---

# Closing Rules

Dialogs may close through:

* completed action
* explicit cancel
* close control

Avoid:

* accidental dismissal during important tasks

---

# Dialog Size System

Define consistent sizes.

Example:

```text
Small

Simple confirmations


Medium

Forms and details


Large

Complex content
```

---

# Mobile Dialog Rules

Mobile requires:

* readable content
* large actions
* easy dismissal

Consider:

* bottom sheets for frequent mobile interactions

Avoid:

* tiny desktop-style dialogs

---

# Accessibility Requirements

Dialogs must support:

* focus trapping
* keyboard navigation
* screen reader announcements
* clear labeling

Requirements:

* dialog title
* description association
* escape behavior where appropriate

---

# Dialog vs Page Decision

Use a dialog when:

* task is short
* context matters
* interruption is justified

Use a page when:

* workflow is complex
* multiple steps exist
* users need navigation

---

# Dialog Anti-Patterns

Reject:

* using dialogs for everything
* long forms inside small dialogs
* unclear actions
* accidental destructive actions
* dialogs without titles
* blocking unnecessary tasks

---

# Dialog Review Questions

Before approval:

```text
Is a dialog necessary?

Is the purpose clear?

Are actions understandable?

Can users recover?

Does it work on mobile?

Is accessibility supported?
```

---

# Final Rule

Dialogs should earn the user's attention.

A great dialog appears only when necessary and makes the required decision simple and clear.
