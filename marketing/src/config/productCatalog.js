import { siteConfig } from '../site.config'

/**
 * Nested Products catalogue — capability map omitted from the thin four-line index.
 * One category visible at a time; items expand for detail (catalog narrowing + progressive disclosure).
 *
 * Source: SleeklyBuilt “other products” marketing brief (websites + systems depth).
 */

export const productCatalogCategories = [
  {
    id: 'websites',
    label: 'Websites',
    summary: 'Multi-page presence with structure you can grow.',
    href: siteConfig.links.websites,
    ctaLabel: 'Explore websites',
    items: [
      {
        id: 'web-multipage',
        title: 'Multiple pages',
        blurb: 'Home, about, services and contact — ordered for how buyers decide.',
        detail:
          'Information architecture that matches your offer, with mobile-first layouts and clear paths to WhatsApp or contact.',
      },
      {
        id: 'web-services',
        title: 'Services pages',
        blurb: 'Dedicated pages for each offer so search and sales conversations land cleanly.',
        detail:
          'Scope, proof and next steps on each service — not a single wall of text that buries what people came for.',
      },
      {
        id: 'web-gallery',
        title: 'Gallery',
        blurb: 'Show the work, the space or the product range without a PDF.',
        detail: 'Image-led sections with light, fast loads on real phones and networks.',
      },
      {
        id: 'web-blog',
        title: 'Blog & news',
        blurb: 'Publish updates without waiting on a developer for every paragraph.',
        detail: 'Optional editorial flow so marketing and ops can ship content on their own schedule.',
      },
      {
        id: 'web-cms',
        title: 'CMS',
        blurb: 'Edit pages safely after launch — with training and a clear handoff.',
        detail: 'Content you control; structure we protect. Ideal when the team needs to change copy weekly.',
      },
      {
        id: 'web-custom',
        title: 'More customisation',
        blurb: 'Membership, booking, ecommerce and other modules when a brochure site is not enough.',
        detail:
          'We add only what the business needs — membership gates, booking, shop — without bolting on unused complexity.',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Business operations',
    summary: 'Track stock, customers, people and sales in one place.',
    href: siteConfig.links.businessSystems,
    ctaLabel: 'Explore systems',
    items: [
      {
        id: 'ops-inventory',
        title: 'Inventory & stock',
        blurb: 'Tracking, low-stock alerts and supplier management.',
        detail:
          'Replace spreadsheet stock counts with live levels, reorder signals and supplier context your team trusts.',
      },
      {
        id: 'ops-crm',
        title: 'CRM',
        blurb: 'Lead tracking, client history and follow-up pipelines.',
        detail:
          'Know who is warm, what was promised and who owns the next step — without digging through WhatsApp threads.',
      },
      {
        id: 'ops-hr',
        title: 'HR & staff',
        blurb: 'Attendance, payroll basics, leave requests and shift scheduling.',
        detail: 'Staff-facing workflows that keep managers out of endless chat-based approvals.',
      },
      {
        id: 'ops-pos',
        title: 'POS (point of sale)',
        blurb: 'Retail and restaurant sales — often paired with inventory.',
        detail:
          'Counter or floor sales with stock movement attached, so the till and the storeroom stay honest.',
      },
    ],
  },
  {
    id: 'money',
    label: 'Money & transactions',
    summary: 'Invoices, Mobile Money, subscriptions and marketplaces.',
    href: siteConfig.links.businessSystems,
    ctaLabel: 'Talk payments',
    items: [
      {
        id: 'money-invoicing',
        title: 'Payments & invoicing',
        blurb: 'Auto-generate invoices, track paid/unpaid, integrate Mobile Money.',
        detail:
          'MTN MoMo and Airtel Money belong in the flow — a serious differentiator for how customers here already pay.',
      },
      {
        id: 'money-billing',
        title: 'Subscription & billing',
        blurb: 'Recurring charges with plan upgrades and downgrades.',
        detail: 'Clear plan states, failed-payment paths and admin controls so finance is not chasing screenshots.',
      },
      {
        id: 'money-marketplace',
        title: 'Marketplace platforms',
        blurb: 'Multi-vendor setups where sellers list on one platform.',
        detail:
          'More complex, flagship builds — vendor onboarding, listings, fees and settlement designed as one product.',
      },
    ],
  },
  {
    id: 'community',
    label: 'Content & community',
    summary: 'Learning, forums and listing platforms.',
    href: siteConfig.links.businessSystems,
    ctaLabel: 'Explore platforms',
    items: [
      {
        id: 'com-lms',
        title: 'LMS (learning)',
        blurb: 'Courses, quizzes and progress tracking for schools and training orgs.',
        detail: 'Learner journeys with visible progress — useful when training is part of the business model.',
      },
      {
        id: 'com-forum',
        title: 'Forum & community',
        blurb: 'Discussion boards and user-generated content with moderation tools.',
        detail: 'A place for members to talk without scattering the conversation across private chats.',
      },
      {
        id: 'com-listings',
        title: 'Job & listing boards',
        blurb: 'Post, apply and filter — niches like jobs, rentals or industry boards.',
        detail: 'Searchable listings with inquiry paths that turn browsers into conversations.',
      },
    ],
  },
  {
    id: 'workflow',
    label: 'Operations & workflow',
    summary: 'Dashboards, support, tasks and approvals for the team.',
    href: siteConfig.links.businessSystems,
    ctaLabel: 'Explore workflow tools',
    items: [
      {
        id: 'wf-dashboard',
        title: 'Internal dashboards',
        blurb: 'Data visualisation, reporting and staff-only tools.',
        detail:
          'Underrated and high demand — every business with data eventually wants a clear “what now?” view.',
      },
      {
        id: 'wf-ticketing',
        title: 'Ticketing & support',
        blurb: 'Customer complaints and issue tracking in one queue.',
        detail: 'Statuses, owners and history so issues do not vanish into inboxes.',
      },
      {
        id: 'wf-tasks',
        title: 'Project & task tools',
        blurb: 'Internal Trello-style boards for how your team actually ships work.',
        detail: 'Lightweight coordination without forcing a heavy enterprise suite.',
      },
      {
        id: 'wf-approvals',
        title: 'Approval workflows',
        blurb: 'Requests that need sign-off — procurement, leave, expenses.',
        detail: 'Clear request → review → decide loops with an audit trail your finance team can trust.',
      },
      {
        id: 'wf-automation',
        title: 'Automation & portals',
        blurb: 'Client portals, booking and custom software when off-the-shelf stops fitting.',
        detail:
          'We automate the painful handoffs and build portals only where they remove real friction.',
      },
    ],
  },
  {
    id: 'vertical',
    label: 'Specialized',
    summary: 'Industry-shaped products for specific markets.',
    href: siteConfig.links.businessSystems,
    ctaLabel: 'Discuss a vertical build',
    items: [
      {
        id: 'vert-estate',
        title: 'Real estate listings',
        blurb: 'Property search, filters and inquiries.',
        detail: 'Browse → filter → enquire flows tuned for agents and developers.',
      },
      {
        id: 'vert-restaurant',
        title: 'Restaurant & menu ordering',
        blurb: 'Digital menus with order and delivery flow.',
        detail: 'Customer-facing menus paired with kitchen or dispatch visibility.',
      },
      {
        id: 'vert-events',
        title: 'Event management',
        blurb: 'RSVPs, ticketing and check-in.',
        detail: 'From invite to door — registration lists your team can run live.',
      },
      {
        id: 'vert-health',
        title: 'Healthcare & clinic',
        blurb: 'Patient records and appointment scheduling — high value with careful data handling.',
        detail:
          'Sensitive by nature. We only take this on with proper privacy, access control and process discipline.',
      },
    ],
  },
]

/** Flat keyword map for Cmd+K — capability titles people type that never appear on the four product cards. */
export const productCatalogSearchEntries = productCatalogCategories.flatMap((category) =>
  category.items.map((item) => ({
    id: `cap-${item.id}`,
    label: item.title,
    description: `${category.label}: ${item.blurb}`,
    href: `${siteConfig.links.products}#guide-${category.id}`,
    keywords: [
      item.title.toLowerCase(),
      category.label.toLowerCase(),
      ...item.blurb.toLowerCase().split(/\W+/).filter((w) => w.length > 3).slice(0, 6),
    ],
  })),
)
