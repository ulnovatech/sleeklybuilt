import { siteConfig } from '../site.config'

/**
 * Business type → layout fit taxonomy (visitor guide).
 * Never say “template” in UI — these are layouts / layout fits / live previews.
 *
 * Discovery can reuse the same IDs later; Opportunity Status is operator-only
 * and is intentionally absent here.
 */

/**
 * @typedef {{ headline: string, body: string }} CategoryStory
 * @typedef {{ id: string, label: string, typicalNeed: string, keywords: string[], story?: CategoryStory }} LayoutFit
 * @typedef {{ id: string, label: string, layoutFitIds: string[], keywords: string[], story: CategoryStory }} BusinessType
 */

/** @type {LayoutFit[]} */
export const layoutFits = [
  {
    id: 'ordering',
    label: 'Ordering',
    typicalNeed: 'Menu, ordering, reservations',
    keywords: ['order', 'ordering', 'menu', 'reservation', 'restaurant'],
    story: {
      headline: 'Make the next order obvious',
      body: 'Guests should see the menu, path to order, and how to reach you before they bounce to a competitor’s WhatsApp.',
    },
  },
  {
    id: 'menu',
    label: 'Menu',
    typicalNeed: 'Menu, location, WhatsApp',
    keywords: ['menu', 'cafe', 'café', 'whatsapp', 'location'],
    story: {
      headline: 'Put the menu where decisions happen',
      body: 'A clear menu, location, and WhatsApp path beats a Facebook page that never answers when someone is hungry now.',
    },
  },
  {
    id: 'booking',
    label: 'Booking',
    typicalNeed: 'Services, booking, appointments, membership',
    keywords: ['book', 'booking', 'appointment', 'reservation', 'membership', 'schedule'],
    story: {
      headline: 'Turn interest into a booked slot',
      body: 'Services, availability cues, and a direct book-or-message path stop appointments from dying in unread chats.',
    },
  },
  {
    id: 'property-listings',
    label: 'Property listings',
    typicalNeed: 'Properties, inquiry, agents',
    keywords: ['property', 'real estate', 'listing', 'agent', 'rent'],
    story: {
      headline: 'Let serious buyers inquire faster',
      body: 'Listings, filters, and a clean inquiry path keep agents in the conversation instead of losing leads to listing sites.',
    },
  },
  {
    id: 'contractor',
    label: 'Contractor / projects',
    typicalNeed: 'Services, projects, quote request',
    keywords: ['construction', 'contractor', 'project', 'quote', 'architecture'],
    story: {
      headline: 'Prove the work before the quote call',
      body: 'Projects, services, and a quote request that feels easy turn browsers into clients who already trust your craft.',
    },
  },
  {
    id: 'professional',
    label: 'Professional',
    typicalNeed: 'Practice areas, services, consultation',
    keywords: ['legal', 'law', 'accounting', 'finance', 'consult'],
    story: {
      headline: 'Look like the firm people can trust',
      body: 'Practice areas, credentials, and a calm consultation path win clients who will not hire from a vague Facebook page.',
    },
  },
  {
    id: 'education',
    label: 'Education',
    typicalNeed: 'Programs, admissions, information',
    keywords: ['school', 'education', 'admission', 'program', 'course'],
    story: {
      headline: 'Answer the admissions questions early',
      body: 'Programs, fees cues, and a clear next step reduce “call the office” friction for parents and students.',
    },
  },
  {
    id: 'organization',
    label: 'Organization',
    typicalNeed: 'Events, programs, contact, donations',
    keywords: ['church', 'ngo', 'organization', 'donation', 'impact', 'community'],
    story: {
      headline: 'Make belonging and giving easy',
      body: 'Events, programs, and a clear contact or donate path help people show up — not guess where to start.',
    },
  },
  {
    id: 'travel',
    label: 'Travel / tours',
    typicalNeed: 'Packages, booking, inquiries',
    keywords: ['travel', 'tour', 'package', 'trip'],
    story: {
      headline: 'Sell the trip before the inbox fills up',
      body: 'Packages, proof, and a booking or inquiry path convert browsers who would otherwise message five agencies at once.',
    },
  },
  {
    id: 'rental',
    label: 'Rental',
    typicalNeed: 'Vehicles, availability, booking',
    keywords: ['rental', 'hire', 'vehicle', 'car'],
    story: {
      headline: 'Show availability, then book',
      body: 'Fleet clarity and a fast booking path beat phone tag when someone needs a vehicle today.',
    },
  },
  {
    id: 'vehicle-listings',
    label: 'Vehicle listings',
    typicalNeed: 'Inventory, inquiry',
    keywords: ['dealer', 'car', 'vehicle', 'inventory', 'auto'],
    story: {
      headline: 'Let inventory do the selling',
      body: 'Clear listings and inquiry CTAs keep serious buyers talking to you instead of the next dealer in search.',
    },
  },
  {
    id: 'events',
    label: 'Events',
    typicalNeed: 'Packages, portfolio, inquiry',
    keywords: ['event', 'planner', 'wedding', 'rsvp'],
    story: {
      headline: 'Win the date before the competitor replies',
      body: 'Packages, past work, and a simple inquiry path close couples and hosts who decide under time pressure.',
    },
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    typicalNeed: 'Portfolio, packages, booking, contact',
    keywords: ['portfolio', 'photography', 'freelancer', 'personal'],
    story: {
      headline: 'Let the work speak, then make contact easy',
      body: 'A focused portfolio with packages and a clear contact path turns admirers into booked clients — not silent scrollers.',
    },
  },
  {
    id: 'catalog',
    label: 'Catalog',
    typicalNeed: 'Products, catalog, showroom, WhatsApp',
    keywords: ['catalog', 'catalogue', 'product', 'shop', 'commerce', 'store', 'fashion', 'furniture'],
    story: {
      headline: 'Show products, then open WhatsApp or inquiry',
      body: 'A shoppable catalog with a direct buy-or-message path stops “how much?” conversations that never convert.',
    },
  },
  {
    id: 'service-business',
    label: 'Service business',
    typicalNeed: 'Services, quote request',
    keywords: ['cleaning', 'moving', 'security', 'service', 'quote'],
    story: {
      headline: 'Make the quote request feel safe',
      body: 'Clear services and a simple quote path win jobs from people comparing three vendors on their phone.',
    },
  },
  {
    id: 'corporate',
    label: 'Corporate',
    typicalNeed: 'Services, capabilities, inquiry',
    keywords: ['corporate', 'industrial', 'manufacturer', 'company'],
    story: {
      headline: 'Look ready for serious buyers',
      body: 'Capabilities, proof, and a professional inquiry path help procurement teams shortlist you with confidence.',
    },
  },
  {
    id: 'logistics',
    label: 'Logistics',
    typicalNeed: 'Services, tracking, inquiry',
    keywords: ['logistics', 'courier', 'delivery', 'tracking', 'freight'],
    story: {
      headline: 'Reduce “where is my shipment?” friction',
      body: 'Services, coverage, and a clear inquiry path make you the courier people trust when timing matters.',
    },
  },
  {
    id: 'agency',
    label: 'Agency',
    typicalNeed: 'Services, case studies, lead capture',
    keywords: ['agency', 'case study', 'lead', 'marketing'],
    story: {
      headline: 'Prove outcomes, then capture the brief',
      body: 'Case studies and a sharp lead path turn curious visitors into conversations worth your time.',
    },
  },
]

