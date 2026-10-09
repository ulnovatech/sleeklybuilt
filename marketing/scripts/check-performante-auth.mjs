/**
 * Static checks for /performante — email+password operator bridge (Clerk retired).
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
assert(page.includes('PerformanteGate'), 'page mounts auth gate')
assert(!page.includes('ClerkProvider'), 'page does not use ClerkProvider')
assert(!page.includes('performanteDestinations'), 'page entry does not import destinations list')

const gate = read('src/components/performante/PerformanteGate.jsx')
assert(gate.includes('performanteLogin'), 'gate uses password login API')
assert(gate.includes('performanteMe'), 'gate checks session via /auth/me')
assert(gate.includes('type="password"') || gate.includes("type='password'"), 'unsigned sees password field')
assert(gate.includes('Sign in'), 'unsigned sees Sign in')
assert(gate.includes("lazy(() => import('./PerformanteDestinations'))"), 'destinations lazy after auth')
assert(gate.includes('noindex') || gate.includes('usePageSeo'), 'SEO noindex on bridge')
assert(!gate.includes('performanteDestinations'), 'gate does not import destinations list')
assert(!gate.includes('ClerkProvider') && !gate.includes('@clerk'), 'gate does not use Clerk')

const authLib = read('src/lib/performanteAuth.js')
assert(authLib.includes('/auth/login'), 'auth lib posts to /auth/login')
assert(authLib.includes('/auth/me'), 'auth lib reads /auth/me')
assert(authLib.includes('credentials'), 'auth lib sends cookies')

const dest = read('src/components/performante/PerformanteDestinations.jsx')
assert(dest.includes('performanteDestinations'), 'destinations module owns the list')
assert(dest.includes('Operator destinations'), 'destination nav labelled')
assert(dest.includes('content-loom') || dest.includes('Content Loom'), 'destinations include Content Loom')

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

const authDoc = read('docs/AUTH_SSO.md', repoRoot)
assert(authDoc.includes('/performante'), 'AUTH_SSO documents performante')
assert(
  authDoc.includes('email + password') || authDoc.includes('Password'),
  'AUTH_SSO documents password auth',
)
assert(authDoc.includes('Content Loom') || authDoc.includes('loom.sleeklybuilt'), 'AUTH_SSO mentions Content Loom')

process.exit(failed > 0 ? 1 : 0)
