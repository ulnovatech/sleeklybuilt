import { Section, SectionBody, SectionHeading } from '../site/Section'

const steps = [
  {
    n: '01',
    title: 'Scope',
    body: "One conversation about your business — what's working, what isn't, where you want to be. Then a written plan: what we build, how long it takes, what it costs.",
  },
  {
    n: '02',
    title: 'Build',
    body: 'We build in small, visible pieces. You see progress every week and try things as they grow, so nothing lands as a surprise at the end.',
  },
  {
    n: '03',
    title: 'Support',
    body: 'After launch we stay involved — fixing, improving, and helping the software grow as the business does.',
  },
]

/**
 * Process — quiet step markers; no giant competing numerals (Wave 9 spatial).
 */
export default function HowWeWorkSection() {
  return (
    <Section id="process" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="How we work"
        title="A simple process. No surprises."
        intro="Clear scope, visible build, support after launch — so you always know where things stand."
      />

      <SectionBody>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li key={step.n} className="border-t border-subtle pt-6">
              <span className="text-meta font-semibold tabular-nums text-content-muted">{step.n}</span>
              <h3 className="display-card mt-3 text-emerald-deep">{step.title}</h3>
              <p className="mt-3 max-w-measure text-body text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </SectionBody>
    </Section>
  )
}
