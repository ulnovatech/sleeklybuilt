import { FiArrowRight } from 'react-icons/fi'
import { Eyebrow } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { siteConfig } from '../../site.config'
import { trustCommitments } from '../../config/proof'

/**
 * Hero Variant C — text + real proof (design-os/patterns/hero_sections.md + UX-GATE §15.3.2).
 * First viewport: brand, one headline, one support, one CTA group, quiet proof.
 * Never 100vh; compact padding so primary action clears ~667px fold.
 * One gold accent: Start a project.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      data-attendant-section="hero"
      className="surface-obsidian scroll-mt-24 pb-14 pt-24 md:pb-20 md:pt-28"
    >
      <div className="mx-auto w-full max-w-content px-6 lg:px-10">
        <div className="max-w-3xl">
          <Eyebrow tone="invert">{siteConfig.name}</Eyebrow>

          <h1 className="display-hero mt-5 text-cream md:mt-6">Software your business can run on.</h1>

          <p className="lead mt-4 text-cream/70 md:mt-5">
            Websites, mobile apps and business systems for teams that need them to work — built in Uganda, ready to
            scale.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink href={siteConfig.links.contact} className="w-full justify-center sm:w-auto">
              Start a project
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href={siteConfig.links.portfolio} variant="ghostDark" className="w-full justify-center sm:w-auto">
              See our work
            </ActionLink>
          </div>

          <p className="mt-3 text-meta text-cream/55">Reply within one working day</p>
        </div>

        <ul className="mt-10 grid gap-4 border-t border-obsidian-line pt-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-8">
          {trustCommitments.map((item) => (
            <li key={item.title} className="min-w-0">
              <p className="text-meta font-medium text-cream/85">{item.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
