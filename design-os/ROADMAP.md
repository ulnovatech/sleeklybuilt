# Design OS Roadmap
**Version:** 1.2  
**Status:** Active  
**Last Reviewed:** 2026-08-06

---

# Purpose

This document records what is complete, what is known to be imperfect, and what is planned.

---

# Current State (1.2 — Enforcement)

```
constitution/     7 documents      complete
intelligence/    16 documents      complete
systems/         20 documents      consolidated
components/      17 documents      complete
patterns/        27 documents      + file_upload, multi_step_form, data_import, error_recovery
skills/          13 documents      complete
prompts/         12 documents      complete
reviews/         12 documents      + judgment constraint gate
root/             4 documents      complete
AGENTS.md         repo root        mandatory agent contract
.cursor/rules/   12 .mdc files     + design-os-enforcement.mdc
validation        scripts/validate-design-os.mjs   passing
CI                .github/workflows/ci.yml          validate-design-os job (blocks builds)
marketing tokens  semantic CSS + Tailwind roles     bound
```

Total design-os markdown: **128** files. Empty: **0**.

---

# Resolved in 1.2

```
Prose ≠ product     AGENTS.md + design-os-enforcement.mdc require reading
                    governing patterns before UI code; state docs used
Token binding       marketing/src/index.css + tailwind.config.js semantic roles
CI gate             npm run validate:design-os on every PR/push (needs: builds)
Coverage            file_upload, multi_step_form, data_import, error_recovery
Judgment            final_approval Judgment Constraint Gate + final-review process gate
Strict order        ui-ux-gate + 01-design-os + AGENTS.md encode never-reorder loop
```

---

# Remaining (honest)

## 1. Legacy brand classnames in marketing

Existing marketing components still use `cream` / `emerald` / `obsidian` utilities in many places. Semantic aliases exist for **new** work. Full migration of every classname is incremental product work, not a Design OS prose gap.

Priority: Product follow-through (marketing).

## 2. Other apps not yet token-bound

ulndash, portfolio, discovery UIs should adopt the same role → CSS map when next touched.

Priority: On demand per app.

## 3. Pattern QA overlap (minor)

Some long patterns still partially restate anti-patterns in QA. Polish continues opportunistically; does not block enforcement.

## 4. Agents can still be overridden by users

Hard rules and AGENTS.md make the correct path the default. A user can still instruct “skip Design OS.” That is a human override, not a system defect.

---

# Planned Work

```
Migrate marketing components to semantic Tailwind keys opportunistically
Bind ulndash/portfolio when those UIs are next redesigned
Keep validate-design-os green in CI
```

---

# Final Rule

Enforcement is what turns documentation into product quality.

If an agent can ship UI without opening a pattern, the loop is broken — fix the rules, not the prose volume.
