# Design OS Knowledge Map
**Version:** 1.0  
**Status:** Canonical Index  
**Scope:** All 128 documents in `design-os/`

---

# Purpose

This document is the routing table for the Design OS knowledge system.

Read it before designing, planning, building, or reviewing any interface.

Its job is to answer one question quickly:

Which documents govern the thing I am about to build?

---

# The Layer Model

Design OS has eight layers.

Each layer answers a different kind of question.

```
Constitution        What is never negotiable?

↓

Intelligence        What should we decide, and why?

↓

Systems             What are the primitives?

↓

Components          What are the building blocks?

↓

Patterns            What is the complete solution?

↓

Skills              Whose expertise applies?

↓

Prompts             What process produces it?

↓

Reviews             Is it allowed to ship?
```

## Dependency Rule

A layer may depend on the layers above it.

A layer must never depend on the layers below it.

A system may not reference a pattern.

A pattern may reference systems, components, and intelligence freely.

When a document needs something from a lower layer, the boundary is wrong.

## The Review Exception

Reviews are the one exception, because they are cross-cutting gates rather than inputs.

Every layer is validated by the review layer. No layer is built from it.

A document that must name a specific gate declares it separately from Depends On.

Use a Gated By field for mandatory review gates only — for example Security Review on credential, payment, or personal-data patterns.

Never place a review document in Depends On.


---

# How To Use This System

## Building something new

```
1. Classify the product        intelligence/product_classifier.md
2. Read the constitution        constitution/
3. Make the domain decisions    intelligence/
4. Find the pattern             patterns/
5. Apply systems and components systems/ + components/
6. Run the review gates         reviews/
```

## Improving something that exists

```
1. Audit what is there          prompts/redesign.md
2. Identify the real problem    reviews/ux_review.md + reviews/visual_review.md
3. Find the governing pattern   patterns/
4. Change the minimum           prompts/redesign.md
5. Re-run the gates             reviews/final_approval.md
```

## The rule that matters most

Never invent a new pattern when an existing Design OS pattern solves the problem.

Consistency beats novelty.

---

# Directory Structure

```text
design-os/
├── README.md
├── INDEX.md
├── ROADMAP.md
├── CHANGELOG.md
├── constitution/     7 documents
├── intelligence/    16 documents
├── systems/         20 documents
├── components/      17 documents
├── patterns/        27 documents
├── skills/          13 documents
├── prompts/         12 documents
└── reviews/         12 documents
```

---

# 1. Constitution

Location: `design-os/constitution/`

Purpose: The non-negotiable law. Nothing below this layer may contradict it.

Use when: starting any product, resolving a disagreement, deciding whether something is allowed to ship.

```text
constitution/
├── 00_design_constitution.md
├── 01_design_principles.md
├── 02_quality_bar.md
├── 03_mobile_first.md
├── 04_accessibility.md
├── 05_visual_language.md
└── 06_interaction_principles.md
```

If a decision conflicts with this layer, the decision is wrong. Not the constitution.

---

# 2. Intelligence

Location: `design-os/intelligence/`

Purpose: The decision layer. It determines *what* to build and *why*, with explicit criteria.

Use when: choices must be made before any layout exists — which metrics, which palette, which narrative, which navigation model.

```text
intelligence/
├── product_classifier.md            start here for any new product
├── ux_intelligence.md
├── layout_intelligence.md
├── navigation_intelligence.md
├── component_intelligence.md
├── responsive_intelligence.md
├── mobile_intelligence.md
├── color_intelligence.md
├── typography_intelligence.md
├── font_intelligence.md
├── motion_intelligence.md
├── accessibility_intelligence.md
├── content_intelligence.md          voice, microcopy, honesty, state language
├── dashboard_intelligence.md
├── ecommerce_intelligence.md
└── landing_page_intelligence.md
```

Intelligence never contains screen layouts or component trees. It hands off to the pattern layer.

---

# 3. Systems

Location: `design-os/systems/`

Purpose: The primitives. Values, scales, and rules that every component consumes.

Use when: establishing foundations, adding a token, deciding a scale, defining a state behavior.

```text
systems/
├── design_tokens.md                 the naming contract for everything below
├── color_system.md
├── typography_system.md
├── spacing_system.md
├── grid_system.md
├── layout_system.md
├── radius_system.md
├── shadow_system.md
├── elevation_system.md
├── motion_system.md
├── animation_system.md
├── iconography_system.md
├── navigation_system.md
├── forms_system.md
├── data_display_system.md
├── feedback_system.md
├── loading_states_system.md
├── empty_states_system.md
├── error_states_system.md
└── empty_loading_error_states.md
```

