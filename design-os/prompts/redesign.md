# Redesign Prompt

**Version:** 1.0
**Status:** Production Redesign And Migration Design Prompt
**Priority:** Existing Product Continuity Authority

---

# Purpose

This prompt defines the process for redesigning an existing product using the Design OS framework.

A redesign is not a new design that happens to replace an old one.

It is a change made to a system that already has:

* users who know how it works
* workflows built around its current behaviour
* documentation, training, and support material describing it
* integrations depending on its structure

New design is addition. Redesign is subtraction and replacement, which is why it fails more often. A redesign is not measured by whether the new version is better in isolation, but by whether users are better off after the change, including the cost of the change itself. This prompt governs product- and system-level redesign; the Redesign Screen command executes single-screen work inside the boundaries established here.

---

# Design Mission

When redesigning an existing product:

```
Audit What Exists

↓

Separate Real Problems From Taste

↓

Decide What Must Not Change

↓

Choose Scope

↓

Design Replacement And Transition

↓

Choose A Rollout Strategy

↓

Measure Real Usage Against Baseline
```

The audit comes first and is not optional. A redesign that begins with a new layout is a rewrite of assumptions nobody wrote down.

---

# Before Designing

## Change Motivation

State in writing why the redesign is proposed, before evaluating the current design.

Legitimate motivations:

* users fail at a task the product exists to support
* support volume concentrates on one flow
* the interface cannot express functionality the product now has
* accessibility or mobile usage is genuinely broken
* inconsistency has made the product unpredictable and expensive to extend
* performance has degraded beyond usability

Motivations that require challenge before they justify disruption: the product looks dated, a competitor shipped something new, a new team wants ownership, the design system changed and screens no longer match it, or leadership preference with no stated user problem. None of those are automatically invalid, but each must be translated into a user or business outcome first, and "it looks old" is a real problem only when appearance is costing trust, comprehension, or conversion. Consult Product Review and Design Critic.

---

## Users Of Record

Identify everyone who already depends on the current design:

* daily power users who have memorised paths and shortcuts
* occasional users who rely on visible structure rather than memory
* new users who never learned the old version
* staff who support customers using it
* accessibility users whose assistive technology paths are established
* integrators coupled to current behaviour and structure

Power users carry the highest cost of change and produce the loudest feedback. New users carry no cost and produce no feedback. A redesign judged only by the loudest voices gets abandoned; one judged only by new-user testing damages the existing base. Both must be represented in the decision.

---

## Inherited Constraints

Record what cannot change regardless of design preference: data realities and historical records that must remain renderable, contractual or regulatory presentation requirements, platform conventions the product must keep honouring, integrations and deep links that must keep resolving, and documentation that must be updated or invalidated. Consult Product Classifier to confirm what category the product actually is before applying category conventions to it.

---

# Phase 1 — Audit

The audit inventories behaviour, not appearance. Its output is a written record of how the product works today, complete enough that any proposed change can be checked against it.

## Behaviour Inventory

For every screen in scope, record:

```
Purpose — what job it performs
Entry points — every way users arrive here
Exits — where users go next, and how often
Actions available — including hidden and secondary ones
Keyboard paths and shortcuts that currently work
URL structure and deep links that resolve here
States implemented — loading, empty, error, partial, success
Permissions affecting what is shown
Defaults and remembered preferences
```

This prevents the most common redesign failure — silently removing a capability a small number of users depended on completely — because every removal then becomes a decision rather than an oversight.

---

## Usage Evidence

Gather what the product already knows about itself — which screens and actions are used and by whom, where users abandon a flow, where they repeat an action because it did not appear to work, which support requests reference specific screens, which paths keyboard and assistive technology users take, and the device and viewport distribution of real sessions.

Where instrumentation does not exist, say so plainly and instrument before redesigning the flow, because a flow redesigned without usage data can only be asserted to be better, never shown to be. Never fabricate figures to justify a decision — an honest "we do not know" is a valid audit finding that should trigger measurement rather than invention.

---

## Experience Audit

Evaluate the current experience against Design OS standards: task efficiency in steps and inputs required, clarity of purpose and next action, consistency of repeated patterns, completeness of loading and empty and error states, real behaviour at mobile and tablet widths, contrast and keyboard operability and semantics, and perceived speed on the devices users actually have. Consult UX Review, Visual Review, Accessibility Review, Responsive Review, and Performance Review.

