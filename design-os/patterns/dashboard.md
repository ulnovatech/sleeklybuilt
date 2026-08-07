# Dashboard Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Dashboard Intelligence, Layout Intelligence, Data Display System, Charts Component, Cards Component, Navigation System

---

# Purpose

The Dashboard Pattern defines the complete solution for screens whose job is to answer a question about the current state of something.

A dashboard is not a place to display data.

A dashboard is a place where someone decides whether to act.

If a user leaves a dashboard without knowing whether anything needs their attention, the dashboard failed regardless of how much data it showed.

---

# When To Use

Use this pattern when:

- users need to monitor an ongoing system
- status changes over time and matters
- multiple metrics must be compared
- action follows from observation

---

# When Not To Use

Do not use this pattern when:

- the user needs to find one specific record — use Search
- the user needs to work through a queue — use a List or Kanban pattern
- there is only one metric — use a status page or a card on an existing screen
- the data never changes — use a report

The most common product mistake is building a dashboard as a landing screen because nobody decided what the landing screen should do.

---

# User Goal

The primary goal is always one of three:

```
Is everything normal?

↓

What changed?

↓

What do I do about it?
```

A dashboard must answer the first question in under three seconds without scrolling.

---

# User Journey

```
Arrives with a question

↓

Scans headline status

↓

Detects anomaly or confirms normal

↓

Drills into the anomaly

↓

Understands cause

↓

Takes action or delegates

↓

Returns to confirm resolution
```

The final step is the one products forget.

A dashboard that cannot confirm a fix forces users to trust their memory.

---

# UX Flow

## Entry

The user arrives from:

- a bookmark or app launch, checking routine status
- an alert or notification, investigating a specific event
- a report link, verifying a number

Each entry has a different urgency.

The alert path must land the user on the relevant item, not the top of the dashboard.

---

## Scan

Within the first viewport, the user must be able to determine:

- overall health
- what deviated
- how recent the data is

---

## Drill

Every metric must be traceable to its records.

```
Metric

↓

Breakdown

↓

Records

↓

Single Record
```

A number the user cannot click is a number the user cannot verify.

Numbers that cannot be verified are eventually ignored.

---

## Act

The dashboard surfaces the action, it does not merely report the need for one.

If a metric indicates a problem, the fix must be reachable from the metric.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Header                   │
│ Title · Time range       │
├──────────────────────────┤
│ ATTENTION BANNER         │
│ only when action needed  │
├──────────────────────────┤
│ Primary metric           │
│ large value + delta      │
├──────────────────────────┤
│ Supporting metric        │
├──────────────────────────┤
│ Supporting metric        │
├──────────────────────────┤
│ Trend chart              │
│ single series            │
├──────────────────────────┤
│ Recent activity          │
│ 5 items + View all       │
├──────────────────────────┤
│ Secondary sections       │
│ collapsed by default     │
└──────────────────────────┘
│ Bottom navigation        │
└──────────────────────────┘
```

Mobile rules:

- One metric per row. Two only if both values are short.
- One chart above the fold, maximum.
- Charts are single-series. Multi-series legends are unreadable at this width.
- Time range control is sticky or in the header, never buried.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Header · Title · Range · Actions           │
├────────────────────────────────────────────┤
│ ATTENTION BANNER                           │
├─────────────────┬──────────────────────────┤
│ Metric          │ Metric                   │
├─────────────────┼──────────────────────────┤
│ Metric          │ Metric                   │
├─────────────────┴──────────────────────────┤
│ Primary chart                              │
├─────────────────┬──────────────────────────┤
│ Breakdown       │ Recent activity          │
└─────────────────┴──────────────────────────┘
```

---

## Desktop

```
┌──────┬─────────────────────────────────────────────────┐
│      │ Header · Title · Range · Compare · Export       │
│ Nav  ├─────────────────────────────────────────────────┤
│      │ ATTENTION BANNER                                │
│      ├────────┬────────┬────────┬─────────────────────┤
│      │ Metric │ Metric │ Metric │ Metric              │
│      ├────────┴────────┴────────┴─────────────────────┤
│      │ Primary chart                    │ Breakdown   │
│      │                                  │ ranked list │
│      ├──────────────────────────────────┴─────────────┤
│      │ Detail table · sortable · filterable           │
└──────┴─────────────────────────────────────────────────┘
```

