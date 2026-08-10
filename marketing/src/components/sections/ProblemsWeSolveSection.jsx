import { Section, SectionBody, SectionHeading } from '../site/Section'

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
 * Quiet index marks — no giant decorative numerals.
 */
export default function ProblemsWeSolveSection() {
  return (
    <Section id="problems" className="section-light scroll-mt-24">
      <SectionHeading eyebrow="Problems we solve" title="Where teams get stuck — and what changes" />

      <SectionBody>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {problems.map((item, index) => (
            <li key={item.title} className="border-t border-subtle pt-6">
              <span className="text-meta font-semibold tabular-nums text-content-muted" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="display-card mt-3 text-emerald-deep">{item.title}</h3>
              <p className="mt-3 max-w-measure text-body text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ol>
      </SectionBody>
    </Section>
  )
}
