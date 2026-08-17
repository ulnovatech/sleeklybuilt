/**
 * Chunk 2B — static checks for attendant widget acceptance.
 * Usage: node marketing/scripts/check-attendant-widget.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let failed = 0

function assert(cond, label) {
  if (cond) {
    console.log(`OK  ${label}`)
  } else {
    console.error(`FAIL ${label}`)
    failed++
  }
}

function read(rel) {
  const path = join(root, rel)
  assert(existsSync(path), `exists ${rel}`)
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

const empty = read('src/components/attendant/emptyCopy.js')
assert(empty.includes("You're on Websites"), 'empty state names Websites page')
assert(empty.includes("You're on Prices"), 'empty state names Prices page')
assert(!empty.toLowerCase().includes('how can i help you today'), 'no generic how-can-i-help empty')

const parts = read('src/components/attendant/AttendantParts.jsx')
assert(parts.includes('WhatsApp'), 'error/confirm surface includes WhatsApp')
assert(parts.includes('Confirm before I send'), 'confirm UI copy present')
assert(parts.includes('AttendantChoices') || parts.includes('Pick an option') || parts.includes('Skip'), 'Decision UI choices surface present')
assert(parts.includes("missing_api_key"), 'missing_api_key handled in UI')

const header = read('src/components/attendant/AttendantHeader.jsx')
assert(header.includes('whatsapp') || header.includes('WhatsApp'), 'header has WhatsApp')
assert(header.includes('tel:'), 'header has call')

const provider = read('src/components/attendant/AttendantProvider.jsx')
assert(provider.includes('confirmation_required'), 'provider handles confirmation_required')
assert(provider.includes("event === 'choices'") || provider.includes('event === "choices"') || provider.includes("=== 'choices'"), 'provider handles choices SSE')
assert(provider.includes('pendingChoices') || provider.includes('setPendingChoices'), 'provider tracks pendingChoices')
assert(provider.includes('message_delta'), 'provider handles streaming deltas')
assert(provider.includes('status: \'streaming\''), 'streaming status until complete')

const api = read('src/components/attendant/api.js')
assert(api.includes('choice.php'), 'api posts to choice.php')
assert(api.includes('selectChoice'), 'selectChoice client helper')

const layout = read('src/components/layout/Layout.jsx')
assert(layout.includes('AttendantRoot'), 'Layout mounts AttendantRoot')
assert(!layout.includes('FloatingContact'), 'FloatingContact removed from Layout')

const confirmHonesty = read('src/components/attendant/AttendantProvider.jsx')
assert(confirmHonesty.includes('applyClientAction(result.client_action') || confirmHonesty.includes('result.client_action'), 'confirm applies client_action handoff')
assert(confirmHonesty.includes('secure checkout') || confirmHonesty.includes('not a payment'), 'confirm quote copy is not paid-in-chat')
assert(confirmHonesty.includes('escalation_status') || confirmHonesty.includes('pollMessages'), 'provider handles escalation / human poll')

const messagesApi = read('src/components/attendant/api.js')
assert(messagesApi.includes('messages.php'), 'api polls messages.php')
assert(messagesApi.includes('pollMessages'), 'pollMessages helper')

const partsEsc = read('src/components/attendant/AttendantParts.jsx')
assert(partsEsc.includes("role === 'human'") || partsEsc.includes('isHuman'), 'human role message UI')

const panelEsc = read('src/components/attendant/AttendantPanel.jsx')
assert(panelEsc.includes('Connecting you with the team') || panelEsc.includes('escalationState'), 'panel shows escalation connecting state')

const launcher = read('src/components/attendant/AttendantLauncher.jsx')
assert(launcher.includes('h-12 w-12') || launcher.includes('h-12') && launcher.includes('w-12'), 'launcher 48×48')
assert(launcher.includes('bg-accent'), 'launcher uses gold accent')

const clientActions = read('src/components/attendant/clientActions.js')
assert(clientActions.includes('section_id'), 'clientActions focuses section_id when hash null')
assert(clientActions.includes('data-attendant-section'), 'clientActions queries data-attendant-section')
assert(clientActions.includes('HIGHLIGHT_ATTEMPTS') || clientActions.includes('attempts'), 'highlight retries for async pages')

const pageContext = read('src/components/attendant/pageContext.js')
assert(pageContext.includes('DISPLAY_PACKAGE_IDS'), 'pageContext knows display packages')
assert(pageContext.includes('visible_product_id'), 'pageContext sets visible_product_id')

const prices = read('src/pages/PricesPage.jsx')
assert(prices.includes('data-attendant-section={pkg.id}'), 'PlanCard stamps package section')
assert(prices.includes('data-attendant-product'), 'package cards stamp product id')

const policyDetail = read('src/pages/PolicyDetailPage.jsx')
assert(policyDetail.includes('data-attendant-section'), 'policy detail stamps section')

const section = read('src/components/site/Section.jsx')
assert(section.includes('data-attendant-section'), 'Section dual-stamps id')

process.exit(failed > 0 ? 1 : 0)
