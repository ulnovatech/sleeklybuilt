import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import { fetchPolicyList } from '../lib/policiesApi'
import { usePageTitle } from '../lib/usePageTitle'
import { siteConfig } from '../site.config'

/**
 * Public policies index — same PUBLIC corpus as attendant/company via public_policy.php.
 *
 * Design OS: content_intelligence + empty/loading/error states; PageHeader (marketing).
 * Journey: Footer/Attendant → list → open one policy → read or Contact.
 */
export default function PoliciesPage() {
  usePageTitle('Policies')
  const [state, setState] = useState({ status: 'loading', policies: [], error: '' })

  const load = () => {
    setState({ status: 'loading', policies: [], error: '' })
    fetchPolicyList()
      .then((result) => {
        if (!result.ok) {
          setState({ status: 'error', policies: [], error: result.error || 'Could not load policies.' })
          return
        }
        const policies = result.policies || []
        if (policies.length === 0) {
          setState({ status: 'empty', policies: [], error: '' })
          return
        }
        setState({ status: 'ready', policies, error: '' })
      })
      .catch(() => {
        setState({
          status: 'error',
          policies: [],
          error: 'Something went wrong. Check your connection and try again.',
        })
      })
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <PageHeader
        eyebrow="Policies"
        title="How we work with clients"
        intro="Clear terms for payments, delivery, privacy, and support — the same documents our site attendant uses."
      />

      <section className="section-light">
        <div className="mx-auto max-w-2xl px-6 lg:px-10">
          {state.status === 'loading' ? (
            <ul className="space-y-3" aria-busy="true" aria-label="Loading policies">
              {[1, 2, 3, 4].map((n) => (
                <li
                  key={n}
                  className="h-14 animate-pulse rounded-lg bg-cream-deep/70"
                  aria-hidden="true"
                />
              ))}
            </ul>
          ) : null}

          {state.status === 'empty' ? (
            <div className="rounded-lg border border-subtle bg-surface-raised p-6" role="status">
              <h2 className="font-display text-lg font-semibold text-emerald-deep">No policies published yet</h2>
              <p className="mt-2 text-body text-ink-soft">
                Public policy documents are not available right now. Reach out and we will share what you need.
              </p>
              <Link
                to={siteConfig.links.contact}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Contact us <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {state.status === 'error' ? (
            <div className="rounded-lg border border-subtle bg-surface-raised p-6" role="alert">
              <h2 className="font-display text-lg font-semibold text-emerald-deep">Could not load policies</h2>
              <p className="mt-2 text-body text-ink-soft">{state.error}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald px-4 text-sm font-medium text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Try again
                </button>
                <Link
                  to={siteConfig.links.contact}
                  className="inline-flex min-h-11 items-center text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Contact us
                </Link>
              </div>
            </div>
          ) : null}

          {state.status === 'ready' ? (
            <nav aria-label="Public policies">
              <ul className="divide-y divide-subtle border-y border-subtle">
                {state.policies.map((policy) => (
                  <li
                    key={policy.id}
                    id={policy.slug}
                    data-attendant-section={policy.slug}
                    className="scroll-mt-28"
                  >
                    <Link
                      to={policy.route || `/policies/${policy.slug}`}
                      className="group flex min-h-14 items-center justify-between gap-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
                    >
                      <span className="font-display text-base font-semibold text-emerald-deep group-hover:text-emerald">
                        {policy.title}
                      </span>
                      <FiArrowRight
                        className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-emerald"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </section>
    </>
  )
}
