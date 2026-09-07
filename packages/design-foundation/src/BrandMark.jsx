import { cn } from './cn.js'

/**
 * Letter-circle + wordmark. Host SPA supplies LinkComponent (router Link or `<a>`).
 * tone: `hero` | `dark` → halo on void; `light` → meridian on halo.
 */
export function BrandMark({
  name,
  href = '/',
  tone = 'light',
  LinkComponent,
  className = '',
  ...rest
}) {
  const onDark = tone === 'hero' || tone === 'dark'
  const mark = (
    <>
      <span
        className={cn(
          'grid h-7 w-7 place-items-center rounded-dos-sm font-display text-sm font-semibold leading-none transition',
          onDark ? 'bg-cream text-obsidian' : 'bg-emerald-deep text-cream',
        )}
        aria-hidden="true"
      >
        {String(name || '').charAt(0)}
      </span>
      <span
        className={cn(
          'font-display text-lg font-semibold tracking-tight transition',
          onDark ? 'text-cream' : 'text-emerald-deep',
        )}
      >
        {name}
      </span>
    </>
  )

  const classes = cn(
    'mr-auto flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    onDark
      ? 'focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian'
      : 'focus-visible:ring-dos focus-visible:ring-offset-surface-base',
    className,
  )

  if (LinkComponent) {
    return (
      <LinkComponent href={href} className={classes} aria-label={`${name} home`} {...rest}>
        {mark}
      </LinkComponent>
    )
  }

  return (
    <a href={href} className={classes} aria-label={`${name} home`} {...rest}>
      {mark}
    </a>
  )
}
