import { siteConfig } from '../site.config'

/**
 * Visitor gallery persuasion + custom-build copy.
 * Vocabulary: layout / live preview — never “template”.
 */

export const layoutPersuasionCopy = {
  eyebrow: 'Start from a layout',
  title: 'Launch a high-performing site without starting from scratch',
  body:
    'You do not need a blank build — and you do not need to keep something that looks unfinished. Pick a proven layout, then we brand it for your business.',
  ctaLabel: 'Browse by business',
  ctaHref: '#browse-layouts',
}

export const customBuildCopy = {
  eyebrow: 'No exact fit?',
  title: 'Tell us what you like — ours is to build it',
  body:
    'Share a reference, a screenshot, or a rough idea. We will shape a site around what already works for your customers — without forcing you into the wrong shelf.',
  ctaLabel: 'Describe what you want',
  ctaHref: `${siteConfig.links.contact}?intent=project`,
}

/** Quiet prompt when no business type / fit is selected yet. */
export const pickCategoryHint =
  'Choose a business type above to see the one thing that layout is built to win — then scroll the matches.'
