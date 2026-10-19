/**
 * Contact intents — max six chips for undecided visitors (patterns/contact.md).
 * Product heroes deep-link via directedProductIntents (?intent=website|app|…).
 */

export const contactIntents = [
  {
    id: 'project',
    label: 'I want to start a project',
    subject: 'Project enquiry',
    deflect: null,
  },
  {
    id: 'pricing',
    label: 'I have a question about pricing',
    subject: 'Pricing question',
    deflect: {
      text: 'Package prices are listed on the pricing page.',
      href: '/prices',
      linkLabel: 'View pricing',
    },
  },
  {
    id: 'order',
    label: 'I need help with an existing order',
    subject: 'Order support',
    extraField: {
      id: 'orderRef',
      label: 'Payment or order reference',
      hint: 'So we can find your order straight away.',
      placeholder: 'e.g. SB-PAY-… or invoice number',
    },
    deflect: {
      text: 'You can check status yourself if you have the payment reference.',
      href: '/track-order',
      linkLabel: 'Track order',
    },
  },
  {
    id: 'partnership',
    label: 'Partnership or press',
    subject: 'Partnership / press',
    deflect: null,
  },
  {
    id: 'broken',
    label: 'Something is not working',
    subject: 'Support — something broken',
    deflect: null,
  },
  {
    id: 'other',
    label: 'Something else',
    subject: 'General enquiry',
    deflect: null,
  },
]

/** Deep-link only — not shown as chips on the generic contact form. */
export const directedProductIntents = {
  website: { id: 'website', label: 'I want a website', subject: 'Website project', deflect: null },
  'sleek-page': {
    id: 'sleek-page',
    label: 'I want a Sleek Page',
    subject: 'Sleek Page project',
    deflect: null,
  },
  app: { id: 'app', label: 'I want a mobile app', subject: 'Mobile app project', deflect: null },
  system: {
    id: 'system',
    label: 'I want a business system',
    subject: 'Business system project',
    deflect: null,
  },
  store: {
    id: 'store',
    label: 'I want an online store',
    subject: 'E-commerce / store project',
    deflect: null,
  },
  'ai-attendant': {
    id: 'ai-attendant',
    label: 'I want an AI attendant',
    subject: 'AI attendant setup',
    deflect: null,
  },
  software: {
    id: 'software',
    label: 'I want custom software',
    subject: 'Custom software project',
    deflect: null,
  },
  branding: {
    id: 'branding',
    label: 'I want branding help',
    subject: 'Branding project',
    deflect: null,
  },
}

export function resolveContactIntent(id) {
  if (!id) return null
  return (
    contactIntents.find((item) => item.id === id) ??
    directedProductIntents[id] ??
    null
  )
}

export function intentFromSearchParam(value) {
  if (!value) return null
  return resolveContactIntent(value)?.id ?? null
}