Overlapping documents in this layer are listed under **Known Overlaps** below.

---

# 4. Components

Location: `design-os/components/`

Purpose: Reusable building blocks and their complete state sets.

Use when: building UI, extending a component library, deciding whether something should be shared.

```text
components/
├── buttons.md
├── inputs.md
├── forms.md
├── cards.md
├── lists.md
├── tables.md
├── charts.md
├── dialogs.md
├── drawers.md
├── bottom_sheets.md
├── navigation.md
├── search.md
├── app_shell.md
├── authentication.md
├── dashboards.md
├── ecommerce.md
└── landing_pages.md
```

Every component in this layer defines: default, hover, focus, active, disabled, loading, empty, error, and success.

A component without its full state set is not finished.

---

# 5. Patterns

Location: `design-os/patterns/`

Purpose: Complete solutions. A pattern carries the user journey, screen layout at three breakpoints, component hierarchy, full state matrix, accessibility requirements, and QA gate for one recognisable product problem.

Use when: building any real screen or flow. This is the layer you will use most.

## Application flows

```text
patterns/
├── authentication_flow.md
├── onboarding.md
├── dashboard.md              canonical pattern reference
├── analytics.md
├── search.md
├── settings.md
├── profile.md
├── notifications.md
├── messaging.md
├── support.md
├── crm.md
├── kanban.md
├── calendar.md
├── booking.md
└── error_recovery.md
```

## Data and forms

```text
patterns/
├── file_upload.md
├── multi_step_form.md
└── data_import.md
```

## Commerce

```text
patterns/
├── ecommerce_catalog.md
├── product_details.md
├── checkout.md
├── pricing.md
└── restaurant_ordering.md
```

## Marketing sections

```text
patterns/
├── hero_sections.md
├── feature_sections.md
├── faq.md
└── contact.md
```

`patterns/dashboard.md` is the canonical reference for this layer's structure. New patterns must match its shape.

---

# 6. Skills

Location: `design-os/skills/`

Purpose: Expert lenses. Each document describes how a particular specialist thinks and what they refuse to accept.

Use when: work needs a specific kind of scrutiny, or when a decision sits inside one discipline.

```text
skills/
├── design_director.md
├── ux_director.md
├── design_critic.md
├── visual_polish.md
├── accessibility_specialist.md
├── animation_director.md
├── font_architect.md
├── landing_page_designer.md
├── dashboard_designer.md
├── ecommerce_designer.md
├── mobile_app_designer.md
├── ios_hig_specialist.md
└── material3_specialist.md
```

---

# 7. Prompts

Location: `design-os/prompts/`

Purpose: End-to-end processes for producing a complete product of a given category.

Use when: starting a build and you want the decision sequence, not just the standards.

```text
prompts/
├── landing_page.md
├── saas.md
├── dashboard.md
├── admin_panel.md
├── ecommerce.md
├── marketplace.md
├── mobile_app.md
├── mobile_first.md
├── ai_product.md
├── agency_website.md
├── portfolio.md
└── redesign.md
```

Prompts orchestrate the other layers. They do not restate them.

---

# 8. Reviews

Location: `design-os/reviews/`

Purpose: Quality gates. Run before anything is called complete.

Use when: finishing a feature, approving a release, evaluating someone else's work.

```text
reviews/
├── ux_review.md
├── visual_review.md
├── component_review.md
├── design_system_review.md
├── responsive_review.md
├── mobile_review.md
├── accessibility_review.md
├── animation_review.md
├── performance_review.md
├── security_review.md
├── product_review.md
└── final_approval.md
```

`final_approval.md` is the last gate. Nothing ships without it.

---

# Routing Guide

## "Build a landing page"

```text
intelligence/landing_page_intelligence.md
intelligence/content_intelligence.md
prompts/landing_page.md
patterns/hero_sections.md
patterns/feature_sections.md
patterns/pricing.md
patterns/faq.md
patterns/contact.md
components/landing_pages.md
systems/typography_system.md
reviews/visual_review.md
reviews/final_approval.md
```

---

## "Build a dashboard"

```text
intelligence/dashboard_intelligence.md
prompts/dashboard.md
patterns/dashboard.md
patterns/analytics.md
components/charts.md
components/cards.md
components/tables.md
systems/data_display_system.md
reviews/ux_review.md
reviews/performance_review.md
```

---

## "Build an online store"

```text
intelligence/ecommerce_intelligence.md
prompts/ecommerce.md
patterns/ecommerce_catalog.md
patterns/product_details.md
patterns/checkout.md
components/ecommerce.md
systems/forms_system.md
reviews/security_review.md
reviews/mobile_review.md
```

---

## "Build a mobile app"

