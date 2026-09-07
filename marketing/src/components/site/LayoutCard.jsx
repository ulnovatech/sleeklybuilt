import { FiArrowUpRight } from 'react-icons/fi'
import { cn } from '../../lib/utils'

/**
 * Shared layout card for home showcase and product galleries.
 * Dual desktop + mobile thumbs when mobileImage exists (no device frames).
 */
export default function LayoutCard({ layout, className = '' }) {
  const dual = Boolean(layout.image && layout.mobileImage)

  return (
    <a
      href={layout.previewUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group build-rail flex h-full flex-col overflow-hidden rounded-dos-xl border border-subtle bg-surface-raised shadow-sm transition duration-fast ease-dos hover:border-action-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2',
        className,
      )}
    >
      {dual ? (
        <div
          className="grid grid-cols-[1.55fr_0.7fr] gap-2 bg-surface-sunken p-2 sm:gap-3 sm:p-3"
          aria-label={`${layout.title} desktop and mobile previews`}
        >
          <div className="overflow-hidden rounded-dos-lg bg-surface-base shadow-sm">
            <img
              src={layout.image}
              alt={`${layout.title} desktop homepage`}
              loading="lazy"
              className="aspect-[16/10] h-full w-full object-cover object-top transition duration-normal ease-dos group-hover:scale-[1.02]"
            />
          </div>
          <div className="overflow-hidden rounded-dos-lg bg-surface-base shadow-sm">
            <img
              src={layout.mobileImage}
              alt={`${layout.title} mobile homepage`}
              loading="lazy"
              className="mx-auto aspect-[9/16] h-full max-h-[11.5rem] w-auto object-cover object-top transition duration-normal ease-dos group-hover:scale-[1.02] sm:max-h-[13rem]"
            />
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] overflow-hidden bg-surface-sunken">
          {layout.image ? (
            <img
              src={layout.image}
              alt={`${layout.title} homepage`}
              loading="lazy"
              className="h-full w-full object-cover object-top transition duration-normal ease-dos group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-meta text-ink-soft">
              Preview image pending
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {layout.category ? <span className="eyebrow text-emerald">{layout.category}</span> : null}

        <h3 className="display-card mt-3 text-emerald-deep">{layout.title}</h3>

        {layout.description ? (
          <p className="mt-2 line-clamp-2 text-meta text-ink-soft">{layout.description}</p>
        ) : null}

        <span className="mt-5 inline-flex items-center gap-1.5 text-meta font-semibold text-emerald-deep transition duration-fast ease-dos group-hover:text-accent">
          Open live preview
          <FiArrowUpRight
            aria-hidden="true"
            className="transition duration-fast ease-dos group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  )
}

export function LayoutCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-dos-xl border border-subtle bg-surface-raised shadow-sm" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-surface-sunken" />
      <div className="space-y-3 p-6">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-surface-sunken" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-sunken" />
        <div className="h-3 w-full animate-pulse rounded-full bg-surface-sunken" />
      </div>
    </div>
  )
}
