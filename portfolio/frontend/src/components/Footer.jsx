import { Link } from 'react-router-dom'
import { useSiteConfig } from '../context/SiteContactContext'
import { projectsFooterExplore, projectsFooterServices } from '../site.config'

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="eyebrow-invert mb-4">{title}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.internal ? (
              <Link
                to={link.href}
                className="text-meta text-cream/85 transition hover:text-gold focus:outline-none focus-visible:underline"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-meta text-cream/85 transition hover:text-gold focus:outline-none focus-visible:underline"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Projects footer — obsidian band matching marketing hub grammar.
 * Links only to real Projects routes or hub destinations.
 */
export default function Footer() {
  const siteConfig = useSiteConfig()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-obsidian text-cream">
      <div className="mx-auto max-w-content px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="font-display max-w-md text-3xl font-semibold leading-[1.2] tracking-tight md:text-4xl">
              Layouts you can open and click through.
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
              {siteConfig.description || siteConfig.tagline}
            </p>
            <div className="mt-6 space-y-2 text-sm text-cream/85">
              <p>{siteConfig.location}</p>
              <p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-gold focus:outline-none focus-visible:underline"
                >
                  {siteConfig.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${siteConfig.primaryPhone}`}
                  className="hover:text-gold focus:outline-none focus-visible:underline"
                >
                  {siteConfig.primaryPhone}
                </a>
              </p>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7">
            <FooterColumn title="Explore" links={projectsFooterExplore} />
            <FooterColumn title="Services" links={projectsFooterServices} />
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-obsidian-line pt-8 text-xs text-cream/55 md:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Part of the SleeklyBuilt studio.</p>
        </div>
      </div>
    </footer>
  )
}
