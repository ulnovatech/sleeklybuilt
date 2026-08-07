# Mobile App Design Prompt
**Version:** 1.0  
**Status:** Production Design Generation Prompt  
**Depends On:** Product Classifier, Mobile Intelligence, Mobile First, Navigation Intelligence, Content Intelligence, Accessibility Intelligence

---

# Purpose

This prompt defines the process for designing production-quality mobile applications using the Design OS framework.

The goal is not to create screens.

The goal is to create complete mobile experiences that are:

- intuitive
- scalable
- accessible
- visually refined
- production-ready

---

# Design Mission

```
Understand User

↓

Define Core Tasks

↓

Design User Flows

↓

Create Information Architecture

↓

Design Screens With States

↓

Validate Touch, Performance, Accessibility
```

---

# Before Designing

## Product Context

Determine what the application does, who uses it, primary goals, and business objectives.

## User Needs

Identify main problems, frequent actions, important information, and expectations.

## Platform Context

Respect iOS and Android conventions, device limits, and touch interaction without cloning platform UI blindly when brand systems already define controls.

---

# Mobile First Principles

Design for thumb interaction, small screens, limited attention, and variable connectivity.

Prioritize:

```
Essential Information

↓

Primary Actions

↓

Supporting Features
```

Decision criterion: if a feature cannot succeed one-handed in interrupted conditions, it is not ready for mobile primary flow.

---

# App Architecture

Choose navigation by complexity and frequency:

- bottom navigation for 3–5 peer destinations
- tabs for closely related views
- stack navigation for hierarchical drills
- drawers for low-frequency destinations
- modal flows for focused tasks

Navigation must match app complexity, user frequency, and content structure.

---

# Screen Planning

Every screen defines:

```
Purpose
User Goal
Primary Action
Supporting Information
Possible States
```

One primary action per screen. Secondary actions must not visually equal the primary.

---

# Required Screen States

```
Loading
Empty
Error
Success
Offline
```

Empty and error copy must teach recovery. Consult Content Intelligence and Empty/Error States systems for language rules.

---

# Component Strategy

Use consistent buttons, cards, inputs, lists, navigation, dialogs, and bottom sheets.

Components must include states, accessibility names, and touch-safe targets (minimum 44×44).

Prefer bottom sheets over full-screen takeovers for optional choices.

---

# Interaction Design

Every action communicates:

```
User Action

↓

System Response

↓

Next Available Step
```

Gestures require visible alternatives. Never make swipe the only path for a critical action.

---

# Forms And Input

Minimize typing. Prefer selections, autofill, smart defaults, and correct keyboards.

Preserve progress on interruption. Validate near the field. Mark required fields consistently.

---

# Visual And Motion Requirements

Apply design tokens, typography, spacing, color, elevation, and motion systems.

Motion clarifies navigation and feedback. Prefer 150–300ms. Respect reduced motion.

---

# Accessibility Requirements

Readable text, sufficient contrast, accessible controls, screen readers, reduced motion, and dynamic type support.

---

# Performance Requirements

Optimize startup, scrolling, images, animations, and memory.

Avoid heavy screens and unexplained waiting. Prefer skeletons that match layout.

---

# Decision Criteria

Approve a mobile app design only when:

- Core tasks succeed in under the minimum practical tap count
- Navigation destinations are predictable
- Offline and error recovery exist for core flows
- Touch targets and thumb zones are respected
- Content is front-loaded for interrupted reading

---

# Anti-Patterns

Reject:

- desktop layouts compressed onto phones
- tiny controls and precision-only gestures
- screens without empty/error/offline states
- competing floating actions over primary content
- modal abuse for ordinary navigation
- fake device status or invented metrics in UI chrome

---

# Mobile App Output

Example:

```
Product

Local services booking app

Core Tasks

Search → Compare → Book → Track

Navigation

Bottom nav: Home, Search, Bookings, Account

Primary Screen States

Search empty: teach filters + location permission rationale
Booking error: payment declined with cart preserved

Platform Notes

iOS: large titles on root lists
Android: predictive back preserves draft booking

Review

Pass with offline booking queue required
```

---

# Failure Conditions

This prompt fails when:

- Screens are designed before flows
- States are missing on core journeys
- Platform conventions are ignored without reason
- Performance or accessibility is deferred
- Content is desktop-length on primary screens

---

# Quality Checklist

```
✓ User goals are clear
✓ Navigation is intuitive
✓ Touch interactions work
✓ Screens have complete states
✓ Components are consistent
✓ Accessibility is supported
✓ Performance is optimized
✓ Design feels intentional on device
✓ Experience is production ready
```

---

# Review Questions

- Can a new user complete the primary task one-handed?
- Is the next action obvious on every primary screen?
- Do empty and error states teach recovery?
- Are gestures optional rather than mandatory?
- Does the app remain usable on a slow network?

---

# Final Instruction

Create mobile applications that feel intentional from the first interaction.

Do not design collections of screens. Design complete user journeys that help people accomplish meaningful tasks efficiently.
