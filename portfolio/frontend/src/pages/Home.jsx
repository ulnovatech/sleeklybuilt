import { useEffect, useState } from 'react'
import PortfolioCard from '../components/PortfolioCard'
import FAQ from '../components/FAQ'
import { hubHref } from '../site.config'

export default function Home() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetch(`${API_URL}/portfolios.php`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setTemplates(data.templates)
        } else {
          setError(data.error || 'Failed to load layouts')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [API_URL])

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-5 py-16 lg:px-8" role="status" aria-live="polite">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-surface-sunken" />
          ))}
        </div>
        <p className="sr-only">Loading layouts…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-content px-5 py-16 lg:px-8" role="alert">
        <h1 className="display-section text-emerald-deep">Couldn’t load layouts</h1>
        <p className="mt-3 text-content-secondary">{error}</p>
        <a
          href={hubHref('contact')}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-content-primary"
        >
          Contact us instead
        </a>
      </div>
    )
  }

  return (
    <div>
      <section className="mx-auto max-w-content px-5 py-12 lg:px-8 lg:py-16">
        <p className="eyebrow">Layouts</p>
        <h1 className="display-section mt-4 text-emerald-deep">Available website layouts</h1>
        <p className="lead mt-3 text-content-secondary">
          Browse live previews, then order a package or request a custom build.
        </p>

        {templates.length === 0 ? (
          <p className="mt-10 text-content-secondary">
            No layouts are published yet.{' '}
            <a href={hubHref('contact')} className="font-semibold text-content-link underline-offset-2 hover:underline">
              Tell us what you need
            </a>
            .
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {templates.map((tpl) => (
              <PortfolioCard
                key={tpl.name}
                title={tpl.title}
                description={tpl.description}
                mainImage={tpl.mainImage}
                mobileImage={tpl.mobileImage}
                thumbnails={tpl.thumbnails}
                link={tpl.entry}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-subtle bg-surface-raised">
        <div className="mx-auto max-w-content px-5 py-14 lg:px-8">
          <h2 className="display-section text-emerald-deep">Why teams choose SleeklyBuilt</h2>
          <p className="lead mt-3 text-content-secondary">
            Clear process, live proof, and builds you can click through before you commit.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Premium, intentional design',
              'Fast, realistic turnaround',
              'Responsive on real devices',
              'SEO-ready structure',
              'Support after launch',
              'Motion that clarifies, not distracts',
            ].map((text) => (
              <li key={text} className="flex gap-3 text-body text-content-secondary">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-action-soft" aria-hidden="true" />
                <span className="font-medium text-content-primary">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQ />
    </div>
  )
}
