import { Link } from 'react-router-dom'
import {
  siteConfig,
  projectsFooterExplore,
  projectsFooterServices,
  hubHref,
} from '../site.config'

function FooterNavLink({ item }) {
  if (item.internal) {
    return (
      <Link
        to={item.href}
        className="text-cream/70 transition hover:text-cream focus:outline-none focus-visible:underline"
      >
        {item.label}
      </Link>
    )
  }
  return (
    <a
      href={item.href}
      className="text-cream/70 transition hover:text-cream focus:outline-none focus-visible:underline"
    >
      {item.label}
    </a>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-obsidian text-cream">
      <div className="mx-auto max-w-content px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">{siteConfig.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">{siteConfig.tagline}</p>
            <div className="mt-5 space-y-1.5 text-sm text-cream/80">
              <p>{siteConfig.location}</p>
              <p>
                <a
                  href={`tel:${siteConfig.primaryPhone}`}
                  className="transition hover:text-cream focus:outline-none focus-visible:underline"
                >
                  {siteConfig.primaryPhone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition hover:text-cream focus:outline-none focus-visible:underline"
                >
                  {siteConfig.email}
                </a>
              </p>
              <p className="text-cream/60">{siteConfig.addressNote}</p>
            </div>
          </div>

          <div>
            <p className="eyebrow-invert mb-4">Explore</p>
            <ul className="space-y-2 text-sm">
              {projectsFooterExplore.map((item) => (
                <li key={item.label}>
                  <FooterNavLink item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow-invert mb-4">Services</p>
            <ul className="space-y-2 text-sm">
              {projectsFooterServices.map((item) => (
                <li key={item.label}>
                  <FooterNavLink item={item} />
                </li>
              ))}
            </ul>
            <a
              href={hubHref('contact')}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-content-primary transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
            >
              Start a project
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-obsidian-line pt-6 text-center text-xs text-cream/55">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
