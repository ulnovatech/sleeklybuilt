#!/usr/bin/env node
/**
 * Watch blog posts + SEO routes and regenerate sitemap/robots.
 *   node scripts/seo/watch.mjs
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const POSTS_DIR = path.join(ROOT, 'sleekly-blog', 'content', 'posts')
const ROUTES_FILE = path.join(__dirname, 'routes.mjs')

let timer = null
let running = false
let queued = false

function runGenerate() {
  if (running) {
    queued = true
    return
  }
  running = true
  const child = spawn(process.execPath, [path.join(__dirname, 'generate-sitemap.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  })
  child.on('exit', (code) => {
    running = false
    if (queued) {
      queued = false
      runGenerate()
    } else if (code !== 0) {
      console.error(`seo:generate exited ${code}`)
    }
  })
}

function schedule() {
  clearTimeout(timer)
  timer = setTimeout(runGenerate, 300)
}

console.log('SEO watch — regenerating on posts/routes changes (Ctrl+C to stop)')
runGenerate()

if (fs.existsSync(POSTS_DIR)) {
  fs.watch(POSTS_DIR, { recursive: true }, schedule)
}
fs.watch(ROUTES_FILE, schedule)
