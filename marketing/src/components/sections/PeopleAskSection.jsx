import { useEffect, useId, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FiChevronDown, FiArrowRight } from 'react-icons/fi'
import { Section, SectionHeading } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { cn } from '../../lib/utils'
import { siteConfig } from '../../site.config'

/**
 * FAQ Variant A — simple accordion (design-os/patterns/faq.md).
 * Multi-open, button-inside-heading, ≥56px rows, no two-column grid.
 * Deep links expand the matching id from the URL hash.
 */
function FaqItem({ item, open, onToggle, reducedMotion }) {
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="border-b border-cream-deep">
      <h3 className="m-0 text-body font-semibold text-emerald-deep">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
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

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={cn(!open && 'hidden')}
      >
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

      <div className="mt-12 max-w-3xl border-t border-cream-deep">
        {items.map((item) => (
          <div key={item.id} id={item.id} className="scroll-mt-28">
            <FaqItem
              item={item}
              open={openIds.has(item.id)}
              onToggle={() => toggle(item.id)}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-3xl rounded-2xl border border-cream-deep bg-surface-raised p-6 sm:p-7">
        <p className="display-card text-emerald-deep">Still deciding?</p>
        <p className="mt-2 text-body text-ink-soft">
          Tell us what you need. We reply within one working day — no auto-reply black hole.
        </p>
        <ActionLink href={siteConfig.links.contact} variant="emerald" className="mt-5">
          Start a project
          <FiArrowRight aria-hidden="true" />
        </ActionLink>
      </div>
    </Section>
  )
}
