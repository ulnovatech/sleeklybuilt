# SleeklyBuilt Design System

The source of truth for the marketing hub's visual language. Tokens live in
[tailwind.config.js](tailwind.config.js); surfaces and type roles live in
[src/index.css](src/index.css).

---

## 1. Color

The brand keeps its Clarity identity — emerald, cream, gold. One tier was added:
**obsidian**, a green-warm biased near-black. Pure `#000` next to cream `#f8f4ec`
reads harsh and cheap; a warm black reads like material.

### Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `cream` | `#f8f4ec` | Default page canvas |
| `cream-deep` | `#ede5d6` | Subtle fills, borders on light |
| `emerald-deep` | `#2d5346` | Headings on light |
| `emerald` | `#3f7a62` | Links, emphasis on light |
| `emerald-soft` | `#5f9a82` | Tints, fills |
| `gold` | `#d4a84b` | The single accent |
| `gold-soft` | `#e4c47a` | Accent hover |
| `ink` | `#38342e` | Body copy on light |
| `ink-soft` | `#5c5852` | Secondary copy on light |
| `obsidian` | `#0a0b0a` | Dark band canvas |
| `obsidian-raised` | `#131614` | Cards and surfaces on dark |
| `obsidian-line` | `#232823` | Hairlines and borders on dark |

### Rules

Color is structural, never decorative.

- **Obsidian appears exactly three times per journey** — the hero, one mid-page
  emphasis band, and the footer. Overuse destroys its impact.
- **Cream is where reading happens.** It is the default; dark is the exception.
- **Gold is one element per viewport**, and it always marks either the primary
  action or the eyebrow rule. If two golds compete, one of them is wrong.
- **`cream/70` is the body-copy equivalent on dark.** Not a lighter emerald.

### Contrast

Verified against `obsidian` `#0a0b0a`:

- `cream` `#f8f4ec` — approximately 18:1. Passes AA and AAA.
- `gold` `#d4a84b` — approximately 7.9:1. Passes AA and AAA.
- `emerald` `#3f7a62` — approximately 2.6:1. **Banned as text on dark.** It may
  appear on obsidian only as a glow or a fill, never as type.

`SectionHeading` enforces this: `tone="invert"` switches the heading to cream and
the eyebrow to gold, so the rule cannot be violated by a call site.

---

## 2. The obsidian surface

`.surface-obsidian` is the "shiny black." Four layers over solid obsidian:

1. **Emerald bloom** — radial at `20% 15%`, `rgba(63,122,98,0.28)`. Ties the dark
   tier to the brand instead of being generic black.
2. **Gold counter-glow** — radial at `80% 90%`, `rgba(212,168,75,0.10)`. Warms
   the lower right so the frame feels lit rather than flat.
3. **Specular sheen** — linear `180deg`, `rgba(255,255,255,0.06)` fading by 35%.
   This is the shine.
4. **Grain** — inline SVG `feTurbulence` at 3.5% opacity. Non-negotiable. Without
   it the gradients posterize into visible bands on 8-bit displays.

A seat gradient returns the last 12% of the band to solid obsidian so it meets
the cream section below on a clean edge.

```jsx
<section className="surface-obsidian section-dark">…</section>
```

The gradients render on `::before` and the grain on `::after`, both at negative
`z-index` inside an `isolation: isolate` context — they paint above the element's
background but below its content, so children need no `z-index` of their own.

---

## 3. Typography

Instrument Serif for display, Work Sans for everything else. The pairing was
already right; what was missing was a scale.

### Display — Instrument Serif

| Class | Size | Leading | Tracking |
| --- | --- | --- | --- |
| `display-hero` | `clamp(2.75rem, 6vw, 5.25rem)` | `0.95` | `-0.02em` |
| `display-section` | `clamp(2rem, 4vw, 3.5rem)` | `1.05` | `-0.015em` |
| `display-card` | `1.375rem` | `1.2` | `-0.01em` |

### Text — Work Sans

| Class | Size | Leading |
| --- | --- | --- |
| `lead` | `1.125rem` → `1.25rem` at `md` | `1.65` |
| `text-body` | `1rem` | `1.7` |
| `text-meta` | `0.875rem` | `1.6` |
| `eyebrow` | `0.75rem`, uppercase, `0.14em` tracking, weight 600 | `1.4` |

### Rules

- **Measure is capped.** `max-w-measure` is 65ch for body, `max-w-measure-lead`
  is 38ch for leads. The `.lead` class applies the 38ch cap for you.
- **One display weight.** Instrument Serif carries emphasis through size, never
  through bold.
- **Tabular numerals in pricing** via `tabular-nums` so columns align.
- Prefer the `font-serif` utility. The legacy `.serif` class is retained only for
  call sites not yet migrated.

---

## 4. Spacing and layout

8pt base grid.

