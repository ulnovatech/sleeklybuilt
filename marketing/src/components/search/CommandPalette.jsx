import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertCircle, FiArrowRight, FiLayout, FiSearch, FiX } from 'react-icons/fi'
import { pageEntries, productEntries } from '../../config/searchIndex'
import { useLayoutCatalog } from '../../lib/useLayoutCatalog'
import { cn, isExternalHref } from '../../lib/utils'

/**
 * Relevance score for one entry against a lowercased query. Returns 0 when the
 * entry does not match, so callers can filter on truthiness. Label matches beat
 * keyword matches, and prefix matches beat mid-string ones.
 */
function scoreEntry(entry, query) {
  const label = entry.label.toLowerCase()
  if (label === query) return 120
  if (label.startsWith(query)) return 100
  if (label.includes(query)) return 80

  const keywords = entry.keywords ?? []
  let best = 0
  for (const keyword of keywords) {
    const value = keyword.toLowerCase()
    if (value.startsWith(query)) best = Math.max(best, 60)
    else if (value.includes(query)) best = Math.max(best, 45)
  }
  if (best) return best

  if (entry.description?.toLowerCase().includes(query)) return 30
  return 0
}

function rank(entries, query) {
  if (!query) return entries
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.entry)
}

/**
 * Rendered as the option element itself rather than wrapping a button — focus
 * stays in the input, which is what the combobox pattern requires.
 */