/** Preferred chip order — high-intent visitor categories first. */
export const businessTypeBrowseOrder = [
  'salons',
  'barbers',
  'beauty',
  'clinics',
  'gyms',
  'restaurants',
  'cafes',
  'hotels',
  'photography',
  'freelancers',
  'agencies',
  'real-estate',
  'construction',
  'fashion',
  'furniture',
  'electronics',
  'supermarkets',
  'event-planners',
  'travel',
  'car-rental',
  'auto-dealers',
  'law-firms',
  'accounting',
  'schools',
  'churches',
  'ngos',
  'cleaning',
  'moving',
  'security',
  'logistics',
  'manufacturers',
  'wholesalers',
]

/** @type {BusinessType[]} */
export const businessTypes = [
  {
    id: 'restaurants',
    label: 'Restaurants',
    layoutFitIds: ['ordering', 'menu'],
    keywords: ['restaurant', 'dining', 'food'],
    story: {
      headline: 'Stop losing diners to a slow reply',
      body: 'A restaurant site that shows the menu, vibe, and how to order or reserve wins the table before a competitor answers WhatsApp.',
    },
  },
  {
    id: 'cafes',
    label: 'Cafés',
    layoutFitIds: ['menu', 'ordering'],
    keywords: ['cafe', 'café', 'coffee'],
    story: {
      headline: 'Make the menu findable in seconds',
      body: 'Cafés win when visitors see drinks, location, and WhatsApp without hunting through posts and stories.',
    },
  },
  {
    id: 'hotels',
    label: 'Hotels',
    layoutFitIds: ['booking'],
    keywords: ['hotel', 'lodge', 'rooms'],
    story: {
      headline: 'Turn browsers into booked nights',
      body: 'Rooms, amenities, and a clear book-or-inquire path stop guests from comparing three OTAs and never writing you.',
    },
  },
  {
    id: 'salons',
    label: 'Salons',
    layoutFitIds: ['booking'],
    keywords: ['salon', 'hair salon', 'spa', 'nails'],
    story: {
      headline: 'Stop losing bookings to WhatsApp delays',
      body: 'Show services, pricing cues, and a book-now path so clients lock the appointment before they message the next salon.',
    },
  },
  {
    id: 'barbers',
    label: 'Barbers',
    layoutFitIds: ['booking'],
    keywords: ['barber', 'barbershop', 'fade', 'cuts'],
    story: {
      headline: 'Own the chair before they walk past',
      body: 'Cuts, hours, location, and a fast booking or WhatsApp path keep regulars — and win new ones who refuse to wait on unread chats.',
    },
  },
  {
    id: 'beauty',
    label: 'Beauty shops',
    layoutFitIds: ['booking', 'catalog'],
    keywords: ['beauty', 'makeup', 'cosmetics', 'lash', 'brow'],
    story: {
      headline: 'Look as polished as the work you sell',
      body: 'Services, products, and easy booking or inquiry stop beauty buyers from choosing the shop that simply looks more ready online.',
    },
  },
  {
    id: 'clinics',
    label: 'Clinics',
    layoutFitIds: ['booking'],
    keywords: ['clinic', 'medical', 'doctor', 'health', 'dental'],
    story: {
      headline: 'Patients decide in seconds',
      body: 'Clear services, clinician presence, and easy appointment contact beat a Facebook page that never answers when someone is anxious.',
    },
  },
  {
    id: 'gyms',
    label: 'Gyms',
    layoutFitIds: ['booking'],
    keywords: ['gym', 'fitness', 'membership'],
    story: {
      headline: 'Make membership feel easy to start',
      body: 'Classes, facilities, and a join-or-inquire path convert browsers who are comparing gyms on their phone between sets.',
    },
  },
  {
    id: 'real-estate',
    label: 'Real estate',
    layoutFitIds: ['property-listings'],
    keywords: ['real estate', 'property', 'realtor'],
    story: {
      headline: 'Capture serious inquiries, not tire-kickers only',
      body: 'Listings and a clean inquiry path keep agents in the deal instead of losing leads to portals that never call back.',
    },
  },
  {
    id: 'construction',
    label: 'Construction',
    layoutFitIds: ['contractor'],
    keywords: ['construction', 'contractor', 'builder'],
    story: {
      headline: 'Prove capability before the site visit',
      body: 'Projects and a quote request that feels professional turn “send photos on WhatsApp” into a shortlist conversation.',
    },
  },
  {
    id: 'law-firms',
    label: 'Law firms',
    layoutFitIds: ['professional'],
    keywords: ['law', 'legal', 'attorney'],
    story: {
      headline: 'Earn trust before the consultation',
      body: 'Practice areas and a calm contact path win clients who will not hire counsel from a vague social profile.',
    },
  },
  {
    id: 'accounting',
    label: 'Accounting',
    layoutFitIds: ['professional'],
    keywords: ['accounting', 'finance', 'bookkeeping'],
    story: {
      headline: 'Look like the numbers people can rely on',
      body: 'Services, credentials, and a clear inquiry path attract owners who need a firm — not another unanswered inbox.',
    },
  },
  {
    id: 'schools',
    label: 'Schools',
    layoutFitIds: ['education'],
    keywords: ['school', 'education', 'academy'],
    story: {
      headline: 'Help parents decide with less phone tag',
      body: 'Programs, admissions cues, and a clear next step reduce friction for families comparing schools under pressure.',
    },
  },
  {
    id: 'churches',
    label: 'Churches / organizations',
    layoutFitIds: ['organization'],
    keywords: ['church', 'ministry', 'organization'],
    story: {
      headline: 'Make the next visit obvious',
      body: 'Service times, programs, and a warm contact path help new people show up — not guess where to begin.',
    },
  },
  {
    id: 'travel',
    label: 'Travel agencies',
    layoutFitIds: ['travel', 'booking'],
    keywords: ['travel', 'tour', 'agency'],
    story: {
      headline: 'Sell the trip before five agencies reply',
      body: 'Packages, proof, and a booking or inquiry path convert browsers who message everyone at once.',
    },
  },
  {
    id: 'car-rental',
    label: 'Car rental',
    layoutFitIds: ['rental'],
    keywords: ['car rental', 'hire'],
    story: {
      headline: 'Show the fleet, then book fast',
      body: 'Availability cues and a clear booking path beat phone tag when someone needs a vehicle today.',
    },
  },
  {
    id: 'auto-dealers',
    label: 'Auto dealers',
    layoutFitIds: ['vehicle-listings'],
    keywords: ['dealer', 'auto', 'cars'],
    story: {
      headline: 'Let inventory pull serious buyers in',
      body: 'Clear listings and inquiry CTAs keep buyers talking to you instead of the next dealer in search.',
    },
  },
  {
    id: 'event-planners',
    label: 'Event planners',
    layoutFitIds: ['events'],
    keywords: ['event', 'planner', 'wedding'],
    story: {
      headline: 'Win the date under time pressure',
      body: 'Packages, past work, and a simple inquiry path close hosts who decide fast — and ghost slow replies.',
    },
  },
  {
    id: 'photography',
    label: 'Photography',
    layoutFitIds: ['portfolio'],
    keywords: ['photo', 'photography'],
    story: {
      headline: 'Let the portfolio book the session',
      body: 'Focused work, packages, and a clear contact path turn admirers into clients — not silent scrollers.',
    },
  },
  {
    id: 'fashion',
    label: 'Fashion / clothing',
    layoutFitIds: ['catalog'],
    keywords: ['fashion', 'clothing', 'apparel'],
    story: {
      headline: 'Show the collection, open the sale',
      body: 'A catalog with sizes, looks, and WhatsApp or checkout cues stops “how much?” chats that never convert.',
    },
  },
  {
    id: 'furniture',
    label: 'Furniture',
    layoutFitIds: ['catalog'],
    keywords: ['furniture', 'showroom'],
    story: {
      headline: 'Help buyers picture it at home',
      body: 'Clear product stories and inquiry paths win shoppers who will not visit a showroom on a vague promise.',
    },
  },
  {
    id: 'electronics',
    label: 'Electronics',
    layoutFitIds: ['catalog'],
    keywords: ['electronics', 'gadgets'],
    story: {
      headline: 'Make specs and contact easy',
      body: 'Product clarity plus a fast inquiry path beat stores that hide prices and never answer the phone.',
    },
  },
  {
    id: 'supermarkets',
    label: 'Supermarkets',
    layoutFitIds: ['catalog'],
    keywords: ['supermarket', 'grocery', 'store'],
    story: {
      headline: 'Be the store people can find and trust',
      body: 'Location, offers, and a clear contact path keep neighbourhood shoppers choosing you over the next open tab.',
    },
  },
  {
    id: 'cleaning',
    label: 'Cleaning services',
    layoutFitIds: ['service-business'],
    keywords: ['cleaning', 'janitorial'],
    story: {
      headline: 'Make the quote feel low-risk',
      body: 'Services and a simple quote path win jobs from people comparing three cleaners on their phone tonight.',
    },
  },
  {
    id: 'moving',
    label: 'Moving companies',
    layoutFitIds: ['service-business'],
    keywords: ['moving', 'relocation'],
    story: {
      headline: 'Reduce moving-day anxiety online',
      body: 'Clear services and a fast quote request turn urgent movers into booked jobs before they call five trucks.',
    },
  },
  {
    id: 'security',
    label: 'Security companies',
    layoutFitIds: ['service-business', 'corporate'],
    keywords: ['security', 'guard'],
    story: {
      headline: 'Look ready for serious contracts',
      body: 'Capabilities and a professional inquiry path help buyers shortlist you when trust is non-negotiable.',
    },
  },
  {
    id: 'logistics',
    label: 'Logistics / courier',
    layoutFitIds: ['logistics'],
    keywords: ['logistics', 'courier', 'delivery'],
    story: {
      headline: 'Win when timing matters',
      body: 'Coverage, services, and a clear inquiry path make you the courier people trust under pressure.',
    },
  },
  {
    id: 'ngos',
    label: 'NGOs',
    layoutFitIds: ['organization'],
    keywords: ['ngo', 'nonprofit', 'charity'],
    story: {
      headline: 'Make impact and giving clear',
      body: 'Programs, stories, and a donate or contact path help supporters act — not wonder if the page is real.',
    },
  },
  {
    id: 'manufacturers',
    label: 'Manufacturers',
    layoutFitIds: ['corporate', 'catalog'],
    keywords: ['manufacturer', 'industrial', 'factory'],
    story: {
      headline: 'Look ready for B2B buyers',
      body: 'Capabilities, products, and a professional inquiry path help procurement teams put you on the shortlist.',
    },
  },
  {
    id: 'wholesalers',
    label: 'Wholesalers / distributors',
    layoutFitIds: ['catalog'],
    keywords: ['wholesale', 'distributor', 'b2b'],
    story: {
      headline: 'Help trade buyers inquire with confidence',
      body: 'Catalog clarity and a direct inquiry path win distributors who will not chase unanswered WhatsApp numbers.',
    },
  },
  {
    id: 'freelancers',
    label: 'Freelancers',
    layoutFitIds: ['portfolio'],
    keywords: ['freelancer', 'personal', 'consultant'],
    story: {
      headline: 'One page that books the next client',
      body: 'A sharp portfolio and contact path turns profile views into conversations — without a messy link-in-bio maze.',
    },
  },
  {
    id: 'agencies',
    label: 'Agencies',
    layoutFitIds: ['agency'],
    keywords: ['agency', 'studio', 'marketing'],
    story: {
      headline: 'Prove outcomes, then capture the brief',
      body: 'Case studies and a sharp lead path turn curious visitors into conversations worth your time.',
    },
  },
]

