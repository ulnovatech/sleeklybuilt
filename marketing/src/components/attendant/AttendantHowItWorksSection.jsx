import { Section, SectionBody, SectionHeading } from '../site/Section'

export default function AttendantHowItWorksSection({ howItWorks }) {
  return (
    <Section className="section-light scroll-mt-24" id="how-it-works">
      <SectionHeading eyebrow="Process" title={howItWorks.heading} intro={howItWorks.intro} />
      <SectionBody>
        <ol className="space-y-8 md:space-y-10">
          {howItWorks.steps.map((step, index) => (
            <li
              key={step.id}
              className="grid gap-3 border-t border-subtle pt-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="font-display text-display-card tabular-nums text-emerald/40" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-body font-semibold text-emerald-deep md:text-lead">{step.title}</h3>
                <p className="mt-2 max-w-measure text-body text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionBody>
    </Section>
  )
}
