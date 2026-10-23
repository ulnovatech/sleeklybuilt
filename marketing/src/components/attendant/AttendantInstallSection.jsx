import { Section, SectionBody, SectionHeading } from '../site/Section'
import { cn } from '../../lib/utils'

export default function AttendantInstallSection({ installation }) {
  return (
    <Section className="section-light scroll-mt-24" id="installation">
      <SectionHeading eyebrow="Installation" title={installation.heading} intro={installation.intro} />
      <SectionBody>
        <ul className="grid gap-4 md:grid-cols-2">
          {installation.options.map((option) => {
            const unavailable = option.status === 'unavailable'
            return (
              <li
                key={option.id}
                className={cn(
                  'rounded-dos-xl border p-5 sm:p-6',
                  unavailable
                    ? 'border-subtle bg-surface-sunken'
                    : 'border-subtle bg-surface-raised',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-body font-semibold text-emerald-deep">{option.title}</h3>
                  <span
                    className={cn(
                      'inline-flex min-h-8 items-center rounded-dos-md border px-2.5 text-meta font-semibold',
                      unavailable
                        ? 'border-subtle bg-surface-base text-content-muted'
                        : 'border-emerald/25 bg-status-success-surface text-status-success',
                    )}
                  >
                    {option.statusLabel}
                  </span>
                </div>
                <p className="mt-3 text-body text-ink-soft">{option.body}</p>
              </li>
            )
          })}
        </ul>
      </SectionBody>
    </Section>
  )
}
