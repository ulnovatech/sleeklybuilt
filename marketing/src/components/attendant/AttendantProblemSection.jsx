import { Section, SectionBody, SectionHeading } from '../site/Section'

/** Problem prose — not a card grid (ATTENDANT-UX-GATE). */
export default function AttendantProblemSection({ problem }) {
  return (
    <Section className="section-light scroll-mt-24" id="problem">
      <SectionHeading eyebrow="The problem" title={problem.heading} intro={problem.intro} />
      <SectionBody>
        <ol className="max-w-3xl space-y-8 border-t border-subtle pt-8 md:space-y-10">
          {problem.scenarios.map((scenario, index) => (
            <li key={scenario.id} className="grid gap-2 sm:grid-cols-[3rem_1fr] sm:gap-6">
              <span className="text-meta font-semibold tabular-nums text-content-muted" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-body font-semibold text-emerald-deep">{scenario.title}</h3>
                <p className="mt-2 max-w-measure text-body text-ink-soft">{scenario.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionBody>
    </Section>
  )
}
