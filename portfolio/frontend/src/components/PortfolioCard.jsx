import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Layout card — surface / border / emerald action tokens (Wave 9 Phase E).
 */
export default function PortfolioCard({ templateName, title, description, mainImage, thumbnails, link }) {
  const [featured, setFeatured] = useState(mainImage)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-surface-raised shadow-sm transition hover:border-action-primary/30 hover:shadow-md">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dos"
      >
        {featured ? <img src={featured} alt={title} className="h-40 w-full object-cover" /> : null}
      </a>

      {thumbnails && thumbnails.length > 1 ? (
        <div className="mt-2 flex justify-center gap-2 px-2">
          {thumbnails.map((img, idx) => (
            <button
              key={img}
              type="button"
              className={`h-12 w-16 overflow-hidden rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-dos ${
                featured === img ? 'ring-2 ring-emerald' : 'ring-1 ring-subtle'
              }`}
              onClick={() => setFeatured(img)}
              aria-label={`${title} thumbnail ${idx + 1}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dos"
      >
        <h2 className="font-display text-display-card text-emerald-deep">{title}</h2>
        <p className="mt-1 text-meta text-ink-soft">{description}</p>
        <p className="mt-3 text-meta font-semibold text-emerald">Open live preview →</p>
      </a>

      <div className="mt-auto border-t border-subtle bg-surface-sunken p-4">
        <Link
          to={`/order?template=${encodeURIComponent(templateName)}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-action-primary-hover px-4 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
        >
          Choose this layout
        </Link>
      </div>
    </article>
  )
}
