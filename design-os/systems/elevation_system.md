# Elevation System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Visual Language, Component Intelligence, Design Tokens

---

# Purpose

The Elevation System defines how depth, layering, hierarchy, and separation are represented in the interface.

Elevation communicates:

- importance
- interaction
- focus
- hierarchy
- relationship between surfaces

It is not a decoration system.

---

# Core Philosophy

Depth should explain structure.

Never add shadows because an interface feels empty.

Every elevation decision must answer:

"Why does this element need to appear closer to the user?"

---

# Elevation Model

Design OS uses a limited elevation scale.

```
Level 0

↓

Level 1

↓

Level 2

↓

Level 3

↓

Level 4
```

Avoid unlimited shadow variations.

---

# Level 0 — Flat

Purpose:

Default surface.

Used for:

- page backgrounds
- simple sections
- static content

Characteristics:

No shadow.

Clear spacing separation.

---

# Level 1 — Subtle

Purpose:

Small separation.

Used for:

- cards
- grouped content
- input containers

Characteristics:

Very soft shadow.

Minimal visual weight.

---

# Level 2 — Floating

Purpose:

Interactive surfaces.

Used for:

- dropdowns
- menus
- popovers
- floating panels

Characteristics:

Clear separation from background.

---

# Level 3 — Prominent

Purpose:

Temporary focus elements.

Used for:

- dialogs
- bottom sheets
- important overlays

Characteristics:

Strong but controlled depth.

---

# Level 4 — Maximum

Purpose:

Rare system-level elements.

Used for:

- critical overlays
- special experiences

Use extremely carefully.

---

# Surface Hierarchy

Every interface should define:

## Base Surface

Main background.

Example:

Application canvas.

---

## Raised Surface

Elements above the canvas.

Examples:

Cards

Panels

Navigation bars

---

## Floating Surface

Elements temporarily above content.

Examples:

Menus

Dialogs

Sheets

---

# Shadow Rules

Shadows should communicate:

- position
- interaction
- hierarchy

Not:

- style
- decoration
- realism

---

# Avoid

Never use:

- huge blurry shadows
- dark heavy shadows
- inconsistent shadow styles
- every component floating

---

# Cards and Elevation

Cards do not automatically require shadows.

Prefer this order:

1. Spacing
2. Background difference
3. Border
4. Shadow

Use the least visual force required.

---

# Borders vs Shadows

Use borders when:

- structure needs clarity
- surfaces are close
- density is high

Use shadows when:

- an element needs to appear above others
- interaction requires focus

---

# Material Design Relationship

Material-style elevation may be used when appropriate.

However:

Do not blindly copy default Material shadows.

Modern interfaces often use:

- flatter surfaces
- subtle depth
- stronger spacing

---

# iOS Relationship

iOS-style depth favors:

- blur
- translucency
- soft shadows
- layered surfaces

Use only when aligned with product personality.

---

# Dark Mode Elevation

Dark mode requires different thinking.

Avoid relying only on shadows.

Use:

- surface color changes
- subtle borders
- controlled brightness differences

---

# Component Elevation Rules

---

# Buttons

Usually:

Level 0 or Level 1

Elevated only when floating action is required.

---

# Cards

Usually:

Level 0 or Level 1

Do not make every card appear lifted.

---

# Dropdowns

Level 2

Must clearly separate from content.

---

# Modals

Level 3

Must dominate focus.

---

# Bottom Sheets

Level 3

Should feel above the current context.

---

# Navigation

Bottom navigation:

Usually Level 1

Sidebars:

Usually Level 0

Floating navigation:

Higher elevation.

---

# Floating Action Buttons

Use only when:

- one primary action exists
- constant access is valuable

Avoid decorative floating buttons.

---

# Elevation and Motion

Elevation changes should often pair with motion.

Example:

Dropdown:

Appears

+

Rises slightly

+

Receives focus

Motion should explain the layer change.

---

# Elevation Accessibility

Elevation cannot be the only indicator of meaning.

Users with reduced vision may not perceive shadows.

Support hierarchy with:

- spacing
- contrast
- labels
- structure

---

# Elevation Anti-Patterns

Never create:

- every component floating
- excessive shadows
- shadow-heavy cards
- fake 3D interfaces
- inconsistent depth levels
- unclear layering

---

# Elevation System Output

Example:

```
Product

SaaS Dashboard

Surface

Flat

Cards

Level 0

Dropdowns

Level 2

Dialogs

Level 3

Navigation

Level 1

Shadow Style

Subtle

Dark Mode

Surface-based elevation

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Elevation has purpose
- [ ] Depth levels are limited
- [ ] Shadows are subtle
- [ ] Hierarchy works without shadows
- [ ] Dark mode remains clear
- [ ] Components use consistent elevation

---

# Final Rule

The best elevation system is barely noticed.

Users should not see shadows.

They should simply understand what is important, what is interactive, and what is in focus.

Depth exists to clarify the interface, not decorate it.