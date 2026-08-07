# Design OS
**Version:** 1.1  
**Status:** Production Knowledge System + Enforceable Agent Loop  
**Entry Point:** Read this, then `INDEX.md`

---

# What This Is

Design OS is the design and user experience authority for this repository.

It is **124 documents** that answer, in advance, the questions that otherwise get answered badly under deadline pressure.

Which metrics belong on this dashboard.

What happens when this list is empty.

Where the focus ring goes.

Whether this needs a modal.

What the mobile version of a data table is.

Every one of those questions has a defensible answer, and Design OS is where that answer lives so nobody has to invent it twice.

---

# What This Is Not

This is not a component library.

There is no code here. No React, no CSS, no tokens in JSON. Design OS describes what to build and why. The implementation lives in the application repositories.

This is not a style guide.

A style guide tells you which blue to use. Design OS tells you how to decide, what the blue must survive, and what to do when it fails contrast on a dark surface.

This is not aspirational documentation.

Every document is written to be used during real work, on a real deadline, and to be enforceable in review.

---

# Why It Exists

Software quality degrades in predictable places.

Nobody designs the empty state, so new users see a screen of zeros.

Nobody decides the save model, so half the settings autosave and half need a button.

Nobody defines the metric, so two people read the same number differently and stop trusting the dashboard.

Nobody plans the mobile version, so the table gets a horizontal scrollbar and ships.

These are not talent problems. They are memory problems. The decision was never written down, so it gets remade — badly — every time.

Design OS is the written-down version.

---

# The Eight Layers

```
Constitution      what is never negotiable

Intelligence      what to decide, and why

Systems           the primitives

Components        the building blocks

Patterns          the complete solutions

Skills            the expert lenses

Prompts           the processes

Reviews           the gates
```

Each layer may depend on the layers above it and never on the layers below it.

`INDEX.md` maps all 123 documents across these layers, with routing tables for common tasks.

---

# Getting Started

## If you are building something new

```
1. intelligence/product_classifier.md      classify what this is
2. constitution/                            read the law once, properly
3. prompts/<your product category>.md       follow the process
4. patterns/<the relevant pattern>.md       take the complete solution
5. reviews/final_approval.md                gate it
```

## If you are building one screen

Go straight to the pattern.

```
patterns/dashboard.md
patterns/checkout.md
patterns/settings.md
patterns/search.md
```

Each pattern contains the user journey, three breakpoint layouts, the component hierarchy, the full state matrix, accessibility requirements, and a QA checklist. It is designed to be the only document you need open.

## If you are reviewing someone's work

```
reviews/ux_review.md
reviews/visual_review.md
reviews/accessibility_review.md
reviews/final_approval.md
```

## If you are fixing something that feels cheap but you cannot say why

```
skills/design_critic.md
skills/visual_polish.md
```

---

# The Pattern Layer Is The Point

Most of the value is in `patterns/`.

A pattern is not advice. It is a complete specification for a recognisable product problem:

```
Purpose

When to use, and when not to

User goal and journey

UX flow

Screen layout at mobile, tablet, and desktop

Component hierarchy

Interaction flow

The full state matrix

Mobile behavior

Desktop expansion

Accessibility requirements

Data requirements

Performance requirements

Anti-patterns

A worked output example

A QA checklist
```

The state matrix is the part that separates this from ordinary documentation. Every pattern specifies what the screen does on first load, on refresh, when genuinely empty, when a filter excludes everything, when one region fails, when the whole page fails, when data is stale or partial, when the user lacks permission, and when the action succeeds.

Those nine states are where products are actually won and lost.

---

# Non-Negotiables

These come from the constitution and apply to everything:

- Mobile is designed first. Desktop is the expansion, never the source.
- Accessibility is a requirement, not a phase. Keyboard, contrast, screen reader, reduced motion, 200% zoom.
- Every component ships its complete state set. Loading, empty, error, success, hover, focus, disabled.
- Nothing communicates through color alone.
- One primary action per screen.
- No placeholder implementations. A feature that does not perform real work is not done.
- A feature is complete when it is functional, intuitive, polished, responsive, accessible, and consistent. Functional alone is not complete.

---

# Enforcement

Design OS is the knowledge. `.cursor/` is the enforcement.

```
.cursor/rules/*.mdc     always-on agent gates (11 files, valid YAML frontmatter)
.cursor/commands/       invocable build and review workflows (aligned to prompts)
.cursor/checklists/     ship gates (mapped to reviews/*)
.cursor/templates/      screen scaffolds (point at governing patterns)
.cursor/settings.json   Design OS flags, required states, workflow loop (v1.1)
```

## What actually loads

Only `.mdc` files in `.cursor/rules/` with valid frontmatter bind the agent.

As of 1.1:

- All rules are `.mdc` with opening/closing `---` and `alwaysApply: true`
- Two OpenDocument files that were misnamed `.md` (and could never load) were deleted
- The UX/UI intelligence rulebook is `ux-ui-intelligence-rulebook.mdc` (spelling corrected)

Hard gates kept always-on: UI/UX gate, no-placeholders, execution-authority, mobile-first, Design OS consult (`01-design-os`), core quality, and the condensed intelligence rulebook.

## Mandatory loop

```
Classify → INDEX routing → Intelligence → Pattern → Systems/Components → Implement → Reviews/Checklists → Final approval
```

When a command and a prompt disagree, the prompt wins and the command gets fixed.

## Validation

```
node scripts/validate-design-os.mjs
```

Asserts: no empty docs, metadata, balanced fences, pattern section set, dependency resolution, no icon-system duplicate, valid `.cursor/rules` frontmatter. Must pass before claiming Design OS changes are done.

## Token binding

Roles live in Design OS. Hex values live in product design docs (e.g. `marketing/DESIGN.md`). Components must consume mapped tokens once the app wires them — see Implementation Binding Contract in `systems/design_tokens.md`.

---

# Contributing

## Before adding a document

Ask whether the knowledge belongs in an existing document. Known overlaps are documented under Known Overlaps in `INDEX.md` and remaining items in `ROADMAP.md`. A new dual authority for the same concern makes the system harder to trust than no system at all.

## When adding a document

- Match the house structure. `patterns/dashboard.md` is the canonical reference for patterns; `intelligence/layout_intelligence.md` for intelligence; `systems/design_tokens.md` for systems.
- Fill the metadata block: version, status, dependencies.
- Depend only upward. A system may not reference a pattern.
- Reference other documents by human title. Never reference one that does not exist.
- Write only what can be checked. If a reader cannot tell whether they complied, rewrite it.
- Register it in `INDEX.md` and record the change in `CHANGELOG.md`.

## What gets rejected

- Empty sections under headings, including headings with nothing under them.
- Advice that cannot be verified in review.
- Invented statistics or cited studies without sources.
- Screen layouts in the intelligence layer.
- Decision criteria in the pattern layer that belong upstream.
- A new pattern that duplicates an existing one with different words.

---

# Where To Go Next

```
INDEX.md        the full map and routing tables

ROADMAP.md      what is planned and what is known-imperfect

CHANGELOG.md    what changed and when
```

---

# Final Note

The purpose of this system is not to constrain judgement.

It is to spend the judgement where it matters — on the actual product problem — instead of re-litigating the spacing scale in every sprint.

The goal is not software that works.

The goal is software worth using.
