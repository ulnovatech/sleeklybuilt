/**
 * Static checks for attendant widget acceptance.
 * Usage: node marketing/scripts/check-attendant-widget.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const marketingRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(marketingRoot, '..')
const pkgRoot = join(repoRoot, 'packages', 'attendant')
let failed = 0

function assert(cond, label) {
  if (cond) {
    console.log(`OK  ${label}`)
  } else {
    console.error(`FAIL ${label}`)
    failed++
  }
}

function read(absOrRel, base = marketingRoot) {
  const path = absOrRel.includes(':') || absOrRel.startsWith('/') || absOrRel.startsWith('\\\\')
    ? absOrRel
    : join(base, absOrRel)
  // Prefer absolute package paths via pkg()
  const resolved = path
  assert(existsSync(resolved), `exists ${resolved.replace(repoRoot, '').replace(/\\/g, '/')}`)
  return existsSync(resolved) ? readFileSync(resolved, 'utf8') : ''
}

function pkg(rel) {
  return join(pkgRoot, rel)
}

const empty = read(pkg('src/emptyCopy.js'))
assert(empty.includes("You're on Websites"), 'empty state names Websites page')
assert(empty.includes("You're on Prices"), 'empty state names Prices page')
assert(!empty.toLowerCase().includes('how can i help you today'), 'no generic how-can-i-help empty')

const parts = read(pkg('src/AttendantParts.jsx'))
assert(parts.includes('WhatsApp'), 'error/confirm surface includes WhatsApp')
assert(parts.includes('Confirm before I send'), 'confirm UI copy present')
assert(parts.includes('AttendantChoices') || parts.includes('Pick an option') || parts.includes('Skip'), 'Decision UI choices surface present')
assert(parts.includes("missing_api_key"), 'missing_api_key handled in UI')

const header = read(pkg('src/AttendantHeader.jsx'))
assert(header.includes('whatsapp') || header.includes('WhatsApp'), 'header has WhatsApp')
assert(header.includes('tel:'), 'header has call')
assert(header.includes('Minimize attendant'), 'header minimizes instead of close')
assert(header.includes('ChevronDown') || header.includes('FiChevronDown'), 'header uses chevron down')
assert(!header.includes('FiX'), 'header has no close X')

const provider = read(pkg('src/AttendantProvider.jsx'))
assert(provider.includes('confirmation_required'), 'provider handles confirmation_required')
assert(provider.includes("event === 'choices'") || provider.includes('event === "choices"') || provider.includes("=== 'choices'"), 'provider handles choices SSE')
assert(provider.includes('pendingChoices') || provider.includes('setPendingChoices'), 'provider tracks pendingChoices')
assert(provider.includes('message_delta'), 'provider handles streaming deltas')
assert(provider.includes("status: 'streaming'"), 'streaming status until complete')
assert(provider.includes('minimizePanel'), 'provider exposes minimizePanel')
assert(provider.includes('minimized'), 'provider tracks minimized')
assert(provider.includes('site'), 'provider accepts site contact config')

const api = read(pkg('src/api.js'))
assert(api.includes('choice.php'), 'api posts to choice.php')
assert(api.includes('selectChoice'), 'selectChoice client helper')

const layout = read('src/components/layout/Layout.jsx')
assert(layout.includes('AttendantRoot'), 'Layout mounts AttendantRoot')
assert(layout.includes('AttendantProvider'), 'Layout wraps AttendantProvider for dock reflow')
assert(layout.includes('@sleeklybuilt/attendant'), 'Layout imports shared attendant package')
assert(layout.includes('lg:pr-[380px]') || layout.includes('pr-[380px]'), 'Layout reserves dock width on large screens')
assert(!layout.includes('FloatingContact'), 'FloatingContact removed from Layout')

const confirmHonesty = read(pkg('src/AttendantProvider.jsx'))
assert(confirmHonesty.includes('applyClientAction(result.client_action') || confirmHonesty.includes('result.client_action'), 'confirm applies client_action handoff')
assert(confirmHonesty.includes('secure checkout') || confirmHonesty.includes('not a payment'), 'confirm quote copy is not paid-in-chat')
assert(confirmHonesty.includes('escalation_status') || confirmHonesty.includes('pollMessages'), 'provider handles escalation / human poll')

const messagesApi = read(pkg('src/api.js'))
assert(messagesApi.includes('messages.php'), 'api polls messages.php')
assert(messagesApi.includes('pollMessages'), 'pollMessages helper')

const partsEsc = read(pkg('src/AttendantParts.jsx'))
assert(partsEsc.includes("role === 'human'") || partsEsc.includes('isHuman'), 'human role message UI')

const panelEsc = read(pkg('src/AttendantPanel.jsx'))
assert(panelEsc.includes('Connecting you with the team') || panelEsc.includes('escalationState'), 'panel shows escalation connecting state')
assert(panelEsc.includes('lg:w-[380px]') || panelEsc.includes('w-[380px]'), 'panel docks at 380px on large screens')
assert(panelEsc.includes('minimizePanel'), 'panel backdrop/escape minimizes')

const launcher = read(pkg('src/AttendantLauncher.jsx'))
assert(launcher.includes('h-12 w-12') || (launcher.includes('h-12') && launcher.includes('w-12')), 'launcher 48×48')
assert(launcher.includes('bg-accent'), 'launcher uses gold accent')
assert(launcher.includes('Expand attendant'), 'minimized launcher expands')
assert(!launcher.includes('ChevronUp') && !launcher.includes('FiChevronUp'), 'minimized launcher is not chevron-up')
assert(launcher.includes('MessageIcon') || launcher.includes('M5 7.5'), 'launcher always uses message icon')

const clientActions = read(pkg('src/clientActions.js'))
assert(clientActions.includes('section_id'), 'clientActions focuses section_id when hash null')
assert(clientActions.includes('data-attendant-section'), 'clientActions queries data-attendant-section')
assert(clientActions.includes('HIGHLIGHT_ATTEMPTS') || clientActions.includes('attempts'), 'highlight retries for async pages')

const pageContext = read(pkg('src/pageContext.js'))
assert(pageContext.includes('DISPLAY_PACKAGE_IDS'), 'pageContext knows display packages')
assert(pageContext.includes('visible_product_id'), 'pageContext sets visible_product_id')
assert(pageContext.includes("host === 'portfolio'") || pageContext.includes('portfolio-order'), 'pageContext maps portfolio')
assert(pageContext.includes("host === 'blog'") || pageContext.includes('blog-post'), 'pageContext maps blog')

assert(clientActions.includes("host === 'portfolio'") || clientActions.includes("host = 'marketing'"), 'clientActions is host-aware')
assert(clientActions.includes('toRouterPath'), 'clientActions strips SPA base for in-app navigate')

assert(provider.includes("host = 'marketing'") || provider.includes('host,'), 'provider accepts host')
assert(provider.includes('basePath'), 'provider accepts basePath')
assert(provider.includes('sb_attendant_session'), 'stable sessionStorage key')
assert(provider.includes('sb_attendant_conversation'), 'stable conversation key')

const prices = read('src/pages/PricesPage.jsx')
assert(prices.includes('data-attendant-section={pkg.id}'), 'PlanCard stamps package section')
assert(prices.includes('data-attendant-product'), 'package cards stamp product id')

const policyDetail = read('src/pages/PolicyDetailPage.jsx')
assert(policyDetail.includes('data-attendant-section'), 'policy detail stamps section')

const section = read('src/components/site/Section.jsx')
assert(section.includes('data-attendant-section'), 'Section dual-stamps id')

const pkgJson = read(pkg('package.json'))
assert(pkgJson.includes('@sleeklybuilt/attendant'), 'attendant package named')

const portfolioApp = read(join(repoRoot, 'portfolio/frontend/src/App.jsx'), repoRoot)
assert(portfolioApp.includes('@sleeklybuilt/attendant'), 'portfolio imports shared attendant')
assert(portfolioApp.includes('host="portfolio"'), 'portfolio sets host=portfolio')
assert(portfolioApp.includes('AttendantRoot'), 'portfolio mounts AttendantRoot')

const blogApp = read(join(repoRoot, 'sleekly-blog/src/App.jsx'), repoRoot)
assert(blogApp.includes('@sleeklybuilt/attendant'), 'blog imports shared attendant')
assert(blogApp.includes('host="blog"'), 'blog sets host=blog')
assert(blogApp.includes('AttendantRoot'), 'blog mounts AttendantRoot')

const pagesJson = read(join(repoRoot, 'php/attendant/knowledge/pages.json'), repoRoot)
assert(pagesJson.includes('"page_id": "blog"'), 'pages registry includes blog')
assert(pagesJson.includes('"page_id": "portfolio"'), 'pages registry includes portfolio')

process.exit(failed > 0 ? 1 : 0)
