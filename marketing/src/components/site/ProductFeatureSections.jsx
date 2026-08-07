import { Section } from '../site/Section'
import { cn } from '../../lib/utils'

/**
 * Feature sections Variant A — outcome headings, text before visual,
 * max four sections (design-os/patterns/feature_sections.md).
 * Visual column uses a large numeral when no media is supplied — never a fabricated mockup.
 */
export default function ProductFeatureSections({ features = [], eyebrow = 'What you get' }) {
  if (!features.length) return null

  return (
    <Section className="section-light scroll-mt-24" id="features">
      <p className="eyebrow">{eyebrow}</p>

      <ul className="mt-10 space-y-16 md:mt-12 md:space-y-24">
        {features.map((feature, index) => {
          const odd = index % 2 === 1
          return (
            <li
              key={feature.title}
              className="grid items-start gap-8 md:grid-cols-2 md:gap-14 lg:gap-20"
            >
              <div className={cn(odd && 'md:order-2')}>
                <h2 className="display-section text-emerald-deep">{feature.title}</h2>
                <p className="mt-5 max-w-measure text-body text-ink-soft">{feature.body}</p>
                {feature.points?.length ? (
                  <ul className="mt-6 space-y-3">
                    {feature.points.map((point) => (
                      <li key={point} className="flex gap-3 text-body text-ink-soft">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-soft" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div
                className={cn(
                  'relative flex min-h-[12rem] items-end overflow-hidden rounded-2xl border border-cream-deep bg-surface-sunken p-8 md:min-h-[16rem]',
                  odd && 'md:order-1',
                )}
                aria-hidden="true"
              >
                <span className="font-serif text-[6rem] leading-none text-cream-deep md:text-[7.5rem]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
