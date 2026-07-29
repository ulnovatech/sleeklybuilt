import NavDropdown, { NavLink } from './NavDropdown'
import { mainNavigation } from '../../site.config'

const linkClass = {
  hero: 'text-cream/90 hover:text-cream relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full',
  light:
    'text-ink/80 hover:text-emerald-deep relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full',
}

const buttonClass = {
  hero: 'text-cream/90 hover:text-cream',
  light: 'text-ink/80 hover:text-emerald-deep',
}

export default function NavMenu({ tone = 'light' }) {
  return (
    <nav id="navmenu" className="hidden xl:block" aria-label="Primary">
      <ul className="flex items-center gap-1">
        {mainNavigation.map((item) =>
          item.children ? (
            <NavDropdown key={item.id} label={item.label} items={item.children} tone={tone} />
          ) : (
            <li key={item.id} className="relative">
              <NavLink item={item} className={`rounded-md px-3 py-2 text-sm font-medium transition ${linkClass[tone]}`} />
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}

export { linkClass, buttonClass }
