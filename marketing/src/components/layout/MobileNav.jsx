import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { FiArrowRight, FiSearch, FiX } from 'react-icons/fi'
import NavLink from './NavLink'
import { mainNavigation, siteConfig } from '../../site.config'
import { cn } from '../../lib/utils'

const secondaryLinks = [
  { id: 'prices', label: 'Pricing', href: siteConfig.links.prices },
  { id: 'about', label: 'About', href: siteConfig.links.about },
  { id: 'track-order', label: 'Track order', href: siteConfig.links.trackOrder },
]

export default function MobileNav({ open, onClose, onOpenSearch }) {
  const panelRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-obsidian/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="surface-obsidian absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-obsidian-line px-6 py-4">
          <span className="font-serif text-xl text-cream">{siteConfig.name}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-cream/70 transition hover:bg-cream/10 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
            aria-label="Close menu"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pt-5">
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenSearch?.()
            }}
            className="flex w-full items-center gap-3 rounded-full border border-cream/20 bg-cream/5 px-4 py-2.5 text-meta text-cream/70 transition hover:border-cream/35 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
          >
            <FiSearch aria-hidden="true" className="text-gold" />
            Search
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Primary">
          <ul className="space-y-1">
            {mainNavigation.map((item) => {
              const active = item.href === pathname

              return (
                <li key={item.id}>
                  <NavLink
                    item={item}
                    onNavigate={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-3 font-serif text-display-card transition',
                      active ? 'bg-cream/10 text-cream' : 'text-cream/85 hover:bg-cream/5 hover:text-cream',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {item.badge ? (
                        <span className="rounded-full bg-gold px-1.5 py-px text-[0.5625rem] font-sans font-bold uppercase tracking-wide text-ink">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <FiArrowRight aria-hidden="true" className="text-base text-gold" />
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="mt-8 border-t border-obsidian-line pt-6">
            <ul className="space-y-1">
              {secondaryLinks.map((item) => (
                <li key={item.id}>
                  <NavLink
                    item={item}
                    onNavigate={onClose}
                    aria-current={item.href === pathname ? 'page' : undefined}
                    className="block rounded-lg px-3 py-2.5 text-meta text-cream/65 transition hover:bg-cream/5 hover:text-cream"
                  />
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="border-t border-obsidian-line px-6 py-5">
          <NavLink
            item={{ href: siteConfig.links.contact, label: 'Start a project' }}
            onNavigate={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-meta font-semibold text-ink transition hover:bg-gold-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
          >
            Start a project
            <FiArrowRight aria-hidden="true" />
          </NavLink>
          <a
            href={`tel:${siteConfig.primaryPhone}`}
            className="mt-3 block text-center text-meta text-cream/60 transition hover:text-gold"
          >
            {siteConfig.primaryPhone}
          </a>
        </div>
      </div>
    </div>
  )
}
