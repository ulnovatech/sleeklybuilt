import { Section, SectionBody, SectionHeading } from '../site/Section'

export default function AttendantTrustSection({ trust }) {
  return (
    <Section className="section-light scroll-mt-24" id="trust">
      <SectionHeading eyebrow="Trust" title={trust.heading} intro={trust.intro} />
      <SectionBody className="space-y-10">
        <div className="max-w-3xl">
          <h3 className="text-body font-semibold text-emerald-deep">{trust.knows.title}</h3>
          <p className="mt-2 max-w-measure text-body text-ink-soft">{trust.knows.body}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-body font-semibold text-emerald-deep">{trust.can.title}</h3>
            <ul className="mt-3 space-y-2.5">
              {trust.can.items.map((item) => (
                <li key={item} className="flex gap-3 text-body text-ink-soft">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-action-soft" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-body font-semibold text-emerald-deep">{trust.cannot.title}</h3>
            <ul className="mt-3 space-y-2.5">
              {trust.cannot.items.map((item) => (
                <li key={item} className="flex gap-3 text-body text-ink-soft">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-content-muted" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-3xl rounded-dos-xl border border-subtle bg-surface-raised p-5 sm:p-6">
          <h3 className="text-body font-semibold text-emerald-deep">{trust.human.title}</h3>
          <p className="mt-2 max-w-measure text-body text-ink-soft">{trust.human.body}</p>
        </div>
      </SectionBody>
    </Section>
  )
}
