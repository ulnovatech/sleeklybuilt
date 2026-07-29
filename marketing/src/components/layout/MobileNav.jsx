import { useState } from 'react'
import { siteConfig } from '../../site.config'
import { NavLink } from './NavDropdown'
import { mainNavigation } from '../../site.config'

function MobileAccordionItem({ item, depth = 0, onNavigate }) {
  const [open, setOpen] = useState(false)

  if (item.children?.length) {
    return (
      <div className="border-b border-cream-deep/20">
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-cream focus:outline-none focus-visible:bg-cream/5"
          style={{ paddingLeft: `${20 + depth * 12}px` }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {item.label}
          <span className={`text-xs transition ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {open && (
          <div className="pb-2">
            {item.children.map((child) => (
              <MobileAccordionItem key={child.label} item={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      item={item}
      onNavigate={onNavigate}
      className="block border-b border-cream-deep/20 px-5 py-3.5 text-sm text-cream/90 transition hover:bg-cream/5 hover:text-gold focus:outline-none focus-visible:bg-cream/5 focus-visible:text-gold"
      style={{ paddingLeft: `${20 + depth * 12}px` }}
    />
  )
}

export default function MobileNav({ open, onClose }) {
  if (!open) return null

  const handleNavigate = () => onClose()

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <button
        type="button"
        className="absolute inset-0 bg-emerald-deep/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-emerald-deep shadow-2xl">
        <div className="flex items-center justify-between border-b border-cream/10 px-5 py-4">
          <span className="serif text-lg text-cream">{siteConfig.name}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-cream/80 transition hover:bg-cream/10 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul>
            {mainNavigation.map((item) =>
              item.children ? (
                <li key={item.id}>
                  <MobileAccordionItem item={item} onNavigate={handleNavigate} />
                </li>
              ) : (
                <li key={item.id} className="border-b border-cream-deep/20">
                  <NavLink
                    item={item}
                    onNavigate={handleNavigate}
                    className="block px-5 py-3.5 text-sm font-medium text-cream transition hover:bg-cream/5 hover:text-gold focus:outline-none focus-visible:bg-cream/5 focus-visible:text-gold"
                  />
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="border-t border-cream/10 p-5">
          <a
            href={siteConfig.links.getStarted}
            onClick={handleNavigate}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-deep"
          >
            Get started
            <span aria-hidden="true">→</span>
          </a>
          <a
            href="/#contact"
            onClick={handleNavigate}
            className="mt-3 block text-center text-sm text-cream/75 hover:text-gold"
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  )
}