```text
intelligence/mobile_intelligence.md
intelligence/responsive_intelligence.md
prompts/mobile_app.md
constitution/03_mobile_first.md
components/bottom_sheets.md
components/navigation.md
skills/ios_hig_specialist.md
skills/material3_specialist.md
reviews/mobile_review.md
```

---

## "Build an admin panel"

```text
prompts/admin_panel.md
patterns/crm.md
patterns/settings.md
patterns/search.md
components/tables.md
components/dialogs.md
reviews/security_review.md
reviews/ux_review.md
```

---

## "Build a data-heavy form workflow"

```text
intelligence/ux_intelligence.md
intelligence/content_intelligence.md
patterns/multi_step_form.md
patterns/file_upload.md
patterns/data_import.md
systems/forms_system.md
systems/error_states_system.md
reviews/security_review.md
reviews/accessibility_review.md
```

---

## "Recover from cross-flow failures"

```text
systems/error_states_system.md
systems/feedback_system.md
patterns/error_recovery.md
patterns/multi_step_form.md
patterns/data_import.md
reviews/ux_review.md
reviews/accessibility_review.md
```

---

## "Build a SaaS product"

```text
intelligence/product_classifier.md
prompts/saas.md
patterns/authentication_flow.md
patterns/onboarding.md
patterns/dashboard.md
patterns/settings.md
patterns/pricing.md
components/app_shell.md
reviews/final_approval.md
```

---

## "Redesign something existing"

```text
prompts/redesign.md
reviews/ux_review.md
reviews/visual_review.md
skills/design_critic.md
patterns/<the governing pattern>
reviews/final_approval.md
```

---

## "Set up the visual foundation"

```text
intelligence/color_intelligence.md
intelligence/typography_intelligence.md
intelligence/font_intelligence.md
systems/design_tokens.md
systems/color_system.md
systems/typography_system.md
systems/spacing_system.md
reviews/design_system_review.md
```

---

## "Fix something that feels unfinished"

```text
skills/visual_polish.md
skills/design_critic.md
intelligence/content_intelligence.md
systems/empty_states_system.md
systems/loading_states_system.md
systems/error_states_system.md
systems/feedback_system.md
reviews/visual_review.md
```

---

# Decision Rule

When unsure where to start:

```text
User Goal

↓

Product Classification

↓

Domain Intelligence

↓

Pattern

↓

Components

↓

Systems

↓

Review
```

Skipping the top of this list is the most expensive mistake available.

---

# Relationship To `.cursor/`

Design OS is the knowledge. `.cursor/` is the enforcement.

```
design-os/          the standards, reasoning, and patterns

.cursor/rules/      always-applied agent rules
.cursor/commands/   invocable build and review workflows
.cursor/checklists/ ship gates
.cursor/templates/  screen scaffolds
.cursor/settings.json  Design OS configuration flags
```

`.cursor/commands/` map onto `design-os/prompts/`. When a command and a prompt disagree, the prompt is the source of truth and the command should be corrected.

---

# Known Overlaps

These concerns once had dual documents. Canonical authority after 1.1 consolidation:

## Icons

Canonical: Iconography System (`systems/iconography_system.md`).  
`icon-system.md` was removed.

## State systems

Canonical for depth:

- Empty States System (`systems/empty_states_system.md`)
- Loading States System (`systems/loading_states_system.md`)
- Error States System (`systems/error_states_system.md`)

Canonical for the shared three-state model: Empty, Loading, And Error States Overview (`systems/empty_loading_error_states.md`).

## Layout vs Grid

Canonical for composition: Layout System (`systems/layout_system.md`).

Canonical for columns, gutters, and grid math: Grid System (`systems/grid_system.md`).

---

# Document Conventions

Every Design OS document follows the same shape:

```
# <Title>
**Version:** <n>
**Status:** <layer>
**Depends On:** <upstream documents>
**Gated By:** <mandatory review gates when required>

# Purpose
# Core Philosophy or When To Use
# <the substance>
# Anti-Patterns or Failure Conditions
# Output Example
# QA Checklist or Review Questions
# Final Rule
```

Rules for authoring:

- Reference other documents by human title, never by file path in prose.
- Never reference a document that does not exist.
- Never depend on a lower layer.
- Every claim must be actionable. Prose that cannot be checked does not belong.
- No placeholders, ever. An empty section is worse than an absent one.

---

# Final Instruction

Design OS is the source of truth for product design decisions in this repository.

Before creating any interface:

1. Check whether a pattern already solves it.
2. Reuse the existing components.
3. Consume the existing systems.
4. Validate against the review gates.

The system exists so that quality is the default outcome rather than an act of individual heroism.
