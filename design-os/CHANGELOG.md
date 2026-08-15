# Design OS Changelog
**Version:** 1.3  
**Status:** Active  
**Format:** Reverse chronological. Newest entries at the top.

---

# Conventions

Entries are grouped by release and categorised:

```
Added        new documents or new sections
Changed      revised guidance that alters a decision
Fixed        corrected errors, broken references, or inconsistencies
Removed      deleted documents or retired guidance
Known        defects accepted into the release, tracked in ROADMAP.md
```

---

# 1.3 — 2026-08-14 — SleeklyBuilt Attendant Pattern

## Added

- Pattern `attendant.md` — site-resident professional attendant (launcher, panel, confirmation, human path)
- INDEX routing `"Build a site attendant"` composing attendant + messaging + support + contact
- Authoritative runtime contract in repo-root `attendant/` (loaded by the PHP engine; not Design OS corpus)

## Changed

- INDEX and ROADMAP pattern count 27 → 28 (129 design-os markdown files)

---

# 1.2 — 2026-08-06 — Enforcement Closure

Closed the gaps that prevented “undoubtedly”: process enforcement, token binding in marketing, CI validation, pattern coverage, and judgment constraints.

## Added

- Root `AGENTS.md` — mandatory agent contract and strict execution order
- `.cursor/rules/design-os-enforcement.mdc` — hard always-on: read pattern before UI code
- Patterns: `file_upload`, `multi_step_form`, `data_import`, `error_recovery`
- CI job `validate-design-os` in `.github/workflows/ci.yml` (blocks build jobs)
- `npm run validate:design-os`
- Marketing semantic CSS roles (`--color-surface-base`, `--color-action-primary`, …) and Tailwind `surface` / `content` / `action` / `accent` / `status` / `dos-*` keys
- Judgment Constraint Gate in `reviews/final_approval.md`
- Design OS Process Gate in `.cursor/checklists/final-review.md`

## Changed

- `ui-ux-gate.mdc` — requires opened pattern + strict order
- `01-design-os.mdc` — points to AGENTS.md + enforcement; UX gate artifacts in loop
- `.cursor/settings.json` → v1.2 (`strictExecutionOrder`, `requirePatternReadBeforeUiCode`)
- `marketing/DESIGN.md` binding section documents implemented code map
- Validator asserts new patterns, AGENTS.md, and enforcement rule exist

## Known

- Marketing legacy classnames migrate opportunistically
- Other apps bind tokens when next redesigned
- User can still override agents verbally (human choice)

---

# 1.1 — 2026-08-05 — Loop Closure

Closed the effectiveness gap: rules that actually load, consolidated authority, thin-file strength, command/checklist alignment, token binding contract, and automated validation.

## Added

- `systems/error_states_system.md` — full-depth Error States System
- `intelligence/content_intelligence.md` — microcopy, tone, honesty, empty/error/form language
- `scripts/validate-design-os.mjs` — corpus + `.cursor/rules` structural validator (passing)
- `.cursor/rules/ux-ui-intelligence-rulebook.mdc` — condensed always-on UX/UI gate
- Implementation Binding Contract section in `systems/design_tokens.md`
- Design OS binding map section in `marketing/DESIGN.md`
- Design OS Loop + Consult blocks on all `.cursor/commands/*`
- Review mapping headers on all `.cursor/checklists/*`
- Design OS source notes on all `.cursor/templates/*`

## Changed

- `systems/layout_system.md` rewritten as Layout System (composition); no longer titled Grid System
- `systems/empty_loading_error_states.md` thinned to overview linking Empty / Loading / Error specialists
- `systems/iconography_system.md` merged as sole icon authority
- `systems/grid_system.md` retains grid math; absorbed page-padding clarity from old layout overlap
- Thin prompts, skills, reviews, radius/shadow systems expanded to checkable depth
- `.cursor/settings.json` → v1.1 with workflow loop, token forbid flags, expanded required states
- `01-design-os.mdc` rewritten with valid frontmatter and mandatory Design OS loop
- Numbered `.mdc` rules: fake `-----------------` closers replaced with real `---`
- `README.md`, `INDEX.md`, `ROADMAP.md` updated for 1.1 enforcement reality

## Fixed

- Constitution Depends On now uses human titles (not backtick filenames)
- Review layer no longer depends on "Entire Design OS" / "Accessibility QA"
- `accessibility_intelligence` no longer cites non-existent "Accessibility Principles"
- Pattern/prompt deps updated off deleted icon path and onto specialist state systems
- `ui-ux excellence.mdc` renamed to `ui-ux-excellence.mdc`

## Removed

- `systems/icon-system.md` (duplicate)
- `.cursor/rules/quality.rules.md` — was an OpenDocument binary, not markdown
- `.cursor/rules/ux ui intellience rulebook.md` — OpenDocument binary
- `.cursor/rules/ux-ui intellience rulebook.md` — replaced by correctly named `.mdc`

## Known (remaining)

Tracked in `ROADMAP.md`: pattern checklist overlap (minor), residual Priority headers (minor), app-level token wiring still incomplete (major for product repos, not Design OS prose).

