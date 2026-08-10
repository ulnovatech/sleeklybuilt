import { cn } from '../../lib/utils'

export function Section({ children, className = '', id }) {
  return (
    <section id={id} className={cn('w-full', className)}>
      <div className="mx-auto max-w-content px-6 lg:px-10">{children}</div>
    </section>
  )
}

export function Eyebrow({ children, className = '', tone = 'default' }) {
  const invert = tone === 'invert'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/*
        Gold hairline is the sole gold on light sections that have no gold CTA nearby.
        On invert (obsidian), the hairline stays gold; label uses cream so the primary
        CTA can own the gold accent in that viewport (DESIGN.md 60-30-10 / one gold).
      */}
      <span className={cn('h-px w-8 bg-gold')} aria-hidden="true" />
      <span className={invert ? 'eyebrow-invert' : 'eyebrow'}>{children}</span>
    </div>
  )
}

/**
 * Section headings are always left-aligned — there is deliberately no centre
 * option. Pass tone="invert" on obsidian bands: emerald fails contrast on dark,
 * so the heading switches to cream and the eyebrow to a quiet cream label.
 */
export function SectionHeading({ eyebrow, title, intro, tone = 'default', className = '' }) {
  const invert = tone === 'invert'

  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2 className={cn('display-section mt-5', invert ? 'text-cream' : 'text-emerald-deep')}>{title}</h2>
      {intro ? (
        <p className={cn('lead mt-4 md:mt-5', invert ? 'text-cream/70' : 'text-ink-soft')}>{intro}</p>
      ) : null}
    </div>
  )
}

/** Consistent gap from section heading block to the content that follows. */
export function SectionBody({ children, className = '' }) {
  return <div className={cn('mt-8 md:mt-12', className)}>{children}</div>
}
