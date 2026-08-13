import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import {
  getBusinessType,
  getLayoutFit,
  orderedBusinessTypes,
  sortOptions,
  visibleLayoutFits,
} from '../../config/businessFit'
import { cn } from '../../lib/utils'

function readFiltersFromUrl() {
  if (typeof window === 'undefined') {
    return { businessTypeId: null, layoutFitId: null, query: '', sort: 'match' }
  }
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash.replace(/^#/, '')
  const type = params.get('type')
  let fit = params.get('fit')
  if (!fit && hash.startsWith('fit-')) {
    fit = hash.replace(/^fit-/, '')
  }
  const query = params.get('q') || ''
  const sortParam = params.get('sort')
  const sort = sortOptions.some((o) => o.id === sortParam) ? sortParam : 'match'
  return {
    businessTypeId: type && getBusinessType(type) ? type : null,
    layoutFitId: fit && getLayoutFit(fit) ? fit : null,
    query,
    sort,
  }
}

function writeFiltersToUrl({ businessTypeId, layoutFitId, query, sort }) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (businessTypeId) url.searchParams.set('type', businessTypeId)
  else url.searchParams.delete('type')
  if (layoutFitId) {
    url.searchParams.set('fit', layoutFitId)
    url.hash = `fit-${layoutFitId}`
  } else {
    url.searchParams.delete('fit')
    if (url.hash.startsWith('#fit-')) url.hash = 'layouts'
  }
  if (query.trim()) url.searchParams.set('q', query.trim())
  else url.searchParams.delete('q')
  if (sort && sort !== 'match') url.searchParams.set('sort', sort)
  else url.searchParams.delete('sort')
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

/**
 * Business type + layout fit narrowing for LayoutsGallery.
 * Category chips primary, fit secondary, search + sort tertiary.
 * Never says “template”.
 */
export default function BusinessFitFilters({
  businessTypeId,
  layoutFitId,
  query,
  sort = 'match',
  resultCount,
  onChange,
  className = '',
}) {
  const searchId = useId()
  const sortId = useId()
  const categoryLabelId = useId()
  const [typeDraft, setTypeDraft] = useState(() => getBusinessType(businessTypeId)?.label ?? '')
  const syncedRef = useRef(false)
  const types = useMemo(() => orderedBusinessTypes(), [])

  useEffect(() => {
    setTypeDraft(getBusinessType(businessTypeId)?.label ?? '')
  }, [businessTypeId])

  useEffect(() => {
    if (syncedRef.current) return
    syncedRef.current = true
    const fromUrl = readFiltersFromUrl()
    if (fromUrl.businessTypeId || fromUrl.layoutFitId || fromUrl.query || fromUrl.sort !== 'match') {
      onChange(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [])

  useEffect(() => {
    writeFiltersToUrl({ businessTypeId, layoutFitId, query, sort })
  }, [businessTypeId, layoutFitId, query, sort])

  const fits = useMemo(() => visibleLayoutFits(businessTypeId), [businessTypeId])
  const activeFit = getLayoutFit(layoutFitId)
  const hasFilters = Boolean(businessTypeId || layoutFitId || query.trim())

  const commit = (patch) => {
    onChange({
      businessTypeId,
      layoutFitId,
      query,
      sort,
      ...patch,
    })
  }

  const commitType = (id) => {
    const nextFits = visibleLayoutFits(id)
    const nextFit =
      layoutFitId && nextFits.some((f) => f.id === layoutFitId) ? layoutFitId : null
    commit({ businessTypeId: id, layoutFitId: nextFit })
  }

  const clearAll = () => {
    setTypeDraft('')
    onChange({ businessTypeId: null, layoutFitId: null, query: '', sort: 'match' })
  }

  return (
    <div className={cn('mb-8 space-y-6', className)}>
      <div>
        <p className="text-meta font-semibold text-emerald-deep" id={categoryLabelId}>
          Business type
        </p>
        <div
          role="group"
          aria-labelledby={categoryLabelId}
          className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
        >
          <button
            type="button"
            aria-pressed={!businessTypeId}
            onClick={() => commit({ businessTypeId: null })}
            className={cn(
              'min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
              !businessTypeId
                ? 'border-emerald-deep bg-emerald-deep text-cream'
                : 'border-subtle bg-surface-raised text-ink-soft hover:border-emerald/30',
            )}
          >
            All
          </button>
          {types.map((type) => (
            <button
              key={type.id}
              type="button"
              aria-pressed={businessTypeId === type.id}
              onClick={() =>
                businessTypeId === type.id
                  ? commit({ businessTypeId: null })
                  : commitType(type.id)
              }
              className={cn(
                'min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                businessTypeId === type.id
                  ? 'border-emerald-deep bg-emerald-deep text-cream'
                  : 'border-subtle bg-surface-raised text-ink-soft hover:border-emerald/30',
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        <label htmlFor={`${categoryLabelId}-search`} className="sr-only">
          Find a business type
        </label>
        <input
          id={`${categoryLabelId}-search`}
          list={`${categoryLabelId}-options`}
          value={typeDraft}
          onChange={(e) => {
            const value = e.target.value
            setTypeDraft(value)
            const exact = types.find((t) => t.label.toLowerCase() === value.trim().toLowerCase())
            if (exact) commitType(exact.id)
            else if (!value.trim() && businessTypeId) {
              commit({ businessTypeId: null })
            }
          }}
          onBlur={() => {
            const exact = types.find((t) => t.label.toLowerCase() === typeDraft.trim().toLowerCase())
            if (exact) {
              setTypeDraft(exact.label)
              commitType(exact.id)
            } else if (!typeDraft.trim()) {
              setTypeDraft('')
            } else if (businessTypeId) {
              setTypeDraft(getBusinessType(businessTypeId)?.label ?? '')
            }
          }}
          placeholder="Or type a business type…"
          autoComplete="off"
          className="field-input mt-3 w-full sm:max-w-sm"
        />
        <datalist id={`${categoryLabelId}-options`}>
          {types.map((t) => (
            <option key={t.id} value={t.label} />
          ))}
        </datalist>
      </div>

      <div>
        <p className="text-meta font-semibold text-emerald-deep" id="layout-fit-label">
          Layout fit
        </p>
        <div
          role="group"
          aria-labelledby="layout-fit-label"
          className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
        >
          <button
            type="button"
            aria-pressed={!layoutFitId}
            onClick={() => commit({ layoutFitId: null })}
            className={cn(
              'min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
              !layoutFitId
                ? 'border-emerald-deep bg-emerald-deep text-cream'
                : 'border-subtle bg-surface-raised text-ink-soft hover:border-emerald/30',
            )}
          >
            Any fit
          </button>
          {fits.map((fit) => (
            <button
              key={fit.id}
              type="button"
              aria-pressed={layoutFitId === fit.id}
              onClick={() =>
                commit({
                  layoutFitId: layoutFitId === fit.id ? null : fit.id,
                })
              }
              className={cn(
                'min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                layoutFitId === fit.id
                  ? 'border-emerald-deep bg-emerald-deep text-cream'
                  : 'border-subtle bg-surface-raised text-ink-soft hover:border-emerald/30',
              )}
            >
              {fit.label}
            </button>
          ))}
        </div>
        {activeFit ? (
          <p className="mt-3 text-sm text-ink-soft">Typical need: {activeFit.typicalNeed}</p>
        ) : (
          <p className="mt-3 text-sm text-content-muted">
            Narrow by layout fit — Portfolio, Booking, Catalog, and more — then open a live preview.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={searchId} className="text-meta font-semibold text-emerald-deep">
            Search layouts
          </label>
          <div className="relative mt-2">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => commit({ query: e.target.value })}
              placeholder="Restaurant, booking, portfolio…"
              autoComplete="off"
              className="field-input w-full pl-10"
            />
          </div>
        </div>

        <div className="sm:w-44">
          <label htmlFor={sortId} className="text-meta font-semibold text-emerald-deep">
            Sort
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => commit({ sort: e.target.value })}
            className="field-input mt-2 w-full"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-content-muted" aria-live="polite">
          {resultCount} layout{resultCount === 1 ? '' : 's'}
          {hasFilters ? ' matching' : ''}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-subtle bg-surface-raised px-3 text-sm font-semibold text-emerald-deep transition hover:border-emerald/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            <FiX aria-hidden="true" className="h-4 w-4" />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  )
}

export { readFiltersFromUrl }
