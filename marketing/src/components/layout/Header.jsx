import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiArrowRight, FiMenu, FiSearch } from 'react-icons/fi'
import { siteConfig } from '../../site.config'
import NavMenu from './NavMenu'
import MobileNav from './MobileNav'
import SearchTrigger from '../search/SearchTrigger'
import CommandPalette from '../search/CommandPalette'
import { cn } from '../../lib/utils'

/**
 * Routes whose first band is light. Everywhere else opens on an obsidian band, so
 * the header can sit transparent over it with cream type. Without this the header
 * would render cream-on-cream and disappear.
 */
const LIGHT_TOP_ROUTES = new Set([siteConfig.links.trackOrder])

function BrandMark({ tone }) {
  const onDark = tone === 'hero'

  return (
    <Link
      to={siteConfig.links.home}
      className={cn(
        'mr-auto flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        onDark
          ? 'focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian'
          : 'focus-visible:ring-dos focus-visible:ring-offset-surface-base',
      )}
      aria-label={`${siteConfig.name} home`}
    >
      <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full font-serif text-base leading-none transition',
          onDark ? 'bg-cream text-obsidian' : 'bg-emerald-deep text-cream',
        )}
        aria-hidden="true"
      >
        {siteConfig.name.charAt(0)}
      </span>
      <span className={cn('font-serif text-xl tracking-tight transition', onDark ? 'text-cream' : 'text-emerald-deep')}>
        {siteConfig.name}
      </span>
    </Link>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()

  const overDark = !LIGHT_TOP_ROUTES.has(pathname)
  const tone = overDark && !scrolled ? 'hero' : 'light'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  /* Cmd/Ctrl+K opens search from anywhere. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMobileOpen(false)
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const iconButtonClass = cn(
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 transition focus:outline-none focus-visible:ring-2',
    tone === 'hero'
      ? 'text-cream hover:bg-cream/10 focus-visible:ring-dos-inverse focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian'
      : 'text-emerald-deep hover:bg-emerald-deep/5 focus-visible:ring-dos focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
  )

  return (
    <>
      <header
        id="header"
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-all duration-300',
          tone === 'hero'
            ? 'border-transparent bg-transparent'
            : 'border-cream-deep bg-cream/90 shadow-sm backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6 lg:gap-5 lg:px-10">
          <BrandMark tone={tone} />

          <NavMenu tone={tone} />

          <SearchTrigger tone={tone} onOpen={() => setSearchOpen(true)} />

          <Link
            to={siteConfig.links.contact}
            className={cn(
              'hidden items-center gap-2 rounded-full px-5 py-2.5 text-meta font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex',
              tone === 'hero'
                ? 'bg-gold text-ink hover:bg-gold-soft focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian'
                : 'bg-emerald-deep text-cream hover:bg-emerald focus-visible:ring-dos focus-visible:ring-offset-cream',
            )}
          >
            Start a project
            <FiArrowRight aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(iconButtonClass, 'lg:hidden')}
            aria-label="Search"
          >
            <FiSearch className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={cn(iconButtonClass, 'lg:hidden')}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <FiMenu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
