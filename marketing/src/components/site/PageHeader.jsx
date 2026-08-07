import { Eyebrow } from './Section'

/**
 * Obsidian page header. Compact relative to the landing hero — `display-section`
 * rather than `display-hero` — so the homepage keeps the largest type on the site.
 * Top padding clears the fixed 4rem header, which overlays this band.
 */
export default function PageHeader({ eyebrow, title, intro, actions }) {
  return (
    <section className="surface-obsidian pb-14 pt-28 md:pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          {eyebrow ? <Eyebrow tone="invert">{eyebrow}</Eyebrow> : null}
          <h1 className="mt-5 font-serif text-display-section text-cream">{title}</h1>
          {intro ? <p className="lead mt-5 text-cream/70">{intro}</p> : null}
          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
        </div>
      </div>
    </section>
  )
}
