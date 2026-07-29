import React from 'react'
import { Link } from 'react-router-dom'
import { siteConfig } from '../site.config'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-emerald-deep text-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{siteConfig.name}</h3>
            <p className="text-cream/70 mb-4">{siteConfig.tagline}</p>
            <div className="space-y-2 text-cream/80 text-sm">
              <p>{siteConfig.location}</p>
              <p>Phone: {siteConfig.phones[2]}</p>
              <p>
                Email:{' '}
                <a href={`mailto:${siteConfig.email}`} className="hover:text-gold">
                  {siteConfig.email}
                </a>
              </p>
              <p className="italic text-cream/60">Office under development</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold">Useful Links</h4>
            <ul className="space-y-2 text-cream/80 text-sm">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href={siteConfig.homeUrl} className="hover:text-gold transition-colors">
                  Main site
                </a>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-gold transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold">Our Services</h4>
            <ul className="space-y-2 text-cream/80 text-sm">
              <li>
                <Link to="/web-design" className="hover:text-gold transition-colors">
                  Web Design
                </Link>
              </li>
              <li>
                <Link to="/web-development" className="hover:text-gold transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/product-management" className="hover:text-gold transition-colors">
                  Product Management
                </Link>
              </li>
              <li>
                <Link to="/marketing" className="hover:text-gold transition-colors">
                  Marketing
                </Link>
              </li>
              <li>
                <Link to="/graphic-design" className="hover:text-gold transition-colors">
                  Graphic Design
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center border-t border-cream/15 pt-6">
          <p className="text-cream/70 text-sm">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-cream/50 mt-2 text-sm">
            Designed by{' '}
            <a href={siteConfig.homeUrl} className="underline hover:text-gold">
              {siteConfig.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
