# Navigation System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Navigation Intelligence, UX Intelligence, Mobile Intelligence, Component Intelligence, Design Tokens

---

# Purpose

The Navigation System defines reusable navigation patterns, structures, behaviors, and implementation rules across products.

Navigation creates the user's mental map.

A successful navigation system allows users to:

- understand where they are
- find important features quickly
- move between tasks efficiently
- maintain context

---

# Core Philosophy

Navigation should expose the right things at the right time.

Do not design navigation around the number of features.

Design navigation around:

- user goals
- frequency of use
- task importance
- information hierarchy

---

# Navigation Architecture

Every product navigation follows:

```
Product Structure

↓

Feature Priority

↓

Navigation Model

↓

Responsive Adaptation

↓

Interaction States

↓

Accessibility Review
```

---

# Navigation Layers

Every product should define four navigation layers.

---

# Primary Navigation

Most important destinations.

Characteristics:

- always available
- frequently used
- highest visibility

Examples:

- Home
- Dashboard
- Orders
- Messages

---

# Secondary Navigation

Supporting destinations.

Examples:

- Reports
- Categories
- Saved items
- Preferences

Visibility:

Accessible but less prominent.

---

# Contextual Navigation

Actions related to current content.

Examples:

- Edit
- Filter
- Sort
- Share
- Export

---

# Utility Navigation

Account and system functions.

Examples:

- Profile
- Settings
- Help
- Logout

---

# Mobile Navigation Patterns

---

# Bottom Navigation

Use when:

- 3–5 primary destinations exist
- users switch frequently

Structure:

```
Icon

Label
```

Rules:

- maximum 5 items
- active state required
- touch-friendly spacing

---

# Top Navigation

Use for:

- page identity
- back navigation
- contextual actions

Contains:

- title
- actions
- navigation controls

---

# Hamburger Menu

Use carefully.

Appropriate when:

- many destinations exist
- primary switching is uncommon

Avoid using it as a default solution.

---

# Tabs

Use when:

Destinations are equal and related.

Examples:

```
Overview

Activity

Settings
```

Do not use tabs for unrelated sections.

---

# Bottom Sheets

Use for:

- filters
- selections
- temporary actions

Advantages:

- preserves context
- mobile friendly
- thumb accessible

---

# Desktop Navigation Patterns

---

# Sidebar Navigation

Best for:

- dashboards
- SaaS
- enterprise tools

Structure:

```
Logo

Primary Links

Groups

Utilities
```

---

# Top Navigation

Best for:

- marketing websites
- simple products

Contains:

- brand
- main links
- CTA

---

# Command Navigation

Best for:

- expert applications

Supports:

- search
- shortcuts
- actions

---

# Navigation States

Every navigation component must define:

---

## Default

Normal state.

---

## Hover

Desktop interaction feedback.

---

## Active

Current location.

Must be obvious.

---

## Focus

Keyboard accessibility.

---

## Disabled

Unavailable destination.

---

## Loading

Temporary unavailable state.

---

# Navigation Labels

Labels must be:

- understandable
- user-focused
- consistent

Avoid:

internal terminology

developer language

unclear abbreviations

---

# Navigation Icons

Icons should:

- support recognition
- maintain consistency
- improve scanning

Never rely only on icons for unclear destinations.

---

# Navigation Transitions

Navigation changes should preserve orientation.

Examples:

Tab switch:

subtle transition

Page change:

directional movement

Drawer:

slide animation

---

# Navigation Persistence

Consider what should remain available.

Examples:

Shopping app:

Cart remains accessible.

CRM:

Search remains accessible.

Workspace:

Current project remains visible.

---

# Navigation and Search

For complex products:

Search becomes a navigation layer.

Support:

- suggestions
- recent items
- commands
- filtering

---

# Navigation Responsive Rules

Desktop:

```
Sidebar

↓

Mobile

Bottom Navigation
```

---

Desktop:

```
Multi-panel navigation

↓

Mobile

Progressive hierarchy
```

---

# Navigation Anti-Patterns

Never create:

- too many primary items
- hidden essential features
- inconsistent navigation placement
- unclear active states
- hamburger menus everywhere
- unnecessary nested menus
- different navigation logic per page

---

# Navigation Tokens

Example:

```
Navigation Height

64px


Mobile Bottom Bar

80px


Sidebar Width

240px


Active Indicator

Defined


Transition

300ms
```

---

# Navigation System Output

Example:

```
Product

Food Delivery App

Primary Navigation

Bottom Navigation


Items

Home

Search

Orders

Profile


Secondary

Settings


Desktop

Sidebar


Search

Global


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Primary destinations are obvious
- [ ] Navigation matches user frequency
- [ ] Mobile navigation is thumb-friendly
- [ ] Desktop navigation improves efficiency
- [ ] Active states are clear
- [ ] Keyboard access works
- [ ] Navigation does not overwhelm

---

# Final Rule

Navigation is not where features are placed.

Navigation is how users understand the product.

A great navigation system makes complex products feel simple.