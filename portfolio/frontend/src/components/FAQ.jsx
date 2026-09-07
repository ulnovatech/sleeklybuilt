import { useState } from 'react'
import { hubHref } from '../site.config'

const faqData = [
  {
    question: 'What services does SleeklyBuilt offer?',
    answer:
      'Websites, web apps, UI/UX, mobile apps, business systems, pitch decks, dashboards, and SEO & performance work — scoped to what your business actually needs.',
  },
  {
    question: "I don't have a design — can you build it?",
    answer:
      'Yes. We design and build from your goals and brand cues, then iterate with you until the layout and product feel right.',
  },
  {
    question: 'Do you offer custom solutions?',
    answer:
      'Yes. Custom software and systems that match how your team works — not one-size-fits-all templates.',
  },
  {
    question: 'Do I need a website for my business?',
    answer:
      'If customers need to find you, trust you, or buy from you online, yes — a clear site is usually the cheapest sales channel you can own.',
  },
  {
    question: 'How long does a website take?',
    answer:
      'Typical marketing sites land in about 1–4 weeks; custom builds often 4–12 weeks depending on scope. We set a realistic timeline before you commit.',
  },
  {
    question: 'How much does a website cost?',
    answer:
      'It depends on scope. Packages start in the low hundreds of thousands UGX and scale with features. Request a quote for a number tied to your brief.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="section-light bg-surface-sunken">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="mb-10">
          <p className="eyebrow">FAQ</p>
          <h2 className="display-section mt-4 text-emerald-deep">Questions clients ask</h2>
          <p className="lead mt-3 text-content-secondary">
            Quick answers about design, timelines, and delivery. Open a question for detail.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, index) => {
            const open = openIndex === index
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-sunken/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dos"
                  aria-expanded={open}
                >
                  <span className="font-display text-base font-semibold text-emerald-deep">{faq.question}</span>
                  <span className="text-content-muted" aria-hidden="true">
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-subtle px-5 py-4">
                    <p className="text-body text-content-secondary">{faq.answer}</p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={hubHref('contact')}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-content-primary transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Start a project
          </a>
          <a
            href={hubHref('prices')}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-subtle px-6 text-sm font-semibold text-emerald-deep transition hover:bg-action-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            See pricing
          </a>
        </div>
      </div>
    </section>
  )
}
