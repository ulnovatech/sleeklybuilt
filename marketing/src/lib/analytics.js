/** Env-gated GA4. No-ops when VITE_GA_MEASUREMENT_ID is unset or malformed. */

const RAW_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()

export function analyticsId() {
  return /^G-[A-Z0-9]+$/i.test(RAW_ID) ? RAW_ID : ''
}

export function isAnalyticsEnabled() {
  return Boolean(analyticsId())
}

export function track(eventName, params = {}) {
  if (!isAnalyticsEnabled()) return
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function trackPageView({ path, title, location } = {}) {
  if (!isAnalyticsEnabled()) return
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const pagePath = path || window.location.pathname || '/'
  if (
    pagePath.startsWith('/dash') ||
    pagePath.startsWith('/sleekly-dash') ||
    pagePath.startsWith('/api') ||
    pagePath.startsWith('/performante')
  ) {
    return
  }
  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_path: pagePath,
    page_location: location || window.location.href,
  })
}

export function bindOutboundTracking() {
  if (!isAnalyticsEnabled() || typeof document === 'undefined') return
  if (window.__sbOutboundBound) return
  window.__sbOutboundBound = true
  document.addEventListener('click', (event) => {
    const anchor = event.target?.closest?.('a[href]')
    if (!anchor) return
    const href = anchor.href || ''
    if (/wa\.me|api\.whatsapp\.com|whatsapp\.com/i.test(href)) {
      track('whatsapp_click', { link_url: href })
    }
  })
}
