# Animation System

**Version:** 1.0
**Status:** System Layer
**Depends On:** Motion System, Motion Intelligence, Component Intelligence, Design Tokens System

---

# Purpose

The Animation System defines how complex animations, visual transitions, and dynamic experiences are designed and implemented across a product.

Animation is an extension of motion.

Motion explains change.

Animation creates:

* storytelling
* emphasis
* engagement
* visual feedback
* memorable experiences

---

# Core Principle

Animation must serve experience, not decoration.

Every animation should answer:

```text id="z7n4cp"
What is the user learning?

What action is being reinforced?

Why is animation better than a static state?
```

---

# Animation Architecture

```text id="b9k2tm"
Animation Purpose

↓

Animation Pattern

↓

Timing System

↓

Implementation Method

↓

Performance Review
```

---

# Animation Categories

## Functional Animation

Purpose:

Help users understand interface behavior.

Examples:

* opening panels
* state changes
* progress updates
* validation feedback

Priority:

Highest.

---

## Informational Animation

Purpose:

Explain information.

Examples:

* onboarding sequences
* guided interactions
* feature explanations

---

## Brand Animation

Purpose:

Express identity.

Examples:

* hero animations
* product storytelling
* illustrations

Use carefully.

---

## Decorative Animation

Purpose:

Visual enhancement.

Rules:

Must never interfere with:

* usability
* speed
* clarity

---

# Animation Principles

## Purpose First

Every animation requires a reason.

Reject:

* random movement
* effects without meaning
* animation because space feels empty

---

## Consistency

Similar actions should animate similarly.

Example:

All drawers:

```text
Same direction

Same timing

Same easing
```

---

## Restraint

Good animation is controlled.

Avoid:

* excessive movement
* constant activity
* distracting loops

---

# Animation Timing

Use system tokens.

Example:

```text id="5h7v8m"
Micro:

100-200ms


Standard:

200-400ms


Large:

400-700ms
```

---

# Animation Patterns

## Entrance Animation

Purpose:

Introduce new content.

Examples:

* fade in
* slide in
* scale in

Used for:

* dialogs
* cards
* sections

---

## Exit Animation

Purpose:

Explain removal.

Examples:

* fade out
* collapse
* slide away

---

## Transformation Animation

Purpose:

Show relationship between states.

Examples:

* expanding cards
* changing buttons
* morphing elements

---

## Continuous Animation

Purpose:

Indicate ongoing activity.

Examples:

* loading
* processing
* ambient branding

Rules:

Use sparingly.

---

# Animation Hierarchy

Not everything deserves animation.

Priority:

```text id="t8m2wv"
Important User Action

↓

Important State Change

↓

Brand Moment

↓

Decoration
```

---

# Page Transition System

Page transitions should:

* preserve orientation
* feel fast
* support navigation

Avoid:

* long transitions
* cinematic effects delaying tasks

---

# Scroll Animation Rules

Scroll animations should:

* reveal content naturally
* support storytelling
* maintain performance

Avoid:

* animating every section
* forcing users to wait

---

# Hero Animation System

Hero animations may include:

* layered movement
* product demonstrations
* visual storytelling

Requirements:

* immediate value communication
* fast loading
* graceful fallback

---

# Loading Animation System

Preferred order:

1. Skeleton loading
2. Progress indicators
3. Meaningful animations
4. Simple spinners

Loading should communicate progress, not hide delays.

---

# Animation Performance

Prioritize:

* smooth frame rates
* low CPU usage
* mobile performance

Prefer:

```text id="z3q8hv"
transform

opacity
```

Avoid excessive:

* layout changes
* large filters
* heavy effects

---

# Animation Accessibility

Support:

```text id="w1k5oa"
prefers-reduced-motion
```

When reduced motion is enabled:

Replace:

* movement

with:

* instant transitions
* subtle opacity changes
* static states

---

# Animation By Product Type

## SaaS

Prefer:

* functional transitions
* workflow clarity

---

## Ecommerce

Prefer:

* product focus
* feedback animations

---

## Mobile Apps

Prefer:

* touch feedback
* navigation continuity

---

## Landing Pages

Prefer:

* storytelling
* brand expression

---

# Animation Anti-Patterns

Reject:

* excessive parallax
* constant movement
* animations blocking tasks
* unnecessary page transitions
* heavy video-like effects
* inconsistent timing

---

# Animation Review Questions

Before approval:

```text id="m7q2xy"
Does animation improve understanding?

Is the timing appropriate?

Does it match the product personality?

Does it perform well?

Does it respect accessibility?

Would removing it harm the experience?
```

---

# Final Rule

Animation is not about making interfaces move.

It is about making change understandable.

The best animations make digital experiences feel intentional, responsive, and human.
