# Feedback System

**Version:** 1.0
**Status:** System Layer
**Depends On:** UX Intelligence, Component Intelligence, Accessibility Intelligence, Motion System

---

# Purpose

The Feedback System defines how products communicate responses, changes, progress, errors, and system states to users.

Feedback creates:

* confidence
* understanding
* recovery
* trust
* control

A product without feedback feels broken, even when functionality works.

---

# Core Principle

Every user action should produce an understandable response.

Users should always know:

```text id="n7p3xm"
Did my action work?

What is happening now?

What happens next?

Can I recover?
```

---

# Feedback Architecture

```text id="k8m4vz"
User Action

↓

System Response

↓

Feedback Message

↓

User Understanding

↓

Next Action
```

---

# Feedback Categories

## Immediate Feedback

Purpose:

Confirm small actions.

Examples:

* button press
* toggle change
* selection

Characteristics:

* fast
* subtle
* non-disruptive

---

## Status Feedback

Purpose:

Communicate ongoing processes.

Examples:

* uploading
* processing
* saving

Uses:

* progress indicators
* loading states
* status messages

---

## Success Feedback

Purpose:

Confirm completion.

Examples:

* saved changes
* completed order
* successful submission

Good success feedback:

* confirms result
* explains next step

---

## Error Feedback

Purpose:

Explain problems and recovery.

Good errors provide:

```text id="s4q8nv"
What happened

↓

Why it happened

↓

How to fix it
```

---

## Warning Feedback

Purpose:

Prevent mistakes.

Examples:

* unsaved changes
* destructive actions

---

# Feedback Components

The system includes:

```text id="h9v2qw"
Toast Notifications

Alerts

Banners

Inline Messages

Progress Indicators

Loading States

Confirmation Dialogs
```

---

# Toast System

Purpose:

Temporary communication.

Use for:

* success messages
* background updates
* confirmations

Rules:

* short messages
* clear meaning
* dismiss automatically when appropriate

Avoid:

* important information only in toasts

---

# Alert System

Purpose:

Persistent communication.

Use for:

* warnings
* system information
* critical updates

Requirements:

* clear hierarchy
* visible placement

---

# Inline Feedback

Purpose:

Provide contextual guidance.

Examples:

* form errors
* validation messages
* helper text

Place feedback near the relevant element.

---

# Loading Feedback

Loading should answer:

```text id="p6m4kr"
Is the system working?

How long might it take?

Can the user continue?
```

---

# Loading Patterns

## Skeleton Loading

Best for:

* content-heavy screens
* dashboards
* feeds

Purpose:

Show structure before data arrives.

---

## Progress Indicator

Best for:

* measurable processes

Examples:

* uploads
* exports
* installations

---

## Spinner

Best for:

* short unknown waits

Avoid:

* long spinner-only experiences

---

# Empty States

Empty states are feedback.

They should explain:

```text id="w5q8mx"
Why there is no content

What the user can do

How to create value
```

---

# Confirmation Feedback

Use confirmations for:

* destructive actions
* irreversible changes
* important decisions

Avoid:

* unnecessary confirmation for simple actions

---

# Feedback Timing

Correct timing matters.

Too early:

* confusing

Too late:

* frustrating

Ideal:

```text id="m8v3qa"
Action

↓

Immediate Response

↓

Clear Outcome
```

---

# Feedback Accessibility

Requirements:

* screen reader announcements
* sufficient contrast
* meaningful wording
* non-color communication

Never communicate only through:

* red/green colors
* animation
* position

---

# Feedback Tone

Messages should be:

* clear
* respectful
* human

Avoid:

* technical errors
* blame-focused language
* vague messages

---

# Feedback Examples

Good:

```text id="a3k7vx"
Payment completed successfully.
Your receipt has been emailed.
```

Bad:

```text id="q9m2pz"
Success.
```

---

# Feedback Anti-Patterns

Reject:

* no response after actions
* unclear errors
* excessive notifications
* blocking messages
* technical language
* feedback hidden from users

---

# Feedback Review Questions

Before approval:

```text id="c5n8qw"
Does every important action have feedback?

Are messages understandable?

Can users recover from errors?

Is feedback timely?

Does it reduce uncertainty?
```

---

# Final Rule

Feedback is the product talking back.

A great feedback system makes users feel informed, confident, and in control.
