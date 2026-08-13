import { getCategoryStory } from '../../config/businessFit'
import { pickCategoryHint } from '../../config/galleryPersuasion'

/**
 * One statement of truth for the active business type or layout fit —
 * shown before the grid so visitors are captivated before they scroll cards.
 */
export default function CategoryStoryStrip({ businessTypeId, layoutFitId }) {
  const story = getCategoryStory({ businessTypeId, layoutFitId })

  if (!story) {
    return (
      <p className="mb-8 text-sm text-content-muted" id="category-story">
        {pickCategoryHint}
      </p>
    )
  }

  return (
    <aside
      id="category-story"
      aria-live="polite"
      className="mb-8 border-l-2 border-gold pl-5 md:pl-6"
    >
      <p className="text-meta font-semibold uppercase tracking-[0.08em] text-emerald">
        {story.label}
      </p>
      <h3 className="display-card mt-2 text-emerald-deep">{story.headline}</h3>
      <p className="mt-2 max-w-measure text-body text-ink-soft">{story.body}</p>
    </aside>
  )
}
