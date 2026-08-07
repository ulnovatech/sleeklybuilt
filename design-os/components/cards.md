# Card Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Core Content Organization Component

---

# Purpose

The Card System defines how grouped information, actions, previews, and content summaries are presented across products.

Cards create:

* visual grouping
* content hierarchy
* scanning efficiency
* modular layouts

Cards should organize information, not become containers for everything.

---

# Core Principle

A card should represent one meaningful unit.

Every card should answer:

```text
What information belongs together?

Why does this need separation?

What action should the user take?
```

---

# Card Architecture

```text
Content Purpose

↓

Card Structure

↓

Visual Hierarchy

↓

Interaction Pattern

↓

Responsive Behavior
```

---

# Card Anatomy

A card may contain:

```text
Header

↓

Primary Content

↓

Supporting Information

↓

Actions
```

Not every card requires every section.

---

# Card Types

## Information Card

Purpose:

Display summarized information.

Examples:

* profile summary
* feature overview
* account details

Characteristics:

* readable
* low interaction

---

## Action Card

Purpose:

Guide users toward a task.

Examples:

* onboarding step
* upgrade prompt
* setup action

Requirements:

* clear action
* strong hierarchy

---

## Product Card

Purpose:

Display purchasable or discoverable items.

Examples:

* ecommerce products
* marketplace listings

Should contain:

* image
* title
* key details
* price/status
* action

---

## Dashboard Card

Purpose:

Display metrics or data.

Examples:

* revenue
* analytics
* activity

Requirements:

* quick scanning
* meaningful context

---

## Content Card

Purpose:

Display articles, media, or updates.

Examples:

* blog posts
* videos
* news

---

# Card Variants

The system may include:

```text
Default Card

Elevated Card

Outlined Card

Interactive Card

Featured Card
```

Variants should be limited.

---

# Card Hierarchy

Cards should communicate importance.

Example:

```text
Featured Card

↓

Primary Cards

↓

Supporting Cards
```

Avoid making every card equally prominent.

---

# Card Spacing

Cards require:

* internal padding
* content separation
* consistent rhythm

Avoid:

* cramped content
* excessive empty space

---

# Card Interaction Rules

## Static Cards

Used for:

* information display

Should not pretend to be clickable.

---

## Interactive Cards

Used when the entire card represents an action.

Requirements:

* hover state
* focus state
* clear affordance

---

## Card Actions

Actions should be:

* predictable
* close to relevant content

Avoid:

* hidden actions
* unclear icons

---

# Card Media Rules

Images should:

* support understanding
* maintain consistent ratios
* load efficiently

Avoid:

* decorative images that add no value

---

# Card Responsive Behavior

Desktop:

* multiple cards may appear in grids

Mobile:

* cards usually stack vertically

Adapt:

* content order
* actions
* spacing

Do not simply shrink desktop cards.

---

# Card Accessibility

Interactive cards require:

* keyboard access
* visible focus
* semantic structure

Avoid:

* clickable divs without accessibility support

---

# Card Usage By Product Type

## SaaS

Use for:

* workflows
* metrics
* features

---

## Ecommerce

Use for:

* products
* categories
* recommendations

---

## Dashboards

Use for:

* information summaries
* analytics widgets

---

## Landing Pages

Use for:

* benefits
* testimonials
* feature explanations

---

# Card Anti-Patterns

Reject:

* using cards for every section
* excessive borders/shadows
* unclear click behavior
* overcrowded content
* cards without hierarchy

---

# Card Review Questions

Before approval:

```text
Does this content need a card?

Is the purpose clear?

Is the hierarchy obvious?

Are interactions understandable?

Does it work responsively?

Is it accessible?
```

---

# Final Rule

Cards are organizational tools.

A great card makes information easier to understand without adding unnecessary visual complexity.
