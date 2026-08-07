# Shadow System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Design Tokens, Elevation System, Color System, Component Intelligence

---

# Purpose

The Shadow System defines how shadows are created, applied, and controlled across a product interface.

Shadows communicate:

- depth
- focus
- hierarchy
- interaction
- separation

A strong shadow system creates visual structure without unnecessary decoration.

---

# Core Philosophy

Shadows explain layer relationships.

Never add a shadow because a surface feels empty.

Every shadow must answer:

```
Why does this need separation?

What layer is above what?

Does usability improve if the shadow is removed?
```

If removing the shadow changes nothing important, remove it permanently.

---

# Shadow Decision Pipeline

```
Surface Role

↓

Elevation Need

↓

Token Selection

↓

State Behavior

↓

Theme Adaptation

↓

Performance And Accessibility Review
```

---

# Shadow Token Scale

Define a limited vocabulary. Do not invent one-off shadow stacks per component.

```
shadow-none    No elevation
shadow-xs      Minimal separation
shadow-sm      Subtle resting elevation
shadow-md      Standard floating surfaces
shadow-lg      High-priority overlays
shadow-xl      Maximum focus / rare focal layers
```

Each token defines offset, blur, spread, opacity, and color through design tokens — not hardcoded values in components.

---

# When To Use Each Shadow

## shadow-none

Use when:

- page backgrounds and ordinary sections
- dense tables, lists, and data cells
- surfaces already separated by spacing, borders, or background contrast
- long scrolling feeds where shadow on every item creates noise

Default bias: prefer none.

---

## shadow-xs

Use when:

- lightly raised inputs in otherwise flat forms
- compact toolbars that sit on busy content
- cards that need a whisper of separation without floating

Do not use as a decorative outline substitute when a border token is clearer.

---

## shadow-sm

Use when:

- interactive cards that afford click or drag
- resting state for dropdown triggers that can open overlays
- sticky subheaders that must separate from scrolling content lightly

This is the common resting elevated token for balanced products.

---

## shadow-md

Use when:

- open dropdowns and select menus
- popovers and contextual menus
- floating action controls
- hover elevation for cards that truly lift

Rule: md means temporary or interactive float, not permanent wallpaper on every card.

---

## shadow-lg

Use when:

- dialogs and confirmations
- important takeovers that dim the background
- command palettes and focus traps

Always pair with a scrim or equivalent focus treatment. Shadow alone is not enough for modal separation.

---

## shadow-xl

Use when:

- rare maximum-focus surfaces
- onboarding spotlights
- critical system alerts that must outrank other overlays

Limit to one focal layer at a time. Two xl surfaces fighting is a hierarchy failure.

---

# Elevation Mapping

Approximate layer model:

```
Level 0  Base page              shadow-none
Level 1  Raised content         shadow-xs / sm
Level 2  Floating UI            shadow-md
Level 3  Overlays / dialogs     shadow-lg
Level 4  Temporary spotlight    shadow-xl
```

Components must declare their level. They must not invent a fifth vocabulary outside tokens.

---

# Component Rules

## Cards

- Not every card floats
- Use shadow only for grouping, interactivity, or importance
- Prefer border + spacing for static content groups

## Buttons

- Most buttons need no shadow
- Primary may use `xs`/`sm` only if brand language requires elevation
- Never raise every button

## Navigation

- Floating mobile bottom navigation may use `sm`/`md`
- Sticky headers prefer border or `xs` before heavier shadows

## Overlays

- Menus: `md`
- Modals: `lg` + scrim
- Toasts: `md` or `lg` depending on urgency, never competing with an open modal

---

# Interaction Shadows

Elevation may change with state, but the change must be intentional and tokenized.

Example:

```
Default     shadow-sm
Hover       shadow-md
Active      shadow-xs
Disabled    shadow-none
```

Rules:

- Active often lowers (pressed into the surface)
- Hover may raise only if the control is elevatable
- Focus must not rely on shadow alone — use a visible focus ring

---

# Color And Theme

Shadow color is a token, not raw black.

Light themes:

- soft neutral shadow at low opacity
- avoid harsh pure black blooms

Dark themes:

- shadows are weaker; prefer surface step-ups and borders
- do not copy light-theme shadow values unchanged
- elevation often becomes background luminance change first, shadow second

---

# Accessibility Rules

Do not use shadow as the only indicator of:

- interactivity
- selection
- grouping
- focus

Support with contrast, borders, labels, and focus rings.

---

# Performance Rules

Shadows are not free.

Avoid:

- shadow on every row in long virtualized lists
- multiple layered shadows per component without need
- animating heavy shadows on low-end mobile during scroll

Prefer opacity or transform feedback when elevation animation is expensive.

---

# Shadow Anti-Patterns

Reject:

- every container has a shadow
- inconsistent homemade shadow stacks
- decorative multi-layer glow presented as elevation
- shadows used instead of spacing or hierarchy
- dark-mode interfaces that only darken light shadows
- hover shadows without accessible non-hover affordance

---

# Shadow System Output

Example:

```
Product

Marketplace storefront

Elevation Map

Page sections           shadow-none
Listing cards           border + shadow-none (static)
Interactive cards       shadow-sm resting, shadow-md hover
Filters popover         shadow-md
Cart drawer             shadow-lg + scrim
Critical dispute modal  shadow-xl

Dark Mode

Surface steps + borders primary
Shadows reduced one step

Performance

No per-row shadows in infinite search results

Review

Pass
```

---

# Failure Conditions

The shadow system fails when:

- Shadows appear without a layer reason
- Multiple incompatible shadow recipes exist
- Cards float by default and the UI feels noisy
- Modals rely on shadow without scrim or focus trap clarity
- Dark mode becomes muddy because shadows were copied from light theme
- Performance suffers from shadow-heavy lists

---

# Review Questions

Before approval:

- Does every shadow map to an elevation level?
- Would removing half the shadows improve calm?
- Are overlays clearly above content?
- Do interaction states use tokens, not one-offs?
- Is dark mode elevation understandable without heavy shadows?
- Is shadow never the only affordance?

---

# Final Rule

A great shadow system creates depth without distraction.

Users should understand what sits above what. They should not notice the shadows themselves.
