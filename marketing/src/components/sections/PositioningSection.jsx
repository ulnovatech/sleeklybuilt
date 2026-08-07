import { Section, SectionHeading } from '../site/Section'

/**
 * Agency positioning — who we help and the outcome, before product lines.
 * One job: wrong-fit visitors self-select out; right-fit recognise themselves.
 */
export default function PositioningSection() {
  return (
    <Section id="positioning" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="Positioning"
        title="Built for operators who outgrew spreadsheets"
        intro="We help Ugandan businesses and teams that need software they can run day to day — not a brochure site that looks finished and stops there."
      />
    </Section>
  )
}
