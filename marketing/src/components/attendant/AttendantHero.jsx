import { FiArrowRight } from 'react-icons/fi'
import { Eyebrow } from '../site/Section'
import ActionLink from '../site/ActionLink'
import AttendantHeroVisual from './AttendantHeroVisual'

/**
 * Product hero — category, tagline, outcome, CTAs + illustration.
 * patterns/hero_sections.md: one primary action; secondary is low-commitment.
 */
export default function AttendantHero({ hero, primaryCta, paymentReassurance }) {
  return (
    <section
      id="hero"
      data-attendant-section="hero"
      className="surface-obsidian scroll-mt-24 pb-12 pt-24 md:pb-16 md:pt-28"
    >
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="max-w-xl">
            <Eyebrow tone="invert">{hero.eyebrow}</Eyebrow>
            <h1 className="mt-4 font-display text-display-section text-cream">{hero.tagline}</h1>
            <p className="mt-4 max-w-measure text-body text-cream/80 md:text-lead">{hero.headline}</p>
            <p className="mt-3 max-w-measure text-meta text-cream/65">{hero.outcome}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionLink href={primaryCta.href}>
                {primaryCta.label}
                <FiArrowRight aria-hidden="true" />
              </ActionLink>
              <ActionLink href={hero.secondaryCta.href} variant="ghostDark">
                {hero.secondaryCta.label}
              </ActionLink>
            </div>
            {paymentReassurance ? (
              <p className="mt-4 max-w-measure text-meta text-cream/50">{paymentReassurance}</p>
            ) : null}
          </div>
          <AttendantHeroVisual />
        </div>
      </div>
    </section>
  )
}
