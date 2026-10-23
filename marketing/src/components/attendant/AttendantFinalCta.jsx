import { FiArrowRight } from 'react-icons/fi'
import ActionLink from '../site/ActionLink'

/** Product-specific end band — not the generic agency “Start a project”. */
export default function AttendantFinalCta({ finalCta, region }) {
  return (
    <section className="section-light max-lg:pb-20" aria-labelledby="attendant-final-cta-heading">
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <div className="rounded-dos-xl bg-action-primary-hover px-8 py-12 text-content-inverse md:px-12 md:py-14">
          <div className="grid items-end gap-8 md:grid-cols-[1.4fr_auto] md:gap-10">
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.12em] text-cream/70">
                Sleekly Attendant
              </p>
              <h2 id="attendant-final-cta-heading" className="display-section mt-4 max-w-2xl text-content-inverse">
                {finalCta.heading}
              </h2>
              <p className="lead mt-4 text-cream/75">{finalCta.body}</p>
              <p className="mt-3 max-w-measure text-meta text-cream/55">{region.paymentNote}</p>
            </div>
            <ActionLink
              href={region.ctaHref}
              variant="gold"
              className="w-full justify-center focus-visible:ring-offset-emerald-deep sm:w-auto"
            >
              {region.ctaLabel}
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  )
}