---

# 1.0 — 2026-08-05

First complete release. Every document in the corpus contains real content.

## Added

**Patterns layer completed — 23 documents.**

The pattern layer previously existed as 23 empty files. All are now complete specifications carrying purpose, usage boundaries, user goal and journey, UX flow, mobile-first layouts at three breakpoints, component hierarchy, interaction flows, the full state matrix, mobile behavior, desktop expansion, accessibility requirements, data requirements, performance requirements, anti-patterns, a worked output example, and a QA checklist.

```
Application flows    authentication_flow, onboarding, dashboard, analytics,
                     search, settings, profile, notifications, messaging,
                     support, crm, kanban, calendar, booking

Commerce             ecommerce_catalog, product_details, checkout, pricing,
                     restaurant_ordering

Marketing sections   hero_sections, feature_sections, faq, contact
```

`patterns/dashboard.md` was written first and is the canonical structural reference for the layer.

The three marketing-section patterns carry an additional Variant Catalog section, because a section pattern has named compositional variants where a flow pattern has stages.

**Intelligence layer completed — 4 documents.**

```
dashboard_intelligence      audience classification, metric qualification,
                            vanity metric rejection, definition contracts,
                            alert threshold design

ecommerce_intelligence      catalog structure, merchandising, price honesty,
                            availability truthfulness, variant strategy,
                            post-purchase confidence

landing_page_intelligence   awareness stage mapping, narrative structure,
                            proof selection, CTA strategy by traffic intent

responsive_intelligence     content-driven breakpoints, transformation over
                            scaling, input modality, capability detection
```

**Systems layer completed — 1 document.**

`systems/color_system.md` added. Defines the four-layer color architecture — palette ramps, semantic roles, component tokens, state variants — plus contrast requirements, banned combinations, dark mode as a separate theme rather than an inversion, gradient constraints, data visualisation color logic, and color blindness requirements.

It is the structural counterpart to `intelligence/color_intelligence.md`, which decides which colors a product should use.

**Prompts layer completed — 2 documents.**

```
prompts/admin_panel.md   operational tooling: permission modelling,
                         impersonation safety, the destructive action
                         gradient, operator speed, audit trails

prompts/redesign.md      behaviour audit before change, problem versus
                         taste, the preservation list, four rollout
                         strategies, regression detection
```

**Root documentation — 3 documents.**

```
README.md      what Design OS is, what it is not, and how to enter it
ROADMAP.md     current state, known imperfections, planned work
CHANGELOG.md   this document
```

## Changed

**`INDEX.md` rewritten.**

The previous index described a seven-folder structure that did not exist on disk. It referenced `principles/`, `foundations/`, `ux/`, and `workflows/`, none of which are present, and omitted `constitution/`, `intelligence/`, `systems/`, `skills/`, and `prompts/`, all of which are. Its component and pattern listings named files that had never been created, and its routing guide pointed at paths that could not be opened.

The rewrite documents the real eight-layer structure, lists all 123 documents by their actual filenames, and provides routing tables that resolve.

**`ROADMAP.md` replaced.**

The previous file was twelve lines describing a `.cursor/skills/` directory tree that does not exist. The skills it referenced live in `design-os/skills/` as individual documents.

**Layer dependency model formalised.**

`INDEX.md` now states the dependency rule explicitly: a layer may depend on the layers above it and never on the layers below it.

Reviews are declared a cross-cutting exception, because every layer is validated by them and no layer is built from them. Documents that must name a mandatory gate now declare it in a separate `Gated By` field rather than in `Depends On`.

## Fixed

**Broken cross-reference in `systems/empty_states_system.md`.**

Its dependency block named "Content Intelligence", which does not exist in the corpus. Replaced with `Feedback System`.

**Review documents misplaced in dependency blocks — 4 patterns.**

`authentication_flow.md`, `checkout.md`, `profile.md`, and `settings.md` listed `Security Review` under `Depends On`, inverting the layer direction. Each now declares `Gated By: Security Review` and carries a correct upstream dependency in its place.

## Known

Accepted into this release and tracked in `ROADMAP.md`:

```
Critical   .cursor/rules/ contains three .md files that may not load as
           rules, two of which are near-duplicate rulebooks with a
           misspelled filename

Major      systems/iconography_system.md and systems/icon-system.md are
           duplicate icon systems

Major      three overlapping state-system documents with no error-only
           counterpart

Major      systems/layout_system.md is titled "Grid System", duplicating
           systems/grid_system.md

Minor      two metadata header shapes coexist across the corpus

Minor      the longest pattern files restate anti-patterns as QA items
```

No document in this release is empty, and no document contains placeholder language.

---

# Pre-1.0

The corpus was assembled incrementally without version tracking. The constitution, components, reviews, skills, and most of the systems and intelligence layers were written during this period, along with `.cursor/` rules, commands, checklists, and templates.

`patterns/` was scaffolded as empty files and left unpopulated, which is what release 1.0 resolves.

Changes before 1.0 are not individually recorded.
