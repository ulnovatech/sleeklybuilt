import { FiArrowRight } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import ActionLink from '../components/site/ActionLink'
import ContactCtaBand from '../components/site/ContactCtaBand'
import PeopleAskSection from '../components/sections/PeopleAskSection'
import { Section, SectionHeading } from '../components/site/Section'
import NavLink from '../components/layout/NavLink'
import Reveal from '../components/motion/Reveal'
import { productLines } from '../config/products'
import { productsIndexFaq } from '../config/productPages'
import { siteConfig } from '../site.config'
import { usePageTitle } from '../lib/usePageTitle'

/**
 * All products index — one primary conversion (Start a project).
 * Product cards are informational paths; they must not compete with the CTA.
 */
export default function ProductsPage() {
  usePageTitle('All Products')

  return (
    <>
      <PageHeader
        eyebrow="All products"
        title="Everything you need to launch and grow"
        intro="Four product lines — pick the one that matches the problem, or tell us and we will point you."
        actions={
          <>
            <ActionLink href={siteConfig.links.contact}>
              Start a project
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href={siteConfig.links.portfolio} variant="ghostDark">
              Browse projects
            </ActionLink>
          </>
        }
      />

      <Section className="section-light scroll-mt-24" id="catalogue">
        <SectionHeading
          eyebrow="Catalogue"
          title="Choose a product line"
          intro="Each line is a destination, not a package tier."
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {productLines.map(({ id, label, tagline, href, badge, icon: Icon }) => (
            <li key={id}>
              <NavLink
                item={{ href }}
                className="group flex h-full items-start gap-5 rounded-2xl border border-cream-deep bg-surface-raised p-6 shadow-sm transition duration-fast ease-dos hover:-translate-y-0.5 hover:border-emerald/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 sm:p-7"
              >
                <span
                  className="mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-deep/10 text-xl text-emerald-deep ring-1 ring-emerald/15"
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2.5">
                    <span className="display-card text-emerald-deep">{label}</span>
                    {badge ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-ink">
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-body text-ink-soft">{tagline}</span>
                </span>
                <FiArrowRight
                  aria-hidden="true"
                  className="mt-1.5 shrink-0 text-cream-deep transition duration-fast group-hover:translate-x-1 group-hover:text-accent"
                />
              </NavLink>
            </li>
          ))}
        </ul>
      </Section>

      <Reveal>
        <PeopleAskSection items={productsIndexFaq} />
      </Reveal>

      <ContactCtaBand />
    </>
  )
}
