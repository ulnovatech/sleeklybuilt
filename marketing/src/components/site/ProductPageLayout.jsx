import { FiArrowRight } from 'react-icons/fi'
import PageHeader from './PageHeader'
import ActionLink from './ActionLink'
import ContactCtaBand from './ContactCtaBand'
import ProductFeatureSections from './ProductFeatureSections'
import PeopleAskSection from '../sections/PeopleAskSection'
import Reveal from '../motion/Reveal'
import { siteConfig } from '../../site.config'
import { usePageSeo } from '../../lib/usePageSeo'

/**
 * Shared product line page — PageHeader (not full hero), features, FAQ, CTA.
 * Optional children slot for Phase 6 gallery (Sleek Pages / Websites).
 */
export default function ProductPageLayout({
  title,
  eyebrow,
  intro,
  features,
  faq,
  secondaryAction,
  /** Product-directed hero CTA — never the generic “Start a project”. */
  primaryAction = {
    href: siteConfig.links.contact,
    label: 'Let’s Build Your Solution',
  },
  children,
}) {
  usePageSeo()

  return (
    <>
      <PageHeader
        sectionId="hero"
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        actions={
          <>
            <ActionLink href={primaryAction.href}>
              {primaryAction.label}
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            {secondaryAction ? (
              <ActionLink href={secondaryAction.href} variant="ghostDark">
                {secondaryAction.label}
              </ActionLink>
            ) : null}
          </>
        }
      />

      <Reveal>
        <ProductFeatureSections features={features} />
      </Reveal>

      {children}

      <Reveal>
        <PeopleAskSection
          items={faq}
          intro="Questions buyers ask about this product line before they write."
          ctaHref={primaryAction.href}
          ctaLabel={primaryAction.label}
        />
      </Reveal>

      <ContactCtaBand
        title="Ready when you are"
        body="Tell us what you need. We reply within one working day — or sooner when you are ready to start."
        ctaHref={primaryAction.href}
        ctaLabel={primaryAction.label}
      />
    </>
  )
}
