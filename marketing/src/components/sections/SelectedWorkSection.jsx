import { FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from '../site/Section'
import NavLink from '../layout/NavLink'
import LayoutCard, { LayoutCardSkeleton } from '../site/LayoutCard'
import { useLayoutCatalog } from '../../lib/useLayoutCatalog'
import { siteConfig } from '../../site.config'

const SHOWCASE_COUNT = 3

/**
 * Selected work — live layouts only. Quiet title; proof you can open.
 */
export default function SelectedWorkSection() {
  const { layouts, state, reload } = useLayoutCatalog({ collection: 'websites' })
  const showcase = layouts.slice(0, SHOWCASE_COUNT)

  return (
    <Section id="work" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="Selected work"
        title="Proof you can point at"
        intro="Every layout below is published and live. Open one and click through it before you talk to us."
      />

      <SectionBody>
        {state === 'error' ? (
          <div className="flex flex-col items-start gap-4 rounded-dos-xl border border-subtle bg-surface-raised p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-accent" />
              <div>
                <p className="font-semibold text-emerald-deep">We couldn&apos;t load the gallery</p>
                <p className="mt-1 text-meta text-ink-soft">The work is still there — browse it directly, or try again.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={reload}
                className="min-h-11 rounded-full border border-subtle px-5 py-2.5 text-meta font-semibold text-emerald-deep transition duration-fast ease-dos hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Try again
              </button>
              <NavLink
                item={{ href: siteConfig.links.portfolio }}
                className="inline-flex min-h-11 items-center rounded-full bg-action-primary-hover px-5 py-2.5 text-meta font-semibold text-cream transition duration-fast ease-dos hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Open gallery
              </NavLink>
            </div>
          </div>
        ) : state === 'ready' && showcase.length === 0 ? (
          <div className="rounded-dos-xl border border-subtle bg-surface-raised p-8 shadow-sm sm:p-10">
            <p className="display-card text-emerald-deep">Nothing published yet</p>
            <p className="mt-3 max-w-measure text-body text-ink-soft">
              Our gallery is being restocked. Tell us what you need and we&apos;ll show you the closest thing we&apos;ve
              built.
            </p>
            <NavLink
              item={{ href: siteConfig.links.contact }}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-meta font-semibold text-emerald-deep transition duration-fast ease-dos hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              Start a project
              <FiArrowRight aria-hidden="true" />
            </NavLink>
          </div>
        ) : (
          <>
            <ul className="grid gap-6 md:grid-cols-3">
              {state === 'ready'
                ? showcase.map((layout) => (
                    <li key={layout.slug}>
                      <LayoutCard layout={layout} />
                    </li>
                  ))
                : Array.from({ length: SHOWCASE_COUNT }, (_, i) => (
                    <li key={i}>
                      <LayoutCardSkeleton />
                    </li>
                  ))}
            </ul>

            {state === 'loading' ? (
              <p className="sr-only" role="status">
                Loading published work
              </p>
            ) : null}

            <NavLink
              item={{ href: siteConfig.links.portfolio }}
              className="group mt-10 inline-flex min-h-11 items-center gap-2 border-b border-emerald-deep/20 pb-1 text-meta font-semibold text-emerald-deep transition duration-fast ease-dos hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              View all projects
              <FiArrowRight
                aria-hidden="true"
                className="transition duration-fast ease-dos group-hover:translate-x-0.5"
              />
            </NavLink>
          </>
        )}
      </SectionBody>
    </Section>
  )
}
