/**
 * validate-design-os.mjs
 *
 * Asserts structural integrity of the Design OS corpus.
 * Run from repo root: node scripts/validate-design-os.mjs
 *
 * Exit 0 = pass. Exit 1 = failures printed to stderr.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOS = path.join(ROOT, "design-os");

const MANDATORY_PATTERN_HEADINGS = [
  "# Purpose",
  "# User Journey",
  "# Screen Layout",
  "# Component Hierarchy",
  "# States",
  "# Accessibility Requirements",
  "# Anti-Patterns",
  "# QA Checklist",
  "# Final Rule",
];

const FORBIDDEN_STUB = [
  { re: /\bTODO:/, label: "TODO:" },
  { re: /\bFIXME:/, label: "FIXME:" },
  { re: /lorem ipsum/i, label: "lorem ipsum" },
  { re: /\(add more here\)/i, label: "add more here" },
  { re: /placeholder section/i, label: "placeholder section" },
];

const failures = [];
const warnings = [];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.name.endsWith(".md")) acc.push(full);
  }
  return acc;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

/** Build resolvable title keys from filenames and H1s */
function buildKnownTitles(files) {
  const known = new Set();
  for (const f of files) {
    const base = path.basename(f, ".md").replace(/^\d+_/, "").replace(/[-_]/g, " ").trim().toLowerCase();
    known.add(base);
    known.add(base.replace(/ system$/, ""));
    known.add(base.replace(/ intelligence$/, ""));
    known.add(base.replace(/ review$/, ""));
    const h1 = read(f).match(/^#\s+(.+)$/m);
    if (h1) {
      const title = h1[1].replace(/\*\*/g, "").trim().toLowerCase();
      known.add(title);
      known.add(title.replace(/ system$/, ""));
      known.add(title.replace(/ intelligence$/, ""));
      known.add(title.replace(/ pattern$/, ""));
      known.add(title.replace(/ review$/, ""));
      known.add(title.replace(/ component system$/, ""));
      known.add(title.replace(/ component$/, ""));
    }
  }
  // Aliases used in corpus
  for (const a of [
    "mobile first",
    "design constitution",
    "quality bar",
    "design principles",
    "visual language",
    "accessibility",
    "product classifier",
    "empty loading error states",
    "empty, loading, and error states system",
    "design tokens",
    "design tokens system",
  ]) {
    known.add(a);
  }
  return known;
}

function normalizeRef(ref) {
  return ref
    .replace(/`/g, "")
    .replace(/\s+Component$/i, "")
    .replace(/\s+Components$/i, "")
    .replace(/\s+Pattern$/i, "")
    .replace(/\s+System$/i, "")
    .trim()
    .toLowerCase();
}

function resolves(ref, known) {
  const n = normalizeRef(ref);
  if (!n) return true;
  if (known.has(n)) return true;
  if (known.has(n + " system")) return true;
  if (known.has(n + " intelligence")) return true;
  if (known.has(n + " review")) return true;
  if (known.has(n + " pattern")) return true;
  // drop trailing s
  if (n.endsWith("s") && known.has(n.slice(0, -1))) return true;
  return false;
}

// --- run ---
if (!fs.existsSync(DOS)) {
  console.error("design-os/ not found");
  process.exit(1);
}

const files = walk(DOS);
console.log(`Validating ${files.length} markdown files in design-os/`);

const known = buildKnownTitles(files);

for (const f of files) {
  const text = read(f);
  const r = rel(f);
  const lines = text.split(/\r?\n/);

  // empty
  if (text.trim().length === 0) {
    failures.push(`${r}: empty file`);
    continue;
  }

  // metadata (root docs README/INDEX/ROADMAP/CHANGELOG may vary — require Version on layer docs)
  const isRoot = ["README.md", "INDEX.md", "ROADMAP.md", "CHANGELOG.md"].includes(path.basename(f));
  if (!isRoot && !/\*\*Version:\*\*/.test(text)) {
    failures.push(`${r}: missing **Version:** metadata`);
  }

  // fences
  const fenceCount = (text.match(/^```/gm) || []).length;
  if (fenceCount % 2 !== 0) {
    failures.push(`${r}: unbalanced code fences (${fenceCount})`);
  }

  // stub language — allow discussing "placeholder" as a prohibition
  for (const { re, label } of FORBIDDEN_STUB) {
    if (re.test(text)) {
      const hits = lines.filter(
        (l) => re.test(l) && !/never|prohibit|avoid|not |no |reject|forbid|including headings/i.test(l)
      );
      if (hits.length) {
        failures.push(`${r}: forbidden stub language matched ${label} — e.g. "${hits[0].trim().slice(0, 80)}"`);
      }
    }
  }

  // pattern mandatory sections
  if (r.includes("/patterns/")) {
    for (const h of MANDATORY_PATTERN_HEADINGS) {
      if (!text.includes(h)) {
        failures.push(`${r}: missing mandatory section ${h}`);
      }
    }
  }

  // Depends On / Gated By resolution
  for (const line of lines) {
    const m = line.match(/^\*\*(Depends On|Gated By):\*\*\s*(.+)$/);
    if (!m) continue;
    const refs = m[2].split(",").map((s) => s.trim()).filter(Boolean);
    for (const ref of refs) {
      if (ref.includes("<") || ref.startsWith("<")) continue; // convention placeholders in INDEX
      if (!resolves(ref, known)) {
        warnings.push(`${r}: unresolved ${m[1]} ref "${ref}"`);
      }
    }
  }
}

