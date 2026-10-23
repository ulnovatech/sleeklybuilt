import { useId, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from '../site/Section'
import { cn } from '../../lib/utils'

/**
 * Demo: Try it live opens the global attendant (openWithPrompt).
 * Illustration steps respect reduced motion.
 */
export default function AttendantDemoSection({ demo, onTryLive }) {
  const reducedMotion = useReducedMotion()
  const steps = demo.illustration.steps
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]
  const labelId = useId()
  const panelId = useId()

  const go = (next) => {
    setStepIndex((current) => {
      const raw = typeof next === 'number' ? next : current + next
      if (raw < 0) return steps.length - 1
      if (raw >= steps.length) return 0
      return raw
    })
  }

  return (
    <Section className="section-light scroll-mt-24" id="demo">
      <SectionHeading eyebrow="Demonstration" title={demo.heading} intro={demo.intro} />
      <SectionBody className="space-y-12 md:space-y-16">
        <div className="rounded-dos-xl border border-subtle bg-surface-raised p-6 sm:p-8">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.12em] text-emerald">
            {demo.live.badge}
          </p>
          <h3 className="mt-3 font-display text-display-card text-emerald-deep">{demo.live.label}</h3>
          <p className="mt-3 max-w-measure text-body text-ink-soft">{demo.live.disclosure}</p>
          <button
            type="button"
            onClick={onTryLive}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-dos-lg bg-action-primary-hover px-5 py-2.5 text-meta font-semibold text-cream transition duration-fast ease-dos hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
          >
            {demo.live.label}
          </button>
          <p className="mt-3 text-meta text-content-muted">
            Opens the same attendant already on this site — one panel, not a second widget.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {demo.illustration.label}
              </p>
              <p className="mt-2 max-w-measure text-meta text-ink-soft">{demo.illustration.disclosure}</p>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="Illustration steps">
              <button
                type="button"
                onClick={() => go(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-dos-lg border border-subtle bg-surface-raised text-emerald-deep transition hover:border-emerald/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                aria-label="Previous step"
              >
                <FiChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="flex h-11 w-11 items-center justify-center rounded-dos-lg border border-subtle bg-surface-raised text-emerald-deep transition hover:border-emerald/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                aria-label="Next step"
              >
                <FiChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            id={panelId}
            role="region"
            aria-labelledby={labelId}
            className={cn(
              'mt-6 rounded-dos-xl border border-subtle bg-surface-sunken p-6 sm:p-8',
              !reducedMotion && 'transition-[opacity,transform] duration-200 ease-dos',
            )}
          >
            <p className="text-meta font-semibold tabular-nums text-content-muted">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 id={labelId} className="mt-2 font-display text-display-card text-emerald-deep">
              {step.title}
            </h3>
            <p className="mt-3 max-w-measure text-body text-ink-soft">{step.body}</p>
          </div>

          <ol className="mt-6 flex flex-wrap gap-2" aria-label="Step list">
            {steps.map((item, index) => {
              const selected = index === stepIndex
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={selected ? 'step' : undefined}
                    onClick={() => go(index)}
                    className={cn(
                      'min-h-11 rounded-dos-lg border px-4 py-2 text-meta font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                      selected
                        ? 'border-emerald/40 bg-action-primary-hover text-cream'
                        : 'border-subtle bg-surface-raised text-ink-soft hover:border-emerald/30 hover:text-emerald-deep',
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </SectionBody>
    </Section>
  )
}
