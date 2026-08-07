# Mobile Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, Mobile First, UX Intelligence, Layout Intelligence, Accessibility Intelligence

---

# Purpose

Mobile Intelligence defines how products are designed specifically for mobile environments.

Mobile is not a smaller desktop.

Mobile is a unique computing environment with different:

- behaviors
- constraints
- interactions
- expectations
- ergonomics

---

# Core Philosophy

The mobile experience is the foundation.

Desktop expands the mobile experience.

Never compress desktop into mobile.

---

# Mobile Decision Pipeline

Every mobile experience follows:

```
Product Understanding

↓

User Context

↓

Primary Mobile Task

↓

Interaction Strategy

↓

Screen Architecture

↓

Navigation Model

↓

Touch Optimization

↓

Performance Review

↓

Mobile QA
```

---

# Step 1 — Understand Mobile Context

Consider:

- one-handed usage
- short sessions
- interruptions
- variable network
- limited screen size
- touch interaction
- battery limitations

---

# Mobile User Mindset

Mobile users usually want:

- speed
- clarity
- immediate action
- minimal effort

They rarely want:

- complex configuration
- excessive reading
- unnecessary choices

---

# Primary Task Identification

Every mobile screen must answer:

"What is the most important thing the user can do here?"

That action receives priority.

---

# Screen Architecture

Mobile screens should have:

## Primary Zone

Main content or action.

---

## Supporting Zone

Helpful information.

---

## Secondary Zone

Optional features.

---

Avoid giving every element equal importance.

---

# Touch Design

Mobile interfaces must optimize for fingers.

Requirements:

Touch targets:

Minimum:

44px

Preferred:

48px+

---

Spacing:

Avoid crowded controls.

---

Actions:

Place frequent actions within comfortable reach.

---

# Thumb Zone Intelligence

Screen areas have different comfort levels.

## Easy Reach

Best for:

- primary actions
- navigation
- frequent controls

---

## Stretch Reach

Acceptable for:

- secondary actions

---

## Difficult Reach

Avoid for:

- important actions

---

# Mobile Navigation Strategy

Choose based on product.

---

# Bottom Navigation

Use when:

- 3–5 primary sections exist
- switching is frequent

---

# Top Navigation

Use when:

- context matters
- simple hierarchy exists

---

# Drawer Navigation

Use only when:

- many sections exist
- frequent switching is low

---

# Tabs

Use for:

- related views
- same-level categories

---

# Gestures

Gestures should enhance.

Never hide essential functionality behind gestures.

Support:

- swipe
- drag
- pull
- long press

only when discoverable.

---

# Mobile Forms

Optimize for completion.

Rules:

- minimize fields
- use correct keyboards
- provide autofill
- preserve progress
- validate quickly

---

# Mobile Input Types

Use appropriate inputs:

Email keyboard

Numeric keyboard

Date picker

Camera input

Location selection

---

# Lists vs Cards

Mobile often benefits from lists.

Use lists for:

- settings
- messages
- orders
- history

Use cards when:

- visual grouping improves understanding

---

# Scrolling Intelligence

Scrolling is normal.

But avoid:

- endless pages
- repetitive sections
- unnecessary scrolling

Use:

- grouping
- filters
- pagination
- progressive disclosure

---

# Mobile Content Density

Mobile requires prioritization.

Do not simply shrink desktop content.

Remove:

- unnecessary information
- secondary actions
- visual noise

---

# Performance Intelligence

Mobile users experience performance directly.

Optimize:

- image sizes
- animations
- bundle size
- loading states
- network requests

---

# Offline Considerations

For important applications consider:

- cached data
- retry states
- offline messaging
- graceful failures

---

# Mobile Feedback

Every action needs response.

Examples:

Tap:

visual response

Save:

confirmation

Upload:

progress

Error:

recovery

---

# Mobile Modals

Prefer:

- bottom sheets
- inline expansion
- contextual panels

Avoid excessive full-screen interruptions.

---

# Mobile Cards Rule

Cards must not become the default mobile layout.

Avoid:

```
Card
Card
Card
Card
Card
Card
```

with no hierarchy.

Instead:

Use:

- grouped sections
- lists
- clear content priority

---

# Mobile Typography

Typography must remain comfortable.

Never:

- shrink body text excessively
- reduce line height to fit content
- create cramped screens

---

# Mobile Motion

Motion should feel:

- fast
- responsive
- natural

Avoid:

- slow transitions
- heavy effects
- unnecessary animations

---

# Mobile Anti-Patterns

Never create:

- desktop layouts squeezed into phones
- tiny buttons
- hidden important actions
- endless card stacks
- overloaded menus
- excessive popups
- forced scrolling
- poor keyboard handling

---

# Mobile Intelligence Output

Example:

```
Product

Restaurant Ordering App

Primary Mobile Goal

Order food quickly

Navigation

Bottom Navigation

Layout

Single-column catalog

Primary Action

Add to Cart

Touch Targets

48px

Forms

Minimal checkout

Cards

Limited usage

Loading

Skeleton products

Motion

Fast subtle transitions

Performance

Optimized

Review

Pass
```

---

# Mobile Review Questions

Before approval:

- Can users complete the main task quickly?
- Does it feel designed for touch?
- Is the primary action obvious?
- Is navigation natural?
- Is information prioritized?
- Does it perform well on average devices?
- Does it avoid unnecessary complexity?

---

# Final Rule

Mobile is not the limitation.

Mobile is the environment.

The best mobile products are not smaller versions of desktop software.

They are carefully designed experiences built around human behavior.