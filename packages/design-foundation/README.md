# `@sleeklybuilt/design-foundation`

Shared **public** Design OS foundation for SleeklyBuilt customer apps (marketing, portfolio, blog).

Hex and semantic roles live here. New public UI must use semantic tokens / package primitives — no new raw hex when a role exists.

Governing Design OS: `design-os/INDEX.md` → `systems/design_tokens.md`, `color_system.md`, `typography_system.md`, `spacing_system.md`. Visual narrative: [`DESIGN.md`](./DESIGN.md).

---

## Install

```json
"@sleeklybuilt/design-foundation": "file:../packages/design-foundation"
```

Peer: `react` / `react-dom` ≥ 18.

---

## CSS

In the app entry stylesheet (after Tailwind layers so `@apply` resolves):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '@sleeklybuilt/design-foundation/styles/foundation.css';
```

Or import pieces: `tokens.css`, `styles/base.css`, `styles/components.css`, `styles/surface-obsidian.css`.

---

## Tailwind

```js
import foundationPreset from '@sleeklybuilt/design-foundation/tailwind-preset'

export default {
  presets: [foundationPreset],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sleeklybuilt/design-foundation/src/**/*.{js,jsx}',
  ],
}
```

---

## React

```js
import {
  cn,
  bindFocusTrap,
  ActionLink,
  Button,
  BrandMark,
  SurfaceCard,
  BulletList,
  StatusBanner,
} from '@sleeklybuilt/design-foundation/react'
```

`ActionLink` / `BrandMark` accept `LinkComponent` so each SPA can inject its router (marketing uses `NavLink`; portfolio/blog use their own).
`BrandMark` accepts optional `logoSrc` (transparent mark PNG); otherwise it falls back to a letter tile.

### ActionLink variants

| Variant | Surface | Role |
| --- | --- | --- |
| `gold` (spark) | Void | Primary CTA (one spark per viewport) |
| `ghostDark` | Void | Secondary |
| `emerald` (meridian) | Halo | Primary on light |
| `ghostLight` | Halo | Secondary on light |

---

## Rules

- Prefer `bg-surface-*`, `text-content-*`, `bg-action-*`, `ring-dos` over brand hex classes in new UI.
- Spark is one primary action per viewport.
- Focus rings are never meridian or spark.
- Void bands: hero + one mid emphasis + footer (see DESIGN.md).
- Identity: **Meridian** — Halo / Meridian / Spark / Void · Sora + IBM Plex Sans.