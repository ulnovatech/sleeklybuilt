import { siteConfig } from '../site.config'

/**
 * Sleekly Attendant — marketing copy and commercial facts (single source of truth).
 *
 * Hard rules:
 * - Do not publish a numeric usage allowance (no conversation/message quotas).
 * - Do not say "unlimited".
 * - Do not claim self-serve plugins, apps, or one-click install.
 * - Uganda pays first month via MoMo claim; international requests an invoice.
 *
 * Consumed by AttendantProductPage (Chunk 2+) and discovery surfaces (Chunk 4).
 */

export const ATTENDANT_PRODUCT_PATH = '/products/attendant'
export const ATTENDANT_ORDER_PATH = '/portfolio-app/order/attendant'
export const ATTENDANT_DEMO_ANCHOR = '#demo'
export const ATTENDANT_PRICING_ANCHOR = '#pricing'

/** Subscription SKU id used by the isolated payment claim path (Chunk 5). */
export const ATTENDANT_SUBSCRIPTION_PRODUCT_ID = 'attendant-monthly'

export const attendantProduct = {
  id: 'ai-attendant',
  name: 'Sleekly Attendant',
  category: 'AI business attendant for websites',
  path: ATTENDANT_PRODUCT_PATH,

  seo: {
    title: 'Sleekly Attendant — AI attendant for your website | SleeklyBuilt',
    description:
      'Give every visitor a clearer path to becoming your customer. Sleekly Attendant answers questions, guides people through your site, and captures enquiries — set up with you for UGX 49,000/month in Uganda or US$12/month internationally.',
  },

  hero: {
    eyebrow: 'Sleekly Attendant',
    category: 'AI business attendant for websites',
    tagline: 'Your website, ready to help.',
    headline: 'Give every visitor a clearer path to becoming your customer.',
    outcome:
      'Answer questions, guide people through your site, and capture enquiries — even when you are busy.',
    primaryCta: {
      label: 'Let’s Set Up Your AI Attendant',
      // Regional hrefs resolved via pricing.regions.*.ctaHref
    },
    secondaryCta: {
      label: 'See how it works',
      href: ATTENDANT_DEMO_ANCHOR,
    },
  },

  problem: {
    heading: 'What usually goes wrong on a busy website',
    intro:
      'Visitors arrive with a question. If the answer is buried — or nobody is free — they leave. Owners end up repeating the same replies instead of doing the work that grows the business.',
    scenarios: [
      {
        id: 'lost-answers',
        title: 'Visitors leave without answers',
        body: 'They look for prices, hours, or which service fits — and bounce when nothing is obvious.',
      },
      {
        id: 'repeat-questions',
        title: 'Owners answer the same questions again',
        body: 'WhatsApp and calls fill up with repeats that your site already could have handled.',
      },
      {
        id: 'wrong-path',
        title: 'People cannot find the next step',
        body: 'They do not know which page, layout, or service to open — so they never enquire.',
      },
      {
        id: 'missed-enquiries',
        title: 'Enquiries slip while you are busy',
        body: 'A serious buyer reaches out at the wrong moment and never hears back in time.',
      },
    ],
  },

  capabilities: {
    heading: 'What it helps visitors do',
    intro: 'Four outcomes that matter on a real business website — not a novelty chatbot.',
    items: [
      {
        id: 'answer',
        title: 'Answer with approved information',
        body: 'Visitors get short, correct replies from the business knowledge you approve — not invented prices or promises.',
        points: [
          'Uses the facts you review with us',
          'Says when it does not know',
          'Stays within supported capabilities',
        ],
      },
      {
        id: 'navigate',
        title: 'Guide people to the right place',
        body: 'When someone needs a page or section, the attendant can point them there instead of dumping a wall of text.',
        points: [
          'Helps visitors find services and next steps',
          'Works with the pages you configure',
          'Does not invent random URLs',
        ],
      },
      {
        id: 'enquire',
        title: 'Capture enquiries properly',
        body: 'When a visitor is ready to talk, the attendant can collect an enquiry through the supported workflow — with confirmation before anything is sent.',
        points: [
          'Enquiry capture after clear confirmation',
          'Human path stays available',
          'No fake “message sent” without a backend',
        ],
      },
      {
        id: 'next-step',
        title: 'Move them toward a clear next step',
        body: 'Contact, quote interest, or exploring an offering — the attendant nudges toward action instead of endless chat.',
        points: [
          'One useful next step with each answer',
          'Fits how your business actually sells',
          'Handoff to a person when needed',
        ],
      },
    ],
  },

  demo: {
    heading: 'See it in action',
    intro:
      'Try the real attendant on this SleeklyBuilt site, or step through a labelled illustration of supported behaviour.',
    live: {
      label: 'Try it live',
      badge: 'Live on this site',
      disclosure:
        'This opens SleeklyBuilt’s own attendant on sleeklybuilt.pro — the same product we set up for client websites, demonstrated here with our knowledge.',
      starterPrompt:
        'I run a small business. How can an AI attendant help visitors on my website?',
    },
    illustration: {
      label: 'Illustration',
      disclosure:
        'A paced sequence of supported behaviour only. It is not a live chat session.',
      steps: [
        {
          id: 'ask',
          title: 'Visitor asks',
          body: 'Someone opens the site and asks about a service in their own words.',
        },
        {
          id: 'answer',
          title: 'Attendant answers',
          body: 'A short reply grounded in approved business information.',
        },
        {
          id: 'navigate',
          title: 'Guide to the page',
          body: 'When it helps, the attendant points them to the relevant page or section.',
        },
        {
          id: 'enquire',
          title: 'Capture the enquiry',
          body: 'If they are ready, an enquiry can be collected through the supported flow — after confirmation.',
        },
      ],
    },
  },

  howItWorks: {
    heading: 'How it works',
    intro:
      'Setup is guided with our team. We review important facts with you — it is not a fully automatic install.',
    steps: [
      {
        id: 'share',
        title: 'Share your website and essentials',
        body: 'Tell us your site (or that you need a hosted link), plus the basics visitors ask most often.',
      },
      {
        id: 'review',
        title: 'We discover and review the facts',
        body: 'We pull relevant public content and review important details with you before anything goes live.',
      },
      {
        id: 'configure',
        title: 'Configure the attendant',
        body: 'We customise answers, navigation, and enquiry behaviour to match how you sell.',
      },
      {
        id: 'install',
        title: 'Install on your site or use a hosted link',
        body: 'Our team places it on a supported website, or delivers a hosted link you can share or embed.',
      },
      {
        id: 'help',
        title: 'Help visitors day to day',
        body: 'The attendant answers, guides, and captures enquiries within the capabilities enabled for your business.',
      },
    ],
  },

  installation: {
    heading: 'Installation options',
    intro:
      'We set it up with you. There is no self-serve plugin or app store install today.',
    options: [
      {
        id: 'wordpress',
        title: 'WordPress websites',
        status: 'team',
        statusLabel: 'Set up by our team',
        body: 'We install and configure the attendant on your WordPress site as part of onboarding.',
      },
      {
        id: 'shopify',
        title: 'Shopify stores',
        status: 'team',
        statusLabel: 'Set up by our team',
        body: 'We set it up on your Shopify store with you — not a one-click Shopify app.',
      },
      {
        id: 'other-sites',
        title: 'Other normal websites',
        status: 'team',
        statusLabel: 'Set up by our team',
        body: 'Most standard business sites can be supported. We confirm fit during onboarding.',
      },
      {
        id: 'hosted-link',
        title: 'Hosted attendant link',
        status: 'team',
        statusLabel: 'Delivered by our team',
        body: 'If you need a shareable or embeddable link instead of an on-site install, we deliver one after setup.',
      },
      {
        id: 'self-serve',
        title: 'Self-serve plugin or app',
        status: 'unavailable',
        statusLabel: 'Not available',
        body: 'There is no public WordPress plugin, Shopify app, or one-click installer yet.',
      },
    ],
  },

  /**
   * One plan. Region switch changes display currency only — no FX conversion.
   * usageAllowance intentionally omitted until metering exists.
   */
  pricing: {
    heading: 'Simple monthly pricing',
    intro:
      'One standard plan for one website. No setup fee for standard installation. Custom integrations are quoted separately.',
    planName: 'Sleekly Attendant',
    planSummary: 'Monthly subscription for one website',
    defaultRegion: 'uganda',
    regions: {
      uganda: {
        id: 'uganda',
        label: 'Uganda',
        amount: 49000,
        currency: 'UGX',
        period: 'month',
        displayPrice: 'UGX 49,000',
        displayPeriod: '/ month',
        ctaLabel: 'Let’s Set Up Your AI Attendant',
        ctaHref: ATTENDANT_ORDER_PATH,
        paymentNote:
          'Pay the first month with MTN Mobile Money or Airtel Money. After we verify payment, we contact you to collect business details and begin setup. Renewals are paid monthly the same way — nothing is charged automatically.',
      },
      international: {
        id: 'international',
        label: 'International',
        amount: 12,
        currency: 'USD',
        period: 'month',
        displayPrice: 'US$12',
        displayPeriod: '/ month',
        ctaLabel: 'Request setup & invoice',
        ctaHref: `${siteConfig.links.contact}?intent=ai-attendant`,
        paymentNote:
          'Submit an order request and we follow up with an invoice. Card checkout is not available on this site today.',
      },
    },
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
    footnotes: [
      'No setup fee for standard installation.',
      'Custom integrations and complex implementation are quoted separately.',
      'Service is subject to normal operational limits. Any specific allowance is confirmed with you in writing during onboarding — we do not publish a conversation quota on this page.',
    ],
  },

  trust: {
    heading: 'Trust and transparency',
    intro: 'Clear boundaries build better attendant experiences than overpromising.',
    knows: {
      title: 'What it knows',
      body: 'Approved business information you review with us, the pages you configure, and the conversation context on that visit.',
    },
    can: {
      title: 'What it can do',
      items: [
        'Answer visitor questions from approved knowledge',
        'Guide visitors to relevant pages and sections',
        'Capture enquiries after confirmation',
        'Hand off to a human when needed',
      ],
    },
    cannot: {
      title: 'What it cannot do',
      items: [
        'Book appointments or reserve slots',
        'Take card or Mobile Money payments in chat',
        'Push leads into a CRM by itself',
        'Automate WhatsApp as its chat channel',
        'Cover multiple websites on one plan',
      ],
    },
    human: {
      title: 'When a human steps in',
      body: 'Visitors can ask for a person. Matters outside attendant authority escalate. WhatsApp and phone remain available on your site as usual.',
    },
  },

  faq: [
    {
      id: 'att-what',
      question: 'What is Sleekly Attendant?',
      answer:
        'An AI business attendant for websites. It helps visitors get answers, find the right pages, and leave an enquiry — using information you approve.',
    },
    {
      id: 'att-help',
      question: 'How does it help my business?',
      answer:
        'It covers common questions when you are busy, guides people toward the right next step, and captures enquiries through a supported workflow so fewer serious buyers slip away.',
    },
    {
      id: 'att-knowledge',
      question: 'What information does it use to answer visitors?',
      answer:
        'Approved business information reviewed with you during setup — services, process, and other facts you want visitors to hear. It should not invent prices or unsupported promises.',
    },
    {
      id: 'att-navigate',
      question: 'Can it guide visitors to the right pages?',
      answer:
        'Yes, within the pages and sections configured for your site. It does not invent arbitrary URLs.',
    },
    {
      id: 'att-enquire',
      question: 'Can it capture enquiries?',
      answer:
        'Yes. Enquiries go through the supported capture flow with confirmation before anything is submitted. That is not the same as pushing data into a CRM automatically.',
    },
    {
      id: 'att-existing-site',
      question: 'Does it work with my existing website?',
      answer:
        'Most normal business websites can be supported. Our team confirms fit and installs it with you. There is no self-serve plugin today.',
    },
    {
      id: 'att-no-website',
      question: 'What if I do not have a website?',
      answer:
        'We can deliver a hosted attendant link after setup — something you can share or embed — instead of installing on a site you do not have yet.',
    },
    {
      id: 'att-install',
      question: 'How do I install it?',
      answer:
        'You order (or request an invoice), we verify payment or follow up, then we collect business details and set it up with you. Setup is reviewed by our team — not fully automatic.',
    },
    {
      id: 'att-included',
      question: 'What is included in the subscription?',
      answer:
        'One website or hosted link, knowledge setup, visitor Q&A and navigation within supported capabilities, enquiry capture, guided setup, and standard product updates. Custom integrations are quoted separately.',
    },
    {
      id: 'att-cost',
      question: 'How much does it cost?',
      answer:
        'UGX 49,000 per month in Uganda, or US$12 per month internationally. One standard plan. No setup fee for standard installation.',
    },
    {
      id: 'att-limits',
      question: 'Are there usage limits?',
      answer:
        'Yes — normal operational limits apply so we can keep service reliable. We do not publish a conversation or message quota on this page. Any specific allowance is confirmed with you in writing before or when you start.',
    },
    {
      id: 'att-bookings',
      question: 'Can it book appointments, take payments, or update my CRM?',
      answer:
        'No. It can guide someone toward contact or an enquiry, but it does not book slots, take payments in chat, or deliver into a CRM. Finding a contact page is not the same as completing a booking.',
    },
    {
      id: 'att-cancel',
      question: 'How do I cancel or get help?',
      answer:
        'Contact us on WhatsApp, phone, or email. Renewals are manual monthly payments — nothing auto-charges. We will confirm how to pause or stop at onboarding.',
    },
  ],

  finalCta: {
    heading: 'Ready for a website that helps back?',
    body: 'Set up Sleekly Attendant with our team. One plan, clear installation, honest limits.',
  },

  /** Discovery surfaces (Chunk 4) — kept here so catalogue copy cannot drift. */
  spotlight: {
    name: 'Sleekly Attendant',
    benefit: 'Your website, ready to help visitors become customers.',
    ctaLabel: 'Meet Sleekly Attendant',
    href: ATTENDANT_PRODUCT_PATH,
  },

  catalogue: {
    name: 'Sleekly Attendant',
    blurb: 'AI attendant for websites — answers, guidance, and enquiry capture.',
    href: ATTENDANT_PRODUCT_PATH,
    ctaLabel: 'View product',
  },

  cmdk: {
    id: 'sleekly-attendant',
    label: 'Sleekly Attendant',
    hint: 'AI attendant for your website',
    href: ATTENDANT_PRODUCT_PATH,
    keywords: [
      'ai',
      'attendant',
      'assistant',
      'chat',
      'chatbot',
      'enquiry',
      'sleekly attendant',
      'ai attendant',
      'subscription',
    ],
  },
}

export default attendantProduct
