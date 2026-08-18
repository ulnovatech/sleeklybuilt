import fs from "node:fs";
import path from "node:path";

const PRIORITY = [
  "support.md",
  "crm.md",
  "checkout.md",
  "restaurant_ordering.md",
  "settings.md",
  "search.md",
  "messaging.md",
  "authentication_flow.md",
];

const dir = path.resolve("design-os/patterns");

function extractSection(text, name) {
  const re = new RegExp(`^# ${name}\\s*$([\\s\\S]*?)(?=\\n# [^#]|$)`, "m");
  const m = text.match(re);
  return m ? m[1] : "";
}

function bullets(section) {
  return [...section.matchAll(/^[-*]\s+(?:\[[ xX]?\]\s*)?(.+)$/gm)].map((m) => m[1].trim());
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  return new Set(normalize(s).split(" ").filter((w) => w.length > 3));
}

function jaccard(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

for (const f of PRIORITY) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const anti = bullets(extractSection(text, "Anti-Patterns"));
  const qa = bullets(extractSection(text, "QA Checklist"));
  console.log(`\n==== ${f} anti=${anti.length} qa=${qa.length} ====`);
  let pairs = 0;
  for (let i = 0; i < qa.length; i++) {
    let best = 0;
    let bestAnti = "";
    for (const a of anti) {
      const s = jaccard(qa[i], a);
      if (s > best) {
        best = s;
        bestAnti = a;
      }
    }
    if (best >= 0.35) {
      pairs++;
      console.log(`QA[${i}] sim=${best.toFixed(2)}`);
      console.log(`  QA:   ${qa[i].slice(0, 120)}`);
      console.log(`  ANTI: ${bestAnti.slice(0, 120)}`);
    }
  }
  console.log(`Overlapping pairs (>=0.35): ${pairs}`);
  // Print first 5 QA for tone check
  console.log("Sample QA:");
  qa.slice(0, 5).forEach((q, i) => console.log(`  ${i}. ${q.slice(0, 100)}`));
  console.log("Sample Anti:");
  anti.slice(0, 5).forEach((q, i) => console.log(`  ${i}. ${q.slice(0, 100)}`));
}

// Also scan ALL for Depends On with Review anywhere
console.log("\n==== Depends On lines ====");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const m = text.match(/\*\*Depends On:\*\*\s*(.+)/);
  if (m) console.log(`${f}: ${m[1]}`);
  const g = text.match(/\*\*Gated By:\*\*\s*(.+)/);
  if (g) console.log(`${f} GATED: ${g[1]}`);
}