export const sortOptions = [
  { id: 'match', label: 'Best match' },
  { id: 'az', label: 'A–Z' },
]

export function getLayoutFit(id) {
  return layoutFits.find((fit) => fit.id === id) ?? null
}

export function getBusinessType(id) {
  return businessTypes.find((type) => type.id === id) ?? null
}

/** Business types in browse-chip order. */
export function orderedBusinessTypes() {
  const byId = new Map(businessTypes.map((t) => [t.id, t]))
  const ordered = []
  for (const id of businessTypeBrowseOrder) {
    const type = byId.get(id)
    if (type) {
      ordered.push(type)
      byId.delete(id)
    }
  }
  for (const type of byId.values()) ordered.push(type)
  return ordered
}

/**
 * One statement of truth for the active category / fit.
 * Prefers business type story; falls back to layout fit story.
 */
export function getCategoryStory({ businessTypeId = null, layoutFitId = null } = {}) {
  if (businessTypeId) {
    const type = getBusinessType(businessTypeId)
    if (type?.story) {
      return {
        kind: 'business',
        id: type.id,
        label: type.label,
        headline: type.story.headline,
        body: type.story.body,
      }
    }
  }
  if (layoutFitId) {
    const fit = getLayoutFit(layoutFitId)
    if (fit?.story) {
      return {
        kind: 'fit',
        id: fit.id,
        label: fit.label,
        headline: fit.story.headline,
        body: fit.story.body,
      }
    }
  }
  return null
}

