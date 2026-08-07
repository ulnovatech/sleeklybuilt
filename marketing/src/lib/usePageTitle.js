import { useEffect } from 'react'
import { siteConfig } from '../site.config'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${siteConfig.name}` : siteConfig.name
  }, [title])
}
