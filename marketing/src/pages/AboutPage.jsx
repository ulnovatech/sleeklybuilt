import { FiCheckCircle } from 'react-icons/fi'
import Reveal from '../components/motion/Reveal'
import PageHeader from '../components/site/PageHeader'
import { trustCommitments } from '../config/proof'
import { siteConfig } from '../site.config'
import { usePageTitle } from '../lib/usePageTitle'

/**
 * About — PageHeader (obsidian budget) + soft-neutral body (Wave 9 Phase E).
 * No fabricated metrics; quiet cream eyebrow on dark (not competing gold).
 */
export default function AboutPage() {
  usePageTitle('About')

  return (
    <>
      <PageHeader
        eyebrow={`About ${siteConfig.name}`}
        title="Your tech partner from concept to launch — and beyond"
        intro="We turn concepts into dependable digital solutions — custom software, robust websites, and intuitive mobile apps."
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-content gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <Reveal>
            <img
              src="/assets/img/about.jpg"
              alt={`${siteConfig.name} team at work`}
              className="w-full rounded-dos-xl object-cover shadow-sm"
              onError={(e) => {
                e.currentTarget.src = siteConfig.links.logo
              }}
            />
            <div className="mt-6 space-y-4 text-body text-ink-soft">
              <p>
                At {siteConfig.name}, we believe every great idea deserves a solid digital foundation. We turn concepts into
                dependable digital solutions — custom software, robust websites, and intuitive mobile apps.
              </p>
              <p>
                We are dedicated problem solvers who thrive on real-world challenges: school management platforms,
                SACCO automation, high-performance websites, and more — with innovation, accuracy, and genuine care.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="space-y-6">
              <p className="text-lead text-ink">
                Our commitment to excellence is at the heart of everything we do. We work with integrity and efficiency,
                keeping today&apos;s users front and center.
              </p>
              <div>
                <h2 className="display-card text-emerald-deep">What sets us apart</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    'Human-centered design that drives satisfaction and engagement',
                    'Innovative design & engineering — visually striking and reliable',
                    'Continuous growth with scalable, future-ready technology',
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-body text-ink-soft">
                      <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src="/assets/img/about-2.jpg"
                alt={`${siteConfig.name} collaboration`}
                className="w-full rounded-dos-xl object-cover shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/*
        Verifiable commitments only — no invented client counts or emoji metrics.
        See UX-GATE.md §7 and design-os content / agency honesty rules.
      */}
      <section className="border-y border-subtle bg-surface-raised py-12 md:py-16">
        <div className="mx-auto max-w-content px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">What you can count on</p>
            <h2 className="display-section mt-4 text-emerald-deep">Promises we keep</h2>
          </Reveal>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {trustCommitments.map((item) => (
              <Reveal key={item.title}>
                <li className="rounded-dos-xl border border-subtle bg-surface-base p-6 shadow-sm">
                  <h3 className="display-card text-emerald-deep">{item.title}</h3>
                  <p className="mt-2 text-body text-ink-soft">{item.description}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
