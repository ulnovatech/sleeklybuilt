import { Section, SectionBody } from './Section'
import { cn } from '../../lib/utils'

/**
 * Feature sections Variant A — outcome headings, text before visual,
 * max four sections (design-os/patterns/feature_sections.md).
 * Quiet index mark when no media — never a fabricated mockup or giant numeral block.
 */
export default function ProductFeatureSections({ features = [], eyebrow = 'What you get' }) {
  if (!features.length) return null

  return (
    <Section className="section-light scroll-mt-24" id="features">
      <p className="eyebrow">{eyebrow}</p>

      <SectionBody>
        <ul className="space-y-16 md:space-y-24">
          {features.map((feature, index) => {
            const odd = index % 2 === 1
            return (
              <li key={feature.title} className="grid items-start gap-8 md:grid-cols-2 md:gap-14 lg:gap-16">
                <div className={cn(odd && 'md:order-2')}>
                  <p className="text-meta font-semibold tabular-nums text-content-muted" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className="display-section mt-3 text-emerald-deep">{feature.title}</h2>
                  <p className="mt-4 max-w-measure text-body text-ink-soft md:mt-5">{feature.body}</p>
                  {feature.points?.length ? (
                    <ul className="mt-6 space-y-3">
                      {feature.points.map((point) => (
                        <li key={point} className="flex gap-3 text-body text-ink-soft">
                          <span
                            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-action-soft"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div
                  className={cn(
                    'relative min-h-[10rem] overflow-hidden rounded-dos-xl border border-subtle bg-surface-sunken md:min-h-[14rem]',
                    odd && 'md:order-1',
                  )}
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(63,122,98,0.12),transparent_55%)]" />
                </div>
              </li>
            )
          })}
        </ul>
      </SectionBody>
    </Section>
  )
}
