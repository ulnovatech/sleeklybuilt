#!/usr/bin/env node
/**
 * Fail if sitemap/robots (built or live) advertise interim hosts or bare http apex.
 *
 *   node scripts/seo/smoke.mjs
 *   node scripts/seo/smoke.mjs --live https://sleeklybuilt.pro
 *   node scripts/seo/smoke.mjs --dir public_html
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

const FORBIDDEN_RE = /nip\.io|hub\.34\.66\.94\.12|34\.66\.94\.12|http:\/\/sleeklybuilt\.pro/i
const REQUIRED_SITEMAP_HOST = 'https://sleeklybuilt.pro'

function argValue(name) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return null
  return process.argv[idx + 1] || null
}

function checkText(label, text) {
  const errors = []
  if (!text || !String(text).trim()) {
    errors.push(`${label}: empty`)
    return errors
  }
  if (FORBIDDEN_RE.test(text)) {
    errors.push(`${label}: contains forbidden interim/http host`)
  }
  if (label.includes('sitemap')) {
    if (!text.includes(REQUIRED_SITEMAP_HOST)) {
      errors.push(`${label}: missing required host ${REQUIRED_SITEMAP_HOST}`)
    }
    const slugs = [...text.matchAll(/<loc>\s*https:\/\/sleeklybuilt\.pro\/blog\/([^<\s/]+)\s*<\/loc>/gi)]
      .map((m) => m[1].replace(/\/$/, ''))
      .filter((slug) => !['', 'contact', 'about', 'blog'].includes(slug.toLowerCase()))
    if (slugs.length < 1) {
      errors.push(`${label}: missing published /blog/{slug} post URLs`)
    }
    if (/https:\/\/sleeklybuilt\.pro\/blog\/blog\//i.test(text)) {
      errors.push(`${label}: post locs must be /blog/{slug}, not /blog/blog/{slug}`)
    }
  }
  if (label.includes('robots') && !/Sitemap:\s*https:\/\/sleeklybuilt\.pro\/sitemap\.xml/i.test(text)) {
    errors.push(`${label}: Sitemap line must point at https://sleeklybuilt.pro/sitemap.xml`)
  }
  return errors
}

function readLocalPair(dir) {
  const base = path.isAbsolute(dir) ? dir : path.join(ROOT, dir)
  return {
    sitemap: fs.readFileSync(path.join(base, 'sitemap.xml'), 'utf8'),
    robots: fs.readFileSync(path.join(base, 'robots.txt'), 'utf8'),
    label: path.relative(ROOT, base) || base,
  }
}

async function fetchPair(origin) {
  const root = origin.replace(/\/$/, '')
  const [sitemapRes, robotsRes] = await Promise.all([
    fetch(`${root}/sitemap.xml`),
    fetch(`${root}/robots.txt`),
  ])
  if (!sitemapRes.ok) throw new Error(`GET ${root}/sitemap.xml → ${sitemapRes.status}`)
  if (!robotsRes.ok) throw new Error(`GET ${root}/robots.txt → ${robotsRes.status}`)
  return {
    sitemap: await sitemapRes.text(),
    robots: await robotsRes.text(),
    label: root,
  }
}

async function main() {
  const live = argValue('live')
  const dir = argValue('dir') || 'marketing/public'
  const errors = []

  const local = readLocalPair(dir)
  errors.push(...checkText(`${local.label}/sitemap.xml`, local.sitemap))
  errors.push(...checkText(`${local.label}/robots.txt`, local.robots))

  if (live) {
    const remote = await fetchPair(live)
    errors.push(...checkText(`${remote.label}/sitemap.xml`, remote.sitemap))
    errors.push(...checkText(`${remote.label}/robots.txt`, remote.robots))
  }

  if (errors.length) {
    console.error('SEO smoke FAILED:')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`SEO smoke OK (${local.label}${live ? ` + ${live}` : ''})`)
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err))
  process.exit(1)
})
