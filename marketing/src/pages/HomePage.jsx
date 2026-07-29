import HeroSection from '../components/sections/HeroSection'
import ServicesSection from '../components/sections/ServicesSection'
import ServicesExtendedSection from '../components/sections/ServicesExtendedSection'
import BeforeAfterSection from '../components/sections/BeforeAfterSection'
import ProcessSection from '../components/sections/ProcessSection'
import TrustProofSection from '../components/sections/TrustProofSection'
import ContactInfoSection from '../components/sections/ContactInfoSection'
import ContactCtaBand from '../components/site/ContactCtaBand'
import PortfolioBannerSection from '../components/sections/PortfolioBannerSection'
import GamifiedContactForm from '../components/forms/GamifiedContactForm'
import Reveal from '../components/motion/Reveal'

export default function HomePage({ onOpenInquiry }) {
  return (
    <>
      <HeroSection />

      <Reveal>
        <ServicesSection onOpenInquiry={onOpenInquiry} />
      </Reveal>

      {/* Real anchors used by nav dropdowns */}
      <div id="webdesign" className="scroll-mt-24" />
      <div id="appdev" className="scroll-mt-24" />
      <div id="marketing" className="scroll-mt-24" />
      <div id="graphics" className="scroll-mt-24" />

      <Reveal delay={0.05}>
        <ServicesExtendedSection onOpenInquiry={onOpenInquiry} />
      </Reveal>

      <Reveal delay={0.05}>
        <BeforeAfterSection />
      </Reveal>

      <Reveal delay={0.05}>
        <ProcessSection />
      </Reveal>

      <Reveal delay={0.05}>
        <TrustProofSection />
      </Reveal>

      <Reveal delay={0.05}>
        <WhyUsSection />
      </Reveal>

      <Reveal delay={0.05}>
        <ContactInfoSection />
      </Reveal>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-3xl border border-cream-deep bg-white p-6 shadow-sm sm:p-8">
              <GamifiedContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal delay={0.05}>
        <ContactCtaBand />
      </Reveal>

      <Reveal delay={0.05}>
        <PortfolioBannerSection />
      </Reveal>
    </>
  )
}
