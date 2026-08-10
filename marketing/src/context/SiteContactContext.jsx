import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { siteConfig as staticSiteConfig } from '../site.config'
import { fetchPublicContact, mergePublicContact } from '../lib/public-contact'

const SiteContactContext = createContext({
  siteConfig: staticSiteConfig,
  status: 'idle',
  error: null,
  reload: () => {},
})

export function SiteContactProvider({ children }) {
  const [siteConfig, setSiteConfig] = useState(staticSiteConfig)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const reload = async () => {
    setStatus('loading')
    setError(null)
    try {
      const remote = await fetchPublicContact()
      setSiteConfig(mergePublicContact(staticSiteConfig, remote))
      setStatus(remote ? 'ready' : 'fallback')
    } catch (err) {
      setSiteConfig(staticSiteConfig)
      setError(err)
      setStatus('fallback')
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const value = useMemo(
    () => ({ siteConfig, status, error, reload }),
    [siteConfig, status, error],
  )

  return (
    <SiteContactContext.Provider value={value}>{children}</SiteContactContext.Provider>
  )
}

export function useSiteContact() {
  return useContext(SiteContactContext)
}

/** Prefer live contact when available; falls back to static site.config. */
export function useSiteConfig() {
  return useSiteContact().siteConfig
}
