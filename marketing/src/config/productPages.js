import { siteConfig } from '../site.config'

/**
 * Product page content — outcome headings, visitor vocabulary.
 * Features: max four per page (feature_sections). FAQ ids are URL fragments.
 */

export const sleekPagesContent = {
  id: 'sleek-pages',
  eyebrow: 'Sleek Pages',
  title: 'Premium layouts that go live in a day',
  intro: 'Pick a layout, we personalise it to your brand, and you are online — without a weeks-long build.',
  secondaryAction: {
    href: siteConfig.links.portfolio,
    label: 'Browse layouts',
  },
  features: [
    {
      title: 'Go live while the idea is still warm',
      body: 'A finished layout means design and structure are already solved. You spend the day on content and brand, not blank pages.',
      points: ['Live within about 24 hours after content is ready', 'Desktop and mobile already designed', 'Clear pages for contact and WhatsApp'],
    },
    {
      title: 'Look established from day one',
      body: 'These are curated layouts — not generic builders. Typography, spacing and hierarchy are already set to a premium bar.',
      points: ['Professionally composed sections', 'Brand colours and logo applied for you', 'No theme-store look'],
    },
    {
      title: 'Room to grow later',
      body: 'Start fast, then expand into a fuller website or system when the business needs it — without throwing the first launch away.',
      points: ['Same team for the next phase', 'Content you already wrote carries forward', 'Honest scope when you outgrow a one-pager'],
    },
  ],
  faq: [
    {
      id: 'sp-what-is',
      question: 'What is a Sleek Page?',
      answer:
        'A premium one-page or compact layout we personalise for your brand and publish quickly. It is a finished foundation — not a DIY builder kit.',
    },
    {
      id: 'sp-how-fast',
      question: 'How fast can I go live?',
      answer:
        'Most Sleek Pages launch within about a day once you have chosen a layout and shared your logo, colours and copy. If content is missing, we help you fill the gaps first.',
    },
    {
      id: 'sp-vs-website',
      question: 'When should I choose a full website instead?',
      answer:
        'Choose a multi-page website when you need a blog, CMS, many service pages, or a shop. Choose Sleek Pages when you need a strong online presence fast.',
    },
    {
      id: 'sp-cost',
      question: 'How much does a Sleek Page cost?',
      answer:
        'Pricing depends on the layout and personalisation. Tell us what you need and we reply within one working day with a clear quote — before any work starts.',
    },
    {
      id: 'sp-change',
      question: 'Can I change it after launch?',
      answer:
        'Yes. We can update copy, images and sections, or grow the site into a fuller website when you are ready.',
    },
  ],
}

export const websitesContent = {
  id: 'websites',
  eyebrow: 'Websites',
  title: 'Multi-page sites built to grow with you',
  intro: 'Services, gallery, blog and CMS — structured for search and built so you can change them without starting over.',
  secondaryAction: {
    href: siteConfig.links.portfolio,
    label: 'Browse projects',
  },
  features: [
    {
      title: 'Pages that match how buyers decide',
      body: 'Home, about, services, gallery and contact — ordered so a visitor finds what they need and knows how to reach you.',
      points: ['Clear information architecture', 'Mobile-first layouts', 'WhatsApp and contact paths that work'],
    },
    {
      title: 'Content you can update',
      body: 'When you need a blog, news or editable pages, we set up a CMS so your team can publish without waiting on a developer for every change.',
      points: ['Optional CMS and blog', 'Training on how to update', 'Documented handoff'],
    },
    {
      title: 'Found in search, not only in WhatsApp',
      body: 'Structure, titles and performance are part of the build — so the site can earn organic visits, not only link shares.',
      points: ['Search-friendly page structure', 'Fast loads on real connections', 'Analytics ready when you want them'],
    },
    {
      title: 'See real layouts before you commit',
      body: 'Browse published work in our projects gallery, open live previews, and click through them before we talk scope.',
      points: ['Live previews', 'Deposit checkout on selected layouts', 'Custom builds when nothing fits'],
    },
  ],
  faq: [
    {
      id: 'web-how-long',
      question: 'How long does a website take?',
      answer:
        'Most multi-page sites take a few weeks from agreed scope to launch. Timeline depends on content readiness and how many pages you need — we write that into the plan before we start.',
    },
    {
      id: 'web-cms',
      question: 'Can I edit the site myself?',
      answer:
        'Yes, when a CMS is in scope. We set it up, show your team how to publish, and leave documentation so you are not locked to us for every text change.',
    },
    {
      id: 'web-ecommerce',
      question: 'Do you build online shops?',
      answer:
        'Yes — product pages, cart and checkout suited to your catalogue size. For Mobile Money and local payments, we design around how your customers actually pay.',
    },
    {
      id: 'web-vs-sleek',
      question: 'Sleek Pages or a full website?',
      answer:
        'Sleek Pages are for a fast, focused launch. A full website is better when you need many pages, a blog, CMS or ecommerce. We will recommend honestly which fits.',
    },
    {
      id: 'web-hosting',
      question: 'Do you handle hosting?',
      answer:
        'We can set up hosting and domains as part of the project, or work with what you already have. Either way you get a clear handoff.',
    },
  ],
}

