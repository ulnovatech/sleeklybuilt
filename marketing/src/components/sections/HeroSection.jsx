import { FiArrowRight } from 'react-icons/fi'
import { Eyebrow } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { siteConfig } from '../../site.config'
import { trustCommitments } from '../../config/proof'

/**
 * Hero Variant C — text-only with proof (design-os/patterns/hero_sections.md).
 * Mobile: action above the fold on ~667px, total under ~620px, never 100vh,
 * next section peeks. Proof is verifiable commitments — never fabricated logos.
 */
export default function HeroSection() {
  return (
    <section id="hero" className="surface-obsidian pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <Eyebrow tone="invert">{siteConfig.name}</Eyebrow>

          <h1 className="display-hero mt-6 text-cream md:mt-7">Software your business can run on.</h1>

          <p className="lead mt-5 text-cream/70 md:mt-7">
            Websites, mobile apps and business systems for teams that need them to work — built in Uganda, ready to
            scale.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <ActionLink href={siteConfig.links.contact} className="w-full justify-center sm:w-auto">
              Start a project
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href={siteConfig.links.portfolio} variant="ghostDark" className="w-full justify-center sm:w-auto">
              See our work
            </ActionLink>
          </div>

          <p className="mt-3 text-meta text-cream/60">Reply within one working day</p>
        </div>

        {/* Variant C proof strip — honest guarantees, not invented client logos */}
        <ul className="mt-12 grid gap-3 border-t border-obsidian-line pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {trustCommitments.map((item) => (
            <li key={item.title} className="min-w-0">
              <p className="text-meta font-semibold text-cream">{item.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
