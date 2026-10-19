import { siteConfig } from '../site.config'

/**
 * Signature product CTAs — “Let’s Build Your…” / “Let’s Set Up Your…”.
 * Keep “Start a project” for undecided visitors (top nav, home, products index).
 */

export const productCtas = {
  websites: {
    label: 'Let’s Build Your Website',
    href: `${siteConfig.links.contact}?intent=website`,
    projectNoun: 'website',
  },
  'sleek-pages': {
    label: 'Let’s Build Your Sleek Page',
    href: `${siteConfig.links.contact}?intent=sleek-page`,
    projectNoun: 'Sleek Page',
  },
  'mobile-apps': {
    label: 'Let’s Build Your App',
    href: `${siteConfig.links.contact}?intent=app`,
    projectNoun: 'app',
  },
  'business-systems': {
    label: 'Let’s Build Your System',
    href: `${siteConfig.links.contact}?intent=system`,
    projectNoun: 'system',
  },
  ecommerce: {
    label: 'Let’s Build Your Store',
    href: `${siteConfig.links.contact}?intent=store`,
    projectNoun: 'store',
  },
  'ai-attendant': {
    label: 'Let’s Set Up Your AI Attendant',
    href: `${siteConfig.links.contact}?intent=ai-attendant`,
    projectNoun: 'AI attendant',
  },
  software: {
    label: 'Let’s Build Your Software',
    href: `${siteConfig.links.contact}?intent=software`,
    projectNoun: 'software',
  },
  branding: {
    label: 'Let’s Build Your Brand',
    href: `${siteConfig.links.contact}?intent=branding`,
    projectNoun: 'brand',
  },
  general: {
    label: 'Let’s Build Your Solution',
    href: `${siteConfig.links.contact}?intent=project`,
    projectNoun: 'solution',
  },
}

export function productCta(id) {
  return productCtas[id] || productCtas.general
}
