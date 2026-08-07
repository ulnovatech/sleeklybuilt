# Component Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Design Constitution, Layout Intelligence, Typography Intelligence, Navigation Intelligence

---

# Purpose

Component Intelligence determines which interface components should exist, when they should be used, and how they should behave.

Components are not decoration.

They are reusable solutions to repeated user problems.

A component library without intelligence creates generic interfaces.

A component system guided by intelligence creates products.

---

# Core Philosophy

Never ask:

"What components do we have?"

Ask:

"What problem does the user need solved?"

The component is the answer.

---

# Component Decision Pipeline

Every component decision follows:

```
User Goal

↓

Information Need

↓

Interaction Type

↓

Complexity Level

↓

Component Selection

↓

Responsive Behavior

↓

Accessibility Review

↓

Reuse Evaluation
```

---

# Component Categories

Design OS organizes components into functional categories.

---

# Action Components

Used when users need to perform actions.

Examples:

- Buttons
- Icon buttons
- Floating action buttons
- Menus
- Dropdown actions

---

# Input Components

Used for collecting information.

Examples:

- Text fields
- Select inputs
- Search
- Date pickers
- Toggles
- Checkboxes
- Radio groups

---

# Navigation Components

Used for movement.

Examples:

- Bottom navigation
- Sidebar
- Tabs
- Breadcrumbs
- Pagination
- Step navigation

---

# Information Components

Used for displaying information.

Examples:

- Cards
- Lists
- Tables
- Badges
- Avatars
- Statistics
- Timeline

---

# Feedback Components

Used for communicating system state.

Examples:

- Toasts
- Alerts
- Dialogs
- Progress indicators
- Skeleton loaders
- Empty states

---

# Content Components

Used for presenting content.

Examples:

- Articles
- Media blocks
- Product displays
- Galleries
- Hero sections

---

# Component Selection Rules

---

# Buttons

Use buttons for:

Actions.

Do not use buttons for navigation.

---

Primary Button:

One main action.

---

Secondary Button:

Supporting action.

---

Danger Button:

Destructive actions.

---

Never:

Create multiple competing primary buttons.

---

# Cards

Cards are containers, not default layouts.

Use when:

- information belongs together
- separation improves scanning
- grouping helps understanding

Avoid when:

- a list is enough
- every item becomes a floating box
- shadows create unnecessary noise

---

# Lists

Prefer lists when users need:

- scanning
- comparison
- repeated information

Examples:

Orders

Messages

Settings

Search results

Lists often outperform cards.

---

# Forms

Forms should:

- minimize effort
- group related information
- provide guidance
- validate clearly

Avoid:

- unnecessary fields
- confusing ordering
- hidden requirements

---

# Modals

Use only for:

- important decisions
- focused tasks
- temporary interruptions

Avoid using modals for:

- normal navigation
- large workflows
- complex pages

---

# Bottom Sheets

Preferred on mobile for:

- selections
- filters
- actions
- additional details

They preserve context.

---

# Tables

Use tables when:

Users compare structured data.

Do not use tables for:

Mobile-first experiences without adaptation.

---

# Data Visualization

Charts must answer questions.

Never add charts because dashboards are expected to have them.

Every chart should answer:

"What decision does this help users make?"

---

# Search Components

Search should adapt to complexity.

Simple:

Search field.

Advanced:

Suggestions

Filters

Commands

History

---

# Empty States

Every component that can become empty needs:

- explanation
- guidance
- next action

---

# Loading Components

Choose loading based on context.

Use:

Skeletons

When structure is predictable.

Progress

When completion matters.

Optimistic UI

When action can happen immediately.

---

# Component Composition

Components should combine naturally.

Example:

Product Card

=

Image

+

Title

+

Price

+

Action

+

Metadata

Not:

Random decoration.

---

# Component States

Every component must define:

Default

Hover

Active

Focus

Disabled

Loading

Error

Success

Empty

---

# Responsive Behavior

Every component must define:

Mobile behavior.

Examples:

Desktop table

→

Mobile list

---

Desktop sidebar

→

Mobile navigation

---

Large card

→

Compact card

---

# Component Consistency

Never create one-off components without reason.

If a pattern appears three times,

consider creating a reusable component.

---

# Accessibility Requirements

Every component must support:

- keyboard interaction
- screen readers
- focus states
- sufficient contrast
- touch targets

---

# Component Anti-Patterns

Never create:

- giant component libraries with unused parts
- random card variations
- multiple button styles
- inconsistent inputs
- decorative components without purpose
- components copied without understanding

---

# Component Intelligence Output

Example:

```
Product

CRM Dashboard

Required Components

Navigation

Sidebar

Data Display

Table

Filters

Search + Dropdown

Actions

Primary Button

Feedback

Toast + Confirmation Dialog

Loading

Skeleton Table

Mobile Adaptation

Table → List

Review

Pass
```

---

# Component Review Questions

Before approval:

- Does this component solve a real problem?
- Is it reusable?
- Is it accessible?
- Does it behave consistently?
- Does mobile adaptation exist?
- Does it reduce complexity?

---

# Final Rule

A great component library does not create more components.

It creates fewer, better, smarter components that solve real user problems repeatedly.

Components are the vocabulary.

User goals are the language.