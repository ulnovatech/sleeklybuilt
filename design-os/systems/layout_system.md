# Layout System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Layout Intelligence, Spacing System, Grid System, Responsive Intelligence

---

# Purpose

The Layout System defines how content is composed on a screen.

It covers:

- containers and content boundaries
- section rhythm
- density
- visual and information hierarchy
- content priority
- choosing lists, cards, or master-detail
- mobile-first composition that expands cleanly

Column counts, gutters, and breakpoint column math belong to the Grid System.

This system decides how regions relate, what comes first, and how the page feels to use.

---

# Core Philosophy

Layout is composition, not decoration.

Never begin by arranging components.

Begin with:

```
User Goal

↓

Content Priority

↓

Hierarchy

↓

Regions

↓

Density

↓

Responsive Expansion
```

A beautiful component in a confused composition is still a poor interface.

---

# Layout Decision Pipeline

Every screen follows:

```
User Goal

↓

Primary Content

↓

Supporting Content

↓

Region Structure

↓

Density Choice

↓

Pattern Choice

↓

Mobile Composition

↓

Larger-Screen Expansion

↓

Review
```

---

# Containers And Boundaries

Containers create readable boundaries.

They answer:

- how wide can content grow?
- where does the page breathe?
- what stays edge-to-edge for atmosphere or immersion?

Use containers to protect reading and scanning.

Do not stretch text and dense controls across an entire ultrawide viewport.

Typical container roles:

```
Reading Container

Narrower width for forms, articles, settings


Working Container

Wider width for dashboards, catalogs, tools


Full-Bleed Region

Media, maps, heroes, atmospheric backgrounds
```

Container widths and page padding must stay consistent with the Grid System.

This system decides which regions need a reading container, a working container, or full bleed.

---

# Section Rhythm

Pages are sequences of sections, not piles of blocks.

Every section should have:

```
One Purpose

↓

One Headline

↓

Supporting Content

↓

Optional Action
```

Rhythm comes from:

- predictable vertical spacing between sections
- consistent inset padding inside regions
- clear separation between primary and secondary bands

Avoid:

- random section heights
- alternating card shells with no interaction need
- multiple competing headlines in one band

Spacing values come from the Spacing System.

Rhythm decisions come from content priority.

---

# Hierarchy

Hierarchy tells the user what matters first.

Establish hierarchy through:

- position
- scale
- contrast
- proximity
- isolation

Primary content should be discoverable without hunting.

Supporting content should remain available without competing.

Ask of every screen:

```
What is the first thing to understand?

What is the first useful action?

What can wait below or aside?
```

If everything is emphasized, nothing is.

---

# Content Priority

Mobile forces priority. Desktop must not abandon it.

Classify content as:

```
Essential

Useful

Optional
```

Essential:

Must appear for the primary goal.

Useful:

Improves confidence or speed once the goal is clear.

Optional:

Can collapse, move aside, or appear on demand.

Composition order follows priority, not ownership politics inside the company.

---

# Density

Density is a product decision.

```
Comfortable

Clear breathing room

Best for consumer, marketing, onboarding


Standard

Balanced scanning and action

Best for most productivity products


Compact

Higher information per viewport

Best for expert tools, admin tables, trading-like workflows
```

Rules:

- choose one primary density per product surface
- do not mix comfortable marketing density with compact admin density in the same region without intention
- compact never means cramped touch targets
- comfortable never means sparse to the point of lost relationships

Density affects spacing, control size, and how many competing regions appear at once.

---

# Composition Patterns

Choose structure from the job to be done.

---

# Single Stream

Best for:

- reading
- onboarding
- simple forms
- mobile task flows

Structure:

```
Header

↓

Primary Content

↓

Action
```

---

# Split Primary / Support

Best for:

- detail pages with context
- settings with help
- checkout with summary

Structure:

```
Primary Task | Supporting Context
```

On mobile:

Stack primary first, support second.

---

# Master Detail

Best for:

- inboxes
- order lists
- file browsers
- customer records

Structure:

```
List Of Items | Selected Item Detail
```

Rules:

- selection state must be obvious
- empty detail needs guidance
- mobile usually navigates list → detail as separate screens or layered views

---

# Workspace

Best for:

- design tools
- developer tools
- advanced admin

Structure:

```
Navigation | Canvas Or Table | Inspector
```

Rules:

- one region owns the primary task
- inspectors support, they do not compete
- collapse secondary regions on small screens

---

# Dashboard Composition

Best for:

- overview monitoring
- operational snapshots

Rules:

- lead with the decision the user must make
- group widgets by question, not by data source ownership
- isolate failed regions without collapsing the whole page

