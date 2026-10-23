/**
 * Sleekly Attendant Uganda order — mirrors marketing commercial facts.
 * No numeric usage allowance.
 */

export const ATTENDANT_PRODUCT_ID = 'attendant-monthly'

export const attendantSubscription = {
  id: ATTENDANT_PRODUCT_ID,
  title: 'Sleekly Attendant: first month',
  shortTitle: 'Sleekly Attendant',
  amountUgx: 49000,
  amountCaption: 'first month',
  included: [
    'One website (or one hosted attendant link)',
    'Knowledge setup from approved business information',
    'Visitor Q&A within supported capabilities',
    'Navigation help to configured pages and sections',
    'Enquiry capture through the supported workflow',
    'Guided setup with our team',
    'Standard updates as we improve the product',
  ],
  exclusions: [
    'WhatsApp automation as a chat channel',
    'Multiple websites on one subscription',
    'Premium or custom integrations (quoted separately)',
    'Bookings, payments in chat, or CRM delivery',
  ],
  renewalsNote:
    'Renewals are paid monthly by Mobile Money — nothing is charged automatically.',
  usageNote:
    'Service is subject to normal operational limits. Any specific allowance is confirmed with you in writing during onboarding.',
}
