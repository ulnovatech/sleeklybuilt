import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig, siteUrl } from '../site.config'
import { getMarketingSeoRoute, normalizeSeoPath } from '../seo/routes'

function ensureMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    Object.entries(attrs.create || {}).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  if (attrs.content != null) el.setAttribute('content', attrs.content)
  return el
}

function ensureLinkCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function absoluteUrl(path) {
  const base = siteUrl.replace(/\/$/, '')
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Apply document title + description + canonical + Open Graph / Twitter tags.
 *
 * @param {{ title?: string, description?: string, path?: string, image?: string, noindex?: boolean } | string} [overrides]
 *        Pass a string for legacy title-only behaviour (suffixes brand name when not already present).
 */
export function usePageSeo(overrides = {}) {
  const location = useLocation()
  const opts =
    typeof overrides === 'string'
      ? { title: overrides }
      : overrides && typeof overrides === 'object'
        ? overrides
        : {}

  useEffect(() => {
    const path = normalizeSeoPath(opts.path || location.pathname)
    const registered = getMarketingSeoRoute(path)
    const home = getMarketingSeoRoute('/')

    let title = opts.title || registered?.title || home?.title || siteConfig.name
    if (
      typeof overrides === 'string' &&
      opts.title &&
      !String(opts.title).includes(siteConfig.name)
    ) {
      title = `${opts.title} — ${siteConfig.name}`
    }

    const description =
      opts.description ||
      registered?.description ||
      home?.description ||
      siteConfig.description

    const canonicalPath = path === '/' ? '/' : path
    const canonical = absoluteUrl(canonicalPath)
    const image = absoluteUrl(
      opts.image || siteConfig.links.logo || '/assets/img/sleeklybuilt-logo.png',
    )

    document.title = title

    ensureMeta('meta[name="description"]', {
      create: { name: 'description' },
      content: description,
    })
    ensureMeta('meta[name="robots"]', {
      create: { name: 'robots' },
      content: opts.noindex ? 'noindex,nofollow' : 'index,follow',
    })
    ensureLinkCanonical(canonical)

    ensureMeta('meta[property="og:type"]', {
      create: { property: 'og:type' },
      content: 'website',
    })
    ensureMeta('meta[property="og:site_name"]', {
      create: { property: 'og:site_name' },
      content: siteConfig.name,
    })
    ensureMeta('meta[property="og:title"]', {
      create: { property: 'og:title' },
      content: title,
    })
    ensureMeta('meta[property="og:description"]', {
      create: { property: 'og:description' },
      content: description,
    })
    ensureMeta('meta[property="og:url"]', {
      create: { property: 'og:url' },
      content: canonical,
    })
    ensureMeta('meta[property="og:image"]', {
      create: { property: 'og:image' },
      content: image,
    })
    ensureMeta('meta[property="og:locale"]', {
      create: { property: 'og:locale' },
      content: 'en_UG',
    })

    ensureMeta('meta[name="twitter:card"]', {
      create: { name: 'twitter:card' },
      content: 'summary_large_image',
    })
    ensureMeta('meta[name="twitter:title"]', {
      create: { name: 'twitter:title' },
      content: title,
    })
    ensureMeta('meta[name="twitter:description"]', {
      create: { name: 'twitter:description' },
      content: description,
    })
    ensureMeta('meta[name="twitter:image"]', {
      create: { name: 'twitter:image' },
      content: image,
    })
  }, [
    location.pathname,
    opts.title,
    opts.description,
    opts.path,
    opts.image,
    opts.noindex,
  ])
}

/** @deprecated Prefer usePageSeo — kept for gradual migration */
export function usePageTitle(title) {
  usePageSeo(title == null || title === '' ? {} : title)
}
