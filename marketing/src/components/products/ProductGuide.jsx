import { useEffect, useId, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FiArrowRight, FiChevronDown } from 'react-icons/fi'
import { Section, SectionHeading } from '../site/Section'
import ActionLink from '../site/ActionLink'
import { productCatalogCategories } from '../../config/productCatalog'
import { siteConfig } from '../../site.config'
import { cn } from '../../lib/utils'

/**
 * Guided capability explorer for /products.
 * Narrowing (catalog): one category at a time.
 * Nesting (disclosure): expand one capability for detail + path forward.
 *
 * Gate: Choose need → scan short list → open one → go to product line or contact.
 */
function CapabilityItem({ item, open, onToggle, reducedMotion }) {
  const panelId = useId()
  const buttonId = useId()

  return (
    <li className="border-b border-subtle last:border-b-0">
      <h3 className="m-0 text-body font-semibold text-emerald-deep">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
        >
          <span className="min-w-0">
            <span className="block">{item.title}</span>
            {!open ? (
              <span className="mt-1 block text-sm font-normal text-ink-soft">{item.blurb}</span>
            ) : null}
          </span>
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
        <p className="max-w-measure pb-5 text-body text-ink-soft">{item.detail}</p>
      </div>
    </li>
  )
}

export default function ProductGuide({ className = '' }) {
  const reducedMotion = useReducedMotion()
  const tablistId = useId()
  const [activeId, setActiveId] = useState(productCatalogCategories[0]?.id ?? 'websites')
  const [openItemId, setOpenItemId] = useState(null)

  const active = productCatalogCategories.find((c) => c.id === activeId) ?? productCatalogCategories[0]

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash.startsWith('guide-')) return
    const categoryId = hash.replace(/^guide-/, '')
    const match = productCatalogCategories.find((c) => c.id === categoryId)
    if (!match) return
    setActiveId(match.id)
    setOpenItemId(null)
    document.getElementById('product-guide')?.scrollIntoView({
      block: 'start',
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [reducedMotion])

  const selectCategory = (id) => {
    setActiveId(id)
    setOpenItemId(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#guide-${id}`)
    }
  }

  if (!active) return null

  return (
    <Section id="product-guide" className={cn('section-light scroll-mt-24', className)}>
      <SectionHeading
        eyebrow="Find a fit"
        title="What do you need to run?"
        intro="Pick a need, then open one capability. We keep the list short on purpose — you should know the next step in under a minute."
      />

      <div className="mt-10">
        <div
          role="tablist"
          aria-label="Product needs"
          id={tablistId}
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
        >
          {productCatalogCategories.map((category) => {
            const selected = category.id === active.id
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={`guide-tab-${category.id}`}
                aria-selected={selected}
                aria-controls={`guide-panel-${category.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectCategory(category.id)}
                className={cn(
                  'min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2',
                  selected
                    ? 'border-emerald-deep bg-emerald-deep text-cream'
                    : 'border-subtle bg-surface-raised text-ink-soft hover:border-emerald/30 hover:text-emerald-deep',
                )}
              >
                {category.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`guide-panel-${active.id}`}
          aria-labelledby={`guide-tab-${active.id}`}
          className="mt-8"
        >
          <div className="max-w-measure">
            <p className="text-meta font-semibold uppercase tracking-wide text-emerald">{active.label}</p>
            <p className="mt-2 text-body text-ink-soft">{active.summary}</p>
          </div>

          <ul className="mt-6 border-t border-subtle">
            {active.items.map((item) => (
              <CapabilityItem
                key={item.id}
                item={item}
                open={openItemId === item.id}
                reducedMotion={reducedMotion}
                onToggle={() =>
                  setOpenItemId((current) => (current === item.id ? null : item.id))
                }
              />
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ActionLink href={active.href} variant="emerald">
              {active.ctaLabel}
              <FiArrowRight aria-hidden="true" />
            </ActionLink>
            <ActionLink href={siteConfig.links.contact} variant="ghostLight">
              Not sure — tell us
            </ActionLink>
          </div>
        </div>
      </div>
    </Section>
  )
}