/** Fits to show as chips — narrowed when a business type is selected. */
export function visibleLayoutFits(businessTypeId) {
  if (!businessTypeId) return layoutFits
  const type = getBusinessType(businessTypeId)
  if (!type) return layoutFits
  const allowed = new Set(type.layoutFitIds)
  return layoutFits.filter((fit) => allowed.has(fit.id))
}

function haystack(layout) {
  const bits = [
    layout.title,
    layout.description,
    layout.category,
    ...(layout.businessTypes || []),
    layout.layoutFit || '',
  ]
  return bits.join(' ').toLowerCase()
}

function matchesBusinessType(layout, businessTypeId) {
  const type = getBusinessType(businessTypeId)
  if (!type) return false
  const tagged = Array.isArray(layout.businessTypes) && layout.businessTypes.length > 0
  if (tagged) return layout.businessTypes.includes(businessTypeId)
  const text = haystack(layout)
  return [type.id, type.label, ...type.keywords].some((k) => text.includes(k.toLowerCase()))
}

function matchesLayoutFit(layout, layoutFitId) {
  const fit = getLayoutFit(layoutFitId)
  if (!fit) return false
  if (layout.layoutFit) return layout.layoutFit === layoutFitId
  const text = haystack(layout)
  return [fit.id, fit.label, ...fit.keywords].some((k) => text.includes(k.toLowerCase()))
}

