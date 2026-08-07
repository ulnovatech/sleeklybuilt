import { useLocation } from 'react-router-dom'
import NavLink from './NavLink'
import { mainNavigation } from '../../site.config'
import { cn } from '../../lib/utils'

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

export default function NavMenu({ tone = 'light' }) {
  const { pathname } = useLocation()
  const styles = toneClass[tone] ?? toneClass.light

  return (
    <nav id="navmenu" className="hidden lg:block" aria-label="Primary">
      <ul className="flex items-center gap-0.5">
        {mainNavigation.map((item) => {
          const active = item.href === pathname

          return (
            <li key={item.id}>
              <NavLink
                item={item}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-meta font-medium transition',
                  'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform',
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
