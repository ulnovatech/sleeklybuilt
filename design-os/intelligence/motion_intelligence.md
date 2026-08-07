# Motion Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Design Constitution, Visual Language, UX Intelligence, Component Intelligence

---

# Purpose

Motion Intelligence defines how interfaces move, transition, respond, and communicate through animation.

Motion is not decoration.

Motion is a communication system.

It explains:

- what changed
- where something came from
- what action occurred
- what deserves attention
- how the interface behaves

---

# Core Philosophy

The best motion is felt, not noticed.

Users should think:

"That felt natural."

Not:

"That animation was impressive."

---

# Motion Principles

Every animation must satisfy at least one purpose:

## Orientation

Helping users understand spatial relationships.

Example:

A panel sliding from the side explains where it came from.

---

## Feedback

Confirming user actions.

Example:

A button responding after a tap.

---

## Continuity

Maintaining context during transitions.

Example:

A card expanding into a detail view.

---

## Hierarchy

Directing attention.

Example:

Highlighting an important status change.

---

# Motion Decision Pipeline

Every animation follows:

```
User Intent

↓

Interaction Type

↓

Purpose

↓

Motion Pattern

↓

Timing

↓

Easing

↓

Accessibility Check

↓

Performance Review
```

---

# Motion Categories

---

# Micro Interactions

Small moments.

Examples:

- button press
- toggle switch
- checkbox selection
- hover state

Purpose:

Feedback.

Duration:

100–200ms

---

# Component Transitions

Movement between related states.

Examples:

- dropdown opening
- modal appearing
- accordion expansion

Purpose:

Continuity.

Duration:

200–300ms

---

# Page Transitions

Movement between screens.

Examples:

- navigation
- onboarding steps
- workspace changes

Purpose:

Orientation.

Duration:

250–400ms

---

# Attention Motion

Used to highlight important information.

Examples:

- notification arrival
- success confirmation
- important update

Use rarely.

---

# Timing System

Design OS uses intentional timing.

---

## Instant

50–100ms

For:

- hover
- button feedback
- small state changes

---

## Fast

150–250ms

For:

- dropdowns
- toggles
- small transitions

---

## Standard

250–400ms

For:

- navigation
- panels
- dialogs

---

## Slow

400ms+

Use carefully.

Reserved for:

- onboarding
- storytelling
- special experiences

---

# Easing System

Prefer natural movement.

---

## Ease Out

Best for:

Elements entering.

Feels responsive.

---

## Ease In

Best for:

Elements leaving.

---

## Ease In Out

Best for:

Continuous transitions.

---

Avoid:

- linear movement everywhere
- exaggerated bouncing
- cartoon effects without purpose

---

# Spring Motion

Use spring-based motion when appropriate.

Good for:

- gestures
- draggable elements
- physical interactions

Avoid excessive spring effects.

---

# Gesture Motion

Mobile gestures should feel physical.

Examples:

Swipe

Pull

Drag

Expand

Motion should communicate direct manipulation.

---

# Loading Motion

Loading animation should communicate:

"The system is working."

Not:

"We added animation."

Preferred:

Skeleton states

Progress indicators

Subtle transitions

Avoid:

Endless spinning everywhere.

---

# Button Motion

Buttons should provide:

- press feedback
- hover feedback
- disabled clarity

Avoid:

Large movement.

---

# Cards

Card motion should support:

- expansion
- selection
- reordering

Avoid:

Cards flying around without purpose.

---

# Navigation Motion

Navigation transitions should preserve orientation.

Examples:

Tab switching:

fast fade/slide

Page transition:

subtle directional movement

Drawer:

physical entrance

---

# Scroll Motion

Use carefully.

Allowed:

- subtle reveal
- progressive disclosure

Avoid:

- excessive parallax
- distracting scroll effects
- slowing users down

---

# Hero Motion

Hero animations must support the message.

Good:

- product demonstration
- meaningful transformation
- visual storytelling

Bad:

- random floating objects
- decorative particles
- unnecessary movement

---

# Accessibility

Motion must respect:

prefers-reduced-motion.

When enabled:

Reduce:

- large transitions
- parallax
- zoom effects
- excessive movement

Maintain:

- state changes
- feedback
- usability

---

# Performance Rules

Motion must not damage:

- loading speed
- scrolling
- battery usage
- responsiveness

Avoid:

- expensive effects
- excessive blur
- heavy particles
- unnecessary video backgrounds

---

# Motion Consistency

Every product should define:

- transition speed
- easing style
- interaction style

Do not mix:

iOS-style motion

with

Material-style motion

with

random web animation

without strategy.

---

# Platform Adaptation

---

## iOS Style

Characteristics:

- smooth
- physical
- gesture-driven
- subtle

---

## Material 3 Style

Characteristics:

- expressive
- responsive
- state-driven

---

## Web SaaS Style

Characteristics:

- efficient
- restrained
- productivity focused

---

# Motion Anti-Patterns

Never create:

- animation everywhere
- slow interfaces
- bouncing UI
- distracting transitions
- unnecessary loaders
- decorative motion without meaning

---

# Motion Intelligence Output

Example:

```
Product

SaaS Dashboard

Motion Personality

Calm
Precise
Responsive

Transitions

250ms

Easing

Ease Out

Buttons

Micro feedback enabled

Navigation

Subtle fade + slide

Loading

Skeleton states

Reduced Motion

Supported

Performance

Optimized
```

---

# Motion Review Questions

Before approval:

- Does motion explain something?
- Does it improve understanding?
- Does it feel natural?
- Is it fast enough?
- Does it respect accessibility?
- Would removing it hurt usability?

If not,

remove it.

---

# Final Rule

Motion is not how an interface moves.

Motion is how an interface communicates change.

The best motion makes software feel alive without making users think about animation.