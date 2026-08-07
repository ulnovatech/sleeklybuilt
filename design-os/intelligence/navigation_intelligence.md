# Navigation Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, Layout Intelligence, Mobile First, UX Intelligence

---

# Purpose

Navigation Intelligence determines how users move through a product.

Navigation is not a collection of menus.

Navigation is the user's mental map of the product.

A successful navigation system answers:

- Where am I?
- Where can I go?
- What can I do?
- How do I return?
- What is most important?

---

# Core Philosophy

Navigation should feel obvious.

Users should not study navigation.

They should simply move.

Good navigation reduces decision-making.

---

# Navigation Decision Pipeline

Every product follows:

```
Product Classification

↓

User Goals

↓

Information Architecture

↓

Feature Frequency

↓

Navigation Model

↓

Interaction Design

↓

Responsive Adaptation

↓

Navigation Review
```

---

# Step 1 — Understand User Frequency

Navigation decisions begin with usage frequency.

## Frequent Actions

Used many times per session.

Examples:

- Home
- Search
- Orders
- Dashboard
- Messages

Should be:

- visible
- persistent
- easy to access

---

## Occasional Actions

Used sometimes.

Examples:

- Profile
- Settings
- Reports

Should be:

- accessible
- secondary

---

## Rare Actions

Used rarely.

Examples:

- Advanced configuration
- Account management
- Developer settings

Should be:

- hidden until needed

---

# Step 2 — Understand Product Structure

Classify the product.

---

## Simple Product

Examples:

- Restaurant app
- Portfolio
- Small ecommerce

Recommended:

- Bottom navigation
- Tabs
- Simple menus

---

## Content Product

Examples:

- News
- Streaming
- Social

Recommended:

- Feed navigation
- Categories
- Search

---

## Productivity Product

Examples:

- CRM
- Project management
- Workspace

Recommended:

- Sidebar
- Command palette
- Keyboard shortcuts

---

## Complex Enterprise Product

Examples:

- ERP
- Analytics
- Admin systems

Recommended:

- Structured sidebar
- Nested navigation
- Search

---

# Mobile Navigation Systems

---

# Bottom Navigation

Best for:

- 3–5 primary destinations
- Frequent switching

Examples:

Home

Search

Orders

Profile

---

Rules:

Maximum:

5 items

Labels required unless icons are universally obvious.

---

# Top Navigation

Best for:

- simple products
- contextual actions

Contains:

- title
- actions
- back navigation

Avoid overcrowding.

---

# Hamburger Menu

Use carefully.

A hamburger hides important destinations.

Use only when:

- many destinations exist
- frequent switching is low
- alternatives are unsuitable

Never use by default.

---

# Tabs

Best for:

- related views
- same-level content

Examples:

Overview

Reviews

Specifications

---

Rules:

Tabs should represent equal categories.

Do not hide unrelated features inside tabs.

---

# Drawers

Best for:

- secondary navigation
- additional tools

Avoid putting primary actions inside drawers.

---

# Desktop Navigation

---

# Sidebar

Best for:

- dashboards
- SaaS
- enterprise tools

Should contain:

- primary destinations
- grouped sections
- clear hierarchy

---

# Command Palette

Best for:

- advanced products
- expert users

Examples:

Search actions

Open pages

Execute commands

---

# Breadcrumbs

Useful when:

- deep hierarchy exists
- users need location awareness

Avoid using breadcrumbs where hierarchy is shallow.

---

# Back Navigation

Back should behave predictably.

Users should always know:

- where they return
- whether they lose progress

---

# Navigation Labels

Labels must be:

- clear
- concise
- user language

Avoid:

internal company terminology

technical names

ambiguous labels

---

# Icons

Icons support navigation.

They do not replace understanding.

Rules:

- use consistent icon style
- maintain optical balance
- pair with labels when unclear

---

# Navigation Hierarchy

Every product should define:

## Primary Navigation

Most important destinations.

## Secondary Navigation

Supporting destinations.

## Contextual Navigation

Actions related to current content.

## Utility Navigation

Account, settings, help.

---

# Search as Navigation

Search is not only a feature.

For complex products, search becomes navigation.

Support:

- suggestions
- recent searches
- filters
- commands
- shortcuts

---

# Navigation States

Every navigation system must define:

Active

Selected destination.

Hover

Available interaction.

Focus

Keyboard location.

Disabled

Unavailable option.

Loading

Pending destination.

Error

Failed action.

---

# Mobile Navigation Rules

Mobile navigation must:

- respect thumb reach
- preserve context
- minimize taps
- avoid hidden critical actions

---

# Desktop Navigation Rules

Desktop navigation should:

- support efficiency
- expose structure
- reduce repeated searching
- support advanced workflows

---

# Navigation Anti-Patterns

Never create:

- too many menu items
- unclear labels
- hidden primary features
- random navigation positions
- inconsistent back behavior
- excessive dropdowns
- hamburger menus everywhere

---

# Navigation Intelligence Output

Example:

```
Product

Restaurant Ordering App

Primary Navigation

Bottom Navigation

Items

Home
Menu
Orders
Profile

Secondary Navigation

Account Settings

Search

Global Search

Desktop Adaptation

Top Navigation + Side Panel

Navigation Priority

Ordering Flow

Review

Pass
```

---

# Failure Conditions

Navigation fails when:

- Users cannot find core features.
- Important actions are hidden.
- Navigation changes unpredictably.
- Too many options compete.
- Mobile requires excessive tapping.
- Desktop becomes cluttered.

---

# Review Questions

Before approval:

- Can users find important features quickly?
- Is the primary workflow obvious?
- Are destinations prioritized correctly?
- Does navigation match usage frequency?
- Does mobile navigation feel natural?
- Does desktop improve productivity?

---

# Final Rule

The best navigation is not the one that exposes everything.

It is the one that exposes exactly what users need, exactly when they need it.