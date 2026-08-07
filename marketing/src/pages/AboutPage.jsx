import { FiCheckCircle } from 'react-icons/fi'
import Reveal from '../components/motion/Reveal'
import { trustCommitments } from '../config/proof'
import { siteConfig } from '../site.config'
import { usePageTitle } from '../lib/usePageTitle'

export default function AboutPage() {
  usePageTitle('About')

  return (
    <>
      <section className="bg-emerald-deep pb-16 pt-32 text-cream md:pb-20 md:pt-36">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-gold">About {siteConfig.name}</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">Your tech partner from concept to launch — and beyond</h1>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <img
              src="/assets/img/about.jpg"
              alt={`${siteConfig.name} team at work`}
              className="w-full rounded-2xl object-cover shadow-lg"
              onError={(e) => {
                e.currentTarget.src = siteConfig.links.logo
              }}
            />
            <div className="mt-6 space-y-4 text-gray-600">
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
              <p className="text-lg italic text-gray-700">
                Our commitment to excellence is at the heart of everything we do. We work with integrity and efficiency,
                keeping today&apos;s users front and center.
              </p>
              <div>
                <h2 className="text-xl font-bold text-gray-900">What sets us apart</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    'Human-centered design that drives satisfaction and engagement',
                    'Innovative design & engineering — visually striking and reliable',
                    'Continuous growth with scalable, future-ready technology',
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-gray-600">
                      <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src="/assets/img/about-2.jpg"
                alt={`${siteConfig.name} collaboration`}
                className="w-full rounded-2xl object-cover shadow-md"
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
      <section className="border-y border-cream-deep bg-surface-raised py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow">What you can count on</p>
            <h2 className="display-section mt-4 text-emerald-deep">Promises we keep</h2>
          </Reveal>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {trustCommitments.map((item) => (
              <Reveal key={item.title}>
                <li className="rounded-2xl border border-cream-deep bg-surface-base p-6 shadow-sm">
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