export const mobileAppsContent = {
  id: 'mobile-apps',
  eyebrow: 'Mobile Apps',
  title: 'Apps your customers can actually pay with',
  intro: 'Android and iOS products with Mobile Money, admin dashboards and reporting — built for how people here already buy and work.',
  features: [
    {
      title: 'Payments that match the market',
      body: 'MTN MoMo, Airtel Money and related flows belong in the product, not as an afterthought bolted on at the end.',
      points: ['Mobile Money in the checkout path', 'Clear success and failure states', 'Receipts and order history your team can trust'],
    },
    {
      title: 'An admin side your staff will use',
      body: 'Orders, users and inventory need a dashboard that works on a laptop in the office — not only a pretty customer app.',
      points: ['Role-based access', 'Reports you can act on', 'Training for the people who run it'],
    },
    {
      title: 'Built for real phones and real networks',
      body: 'We design for mid-range Android first, then polish for iOS — so the app stays usable on the devices your customers own.',
      points: ['Offline-tolerant patterns where needed', 'Lean payloads', 'Store submission support'],
    },
  ],
  faq: [
    {
      id: 'app-platforms',
      question: 'Android, iOS, or both?',
      answer:
        'We can ship one platform first or both, depending on where your customers are. Many launches start on Android, then add iOS once the workflow is proven.',
    },
    {
      id: 'app-momo',
      question: 'Can you integrate Mobile Money?',
      answer:
        'Yes. Mobile Money is a first-class requirement for most of the apps we build — not a nice-to-have.',
    },
    {
      id: 'app-how-long',
      question: 'How long does an app take?',
      answer:
        'It depends on the workflows. After a discovery conversation we give a written timeline and cost before build starts. Simple utility apps are faster; marketplaces and logistics take longer.',
    },
    {
      id: 'app-maintain',
      question: 'Who maintains the app after launch?',
      answer:
        'We stay involved for fixes, store updates and improvements. Launch is the start of the relationship, not the end.',
    },
    {
      id: 'app-admin',
      question: 'Do I get an admin dashboard?',
      answer:
        'Almost always. Customer apps need a place for your team to manage orders, users and content. That dashboard is part of the product, not an extra surprise.',
    },
  ],
}

export const businessSystemsContent = {
  id: 'business-systems',
  eyebrow: 'Business Systems',
  title: 'Software that runs the operation',
  intro: 'Inventory, CRM, POS, HR, invoicing and approvals — built around how your team actually works, not a generic SaaS checklist.',
  features: [
    {
      title: 'Replace the spreadsheet stack',
      body: 'One system for the workflows that currently live in Excel, WhatsApp and memory — with clear ownership and audit trails.',
      points: ['Roles and permissions', 'Approvals and status history', 'Exports when you still need a sheet'],
    },
    {
      title: 'Fit the industry, not a generic pitch',
      body: 'SACCO, school, clinic, retail or logistics — we model your real process, then automate the painful parts.',
      points: ['Discovery before build', 'Written scope you can share with stakeholders', 'Phased delivery you can try weekly'],
    },
    {
      title: 'Dashboards that answer “what now?”',
      body: 'Numbers without decisions are decoration. We surface the metrics operators use to act the same day.',
      points: ['Operational KPIs, not vanity charts', 'Mobile-friendly admin where field staff need it', 'Training included'],
    },
  ],
  faq: [
    {
      id: 'sys-what',
      question: 'What counts as a business system?',
      answer:
        'Software your team uses to run the operation — CRM, POS, inventory, HR, invoicing, bookings, school or SACCO platforms. If it replaces a messy spreadsheet, it belongs here.',
    },
    {
      id: 'sys-custom',
      question: 'Is everything custom-built?',
      answer:
        'We build around your workflow. Some modules reuse proven patterns; the rules, roles and reports are yours. You will not get a one-size-fits-all install with your logo stuck on.',
    },
    {
      id: 'sys-time',
      question: 'How long do systems take?',
      answer:
        'Weeks to months depending on complexity. We phase delivery so you see working pieces early, and we agree milestones in writing before coding starts.',
    },
    {
      id: 'sys-data',
      question: 'Can you migrate our existing data?',
      answer:
        'Usually yes — spreadsheets, exports and legacy tools. We assess data quality in discovery and include migration in the plan when it is required.',
    },
    {
      id: 'sys-support',
      question: 'What happens after go-live?',
      answer:
        'Support, fixes and iterative improvements. Systems change as the business changes — we stay available so you are not stranded with orphan software.',
    },
  ],
}

export const productsIndexFaq = [
  {
    id: 'all-which',
    question: 'Which product should I start with?',
    answer:
      'Need something online this week? Start with Sleek Pages. Need many pages or a shop? Websites. Need customers paying on their phones? Mobile Apps. Need to run the back office? Business Systems. Prefer browsing by job — inventory, MoMo invoicing, LMS, POS — use Browse by need on this page. Looking for a layout for your industry? Filter by business type on Websites or Sleek Pages.',
  },
  {
    id: 'all-layout-fit',
    question: 'How do I find a layout for my kind of business?',
    answer:
      'Open Websites (or Sleek Pages when published) and filter by business type or layout fit — restaurants, clinics, real estate, catalog, booking, and more. Search works too. If nothing matches yet, start a project and we will point you to the closest fit.',
  },
  {
    id: 'all-systems-depth',
    question: 'Do you only build websites, or full systems too?',
    answer:
      'Both. Beyond websites we build inventory, CRM, HR, POS, invoicing with Mobile Money, subscriptions, marketplaces, LMS, forums, listing boards, dashboards, ticketing, approvals and specialized verticals like restaurants, events and clinics — scoped to the workflow you actually run.',
  },
  {
    id: 'all-bundle',
    question: 'Can you combine a website and an app?',
    answer:
      'Yes. Many clients launch a site first, then add an app or internal system. We plan the sequence so you do not pay twice for the same work.',
  },
  {
    id: 'all-price',
    question: 'Where do I see prices?',
    answer:
      'Published website packages are on the pricing page. Apps and systems are quoted after a short discovery so the number matches the real scope.',
  },
  {
    id: 'all-start',
    question: 'How do I start?',
    answer:
      'Use Start a project on any page. We reply within one working day with questions or a call invite — no pressure pitch.',
  },
]
