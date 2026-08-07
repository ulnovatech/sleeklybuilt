# Chart Component System

**Version:** 1.0
**Status:** Component Design Layer
**Priority:** Data Visualization Component

---

# Purpose

The Chart Component System defines how numerical information, trends, relationships, and patterns are visualized across products.

Charts exist to help users:

* understand change
* compare values
* identify patterns
* discover insights
* make decisions

Charts should simplify information, not decorate screens.

---

# Core Principle

A chart must earn its place.

Before creating any chart, define:

```text
What question does this answer?

What pattern should the user notice?

Is visualization better than text or a table?
```

---

# Chart Architecture

```text
Data Meaning

↓

Visualization Choice

↓

Chart Structure

↓

Interaction Model

↓

User Insight
```

---

# Chart Types

## Line Chart

Purpose:

Show change over time.

Best for:

* trends
* growth
* decline
* historical comparison

Examples:

* revenue over months
* user growth
* performance tracking

---

## Bar Chart

Purpose:

Compare discrete values.

Best for:

* categories
* rankings
* comparisons

Examples:

* sales by product
* users by region

---

## Area Chart

Purpose:

Show magnitude and trends.

Best for:

* cumulative changes
* volume over time

Use carefully when multiple areas overlap.

---

## Pie / Donut Chart

Purpose:

Show simple proportions.

Use only when:

* few categories exist
* comparison is simple

Avoid:

* many segments
* precise comparisons

---

## Scatter Chart

Purpose:

Show relationships between values.

Best for:

* correlations
* distributions

---

## Heatmap

Purpose:

Show intensity patterns.

Examples:

* activity levels
* performance matrices

---

# Chart Anatomy

A chart may contain:

```text
Title

↓

Description

↓

Visualization

↓

Legend

↓

Controls

↓

Supporting Data
```

---

# Chart Titles

Titles should explain meaning.

Good:

```text
Monthly Revenue Growth
```

Weak:

```text
Revenue
```

when context is unclear.

---

# Axis System

Axes should:

* provide context
* use understandable units
* avoid unnecessary complexity

Avoid:

* misleading scales
* hidden values

---

# Legend System

Legends should:

* explain categories
* remain easy to scan

Avoid:

* unnecessary legends
* requiring constant lookup

---

# Data Labels

Use labels when:

* exact values matter
* few data points exist

Avoid:

* overcrowding charts

---

# Chart Interaction

Possible interactions:

```text
Hover Details

Filtering

Zooming

Changing Time Range

Comparing Data

Drilling Down
```

Only add interactions that improve understanding.

---

# Dashboard Chart Rules

Charts inside dashboards should:

* support decisions
* remain readable quickly
* connect to actions

Avoid:

* decorative analytics

---

# Chart States

Every chart requires:

```text
Loading

Empty

Error

Success

Partial Data
```

---

# Loading Charts

Preferred:

* skeleton chart areas
* preserved dimensions

Avoid:

* layout shifting

---

# Empty Charts

Should explain:

* why data is unavailable
* how to create data
* what happens next

---

# Error Charts

Should provide:

* explanation
* retry option
* recovery path

---

# Responsive Charts

Desktop:

* larger visualizations
* detailed controls

Mobile:

* simplified views
* scrollable charts where needed
* reduced labels

Avoid:

* shrinking unreadable charts

---

# Accessibility Requirements

Charts must support:

* alternative summaries
* readable labels
* keyboard access where interactive
* sufficient contrast

Never communicate information through color alone.

---

# Chart Performance

Optimize:

* rendering speed
* large datasets
* animation usage

Use:

* data aggregation
* lazy rendering
* efficient updates

---

# Chart Animation Rules

Animation should:

* explain change
* guide attention

Avoid:

* distracting movement
* unnecessary transitions

---

# Chart Anti-Patterns

Reject:

* charts without purpose
* too many visualizations
* misleading scales
* unreadable labels
* decorative dashboards
* inaccessible data

---

# Chart Review Questions

Before approval:

```text
Does the chart answer a question?

Is the chart type appropriate?

Can users understand it quickly?

Are interactions useful?

Are states handled?

Is accessibility supported?
```

---

# Final Rule

Charts are tools for understanding.

A great chart does not display data.

It reveals meaning.
