import { useEffect } from 'react'
import { siteConfig, siteUrl } from '../../site.config'

const SCRIPT_ID = 'sleeklybuilt-jsonld-site'

/**
 * Inject Organization + WebSite JSON-LD once for the marketing hub.
 */
export default function JsonLdSite() {
  useEffect(() => {
    const base = siteUrl.replace(/\/$/, '')
    const logo = `${base}${siteConfig.links.logo}`
    const sameAs = Object.values(siteConfig.social || {}).filter(Boolean)

    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${base}/#organization`,
          name: siteConfig.legalName || siteConfig.name,
          url: `${base}/`,
          logo: {
            '@type': 'ImageObject',
            url: logo,
          },
          email: siteConfig.email,
          telephone: siteConfig.primaryPhone,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kampala',
            addressCountry: 'UG',
          },
          sameAs,
        },
        {
          '@type': 'WebSite',
          '@id': `${base}/#website`,
          url: `${base}/`,
          name: siteConfig.name,
          description: siteConfig.description,
          publisher: { '@id': `${base}/#organization` },
          inLanguage: 'en-UG',
        },
      ],
    }

    let el = document.getElementById(SCRIPT_ID)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = SCRIPT_ID
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(graph)
  }, [])

  return null
}
