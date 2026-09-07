# SleeklyBuilt Design System — Meridian

The source of truth for **public** customer-facing visual language across marketing,
portfolio, and blog. Tokens live in [`tokens.css`](tokens.css); Tailwind roles in
[`tailwind.preset.js`](tailwind.preset.js); surfaces and type roles in
[`styles/`](styles/). Apps consume `@sleeklybuilt/design-foundation` — see
[`README.md`](README.md).

Marketing hub entry: `marketing/DESIGN.md` (points here for implementation).

---

## 0. Identity

**Company:** SleeklyBuilt — Kampala systems studio. Websites, apps, and business
systems for operators who need software that runs day-to-day.

**Personality:** Precise · Calm · Capable · Premium · Human

**Art direction:** **Meridian** — orientation and true north. Not lifestyle
brochure, not generic SaaS blue, not AI purple glow.

**Visual signatures (recognizable without the name):**

1. **Meridian + Spark** — deep slate-teal structure with a single warm spark accent
2. **Sora** geometric display type against **IBM Plex Sans** UI/body
3. **Engineered corners** — restrained radius; CTAs are rounded-rect, not pills
4. **Squared letter mark** — brand glyph is a soft square, not a circle
5. **Void atmosphere** — meridian bloom + spark counter-glow + grain on dark bands

---

## 1. Color

### Brand primitives

| Token | Hex | Role |
| --- | --- | --- |
| `halo` | `#f3f5f7` | Default page canvas (cool technical mist) |
| `halo-deep` | `#dce1e8` | Subtle fills, borders on light |
| `meridian-deep` | `#0b343c` | Headings / deep structure on light |
| `meridian` | `#15656f` | Links, primary actions on light |
| `meridian-soft` | `#458f98` | Tints, soft fills |
| `spark` | `#e35a18` | The single accent (primary CTA on void) |
| `spark-soft` | `#ef7b42` | Accent hover |
| `spark-deep` | `#b84512` | Accent active |
| `ink` | `#12161d` | Body copy on light |
| `ink-soft` | `#596270` | Secondary copy on light |
| `void` | `#07090d` | Dark band canvas |
| `void-raised` | `#11151c` | Cards and surfaces on dark |
| `void-line` | `#1e2430` | Hairlines and borders on dark |

Compatibility aliases (`cream`→`halo`, `emerald`→`meridian`, `gold`→`spark`,
`obsidian`→`void`, plus prior Forge names) remain for existing class names.
Prefer Meridian names in new code.

### Rules

Color is structural, never decorative. **60 / 30 / 10:** ~60% surface (halo),
~30% structure (ink + meridian), ~10% spark for primary actions only.

- **Void appears exactly three times per journey** — hero, one mid-page emphasis
  band, and footer. Overuse destroys impact.
- **Halo is where reading happens.** Dark is the exception.
- **Spark is one element per viewport**, and it always marks the primary action
  on void. Labels on void use quiet halo (`eyebrow-invert`), not spark eyebrows.
- **`halo/70` is the body-copy equivalent on dark.** Not a lighter meridian.
- **Meridian is banned as text on void** (~failed contrast). Glow/fill only.

### Contrast (against void `#07090d`)

- `halo` `#f3f5f7` — ~17:1 (AAA)
- `spark` `#e35a18` — large text / solid button fill with dark label (AA)
- `meridian` `#15656f` — **banned as type on void**

---

## 2. The void surface

`.surface-obsidian` (class name retained) is the atmospheric dark band:

1. **Meridian bloom** — radial at `20% 15%`, `rgba(21,101,111,0.32)`
2. **Spark counter-glow** — radial at `80% 90%`, `rgba(227,90,24,0.12)`
3. **Specular sheen** — linear `180deg`, white at 6% fading by 35%
4. **Grain** — SVG turbulence at ~3.5% opacity (non-negotiable)

A seat gradient returns the last 12% to solid void for a clean edge into halo.

```jsx
<section className="surface-obsidian section-dark">…</section>
```

---

## 3. Typography

**Display:** **Sora** (`font-display`) — geometric, sleek, engineered.
**Body / UI:** **IBM Plex Sans** (`font-sans`) — precise, highly legible, trustworthy.

| Class | Size | Leading | Tracking | Weight |
| --- | --- | --- | --- | --- |
| `display-hero` | `clamp(2.25rem, 4.5vw, 3.5rem)` | `1.15` | `-0.03em` | 600 |
| `display-section` | `clamp(1.75rem, 3vw, 2.25rem)` | `1.2` | `-0.025em` | 600 |
| `display-card` | `1.25rem` | `1.25` | `-0.02em` | 600 |
| `lead` | `1.125rem` → `1.25rem` at `md` | `1.55` | — | 400 |
| `text-body` | `1rem` (≥16px) | `1.6` | — | 400 |
| `text-meta` | `0.875rem` | `1.55` | — | 400/500 |
| `eyebrow` | `0.75rem`, uppercase, `0.14em` tracking | `1.4` | — | 600 |

### Rules

- Measure: `max-w-measure` 65ch; `max-w-measure-lead` 42ch.
- Hierarchy through size and weight — no ornamental second display family.
- Tabular numerals in pricing via `tabular-nums`.
- Load fonts from host `index.html` (Google). No unused `@fontsource` packages.

---

## 4. Shape, border, shadow, motion

| Concern | Direction |
| --- | --- |
| Geometry | Restrained rounding; engineered, not soft-startup |
| CTAs | `rounded-dos-lg` — **not** full pills |
| Brand glyph | Soft square (`rounded-dos-sm`), not circle |
| Borders | Tonal / subtle; never heavy chrome frames |
| Shadows | Cool graphite, low intensity — presence, not drama |
| Gradients | Only inside void atmosphere — never decorative page washes |
| Motion | Restrained, elegant (`--ease-out`); almost invisible on chrome |

Optional signature: `.build-rail` — 3px meridian left edge on interactive cards
that need a quiet brand cue.

---

## 5. Spacing and layout

8pt base grid.

- **Container** — `max-w-content` (75rem) with `px-6 lg:px-10`
- **Section rhythm** — `.section-light` / `.section-dark` → `py-16 md:py-24`
- **Card grid gap** — `gap-6` minimum
- **Body measure** — 45–75ch

---

## 6. Alignment

**All section headings align left.** No centre option on `SectionHeading`.

---

## 7. Component contract

Every component ships loading, empty, error, success, hover, focus, disabled.
Focus rings use `ring-dos` / `ring-dos-inverse` — never meridian or spark.

---

## 8. Copy

- Prefer **layout** over “template” in customer-facing copy
- No emoji as iconography
- No unverifiable metrics

---

## 9. Design OS binding

Brand primitives are the hex source of truth in `tokens.css`.
New components consume semantic roles — never unexplained raw hex.

| Role | CSS variable | Tailwind |
| --- | --- | --- |
| surface-* | `--color-surface-*` | `bg-surface-*` |
| content-* | `--color-content-*` | `text-content-*` |
| border-* | `--color-border-*` | `border-subtle`, … |
| action-primary* | `--color-action-primary*` | `bg-action-primary` |
| accent | `--color-accent` | `bg-accent` |
| status-* | `--color-status-*` | `text-status-success`, … |
| focus | `--color-focus-ring` | `ring-dos` |

Full contract: `design-os/systems/design_tokens.md` · root `AGENTS.md`.

---

## 10. Reference

- Marketing entry: `marketing/DESIGN.md`
- UX gate: `marketing/UX-GATE.md`
- Authority: root `AGENTS.md` + `design-os/INDEX.md`
