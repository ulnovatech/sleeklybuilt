# Performante

Initiative: **SEO, visibility, crawlability, and professional presentation** for SleeklyBuilt — automated where possible so human error does not drop us from search.

**Canonical public host (post-cutover):** `https://sleeklybuilt.pro`  
**Discovery (separate index surface):** `https://discovery.sleeklybuilt.pro` (usually noindex or soft-gated until product launch)  
**Origin:** Linode · Cloudflare Flexible SSL  

Related polish (parked, not Phase 0): portfolio **desktop + mobile dual thumbnails** (device chrome frames = optional later).

---

## 0. Current state (honest baseline)

| Area | Today | Gap |
|------|--------|-----|
| Domain in meta/sitemap/robots | Still `http://hub.34.66.94.12.nip.io` | Must be `https://sleeklybuilt.pro` |
| Sitemap | Hand-edited 7 URLs in `marketing/public/sitemap.xml` | Incomplete; not regenerated on build/deploy |
| robots.txt | Exists; Sitemap: points at nip.io | Fix URL; review Disallow |
| Per-route meta | Homepage static tags; SPA mostly changes **title** only | Description / OG / canonical stale on every other route |
| Structured data | None | No Organization / WebSite / BlogPosting JSON-LD |
| GSC / Bing | Not wired | No property, no sitemap submit, no verification |
| Analytics | No marketing gtag | Blind on traffic & queries |
| Blog posts in sitemap | Missing | Content not discovered systematically |
| SPA crawlability | CSR only | Thin HTML shell for weak crawlers |
| Portfolio professionalism | Single crop cards | Dual desktop/mobile previews (Performante-adjacent) |

---

## 1. North-star outcomes

1. **Google shows the right blue link + snippet** for brand and service queries (title + meta description we control).
2. **Every public URL** is listed in a fresh sitemap within minutes of deploy.
3. **Crawl budget** is spent on public pages; dash/API stay out.
4. **Share previews** (WhatsApp, X, LinkedIn) show brand image + correct title — not nip.io leftovers.
5. **Humans don’t remember** to update sitemap/meta — CI and watchers do.
6. **Search Console** is the ops cockpit: coverage, CWV, enhancements, spam.

---

## 2. Workstreams

### A — Identity & SERP copy (“the blue brief”)

**Goal:** One source of truth for how Google *should* describe us.

| Deliverable | Detail |
|-------------|--------|
| `site.config` SEO block | `siteUrl`, default title pattern, default description (≤155 chars), OG image absolute HTTPS URL |
| Per-route SEO map | Path → `{ title, description, ogImage? }` for marketing routes |
| Blog SEO | Post frontmatter → title, description, og:image, canonical |
| Snippet QA checklist | Brand query, “web design Kampala/Uganda”, product pages — titles unique, no truncation traps |

**Professional wording principles**
- Lead with **what you do + where** (Uganda / Kampala) when local intent matters.
- Prefer concrete nouns (websites, apps, business systems) over fluff (“solutions”, “innovative”).
- One promise per page; homepage ≠ prices ≠ about.
- Keep meta description ~140–155 characters; title ~50–60.

**Example homepage target (iterate in copy review)**  
- Title: `SleeklyBuilt — Custom Websites, Apps & Systems | Uganda`  
- Description: `Custom websites, mobile apps, and business systems for companies in Uganda and beyond. Clear pricing, live portfolio, and builds you can click through.`

---

### B — Crawl surface: robots + continuous sitemap

**Goal:** Automated sitemap + watcher; never hand-edit production XML again.

