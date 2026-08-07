import { Section, SectionHeading } from '../site/Section'

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

export default function HowWeWorkSection() {
  return (
    <Section id="process" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="How we work"
        title={
          <>
            A simple process. <em className="italic text-emerald">No surprises.</em>
          </>
        }
      />

      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step) => (
          <li key={step.n} className="relative border-t border-cream-deep pt-8">
            <span className="absolute -top-px left-0 h-px w-12 bg-gold" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-6 select-none font-serif text-[4.5rem] leading-none text-cream-deep"
            >
              {step.n}
            </span>

            <h3 className="display-card relative text-emerald-deep">{step.title}</h3>
            <p className="relative mt-3 text-body text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