---

## Audit Output

Every finding states:

```
Finding
Evidence
Who is affected
Impact on the user or the business
Classification — defect, friction, inconsistency, limitation, or preference
```

A finding with no evidence and no affected user is a preference. Label it as such and keep it out of the justification for change.

---

# Phase 2 — Problem Versus Taste

The hardest discipline in redesign is refusing to spend disruption on things that were never broken.

## Test Every Proposed Change

For each change under consideration, answer:

```
What user outcome improves?
How will the improvement be observed?
What breaks for someone used to the current version?
If we made only this change, would it be worth shipping?
```

A change that cannot name an outcome or an observation method is taste. Taste is not forbidden — visual quality is a real product attribute and Visual Language exists for that reason — but taste-driven change must be labelled honestly, batched together, and never used to justify relocating controls or altering behaviour.

---

## Separate The Three Change Types

```
Behavioural change  — what the product does, or where things are
Structural change   — how information is organised and navigated
Surface change      — type, colour, spacing, elevation, motion
```

Surface changes are cheap for users to absorb and can ship broadly. Structural changes cost users their mental model. Behavioural changes cost users their reliability and produce most redesign backlash. Never bundle a behavioural change inside a visual refresh. Users experience it as the interface breaking, and the team loses the ability to tell which change caused the reaction. Consult Design Director and UX Director when a proposal mixes all three.

---

# Phase 3 — What Must Not Change

Write the preservation list before designing anything. This is the section redesigns skip and later regret.

## Preserve By Default

Unless there is a stated, evidenced reason to change it, keep:

* the location of the primary action on high-frequency screens
* existing keyboard shortcuts and tab order for power workflows
* URL structure and deep links, or provide permanent redirects
* terminology used in the product, documentation, and support material
* the meaning of every colour, icon, and status label already in use, and destructive-action safeguards at their current strength or stronger
* saved views, filters, drafts, and remembered preferences
* export formats, integration-visible structures, and accessibility paths that already work

---

## Muscle Memory Is A Feature

Frequent users do not read the interface. They act on remembered positions and remembered sequences.

* Do not move a high-frequency control to a new region unless the move solves a named problem. Restyling a control in place is nearly free; relocating it is not.
* Never swap the positions of two adjacent actions where one is destructive, because that converts habit into damage. Keep a mastered workflow at the same number of steps or fewer. A redesign that adds one confirmation to a task performed hundreds of times a day is a downgrade however much cleaner it looks.
* Preserve verbs. If users learned "Publish," renaming it to "Go live" invalidates every document, macro, and training video referencing it.
* Where a path must move, leave the old one working for a stated transition period rather than replacing it instantly.

---

## Never Remove Silently

A capability may be removed only when its usage is known and documented, affected users are identified, a replacement path exists or its absence is a deliberately accepted cost, and the removal is announced in the product where the capability used to be. An empty space where a feature used to be, with no explanation, generates support volume and erodes trust in the whole release.

---

# Phase 4 — Scope Decision

## Incremental Redesign

Choose incremental change when findings are localised to specific flows or components, the information architecture is sound, the product is in daily use by trained users, the team must keep shipping other work, and the data model and navigation structure remain valid. Incremental work proceeds pattern by pattern and component by component, each change independently shippable and independently reversible. This is the correct default: most products that believe they need a wholesale redesign need a consistency programme and three flows fixed.

---

## Wholesale Redesign

Choose wholesale change only when:

* the information architecture itself is the problem and no local fix resolves it
* the product's purpose or audience has genuinely changed
* the existing implementation cannot express current functionality
* incremental change would produce a permanently inconsistent hybrid
* accumulated inconsistency is itself the primary user complaint

Wholesale redesign requires a rollout strategy that lets users choose their moment, and an accepted period of maintaining two experiences. Never choose it because it is more satisfying to design; choose it because incremental change provably cannot reach the outcome. Write the scope boundary down, including what is explicitly out of scope. Redesigns fail more often from expanding scope than from insufficient ambition, because each addition extends the period during which the product is half-changed, and that is the state users find most confusing.

---

# Phase 5 — Designing The Replacement

Design the new experience through the standard Design OS process, with three redesign-specific obligations.

