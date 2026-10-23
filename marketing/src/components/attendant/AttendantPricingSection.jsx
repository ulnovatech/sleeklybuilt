import { useId } from 'react'
import { FiArrowRight, FiCheck, FiX } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { cn } from '../../lib/utils'

/**
 * One plan + Uganda / International switch (no FX conversion).
 * patterns/pricing.md — single price stated at the decision surface.
 */
export default function AttendantPricingSection({ pricing, regionId, onRegionChange }) {
  const tablistId = useId()
  const regions = Object.values(pricing.regions)
  const region = pricing.regions[regionId] || pricing.regions[pricing.defaultRegion]

  return (
    <Section className="section-light scroll-mt-24 max-lg:pb-20" id="pricing">
      <SectionHeading eyebrow="Pricing" title={pricing.heading} intro={pricing.intro} />
      <SectionBody>
        <div
          className="inline-flex rounded-dos-xl border border-cream-deep bg-surface-raised p-1 shadow-sm"
          role="tablist"
          aria-label="Pricing region"
          id={tablistId}
        >
          {regions.map((item) => {
            const selected = item.id === region.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="attendant-pricing-panel"
                id={`attendant-pricing-tab-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onRegionChange(item.id)}
                onKeyDown={(event) => {
                  const idx = regions.findIndex((r) => r.id === item.id)
                  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault()
                    const delta = event.key === 'ArrowRight' ? 1 : -1
                    const next = regions[(idx + delta + regions.length) % regions.length]
                    onRegionChange(next.id)
                    queueMicrotask(() =>
                      document.getElementById(`attendant-pricing-tab-${next.id}`)?.focus(),
                    )
                  }
                }}
                className={cn(
                  'min-h-11 rounded-dos-lg px-5 py-2.5 text-meta font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                  selected
                    ? 'bg-action-primary-hover text-cream'
                    : 'text-ink-soft hover:text-emerald-deep',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <article
          id="attendant-pricing-panel"
          role="tabpanel"
          aria-labelledby={`attendant-pricing-tab-${region.id}`}
          className="mt-8 max-w-2xl rounded-dos-xl border border-emerald/30 bg-surface-raised p-6 shadow-sm ring-1 ring-emerald/10 sm:p-8"
        >
          <p className="text-eyebrow font-semibold uppercase tracking-[0.12em] text-emerald">
            {pricing.planSummary}
          </p>
          <h3 className="mt-3 font-display text-display-card text-emerald-deep">{pricing.planName}</h3>
          <p className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-display-section text-emerald-deep">{region.displayPrice}</span>
            <span className="text-body text-ink-soft">{region.displayPeriod}</span>
          </p>
          <p className="mt-4 max-w-measure text-body text-ink-soft">{region.paymentNote}</p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h4 className="text-meta font-semibold uppercase tracking-[0.08em] text-content-muted">
                Included
              </h4>
              <ul className="mt-3 space-y-2.5">
                {pricing.included.map((item) => (
                  <li key={item} className="flex gap-2.5 text-body text-ink-soft">
                    <FiCheck className="mt-1 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-meta font-semibold uppercase tracking-[0.08em] text-content-muted">
                Not included
              </h4>
              <ul className="mt-3 space-y-2.5">
                {pricing.exclusions.map((item) => (
                  <li key={item} className="flex gap-2.5 text-body text-ink-soft">
                    <FiX className="mt-1 h-4 w-4 shrink-0 text-content-muted" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <ActionLink href={region.ctaHref} variant="emerald" className="w-full justify-center sm:w-auto">
              {region.ctaLabel}
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
          </div>

          <ul className="mt-6 space-y-2 border-t border-subtle pt-5">
            {pricing.footnotes.map((note) => (
              <li key={note} className="text-meta text-content-muted">
                {note}
              </li>
            ))}
          </ul>
        </article>
      </SectionBody>
    </Section>
  )
}
