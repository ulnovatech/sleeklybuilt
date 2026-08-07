# Data Display System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Component Intelligence, Layout Intelligence, Typography System, Grid System, UX Intelligence

---

# Purpose

The Data Display System defines how information is presented, organized, compared, and understood inside products.

Data display is not about showing more information.

It is about helping users understand information quickly and make decisions confidently.

---

# Core Philosophy

Information density is not the goal.

Information clarity is the goal.

A great data interface answers:

- What matters?
- What changed?
- What requires attention?
- What action should happen next?

---

# Data Display Decision Pipeline

Every data display follows:

```
User Question

↓

Information Priority

↓

Data Type

↓

Display Pattern

↓

Interaction Design

↓

Responsive Adaptation

↓

Review
```

---

# Data Classification

Before choosing a component, classify the data.

---

# Single Value

Purpose:

Show one important number or status.

Examples:

- Revenue
- Orders
- Users
- Progress

Recommended:

- Statistic component
- Highlight block

---

# Comparison Data

Purpose:

Compare values.

Examples:

- Sales by month
- Product performance
- Rankings

Recommended:

- Tables
- Charts
- Comparison cards

---

# Sequential Data

Purpose:

Show events over time.

Examples:

- Activity
- History
- Tracking

Recommended:

- Timeline
- Activity feed

---

# Relational Data

Purpose:

Show relationships between items.

Examples:

- Customers and orders
- Projects and tasks

Recommended:

- Tables
- Linked views

---

# Content Data

Purpose:

Help discovery.

Examples:

- Products
- Articles
- Media

Recommended:

- Cards
- Lists
- Galleries

---

# Display Patterns

---

# Cards

Use for:

- summaries
- grouped information
- visual discovery

Avoid:

using cards for every piece of data.

---

# Lists

Use for:

- scanning
- repeated information
- quick comparison

Examples:

- notifications
- messages
- transactions

---

# Tables

Use when:

users need structured comparison.

Good for:

- dashboards
- admin tools
- analytics

---

# Table Rules

Tables require:

- clear headers
- alignment
- sorting where useful
- filtering when needed

Avoid:

too many columns.

---

# Mobile Tables

Never simply shrink desktop tables.

Adapt:

Desktop table

↓

Mobile:

- cards
- expandable rows
- horizontal scroll only when appropriate

---

# Statistics

Statistics should communicate meaning.

A good statistic includes:

Value

+

Context

+

Change

Example:

```
$12,400

Revenue

+18% this month
```

---

# Charts

Charts exist to answer questions.

Never add charts because dashboards usually contain charts.

---

# Chart Selection

---

# Line Chart

Use for:

change over time.

---

# Bar Chart

Use for:

comparison.

---

# Pie Chart

Use rarely.

Only when:

few categories and proportions matter.

---

# Area Chart

Use for:

trends with volume emphasis.

---

# Data Visualization Rules

Every chart requires:

- title
- context
- labels
- accessible explanation

---

# Filters

Filters help users reduce complexity.

Good filters are:

- visible when important
- easy to remove
- understandable

---

# Search + Filter Relationship

For large datasets:

Search finds.

Filters refine.

They should work together.

---

# Sorting

Sorting should reflect user needs.

Examples:

Newest

Highest value

Most relevant

Alphabetical

---

# Empty Data States

Every data view needs an empty state.

Include:

- explanation
- next action
- guidance

---

# Loading States

Data loading should preserve understanding.

Preferred:

Skeleton layouts.

Avoid:

blank screens.

---

# Error States

Data errors should explain:

What failed.

Why.

What the user can do.

---

# Density System

Different products need different data density.

---

# Consumer Apps

Priority:

Readability.

Large spacing.

Simple views.

---

# SaaS Applications

Priority:

Balance.

Efficient scanning.

Moderate density.

---

# Enterprise Systems

Priority:

Efficiency.

Higher information density.

Advanced controls.

---

# Mobile Data Display

Mobile prioritizes:

- essential information
- quick actions
- vertical scanning

Avoid:

desktop dashboards compressed into phones.

---

# Desktop Data Display

Desktop supports:

- multiple columns
- advanced comparison
- productivity workflows

---

# Data Display Accessibility

Requirements:

- readable text
- clear hierarchy
- non-color status indicators
- keyboard access
- screen reader support

---

# Data Display Anti-Patterns

Never create:

- meaningless dashboards
- excessive charts
- giant tables on mobile
- information overload
- decorative statistics
- unclear numbers without context

---

# Data Display Tokens

Example:

```
Table Row Height

56px


Card Padding

24px


Chart Spacing

32px


Statistic Number

36px


Data Text

14-16px
```

---

# Data Display System Output

Example:

```
Product

Business Analytics Dashboard

Primary Data

Revenue Metrics

Display

Statistics + Charts

Detailed Data

Table

Mobile

Cards

Filters

Date + Category

Loading

Skeleton

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Data answers user questions
- [ ] Important information is prioritized
- [ ] Display pattern matches purpose
- [ ] Mobile adaptation exists
- [ ] Charts have meaning
- [ ] Tables remain usable
- [ ] Accessibility is supported

---

# Final Rule

Data should never be displayed because it exists.

Data should be displayed because it helps someone understand, decide, or act.