| Component | Behavior |
|-----------|----------|
| **Generator** `scripts/seo/generate-sitemap.mjs` | Reads route registry + blog post index + optional portfolio public URLs; writes `marketing/public/sitemap.xml` (and/or `sitemap-index.xml`) |
| **Build hook** | `prebuild` / `build:linux` runs generator with `SITE_URL=https://sleeklybuilt.pro` |
| **Deploy hook** | After rsync, optional regenerate on VM if blog content can change without full frontend rebuild |
| **Watcher** (dev + optional CI) | File watch on `marketing/src/pages`, `sleekly-blog/content/posts`, route config → regenerate on change |
| **robots.txt** | Generated or templated: `Sitemap: https://sleeklybuilt.pro/sitemap.xml`; keep Disallow `/dash/`, `/sleekly-dash/`, `/api/`; consider Disallow discovery until public launch |
| **lastmod** | From git mtime or content frontmatter dates |

**URL classes to include**
- Marketing: `/`, `/about`, `/prices`, `/contact`, `/products`, `/websites`, `/mobile-apps`, `/business-systems`, `/sleek-pages`, `/policies`, policy slugs, `/track-order` (if indexable)
- Blog: `/blog/`, each post slug, category/tag only if thin pages aren’t junk
- Portfolio: `/portfolio-app/` (+ public template deep links only if they return 200 and are meant to rank)

**URL classes to exclude**
- `/dash/**`, APIs, attendant internals, thank-you / private track tokens
- `/performante` — private operator bridge (**Alt+P** / **Alt+Shift+P**); Clerk allowlist required; destinations lazy-loaded only after auth; `noindex` + robots Disallow; never sitemap

---

### C — On-page technical SEO (marketing / blog / portfolio)

| Item | Approach |
|------|----------|
| Canonical | Per-route absolute `https://sleeklybuilt.pro{path}`; www → apex (Cloudflare redirect) |
| Meta + OG + Twitter | Update on client route change **and** bake critical tags into build where possible |
| JSON-LD | `Organization` + `WebSite` (+ `SearchAction` if site search exists); blog `BlogPosting`; optional `LocalBusiness` for Kampala |
| hreflang | Skip until multi-language |
| Favicon / apple-touch / theme-color | Professional chrome in SERP/bookmarks |
| 404 | Soft 404 hygiene — real 404 status via nginx where feasible for unknown static paths |
| www vs apex | Cloudflare rule: 301 `www` → apex (or reverse — pick one; env uses apex) |

**SPA reality check**  
Pure CSR is a ceiling. Phase 2 options (pick one later):
1. Prerender critical marketing routes at build (`vite-plugin-prerender` / equivalent)
2. Edge HTML shells for top 10 URLs
3. Full SSR only if ROI justifies

Phase 0–1 assume Googlebot executes JS; still fix shell meta for first paint / non-JS bots.

---

### D — Google Search Console & Bing (ops cockpit)

| Step | Owner | Notes |
|------|--------|------|
| Verify `sleeklybuilt.pro` in GSC | Human (DNS TXT or HTML meta — we automate meta injection once token provided) | Prefer DNS TXT at Cloudflare |
| Submit sitemap | Human once; then CI can ping | `https://sleeklybuilt.pro/sitemap.xml` |
| Domain property | Prefer domain property covering `www` + apex | |
| Bing Webmaster | Mirror verification + sitemap | Optional but cheap |
| Monitor weekly | Coverage, “Crawled – currently not indexed”, CWV, Security | Alert on sudden drop |

**Automated helpers**
- CI step: `curl -f https://sleeklybuilt.pro/sitemap.xml` + XML validate
- Optional Indexing API / sitemap ping after deploy (rate-limited; don’t spam)
- Script: dump GSC search analytics (API) → weekly summary (later)

---

### E — Analytics & measurement

| Tool | Purpose |
|------|---------|
| GA4 (or Plausible/Umami if privacy-first) | Traffic, landing pages, conversions (contact submit) |
| GSC linked to GA4 | Query ↔ page |
| Cloudflare Web Analytics (optional free) | Edge RUM without cookies |
| Conversion events | `contact_submit`, `portfolio_open`, `whatsapp_click` |

Keep analytics **out of** `/dash` and Discovery until intentional.

---

### F — Performance & Core Web Vitals (professional feel)

