import { FiAlertCircle, FiArrowRight, FiArrowUpRight } from 'react-icons/fi'
import { Section, SectionHeading } from '../site/Section'
import NavLink from '../layout/NavLink'
import { useLayoutCatalog } from '../../lib/useLayoutCatalog'
import { siteConfig } from '../../site.config'

const SHOWCASE_COUNT = 3

function LayoutCard({ layout }) {
  return (
    <a
      href={layout.previewUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cream-deep bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
    >
      <div className="aspect-[16/10] overflow-hidden bg-cream-deep">
        {layout.image ? (
          <img
            src={layout.image}
            alt={`${layout.title} homepage`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-meta text-ink-soft">
            Preview image pending
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {layout.category ? (
          <span className="eyebrow text-emerald">{layout.category}</span>
        ) : null}

        <h3 className="display-card mt-3 text-emerald-deep">{layout.title}</h3>

        {layout.description ? (
          <p className="mt-2 line-clamp-2 text-meta text-ink-soft">{layout.description}</p>
        ) : null}

        <span className="mt-5 inline-flex items-center gap-1.5 text-meta font-semibold text-emerald-deep transition-colors group-hover:text-gold">
          Open live preview
          <FiArrowUpRight aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  )
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-cream-deep bg-white shadow-sm" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-cream-deep" />
      <div className="space-y-3 p-6">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-cream-deep" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-cream-deep" />
        <div className="h-3 w-full animate-pulse rounded-full bg-cream-deep" />
      </div>
    </div>
  )
}

export default function SelectedWorkSection() {
  const { layouts, state, reload } = useLayoutCatalog({ collection: 'websites' })
  const showcase = layouts.slice(0, SHOWCASE_COUNT)

  return (
    <Section id="work" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="Selected work"
        title={
          <>
            Proof you can <em className="italic text-emerald">point at</em>.
          </>
        }
        intro="Every layout below is published and live. Open one and click through it before you talk to us."
      />

      <div className="mt-12">
        {state === 'error' ? (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-cream-deep bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-gold" />
              <div>
                <p className="font-semibold text-emerald-deep">We couldn&apos;t load the gallery</p>
                <p className="mt-1 text-meta text-ink-soft">
                  The work is still there — browse it directly, or try again.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={reload}
                className="rounded-full border border-emerald-deep/20 px-5 py-2.5 text-meta font-semibold text-emerald-deep transition-colors hover:bg-cream-deep/60"
              >
                Try again
              </button>
              <NavLink
                item={{ href: siteConfig.links.portfolio }}
                className="rounded-full bg-emerald-deep px-5 py-2.5 text-meta font-semibold text-cream transition-colors hover:bg-emerald"
              >
                Open gallery
              </NavLink>
            </div>
          </div>
        ) : state === 'ready' && showcase.length === 0 ? (
          <div className="rounded-2xl border border-cream-deep bg-white p-8 shadow-sm sm:p-10">
            <p className="display-card text-emerald-deep">Nothing published yet</p>
            <p className="mt-3 max-w-measure text-body text-ink-soft">
              Our gallery is being restocked. Tell us what you need and we&apos;ll show you the closest thing
              we&apos;ve built.
            </p>
            <NavLink
              item={{ href: siteConfig.links.contact }}
              className="mt-6 inline-flex items-center gap-2 text-meta font-semibold text-emerald-deep transition-colors hover:text-gold"
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
                      <CardSkeleton />
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
              className="group mt-10 inline-flex items-center gap-2 border-b border-emerald-deep/20 pb-1 text-meta font-semibold text-emerald-deep transition-colors hover:border-gold hover:text-gold"
            >
              View all projects
              <FiArrowRight
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </NavLink>
          </>
        )}
      </div>
    </Section>
  )
}
