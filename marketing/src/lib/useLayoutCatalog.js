import { useCallback, useEffect, useRef, useState } from 'react'
import { apiEndpoints } from '../site.config'

/** Maps a catalog record onto the shape the UI consumes. */
function normalizeLayout(item) {
  const businessTypes = Array.isArray(item.businessTypes)
    ? item.businessTypes.filter((v) => typeof v === 'string' && v.trim())
    : []

  return {
    slug: item.name,
    title: item.title || item.name,
    description: item.description || '',
    category: item.category || '',
    collection: item.collection || '',
    layoutFit: typeof item.layoutFit === 'string' ? item.layoutFit : '',
    businessTypes,
    /** Live static preview of the published site */
    previewUrl: item.entry,
    /** Deep link into the portfolio app for this layout */
    orderUrl: `/portfolio-app/order?template=${encodeURIComponent(item.name)}`,
    image: item.mainImage || null,
  }
}

/**
 * Reads the published layout catalog.
 *
 * `collection` scopes to a product line (`websites` | `sleek-pages`).
 * Refresh keeps prior layouts visible (UX-GATE §9 state 2).
 * Pass `enabled: false` to defer (e.g. command palette).
 *
 * `state`: idle | loading | ready | error
 * `stale`: true when a refresh failed but prior layouts remain
 * `httpStatus`: last failure status when known (403 → permission copy)
 */
export function useLayoutCatalog({ collection, enabled = true } = {}) {
  const [layouts, setLayouts] = useState([])
  const [state, setState] = useState('idle')
  const [stale, setStale] = useState(false)
  const [httpStatus, setHttpStatus] = useState(null)
  const layoutsRef = useRef(layouts)
  layoutsRef.current = layouts

  const load = useCallback(async () => {
    const hadContent = layoutsRef.current.length > 0
    setState('loading')
    setHttpStatus(null)

    try {
      const url = collection
        ? `${apiEndpoints.layouts}?collection=${encodeURIComponent(collection)}`
        : apiEndpoints.layouts

      const response = await fetch(url)
      if (!response.ok) {
        const err = new Error(`Catalog responded ${response.status}`)
        err.status = response.status
        throw err
      }

      const payload = await response.json()
      if (!payload?.success || !Array.isArray(payload.templates)) {
        throw new Error('Catalog returned an unexpected shape')
      }

      setLayouts(payload.templates.map(normalizeLayout))
      setStale(false)
      setState('ready')
    } catch (error) {
      setHttpStatus(typeof error?.status === 'number' ? error.status : null)
      if (hadContent) {
        setStale(true)
        setState('ready')
      } else {
        setLayouts([])
        setStale(false)
        setState('error')
      }
    }
  }, [collection])

  useEffect(() => {
    if (enabled && state === 'idle') load()
  }, [enabled, state, load])

  return { layouts, state, stale, httpStatus, reload: load }
}
