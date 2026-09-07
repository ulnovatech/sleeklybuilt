import { cn } from './cn.js'

export function SurfaceCard({ children, className = '', tone = 'card', interactive = false, as: Tag = 'div' }) {
  return (
    <Tag
      className={cn(
        'rounded-dos-xl border p-6 sm:p-7',
        tone === 'card' && 'border-subtle bg-surface-raised shadow-sm',
        tone === 'muted' && 'border-subtle bg-surface-sunken',
        tone === 'primary' && 'border-transparent bg-action-primary-hover text-content-inverse',
        interactive &&
          'group transition duration-fast ease-dos hover:-translate-y-0.5 hover:border-action-primary/30 hover:shadow-md',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function BulletList({ items, className = '', variant = 'default' }) {
  const dotClass = variant === 'inverse' ? 'bg-accent' : 'bg-action-soft'

  return (
    <ul className={cn('space-y-4', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-4 text-body text-content-secondary">
          <span className={cn('mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full', dotClass)} aria-hidden="true" />
          <span className={variant === 'inverse' ? 'text-cream/85' : undefined}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Inline status banner for forms and panels (error / success / warning / info).
 */
export function StatusBanner({ tone = 'info', children, className = '', role }) {
  const tones = {
    error: 'border-status-danger/30 bg-status-danger-surface text-status-danger',
    success: 'border-status-success/30 bg-status-success-surface text-status-success',
    warning: 'border-status-warning/30 bg-status-warning-surface text-status-warning',
    info: 'border-status-info/30 bg-status-info-surface text-status-info',
  }

  return (
    <div
      role={role || (tone === 'error' ? 'alert' : 'status')}
      className={cn(
        'rounded-lg border px-3.5 py-3 text-sm',
        tones[tone] || tones.info,
        className,
      )}
    >
      {children}
    </div>
  )
}