function matchScore(layout, { businessTypeId, layoutFitId, query }) {
  let score = 0
  if (businessTypeId) {
    const tagged = Array.isArray(layout.businessTypes) && layout.businessTypes.includes(businessTypeId)
    score += tagged ? 40 : matchesBusinessType(layout, businessTypeId) ? 20 : 0
  }
  if (layoutFitId) {
    score += layout.layoutFit === layoutFitId ? 30 : matchesLayoutFit(layout, layoutFitId) ? 15 : 0
  }
  const q = query.trim().toLowerCase()
  if (q) {
    const text = haystack(layout)
    if (layout.title?.toLowerCase().includes(q)) score += 25
    else if (text.includes(q)) score += 10
  }
  // Portfolio / category clarity boost when browsing portfolio fit
  if (layoutFitId === 'portfolio' || businessTypeId === 'photography' || businessTypeId === 'freelancers') {
    const text = haystack(layout)
    if (text.includes('portfolio') || layout.layoutFit === 'portfolio') score += 8
  }
  return score
}

/**
 * Match a catalog layout against visitor filters.
 * Prefers explicit tags; falls back to keyword scan so untagged layouts still surface.
 */
export function layoutMatchesFilters(layout, { businessTypeId = null, layoutFitId = null, query = '' } = {}) {
  const q = query.trim().toLowerCase()

  if (businessTypeId && !matchesBusinessType(layout, businessTypeId)) return false
  if (layoutFitId && !matchesLayoutFit(layout, layoutFitId)) return false

  if (!q) return true

  const text = haystack(layout)
  if (text.includes(q)) return true

  const typeHits = businessTypes.filter(
    (t) =>
      t.id === q ||
      t.label.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q) || q.includes(k)),
  )
  const fitHits = layoutFits.filter(
    (f) =>
      f.id === q ||
      f.label.toLowerCase().includes(q) ||
      f.typicalNeed.toLowerCase().includes(q) ||
      f.keywords.some((k) => k.includes(q) || q.includes(k)),
  )

  if (!typeHits.length && !fitHits.length) return false

  const typeOk = !typeHits.length || typeHits.some((t) => matchesBusinessType(layout, t.id))
  const fitOk = !fitHits.length || fitHits.some((f) => matchesLayoutFit(layout, f.id))
  return typeOk && fitOk
}

