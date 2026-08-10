/**
 * Load public marketing contact from Sleekly Dash.
 * Falls back silently to static site.config when the API is unavailable.
 */

const DEFAULT_URL =
  import.meta.env.VITE_SITE_CONTACT_URL ||
  (import.meta.env.DEV
    ? 'http://localhost/ulnovatech/api/public/site-contact'
    : '/api/public/site-contact')

export async function fetchPublicContact(url = DEFAULT_URL) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function mergePublicContact(base, remote) {
  if (!remote || typeof remote !== 'object') return base
  const phones = Array.isArray(remote.phones)
    ? remote.phones.map(String).filter(Boolean)
    : base.phones
  return {
    ...base,
    name: remote.brandName || base.name,
    legalName: remote.brandName || base.legalName,
    email: remote.email || base.email,
    location: remote.location || base.location,
    addressNote: remote.addressNote ?? base.addressNote,
    phones: phones.length ? phones : base.phones,
    primaryPhone: remote.primaryPhone || base.primaryPhone,
    whatsapp: remote.whatsapp || base.whatsapp,
    social: {
      ...base.social,
      ...(remote.social && typeof remote.social === 'object' ? remote.social : {}),
    },
    links: {
      ...base.links,
      logo: remote.logo || base.links?.logo,
    },
  }
}
