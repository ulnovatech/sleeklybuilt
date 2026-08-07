import PageHeader from '../components/site/PageHeader'
import ContactChannelPanel from '../components/site/ContactChannelPanel'
import { Section, SectionHeading } from '../components/site/Section'
import GamifiedContactForm from '../components/forms/GamifiedContactForm'
import { trustCommitments } from '../config/proof'
import { usePageTitle } from '../lib/usePageTitle'

/**
 * Contact — patterns/contact.md + UX-GATE §8.3
 * Mobile: channels first → form. Desktop: form + expectations/channels rail.
 * Confirmation is an in-page form state (not a new route).
 */
export default function ContactPage() {
  usePageTitle("Let's talk")

  return (
    <>
      <PageHeader
        eyebrow="Let's talk"
        title="Have a project in mind?"
        intro="Tell us what you need. We reply within one working day — with a reference you can quote if you follow up."
      />

      <Section className="section-light" id="contact">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:items-start">
          <div className="order-2 lg:order-1">
            <GamifiedContactForm />
          </div>

          <div className="order-1 space-y-12 lg:order-2">
            <ContactChannelPanel />

            <div>
              <SectionHeading eyebrow="What to expect" title="No forms into a void" />
              <dl className="mt-8 space-y-6">
                {trustCommitments.map((item) => (
                  <div key={item.title} className="border-t border-cream-deep pt-5 first:border-t-0 first:pt-0">
                    <dt className="display-card text-emerald-deep">{item.title}</dt>
                    <dd className="mt-2 text-body text-ink-soft">{item.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
