import { useMemo, useState } from 'react'
import { FiAlertCircle, FiArrowRight, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from './Section'
import ActionLink from './ActionLink'
import { useLayoutCatalog } from '../../lib/useLayoutCatalog'
import { siteConfig } from '../../site.config'
import { cn } from '../../lib/utils'

/**
 * Product-line layouts gallery — ecommerce_catalog pattern (lite) + UX-GATE §9.
 * Wired for websites | sleek-pages via `collection`.
 * Under ~8 items: no heavy filter chrome; category chips only when useful.
 */

function LayoutCard({ layout, ctaLabel }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-dos-xl border border-subtle bg-surface-raised shadow-sm transition duration-fast ease-dos hover:border-action-primary/30 hover:shadow-md">
      <a
        href={layout.previewUrl}
        target="_blank"
        rel="noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
      >
        <div className="aspect-[16/10] overflow-hidden bg-surface-sunken">
          {layout.image ? (
            <img
              src={layout.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-top transition duration-fast ease-dos group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-meta text-ink-soft">
              Preview image pending
            </div>
          )}
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {layout.category ? (
          <span className="eyebrow text-emerald">{layout.category}</span>
        ) : null}
        <h3 className="display-card mt-2 text-emerald-deep">
          <a
            href={layout.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            {layout.title}
          </a>
        </h3>
        {layout.description ? (
          <p className="mt-2 line-clamp-2 text-meta text-ink-soft">{layout.description}</p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={layout.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-subtle px-4 text-meta font-semibold text-emerald-deep transition hover:border-emerald/40 hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Live preview
            <FiArrowUpRight aria-hidden="true" />
          </a>
          <a
            href={layout.orderUrl}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-action-primary-hover px-4 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
          >
            {ctaLabel}
            <FiArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  )
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-dos-xl border border-subtle bg-surface-raised shadow-sm" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-surface-sunken" />
      <div className="space-y-3 p-6">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-surface-sunken" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-sunken" />
        <div className="h-3 w-full animate-pulse rounded-full bg-surface-sunken" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-surface-sunken" />
      </div>
    </div>
  )
}

export default function LayoutsGallery({
  collection,
  eyebrow = 'Layouts',
  title = 'Browse published layouts',
  intro,
  emptyTitle = 'No layouts in this collection yet',
  emptyBody = 'We are preparing this gallery. Tell us what you need and we will point you to the closest fit — or build it.',
  ctaLabel = 'Order this layout',
  id = 'layouts',
}) {
  const { layouts, state, stale, httpStatus, reload } = useLayoutCatalog({ collection })
  const [category, setCategory] = useState('all')

  const categories = useMemo(() => {
    const set = new Set()
    layouts.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [layouts])

  const showFilters = categories.length > 1
  const filtered = useMemo(() => {
    if (category === 'all') return layouts
    return layouts.filter((item) => item.category === category)
  }, [layouts, category])

  const firstLoad = state === 'idle' || (state === 'loading' && layouts.length === 0)
  const isError = state === 'error'
  const isEmpty = state === 'ready' && layouts.length === 0 && !stale
  const filterEmpty = state === 'ready' && layouts.length > 0 && filtered.length === 0
  const forbidden = httpStatus === 403

  return (
    <Section id={id} className="section-light scroll-mt-24">
      <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />

      <SectionBody>
      {stale ? (
        <div
          role="status"
          className="mb-8 flex flex-col gap-3 rounded-dos-xl border border-status-warning/30 bg-status-warning-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-body text-ink">
            Showing the last loaded layouts — a refresh just failed. You can keep browsing or try again.
          </p>
          <button
            type="button"
            onClick={reload}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-subtle bg-surface-raised px-5 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            <FiRefreshCw aria-hidden="true" />
            Refresh
          </button>
        </div>
      ) : null}

      {showFilters && !isError && !isEmpty ? (
        <div className="mb-8" role="group" aria-label="Filter by category">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
              className={cn(
                'min-h-11 rounded-full border px-4 text-meta font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                category === 'all'
                  ? 'border-emerald/40 bg-action-primary-hover text-cream'
                  : 'border-cream-deep bg-surface-raised text-ink-soft hover:border-emerald/30',
              )}
            >
              All
            </button>
            {categories.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-meta font-semibold capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                  category === value
                    ? 'border-emerald/40 bg-action-primary-hover text-cream'
                    : 'border-cream-deep bg-surface-raised text-ink-soft hover:border-emerald/30',
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-content-muted" aria-live="polite">
            {filtered.length} layout{filtered.length === 1 ? '' : 's'}
            {category !== 'all' ? ` in ${category}` : ''}
          </p>
        </div>
      ) : null}

      <div className={cn(state === 'loading' && layouts.length > 0 && 'opacity-60 transition-opacity duration-fast')}>
        {firstLoad ? (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i}>
                  <CardSkeleton />
                </li>
              ))}
            </ul>
            <p className="sr-only" role="status">
              Loading layouts
            </p>
          </>
        ) : isError ? (
          <div
            className="flex flex-col gap-4 rounded-dos-xl border border-subtle bg-surface-raised p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-accent" />
              <div>
                <p className="font-semibold text-emerald-deep">
                  {forbidden ? 'This gallery is not available right now' : 'We could not load these layouts'}
                </p>
                <p className="mt-1 text-meta text-ink-soft">
                  {forbidden
                    ? 'Access was denied. Contact us and we will share options another way.'
                    : 'The rest of this page still works. Try again, or start a project and we will send links.'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={reload}
                className="inline-flex min-h-11 items-center rounded-full border border-subtle px-5 text-meta font-semibold text-emerald-deep transition hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Try again
              </button>
              <ActionLink href={siteConfig.links.contact} variant="emerald">
                Start a project
                <FiArrowRight aria-hidden="true" />
              </ActionLink>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="rounded-dos-xl border border-subtle bg-surface-raised p-8 shadow-sm sm:p-10">
            <p className="display-card text-emerald-deep">{emptyTitle}</p>
            <p className="mt-3 max-w-measure text-body text-ink-soft">{emptyBody}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionLink href={siteConfig.links.contact} variant="emerald">
                Start a project
                <FiArrowRight aria-hidden="true" />
              </ActionLink>
              {collection === 'sleek-pages' ? (
                <ActionLink href={siteConfig.links.websites} variant="ghostLight">
                  Browse website layouts
                </ActionLink>
              ) : (
                <ActionLink href={siteConfig.links.portfolio} variant="ghostLight">
                  Open full gallery
                </ActionLink>
              )}
            </div>
          </div>
        ) : filterEmpty ? (
          <div className="rounded-dos-xl border border-subtle bg-surface-raised p-8 shadow-sm">
            <p className="display-card text-emerald-deep">No layouts in this category</p>
            <p className="mt-2 text-body text-ink-soft">
              Clear the filter to see all {layouts.length} layout{layouts.length === 1 ? '' : 's'}, or tell us what you need.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-action-primary-hover px-5 text-meta font-semibold text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Clear filter
              </button>
              <ActionLink href={siteConfig.links.contact} variant="ghostLight">
                Start a project
                <FiArrowRight aria-hidden="true" />
              </ActionLink>
            </div>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((layout) => (
              <li key={layout.slug}>
                <LayoutCard layout={layout} ctaLabel={ctaLabel} />
              </li>
            ))}
          </ul>
        )}
      </div>
      </SectionBody>
    </Section>
  )
}
