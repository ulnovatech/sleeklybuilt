#!/usr/bin/env node
/**
 * Capture viewport screenshots for selected template pages.
 * Usage: node capture.mjs --input=job.json --output=result.json
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

function argValue(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function pageUrl(baseUrl, relativePath) {
  const base = String(baseUrl || '').trim();
  const rel = String(relativePath || '').replace(/^\/+/, '');
  if (!base) {
    throw new Error('baseUrl is required');
  }
  if (base.startsWith('file:')) {
    const dir = base.endsWith('/') ? base : `${base}/`;
    return new URL(rel.split('/').map(encodeURIComponent).join('/'), dir).href;
  }
  const root = base.endsWith('/') ? base : `${base}/`;
  return new URL(rel.split('/').map(encodeURIComponent).join('/'), root).href;
}

async function main() {
  const inputPath = argValue('input');
  const outputPath = argValue('output');
  if (!inputPath || !outputPath) {
    throw new Error('Usage: node capture.mjs --input=job.json --output=result.json');
  }

  const job = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const siteRoot = job.siteRoot;
  const imagesDir = path.join(siteRoot, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const pages = Array.isArray(job.pages) ? job.pages : [];
  if (!pages.length) {
    throw new Error('No pages provided for screenshot capture');
  }

  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (job.executablePath) {
    launchOpts.executablePath = job.executablePath;
  }

  const browser = await puppeteer.launch(launchOpts);
  const captured = [];
  const skipped = [];
  let error = null;

  try {
    const page = await browser.newPage();
    const width = Number(job.viewport?.width) || 1280;
    const height = Number(job.viewport?.height) || 720;
    await page.setViewport({ width, height });
    page.setDefaultNavigationTimeout(60000);

    for (const item of pages) {
      const relative = item.path;
      const filename = item.filename;
      const target = pageUrl(job.baseUrl, relative);
      const outFile = path.join(imagesDir, filename);

      try {
        await page.goto(target, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(1200);
        // Hide our purchase dock so cards show the layout, not chrome.
        await page.addStyleTag({
          content: '#uln-preview-root,#uln-preview-dock,#uln-preview-fab{display:none!important;}',
        }).catch(() => {});
        await page.screenshot({ path: outFile, fullPage: false, type: 'png' });
        captured.push({
          path: relative,
          filename,
          file: path.join('images', filename).replace(/\\/g, '/'),
          url: target,
        });
      } catch (pageError) {
        skipped.push({
          path: relative,
          reason: pageError?.message || String(pageError),
        });
        if (filename === 'main.png') {
          error = pageError?.message || String(pageError);
        }
      }
    }
  } finally {
    await browser.close();
  }

  const result = {
    ok: captured.some((item) => item.filename === 'main.png'),
    engine: 'puppeteer',
    captured,
    skipped,
    error,
  };
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  if (!result.ok) {
    console.error(error || 'main.png was not captured');
    process.exit(1);
  }
  console.log(`Captured ${captured.length} page(s) for ${job.slug}`);
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