## Design Against The Inventory

Every capability in the behaviour inventory is accounted for as kept, moved, merged, or removed with justification. Every state in the inventory exists in the new design — redesigns routinely lose error and empty states because the audit captured only the normal path. Consult Empty States System, Loading States System, and Error States System.

---

## Design The Transition, Not Only The Destination

Define explicitly what an existing user sees the first time the new version appears, how their data and views and preferences carry over, how they find something that moved, how they revert if reverting is offered, and what the support team says when asked where something went. A destination design with no transition design is an unfinished redesign.

---

## Responsive Obligation

Audit real viewport distribution before deciding responsive behaviour. Redesigns commonly improve desktop while quietly degrading mobile, because the design work happens at desktop width and mobile is checked at the end.

* mobile layouts are designed as part of the redesign, not adapted afterwards
* touch targets stay at least 44×44 with adequate separation, and no capability available on mobile today is lost without a stated decision
* text contrast stays at or above 4.5:1, and interface indicators at or above 3:1
* where the product is used predominantly on phones, the mobile design is designed first

Consult Mobile First, Responsive Intelligence, and Mobile Review.

---

# Phase 6 — Rollout Strategy

How a redesign ships determines how it is received. Choose deliberately.

## Parallel

Both versions available at once, with the user switching freely. Choose this when the change is structural or behavioural and affects mastered workflows, when users have deadlines that cannot absorb relearning at an arbitrary moment, or when the change is large enough that some users need weeks to transition.

Cost: two experiences maintained, and feature work must land in both. Requires a switch that is easy to find, a stated end date for the old version, and state preserved across switches.

---

## Opt-In

The new version is offered and users choose to adopt it. Choose this when confidence is moderate and real-usage evidence is still needed, when an engaged segment can act as an early cohort, or when feedback quality matters more than adoption speed.

Cost: self-selected adopters are more tolerant than the general base, so opt-in feedback is optimistic and must never be read as proof the change is ready for everyone. Requires a visible way back and a captured reason whenever a user takes it.

---

## Phased

The new version becomes default for progressively larger portions of the base. Choose this when the change is broadly beneficial, confidence is high, and the population is large enough that a small percentage still yields signal.

Cost: users in the same organisation may see different versions, which complicates support. Requires defined phase gates with metric thresholds, a rollback trigger, and support tooling that shows which version a given user has.

---

## Hard Cutover

Everyone moves at once. Choose this only when the change is surface-level and behaviour is unchanged, when maintaining two versions is genuinely impossible, when the current version is broken badly enough that staying is worse than moving, or when a compliance requirement forces a date.

Cost: no gradual signal, and every problem surfaces simultaneously. Requires advance notice in the product, a rollback plan executable within a stated window, elevated support capacity on the day, and a pre-agreed definition of what would justify reversing.

---

## Rules For Every Strategy

* Announce inside the product, on the surface that is changing, before it changes.
* Explain what changed and why in the user's language, once — not as a recurring modal.
* Never introduce a redesign with a tour that must be completed before work can continue, and where something moved, leave a pointer at the old location for a stated transition period.
* Keep a reversal path available for the full transition period, and state when it ends.
* Never remove the old version while its usage is still material and unexplained.

Consult Onboarding for first-run guidance and Notifications for change communication.

---

# Phase 7 — Measuring Whether It Worked

A redesign is validated by real usage against a baseline, never by preference or internal review.

## Capture Baseline Before Shipping

Baseline measurement is taken before the redesign is exposed to anyone. A baseline captured afterwards is an argument, not evidence.

Record, for the flows in scope:

```
Task completion rate
Time to complete, for experienced and new users separately
Error and retry rate
Abandonment point and rate
Support contacts referencing these flows
Usage of each capability being moved or removed
Mobile session share and mobile completion rate
Accessibility path usage where measurable
```

---

## Expect The Adjustment Period

Any structural change causes a temporary decline for existing users while they relearn. This is normal and must be planned for. Before rollout, state how long the adjustment period is expected to last, what magnitude of temporary decline is acceptable, and what threshold or duration converts adjustment into regression. Without those numbers agreed in advance, every result becomes negotiable and no redesign is ever declared a failure.

---

## Detecting Real Regression

Signals that indicate genuine harm rather than unfamiliarity:

