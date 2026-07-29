import { Section, SectionHeading } from '../site/Section'

const steps = [
  {
    n: '01',
    title: 'Listen',
    body: "We start with your business — what's working, what isn't, and where you'd like to be.",
  },
  {
    n: '02',
    title: 'Plan',
    body: "We write down what we'll build, how long it'll take, and what it'll cost. In plain language.",
  },
  {
    n: '03',
    title: 'Build',
    body: 'We build in small, visible pieces. You see progress every week and try things as they grow.',
  },
  {
    n: '04',
    title: 'Support',
    body: 'After launch we stay around — fixing, improving, and helping the software grow with you.',
  },
]

export default function ProcessSection() {
  return (
    <Section className="scroll-mt-24 py-16 md:py-24" id="process">
      <SectionHeading
        eyebrow="How we work"
        title={
          <>
            A simple process. <em className="italic text-emerald">No surprises.</em>
          </>
        }
        intro="We've worked hard to keep our process honest and easy to follow. You always know what we're doing and why."
        align="center"
        className="mx-auto"
      />

      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-cream-deep bg-cream-deep md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <li key={step.n} className="flex flex-col gap-4 bg-cream p-8 sm:p-9">
            <div className="flex items-center gap-3">
              <span className="serif text-2xl text-gold">{step.n}</span>
              <span className="h-px flex-1 bg-cream-deep" aria-hidden="true" />
            </div>
            <div className="serif text-xl text-emerald-deep sm:text-2xl">{step.title}</div>
            <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