/**
 * Sort filtered layouts. `match` = relevance then title; `az` = title only.
 */
export function sortLayouts(layouts, sortId, filters = {}) {
  const list = [...layouts]
  if (sortId === 'az') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }))
    return list
  }
  list.sort((a, b) => {
    const scoreDiff = matchScore(b, filters) - matchScore(a, filters)
    if (scoreDiff !== 0) return scoreDiff
    return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
  })
  return list
}

/** Cmd+K entries — deep-link into gallery filters. Prefer websites (populated) collection. */
export const businessFitSearchEntries = [
  ...businessTypes.map((type) => ({
    id: `biz-${type.id}`,
    label: type.label,
    description: type.story?.headline || `Layouts for ${type.label.toLowerCase()}`,
    href: `${siteConfig.links.websites}?type=${encodeURIComponent(type.id)}#layouts`,
    keywords: [type.label.toLowerCase(), 'business type', 'layout fit', ...type.keywords],
  })),
  ...layoutFits.map((fit) => ({
    id: `fit-${fit.id}`,
    label: `${fit.label} layouts`,
    description: fit.story?.headline || fit.typicalNeed,
    href: `${siteConfig.links.websites}?fit=${encodeURIComponent(fit.id)}#fit-${fit.id}`,
    keywords: [fit.label.toLowerCase(), 'layout fit', 'layout', ...fit.keywords],
  })),
]
