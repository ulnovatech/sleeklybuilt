import { useCallback, useState } from 'react'
import { useAttendant } from '@sleeklybuilt/attendant'
import Reveal from '../components/motion/Reveal'
import ProductFeatureSections from '../components/site/ProductFeatureSections'
import PeopleAskSection from '../components/sections/PeopleAskSection'
import AttendantHero from '../components/attendant/AttendantHero'
import AttendantProblemSection from '../components/attendant/AttendantProblemSection'
import AttendantDemoSection from '../components/attendant/AttendantDemoSection'
import AttendantHowItWorksSection from '../components/attendant/AttendantHowItWorksSection'
import AttendantInstallSection from '../components/attendant/AttendantInstallSection'
import AttendantPricingSection from '../components/attendant/AttendantPricingSection'
import AttendantTrustSection from '../components/attendant/AttendantTrustSection'
import AttendantFinalCta from '../components/attendant/AttendantFinalCta'
import { attendantProduct } from '../config/attendantProduct'
import { usePageSeo } from '../lib/usePageSeo'

/**
 * Sleekly Attendant product page.
 * Governing: marketing/ATTENDANT-UX-GATE.md + Design OS product/hero/feature/pricing/faq.
 * Try it live → existing global attendant via openWithPrompt (one instance).
 */
export default function AttendantProductPage() {
  const { openWithPrompt } = useAttendant()
  const [regionId, setRegionId] = useState(attendantProduct.pricing.defaultRegion)
  const region =
    attendantProduct.pricing.regions[regionId] ||
    attendantProduct.pricing.regions[attendantProduct.pricing.defaultRegion]

  usePageSeo({
    title: attendantProduct.seo.title,
    description: attendantProduct.seo.description,
    path: attendantProduct.path,
  })

  const tryLive = useCallback(() => {
    openWithPrompt(attendantProduct.demo.live.starterPrompt)
  }, [openWithPrompt])

  const hero = {
    ...attendantProduct.hero,
    secondaryCta: {
      ...attendantProduct.hero.secondaryCta,
      href: '#demo',
    },
  }

  const primaryCta = {
    label: region.ctaLabel,
    href: region.ctaHref,
  }

  const heroReassurance =
    regionId === 'uganda'
      ? 'First month via MTN or Airtel Money — verified by our team before setup.'
      : 'Request an invoice — we follow up; no card checkout on this site today.'

  return (
    <>
      <AttendantHero hero={hero} primaryCta={primaryCta} paymentReassurance={heroReassurance} />

      <Reveal>
        <AttendantProblemSection problem={attendantProduct.problem} />
      </Reveal>

      <Reveal>
        <ProductFeatureSections
          features={attendantProduct.capabilities.items}
          eyebrow={attendantProduct.capabilities.heading}
        />
      </Reveal>

      <Reveal>
        <AttendantDemoSection demo={attendantProduct.demo} onTryLive={tryLive} />
      </Reveal>

      <Reveal>
        <AttendantHowItWorksSection howItWorks={attendantProduct.howItWorks} />
      </Reveal>

      <Reveal>
        <AttendantInstallSection installation={attendantProduct.installation} />
      </Reveal>

      <Reveal>
        <AttendantPricingSection
          pricing={attendantProduct.pricing}
          regionId={region.id}
          onRegionChange={setRegionId}
        />
      </Reveal>

      <Reveal>
        <AttendantTrustSection trust={attendantProduct.trust} />
      </Reveal>

      <Reveal>
        <PeopleAskSection
          items={attendantProduct.faq}
          intro="Straight answers about Sleekly Attendant before you order."
          ctaHref={region.ctaHref}
          ctaLabel={region.ctaLabel}
        />
      </Reveal>

      <AttendantFinalCta finalCta={attendantProduct.finalCta} region={region} />
    </>
  )
}
