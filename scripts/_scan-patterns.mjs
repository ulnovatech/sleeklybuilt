import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("design-os/patterns");
const MANDATORY = [
  "Purpose",
  "When To Use",
  "When Not To Use",
  "User Goal",
  "User Journey",
  "UX Flow",
  "Screen Layout",
  "Component Hierarchy",
  "Interaction Flow",
  "States",
  "Mobile Behavior",
  "Desktop Expansion",
  "Accessibility Requirements",
  "Data Requirements",
  "Performance Requirements",
  "Anti-Patterns",
  "Pattern Output Example",
  "QA Checklist",
  "Final Rule",
];

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
const report = [];

for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const missingLoose = MANDATORY.filter((h) => {
    const re = new RegExp(`^#{1,3}\\s+${h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im");
    return !re.test(text);
  });
  const depends = (text.match(/\*\*Depends On:\*\*\s*(.+)/) || [])[1] || "";
  const gated = (text.match(/\*\*Gated By:\*\*\s*(.+)/) || [])[1] || "";
  const reviewInDepends = depends
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /review/i.test(s));
  const layoutMatch = text.match(/# Screen Layout([\s\S]*?)(?=\n# [^#]|$)/);
  let mobileOrder = "n/a";
  if (layoutMatch) {
    const block = layoutMatch[1];
    const mobileIdx = block.search(/##\s*Mobile/i);
    const tabletIdx = block.search(/##\s*Tablet/i);
    const desktopIdx = block.search(/##\s*Desktop/i);
    if (mobileIdx === -1) mobileOrder = "no-mobile-in-layout";
    else if (desktopIdx !== -1 && mobileIdx > desktopIdx) mobileOrder = "mobile-after-desktop";
    else if (tabletIdx !== -1 && mobileIdx > tabletIdx) mobileOrder = "mobile-after-tablet";
    else mobileOrder = "ok";
  }
  const antiMatch = text.match(/# Anti-Patterns([\s\S]*?)(?=\n# [^#]|$)/);
  const qaMatch = text.match(/# QA Checklist([\s\S]*?)(?=\n# [^#]|$)/);
  let qaSimilarity = 0;
  let qaCount = 0;
  let antiCount = 0;
  if (antiMatch && qaMatch) {
    const antiBullets = [...antiMatch[1].matchAll(/^[-*]\s+(.+)$/gm)].map((m) =>
      m[1]
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
    );
    const qaBullets = [...qaMatch[1].matchAll(/^[-*]\s+\[[ x]?\]?\s*(.+)$/gm)].map((m) =>
      m[1]
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
    );
    antiCount = antiBullets.length;
    qaCount = qaBullets.length;
    if (qaBullets.length) {
      let overlap = 0;
      for (const q of qaBullets) {
        if (
          antiBullets.some(
            (a) =>
              a.includes(q.slice(0, 40)) ||
              q.includes(a.slice(0, 40)) ||
              (a.length > 20 && q.includes(a.slice(0, Math.min(30, a.length))))
          )
        )
          overlap++;
      }
      qaSimilarity = Math.round((100 * overlap) / qaBullets.length);
    }
  }
  report.push({
    f,
    size: text.length,
    missing: missingLoose,
    reviewInDepends,
    gated,
    mobileOrder,
    qaSimilarity,
    qaCount,
    antiCount,
    dependsHasReview: reviewInDepends.length > 0,
  });
}

report.sort((a, b) => b.size - a.size);
for (const r of report) console.log(JSON.stringify(r));
console.log("---SUMMARY---");
console.log("files", report.length);
console.log(
  "with missing",
  report.filter((r) => r.missing.length).map((r) => ({ f: r.f, missing: r.missing }))
);
console.log(
  "review in depends",
  report.filter((r) => r.dependsHasReview).map((r) => ({ f: r.f, refs: r.reviewInDepends }))
);
console.log(
  "mobile order issues",
  report.filter((r) => r.mobileOrder !== "ok" && r.mobileOrder !== "n/a").map((r) => ({ f: r.f, o: r.mobileOrder }))
);
console.log(
  "high QA overlap (>=40%)",
  report.filter((r) => r.qaSimilarity >= 40).map((r) => ({ f: r.f, s: r.qaSimilarity, qa: r.qaCount, anti: r.antiCount }))
);
