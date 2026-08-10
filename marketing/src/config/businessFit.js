import { siteConfig } from '../site.config'

/**
 * Business type → layout fit taxonomy (visitor guide).
 * Never say “template” in UI — these are layouts / layout fits / live previews.
 *
 * Discovery can reuse the same IDs later; Opportunity Status is operator-only
 * and is intentionally absent here.
 */

/** @typedef {{ id: string, label: string, typicalNeed: string, keywords: string[] }} LayoutFit */
/** @typedef {{ id: string, label: string, layoutFitIds: string[], keywords: string[] }} BusinessType */

/** @type {LayoutFit[]} */
export const layoutFits = [
  {
    id: 'ordering',
    label: 'Ordering',
    typicalNeed: 'Menu, ordering, reservations',
    keywords: ['order', 'ordering', 'menu', 'reservation', 'restaurant'],
  },
  {
    id: 'menu',
    label: 'Menu',
    typicalNeed: 'Menu, location, WhatsApp',
    keywords: ['menu', 'cafe', 'café', 'whatsapp', 'location'],
  },
  {
    id: 'booking',
    label: 'Booking',
    typicalNeed: 'Services, booking, appointments, membership',
    keywords: ['book', 'booking', 'appointment', 'reservation', 'membership', 'schedule'],
  },
  {
    id: 'property-listings',
    label: 'Property listings',
    typicalNeed: 'Properties, inquiry, agents',
    keywords: ['property', 'real estate', 'listing', 'agent', 'rent'],
  },
  {
    id: 'contractor',
    label: 'Contractor / projects',
    typicalNeed: 'Services, projects, quote request',
    keywords: ['construction', 'contractor', 'project', 'quote', 'architecture'],
  },
  {
    id: 'professional',
    label: 'Professional',
    typicalNeed: 'Practice areas, services, consultation',
    keywords: ['legal', 'law', 'accounting', 'finance', 'consult'],
  },
  {
    id: 'education',
    label: 'Education',
    typicalNeed: 'Programs, admissions, information',
    keywords: ['school', 'education', 'admission', 'program', 'course'],
  },
  {
    id: 'organization',
    label: 'Organization',
    typicalNeed: 'Events, programs, contact, donations',
    keywords: ['church', 'ngo', 'organization', 'donation', 'impact', 'community'],
  },
  {
    id: 'travel',
    label: 'Travel / tours',
    typicalNeed: 'Packages, booking, inquiries',
    keywords: ['travel', 'tour', 'package', 'trip'],
  },
  {
    id: 'rental',
    label: 'Rental',
    typicalNeed: 'Vehicles, availability, booking',
    keywords: ['rental', 'hire', 'vehicle', 'car'],
  },
  {
    id: 'vehicle-listings',
    label: 'Vehicle listings',
    typicalNeed: 'Inventory, inquiry',
    keywords: ['dealer', 'car', 'vehicle', 'inventory', 'auto'],
  },
  {
    id: 'events',
    label: 'Events',
    typicalNeed: 'Packages, portfolio, inquiry',
    keywords: ['event', 'planner', 'wedding', 'rsvp'],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    typicalNeed: 'Portfolio, packages, booking, contact',
    keywords: ['portfolio', 'photography', 'freelancer', 'personal'],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    typicalNeed: 'Products, catalog, showroom, WhatsApp',
    keywords: ['catalog', 'catalogue', 'product', 'shop', 'commerce', 'store', 'fashion', 'furniture'],
  },
  {
    id: 'service-business',
    label: 'Service business',
    typicalNeed: 'Services, quote request',
    keywords: ['cleaning', 'moving', 'security', 'service', 'quote'],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    typicalNeed: 'Services, capabilities, inquiry',
    keywords: ['corporate', 'industrial', 'manufacturer', 'company'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    typicalNeed: 'Services, tracking, inquiry',
    keywords: ['logistics', 'courier', 'delivery', 'tracking', 'freight'],
  },
  {
    id: 'agency',
    label: 'Agency',
    typicalNeed: 'Services, case studies, lead capture',
    keywords: ['agency', 'case study', 'lead', 'marketing'],
  },
]

/** @type {BusinessType[]} */
export const businessTypes = [
  { id: 'restaurants', label: 'Restaurants', layoutFitIds: ['ordering', 'menu'], keywords: ['restaurant', 'dining', 'food'] },
  { id: 'cafes', label: 'Cafés', layoutFitIds: ['menu', 'ordering'], keywords: ['cafe', 'café', 'coffee'] },
  { id: 'hotels', label: 'Hotels', layoutFitIds: ['booking'], keywords: ['hotel', 'lodge', 'rooms'] },
  { id: 'salons', label: 'Salons & barbers', layoutFitIds: ['booking'], keywords: ['salon', 'barber', 'beauty', 'spa'] },
  { id: 'clinics', label: 'Clinics', layoutFitIds: ['booking'], keywords: ['clinic', 'medical', 'doctor', 'health'] },
  { id: 'gyms', label: 'Gyms', layoutFitIds: ['booking'], keywords: ['gym', 'fitness', 'membership'] },
  { id: 'real-estate', label: 'Real estate', layoutFitIds: ['property-listings'], keywords: ['real estate', 'property', 'realtor'] },
  { id: 'construction', label: 'Construction', layoutFitIds: ['contractor'], keywords: ['construction', 'contractor', 'builder'] },
  { id: 'law-firms', label: 'Law firms', layoutFitIds: ['professional'], keywords: ['law', 'legal', 'attorney'] },
  { id: 'accounting', label: 'Accounting', layoutFitIds: ['professional'], keywords: ['accounting', 'finance', 'bookkeeping'] },
  { id: 'schools', label: 'Schools', layoutFitIds: ['education'], keywords: ['school', 'education', 'academy'] },
  { id: 'churches', label: 'Churches / organizations', layoutFitIds: ['organization'], keywords: ['church', 'ministry', 'organization'] },
  { id: 'travel', label: 'Travel agencies', layoutFitIds: ['travel', 'booking'], keywords: ['travel', 'tour', 'agency'] },
  { id: 'car-rental', label: 'Car rental', layoutFitIds: ['rental'], keywords: ['car rental', 'hire'] },
  { id: 'auto-dealers', label: 'Auto dealers', layoutFitIds: ['vehicle-listings'], keywords: ['dealer', 'auto', 'cars'] },
  { id: 'event-planners', label: 'Event planners', layoutFitIds: ['events'], keywords: ['event', 'planner', 'wedding'] },
  { id: 'photography', label: 'Photography', layoutFitIds: ['portfolio'], keywords: ['photo', 'photography'] },
  { id: 'fashion', label: 'Fashion / clothing', layoutFitIds: ['catalog'], keywords: ['fashion', 'clothing', 'apparel'] },
  { id: 'furniture', label: 'Furniture', layoutFitIds: ['catalog'], keywords: ['furniture', 'showroom'] },
  { id: 'electronics', label: 'Electronics', layoutFitIds: ['catalog'], keywords: ['electronics', 'gadgets'] },
  { id: 'supermarkets', label: 'Supermarkets', layoutFitIds: ['catalog'], keywords: ['supermarket', 'grocery', 'store'] },
  { id: 'cleaning', label: 'Cleaning services', layoutFitIds: ['service-business'], keywords: ['cleaning', 'janitorial'] },
  { id: 'moving', label: 'Moving companies', layoutFitIds: ['service-business'], keywords: ['moving', 'relocation'] },
  { id: 'security', label: 'Security companies', layoutFitIds: ['service-business', 'corporate'], keywords: ['security', 'guard'] },
  { id: 'logistics', label: 'Logistics / courier', layoutFitIds: ['logistics'], keywords: ['logistics', 'courier', 'delivery'] },
  { id: 'ngos', label: 'NGOs', layoutFitIds: ['organization'], keywords: ['ngo', 'nonprofit', 'charity'] },
  { id: 'manufacturers', label: 'Manufacturers', layoutFitIds: ['corporate', 'catalog'], keywords: ['manufacturer', 'industrial', 'factory'] },
  { id: 'wholesalers', label: 'Wholesalers / distributors', layoutFitIds: ['catalog'], keywords: ['wholesale', 'distributor', 'b2b'] },
  { id: 'freelancers', label: 'Freelancers', layoutFitIds: ['portfolio'], keywords: ['freelancer', 'personal', 'consultant'] },
  { id: 'agencies', label: 'Agencies', layoutFitIds: ['agency'], keywords: ['agency', 'studio', 'marketing'] },
]

export function getLayoutFit(id) {
  return layoutFits.find((fit) => fit.id === id) ?? null
}

export function getBusinessType(id) {
  return businessTypes.find((type) => type.id === id) ?? null
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

/** Cmd+K entries — deep-link into gallery filters. Prefer websites (populated) collection. */
export const businessFitSearchEntries = [
  ...businessTypes.map((type) => ({
    id: `biz-${type.id}`,
    label: type.label,
    description: `Layouts for ${type.label.toLowerCase()}`,
    href: `${siteConfig.links.websites}?type=${encodeURIComponent(type.id)}#layouts`,
    keywords: [type.label.toLowerCase(), 'business type', 'layout fit', ...type.keywords],
  })),
  ...layoutFits.map((fit) => ({
    id: `fit-${fit.id}`,
    label: `${fit.label} layouts`,
    description: fit.typicalNeed,
    href: `${siteConfig.links.websites}?fit=${encodeURIComponent(fit.id)}#fit-${fit.id}`,
    keywords: [fit.label.toLowerCase(), 'layout fit', 'layout', ...fit.keywords],
  })),
]
