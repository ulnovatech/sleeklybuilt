import { useEffect, useId, useMemo, useState, Fragment } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiMinus } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import ActionLink from '../components/site/ActionLink'
import ContactCtaBand from '../components/site/ContactCtaBand'
import PeopleAskSection from '../components/sections/PeopleAskSection'
import { Section, SectionHeading } from '../components/site/Section'
import Reveal from '../components/motion/Reveal'
import {
  appEnterprise,
  appPackages,
  formatUgx,
  pricingFaq,
  websiteEnterprise,
  websiteFeatureMatrix,
  websitePackages,
} from '../config/pricing'
import { siteConfig } from '../site.config'
import { usePageTitle } from '../lib/usePageTitle'
import { cn } from '../lib/utils'

const CATEGORIES = [
  { id: 'websites', label: 'Websites' },
  { id: 'apps', label: 'Apps & systems' },
]

function MatrixCell({ value }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center gap-1.5 text-emerald-deep">
        <FiCheck aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">Included</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-content-muted">
        <FiMinus aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">Not included</span>
      </span>
    )
  }
  return <span className="text-body text-ink-soft">{value}</span>
}

function PlanCard({ pkg }) {
  const price = pkg.priceLabel || formatUgx(pkg.priceUgx)
  const bullets = pkg.differentiators?.slice(0, 3) || pkg.features?.slice(0, 3) || []

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border bg-surface-raised p-6 shadow-sm sm:p-7',
        pkg.recommended ? 'border-emerald/40 shadow-md ring-1 ring-emerald/15' : 'border-cream-deep',
      )}
      aria-label={`${pkg.title}, ${price}, one-time project price in UGX`}
    >
      {pkg.badge ? (
        <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-ink">
          {pkg.badge}
        </span>
      ) : null}

      <div className="min-w-0">
        <h3 className="display-card text-emerald-deep">{pkg.title}</h3>
        <p className="mt-3 font-display text-2xl font-semibold text-ink">{price}</p>
        <p className="mt-1 text-sm text-content-muted">One-time project price · UGX</p>
        <p className="mt-3 text-body text-ink-soft">{pkg.idealFor}</p>
        {pkg.recommendedWhy ? (
          <p className="mt-2 text-sm font-medium text-emerald">{pkg.recommendedWhy}</p>
        ) : null}
        {pkg.pages ? (
          <p className="mt-2 text-meta uppercase tracking-wide text-content-muted">Pages: {pkg.pages}</p>
        ) : null}
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {bullets.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-body text-ink-soft">
            <FiCheck className="mt-1 h-4 w-4 shrink-0 text-emerald" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm font-medium text-ink">{pkg.highlight}</p>

      <ActionLink
        href={pkg.cta}
        variant="emerald"
        className="mt-6 w-full"
      >
        {pkg.ctaLabel || 'Start a project'}
        <FiArrowRight aria-hidden="true" />
      </ActionLink>
    </article>
  )
}

