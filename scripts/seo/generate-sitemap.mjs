#!/usr/bin/env node
/**
 * Generate marketing/public/sitemap.xml and robots.txt from the SEO route registry
 * plus published sleekly-blog posts.
 *
 *   SITE_URL=https://sleeklybuilt.pro node scripts/seo/generate-sitemap.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE_URL_DEFAULT,
  marketingRoutes,
  staticPublicPaths,
  robotsDisallow,
} from './routes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const PUBLIC_DIR = path.join(ROOT, 'marketing', 'public')
const POSTS_DIR = path.join(ROOT, 'sleekly-blog', 'content', 'posts')

const FORBIDDEN_HOST_RE = /nip\.io|34\.66\.94\.12|localhost|127\.0\.0\.1/i
const RESERVED_BLOG_SLUGS = new Set([
  'about',
  'contact',
  'search',
  'tags',
  'optimizer',
  'blog',
  'admin',
  'dashboard',
  'manage-posts',
])

function siteUrl() {
  const raw = (process.env.SITE_URL || process.env.VITE_SITE_URL || SITE_URL_DEFAULT).trim()
  return raw.replace(/\/$/, '')
}

function assertSafeSiteUrl(base) {
  if (!/^https:\/\//i.test(base)) {
    throw new Error(`SITE_URL must be https:// (got: ${base})`)
  }
  if (FORBIDDEN_HOST_RE.test(base)) {
    throw new Error(`SITE_URL must not use interim/dev hosts (got: ${base})`)
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function locFor(base, routePath) {
  if (routePath === '/') return `${base}/`
  return `${base}${routePath.startsWith('/') ? routePath : `/${routePath}`}`
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return {}
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return {}
  const block = raw.slice(3, end).trim()
  /** @type {Record<string, string | boolean>} */
  const data = {}
  for (const line of block.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (v === 'true') data[m[1]] = true
    else if (v === 'false') data[m[1]] = false
    else data[m[1]] = v
  }
  return data
}

function readBlogPosts() {
  if (!fs.existsSync(POSTS_DIR)) return []
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))
  const posts = []
  for (const file of files) {
    const full = path.join(POSTS_DIR, file)
    const raw = fs.readFileSync(full, 'utf8')
    const fm = parseFrontmatter(raw)
    if (fm.draft === true || fm.published === false) continue
    const slug =
      (typeof fm.slug === 'string' && fm.slug) ||
      file.replace(/\.md$/i, '')
    const normalized = String(slug).trim().replace(/^\/+|\/+$/g, '')
    if (!normalized || RESERVED_BLOG_SLUGS.has(normalized.toLowerCase())) {
      console.warn(`SEO generate: skipping reserved/empty blog slug (${file})`)
      continue
    }
    const lastmod =
      typeof fm.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fm.date)
        ? fm.date.slice(0, 10)
        : null
    posts.push({
      path: `/blog/${normalized}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod,
    })
  }
  posts.sort((a, b) => a.path.localeCompare(b.path))
  return posts
}

function urlEntry({ loc, changefreq, priority, lastmod }) {
  const lines = ['  <url>', `    <loc>${escapeXml(loc)}</loc>`]
  if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
  if (changefreq) lines.push(`    <changefreq>${escapeXml(changefreq)}</changefreq>`)
  if (priority != null) lines.push(`    <priority>${Number(priority).toFixed(1)}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

function buildSitemap(base) {
  const entries = []
  for (const route of marketingRoutes) {
    entries.push({
      loc: locFor(base, route.path),
      changefreq: route.changefreq,
      priority: route.priority,
    })
  }
  for (const route of staticPublicPaths) {
    entries.push({
      loc: locFor(base, route.path),
      changefreq: route.changefreq,
      priority: route.priority,
    })
  }
  for (const post of readBlogPosts()) {
    entries.push({
      loc: locFor(base, post.path),
      changefreq: post.changefreq,
      priority: post.priority,
      lastmod: post.lastmod,
    })
  }

  const body = entries.map(urlEntry).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
}

function buildRobots(base) {
  const lines = ['User-agent: *', 'Allow: /', '']
  for (const rule of robotsDisallow) {
    lines.push(`Disallow: ${rule}`)
  }
  lines.push('')
  lines.push(`Sitemap: ${base}/sitemap.xml`)
  lines.push('')
  return lines.join('\n')
}

function assertGeneratedSafe(content, label) {
  if (FORBIDDEN_HOST_RE.test(content)) {
    throw new Error(`${label} contains forbidden interim host`)
  }
  if (/http:\/\/sleeklybuilt\.pro/i.test(content)) {
    throw new Error(`${label} must use https://sleeklybuilt.pro, not http://`)
  }
}

function main() {
  const base = siteUrl()
  assertSafeSiteUrl(base)

  fs.mkdirSync(PUBLIC_DIR, { recursive: true })

  const sitemap = buildSitemap(base)
  const robots = buildRobots(base)
  assertGeneratedSafe(sitemap, 'sitemap.xml')
  assertGeneratedSafe(robots, 'robots.txt')

  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml')
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt')
  fs.writeFileSync(sitemapPath, sitemap, 'utf8')
  fs.writeFileSync(robotsPath, robots, 'utf8')

  const urlCount = (sitemap.match(/<loc>/g) || []).length
  console.log(`SEO generate OK → ${urlCount} URLs @ ${base}`)
  console.log(`  wrote ${path.relative(ROOT, sitemapPath)}`)
  console.log(`  wrote ${path.relative(ROOT, robotsPath)}`)
}

main()
