import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { siteConfig } from '../site.config'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinkClass =
    'text-ink-soft hover:text-emerald-deep transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 rounded-sm'

  return (
    <header className="bg-cream shadow-sm border-b border-cream-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-xl font-bold tracking-tight text-emerald-deep sm:text-2xl">
              {siteConfig.name}
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/portfolio" className={navLinkClass}>
              Portfolio
            </Link>
            <Link to="/services" className={navLinkClass}>
              Services
            </Link>
            <Link to="/contact" className={navLinkClass}>
              Contact
            </Link>
            <a
              href={siteConfig.homeUrl}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft"
            >
              Main site
            </a>
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-emerald-deep hover:text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-sm p-1"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {[
              { to: '/', label: 'Home' },
              { to: '/portfolio', label: 'Portfolio' },
              { to: '/services', label: 'Services' },
              { to: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-2 rounded-md ${navLinkClass}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={siteConfig.homeUrl}
              className="block px-3 py-2 text-sm font-semibold text-gold"
              onClick={() => setIsMenuOpen(false)}
            >
              Main site →
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
