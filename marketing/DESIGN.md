# SleeklyBuilt Design System

The source of truth for the marketing hub's visual language. Tokens live in
[tailwind.config.js](tailwind.config.js); surfaces and type roles live in
[src/index.css](src/index.css).

---

## 1. Color

The brand keeps its Clarity identity — emerald, gold, obsidian — with a **Wave 9
soft-neutral canvas**. Pure parchment cream read as lifestyle brochure; the cooler
stone surface supports a calm systems-studio mood while emerald/gold DNA stay.

### Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `cream` | `#f4f3ef` | Default page canvas (soft neutral) |
| `cream-deep` | `#e6e4de` | Subtle fills, borders on light |
| `emerald-deep` | `#2d5346` | Headings on light |
| `emerald` | `#3f7a62` | Links, emphasis on light |
| `emerald-soft` | `#5f9a82` | Tints, fills |
| `gold` | `#d4a84b` | The single accent |
| `gold-soft` | `#e4c47a` | Accent hover |
| `ink` | `#2f2d2a` | Body copy on light |
| `ink-soft` | `#5a5752` | Secondary copy on light |
| `obsidian` | `#0a0b0a` | Dark band canvas |
| `obsidian-raised` | `#131614` | Cards and surfaces on dark |
| `obsidian-line` | `#232823` | Hairlines and borders on dark |

### Rules

Color is structural, never decorative. **60 / 30 / 10:** ~60% surface, ~30%
structure (ink + emerald), ~10% gold for primary actions only.

- **Obsidian appears exactly three times per journey** — the hero, one mid-page
  emphasis band, and the footer. Overuse destroys its impact. Inner `PageHeader`
  bands count toward this budget — prefer compact headers and do not add a fourth
  dark band on the same journey.
- **Soft neutral is where reading happens.** It is the default; dark is the exception.
- **Gold is one element per viewport**, and it always marks the primary action.
  Labels on obsidian use quiet cream (`eyebrow-invert`), not gold eyebrows that
  compete with CTAs. If two golds compete, one of them is wrong.
- **`cream/70` is the body-copy equivalent on dark.** Not a lighter emerald.

### Contrast

Verified against `obsidian` `#0a0b0a`:

- `cream` `#f4f3ef` — approximately 17:1. Passes AA and AAA.
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

**Wave 9:** Instrument Serif is retired. Display and headings use **Plus Jakarta Sans**
(neo-grotesk). Body, UI, and forms keep **Work Sans**. Pairing chosen for calm
systems-studio authority — not editorial brochure costume.
(`design-os/intelligence/font_intelligence.md` Agency / Professional route.)

### Display — Plus Jakarta Sans (`font-display`)

| Class | Size | Leading | Tracking | Weight |
| --- | --- | --- | --- | --- |
| `display-hero` | `clamp(2.25rem, 4.5vw, 3.5rem)` | `1.15` | `-0.025em` | 600 |
| `display-section` | `clamp(1.75rem, 3vw, 2.25rem)` | `1.2` | `-0.02em` | 600 |
| `display-card` | `1.25rem` | `1.25` | `-0.015em` | 600 |

### Text — Work Sans (`font-sans`)

| Class | Size | Leading |
| --- | --- | --- |
| `lead` | `1.125rem` → `1.25rem` at `md` | `1.55` |
| `text-body` | `1rem` (≥16px) | `1.6` |
| `text-meta` | `0.875rem` | `1.55` |
| `eyebrow` | `0.75rem`, uppercase, `0.12em` tracking, weight 600 | `1.4` |

### Rules

- **Measure is capped.** `max-w-measure` is 65ch for body, `max-w-measure-lead`
  is 42ch for leads. The `.lead` class applies the lead cap for you.
- **Hierarchy through size and weight**, not a second ornamental family.
- **Tabular numerals in pricing** via `tabular-nums` so columns align.
- Prefer `font-display` for headings and brand wordmark. Do not reintroduce a
  display serif. Legacy `font-serif` / `.serif` alias to Plus Jakarta Sans only
  as a temporary safety net.
- Load fonts from `index.html` (Google). Do not add unused `@fontsource` packages.

---

## 4. Spacing and layout

8pt base grid.

- **Container** — `max-w-content` (75rem / 1200px) with `px-6 lg:px-10`. Provided by
  `Section` and shared chrome.
- **Section rhythm** — `.section-light` and `.section-dark` use `py-16 md:py-24`
  (~64px / ~96px). Do not invent one-off vertical padding per section.
- **Mobile floor** — never below `py-16`.
- **Heading to content** — `mt-12` desktop, `mt-8` mobile.
- **Card grid gap** — `gap-6` minimum. `gap-4` is what made the old services grid
  feel crowded.
- **Body measure** — keep copy inside 45–75ch; do not let paragraphs span the full
  content rail on ultra-wide viewports.

---

## 5. Alignment

**All section headings align left.** There is deliberately no centre option on
`SectionHeading` — the prop was removed rather than defaulted, so the decision
cannot regress through a call site. This matches
`design-os` Section patterns and marketing section components.

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
  sleekly-dash admin keep `template` — this is a copy rule, not a refactor.
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

- UX gate / redesign audit: [UX-GATE.md](UX-GATE.md) — required before UI work
- Wave 9 decision memo: [REDESIGN-WAVE-9.md](REDESIGN-WAVE-9.md)
- Wave 9 approval: [WAVE-9-APPROVAL.md](WAVE-9-APPROVAL.md) (96/100 — does not reuse Phase 8)
- Phase 8 historical approval: [PHASE-8-APPROVAL.md](PHASE-8-APPROVAL.md)
- Projects SPA mirrors brand primitives + chrome grammar in `portfolio/frontend` (tokens only; no React coupling). Shared: letter mark, sticky bar, `ring-dos`, obsidian drawer/footer, one gold **Start a project** CTA → hub `/contact`.
- Authority: root `AGENTS.md` + `design-os/INDEX.md`
