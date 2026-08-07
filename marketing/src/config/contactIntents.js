/**
 * Contact intents — max six, visitor vocabulary (patterns/contact.md).
 * `id` may be pre-selected via ?intent=
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
      placeholder: 'e.g. FLW-… or invoice number',
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

export function intentFromSearchParam(value) {
  if (!value) return null
  return contactIntents.find((item) => item.id === value)?.id ?? null
}
