import { cn } from '../../lib/utils'

export function Section({ children, className = '', id }) {
  return (
    <section id={id} className={cn('w-full', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">{children}</div>
    </section>
  )
}

export function Eyebrow({ children, className = '', tone = 'default' }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="h-px w-8 bg-gold" aria-hidden="true" />
      <span className={tone === 'invert' ? 'eyebrow-invert' : 'eyebrow'}>{children}</span>
    </div>
  )
}

/**
 * Section headings are always left-aligned — there is deliberately no centre
 * option. Pass tone="invert" on obsidian bands: emerald fails contrast on dark,
 * so the heading switches to cream and the eyebrow to gold.
 */
export function SectionHeading({ eyebrow, title, intro, tone = 'default', className = '' }) {
  const invert = tone === 'invert'

  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2 className={cn('display-section mt-5', invert ? 'text-cream' : 'text-emerald-deep')}>{title}</h2>
      {intro ? <p className={cn('lead mt-5', invert ? 'text-cream/70' : 'text-ink-soft')}>{intro}</p> : null}
    </div>
  )
}
