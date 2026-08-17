import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import { fetchPolicyBySlug } from '../lib/policiesApi'
import SimpleMarkdown from '../lib/simpleMarkdown'
import { usePageTitle } from '../lib/usePageTitle'
import { siteConfig } from '../site.config'

/**
 * Single PUBLIC policy — markdown from attendant/company via public_policy.php.
 */
export default function PolicyDetailPage() {
  const { slug = '' } = useParams()
  const [state, setState] = useState({ status: 'loading', title: 'Policy', markdown: '', error: '' })

  usePageTitle(state.title || 'Policy')

  const load = () => {
    if (!slug) {
      setState({ status: 'error', title: 'Policy', markdown: '', error: 'Missing policy.' })
      return
    }
    setState({ status: 'loading', title: 'Policy', markdown: '', error: '' })
    fetchPolicyBySlug(slug)
      .then((result) => {
        if (!result.ok) {
          setState({
            status: 'error',
            title: 'Policy',
            markdown: '',
            error:
              result.code === 'forbidden'
                ? 'That document is not available on the public site.'
                : result.error || 'We could not find that policy.',
          })
          return
        }
        setState({
          status: 'ready',
          title: result.title || 'Policy',
          markdown: result.markdown || '',
          error: '',
        })
      })
      .catch(() => {
        setState({
          status: 'error',
          title: 'Policy',
          markdown: '',
          error: 'Something went wrong. Check your connection and try again.',
        })
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when slug changes
  }, [slug])

  return (
    <>
      <PageHeader
        eyebrow="Policies"
        title={state.status === 'ready' ? state.title : 'Policy'}
        intro={
          state.status === 'ready'
            ? 'Operating policy for SleeklyBuilt digital services.'
            : 'Loading the document you asked for.'
        }
        actions={
          <Link
            to={siteConfig.links.policies}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-cream/85 hover:text-gold focus:outline-none focus-visible:underline"
          >
            <FiArrowLeft aria-hidden="true" /> All policies
          </Link>
        }
      />

      <section
        id={slug || undefined}
        {...(slug ? { 'data-attendant-section': slug } : {})}
        className="section-light scroll-mt-24"
      >
        <div className="mx-auto max-w-2xl px-6 lg:px-10">
          {state.status === 'loading' ? (
            <div className="space-y-4" aria-busy="true" aria-label="Loading policy">
              <div className="h-6 w-2/3 animate-pulse rounded bg-cream-deep/70" />
              <div className="h-4 w-full animate-pulse rounded bg-cream-deep/70" />
              <div className="h-4 w-full animate-pulse rounded bg-cream-deep/70" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-cream-deep/70" />
              <div className="h-4 w-full animate-pulse rounded bg-cream-deep/70" />
            </div>
          ) : null}

          {state.status === 'error' ? (
            <div className="rounded-lg border border-subtle bg-surface-raised p-6" role="alert">
              <h2 className="font-display text-lg font-semibold text-emerald-deep">Could not open this policy</h2>
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
                  to={siteConfig.links.policies}
                  className="inline-flex min-h-11 items-center text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Back to policies
                </Link>
                <Link
                  to={siteConfig.links.contact}
                  className="inline-flex min-h-11 items-center text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Contact us
                </Link>
              </div>
            </div>
          ) : null}

          {state.status === 'ready' ? (
            <article>
              <SimpleMarkdown markdown={state.markdown} />
              <p className="mt-12 border-t border-subtle pt-6 text-meta text-ink-soft">
                Questions about this policy?{' '}
                <Link
                  to={siteConfig.links.contact}
                  className="text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Contact us
                </Link>
                .
              </p>
            </article>
          ) : null}
        </div>
      </section>
    </>
  )
}
