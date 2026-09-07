# SleeklyBuilt Design System

**Implementation source of truth:** [`@sleeklybuilt/design-foundation`](../packages/design-foundation)
([tokens](../packages/design-foundation/tokens.css), [Tailwind preset](../packages/design-foundation/tailwind.preset.js),
[styles](../packages/design-foundation/styles/), [DESIGN.md](../packages/design-foundation/DESIGN.md)).

**Active identity:** **Meridian** — precise · calm · capable · premium · human.
Halo / Meridian / Spark / Void. Display: Sora. Body: IBM Plex Sans.

This file is the marketing hub entry. Prefer the package for tokens and primitives;
do not reintroduce hex into `src/index.css` when a semantic role exists.

---

## 1. Color

| Token | Hex | Role |
| --- | --- | --- |
| `halo` (`cream`) | `#f3f5f7` | Page canvas |
| `halo-deep` | `#dce1e8` | Subtle fills |
| `meridian-deep` (`emerald-deep`) | `#0b343c` | Headings on light |
| `meridian` (`emerald`) | `#15656f` | Links, light primary |
| `meridian-soft` | `#458f98` | Soft fills |
| `spark` (`gold`) | `#e35a18` | Single accent / void CTA |
| `spark-soft` | `#ef7b42` | Accent hover |
| `ink` | `#12161d` | Body |
| `ink-soft` | `#596270` | Secondary |
| `void` (`obsidian`) | `#07090d` | Dark bands |
| `void-raised` | `#11151c` | Dark surfaces |
| `void-line` | `#1e2430` | Dark borders |

**60 / 30 / 10:** halo / (ink + meridian) / spark.
Void ≤3× per journey. Spark = one primary action per viewport.
Meridian banned as text on void.

Full narrative, void atmosphere, type, shape, and Design OS binding:
[`packages/design-foundation/DESIGN.md`](../packages/design-foundation/DESIGN.md).

---

## 2. Typography

- **Display:** Sora (`font-display`)
- **Body / UI:** IBM Plex Sans (`font-sans`)
- Loaded from `marketing/index.html`

---

## 3. Shape & motion

- CTAs: `rounded-dos-lg` (not pills)
- Brand glyph: soft square
- Shadows: cool graphite, restrained
- Motion: elegant ease-out

---

## 4. Reference

- Package SoT: [`packages/design-foundation/DESIGN.md`](../packages/design-foundation/DESIGN.md)
- UX gate: [`UX-GATE.md`](./UX-GATE.md)
- Authority: root `AGENTS.md` + `design-os/INDEX.md`
