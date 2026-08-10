import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { hubHref } from '../site.config'

const faqData = [
  {
    question: 'What services does SleeklyBuilt offer?',
    answer:
      'Website development, web apps, UI/UX design, mobile apps, software systems, pitch decks, dashboard UI, and SEO & performance work.',
  },
  {
    question: "I don't have a design — can you build it?",
    answer:
      "Yes. We'll collaborate on structure and visuals, then build a solution that fits your brand and goals.",
  },
  {
    question: 'Do you offer custom solutions?',
    answer: 'Yes. Custom software and websites tailored to your workflows — not one-size-fits-all templates sold as finished products.',
  },
  {
    question: 'Do I need a website for my business?',
    answer: 'If customers need to find you, trust you, or take action online — yes. We can help you decide the right scope.',
  },
  {
    question: 'How long does a website take?',
    answer:
      'Typical layouts take about 1–4 weeks; custom builds often 4–12 weeks, depending on scope. We agree a timeline before work starts.',
  },
  {
    question: 'How much does a website cost?',
    answer:
      'It depends on features and integrations. Many projects start in the hundreds of thousands of UGX and scale from there. Request a quote for an exact estimate.',
  },
]

/**
 * FAQ accordion — soft-neutral tokens; one primary CTA (Wave 9 Phase E).
 */
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="mt-16 border-t border-subtle bg-surface-sunken py-16">
      <div className="mx-auto max-w-3xl px-0">
        <div className="text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 font-display text-display-section text-emerald-deep">Questions clients ask</h2>
          <p className="mt-3 text-body text-ink-soft">Quick answers about layouts, timelines, and custom work.</p>
        </div>

        <div className="mt-10 space-y-3">
          {faqData.map((faq, index) => {
            const open = openIndex === index
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-sunken/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dos"
                >
                  <span className="font-display text-display-card text-emerald-deep">{faq.question}</span>
                  <FiChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-soft transition ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {open ? (
                  <div className="border-t border-subtle px-5 py-4">
                    <p className="text-body text-ink-soft">{faq.answer}</p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href={hubHref('contact')}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
          >
            Start a project
          </a>
        </div>
      </div>
    </section>
  )
}
