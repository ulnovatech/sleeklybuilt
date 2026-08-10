import { Eyebrow } from './Section'

/**
 * Compact page header for inner routes — not a full marketing hero.
 * Uses display-section so the homepage keeps the largest type.
 * Top padding clears the fixed header overlay.
 *
 * Obsidian budget: this band counts toward the journey’s dark allotment.
 * Keep padding compact; do not stack an extra mid-page dark band on the same route.
 */
export default function PageHeader({ eyebrow, title, intro, actions }) {
  return (
    <section className="surface-obsidian pb-10 pt-24 md:pb-12 md:pt-28">
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <div className="max-w-3xl">
          {eyebrow ? <Eyebrow tone="invert">{eyebrow}</Eyebrow> : null}
          <h1 className="mt-3 font-display text-display-section text-cream">{title}</h1>
          {intro ? <p className="mt-3 max-w-xl text-meta text-cream/70 md:text-body">{intro}</p> : null}
          {actions ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
