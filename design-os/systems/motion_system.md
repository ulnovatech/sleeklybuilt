# Motion System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Motion Intelligence, Component Intelligence, Design Tokens

---

# Purpose

The Motion System converts motion decisions into reusable rules for implementation.

It defines:

- animation timing
- easing
- transitions
- interaction feedback
- component movement
- loading behavior
- accessibility handling

Motion should make the interface feel responsive, clear, and intentional.

---

# Core Philosophy

Motion exists to communicate change.

Never animate simply because something can move.

Every animation must answer:

"Why does this movement help the user?"

---

# Motion Architecture

Every motion decision follows:

```
Trigger

↓

State Change

↓

Motion Purpose

↓

Animation Pattern

↓

Duration

↓

Easing

↓

Accessibility Check
```

---

# Motion Principles

## Responsive

The interface should feel alive immediately.

---

## Natural

Movement should follow human expectations.

---

## Consistent

The same actions should feel the same everywhere.

---

## Purposeful

Every animation has a reason.

---

# Duration Scale

Use controlled timing values.

---

# Instant

```
50ms - 100ms
```

Used for:

- button feedback
- icon changes
- small states

---

# Fast

```
150ms - 200ms
```

Used for:

- hover
- toggles
- small transitions

---

# Standard

```
250ms - 350ms
```

Used for:

- menus
- dialogs
- navigation
- component changes

---

# Slow

```
400ms - 600ms
```

Used only for:

- storytelling
- onboarding
- major transitions

---

# Easing System

---

# Ease Out

Default for entering elements.

Feels:

fast response

smooth settling

---

# Ease In

Default for leaving elements.

Feels:

natural exit

---

# Ease In Out

For:

continuous movement

complex transitions

---

# Spring

Used for:

- draggable objects
- gestures
- physical interactions

Avoid excessive bouncing.

---

# Component Motion Rules

---

# Buttons

Should provide:

- press response
- hover feedback
- disabled state

Example:

```
Scale

0.98

Duration

100ms
```

Avoid:

large movement.

---

# Cards

Allowed:

- subtle hover lift
- expansion
- selection feedback

Avoid:

cards flying into position unnecessarily.

---

# Dropdowns

Pattern:

```
Opacity

+

Small vertical movement
```

Purpose:

Show relationship to trigger.

---

# Dialogs

Pattern:

```
Fade

+

Scale or slide
```

Purpose:

Create focus transition.

---

# Bottom Sheets

Pattern:

```
Slide upward

+

Backdrop fade
```

Purpose:

Communicate temporary layer.

---

# Navigation Motion

Navigation should preserve context.

Examples:

Tab change:

quick fade

Page transition:

directional movement

Drawer:

slide from edge

---

# Loading Motion

Loading should reduce uncertainty.

Preferred:

## Skeleton Loading

For:

known layouts.

---

## Progress Indicators

For:

measurable completion.

---

## Optimistic Updates

For:

instant-feeling actions.

---

Avoid:

infinite spinning indicators everywhere.

---

# Scroll Motion

Allowed:

- subtle reveal
- content progression

Avoid:

- heavy parallax
- forced animations
- slow scrolling effects

---

# Hero Motion

Marketing experiences may use stronger motion.

Allowed:

- product demonstrations
- transformations
- storytelling

Avoid:

- random floating objects
- decorative animations
- distracting backgrounds

---

# Gesture Motion

Mobile gestures should feel direct.

Examples:

Swipe:

follows finger

Drag:

tracks movement

Pull:

responds physically

---

# Reduced Motion

Every animation system must support:

```
prefers-reduced-motion
```

When enabled:

Remove:

- large movement
- parallax
- complex transitions

Keep:

- important feedback
- state communication

---

# Performance Rules

Motion must not harm:

- FPS
- battery
- loading speed
- accessibility

Avoid:

- unnecessary blur animation
- heavy particle effects
- excessive shadows
- expensive transforms

---

# Motion Tokens

Example:

```
--motion-fast

150ms


--motion-standard

300ms


--motion-slow

500ms


--ease-standard

ease-out
```

---

# Motion Hierarchy

Not all elements deserve animation.

Priority:

1. User actions
2. State changes
3. Navigation
4. Important feedback
5. Decorative moments

---

# Animation Review

Every animation must pass:

## Purpose Test

Does it communicate something?

---

## Speed Test

Does it delay users?

---

## Consistency Test

Does it match the rest of the product?

---

## Accessibility Test

Does it respect user preferences?

---

# Motion Anti-Patterns

Never create:

- animations everywhere
- slow interfaces
- excessive bouncing
- unnecessary page transitions
- distracting loops
- decorative movement without meaning

---

# Motion System Output

Example:

```
Product

Mobile SaaS App

Motion Style

Calm + Responsive

Fast

150ms

Standard

300ms

Slow

500ms

Buttons

Press feedback

Navigation

Slide transition

Loading

Skeleton states

Accessibility

Reduced motion enabled

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Motion improves understanding
- [ ] Timing feels natural
- [ ] Animations are consistent
- [ ] Performance is maintained
- [ ] Reduced motion works
- [ ] No decorative overload exists

---

# Final Rule

Motion is the language of change.

A great interface does not move to impress users.

It moves to help them understand.