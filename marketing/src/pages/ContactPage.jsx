import PageHeader from '../components/site/PageHeader'
import ContactChannelPanel from '../components/site/ContactChannelPanel'
import { Section } from '../components/site/Section'
import GamifiedContactForm from '../components/forms/GamifiedContactForm'
import { usePageTitle } from '../lib/usePageTitle'

/**
 * Contact — conversation first; channels as escape hatch.
 * Compact header avoids stacking “Let’s talk” three times with the form.
 */
export default function ContactPage() {
  usePageTitle("Let's talk")

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you need"
        intro="One question at a time. We reply within one working day."
      />

      <Section className="section-light py-10 md:py-14" id="contact">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <GamifiedContactForm />
          <ContactChannelPanel className="lg:sticky lg:top-24" />
        </div>
      </Section>
    </>
  )
}
