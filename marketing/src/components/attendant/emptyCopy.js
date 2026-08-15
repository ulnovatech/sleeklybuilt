/** Situated empty-state copy — names the current page (attendant pattern). */
const BY_PAGE = {
  home: "You're on the SleeklyBuilt home page. Ask about what we build, timing, or Mobile Money.",
  'sleek-pages':
    "You're on Sleek Pages. Ask about going live in a day, layouts, or whether a full website is a better fit.",
  websites:
    "You're on Websites. Ask about a layout, timing, or whether a Sleek Page is enough.",
  'mobile-apps':
    "You're looking at Mobile Apps. Ask about platforms, Mobile Money, or how a project starts.",
  'business-systems':
    "You're on Business Systems. Ask about CRM, POS, or whether a website is the right first step.",
  products: "You're browsing products. Ask which line fits your business, or where to see prices.",
  prices: "You're on Prices. Ask about a package, deposits, or how layout checkout works.",
  contact: "You're on Contact. Tell me what you need and I can take details — or open WhatsApp.",
  about: "You're on About. Ask what we build, or how to get started.",
  'track-order': "You're on Track order. Share your payment reference and phone if you want a status check.",
  portfolio: "You're heading to the projects gallery. Ask me to help pick a layout or package.",
  unknown: "Ask about our websites, apps, or systems — or how to get a quote.",
}

export function emptyCopyForPage(pageId) {
  return BY_PAGE[pageId] || BY_PAGE.unknown
}
