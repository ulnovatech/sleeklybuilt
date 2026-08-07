export function formatUgx(amount) {
  if (typeof amount === 'string' && amount.startsWith('UGX')) return amount
  return `UGX ${Number(amount).toLocaleString('en-UG')}`
}

/** One-time project packages — not SaaS seats. Currency is UGX only (no client-side conversion). */

export const websitePackages = [
  {
    id: 'starter',
    title: 'Starter Web',
    priceUgx: 250000,
    idealFor: 'Best for students, hustlers, and small traders',
    pages: '5–10',
    differentiators: ['Mobile-friendly layout', 'WhatsApp button', 'Basic Google visibility'],
    features: [
      'Mobile friendly design',
      'WhatsApp chat button',
      'Business contact info',
      'Basic Google visibility setup',
      'Free .ug domain (optional)',
      'Free support for 14 days',
    ],
    highlight: 'Start strong with an online presence at the lowest cost',
    cta: '/portfolio-app/order',
    ctaLabel: 'Browse layouts to order',
  },
  {
    id: 'business-basic',
    title: 'Business Basic',
    priceUgx: 400000,
    idealFor: 'Best for small businesses and startups',
    pages: '10–25',
    differentiators: ['About, services, gallery', 'Contact form included', 'Hosting setup'],
    features: [
      'Mobile responsive layout',
      'About, Services, Contact, Gallery pages',
      'Contact form & WhatsApp link',
      'Social media integration',
      'Google-friendly structure',
      'Hosting setup included',
    ],
    highlight: 'Make your business searchable, reachable & professional',
    recommended: true,
    recommendedWhy: 'Best fit for most small businesses starting online',
    badge: 'Recommended',
    cta: '/portfolio-app/order',
    ctaLabel: 'Browse layouts to order',
  },
  {
    id: 'standard-growth',
    title: 'Standard Growth',
    priceUgx: 850000,
    idealFor: 'Best for SMEs, NGOs, schools, and clinics',
    pages: '6–10',
    differentiators: ['Admin / CMS', 'Blog or news', 'SEO structure'],
    features: [
      'Mobile-first responsive design',
      'Admin Dashboard / CMS',
      'Blog or News section',
      'Google SEO boost',
      'SSL security',
      'Embedded maps, social feeds, sliders',
    ],
    highlight: 'A complete digital growth tool for small–mid organizations',
    cta: '/portfolio-app/order',
    ctaLabel: 'Browse layouts to order',
  },
  {
    id: 'pro-ecommerce',
    title: 'Pro E-Commerce',
    priceUgx: 2500000,
    idealFor: 'Best for online shops and boutiques',
    pages: '10–20',
    differentiators: ['Cart and checkout', 'Mobile Money', 'Orders admin'],
    features: [
      'Responsive online store design',
      'Shopping cart, checkout, categories',
      'Mobile Money (MoMo/Airtel) integration',
      'Admin dashboard for orders, stock, users',
      'Email alerts + SSL security',
      'Product search + filters',
    ],
    highlight: 'Launch your shop online and start selling 24/7',
    cta: '/portfolio-app/order',
    ctaLabel: 'Browse layouts to order',
  },
]

export const websiteEnterprise = {
  id: 'custom-web',
  title: 'Custom web systems',
  priceLabel: 'From UGX 3,500,000',
  idealFor: 'SACCOs, schools, dashboards, internal tools',
  differentiators: [
    'Custom dashboards and roles',
    'Integrations (e.g. MoMo)',
    'Built around your workflows',
  ],
  highlight: 'Digitize operations with a tailor-made web system',
  cta: '/contact?intent=project',
  ctaLabel: 'Request a quote',
}