- **Container** — `max-w-7xl` with `px-6 lg:px-10`. Provided by `Section`.
- **Dark bands** — `.section-dark` (`py-28 md:py-36`). Dark sections need more air
  or they read as a power cut.
- **Light sections** — `.section-light` (`py-20 md:py-28`).
- **Mobile floor** — never below `py-16`.
- **Heading to content** — `mt-12` desktop, `mt-8` mobile.
- **Card grid gap** — `gap-6` minimum. `gap-4` is what made the old services grid
  feel crowded.

---

## 5. Alignment

**All section headings align left.** There is deliberately no centre option on
`SectionHeading` — the prop was removed rather than defaulted, so the decision
cannot regress through a call site. This matches
`ulnovatech-clarity-main/src/components/site/Section.tsx`.

Centred text is what you use when you have nothing to say. Left-aligned type with
one clear sentence is the confident move.

---

## 6. Component contract

Every component ships all of its states before it is considered done:

- loading
- empty
- error
- success
- hover
- focus (visible ring, never `outline: none` alone)
- disabled

Data-backed sections never render placeholder content. If an API returns nothing,
the section renders a genuine empty state — never fabricated cards.

---

## 7. Copy

- **"Template" is retired from customer-facing copy.** Use "layout" or "website
  layout." Template implies mass-produced; layout implies a professionally
  designed foundation customized per client. Internal code identifiers and the
  ulndash admin keep `template` — this is a copy rule, not a refactor.
- **No emoji as iconography.** Emoji render differently on every OS, cannot be
  colored, and signal haste. Use line icons.
- **No unverifiable metrics.** Claims precise enough to be checked must be true.

---

## 8. Design OS binding

These brand tokens are the marketing hub's values. Design OS owns the *roles*
in `design-os/systems/color_system.md` and `design_tokens.md`.

Brand primitives (`--cream`, `--emerald`, …) remain the hex source of truth.
New components must consume semantic roles — never unexplained raw hex, magic
spacing, or off-scale radii when a role exists.

### Colour roles

| Role | CSS variable | Tailwind |
| --- | --- | --- |
| surface-base | `--color-surface-base` | `bg-surface-base` |
| surface-raised | `--color-surface-raised` | `bg-surface-raised` |
| surface-sunken | `--color-surface-sunken` | `bg-surface-sunken` |
| surface-overlay | `--color-surface-overlay` | `bg-surface-overlay` |
| surface-inverse | `--color-surface-inverse` | `bg-surface-inverse` |
| content-primary / secondary / muted / disabled / inverse / link | `--color-content-*` | `text-content-*` |
| border-subtle / default / strong / focus | `--color-border-*` | `border-subtle`, `border-strong`, … |
| action-primary (+ hover / active / soft) | `--color-action-primary*` | `bg-action-primary` |
| action-secondary / danger / disabled | `--color-action-*` | `bg-action-danger` etc. |
| accent | `--color-accent` | `bg-accent` / `text-accent` |
| status-* (+ surfaces) | `--color-status-*` | `text-status-success` / `bg-status-success-surface` |
| focus-ring | `--color-focus-ring` | `ring-dos` / `ring-focus` |
| focus-ring (on inverse) | `--color-focus-ring-inverse` | `ring-dos-inverse` |

Focus rings are never emerald or gold — those roles are reserved for actions and accent.

### Spacing, radius, shadow, motion, z-index

| Concern | Tokens | Tailwind |
| --- | --- | --- |
| Spacing | `--space-xs` … `--space-4xl` | `p-dos-md`, `gap-dos-lg`, … |
| Radius | `--radius-none` … `--radius-full` (Design OS scale) | `rounded-dos-md`, `rounded-dos-xl` |
| Shadow | `--shadow-xs` … `--shadow-xl` | `shadow-sm`, `shadow-dos-md`, … |
| Motion | `--motion-fast/normal/slow`, `--ease-*` | `duration-fast`, `ease-dos` |
| Z-index | `--z-base` … `--z-notification` | `z-sticky`, `z-modal`, … |

`rounded-2xl` is remapped to radius-xl (20px) so legacy classes stay on-scale.
True 32px corners use `rounded-dos-2xl`.

### Reduced motion

`prefers-reduced-motion: reduce` disables smooth scrolling and collapses animation
and transition durations. Framer `Reveal` already short-circuits via
`useReducedMotion`.

Full contract: `design-os/systems/design_tokens.md`
(Implementation Binding Contract). Agents must follow root `AGENTS.md`.

---

## 9. Reference

- UX gate / redesign audit (Phase 0): [UX-GATE.md](UX-GATE.md) — required before UI work
- Design OS-aligned reform plan: Cursor plan `sleeklybuilt_design_os_replan`
- Authority: root `AGENTS.md` + `design-os/INDEX.md`
