import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandMark } from '@sleeklybuilt/design-foundation/react'
import { FiArrowRight, FiMenu, FiSearch } from 'react-icons/fi'
import { siteConfig } from '../../site.config'
import NavMenu from './NavMenu'
import MobileNav from './MobileNav'
import SearchTrigger from '../search/SearchTrigger'
import CommandPalette from '../search/CommandPalette'
import { cn } from '../../lib/utils'

/**
 * Routes whose first band is light (cream). Everywhere else opens on an obsidian
 * or deep band, so the header can sit transparent with cream type. Track order
 * uses PageHeader (obsidian) — do not list it here (Wave 9 Phase D).
 */
const LIGHT_TOP_ROUTES = new Set([])

export default function Header({ docked = false }) {
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
    'inline-flex h-9 w-9 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2',
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
          docked && 'lg:right-[380px]',
          tone === 'hero'
            ? 'border-transparent bg-transparent'
            : 'border-cream-deep bg-cream/90 shadow-sm backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-14 max-w-content items-center gap-2 px-5 lg:gap-3 lg:px-8">
          <BrandMark
            name={siteConfig.name}
            href={siteConfig.links.home}
            tone={tone}
            logoSrc={siteConfig.links.mark}
            LinkComponent={({ href, className, children, ...rest }) => (
              <Link to={href} className={className} {...rest}>
                {children}
              </Link>
            )}
          />

          <NavMenu tone={tone} />

          <SearchTrigger tone={tone} onOpen={() => setSearchOpen(true)} />

          <Link
            to={siteConfig.links.contact}
            className={cn(
              'hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-dos-lg px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex',
              tone === 'hero'
                ? 'bg-emerald-deep text-cream hover:bg-emerald focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian'
                : 'bg-emerald-deep text-cream hover:bg-emerald focus-visible:ring-dos focus-visible:ring-offset-cream',
            )}
          >
            Start a project
            <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
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
