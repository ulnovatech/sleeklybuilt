import { useState } from 'react'

/**
 * Gallery card — desktop + mobile pair when main-mobile.png exists (no device frames).
 * Falls back to a single featured image for older templates.
 */
export default function PortfolioCard({
  title,
  description,
  mainImage,
  mobileImage = null,
  thumbnails = [],
  link,
}) {
  const [featured, setFeatured] = useState(mainImage)
  const dual = Boolean(mainImage && mobileImage)
  const pageThumbs = (thumbnails || []).filter((img) => {
    const name = String(img).split('/').pop() || ''
    return name !== 'main-mobile.png'
  })

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border border-subtle bg-surface-raised shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
      onClick={(e) => e.stopPropagation()}
    >
      {dual ? (
        <div
          className="grid grid-cols-[1.55fr_0.7fr] gap-2 bg-surface-sunken p-2 sm:gap-3 sm:p-3"
          aria-label={`${title} desktop and mobile previews`}
        >
          <img
            src={mainImage}
            alt={`${title} — desktop`}
            className="h-36 w-full rounded-lg object-cover object-top shadow-sm sm:h-44"
            loading="lazy"
          />
          <img
            src={mobileImage}
            alt={`${title} — mobile`}
            className="mx-auto h-36 w-auto max-w-full rounded-lg object-cover object-top shadow-sm sm:h-44"
            loading="lazy"
          />
        </div>
      ) : featured ? (
        <img
          src={featured}
          alt={title}
          className="h-40 w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="grid h-40 place-items-center bg-surface-sunken text-sm text-content-muted">
          Preview pending
        </div>
      )}

      {!dual && pageThumbs.length > 1 ? (
        <div className="mt-2 flex justify-center gap-2 px-2">
          {pageThumbs.map((img, idx) => (
            <button
              key={img}
              type="button"
              className={`h-12 w-16 overflow-hidden rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-dos ${
                featured === img ? 'ring-2 ring-action-primary' : ''
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setFeatured(img)
              }}
              aria-label={`Show preview ${idx + 1}`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="p-4">
        <h2 className="font-display text-lg font-semibold text-emerald-deep">{title}</h2>
        <p className="mt-1 text-sm text-content-secondary">{description}</p>
        <p className="mt-2 text-sm font-medium text-content-link">Open live preview</p>
      </div>
    </a>
  )
}
