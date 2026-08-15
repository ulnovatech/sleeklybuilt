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
assert(parts.includes("missing_api_key"), 'missing_api_key handled in UI')

const header = read('src/components/attendant/AttendantHeader.jsx')
assert(header.includes('whatsapp') || header.includes('WhatsApp'), 'header has WhatsApp')
assert(header.includes('tel:'), 'header has call')

const provider = read('src/components/attendant/AttendantProvider.jsx')
assert(provider.includes('confirmation_required'), 'provider handles confirmation_required')
assert(provider.includes('message_delta'), 'provider handles streaming deltas')
assert(provider.includes('status: \'streaming\''), 'streaming status until complete')

const layout = read('src/components/layout/Layout.jsx')
assert(layout.includes('AttendantRoot'), 'Layout mounts AttendantRoot')
assert(!layout.includes('FloatingContact'), 'FloatingContact removed from Layout')

const launcher = read('src/components/attendant/AttendantLauncher.jsx')
assert(launcher.includes('h-12 w-12') || launcher.includes('h-12') && launcher.includes('w-12'), 'launcher 48×48')
assert(launcher.includes('bg-accent'), 'launcher uses gold accent')

process.exit(failed > 0 ? 1 : 0)