Desktop rules:

- Additional space buys context and comparison, not more metrics.
- Four metric cards is the practical ceiling for one row.
- The detail table is the drill-down destination, so it belongs on the same screen when space allows.

---

# Component Hierarchy

```
DashboardPage
├── PageHeader
│   ├── Title
│   ├── TimeRangeSelector
│   ├── CompareToggle
│   └── ExportAction
├── AttentionBanner            conditional
├── MetricGrid
│   └── MetricCard  ×n
│       ├── Label
│       ├── Value
│       ├── DeltaIndicator
│       ├── Sparkline          optional
│       └── DrillAction
├── ChartSection
│   ├── ChartHeader
│   │   ├── Title
│   │   └── SeriesToggle
│   ├── Chart
│   ├── ChartLegend
│   └── ChartEmptyState
├── BreakdownPanel
│   └── RankedList
│       └── RankedListRow
├── ActivityFeed
│   ├── ActivityItem ×5
│   └── ViewAllAction
└── DetailTable
    ├── TableToolbar
    ├── Table
    └── TablePagination
```

Reuse rules:

- `MetricCard` is a single component with variants. Never a per-metric component.
- Charts consume the shared chart wrapper so loading, empty, and error behavior stay identical.
- The detail table is the product's standard table, not a dashboard-specific one.

---

# Interaction Flow

Every interaction resolves:

```
Action

↓

Immediate feedback

↓

Result

↓

New state is understandable
```

## Time Range Change

1. Control updates immediately.
2. Affected regions show loading, others stay stable.
3. Values animate to new numbers, or replace without animation if the change is large.
4. The range is written to the URL so the view is shareable.

Never reload the whole page for a range change.

## Metric Drill

1. Metric shows pressed state.
2. Destination opens with the metric's filters already applied.
3. The user can see which filters carried over.
4. Back returns to the dashboard with scroll position and range preserved.

## Refresh

Automatic refresh must never move content under the cursor.

Pattern:

- Fetch in the background.
- If values changed, show a quiet "Updated just now" indicator.
- If the user is mid-interaction, defer the swap until the interaction ends.

---

# States

Every region owns its own states. A single failing widget must not blank the page.

## Loading — First Visit

Skeletons that match final layout dimensions.

```
Metric card    → label bar + value bar + delta bar
Chart          → axis frame + shimmer plot area
Table          → 5 skeleton rows
```

No spinners for regions with known shape.

Layout must not shift when real content arrives.

---

## Loading — Refresh

Keep previous values visible.

Dim to 60% or show a thin progress line at the region edge.

Never replace known-good data with a skeleton.

---

## Empty — No Data Yet

This is the state of a new account, and it decides whether the user continues.

Required content:

- what this dashboard will show
- why it is empty
- the one action that produces data
- expected time until data appears

```
┌──────────────────────────────┐
│         [illustration]       │
│                              │
│  No activity yet             │
│                              │
│  Metrics appear here once    │
│  your first order is placed. │
│                              │
│  [ Create test order ]       │
│  How this works              │
└──────────────────────────────┘
```

Never show a dashboard of zeros. Zeros read as a broken product.

---

## Empty — No Data For This Filter

Different from having no data at all.

Required:

- state which filter excluded everything
- offer to clear it
- offer the nearest range that has data

```
No results between Mar 1 and Mar 7.

[ Clear filters ]   [ Try last 30 days ]
```

---

## Error — Region Failed

The region shows the failure. The page keeps working.

Required:

- plain description of what is unavailable
- retry for that region only
- last successful timestamp when known

```
┌──────────────────────────────┐
│ ⚠  Revenue unavailable       │
│    Last updated 14:02        │
│    [ Retry ]                 │
└──────────────────────────────┘
```

---

## Error — Page Failed

Only when nothing can load.

Required: cause, retry, and a route to support with a reference identifier.

---

## Partial Data

The most dishonest dashboards are the ones that hide incompleteness.

When a source is degraded or a range is incomplete, label it:

```
Revenue   $12,480 *
* Excludes 2 regions still reporting
```

