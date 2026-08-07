# Mobile First
**Version:** 1.0  
**Status:** Canonical  
**Depends On:** Design Constitution, Design Principles, Quality Bar

---

# Purpose

This document establishes the Mobile First philosophy used throughout Design OS.

Every interface begins with the mobile experience.

Desktop is an expansion.

Tablet is an adaptation.

Mobile defines the product.

---

# Core Principle

Never design for desktop first.

Never shrink a desktop interface.

Never hide complexity behind responsiveness.

Instead:

Design the optimal mobile experience.

Expand naturally for larger screens.

---

# Mobile Is Not Small Desktop

A mobile application has:

- Different ergonomics
- Different attention span
- Different interaction patterns
- Different navigation
- Different information density

Treating mobile as a compressed desktop interface is unacceptable.

---

# Design Order

Every feature follows this order:

1. Mobile
2. Tablet
3. Laptop
4. Desktop
5. Ultra-wide

Never reverse this order.

---

# User Context

Assume mobile users are:

- Standing
- Walking
- Distracted
- One-handed
- Outdoors
- Interrupted
- Using average network quality
- Using average hardware

Design for reality.

---

# Thumb Zone

Primary actions belong inside the natural thumb reach.

Never place essential actions in hard-to-reach corners unless platform conventions require it.

Important interactions should require minimal finger travel.

---

# One-Handed Operation

Every major workflow should be completable using one hand.

Avoid requiring simultaneous gestures or difficult reaches.

When in doubt:

Choose comfort over symmetry.

---

# Touch Targets

Minimum touch area:

44 × 44 px

Preferred:

48–56 px

Interactive elements must have generous spacing to prevent accidental taps.

---

# Navigation

Choose the navigation pattern based on the product.

Possible patterns include:

- Bottom navigation
- Navigation drawer
- Tabs
- Floating action button
- Contextual toolbar
- Search-first navigation
- Progressive navigation

Do not default to hamburger menus.

Select the pattern that best supports the primary workflow.

---

# Screen Priority

Every screen must answer:

What is the single most important task?

That task receives the highest visual priority.

Everything else supports it.

---

# Above the Fold

The first screen should communicate:

- Where am I?
- What is this?
- What should I do?
- Why does it matter?

Never waste the initial viewport.

---

# Scrolling

Scrolling is expected.

Excessive scrolling is poor design.

Prefer:

- grouping
- progressive disclosure
- expandable sections
- tabs
- filters

instead of endless vertical stacking.

---

# Vertical Rhythm

Maintain a consistent visual rhythm.

Avoid:

- uneven spacing
- oversized gaps
- cramped layouts

The eye should move naturally down the screen.

---

# Content Density

Balance density.

Avoid:

Too empty.

Too crowded.

Aim for interfaces that feel efficient without becoming overwhelming.

---

# Forms

Forms should:

- minimize typing
- support autofill
- use appropriate keyboards
- validate immediately
- preserve entered data

Prefer selection over manual input whenever possible.

---

# Lists

Lists are often better than cards.

Prefer:

- grouped lists
- inset lists
- edge-to-edge rows

Use cards only when visual separation improves comprehension.

---

# Cards

Cards are not the default layout.

Use cards only when they:

- group related information
- improve scanning
- improve interaction

Never stack identical cards endlessly.

---

# Search

If users are likely to search,

make search prominent.

Search should never feel hidden.

Support:

- recent searches
- suggestions
- empty search states
- loading
- error handling

---

# Empty States

Every empty state should:

Explain why.

Provide the next action.

Reduce uncertainty.

Never leave a blank screen.

---

# Loading States

Never leave users wondering.

Use:

- skeletons
- progress indicators
- optimistic updates
- meaningful placeholders

Avoid unnecessary spinners.

---

# Feedback

Every interaction should produce feedback.

Examples:

- button press
- successful save
- error
- loading
- deletion
- completion

Silence creates uncertainty.

---

# Motion

Motion should:

- guide attention
- explain transitions
- reinforce hierarchy

Avoid unnecessary animation.

Fast interfaces feel more responsive.

---

# Gestures

Support gestures only when:

- discoverable
- optional
- consistent

Never hide critical functionality behind unknown gestures.

---

# Typography

Typography should prioritize readability over decoration.

Maintain:

- generous line height
- predictable hierarchy
- consistent scale

Avoid tiny body text.

---

# Images

Images must adapt gracefully.

Never distort.

Never crop important information.

Always consider slow network conditions.

---

# Buttons

Primary buttons should be immediately recognizable.

Secondary buttons should remain visible but visually quieter.

Destructive actions must be clearly distinguished.

---

# Modals

Avoid full-screen interruptions unless necessary.

Prefer:

- bottom sheets
- drawers
- expandable panels

Reserve dialogs for important decisions.

---

# Bottom Sheets

Bottom sheets are preferred for:

- quick actions
- filters
- selections
- additional information

They preserve user context better than full-screen navigation.

---

# Performance

Mobile users notice delays immediately.

Optimize:

- rendering
- animation
- asset size
- image loading
- interaction latency

Every millisecond contributes to perceived quality.

---

# Responsive Expansion

Desktop should expand mobile.

Never redesign the workflow simply because more space exists.

Use additional space to provide:

- supporting information
- secondary panels
- larger visualizations
- productivity enhancements

Maintain the same mental model across devices.

---

# Mobile Review Checklist

Every mobile interface must satisfy:

- [ ] Comfortable one-handed use
- [ ] Clear primary action
- [ ] Excellent thumb ergonomics
- [ ] Readable typography
- [ ] Predictable navigation
- [ ] Appropriate information density
- [ ] Minimal typing
- [ ] Responsive feedback
- [ ] Accessible touch targets
- [ ] No horizontal scrolling
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Smooth performance
- [ ] Visually balanced layout

---

# Final Rule

The mobile experience is not a constraint.

It is the foundation of the product.

If the interface feels exceptional on mobile, it will naturally scale into an exceptional desktop experience.