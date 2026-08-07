# List Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Core Content Organization Component

---

# Purpose

The List Component System defines how collections of related items are displayed, organized, and interacted with across products.

Lists are designed for:

* scanning information
* browsing collections
* displaying activity
* organizing sequential content

A strong list system creates:

* clarity
* rhythm
* hierarchy
* efficient information consumption

---

# Core Principle

A list should make relationships between items obvious.

Every list should answer:

```text id="m7q4vx"
What are these items?

How are they related?

What can the user do with them?
```

---

# List Architecture

```text
Collection

↓

List Structure

↓

List Item

↓

Item Content

↓

Available Actions
```

---

# List Anatomy

A list consists of:

```text
List Container

↓

List Header (Optional)

↓

List Items

↓

Item Actions

↓

Pagination Or Loading
```

---

# List Types

## Simple List

Purpose:

Display basic information.

Examples:

* settings options
* menu items
* contacts

Characteristics:

* minimal content
* quick scanning

---

## Content List

Purpose:

Display richer items.

Examples:

* articles
* messages
* notifications

May contain:

* image
* title
* description
* metadata
* actions

---

## Activity List

Purpose:

Show chronological events.

Examples:

* user activity
* system logs
* notifications

Requires:

* timestamps
* event hierarchy

---

## Selection List

Purpose:

Allow users to choose items.

Examples:

* choosing users
* selecting products
* assigning categories

Requires:

* selection states
* clear interaction

---

## Nested List

Purpose:

Represent hierarchy.

Examples:

* file systems
* categories
* navigation structures

Requirements:

* expansion states
* indentation rules

---

# List Item System

Every list item should define:

```text
Primary Content

↓

Supporting Content

↓

Actions
```

---

# Primary Content

Contains the most important information.

Examples:

* name
* title
* status

Should receive highest visual priority.

---

# Supporting Content

Provides context.

Examples:

* description
* date
* category
* metadata

Should not overpower primary content.

---

# Item Actions

Actions should be:

* predictable
* close to the relevant item

Examples:

* edit
* delete
* open
* share

---

# List Density

## Comfortable Density

Used for:

* customer-facing experiences
* mobile applications

Characteristics:

* more spacing
* easier scanning

---

## Compact Density

Used for:

* dashboards
* professional tools

Characteristics:

* more information
* faster workflows

---

# List Spacing System

Maintain:

* consistent item height
* predictable padding
* clear separation

Avoid:

* uneven spacing between items

---

# List States

Every list requires:

```text
Loading

Empty

Error

Success

Partial Content
```

---

# Loading Lists

Preferred:

* skeleton items
* preserved structure

Avoid:

* blank containers

---

# Empty Lists

Should explain:

```text
Why it is empty

What action creates content

What happens next
```

---

# Error Lists

Should provide:

* explanation
* retry option
* recovery path

---

# List Interactions

Lists may support:

* selection
* sorting
* filtering
* swipe actions
* drag and drop

Only add interactions that support user goals.

---

# Swipe Actions

Useful on mobile for:

* quick actions

Examples:

* archive
* delete
* mark complete

Requirements:

* discoverable
* alternative action available

---

# Drag And Drop Lists

Used for:

* ordering
* prioritization
* organization

Requirements:

* clear drag indicator
* keyboard alternative

---

# Responsive List Rules

Desktop:

* wider content
* optional columns

Mobile:

* stacked content
* simplified actions
* touch-friendly targets

Avoid:

* shrinking desktop lists onto mobile

---

# List Accessibility

Requirements:

* semantic structure
* keyboard navigation
* clear focus states
* screen reader support

Selection lists require:

* announced selection state

---

# List Performance

For large collections:

Use:

* virtualization
* pagination
* lazy loading

Avoid:

* loading unnecessary items

---

# List Anti-Patterns

Reject:

* inconsistent item layouts
* unclear hierarchy
* too many actions
* hidden states
* excessive decoration
* poor mobile adaptation

---

# List Review Questions

Before approval:

```text
Is a list the right pattern?

Are items easy to scan?

Is hierarchy clear?

Are actions understandable?

Are states complete?

Does it work across devices?

Is it accessible?
```

---

# Final Rule

Lists organize complexity into understandable units.

A great list helps users scan, compare, and act without unnecessary effort.
