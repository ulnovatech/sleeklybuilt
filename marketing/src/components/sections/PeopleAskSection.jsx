import { useEffect, useId, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FiChevronDown, FiArrowRight } from 'react-icons/fi'
import { Section, SectionBody, SectionHeading } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { cn } from '../../lib/utils'
import { siteConfig, siteUrl } from '../../site.config'

const FAQ_SCRIPT_ID = 'sleeklybuilt-jsonld-faq'

/**
 * FAQ Variant A — simple accordion (design-os/patterns/faq.md).
 * Multi-open, button-inside-heading, ≥56px rows, no two-column grid.
 */
function FaqItem({ item, open, onToggle, reducedMotion }) {
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="border-b border-subtle">
      <h3 className="m-0 text-body font-semibold text-emerald-deep">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
        >
          <span>{item.question}</span>
          <FiChevronDown
            aria-hidden="true"
            className={cn(
              'h-5 w-5 shrink-0 text-ink-soft',
              !reducedMotion && 'transition-transform duration-fast ease-dos',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>

      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className={cn(!open && 'hidden')}>
        <p className="max-w-measure pb-5 text-body text-ink-soft">{item.answer}</p>
      </div>
    </div>
  )
}

export default function PeopleAskSection({
  items = [],
  eyebrow = 'People ask',
  title = 'Straight answers before you write',
  intro,
  id = 'faq',
  /** Product pages pass a directed CTA; undecided surfaces keep “Start a project”. */
  ctaHref = siteConfig.links.contact,
  ctaLabel = 'Start a project',
}) {
  const reducedMotion = useReducedMotion()
  const [openIds, setOpenIds] = useState(() => new Set())

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const match = items.find((item) => item.id === hash)
    if (!match) return
    setOpenIds(new Set([match.id]))
    const node = document.getElementById(match.id)
    node?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [items, reducedMotion])

  /** FAQPage JSON-LD mirrors visible Q&A (semantic / AI search — not retired Google FAQ rich results). */
  useEffect(() => {
    if (!items.length || items.length < 4 || typeof document === 'undefined') return undefined

    const base = siteUrl.replace(/\/$/, '')
    const graph = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${base}${window.location.pathname || '/'}#faq`,
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }

    let el = document.getElementById(FAQ_SCRIPT_ID)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = FAQ_SCRIPT_ID
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(graph)

    return () => {
      el?.remove()
    }
  }, [items])

  if (!items.length || items.length < 4) return null

  const toggle = (itemId) => {
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  return (
    <Section id={id} className="section-light scroll-mt-24">
      <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />

      <SectionBody>
        <div className="max-w-3xl border-t border-subtle">
          {items.map((item) => (
            <div
              key={item.id}
              id={item.id}
              data-attendant-section={item.id}
              className="scroll-mt-28"
            >
              <FaqItem
                item={item}
                open={openIds.has(item.id)}
                onToggle={() => toggle(item.id)}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-3xl rounded-dos-xl border border-subtle bg-surface-raised p-6 sm:p-7">
          <p className="display-card text-emerald-deep">Still deciding?</p>
          <p className="mt-2 text-body text-ink-soft">
            Tell us what you need on the contact form, or message us on WhatsApp. We reply within one working
            day.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink href={ctaHref} variant="emerald">
              {ctaLabel}
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href={siteConfig.whatsapp} variant="ghostLight" className="sm:w-auto">
              Message on WhatsApp
            </ActionLink>
          </div>
        </div>
      </SectionBody>
    </Section>
  )
}