function EnterpriseBand({ band }) {
  return (
    <div className="mt-10 rounded-2xl border border-cream-deep bg-surface-sunken p-6 sm:p-8 md:flex md:items-end md:justify-between md:gap-10">
      <div className="max-w-2xl">
        <p className="eyebrow">Custom scope</p>
        <h3 className="mt-3 display-card text-emerald-deep">{band.title}</h3>
        <p className="mt-2 text-body text-ink-soft">{band.idealFor}</p>
        <p className="mt-4 font-display text-xl font-semibold text-ink">{band.priceLabel}</p>
        <ul className="mt-4 space-y-2">
          {band.differentiators.map((item) => (
            <li key={item} className="flex gap-2 text-body text-ink-soft">
              <FiCheck className="mt-1 h-4 w-4 shrink-0 text-emerald" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <ActionLink href={band.cta} variant="emerald" className="mt-6 md:mt-0">
        {band.ctaLabel}
        <FiArrowRight aria-hidden="true" />
      </ActionLink>
    </div>
  )
}

function WebsiteFeatureMatrix({ plans }) {
  const planIds = plans.map((p) => p.id)
  const [visible, setVisible] = useState(() => planIds.slice(0, 2))
  const groupId = useId()

  useEffect(() => {
    setVisible(planIds.slice(0, 2))
  }, [planIds.join('|')])

  const togglePlan = (id) => {
    setVisible((current) => {
      if (current.includes(id)) {
        if (current.length <= 1) return current
        return current.filter((x) => x !== id)
      }
      if (current.length >= 2) return [current[1], id]
      return [...current, id]
    })
  }

  return (
    <div className="mt-16">
      <SectionHeading
        eyebrow="Compare"
        title="What differs between website packages"
        intro="Shared basics are omitted so the real differences stay visible."
      />

      <div className="mt-6 md:hidden" role="group" aria-labelledby={groupId}>
        <p id={groupId} className="text-meta font-semibold text-emerald-deep">
          Show two plans
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {plans.map((plan) => {
            const on = visible.includes(plan.id)
            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={on}
                onClick={() => togglePlan(plan.id)}
                className={cn(
                  'min-h-11 rounded-full border px-4 py-2 text-meta font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                  on
                    ? 'border-emerald/40 bg-emerald-deep text-cream'
                    : 'border-cream-deep bg-surface-raised text-ink-soft',
                )}
              >
                {plan.title}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cream-deep">
        <table className="min-w-full border-collapse text-left">
          <thead className="sticky top-0 bg-surface-raised">
            <tr className="border-b border-cream-deep">
              <th scope="col" className="sticky left-0 z-10 bg-surface-raised px-4 py-3 text-meta font-semibold text-emerald-deep">
                Feature
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-meta font-semibold text-emerald-deep',
                    !visible.includes(plan.id) && 'hidden md:table-cell',
                  )}
                >
                  {plan.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {websiteFeatureMatrix.map((group) => (
              <Fragment key={group.category}>
                <tr>
                  <th
                    colSpan={plans.length + 1}
                    scope="colgroup"
                    className="bg-surface-sunken px-4 py-2 text-meta font-semibold uppercase tracking-wide text-content-muted"
                  >
                    {group.category}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.feature} className="border-t border-cream-deep">
                    <th
                      scope="row"
                      className="sticky left-0 bg-surface-raised px-4 py-3 text-body font-medium text-ink"
                    >
                      {row.feature}
                    </th>
                    {plans.map((plan) => (
                      <td
                        key={`${row.feature}-${plan.id}`}
                        className={cn(
                          'px-4 py-3',
                          !visible.includes(plan.id) && 'hidden md:table-cell',
                        )}
                      >
                        <MatrixCell value={row.values[plan.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Pricing — patterns/pricing.md + UX-GATE §8.5
 * Category control stands in for SaaS period toggle; currency is UGX-only (honest).
 */
export default function PricesPage() {
  usePageTitle('Pricing')
  const [searchParams, setSearchParams] = useSearchParams()
  const category = CATEGORIES.some((c) => c.id === searchParams.get('category'))
    ? searchParams.get('category')
    : 'websites'
  const tablistId = useId()

  const packages = useMemo(() => {
    const list = category === 'websites' ? websitePackages : appPackages
    return [...list].sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)))
  }, [category])

  const enterprise = category === 'websites' ? websiteEnterprise : appEnterprise

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams)
    next.set('category', id)
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        eyebrow="Transparent pricing"
        title="Packages built for Ugandan businesses"
        intro="Website layouts from our portfolio include deposit checkout. Custom apps and systems start with a scoped quote."
        actions={
          <>
            <ActionLink href={`${siteConfig.links.contact}?intent=pricing`}>
              Ask about pricing
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href={siteConfig.links.trackOrder} variant="ghostDark">
              Track an order
            </ActionLink>
          </>
        }
      />

      <Section className="section-light" id="plans">
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          role="tablist"
          aria-label="Package category"
          id={tablistId}
        >
          <div className="inline-flex rounded-2xl border border-cream-deep bg-surface-raised p-1 shadow-sm">
            {CATEGORIES.map((item) => {
              const selected = category === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`pricing-tab-${item.id}`}
                  onClick={() => setCategory(item.id)}
                  className={cn(
                    'min-h-11 rounded-xl px-5 py-2.5 text-meta font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                    selected
                      ? 'bg-action-primary-hover text-cream'
                      : 'text-ink-soft hover:text-emerald-deep',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <p className="text-sm text-content-muted" aria-live="polite">
            Currency: <span className="font-semibold text-ink">UGX</span>
            {' · '}
            One-time project prices
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-cream-deep bg-surface-raised p-8 text-center">
            <p className="display-card text-emerald-deep">No packages in this category yet</p>
            <p className="mt-2 text-body text-ink-soft">Tell us what you need and we will quote honestly.</p>
            <ActionLink href={`${siteConfig.links.contact}?intent=pricing`} variant="emerald" className="mt-6">
              Start a project
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {packages.map((pkg, i) => (
              <li key={pkg.id}>
                <Reveal delay={i * 0.03}>
                  <PlanCard pkg={pkg} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        <EnterpriseBand band={enterprise} />

        {category === 'websites' ? <WebsiteFeatureMatrix plans={websitePackages} /> : null}

        <p className="mt-12 max-w-3xl text-sm text-ink-soft" id="tax-note">
          <span className="font-semibold text-emerald-deep">Tax & currency. </span>
          Prices are listed in UGX and exclude VAT unless your written quote says otherwise. Tax is confirmed
          before deposit. We do not show converted foreign-currency estimates on this page.
        </p>

        <p className="mt-4 text-sm text-content-muted">
          Already paid a deposit?{' '}
          <a
            href={siteConfig.links.trackOrder}
            className="font-semibold text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Track an existing order
          </a>
          .
        </p>
      </Section>

      <Reveal>
        <PeopleAskSection
          items={pricingFaq}
          eyebrow="Pricing questions"
          title="Before you choose a package"
          intro="Tax, currency, and what happens if the fit is wrong."
          id="pricing-faq"
        />
      </Reveal>

      <ContactCtaBand />
    </>
  )
}