export const appPackages = [
  {
    id: 'ecommerce-app',
    title: 'E-Commerce App',
    priceLabel: 'From UGX 2,500,000',
    idealFor: 'Best for shops and fashion stores',
    differentiators: ['Listings and search', 'Cart + checkout', 'Mobile Money'],
    features: [
      'Product listings & search',
      'Shopping cart + checkout',
      'Mobile Money integration',
      'Admin dashboard',
      'Order management',
      'Push/email notifications',
    ],
    highlight: 'Launch a full-featured online store that sells 24/7',
    recommended: true,
    recommendedWhy: 'Most requested app starting point',
    badge: 'Recommended',
    cta: '/contact?intent=project',
    ctaLabel: 'Start a project',
  },
  {
    id: 'restaurant-app',
    title: 'Restaurant & Delivery',
    priceLabel: 'From UGX 3,500,000',
    idealFor: 'Best for restaurants and takeaways',
    differentiators: ['Menu browsing', 'Order status', 'Optional rider panel'],
    features: [
      'Menu browsing',
      'Order placement + cart',
      'Rider/driver panel (optional)',
      'Real-time status updates',
      'MoMo/AirtelPay checkout',
      'Admin dashboard',
    ],
    highlight: 'Serve meals faster with a branded ordering system',
    cta: '/contact?intent=project',
    ctaLabel: 'Start a project',
  },
  {
    id: 'sacco-app',
    title: 'SACCO / Finance',
    priceLabel: 'From UGX 4,000,000',
    idealFor: 'Best for SACCOs and microfinance',
    differentiators: ['Members and loans', 'Balances', 'Staff admin'],
    features: [
      'Member registration & loans',
      'Transactions & balances',
      'MoMo integration (optional)',
      'Staff/admin dashboard',
      'Reports, analytics & downloads',
      'Secure authentication',
    ],
    highlight: 'Digitize SACCO operations securely',
    cta: '/contact?intent=project',
    ctaLabel: 'Start a project',
  },
  {
    id: 'school-app',
    title: 'School Management',
    priceLabel: 'From UGX 3,800,000',
    idealFor: 'Best for private schools and colleges',
    differentiators: ['Enrollment', 'Fees and invoices', 'Results'],
    features: [
      'Student enrollment & records',
      'Class schedules',
      'Staff/teacher panels',
      'Fees tracking + invoices',
      'Reports & result slips',
      'MoMo payment options',
    ],
    highlight: 'Streamline school admin and parent communication',
    cta: '/contact?intent=project',
    ctaLabel: 'Start a project',
  },
]

export const appEnterprise = {
  id: 'custom-app',
  title: 'Custom system',
  priceLabel: 'Quote only',
  idealFor: 'Any specialized app or internal tool',
  differentiators: [
    'Built to your workflows',
    'API integrations',
    'Roles and scale from day one',
  ],
  highlight: 'Exactly what your business needs — scoped before we build',
  cta: '/contact?intent=project',
  ctaLabel: 'Request a quote',
}

/** Differentiating matrix for website packages (shared features omitted). */
export const websiteFeatureMatrix = [
  {
    category: 'Scope',
    rows: [
      { feature: 'Typical page range', values: { starter: '5–10', 'business-basic': '10–25', 'standard-growth': '6–10', 'pro-ecommerce': '10–20' } },
      { feature: 'Admin / CMS', values: { starter: false, 'business-basic': false, 'standard-growth': true, 'pro-ecommerce': true } },
      { feature: 'Blog or news', values: { starter: false, 'business-basic': false, 'standard-growth': true, 'pro-ecommerce': false } },
    ],
  },
  {
    category: 'Commerce & contact',
    rows: [
      { feature: 'Contact form', values: { starter: false, 'business-basic': true, 'standard-growth': true, 'pro-ecommerce': true } },
      { feature: 'WhatsApp button', values: { starter: true, 'business-basic': true, 'standard-growth': true, 'pro-ecommerce': true } },
      { feature: 'Cart & checkout', values: { starter: false, 'business-basic': false, 'standard-growth': false, 'pro-ecommerce': true } },
      { feature: 'Mobile Money', values: { starter: false, 'business-basic': false, 'standard-growth': false, 'pro-ecommerce': true } },
    ],
  },
  {
    category: 'Launch support',
    rows: [
      { feature: 'Hosting setup', values: { starter: false, 'business-basic': true, 'standard-growth': true, 'pro-ecommerce': true } },
      { feature: 'Post-launch support window', values: { starter: '14 days', 'business-basic': 'Included', 'standard-growth': 'Included', 'pro-ecommerce': 'Included' } },
    ],
  },
]

export const pricingFaq = [
  {
    id: 'price-currency',
    question: 'What currency are these prices in?',
    answer:
      'All listed prices are in Ugandan Shillings (UGX). We do not convert to other currencies on this page — the number you see is what we quote in UGX.',
  },
  {
    id: 'price-tax',
    question: 'Is tax included?',
    answer:
      'Listed package prices exclude VAT unless we state otherwise in your written quote. Tax treatment is confirmed before you pay a deposit.',
  },
  {
    id: 'price-negotiable',
    question: 'Are prices fixed?',
    answer:
      'Package prices are starting points. Bundled work or a different scope can change the quote — we confirm the number in writing before work starts.',
  },
  {
    id: 'price-deposit',
    question: 'How do website layout orders work?',
    answer:
      'Ready website layouts from the portfolio use deposit checkout. Custom apps and systems start with a conversation and a scoped quote — no surprise invoices.',
  },
  {
    id: 'price-wrong-plan',
    question: 'What if I choose the wrong package?',
    answer:
      'Tell us before we start building. We re-scope or move you to a better fit. After work begins, changes follow the written change process in your quote.',
  },
]
