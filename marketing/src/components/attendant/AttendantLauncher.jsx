import { FiChevronUp } from 'react-icons/fi'
import { useAttendant } from './AttendantProvider'

export default function AttendantLauncher() {
  const { open, minimized, openPanel } = useAttendant()

  if (open && !minimized) return null

  const expand = Boolean(open && minimized)

  return (
    <button
      type="button"
      onClick={openPanel}
      className="fixed bottom-6 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-obsidian shadow-lg transition duration-fast ease-dos hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      aria-label={expand ? 'Expand attendant' : 'Open SleeklyBuilt attendant'}
    >
      {expand ? (
        <FiChevronUp className="h-6 w-6" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M5 7.5A2.5 2.5 0 017.5 5h9A2.5 2.5 0 0119 7.5v6A2.5 2.5 0 0116.5 16H12l-3.5 3v-3H7.5A2.5 2.5 0 015 13.5v-6z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M9 10h.01M12 10h.01M15 10h.01"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}
