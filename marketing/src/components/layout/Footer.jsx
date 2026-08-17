import { Link } from 'react-router-dom'
import NewsletterForm from '../forms/NewsletterForm'
import FooterLinks from './FooterLinks'
import { footerServiceLinks, footerUsefulLinks } from '../../site.config'
import { useSiteConfig } from '../../context/SiteContactContext'

export default function Footer() {
  const siteConfig = useSiteConfig()
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="mt-16 bg-obsidian text-cream">
      <div className="mx-auto max-w-content px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="font-display max-w-md text-3xl font-semibold leading-[1.2] tracking-tight md:text-4xl">
              Software built sleek, delivered with care.
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{siteConfig.description}</p>
            <div className="mt-6 space-y-2 text-sm text-cream/85">
              <p>{siteConfig.location}</p>
              <p>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-gold focus:outline-none focus-visible:underline">
                  {siteConfig.email}
                </a>
              </p>
              <p>
                <a href={`tel:${siteConfig.primaryPhone}`} className="hover:text-gold focus:outline-none focus-visible:underline">
                  {siteConfig.primaryPhone}
                </a>
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(siteConfig.social).map(([key, href]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cream/20 px-3 py-1 text-xs uppercase tracking-wide text-cream/80 transition hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
                >
                  {key}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4">
            <FooterLinks title="Explore" links={footerUsefulLinks} />
            <FooterLinks title="Services" links={footerServiceLinks} />
          </div>

          <div className="lg:col-span-3">
            <p className="eyebrow-invert mb-4">Newsletter</p>
            <p className="mb-4 text-sm leading-relaxed text-cream/70">
              Updates on new layouts, services, and product news.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-obsidian-line pt-8 text-xs text-cream/55 md:flex-row md:items-center">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-2">
            <Link
              to={siteConfig.links.policies}
              className="hover:text-gold focus:outline-none focus-visible:underline"
            >
              Policies
            </Link>
            <Link
              to={`${siteConfig.links.policies}/privacy`}
              className="hover:text-gold focus:outline-none focus-visible:underline"
            >
              Privacy
            </Link>
            <Link
              to={`${siteConfig.links.policies}/terms`}
              className="hover:text-gold focus:outline-none focus-visible:underline"
            >
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
