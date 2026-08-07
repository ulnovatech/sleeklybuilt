import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { siteConfig } from '../../site.config'

export default function ContactCtaBand({
  title = 'Have a project in mind?',
  body = "Tell us what you're looking for. We'll reply within one working day.",
  ctaHref = siteConfig.links.contact,
  ctaLabel = 'Start a project',
}) {
  return (
    <section className="py-16 md:py-20" aria-labelledby="contact-cta-heading">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl bg-emerald-deep px-8 py-14 text-cream md:px-14 md:py-20">
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid items-end gap-10 md:grid-cols-[1.4fr_auto]">
            <div>
              <div className="eyebrow mb-5 text-gold">Let&apos;s talk</div>
              <h2 id="contact-cta-heading" className="display-section max-w-2xl">
                {title}
              </h2>
              <p className="lead mt-5 text-cream/75">{body}</p>
            </div>
            <Link
              to={ctaHref}
              className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full bg-cream px-7 py-4 text-meta font-semibold text-emerald-deep transition-colors hover:bg-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-deep"
            >
              {ctaLabel}
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
