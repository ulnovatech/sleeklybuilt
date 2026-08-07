# Design System Review
**Version:** 1.0  
**Status:** Review Layer  
**Depends On:** Design Tokens, Color System, Typography System, Spacing System, Radius System, Shadow System, Component Intelligence

---

# Purpose

The Design System Review evaluates whether a product's design system is structured, consistent, scalable, and capable of supporting high-quality product development.

A design system is not only a collection of components.

It is a shared language connecting:

- design decisions
- user experience
- engineering implementation
- product consistency

---

# Review Pipeline

```
Tokens

↓

Components

↓

States And Variants

↓

Documentation

↓

Design-Code Alignment

↓

Theming

↓

Scalability

↓

Severity And Decision
```

---

# Review Principles

## Single Source Of Truth

The system must define colors, typography, spacing, radius, shadow, components, and interaction patterns in one place.

Reject duplicated styles, inconsistent implementations, and hidden one-off decisions.

## Reduce Decisions

A healthy system removes repetitive choices so teams invent only where product value requires invention.

## Completeness Over Catalog Size

Fewer complete components beat many incomplete ones.

---

# Token Review

## Color Tokens

Check:

- semantic naming (`color.action.primary`, not `blue-button`)
- theme support
- accessible contrast for text and critical UI
- status colors not used as the only meaning channel

## Typography Tokens

Check:

- coherent type scale
- predictable hierarchy
- readable line heights
- no ad-hoc font sizes in product screens

## Spacing Tokens

Check:

- scale adherence (prefer 8-point system)
- layout rhythm
- no arbitrary spacing sprinkled in components

## Radius And Shadow Tokens

Check:

- limited vocabulary
- component mapping documented
- no off-scale values in production

---

# Component Library Review

## Coverage

Does the system cover common needs: buttons, inputs, cards, navigation, dialogs, feedback states?

Missing primitives force local invention and drift.

## Consistency

Check visual alignment, interaction behavior, naming, and state completeness.

## Flexibility

Support common use cases and controlled variants. Reject unlimited customization that destroys coherence.

## States Gate

Every interactive component must define:

```
Default
Hover
Focus
Active
Disabled
Loading
Error
Success
```

Incomplete state coverage is a Major finding at minimum.

---

# Documentation Review

Every component must explain:

```
Purpose
Usage
Variants
States
Do Not Use Cases
Accessibility Requirements
```

Undocumented components are not system components. They are private experiments.

---

# Pattern Review

Evaluate repeatable flows:

- authentication
- dashboards
- onboarding
- checkout
- search

Check repeatability, clarity, and consistency with intelligence and pattern docs.

---

# Design And Code Alignment

Review whether:

- implemented components match design tokens
- engineers consume system components rather than restyling from scratch
- dead variants in design files are removed or marked deprecated

Disconnect between design and code is a Critical finding when it affects primary workflows.

---

# Theming Review

Evaluate light mode, dark mode, and brand themes.

Ensure:

- predictable token behavior
- accessible contrast in every theme
- elevation strategies appropriate to dark surfaces

---

# Scalability Review

Ask:

```
Can the system support more products or surfaces?

Can new components be added without breaking naming?

Can teams maintain consistency without heroics?
```

---

# Severity Levels

## Critical

Blocks release of system-dependent work.

Examples:

- no shared tokens
- inaccessible core components
- primary buttons implemented differently in three places

## Major

Requires improvement before broad adoption.

Examples:

- missing documentation
- incomplete states
- inconsistent radius/shadow usage

## Minor

Polish.

Examples:

- naming cleanup
- documentation refinement

---

# Anti-Patterns

Reject:

- component duplication
- uncontrolled variants
- missing documentation
- inconsistent naming
- manual styling overrides as the default path
- ignoring accessibility
- token names that encode appearance instead of meaning
- raw hex colors in components when Color System / Design Tokens roles exist
- raw spacing or radius magic numbers when Spacing / Radius tokens exist

---

# Design System Review Output

Example:

```
Product

Agency marketing site + client portal

Findings

Critical: primary button colors hardcoded in three CSS modules
Major: input components missing error and disabled states
Major: no radius token map; values 6/10/14 appear
Minor: spacing docs omit 4px half-step usage rule

Decision

Fail system review for portal release
Pass marketing pages only after button token migration

Required Follow-Ups

1. Migrate buttons to color.action.* tokens
2. Complete input states
3. Adopt radius scale from Radius System
```

---

# Failure Conditions

The review fails when:

- Tokens are not the source of truth
- Core components lack required states
- Design and code diverge on primary UI
- Accessibility is absent from component contracts
- The system cannot absorb a new screen without inventing primitives

---

# Review Checklist

```
✓ Tokens are centralized and semantic
✓ Components are reusable
✓ States are complete
✓ Documentation exists
✓ Accessibility is included
✓ Patterns are consistent
✓ Design and code align
✓ Radius and shadow follow systems
✓ No raw hex/spacing in components when tokens exist
✓ System can scale
```

---

# Final Rule

A strong design system does not limit creativity.

It removes repetitive decisions so teams can focus creativity where it matters — and this review exists to keep that promise enforceable.