| Lever | Action |
|-------|--------|
| Fonts | Keep `display=swap`; subset if possible; self-host if CLS/LCP issues |
| Images | WebP/AVIF, explicit width/height, lazy below fold; OG image optimized (~1200×630) |
| JS weight | Route-level code split already in Vite — audit marketing bundle; defer non-critical |
| Lighthouse CI | Run on PR against built `public_html` (mobile) — fail on regressing LCP/CLS thresholds |
| Caching | Cloudflare cache static assets; correct `Cache-Control` on hashed assets |
| Third parties | One analytics snippet; no tag soup |

---

### G — Professionalism & trust (visibility-adjacent)

| Item | Notes |
|------|--------|
| Dual desktop/mobile portfolio thumbs | High-ROI trust (from competitor scan); frames = optional later |
| HTTPS everywhere in copy/links | No http:// leftovers in footer, emails, schema |
| `hello@` / `sales@` consistency | Once Email Routing live |
| Legal pages | Privacy / terms reachable + in footer + sitemap |
| Brand SERP | Knowledge-ish signals: consistent NAP, social sameAs in JSON-LD |

---

### H — Automation & anti-forgetfulness

```
content or routes change
        ↓
seo:generate (sitemap + robots template)
        ↓
build:linux → public_html
        ↓
deploy → live
        ↓
post-deploy smoke:
  - /robots.txt Sitemap: host check
  - /sitemap.xml 200 + https://sleeklybuilt.pro locs only
  - homepage canonical + og:url https
  - sample blog URL in sitemap if posts exist
        ↓
(optional) notify GSC / ping search engines
```

| Automation | Trigger |
|------------|---------|
| `npm run seo:generate` | prebuild + manual |
| `npm run seo:watch` | local content editing |
| `npm run seo:smoke` | post-deploy / CI |
| Deploy workflow gate | Fail if sitemap contains nip.io or `http://` |
| Route registry | Single file marketing routes must register SEO + sitemap entry (or fail CI) |

---

## 3. Phased roadmap

### Phase 0 — Cutover hygiene (do first; unblocks everything)

Status: **implemented in repo** (Chunk 1). Confirm live Cloudflare DNS + rebuild/deploy so `public_html` picks up new marketing assets.

1. Flip `site.config` / `VITE_SITE_URL` → `https://sleeklybuilt.pro` — done
2. Rewrite `marketing/index.html` canonical + OG + Twitter to HTTPS domain — done
3. Rewrite `robots.txt` + interim sitemap locs to HTTPS domain — done
4. Cloudflare: apex A records live; **301 www → apex**; SSL Flexible — operator
5. GSC domain verify + submit sitemap (human + our meta/DNS help) — operator (Phase 1)
6. Smoke: no `nip.io` in live `sitemap.xml` / homepage source — after next deploy

### Phase 1 — Performante core (automated crawl + SERP)

Status: **Chunk 2–5 in repo** — sitemap/robots generator + hub `usePageSeo` + Organization/WebSite JSON-LD + blog Helmet + env-gated GA4.

1. SEO route registry + meta descriptions per page — done (`marketing/src/seo/routes.js` + `usePageSeo`)
2. Sitemap generator + build hook + deploy smoke gate — done
3. robots generator/template — done
4. Organization + WebSite JSON-LD on hub — done (`JsonLdSite`)
5. Blog posts in sitemap + fuller Helmet — done (`sleekly-blog` canonical/OG/Article JSON-LD; slugs `/blog/{slug}`)
6. GA4 (or privacy analytics) + basic conversion events — done (env-gated `VITE_GA_MEASUREMENT_ID`; `generate_lead` + `whatsapp_click`)
7. Docs: `docs/PERFORMANTE.md` + short operator runbook for GSC — this file

### Phase 2 — Crawl depth & polish
1. Prerender top marketing routes (or equivalent)
2. Portfolio dual desktop/mobile thumbnails in gallery cards — **Chunk 6 in repo** (`main.png` + `main-mobile.png`; cards fall back to single image)
3. Lighthouse CI budgets
4. Bing Webmaster; optional Indexing API for new posts
5. Weekly GSC digest script

