import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi'
import {
  hubHref,
  projectsNavigation,
  projectsSecondaryLinks,
  siteConfig,
} from '../site.config'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

function BrandMark() {
  return (
    <Link
      to="/"
      className="mr-auto flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
      aria-label={`${siteConfig.name} layouts home`}
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-full bg-emerald-deep font-display text-base leading-none text-cream"
        aria-hidden="true"
      >
        {siteConfig.name.charAt(0)}
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-emerald-deep">{siteConfig.name}</span>
    </Link>
  )
}

function NavItem({ item, pathname, onNavigate, className }) {
  const active = item.internal && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))

  if (item.internal) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={className(active)}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <a href={item.href} onClick={onNavigate} className={className(false)}>
      {item.label}
    </a>
  )
}

/**
 * Projects header — shared visual grammar with marketing hub (Wave 9 Phase D).
 * IA differs; brand mark, sticky bar, focus rings, drawer, and primary CTA match.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const panelRef = useRef(null)
  const { pathname } = useLocation()
  const contactHref = hubHref('contact')

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

  useEffect(() => {
    if (!mobileOpen) return

    const previous = document.activeElement
    const container = panelRef.current
    container?.focus()

    const getFocusable = () =>
      container
        ? [
            ...container.querySelectorAll(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ]
        : []

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }
      if (event.key !== 'Tab' || !container) return
      const focusable = getFocusable()
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [mobileOpen])

  const linkIdle = 'text-ink-soft hover:text-emerald-deep'
  const linkActive = 'text-emerald-deep'

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b transition duration-normal ease-dos',
          scrolled
            ? 'border-subtle bg-surface-base/90 shadow-sm backdrop-blur-md'
            : 'border-subtle bg-surface-base',
        )}
      >
        <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-6 lg:gap-5 lg:px-10">
          <BrandMark />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Projects">
            {projectsNavigation.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                pathname={pathname}
                className={(active) =>
                  cn(
                    'relative inline-flex min-h-11 items-center rounded-md px-3 py-2 text-meta font-medium transition',
                    'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform',
                    active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
                    active ? linkActive : linkIdle,
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2',
                  )
                }
              />
            ))}
            <a
              href={hubHref('')}
              className={cn(
                'relative inline-flex min-h-11 items-center rounded-md px-3 py-2 text-meta font-medium transition',
                linkIdle,
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2',
              )}
            >
              Main site
            </a>
          </nav>

          <a
            href={contactHref}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 sm:inline-flex"
          >
            Start a project
            <FiArrowRight aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-emerald-deep transition hover:bg-emerald-deep/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <FiMenu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-obsidian/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col bg-obsidian text-cream shadow-2xl focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-obsidian-line px-6 py-4">
              <span className="font-display text-xl text-cream">{siteConfig.name}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-cream/70 transition hover:bg-cream/10 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
                aria-label="Close menu"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Projects">
              <ul className="space-y-1">
                {projectsNavigation.map((item) => (
                  <li key={item.id}>
                    <NavItem
                      item={item}
                      pathname={pathname}
                      onNavigate={() => setMobileOpen(false)}
                      className={(active) =>
                        cn(
                          'flex min-h-11 items-center justify-between rounded-lg px-3 py-3 font-display text-display-card transition',
                          active ? 'bg-cream/10 text-cream' : 'text-cream/85 hover:bg-cream/5 hover:text-cream',
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-obsidian-line pt-6">
                <ul className="space-y-1">
                  {projectsSecondaryLinks.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-meta text-cream/65 transition hover:bg-cream/5 hover:text-cream"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="border-t border-obsidian-line px-6 py-5">
              <a
                href={contactHref}
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
              >
                Start a project
                <FiArrowRight aria-hidden="true" />
              </a>
              <a
                href={`tel:${siteConfig.primaryPhone}`}
                className="mt-3 block text-center text-meta text-cream/60 transition hover:text-accent"
              >
                {siteConfig.primaryPhone}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
