import { FiArrowRight } from 'react-icons/fi'
import { Section, SectionHeading } from '../site/Section'
import NavLink from '../layout/NavLink'
import { productLines } from '../../config/products'

export default function WhatWeBuildSection() {
  return (
    <Section id="what-we-build" className="section-light scroll-mt-24">
      <SectionHeading
        eyebrow="What we build"
        title="Four ways to work with us"
        intro="Start where you are. Each one is a product line, not a package tier."
      />

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {productLines.map(({ id, label, tagline, href, badge, icon: Icon }) => (
          <li key={id}>
            <NavLink
              item={{ href }}
              className="group flex h-full items-start gap-5 rounded-2xl border border-cream-deep bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 sm:p-7"
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
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-ink">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block text-body text-ink-soft">{tagline}</span>
              </span>

              <FiArrowRight
                aria-hidden="true"
                className="mt-1.5 shrink-0 text-cream-deep transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold"
              />
            </NavLink>
          </li>
        ))}
      </ul>
    </Section>
  )
}