### Phase 3 — Moat
1. Programmatic blog/internal-link suggestions from catalog
2. Image SEO (alt discipline in CMS/portfolio import)
3. Local SEO pack (LocalBusiness, Google Business Profile if applicable)
4. Discovery public marketing pages only when product is ready to rank

---

## 4. Ownership matrix

| Role | Responsibility |
|------|----------------|
| **Agent / eng** | Generators, meta wiring, CI gates, deploy smoke, JSON-LD |
| **You** | GSC/Bing login, DNS TXT verify, Cloudflare NS (if not done), final SERP copy approval, GA4 property |
| **Content** | Blog frontmatter quality; no orphan posts |

---

## 5. Acceptance criteria (definition of done for Phase 1)

- [ ] Live `https://sleeklybuilt.pro/robots.txt` lists HTTPS sitemap
- [ ] Live sitemap contains only `https://sleeklybuilt.pro/...` URLs and includes all public marketing routes + published blog posts
- [ ] Deploy fails if nip.io / bare http locs appear
- [ ] Homepage and key routes have unique title + description; View Source / rich results test sane
- [ ] JSON-LD validates in Google Rich Results Test (Organization/WebSite)
- [ ] GSC property verified; sitemap submitted with “Success”
- [ ] Analytics receiving pageviews within 24h of ship
- [ ] `npm run seo:generate` is the only supported way to refresh sitemap

---

## 6. Explicit non-goals (for now)

- Ranking Discovery Intelligence publicly
- Buying backlinks / black-hat SEO
- Full SSR rewrite of the marketing SPA
- Fake device frames on portfolio (dual thumbs yes; chrome bezels later if desired)

---

## 7. Immediate next actions (when you say go)

1. Phase 0 domain string purge (config + index.html + robots + sitemap) — done
2. Scaffold `scripts/seo/generate-sitemap.mjs` + `seo:generate` / `seo:smoke` — done
3. You: finish Cloudflare NS + create GSC property; paste verification token if HTML method
4. Wire GA4 measurement ID into marketing (env-based) — code ready; set `VITE_GA_MEASUREMENT_ID` at build when you have a property

### GA4 operator notes

1. Create a GA4 property for `sleeklybuilt.pro`.
2. Copy the measurement ID (`G-XXXXXXXX`).
3. Set it **only at marketing build time** (Vite inlines `import.meta.env.VITE_*`):

```env
VITE_GA_MEASUREMENT_ID=G-ER55WHMLGZ
```

Configured in `marketing/.env.production` and GitHub secret `VITE_GA_MEASUREMENT_ID`. Rebuild marketing (`scripts/build-production.sh` / deploy) after any ID change — runtime PHP env files do not inject gtag.

Do **not** paste Google’s manual “Install manually” snippet into `index.html`; the hub already loads the same tag via `Analytics.jsx` when the env ID is present. SPA navigations send `page_view` with `page_path` + title so GA4 page summaries are not stuck on `/`. `/dash` is not tagged.

Dash **Analytics** (`/dash/analytics`) reads the GA4 Data API (`GA_PROPERTY_ID=552660541` + service account). That ID is the numeric property from Admin → Property details — not `G-ER55WHMLGZ` and not the stream ID.

Events when the ID is present: pageviews via `page_view`; `generate_lead` on contact + newsletter submit; `whatsapp_click` on `wa.me` / WhatsApp links.

---

### Chunk 4 notes (blog)

Published posts: Helmet sets absolute `https://sleeklybuilt.pro/blog/{slug}` canonical + `og:url` / `og:image` / `og:type=article` + Article JSON-LD. Search/tag/optimizer/admin/404 are `noindex`. Drafts (`draft: true`) stay out of the post index and sitemap. Reserved router slugs (`about`, `contact`, `blog`, …) are not emitted as posts.

---

*Performante = treat search visibility like uptime: monitored, generated, and hard to forget.*
