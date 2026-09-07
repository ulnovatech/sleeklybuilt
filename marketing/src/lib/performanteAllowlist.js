/**
 * Performante operator allowlist (Vite-baked).
 * Mirrors Discovery/PHP: fail closed; if both id and email lists are set, require both.
 */

function splitList(raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function performanteAdminUserIds() {
  return splitList(
    import.meta.env.VITE_CLERK_ADMIN_USER_ID || import.meta.env.VITE_CLERK_ADMIN_USER_IDS,
  )
}

export function performanteAdminEmails() {
  return splitList(
    import.meta.env.VITE_CLERK_ADMIN_EMAIL || import.meta.env.VITE_CLERK_ADMIN_EMAILS,
  ).map((e) => e.toLowerCase())
}

export function isPerformanteClerkConfigured() {
  return Boolean(String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim())
}

export function isPerformanteAllowlistConfigured() {
  return performanteAdminUserIds().length > 0 || performanteAdminEmails().length > 0
}

/**
 * @param {{ id?: string, primaryEmailAddress?: { emailAddress?: string } | null }} user
 */
export function isPerformanteOperator(user) {
  if (!user?.id) return false
  const ids = performanteAdminUserIds()
  const emails = performanteAdminEmails()
  if (ids.length === 0 && emails.length === 0) return false

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || ''

  if (ids.length > 0 && emails.length > 0) {
    return ids.includes(user.id) && emails.includes(email)
  }
  if (ids.length > 0) return ids.includes(user.id)
  return emails.includes(email)
}