---

## Stale Data

Always show data age when data can be stale.

Beyond a defined threshold, escalate from passive timestamp to explicit warning.

---

## Permission-Limited

When a user may see the dashboard but not every metric, hide the metric and say so once.

Never render a metric card containing a lock icon and no value. That teaches users the product is broken.

---

## Success

Actions taken from the dashboard confirm inline, near the origin of the action, and the affected metric updates.

---

# Mobile Behavior

- Touch targets minimum 44×44.
- Charts respond to tap, not hover. Tap reveals a value tooltip that dismisses on outside tap.
- Horizontal scroll is allowed for tables and only tables, with a visible edge affordance.
- Pull to refresh is expected on mobile web and native.
- Never require pinch zoom to read a value.
- Reduce series, not font size.

---

# Desktop Expansion

Added space is spent on:

- comparison against a previous period
- breakdown adjacent to the trend that caused it
- the drill-down table in place, removing a navigation step
- keyboard shortcuts for range switching

Added space is never spent on:

- more metrics per row
- decorative charts
- widgets nobody requested

---

# Accessibility Requirements

- Every chart has an accessible text alternative stating trend and current value.
- Every chart's data is reachable as a table.
- Delta direction is conveyed by icon and text, never color alone.
- Metric cards are single tab stops with a clear accessible name including value and delta.
- Live regions announce refresh completion politely, never assertively.
- Time range control is fully keyboard operable.
- Respect reduced motion: numbers replace instead of counting up, charts appear instead of drawing.
- Zoom to 200% must not break the metric grid.

---

# Data Requirements

Before implementation, confirm for every metric:

```
Source of truth

Refresh frequency

Aggregation window

Timezone basis

Rounding rule

Definition of the delta comparison period

Behavior when the source is unavailable

Who is permitted to see it
```

A metric without a written definition will be interpreted differently by every viewer, and the dashboard will lose credibility the first time two people disagree about a number.

Never display a computed metric whose definition is unresolved.

---

# Performance Requirements

- First meaningful metric visible under one second on a warm cache.
- Metrics and charts load independently and progressively.
- Chart libraries load only for charts actually rendered.
- Aggregation happens server-side. The client never receives raw rows to sum.
- Refresh requests are cancelled when the range changes again.

---

# Anti-Patterns

Never build:

- a wall of metric cards with no stated priority
- charts that display data nobody acts on
- a dashboard as the default post-login screen with no defined question
- rainbow charts with more than six series
- vanity metrics that only ever increase
- automatic refresh that shifts content while reading
- numbers with no drill path
- gauges and donuts where a number would be clearer
- a dashboard of zeros for new accounts
- the same metric defined differently in two places

---

# Pattern Output Example

```
Product

Logistics Operations Platform


Primary Question

Are any shipments at risk today?


Layout

Attention banner + 4 metrics + trend + ranked delays + detail table


Primary Metric

Shipments at risk


Delta Basis

Same weekday, previous week


Drill Path

At risk → by route → shipment list → shipment


Refresh

Background, 60s, deferred during interaction


Mobile

Single column, one chart, single-series


Empty State

Pre-first-shipment guidance with setup action


Degraded Source

Metric labeled incomplete, page functional


Accessibility

Chart alternatives, greyscale-safe deltas, 200% zoom verified


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The dashboard's question is written down and answered in the first viewport
- [ ] Every metric has a documented definition
- [ ] Every metric drills to its records
- [ ] First-visit empty state guides rather than shows zeros
- [ ] Filtered-empty differs from truly-empty
- [ ] A single failed region does not break the page
- [ ] Refresh preserves values and never shifts content
- [ ] Data age is visible when staleness is possible
- [ ] Partial data is labeled honestly
- [ ] Mobile shows one chart, single series, 44px targets
- [ ] Charts have text alternatives and table access
- [ ] Deltas survive greyscale
- [ ] Range and filters are in the URL
- [ ] Back preserves scroll and range
- [ ] Reduced motion respected

---

# Final Rule

A dashboard earns its place by shortening the distance between noticing and doing.

Every element must justify itself against one question:

If this element were removed, would a user make a worse decision?

If the answer is no, remove it.
