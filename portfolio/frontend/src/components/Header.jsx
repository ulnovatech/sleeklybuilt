import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@sleeklybuilt/design-foundation/react'
import { FiMenu, FiX } from 'react-icons/fi'
import {
  siteConfig,
  projectsNavigation,
  projectsSecondaryLinks,
  hubHref,
} from '../site.config'
import { cn } from '../lib/cn'

function RouterLink({ href, className, children, ...rest }) {
  return (
    <Link to={href} className={className} {...rest}>
      {children}
    </Link>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-sticky border-b border-subtle bg-surface-base/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content items-center gap-3 px-5 lg:px-8">
        <BrandMark
          name={siteConfig.name}
          href="/"
          tone="light"
          LinkComponent={RouterLink}
        />

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {projectsNavigation.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-content-secondary transition hover:text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              {item.label}
            </Link>
          ))}
          {projectsSecondaryLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-content-secondary transition hover:text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              {item.label}
            </a>
          ))}
          <a
            href={hubHref('contact')}
            className="ml-2 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-content-primary transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
          >
            Start a project
          </a>
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-emerald-deep transition hover:bg-action-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FiX className="h-5 w-5" aria-hidden="true" /> : <FiMenu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <nav
          className="border-t border-subtle bg-surface-raised px-5 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {projectsNavigation.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-body text-content-primary transition hover:bg-surface-sunken"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {projectsSecondaryLinks.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-body text-content-secondary transition hover:bg-surface-sunken"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={hubHref('contact')}
            onClick={() => setOpen(false)}
            className={cn(
              'mt-4 flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-content-primary',
            )}
          >
            Start a project
          </a>
        </nav>
      ) : null}
    </header>
  )
}
