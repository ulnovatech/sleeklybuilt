# Accessibility Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Design Constitution, Accessibility, UX Intelligence, Component Intelligence

---

# Purpose

Accessibility Intelligence ensures every product can be used by the widest possible range of people, devices, environments, and abilities.

Accessibility is not a final audit.

It is a design intelligence that influences every decision.

---

# Core Philosophy

Do not design for an imaginary perfect user.

Design for real humans.

Users may experience:

- poor eyesight
- limited mobility
- different languages
- slow connections
- older devices
- temporary disabilities
- environmental limitations

Excellent design includes them by default.

---

# Accessibility Decision Pipeline

Every project follows:

```
Product Classification

↓

User Context

↓

Accessibility Requirements

↓

Design Decisions

↓

Implementation Rules

↓

Testing

↓

Approval
```

---

# Accessibility Foundation

Every interface must satisfy four principles:

## Perceivable

Users can understand the information.

Examples:

- readable text
- sufficient contrast
- meaningful alternatives

---

## Operable

Users can interact successfully.

Examples:

- keyboard support
- touch targets
- predictable navigation

---

## Understandable

Users can comprehend the experience.

Examples:

- clear language
- consistent patterns
- helpful errors

---

## Robust

The interface works across:

- browsers
- devices
- assistive technologies

---

# Visual Accessibility

## Contrast

Maintain sufficient contrast between:

- text and background
- icons and surfaces
- controls and surroundings

Never sacrifice readability for visual subtlety.

---

# Color Independence

Never communicate meaning through color alone.

Bad:

"Red means failed."

Better:

Red icon + "Payment failed"

---

# Typography Accessibility

Ensure:

- readable sizes
- scalable text
- comfortable spacing
- clear hierarchy

Avoid:

- tiny text
- excessive thin weights
- compressed layouts

---

# Motion Accessibility

Respect reduced-motion preferences.

When users disable motion:

Reduce:

- large transitions
- parallax
- zoom effects
- decorative animation

Maintain:

- feedback
- state changes
- understanding

---

# Interaction Accessibility

Every interaction must consider:

- touch
- keyboard
- assistive technologies

---

# Touch Accessibility

Requirements:

Minimum:

44 × 44px targets

Preferred:

48px+

Spacing:

Avoid accidental taps.

---

# Keyboard Accessibility

Users should be able to:

- navigate
- select
- submit
- close dialogs
- access controls

without a mouse.

---

# Focus Management

Every interactive element requires:

- visible focus state
- logical focus order
- predictable movement

Never trap users unexpectedly.

---

# Screen Reader Intelligence

Interfaces should communicate meaning.

Requirements:

Use:

- semantic HTML
- meaningful labels
- correct roles
- useful states

Avoid:

- generic labels
- empty controls
- meaningless icons

---

# Component Accessibility

Every component must define:

## Button

Requires:

- accessible name
- clear action
- focus state

---

## Input

Requires:

- label
- instructions
- validation message

---

## Dialog

Requires:

- focus handling
- title
- close action

---

## Navigation

Requires:

- landmarks
- clear labels

---

# Form Accessibility

Forms must:

- identify required fields
- explain errors
- preserve entered data
- avoid unnecessary complexity

---

# Error Accessibility

Errors should be:

- visible
- understandable
- actionable

Never:

"Invalid input"

Prefer:

"Password must contain at least 8 characters."

---

# Content Accessibility

Content should use:

- simple language
- meaningful headings
- logical structure

Avoid:

- unexplained abbreviations
- unnecessary complexity

---

# Image Accessibility

Images are classified.

## Informational Images

Require descriptions.

---

## Decorative Images

Should not create noise.

---

## Functional Images

Must explain the action.

Example:

Search icon button

must communicate:

"Search"

---

# Data Accessibility

Charts and visualizations require alternatives.

Provide:

- labels
- descriptions
- summaries
- accessible tables when necessary

---

# Responsive Accessibility

Accessibility must survive:

- mobile
- tablet
- desktop
- zoom
- orientation changes

Never create a responsive layout that becomes unusable when enlarged.

---

# Accessibility Testing

Every product requires:

## Automated Testing

Check:

- contrast
- semantic structure
- missing labels
- invalid markup

---

## Manual Testing

Check:

- keyboard flow
- screen reader behavior
- zoom behavior
- mobile interaction

---

# Accessibility Anti-Patterns

Never create:

- tiny text
- low contrast interfaces
- icon-only unexplained controls
- inaccessible custom components
- hidden keyboard focus
- color-only status indicators
- motion without alternatives

---

# Accessibility Intelligence Output

Example:

```
Product

Healthcare Booking App

Accessibility Priority

High

Requirements

WCAG AA

Typography

Large readable text

Controls

48px touch targets

Navigation

Keyboard accessible

Motion

Reduced motion supported

Forms

Clear labels and errors

Screen Readers

Semantic structure enabled

Review

Pass
```

---

# Review Questions

Before approval:

- Can different users complete the same task?
- Is information understandable without color?
- Are controls easy to interact with?
- Can users recover from errors?
- Does assistive technology understand the interface?
- Does accessibility remain across devices?

---

# Final Rule

Accessibility is not about supporting fewer limitations.

It is about removing unnecessary limitations from the product.

The most accessible products are usually the easiest products for everyone to use.