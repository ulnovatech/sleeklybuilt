import { useEffect, useState } from 'react'
import PortfolioCard from '../components/PortfolioCard'
import FAQ from '../components/FAQ'
import { hubHref } from '../site.config'

/**
 * Layouts gallery home — soft-neutral mood (Wave 9 Phase E).
 * No rainbow icon strips; semantic tokens only.
 */
export default function Home() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetch(`${API_URL}/portfolios.php?collection=websites`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setTemplates(data.templates)
        } else {
          setError(data.error || 'Failed to load templates')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [API_URL])

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-16 lg:px-10">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-subtle bg-surface-raised" />
          ))}
        </div>
        <p className="sr-only">Loading layouts…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center lg:px-10">
        <h1 className="font-display text-display-section text-emerald-deep">Couldn&apos;t load layouts</h1>
        <p className="mt-3 text-body text-ink-soft">{error}</p>
        <a
          href={hubHref('contact')}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          Contact us
        </a>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center lg:px-10">
        <h1 className="font-display text-display-section text-emerald-deep">Website layouts</h1>
        <p className="mt-3 text-body text-ink-soft">
          No published website layouts are available right now. Check back soon, or contact us from the main site.
        </p>
        <a
          href={hubHref('contact')}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          Start a project
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10 lg:px-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Layouts</p>
        <h1 className="mt-3 font-display text-display-section text-emerald-deep">Website layouts you can open and click through</h1>
        <p className="mt-3 text-body text-ink-soft">
          Pick a starting layout, preview it live, then place a deposit to begin customization.
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <PortfolioCard
            key={tpl.name}
            templateName={tpl.name}
            title={tpl.title}
            description={tpl.description}
            mainImage={tpl.mainImage}
            thumbnails={tpl.thumbnails}
            link={tpl.entry}
          />
        ))}
      </div>

      <section className="mt-16 border-t border-subtle pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-section text-emerald-deep">Why start from a layout</h2>
          <ul className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            {[
              { title: 'Faster path', body: 'A proven structure means less guessing before you launch.' },
              { title: 'Yours to own', body: 'Customization and full ownership once the build is complete.' },
              { title: 'Real preview', body: 'Open the live layout before you pay a deposit.' },
            ].map((item) => (
              <li key={item.title} className="rounded-xl border border-subtle bg-surface-raised p-5">
                <h3 className="font-display text-display-card text-emerald-deep">{item.title}</h3>
                <p className="mt-2 text-meta text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQ />
    </div>
  )
}
