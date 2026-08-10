import { useSearchParams, Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import GamifiedOrderWizard from '../components/order/GamifiedOrderWizard'
import { formatUgx, getPlanById } from '../config/packages'
import { apiEndpoints, hubHref, siteConfig } from '../site.config'

/**
 * Order page shell — soft-neutral surfaces (Wave 9 Phase E).
 * Wizard handles guided steps; sidebar stays supportive, not rainbow.
 */
export default function Order() {
  const [searchParams] = useSearchParams()
  const templateName = searchParams.get('template') || ''

  const templateUrl = templateName
    ? `${apiEndpoints.portfolioDetail}?template=${encodeURIComponent(templateName)}`
    : null

  const { data: templateData, loading: templateLoading, error: templateError } = useFetch(templateUrl)
  const defaultPlan = getPlanById('smart')

  if (templateLoading && templateName) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface-base px-6">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-subtle border-t-emerald"
            aria-hidden="true"
          />
          <p className="text-body text-ink-soft">Loading layout details…</p>
        </div>
      </div>
    )
  }

  if (templateError && templateName) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface-base px-6">
        <div className="max-w-md text-center">
          <p className="font-medium text-status-danger">Could not load layout details.</p>
          <Link
            to="/order"
            className="mt-4 inline-block text-meta font-semibold text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Continue with a custom order →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-base py-10 md:py-14">
      <div className="mx-auto max-w-content space-y-12 px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Order</p>
          <h1 className="mt-3 font-display text-display-section text-emerald-deep">
            Tell us about your project — then start with a deposit
          </h1>
          <p className="mt-4 text-body text-ink-soft">
            Complete a short guided form. When you&apos;re ready, pay a deposit with Flutterwave (MoMo, card, or bank)
            and we begin building.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <GamifiedOrderWizard templateName={templateName} templateData={templateData} />

          <div className="space-y-6">
            {templateData ? (
              <section className="overflow-hidden rounded-xl border border-subtle bg-surface-raised p-6 shadow-sm">
                <h2 className="font-display text-display-card text-emerald-deep">Layout preview</h2>
                <img
                  src={templateData.mainImage}
                  alt={templateData.title}
                  className="mt-4 h-64 w-full rounded-lg object-cover"
                />
                <h3 className="mt-4 font-semibold text-ink">{templateData.title}</h3>
                <p className="mt-2 text-meta text-ink-soft">{templateData.description}</p>
              </section>
            ) : null}

            <section className="rounded-xl border border-subtle bg-surface-raised p-6 shadow-sm">
              <h2 className="font-display text-display-card text-emerald-deep">How it works</h2>
              <ol className="mt-5 space-y-5 text-meta text-ink-soft">
                {[
                  {
                    title: 'Choose your design',
                    body: 'Full ownership of the website is yours once your order is complete.',
                  },
                  {
                    title: 'We build it',
                    body: 'After payment, we contact you for business details and start. Customizations are included.',
                  },
                  {
                    title: 'Go live',
                    body: 'We set everything up and walk you through launch — including domain options if you need one.',
                  },
                ].map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action-primary-hover text-xs font-bold text-cream">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-1">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-content-secondary">
                Deposits from {formatUgx(defaultPlan.depositUgx)} depending on package. Balance due before launch.
              </p>
            </section>

            <section className="rounded-xl border border-subtle bg-surface-sunken p-6">
              <h2 className="font-display text-display-card text-emerald-deep">Need help choosing?</h2>
              <p className="mt-2 text-meta text-ink-soft">Talk to our team before you pay — no pressure.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={siteConfig.scheduleCall}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-5 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Schedule a free call
                </a>
                <a
                  href={hubHref('contact')}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-subtle bg-surface-raised px-5 text-meta font-semibold text-emerald-deep transition hover:bg-surface-base focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Message us
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
