import { Section, SectionHeading } from '../site/Section'

const problems = [
  {
    title: 'Too many tools, nothing that fits',
    body: 'Spreadsheets, WhatsApp threads and half-finished apps fight each other. We replace the mess with one system that matches how you actually work.',
  },
  {
    title: 'A site that does not bring customers',
    body: 'Pretty is not enough. We ship layouts and websites structured for search, contact and Mobile Money — so visitors can act.',
  },
  {
    title: 'Software that dies after launch',
    body: 'You need someone who stays. We scope clearly, build in visible pieces, and support after go-live.',
  },
]

/**
 * Problems we solve — agency_website IA.
 * Headings name the problem; body states the outcome.
 */
export default function ProblemsWeSolveSection() {
  return (
    <Section id="problems" className="scroll-mt-24 pb-20 md:pb-28">
      <SectionHeading
        eyebrow="Problems we solve"
        title="Where teams get stuck — and what changes"
      />

      <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
        {problems.map((item, index) => (
          <li key={item.title} className="border-t border-cream-deep pt-6">
            <span className="eyebrow text-gold" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="display-card mt-4 text-emerald-deep">{item.title}</h3>
            <p className="mt-3 text-body text-ink-soft">{item.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
