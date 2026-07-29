import { cn } from '../../lib/utils'

export function SurfaceCard({ children, className = '', tone = 'card', interactive = false, as: Tag = 'div' }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border p-6 sm:p-7',
        tone === 'card' && 'border-cream-deep bg-white shadow-sm',
        tone === 'muted' && 'border-cream-deep bg-cream-deep/60',
        tone === 'primary' && 'border-emerald-deep/20 bg-emerald-deep text-cream',
        interactive && 'group transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald/30 hover:shadow-md',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function BulletList({ items, className = '', variant = 'default' }) {
  const dotClass = variant === 'inverse' ? 'bg-gold' : 'bg-emerald-soft'

  return (
    <ul className={cn('space-y-4', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-4 text-sm leading-relaxed sm:text-base">
          <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', dotClass)} aria-hidden="true" />
          <span className={variant === 'inverse' ? 'text-cream/85' : 'text-ink-soft'}>{item}</span>
        </li>
      ))}
    </ul>
  )
}
