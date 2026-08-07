# Mobile First Design Prompt
**Version:** 1.0  
**Status:** Production Mobile-First Experience Design Prompt  
**Depends On:** Mobile First, Mobile Intelligence, Responsive Intelligence, Layout Intelligence, Content Intelligence

---

# Purpose

This prompt defines the process for designing digital products using a mobile-first approach.

Mobile-first is not designing a smaller desktop experience.

It is a design philosophy that starts with:

- essential user needs
- constrained environments
- focused interactions
- efficient experiences

and expands upward.

---

# Design Mission

```
Understand Mobile User Context

↓

Identify Essential Tasks

↓

Prioritize Content

↓

Design Touch Interactions

↓

Expand To Larger Screens

↓

Validate Across Devices
```

---

# Mobile First Principles

## Start With Constraints

Mobile introduces limited screen space, touch interaction, variable connectivity, shorter attention, and device limitations.

These constraints force better decisions. Do not remove them by pretending desktop space exists.

## Essential Experience First

If the task cannot succeed on a small phone, expanding to desktop will not fix the strategy.

---

# User Context Analysis

## Environment

Where users interact, distractions, network conditions, device capabilities.

## Intent

Most common actions, urgent tasks, information needed immediately.

Decision criterion: list the three actions that must work offline-or-degraded before designing enrichment features.

---

# Content Prioritization

Organize:

```
Essential

↓

Important

↓

Useful

↓

Optional
```

Avoid displaying everything equally and forcing desktop density onto mobile.

Content Intelligence applies: shorter strings, front-loaded headlines, primary CTA ≤ 3 words when possible.

---

# Navigation Design

Provide quick access, clear destinations, and predictable movement.

Common patterns: bottom navigation, tabs, menus, search.

Choose by user frequency, information structure, and complexity — not by desktop sidebar habit.

---

# Touch Interaction Design

Design for fingers, not cursors.

Require comfortable targets, spacing, clear pressed states, and reachable primary actions.

Avoid tiny controls, precision-only interactions, and accidental tap traps.

---

# Mobile Layout Principles

Use vertical flow, clear grouping, progressive disclosure, and focused actions.

Avoid compressed desktop layouts, excessive columns, and crowded interfaces.

---

# Typography And Media

Prioritize readability, scanning, hierarchy, contrast, and spacing.

Optimize image dimensions, loading, cropping, and quality. Media must support the task.

---

# Forms On Mobile

Use appropriate keyboards, autofill, smart defaults, and simplified steps.

Avoid unnecessary fields, long forms, and repeated typing.

---

# Interaction States

Every component defines:

```
Default
Pressed
Loading
Success
Error
Disabled
```

---

# Responsive Expansion

After mobile design is solid:

## Tablet

Add useful information and layout improvements without inventing a second product.

## Desktop

Enhance productivity, multiple views, and advanced workflows.

Do not simply stretch mobile layouts. Do not hide critical mobile capabilities on larger screens either.

Expansion test: every desktop addition must map to a mobile essential that already works.

---

# Performance And Accessibility

Prioritize fast loading, reduced assets, efficient rendering, and smooth scrolling.

Ensure readable text, screen reader support, touch accessibility, keyboard alternatives where relevant, and reduced motion support.

---

# Decision Criteria

Approve mobile-first work when:

- Essential tasks are completable on the smallest supported viewport
- Content hierarchy is explicit and checkable
- Touch targets meet minimum size
- Larger breakpoints enhance rather than redesign from scratch
- Degraded/offline paths exist where the product depends on network

---

# Anti-Patterns

Reject:

- desktop-first shrinking
- hiding important features on mobile
- tiny touch targets
- excessive scrolling without structure
- complex gestures without alternatives
- desktop-only hover instructions for core actions
- longer marketing copy left unedited for mobile heroes

---

# Mobile First Output

Example:

```
Product

SaaS project tracker

Mobile Essential

View my tasks → Update status → Comment

Content Priority

Essential: task title, status, primary action
Important: due date, assignee
Optional: activity history behind progressive disclosure

Expansion

Tablet: two-pane list/detail
Desktop: filters + bulk actions

States

Empty project: teach create task
Offline: queue status updates

Review

Pass
```

---

# Failure Conditions

This prompt fails when:

- Desktop structure is designed first and squeezed later
- Mobile omits a capability that desktop treats as core
- Expansion invents unrelated patterns
- Performance or accessibility is treated as optional

---

# Quality Checklist

```
✓ Essential tasks are prioritized
✓ Navigation is simple
✓ Touch targets work
✓ Content hierarchy is clear
✓ Forms are efficient
✓ Performance is optimized
✓ Accessibility is supported
✓ Larger screens enhance the experience
```

---

# Review Questions

- What is the essential mobile experience in one sentence?
- Can that experience succeed without desktop affordances?
- What was intentionally deferred to larger screens, and why?
- Does any critical action require hover or precise cursor input?
- Is copy shortened and front-loaded for interrupted reading?

---

# Final Instruction

Design for the smallest meaningful experience first.

Do not remove features to fit mobile. Discover what truly matters, then build outward.
