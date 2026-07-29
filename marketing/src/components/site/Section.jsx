import { cn } from '../../lib/utils'

export function Section({ children, className = '', id }) {
  return (
    <section id={id} className={cn('w-full', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">{children}</div>
    </section>
  )
}

export function Eyebrow({ children, className = '' }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="h-px w-8 bg-gold" aria-hidden="true" />
      <span className="eyebrow">{children}</span>
    </div>
  )
}

export function SectionHeading({ eyebrow, title, intro, align = 'left', className = '' }) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : ''

  return (
    <div className={cn('max-w-3xl', alignCls, className)}>
      {eyebrow ? (
        <div className={align === 'center' ? 'flex justify-center' : ''}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2 className="serif mt-5 text-3xl leading-[1.08] text-emerald-deep sm:text-4xl md:text-5xl">{title}</h2>
      {intro ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{intro}</p> : null}
    </div>
  )
}
