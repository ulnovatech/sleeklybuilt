import { FiArrowRight } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from '../site/Section'
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

      <SectionBody>
        <ul className="grid gap-6 md:grid-cols-2">
          {productLines.map(({ id, label, tagline, href, badge, icon: Icon }) => (
            <li key={id}>
              <NavLink
                item={{ href }}
                className="group flex h-full min-h-11 items-start gap-5 rounded-dos-xl border border-subtle bg-surface-raised p-6 shadow-sm transition duration-fast ease-dos hover:border-action-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 sm:p-7"
              >
                <span
                  className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-dos-lg bg-action-primary-hover/10 text-lg text-emerald-deep"
                  aria-hidden="true"
                >
                  <Icon />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="display-card text-emerald-deep">{label}</span>
                    {badge ? (
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-ink">
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-body text-ink-soft">{tagline}</span>
                </span>

                <FiArrowRight
                  aria-hidden="true"
                  className="mt-1.5 shrink-0 text-content-muted transition duration-fast ease-dos group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </NavLink>
            </li>
          ))}
        </ul>
      </SectionBody>
    </Section>
  )
}
