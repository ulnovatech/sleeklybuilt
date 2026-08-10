import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { siteConfig as staticSiteConfig } from '../site.config'

const DEFAULT_URL =
  import.meta.env.VITE_SITE_CONTACT_URL ||
  (import.meta.env.DEV ? 'http://localhost/sleeklybuilt/api/public/site-contact' : '/api/public/site-contact')

async function fetchPublicContact() {
  try {
    const res = await fetch(DEFAULT_URL, {
      method: 'GET',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function merge(base, remote) {
  if (!remote) return base
  const phones = Array.isArray(remote.phones) ? remote.phones.map(String).filter(Boolean) : base.phones
  return {
    ...base,
    email: remote.email || base.email,
    location: remote.location || base.location,
    phones: phones.length ? phones : base.phones,
    primaryPhone: remote.primaryPhone || base.primaryPhone,
    whatsapp: remote.whatsapp || base.whatsapp,
  }
}

const Ctx = createContext(staticSiteConfig)

export function SiteContactProvider({ children }) {
  const [cfg, setCfg] = useState(staticSiteConfig)
  useEffect(() => {
    fetchPublicContact().then((remote) => setCfg(merge(staticSiteConfig, remote)))
  }, [])
  const value = useMemo(() => cfg, [cfg])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSiteConfig() {
  return useContext(Ctx)
}
