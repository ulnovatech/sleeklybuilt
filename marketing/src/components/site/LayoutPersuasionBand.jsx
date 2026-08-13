import { FiArrowDown } from 'react-icons/fi'
import { layoutPersuasionCopy } from '../../config/galleryPersuasion'
import { Eyebrow } from './Section'

/**
 * Layout-first persuasion — one job: pull visitors toward choosing a layout
 * instead of imagining a blank / ugly build. feature_sections translation layer.
 */
export default function LayoutPersuasionBand({
  eyebrow = layoutPersuasionCopy.eyebrow,
  title = layoutPersuasionCopy.title,
  body = layoutPersuasionCopy.body,
  ctaLabel = layoutPersuasionCopy.ctaLabel,
  ctaHref = layoutPersuasionCopy.ctaHref,
}) {
  return (
    <div className="mb-10 border-b border-subtle pb-10 md:mb-12 md:pb-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="display-card mt-4 max-w-2xl text-emerald-deep">{title}</h3>
      <p className="mt-3 max-w-measure text-body text-ink-soft">{body}</p>
      <a
        href={ctaHref}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-meta font-semibold text-emerald transition hover:text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
      >
        {ctaLabel}
        <FiArrowDown aria-hidden="true" />
      </a>
    </div>
  )
}
