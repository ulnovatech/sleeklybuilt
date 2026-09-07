import PageHeader from '../components/site/PageHeader'
import ContactChannelPanel from '../components/site/ContactChannelPanel'
import { Section } from '../components/site/Section'
import GamifiedContactForm from '../components/forms/GamifiedContactForm'
import { usePageSeo } from '../lib/usePageSeo'

/**
 * Contact — guided form primary; direct channels secondary, separated by Or.
 */
export default function ContactPage() {
  usePageSeo()

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you need"
        intro="One question at a time. We reply within one working day."
      />

      <Section className="section-light scroll-mt-24 py-10 md:py-14" id="contact">
        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
          <div className="min-w-0">
            <GamifiedContactForm />
          </div>

          <div
            className="flex items-center gap-4 lg:flex-col lg:justify-center lg:gap-3 lg:self-stretch lg:pt-16"
            role="separator"
            aria-label="Or choose another way to reach us"
          >
            <span className="h-px flex-1 bg-cream-deep lg:h-16 lg:w-px lg:flex-none" aria-hidden="true" />
            <span className="shrink-0 text-meta font-semibold uppercase tracking-[0.14em] text-content-muted">
              Or
            </span>
            <span className="h-px flex-1 bg-cream-deep lg:h-16 lg:w-px lg:flex-none" aria-hidden="true" />
          </div>

          <div className="min-w-0 max-w-md lg:max-w-none lg:justify-self-stretch">
            <ContactChannelPanel className="lg:sticky lg:top-24" />
          </div>
        </div>
      </Section>
    </>
  )
}