Grid placement details belong to the Grid System and Data Display System.

---

# Lists Versus Cards Versus Tables

Choose the container that matches the decision.

---

# Lists

Use when:

- scanning many similar items
- comparing one primary text field quickly
- opening a detail is the next step

Lists emphasize sequence and selection.

---

# Cards

Use when:

- the item is a unit of interaction
- users compare a small set of attributes visually
- grouping actions with an object improves understanding

Cards are not a default skin.

If removing border, shadow, background, or radius does not hurt interaction or understanding, it should not be a card.

Never use cards in a hero as decorative packaging.

---

# Tables

Use when:

- users compare many attributes across many rows
- sorting, filtering, and bulk actions are central
- density and alignment matter more than imagery

Tables are tools.

They are not a substitute for a simple list when only one attribute matters.

---

# Master Detail Versus Standalone Pages

Use master detail when:

- users repeatedly move between items in one session
- preserving list context speeds work

Use standalone pages when:

- the detail is deep
- the task is immersive
- mobile constraints make split views unusable

---

# Mobile-First Composition

Design the essential experience under mobile constraint first.

```
Essential Content

↓

Primary Action

↓

Secondary Content

↓

Optional Content
```

Mobile rules:

- vertical flow by default
- one primary action per viewport whenever possible
- no desktop multi-column assumptions forced into a narrow stack
- touch spacing preserved even in compact products

Then expand.

---

# Expanding To Larger Screens

Larger screens earn more visibility, not larger empty gaps.

Add:

- supporting panels
- persistent navigation
- multi-column comparison
- denser data when the user can absorb it

Do not merely:

- enlarge type
- enlarge cards
- add decorative columns

Responsive Intelligence decides adaptation strategy.

Grid System implements column behavior.

Layout System decides which regions appear, merge, or defer.

---

# Alignment And Relationships

Even without counting columns, composition must feel aligned.

Relate elements through:

- shared edges
- consistent section insets
- repeated module widths
- intentional proximity for related actions

Avoid:

- orphaned actions floating without context
- headings that do not align with the content they introduce
- equal visual weight for unequal importance

---

# Atmosphere Versus Structure

Marketing and branded surfaces may use atmosphere:

- gradients
- imagery
- textured grounds

Structure still applies.

Atmosphere supports hierarchy.

It does not excuse unclear priority, weak branding placement, or card clutter.

For landing and promotional surfaces, follow the product's visual rules and Landing Page Intelligence when relevant.

---

# Layout And Navigation

Navigation is part of composition.

Decide:

- what stays persistent
- what yields space to content
- how the primary task remains reachable

Do not let navigation consume the hierarchy of the page's actual job.

Navigation System owns navigation behavior.

Layout System owns how navigation and content share the viewport.

---

# States Inside Layout

Regions must reserve space for:

- loading
- empty
- error

A layout that only works when every region is full is incomplete.

Keep page chrome stable while content regions change state.

Consult:

Empty States System

Loading States System

Error States System

---

# Accessibility

Composition must support:

- logical reading order
- visible focus paths
- sufficient spacing for touch and pointer
- headings that reflect hierarchy
- no information conveyed only by position that disappears when reflowed

Reflow should preserve meaning when columns stack.

---

# Layout Anti-Patterns

Never create:

- desktop-first layouts compressed into mobile
- equal-weight regions with no priority
- card grids used as decoration
- endless full-width stretches of dense text
- competing primary actions in one viewport
- master-detail patterns that strand users with blank detail panes
- dashboards that are warehouses of widgets with no question order
- spacing rhythm that changes randomly per section
- column theater that ignores content needs

---

# Layout System Output

Example:

```
Product

SaaS Project Tool

Surface

Project List + Detail

Composition

Master Detail

Density

Standard

Mobile

List screen → Detail screen

Desktop

List 1/3 | Detail 2/3

Container

Working container, 1200px max

Priority

Project name, status, primary action first

States

Empty list, loading list, detail error isolated

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] User goal is obvious from composition
- [ ] Content priority is intentional
- [ ] Hierarchy is clear at first glance
- [ ] Section rhythm is consistent
- [ ] Density matches the product surface
- [ ] Lists, cards, and tables are chosen for the decision type
- [ ] Mobile composition stands alone
- [ ] Larger screens expand usefully, not emptily
- [ ] Containers protect readability
- [ ] Column mechanics are deferred to the Grid System
- [ ] Loading, empty, and error regions are accounted for

---

# Final Rule

Layout is the quiet authority of an interface.

When composition is right, users know where to look and what to do next before they notice any individual component.

Build that clarity first.

Let the Grid System carry the math underneath.
