import { cn } from './cn.js'

export const actionLinkBase =
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-dos-lg px-7 py-3 text-meta font-semibold tracking-wide transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

export const actionLinkVariants = {
  /** Primary on void — the spark accent for that viewport */
  gold: 'bg-accent text-content-primary hover:bg-accent-hover focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian',
  /** Secondary on void */
  ghostDark:
    'border border-cream/25 text-content-inverse hover:bg-cream/10 focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian',
  /** Primary on halo */
  emerald:
    'bg-action-primary-hover text-content-inverse hover:bg-action-primary active:bg-action-primary-active focus-visible:ring-dos focus-visible:ring-offset-surface-base',
  /** Secondary on halo */
  ghostLight:
    'border border-subtle text-action-primary-hover hover:border-action-primary/40 hover:bg-action-secondary-hover focus-visible:ring-dos focus-visible:ring-offset-surface-base',
}

/**
 * Call-to-action control. Pass `LinkComponent` from the host SPA router
 * (e.g. marketing NavLink wrapper). Defaults to a plain `<a>`.
 * Focus uses ring-dos / ring-dos-inverse — never spark or meridian as the ring.
 * Variant keys `gold` / `emerald` are stable API aliases for spark / meridian.
 */
export function ActionLink({
  href,
  variant = 'gold',
  className = '',
  children,
  LinkComponent,
  disabled = false,
  ...rest
}) {
  const classes = cn(
    actionLinkBase,
    actionLinkVariants[variant] || actionLinkVariants.gold,
    disabled && 'pointer-events-none opacity-50',
    className,
  )

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true" {...rest}>
        {children}
      </span>
    )
  }

  if (LinkComponent) {
    return (
      <LinkComponent href={href} className={classes} {...rest}>
        {children}
      </LinkComponent>
    )
  }

  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  )
}

/**
 * Same visual variants as ActionLink for `<button>` actions.
 */
export function Button({
  variant = 'emerald',
  className = '',
  children,
  type = 'button',
  disabled = false,
  loading = false,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        actionLinkBase,
        actionLinkVariants[variant] || actionLinkVariants.emerald,
        (disabled || loading) && 'opacity-60',
        className,
      )}
      {...rest}
    >
      {loading ? 'Working…' : children}
    </button>
  )
}