// icon-system must not exist
if (fs.existsSync(path.join(DOS, "systems", "icon-system.md"))) {
  failures.push("systems/icon-system.md still exists — should be merged into iconography_system.md");
}

// error states must exist
if (!fs.existsSync(path.join(DOS, "systems", "error_states_system.md"))) {
  failures.push("systems/error_states_system.md missing");
}

// content intelligence must exist
if (!fs.existsSync(path.join(DOS, "intelligence", "content_intelligence.md"))) {
  failures.push("intelligence/content_intelligence.md missing");
}

// coverage patterns (1.2)
for (const p of ["file_upload.md", "multi_step_form.md", "data_import.md", "error_recovery.md"]) {
  if (!fs.existsSync(path.join(DOS, "patterns", p))) {
    failures.push(`patterns/${p} missing`);
  }
}

// agent enforcement entry points
if (!fs.existsSync(path.join(ROOT, "AGENTS.md"))) {
  failures.push("AGENTS.md missing at repo root");
}
{
  const enf = path.join(ROOT, ".cursor", "rules", "design-os-enforcement.mdc");
  if (!fs.existsSync(enf)) {
    failures.push(".cursor/rules/design-os-enforcement.mdc missing");
  }
}

// layout system must not be titled Grid System
{
  const layout = path.join(DOS, "systems", "layout_system.md");
  if (fs.existsSync(layout)) {
    const h1 = read(layout).match(/^#\s+(.+)$/m);
    if (h1 && /grid system/i.test(h1[1])) {
      failures.push("systems/layout_system.md H1 is still Grid System");
    }
  }
}

// .cursor rules: all must be .mdc with valid frontmatter; no .md rules; no ODT
const rulesDir = path.join(ROOT, ".cursor", "rules");
if (fs.existsSync(rulesDir)) {
  for (const name of fs.readdirSync(rulesDir)) {
    const full = path.join(rulesDir, name);
    if (!fs.statSync(full).isFile()) continue;
    if (name.endsWith(".md")) {
      failures.push(`.cursor/rules/${name}: markdown rules are suspect — convert to .mdc or remove`);
    }
    if (name.endsWith(".mdc")) {
      const buf = fs.readFileSync(full);
      if (buf[0] === 0x50 && buf[1] === 0x4b) {
        failures.push(`.cursor/rules/${name}: file is a ZIP/ODT, not text`);
      }
      const t = buf.toString("utf8");
      if (!t.startsWith("---")) {
        failures.push(`.cursor/rules/${name}: missing opening frontmatter ---`);
      } else {
        const close = t.indexOf("\n---", 3);
        if (close === -1) failures.push(`.cursor/rules/${name}: missing closing frontmatter ---`);
      }
    }
  }
}

console.log(`Failures: ${failures.length}`);
console.log(`Unresolved-ref warnings: ${warnings.length}`);

for (const f of failures) console.error("FAIL:", f);
for (const w of warnings.slice(0, 40)) console.warn("WARN:", w);
if (warnings.length > 40) console.warn(`WARN: … ${warnings.length - 40} more`);

process.exit(failures.length ? 1 : 0);
