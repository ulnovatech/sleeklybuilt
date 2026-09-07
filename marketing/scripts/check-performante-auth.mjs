/**
 * Static checks for Chunk 12 — Clerk-protected /performante.
 * Usage: node marketing/scripts/check-performante-auth.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const marketingRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(marketingRoot, '..')
let failed = 0

function assert(cond, label) {
  if (cond) console.log(`OK  ${label}`)
  else {
    console.error(`FAIL ${label}`)
    failed++
  }
}

function read(rel, base = marketingRoot) {
  const path = join(base, rel)
  assert(existsSync(path), `exists ${rel}`)
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

const app = read('src/App.jsx')
assert(app.includes("lazy(() => import('./pages/PerformantePage'))"), 'PerformantePage is lazy-loaded')
assert(app.includes('path="/performante"'), 'performante route registered')
assert(app.includes('PerformanteShortcut'), 'Alt+P shortcut mounted')

const page = read('src/pages/PerformantePage.jsx')
assert(page.includes('ClerkProvider'), 'page wraps ClerkProvider when configured')
assert(page.includes('PerformanteGate'), 'page mounts auth gate')
assert(page.includes('isPerformanteClerkConfigured'), 'fails closed without Clerk key')
assert(!page.includes('performanteDestinations'), 'page entry does not import destinations list')

const gate = read('src/components/performante/PerformanteGate.jsx')
assert(gate.includes('SignIn'), 'unsigned sees SignIn')
assert(gate.includes('isPerformanteOperator'), 'allowlist gate')
assert(gate.includes("lazy(() => import('./PerformanteDestinations'))"), 'destinations lazy after allowlist')
assert(gate.includes('noindex') || gate.includes('usePageSeo'), 'SEO noindex on bridge')
assert(!gate.includes('performanteDestinations'), 'gate does not import destinations list')

const dest = read('src/components/performante/PerformanteDestinations.jsx')
assert(dest.includes('performanteDestinations'), 'destinations module owns the list')
assert(dest.includes('Operator destinations'), 'destination nav labelled')

const allow = read('src/lib/performanteAllowlist.js')
assert(allow.includes('VITE_CLERK_ADMIN_USER_ID'), 'allowlist reads admin user id')
assert(allow.includes('fail closed') || allow.includes('return false'), 'allowlist fails closed')

const shortcut = read('src/components/performante/PerformanteShortcut.jsx')
assert(shortcut.includes("event.key.toLowerCase() !== 'p'"), 'shortcut listens for P')
assert(shortcut.includes('altKey'), 'shortcut requires Alt')

const search = read('src/config/searchIndex.js')
assert(!search.includes('performante'), 'performante not in search index')

const sitemap = read('public/sitemap.xml')
assert(!sitemap.includes('/performante'), 'performante not in sitemap')

const robots = read('public/robots.txt')
assert(robots.includes('Disallow: /performante'), 'robots disallows performante')

const analytics = read('src/lib/analytics.js')
assert(analytics.includes("startsWith('/performante')"), 'analytics skips performante')

const pkg = read('package.json')
assert(pkg.includes('@clerk/clerk-react'), 'marketing depends on clerk-react')

const envEx = read('.env.example')
assert(envEx.includes('VITE_CLERK_PUBLISHABLE_KEY'), 'env example documents Clerk key')
assert(envEx.includes('VITE_CLERK_ADMIN_USER_ID'), 'env example documents allowlist')

const authDoc = read('docs/AUTH_SSO.md', repoRoot)
assert(authDoc.includes('/performante'), 'AUTH_SSO documents performante')

process.exit(failed > 0 ? 1 : 0)
