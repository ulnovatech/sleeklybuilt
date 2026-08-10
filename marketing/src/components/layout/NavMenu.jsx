import { useLocation } from 'react-router-dom'
import NavLink from './NavLink'
import { mainNavigation } from '../../site.config'
import { cn, isNavItemActive } from '../../lib/utils'

const toneClass = {
  hero: {
    idle: 'text-cream/80 hover:text-cream',
    active: 'text-cream',
    badge: 'bg-gold text-ink',
  },
  light: {
    idle: 'text-ink-soft hover:text-emerald-deep',
    active: 'text-emerald-deep',
    badge: 'bg-gold text-ink',
  },
}

/**
 * Desktop primary nav — single-line labels, tight chrome (no wrap, no tall min-h).
 */
export default function NavMenu({ tone = 'light' }) {
  const { pathname } = useLocation()
  const styles = toneClass[tone] ?? toneClass.light

  return (
    <nav id="navmenu" className="hidden lg:block" aria-label="Primary">
      <ul className="flex flex-nowrap items-center gap-0">
        {mainNavigation.map((item) => {
          const active = isNavItemActive(item, pathname)

          return (
            <li key={item.id} className="shrink-0">
              <NavLink
                item={item}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md px-2 text-sm font-medium transition',
                  'after:absolute after:inset-x-2 after:-bottom-px after:h-px after:origin-left after:bg-gold after:transition-transform',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  tone === 'hero'
                    ? 'focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian'
                    : 'focus-visible:ring-dos focus-visible:ring-offset-surface-base',
                  active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
                  active ? styles.active : styles.idle,
                )}
              >
                {item.label}
                {item.badge ? (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide',
                      styles.badge,
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
