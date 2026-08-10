import { FiArrowRight } from 'react-icons/fi'
import ActionLink from './ActionLink'
import { siteConfig } from '../../site.config'

/**
 * End-of-page conversion band for product routes.
 * Emerald surface (not obsidian) so it does not burn the dark-band budget.
 * One primary CTA — Start a project.
 */
export default function ContactCtaBand({
  title = 'Have a project in mind?',
  body = "Tell us what you're looking for. We'll reply within one working day.",
  ctaHref = siteConfig.links.contact,
  ctaLabel = 'Start a project',
}) {
  return (
    <section className="section-light" aria-labelledby="contact-cta-heading">
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <div className="rounded-dos-xl bg-action-primary-hover px-8 py-12 text-content-inverse md:px-12 md:py-14">
          <div className="grid items-end gap-8 md:grid-cols-[1.4fr_auto] md:gap-10">
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.12em] text-cream/70">Let&apos;s talk</p>
              <h2 id="contact-cta-heading" className="display-section mt-4 max-w-2xl text-content-inverse">
                {title}
              </h2>
              <p className="lead mt-4 text-cream/75">{body}</p>
            </div>
            <ActionLink
              href={ctaHref}
              variant="gold"
              className="w-full justify-center focus-visible:ring-offset-emerald-deep sm:w-auto"
            >
              {ctaLabel}
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  )
}
