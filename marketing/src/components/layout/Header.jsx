import { useEffect, useState } from 'react'
import { siteConfig } from '../../site.config'
import NavMenu from './NavMenu'
import MobileNav from './MobileNav'

function BrandMark({ tone }) {
  const letter = siteConfig.name.charAt(0)
  const onDark = tone === 'hero'

  return (
    <a href={siteConfig.links.home} className="mr-auto flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
      <span
        className={`grid h-8 w-8 place-items-center rounded-full serif text-base leading-none ${
          onDark ? 'bg-cream text-emerald-deep' : 'bg-emerald-deep text-cream'
        }`}
        aria-hidden="true"
      >
        {letter}
      </span>
      <img
        src={siteConfig.links.logo}
        alt=""
        className="hidden h-8 w-auto sm:block"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <span
        className={`serif text-xl tracking-tight ${onDark ? 'text-cream' : 'text-emerald-deep'}`}
      >
        {siteConfig.name}
      </span>
    </a>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const tone = scrolled ? 'light' : 'hero'

  return (
    <>
      <header
        id="header"
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-cream-deep bg-cream/90 shadow-sm backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark tone={tone} />

          <NavMenu tone={tone} />

          <a
            href={siteConfig.links.getStarted}
            className={`hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:inline-flex ${
              tone === 'hero'
                ? 'bg-gold text-ink hover:bg-gold-soft focus-visible:ring-offset-emerald-deep'
                : 'bg-emerald-deep text-cream hover:bg-emerald focus-visible:ring-offset-cream'
            }`}
          >
            Get started
            <span aria-hidden="true" className={tone === 'hero' ? 'text-emerald-deep' : 'text-gold'}>
              →
            </span>
          </a>

          <button
            type="button"
            className={`inline-flex rounded-md p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold xl:hidden ${
              tone === 'hero'
                ? 'text-cream hover:bg-cream/10 focus-visible:ring-offset-emerald-deep'
                : 'text-emerald-deep hover:bg-emerald-deep/5 focus-visible:ring-offset-cream'
            }`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="h-16" aria-hidden="true" />
    </>
  )
}
