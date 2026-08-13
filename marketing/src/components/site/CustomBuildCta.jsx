import { FiArrowRight } from 'react-icons/fi'
import ActionLink from './ActionLink'
import { customBuildCopy } from '../../config/galleryPersuasion'
import { Eyebrow } from './Section'

/**
 * Escape hatch after browsing — custom build when no layout shelf fits.
 * Quieter than ContactCtaBand so it does not compete with the primary end CTA.
 */
export default function CustomBuildCta({
  eyebrow = customBuildCopy.eyebrow,
  title = customBuildCopy.title,
  body = customBuildCopy.body,
  ctaLabel = customBuildCopy.ctaLabel,
  ctaHref = customBuildCopy.ctaHref,
  className = '',
}) {
  return (
    <div
      className={`mt-12 rounded-dos-xl border border-subtle bg-surface-raised px-6 py-8 sm:px-8 sm:py-10 md:mt-16 ${className}`}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="display-card mt-4 max-w-2xl text-emerald-deep">{title}</h3>
      <p className="mt-3 max-w-measure text-body text-ink-soft">{body}</p>
      <div className="mt-6">
        <ActionLink href={ctaHref} variant="emerald">
          {ctaLabel}
          <FiArrowRight aria-hidden="true" />
        </ActionLink>
      </div>
    </div>
  )
}