* completion rate for experienced users has not recovered past the stated adjustment window
* new users perform worse than new users did on the old version, which unfamiliarity cannot explain
* one step gains repeated actions, meaning the interface no longer communicates its result
* support contacts concentrate on a single screen rather than on the change in general
* users who can revert are still reverting after the first week, or mobile completion diverges from desktop completion
* a capability's usage collapses when it was only moved, meaning it can no longer be found
* destructive-action error rates rise, which is the most urgent signal and justifies immediate reversal

Distinguish complaint volume from harm. Loud dissatisfaction with unchanged task performance is an adjustment and communication problem. Quiet task failure is a regression, and it is the one that goes unnoticed.

---

## Deciding The Outcome

Conclude with one decision, stated explicitly:

```
Keep — outcomes improved or held, adjustment resolved within the stated window
Repair — direction is right, specific findings must be fixed before proceeding
Reverse — outcomes declined beyond threshold and did not recover
```

Reversal must remain a real option. A redesign that cannot be reversed was shipped without a rollback plan, and that is a process failure independent of the design's quality. Record the decision and its evidence, because the next redesign of this product begins from that record. Consult Final Approval.

---

# Anti-Patterns

Reject:

* redesigning before auditing existing behaviour
* justifying change with "it looks dated" and nothing else
* bundling behavioural changes inside a visual refresh
* moving high-frequency controls without a stated problem
* renaming established terminology for stylistic reasons
* removing capabilities discovered only after users complain, or breaking existing URLs and deep links without redirects
* losing error, empty, and permission states that existed before
* improving desktop while degrading mobile, or weakening destructive-action safeguards in the name of a cleaner flow
* hard cutover for structural change, or forcing a product tour before users can resume work
* treating opt-in enthusiasm as proof of general readiness, or measuring success by internal opinion
* declaring victory during the adjustment period, or deciding after the fact what counted as success
* removing the old version while users are still actively returning to it
* redesigning the same surface repeatedly because no outcome was ever measured

---

# Deliverables

Produce for every redesign:

* **Audit record** — behaviour inventory, usage evidence, experience findings, and honest gaps in what is known
* **Findings list** — each finding with evidence, affected users, impact, and classification, separated from preference
* **Preservation list** — controls, shortcuts, URLs, terminology, safeguards, saved state, and accessibility paths that must not change
* **Change register** — every proposed change typed as behavioural, structural, or surface, with its intended outcome and its cost to existing users
* **Scope statement** — incremental or wholesale, the reasoning, and an explicit out-of-scope list
* **Replacement design** — new structure, mobile through desktop layouts, component usage, and complete state coverage mapped to the inventory
* **Transition design** — first-run experience for existing users, state migration, wayfinding for moved items, revert path
* **Rollout plan** — strategy and justification, phase gates, communication, transition period, rollback trigger and window
* **Measurement plan** — baseline figures, adjustment window, regression thresholds, and the decision rule
* **Outcome record** — results against baseline, the decision taken, and findings carried forward

---

# Completion Criteria

A redesign is complete only when:

```
✓ Existing behaviour was inventoried before anything changed
✓ Every finding has evidence and an affected user
✓ Preference has been labelled as preference, and the preservation list written before the new design
✓ Every capability is accounted for as kept, moved, merged, or removed
✓ Removals were decided, announced, and given a replacement or an accepted cost
✓ Muscle memory for high-frequency workflows is intact or deliberately traded
✓ URLs, deep links, saved views, and preferences survive the change
✓ All prior states exist in the new design
✓ Mobile behaviour improved or held, and was designed rather than adapted
✓ Accessibility improved or held against contrast, keyboard, and semantics
✓ Scope was chosen with reasoning, its boundaries held, and rollout strategy matches the risk of the change
✓ A reversal path existed and stayed available through the transition
✓ Baseline was captured before exposure, and regression thresholds agreed before rollout
✓ Real usage after rollout shows improvement rather than approval, and the outcome decision is recorded with its evidence
```

---

# Final Rule

A redesign inherits responsibility for everyone who already relied on the old version.

The goal is not a product that looks new.

The goal is a product that measurably works better, reached by a path its existing users can walk without losing their footing.

If the redesign cannot be measured, it cannot be defended.

If it cannot be reversed, it should not be shipped.
