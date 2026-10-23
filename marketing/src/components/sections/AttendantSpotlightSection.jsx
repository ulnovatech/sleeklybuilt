import { FiArrowRight } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { attendantProduct } from '../../config/attendantProduct'

/** Compact light-surface preview — labelled illustration, not a live session. */
function SpotlightPreview() {
  return (
    <figure
      className="overflow-hidden rounded-dos-xl border border-subtle bg-surface-raised shadow-sm"
      aria-label="Illustration of Sleekly Attendant chat"
    >
      <div className="flex items-center gap-2 border-b border-subtle bg-surface-sunken px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-content-muted/40" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-content-muted/40" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-content-muted/40" aria-hidden="true" />
        <span className="ml-2 truncate text-[0.65rem] text-content-muted">yourbusiness.com</span>
      </div>
      <div className="space-y-2.5 p-4">
        <div className="max-w-[90%] rounded-dos-lg rounded-tl-sm bg-surface-sunken px-3 py-2 text-meta text-ink-soft">
          Which service fits a small clinic?
        </div>
        <div className="ml-auto max-w-[90%] rounded-dos-lg rounded-tr-sm bg-gold px-3 py-2 text-meta text-obsidian">
          A multi-page website with services and WhatsApp is usually enough — want me to open Websites?
        </div>
      </div>
      <figcaption className="border-t border-subtle px-4 py-2 text-meta text-content-muted">
        Illustration — not a live chat session
      </figcaption>
    </figure>
  )
}

/**
 * Homepage discovery for Sleekly Attendant — after What we build.
 * Does not alter the four build-line grid (subscription, not a build line).
 */
export default function AttendantSpotlightSection() {
  const { spotlight } = attendantProduct

  return (
    <Section id="sleekly-attendant" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="Also from SleeklyBuilt"
        title={spotlight.name}
        intro={spotlight.benefit}
      />

      <SectionBody>
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="max-w-xl">
            <p className="text-body text-ink-soft">
              An AI attendant for your website — answers visitors, guides them to the right pages, and
              captures enquiries. We set it up with you.
            </p>
            <div className="mt-6">
              <ActionLink href={spotlight.href} variant="emerald">
                {spotlight.ctaLabel}
                <FiArrowRight aria-hidden="true" />
              </ActionLink>
            </div>
          </div>
          <SpotlightPreview />
        </div>
      </SectionBody>
    </Section>
  )
}
