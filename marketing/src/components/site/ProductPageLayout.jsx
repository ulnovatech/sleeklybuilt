import { FiArrowRight } from 'react-icons/fi'
import PageHeader from './PageHeader'
import ActionLink from './ActionLink'
import ContactCtaBand from './ContactCtaBand'
import ProductFeatureSections from './ProductFeatureSections'
import PeopleAskSection from '../sections/PeopleAskSection'
import Reveal from '../motion/Reveal'
import { siteConfig } from '../../site.config'
import { usePageTitle } from '../../lib/usePageTitle'

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
  children,
}) {
  usePageTitle(title)

  return (
    <>
      <PageHeader
        sectionId="hero"
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        actions={
          <>
            <ActionLink href={siteConfig.links.contact}>
              Start a project
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
        />
      </Reveal>

      <ContactCtaBand />
    </>
  )
}
