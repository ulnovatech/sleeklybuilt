import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsId, bindOutboundTracking, trackPageView } from '../../lib/analytics'
import { getMarketingSeoRoute } from '../../seo/routes'

/**
 * Loads gtag only when VITE_GA_MEASUREMENT_ID is set at build time.
 * SPA route changes send a page_view with path + title so GA4 reports stay readable.
 */
export default function Analytics() {
  const id = analyticsId()
  const location = useLocation()

  useEffect(() => {
    if (!id || typeof document === 'undefined') return

    window.dataLayer = window.dataLayer || []
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments)
      }
    if (!window.__sbGaConfigured) {
      window.gtag('js', new Date())
      window.gtag('config', id, { anonymize_ip: true, send_page_view: false })
      window.__sbGaConfigured = id
    }
    bindOutboundTracking()

    const marker = `script[data-sb-ga="${id}"]`
    if (document.head.querySelector(marker)) return undefined

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    script.dataset.sbGa = id
    document.head.appendChild(script)

    return undefined
  }, [id])

  useEffect(() => {
    if (!id) return
    const registered = getMarketingSeoRoute(location.pathname)
    trackPageView({
      path: location.pathname + location.search,
      title: registered?.title || document.title,
    })
  }, [id, location.pathname, location.search])

  return null
}
