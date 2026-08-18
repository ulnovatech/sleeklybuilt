import { FiChevronDown, FiPhone } from 'react-icons/fi'
import { useSiteConfig } from '../../context/SiteContactContext'

export default function AttendantHeader({ onMinimize }) {
  const siteConfig = useSiteConfig()

  const iconBtn =
    'inline-flex h-11 w-11 items-center justify-center rounded-full text-cream/90 transition hover:bg-obsidian-line hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-dos'

  return (
    <header className="flex items-center gap-2 border-b border-obsidian-line bg-obsidian px-3 py-2.5 text-cream">
      <div className="min-w-0 flex-1">
        <h2 id="attendant-dialog-title" className="truncate text-sm font-semibold tracking-tight">
          SleeklyBuilt
        </h2>
        <p className="truncate text-xs text-cream/70">Attendant</p>
      </div>
      <a
        href={siteConfig.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.548 4.09 1.507 5.81L0 24l6.438-1.688A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.77 9.77 0 01-4.988-1.364l-.357-.212-3.82 1 1.018-3.72-.233-.375A9.77 9.77 0 012.18 12C2.18 6.57 6.57 2.18 12 2.18S21.82 6.57 21.82 12 17.43 21.82 12 21.82z" />
        </svg>
      </a>
      <a href={`tel:${siteConfig.primaryPhone}`} className={iconBtn} aria-label="Call us">
        <FiPhone className="h-5 w-5" aria-hidden="true" />
      </a>
      <button type="button" onClick={onMinimize} className={iconBtn} aria-label="Minimize attendant">
        <FiChevronDown className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  )
}
