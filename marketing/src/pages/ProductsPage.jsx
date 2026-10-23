import { FiArrowRight } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import ActionLink from '../components/site/ActionLink'
import ContactCtaBand from '../components/site/ContactCtaBand'
import PeopleAskSection from '../components/sections/PeopleAskSection'
import ProductGuide from '../components/products/ProductGuide'
import { Section, SectionHeading } from '../components/site/Section'
import NavLink from '../components/layout/NavLink'
import Reveal from '../components/motion/Reveal'
import { productLines } from '../config/products'
import { productsIndexFaq } from '../config/productPages'
import { attendantProduct } from '../config/attendantProduct'
import { siteConfig } from '../site.config'
import { usePageSeo } from '../lib/usePageSeo'

/**
 * Products index — guided catalogue.
 *
 * Journey: arrive → choose a product line OR narrow by need → expand one capability → contact / line page.
 * Layout: header → four lines → nested need guide → FAQ → CTA.
 * States: static content (no empty/load/error); disclosure + tab selection are the interaction states.
 *
 * Named docs: ecommerce_catalog (narrowing), feature_sections, faq, content_intelligence.
 */
export default function ProductsPage() {
  usePageSeo()

  return (
    <>
      <PageHeader
        eyebrow="All products"
        title="Everything you need to launch and grow"
        intro="Start with a product line, or browse by the job you need done — websites, operations, payments, community, workflow or a specialized build."
        actions={
          <>
            <ActionLink href={siteConfig.links.contact}>
              Start a project
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href="#product-guide" variant="ghostDark">
              Browse by need
            </ActionLink>
          </>
        }
      />

      <Section className="section-light scroll-mt-24" id="catalogue">
        <SectionHeading
          eyebrow="Step 1"
          title="Choose a product line"
          intro="Four destinations. Each is a path — not a package tier."
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

        <div className="mt-10 border-t border-subtle pt-10">
          <p className="eyebrow">Subscription</p>
          <p className="mt-3 max-w-measure text-body text-ink-soft">
            Not a website build line — a monthly attendant for an existing site (or a hosted link).
          </p>
          <NavLink
            item={{ href: attendantProduct.catalogue.href }}
            className="group mt-6 flex max-w-xl items-start gap-5 rounded-2xl border border-emerald/25 bg-surface-raised p-6 shadow-sm transition duration-fast ease-dos hover:-translate-y-0.5 hover:border-emerald/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 sm:p-7"
          >
            <span className="min-w-0 flex-1">
              <span className="display-card text-emerald-deep">{attendantProduct.catalogue.name}</span>
              <span className="mt-2 block text-body text-ink-soft">{attendantProduct.catalogue.blurb}</span>
            </span>
            <span className="mt-1.5 flex shrink-0 items-center gap-1 text-meta font-semibold text-emerald-deep">
              {attendantProduct.catalogue.ctaLabel}
              <FiArrowRight
                aria-hidden="true"
                className="transition duration-fast group-hover:translate-x-1 group-hover:text-accent"
              />
            </span>
          </NavLink>
        </div>
      </Section>

      <Reveal>
        <ProductGuide />
      </Reveal>

      <Reveal>
        <PeopleAskSection items={productsIndexFaq} />
      </Reveal>

      <ContactCtaBand />
    </>
  )
}