function ResultRow({ entry, active, index, onSelect, onHover }) {
  return (
    <div role="option" aria-selected={active} id={`search-option-${index}`}>
      <div
        onClick={() => onSelect(entry)}
        onMouseMove={() => onHover(index)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 border-l-2 px-4 py-3 text-left transition',
          active ? 'border-gold bg-cream-deep/70' : 'border-transparent hover:bg-cream-deep/40',
        )}
      >
        {entry.thumbnail ? (
          <img
            src={entry.thumbnail}
            alt=""
            loading="lazy"
            className="h-10 w-14 shrink-0 rounded-md border border-cream-deep object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-deep/10 text-emerald-deep">
            {entry.icon ?? <FiArrowRight aria-hidden="true" />}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-emerald-deep">{entry.label}</span>
          {entry.description ? (
            <span className="mt-0.5 block truncate text-meta text-ink-soft">{entry.description}</span>
          ) : null}
        </span>

        <FiArrowRight
          aria-hidden="true"
          className={cn('shrink-0 transition', active ? 'text-gold' : 'text-cream-deep')}
        />
      </div>
    </div>
  )
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const restoreFocusRef = useRef(null)

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  /* The catalog is fetched the first time the palette opens, not on mount. */
  const { layouts, state: layoutState, reload: loadLayouts } = useLayoutCatalog({ enabled: open })

  const layoutEntries = useMemo(
    () =>
      layouts.map((layout) => ({
        id: `layout-${layout.slug}`,
        label: layout.title,
        description: layout.description || undefined,
        href: layout.orderUrl,
        thumbnail: layout.image || undefined,
        keywords: [layout.slug, layout.category].filter(Boolean),
      })),
    [layouts],
  )

  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement
    setQuery('')
    setActiveIndex(0)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      if (restoreFocusRef.current instanceof HTMLElement) restoreFocusRef.current.focus()
    }
  }, [open])

  const normalized = query.trim().toLowerCase()

  const groups = useMemo(() => {
    const ranked = rank(layoutEntries, normalized).map((entry) => ({
      ...entry,
      icon: <FiLayout aria-hidden="true" />,
    }))

    return [
      { id: 'products', label: normalized ? 'Products' : 'What we build', entries: rank(productEntries, normalized) },
      { id: 'pages', label: 'Pages', entries: rank(pageEntries, normalized) },
      {
        id: 'layouts',
        label: 'Layouts',
        entries: normalized ? ranked : ranked.slice(0, 3),
      },
    ].filter((group) => group.entries.length > 0 || group.id === 'layouts')
  }, [layoutEntries, normalized])

  /* Flat list drives keyboard navigation across group boundaries. */
  const flat = useMemo(() => groups.flatMap((group) => group.entries), [groups])

  useEffect(() => {
    setActiveIndex(0)
  }, [normalized])

  const select = useCallback(
    (entry) => {
      onClose()
      if (isExternalHref(entry.href)) window.location.assign(entry.href)
      else navigate(entry.href)
    },
    [navigate, onClose],
  )

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!flat.length) return
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + direction + flat.length) % flat.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const entry = flat[activeIndex]
      if (entry) select(entry)
    }
  }

  /* Keep the highlighted row inside the scroll viewport. */
  useEffect(() => {
    if (!open) return
    const node = listRef.current?.querySelector(`#search-option-${activeIndex}`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  if (!open) return null

  const hasResults = flat.length > 0
  let cursor = -1

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search SleeklyBuilt">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-obsidian/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close search"
        tabIndex={-1}
      />

      <div className="absolute inset-x-0 top-[8vh] mx-auto w-[min(100%-1.5rem,40rem)]">
        <div className="overflow-hidden rounded-2xl border border-cream-deep bg-cream shadow-2xl">
          <div className="flex items-center gap-3 border-b border-cream-deep px-4 py-3.5">
            <FiSearch aria-hidden="true" className="shrink-0 text-lg text-emerald" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, pages and layouts"
              className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-ink-soft/60 focus:outline-none"
              role="combobox"
              aria-expanded="true"
              aria-controls="search-results"
              aria-activedescendant={hasResults ? `search-option-${activeIndex}` : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-ink-soft transition hover:bg-cream-deep hover:text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              aria-label="Close search"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <div
            ref={listRef}
            role="listbox"
            id="search-results"
            aria-label="Search results"
            className="max-h-[60vh] overflow-y-auto py-2"
          >
            {groups.map((group) => {
              const isLayouts = group.id === 'layouts'
              if (isLayouts && !group.entries.length && layoutState === 'ready') return null

              return (
                <div key={group.id} role="group" aria-labelledby={`search-group-${group.id}`} className="py-1.5">
                  <p id={`search-group-${group.id}`} className="eyebrow px-4 py-1.5">
                    {group.label}
                  </p>

                  {isLayouts && layoutState === 'loading' ? (
                    <div className="space-y-1 px-4 py-1" aria-live="polite">
                      {[0, 1, 2].map((row) => (
                        <div key={row} className="flex items-center gap-3 py-2">
                          <div className="h-10 w-14 shrink-0 animate-pulse rounded-md bg-cream-deep" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-1/3 animate-pulse rounded bg-cream-deep" />
                            <div className="h-2.5 w-2/3 animate-pulse rounded bg-cream-deep/70" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {isLayouts && layoutState === 'error' ? (
                    <div className="mx-4 my-1 flex items-start gap-3 rounded-lg bg-cream-deep/50 px-3 py-3">
                      <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-deep" />
                      <div className="min-w-0">
                        <p className="text-meta text-ink">Could not load the layout catalog.</p>
                        <button
                          type="button"
                          onClick={loadLayouts}
                          className="mt-1 text-meta font-semibold text-emerald-deep underline decoration-gold decoration-2 underline-offset-2 hover:text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {group.entries.map((entry) => {
                    cursor += 1
                    const index = cursor
                    return (
                      <ResultRow
                        key={entry.id}
                        entry={entry}
                        index={index}
                        active={index === activeIndex}
                        onSelect={select}
                        onHover={setActiveIndex}
                      />
                    )
                  })}
                </div>
              )
            })}

            {!hasResults && layoutState !== 'loading' ? (
              <div className="px-6 py-12 text-center">
                <p className="display-card text-emerald-deep">No matches for “{query.trim()}”</p>
                <p className="mx-auto mt-2 max-w-measure-lead text-meta text-ink-soft">
                  Try a product name, or tell us what you need and we will point you to the right place.
                </p>
                <button
                  type="button"
                  onClick={() => select({ href: '/contact' })}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-meta font-semibold text-cream transition hover:bg-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
                >
                  Talk to us
                  <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="hidden items-center justify-between border-t border-cream-deep bg-cream-deep/30 px-4 py-2.5 text-[0.6875rem] text-ink-soft sm:flex">
            <span className="flex items-center gap-3">
              <kbd className="rounded border border-cream-deep bg-cream px-1.5 py-0.5 font-sans">↑</kbd>
              <kbd className="rounded border border-cream-deep bg-cream px-1.5 py-0.5 font-sans">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-2">
              <kbd className="rounded border border-cream-deep bg-cream px-1.5 py-0.5 font-sans">Enter</kbd>
              to open
              <kbd className="ml-2 rounded border border-cream-deep bg-cream px-1.5 py-0.5 font-sans">Esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
