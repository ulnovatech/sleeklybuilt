# Analytics Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Dashboard Intelligence, Data Display System, Charts Component, Tables Component, Layout Intelligence, Empty States System, Loading States System, Error States System

---

# Purpose

The Analytics Pattern defines the complete solution for screens whose job is to let someone ask their own question of the data.

A dashboard answers a question the product chose in advance.

Analytics answers a question the user invents while looking at the screen.

That difference changes everything. The interface must expose the shape of the data — its dimensions, its measures, its filters — and let the user recombine them without losing their place.

If a user cannot reproduce yesterday's number, the analytics screen failed regardless of how many charts it drew.

---

# When To Use

Use this pattern when:

- users need to slice the same measure by different dimensions
- the question changes between sessions and between people
- comparison across periods, segments, or cohorts is the point
- findings must be saved, shared, or exported to be acted on elsewhere
- the data has more than one legitimate breakdown

---

# When Not To Use

Do not use this pattern when:

- the question is fixed and operational — use the Dashboard Pattern
- the user is looking for one specific record — use Search
- the output is a fixed periodic document — build a report, not an explorer
- there is one dimension and one measure — a single chart on an existing screen is enough
- the audience has no analytical training and no defined question

The most common product mistake is shipping a query builder to users who only ever needed three saved views.

Ship the three views first. Add exploration when users start asking for the fourth.

---

# User Goal

The primary goal is always one of four:

```
How is this measure changing?

↓

Which segment explains the change?

↓

How does this segment compare to another?

↓

Can I keep this view and send it to someone?
```

The last goal is the one that determines whether analytics gets used twice.

An exploration that cannot be saved is an exploration that must be rebuilt from memory every time.

---

# User Journey

```
Arrives with a vague question

↓

Picks a measure and a time range

↓

Sees a shape and forms a hypothesis

↓

Adds a dimension to test the hypothesis

↓

Narrows with a filter or segment

↓

Confirms or discards the hypothesis

↓

Saves the view or exports the evidence

↓

Returns later and finds the same numbers
```

Every step must be reversible.

Exploration is a sequence of guesses, and most guesses are wrong. A screen that punishes wrong guesses stops being explored.

---

# UX Flow

## Entry

The user arrives from:

- navigation, with no question formed yet — needs a sensible default view
- a saved view or shared link — needs the exact state restored
- a dashboard drill-down — needs the originating filters visible and removable
- a scheduled export — needs the same definitions the file used

The default view must be a real, useful answer. Never open an empty canvas with three unset dropdowns.

---

## Configure

The user assembles a query from four controls:

```
Measure          what is counted

↓

Dimension       how it is split

↓

Time range      over what period

↓

Filter          which subset
```

Rules:

- One measure is primary. Additional measures are comparisons, not equals.
- Maximum two dimensions active at once. A third turns a chart into a puzzle.
- Every control shows its current value without opening it.
- Changing a control never resets the others.

---

## Read

The result appears as a chart plus the table that produced it.

The chart shows shape. The table shows truth.

Both must be present, because every analytics conversation ends with someone asking for the exact number.

---

## Compare

Comparison is a first-class control, not a chart option.

Support:

- previous period of equal length
- same period last year
- a named segment against the total
- a named segment against another named segment

Always label which series is the comparison. Dotted or lighter lines alone are insufficient.

---

## Persist

Any state worth reading twice must be storable.

```
Current state

↓

URL, always

↓

Saved view, on request

↓

Export, for evidence
```

The URL is the minimum. If the state is not in the URL, the view cannot be shared and support cannot reproduce a bug report.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ← Analytics              │
│ Revenue · Last 30 days   │
├──────────────────────────┤
│ [ Measure ▾ ] [ Range ▾ ]│
│ [ + Filter ]   2 active  │
├──────────────────────────┤
│ 128,400                  │
│ ▲ 12.4% vs prev 30 days  │
├──────────────────────────┤
│ Trend chart              │
│ single series            │
├──────────────────────────┤
│ Breakdown by Channel     │
│ Organic      52,100  41% │
│ Paid         38,900  30% │
│ Referral     21,300  17% │
│ Direct       16,100  12% │
│ Show all 14              │
├──────────────────────────┤
│ [ Save view ] [ Export ] │
└──────────────────────────┘
```

Mobile rules:

- Controls collapse into a single row of pills that open bottom sheets.
- The headline number and its delta appear above the chart, never inside it.
- Charts are single-series. Comparison appears as a delta figure, not a second line.
- Breakdown is a ranked list with value and share, not a pie chart.
- Wide tables scroll horizontally with the first column pinned and a visible edge shadow.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Analytics · Revenue · Last 30 days         │
├────────────────────────────────────────────┤
│ Measure ▾ │ Range ▾ │ Compare ▾ │ Filter + │
├────────────────────────────────────────────┤
│ 128,400   ▲ 12.4%    │ Prev  114,200       │
├────────────────────────────────────────────┤
│ Trend chart · 2 series max                 │
├─────────────────────┬──────────────────────┤
│ Breakdown ranked    │ Segment comparison   │
├─────────────────────┴──────────────────────┤
│ Detail table · sortable · paginated        │
└────────────────────────────────────────────┘
```

---

## Desktop

```
┌──────┬───────────────────────────────────────────────────────┐
│      │ Analytics · Revenue      [Save view] [Export] [Share] │
│ Nav  ├──────────────┬────────────────────────────────────────┤
│      │ QUERY PANEL  │ 128,400   ▲ 12.4%  vs 114,200          │
│ Saved│ Measure      ├────────────────────────────────────────┤
│ views│ Revenue      │ Trend chart · up to 6 series           │
│      │              │                                        │
│ ·Paid│ Dimension    ├──────────────────────┬─────────────────┤
│ ·SEO │ Channel      │ Breakdown ranked     │ Period compare  │
│ ·Q3  │              ├──────────────────────┴─────────────────┤
│      │ Filters (2)  │ Detail table · sort · pivot · paginate │
│      │ Segment ▾    │                                        │
└──────┴──────────────┴────────────────────────────────────────┘
```

Desktop rules:

- The query panel is persistent, not a modal. Users edit and re-read in one motion.
- Saved views live in the left rail so switching questions costs one click.
- The detail table shares the screen with the chart. Scrolling between them is acceptable; navigating between them is not.
- Six series is the hard ceiling on any chart. Beyond six, ranked lists communicate better.

---

# Component Hierarchy

```
AnalyticsPage
├── PageHeader
│   ├── Title
│   ├── SavedViewIndicator
│   ├── SaveViewAction
│   ├── ExportAction
│   └── ShareAction
├── SavedViewRail                desktop only
│   ├── SavedViewItem ×n
│   └── CreateViewAction
├── QueryPanel
│   ├── MeasureSelector
│   ├── DimensionSelector
│   ├── TimeRangeSelector
│   ├── CompareSelector
│   ├── SegmentSelector
│   └── FilterStack
│       ├── FilterChip ×n
│       └── AddFilterAction
├── ResultHeader
│   ├── PrimaryValue
│   ├── DeltaIndicator
│   ├── ComparisonValue
│   └── DataFreshnessLabel
├── ChartSection
│   ├── ChartTypeToggle
│   ├── Chart
│   ├── ChartLegend
│   ├── ChartEmptyState
│   └── ChartTextAlternative
├── BreakdownPanel
│   └── RankedList
│       └── RankedListRow
├── ComparisonPanel
├── DetailTable
│   ├── TableToolbar
│   ├── Table
│   └── TablePagination
└── ExportDialog
    ├── FormatSelector
    ├── ScopeSelector
    └── SubmitAction
```

Reuse rules:

- `FilterChip` is one component used identically everywhere filters exist in the product.
- Charts use the shared chart wrapper so loading, empty, and error behavior are identical across every analytics screen.
- The detail table is the product's standard table with pivot enabled, never a bespoke analytics grid.

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

New state is understandable and reversible
```

## Changing a Measure

1. The selector closes immediately and shows the new measure name.
2. Chart and table enter refresh loading; the query panel stays interactive.
3. Dimensions and filters that remain valid are preserved.
4. Dimensions and filters that are invalid for the new measure are removed, and a single line states which and why.
5. The URL updates without adding a history entry per keystroke.

Never silently drop a filter. A number computed on a filter the user did not know was removed is a wrong number.

## Adding a Dimension

1. The dimension applies to the chart and the table simultaneously.
2. If the dimension has more than six values, the chart shows the top six plus an aggregated remainder, labeled explicitly.
3. The table shows all values, paginated.
4. Removing the dimension returns to the previous view without a reload.

## Applying a Filter

1. The filter chip appears immediately in a pending style.
2. Results reload; the previous result stays visible and dimmed until replaced.
3. The chip settles into its active style with a remove affordance.
4. Filter count in the panel header updates.

## Saving a View

1. Save captures measure, dimensions, range mode, filters, comparison, chart type, and sort.
2. Range is saved as a mode (last 30 days) not as fixed dates, unless the user explicitly pins the dates.
3. The user names the view and chooses private or shared.
4. Opening the view later restores every captured setting exactly.

Relative ranges are the default because a saved view whose range is frozen becomes wrong the next morning.

## Exporting

1. Export offers the current view's exact rows, or the full unaggregated detail.
2. The file includes the query definition as a header block: measure, range, filters, timezone, generated timestamp.
3. Small exports download directly. Exports beyond a defined row threshold are queued and delivered by notification with the screen remaining usable.
4. Cancelling a queued export is possible from the notification.

An export without its query definition attached becomes an orphaned spreadsheet that someone will misread in a meeting.

---

# States

Every region owns its own states. A failing breakdown must not blank the chart.

## Loading — First Visit

Skeletons matching final dimensions.

```
Result header  → label bar + large value bar + delta bar
Chart          → axis frame + shimmer plot area
Ranked list    → 5 label/value row pairs
Detail table   → 8 skeleton rows
```

The query panel renders fully and is interactive before results arrive, so the user can adjust while waiting.

No spinners for regions with a known shape.

---

## Loading — Refresh / Query Change

Keep the previous result visible.

Dim the affected region to 60% and show a thin indeterminate progress line at its top edge.

The result header keeps the old value with a muted treatment until the new value lands. It never shows a dash.

Requests are cancelled when the query changes again, so a slow earlier request can never overwrite a newer result.

---

## Empty — No Data Collected Yet

This is a new workspace, and this state decides whether analytics is ever opened again.

```
┌────────────────────────────────────┐
│           [illustration]           │
│                                    │
│  No data to analyze yet            │
│                                    │
│  Analytics appears here once       │
│  events start arriving. Most       │
│  workspaces see their first data   │
│  within an hour of setup.          │
│                                    │
│  [ Finish setup ]                  │
│  What we collect                   │
└────────────────────────────────────┘
```

Never render an explorer full of zeros. Zeros read as a broken pipeline.

---

## Empty — No Results For This Query

Different from having no data at all, and it must never be confused with it.

Required: which constraint excluded everything, a one-tap way to relax it, and a suggestion that is known to have data.

```
┌────────────────────────────────────┐
│  No revenue between 1–7 Mar for    │
│  segment "Enterprise · EMEA".      │
│                                    │
│  The segment filter is the         │
│  narrowest constraint.             │
│                                    │
│  [ Remove segment ]                │
│  [ Widen to last 90 days ]         │
└────────────────────────────────────┘
```

Naming the narrowest constraint saves the user from removing filters one at a time.

---

## Error — Field / Control Invalid

Invalid query configuration is caught in the panel, next to the control that caused it.

```
Dimension
┌──────────────────────────────┐
│ Customer ID              ▾   │
└──────────────────────────────┘
⚠ Customer ID has 41,000 values.
  Charting it is not possible.
  [ Show as table instead ]
```

The rest of the query stays intact and the previous result stays on screen.

---

## Error — Query Failed

When the query itself cannot run.

```
┌────────────────────────────────────┐
│ ⚠  This query could not complete   │
│                                    │
│    It exceeded the 30 second       │
│    limit. Narrowing the range or   │
│    removing one dimension usually  │
│    resolves it.                    │
│                                    │
│    [ Retry ]  [ Narrow to 7 days ] │
│    Reference: QRY-4471             │
└────────────────────────────────────┘
```

The reference identifier is required. Analytics failures are reported by users who cannot describe their query.

---

## Error — Region Failed

One panel failing leaves the rest usable.

```
┌──────────────────────────────┐
│ ⚠  Breakdown unavailable     │
│    Chart and totals are      │
│    still accurate.           │
│    [ Retry breakdown ]       │
└──────────────────────────────┘
```

---

## Partial Data

Analytics loses trust faster through silent incompleteness than through visible gaps.

Label every incomplete result at the point of reading:

```
Revenue   128,400 *
* Today is partial. Data through 14:20.
```

Where a dimension was truncated for charting:

```
Showing top 6 of 14 channels · remainder grouped as "Other"
```

---

## Stale Data

Show data age whenever the pipeline can lag.

Below the freshness threshold, a passive label: "Updated 4 minutes ago."

Beyond it, escalate to an explicit warning with the last known good timestamp: "Data is delayed. Latest complete hour is 11:00."

---

## Success

Saving a view confirms inline beside the save control and the view appears immediately in the saved list.

Export confirms with the filename and a direct link to the file, not a generic toast.

---

## Permission-Limited

When a measure or dimension is restricted, remove it from the selector and state the reason once in the panel footer.

```
Some measures are hidden by your role.
Request access
```

Never render a measure that produces an error when selected. Never render a locked row with an empty value.

---

# Mobile Behavior

- Touch targets minimum 44×44, including filter chip remove affordances.
- Query controls open as bottom sheets with a single confirm action, so a wrong tap does not trigger a query.
- Charts respond to tap, not hover. Tap shows a value tooltip that dismisses on outside tap.
- Comparison is rendered as a delta number, never a second overlapping line.
- Horizontal scroll is permitted for the detail table only, with the first column pinned.
- Pull to refresh re-runs the current query.
- Never require pinch zoom to read an axis label. Reduce the number of ticks instead of the font size.
- Long-running queries keep the screen usable and notify on completion rather than blocking.

---

# Desktop Expansion

Added space is spent on:

- a persistent query panel, removing the open-adjust-close cycle
- saved views in a rail, making question-switching one click
- chart and detail table visible together
- period comparison shown beside the primary result
- keyboard shortcuts for range switching, measure focus, and export

Added space is never spent on:

- more simultaneous dimensions
- more chart types offered at once
- decorative summary tiles nobody filters on
- a second copy of the same numbers in different units

---

# Accessibility Requirements

- Tab order follows reading order: header actions, saved views, query panel controls in query-assembly order, result header, chart, breakdown, table.
- Every chart has a text alternative stating measure, range, direction, magnitude of change, and current value.
- Every chart's underlying data is reachable as a table from the same screen, not a separate page.
- Delta direction uses an icon and a word alongside color, so the meaning survives greyscale and color blindness.
- Series are distinguished by pattern or direct labeling, not by hue alone.
- All text and chart labels meet 4.5:1 contrast; chart lines and fills meet 3:1 against their background.
- Filter chips are keyboard removable with Delete or Backspace when focused, and announce "Filter removed: Channel is Paid".
- Query completion announces politely in a live region: "Results updated. Revenue 128,400, up 12.4 percent." Never assertive; queries change often and assertive announcements interrupt the screen reader mid-sentence.
- Errors announce assertively, since the user must stop and act.
- Focus after a query change stays on the control the user just used. Focus never jumps to the chart.
- Opening a bottom sheet or dialog traps focus, and closing it returns focus to the trigger.
- Reduced motion: numbers replace rather than count up, charts appear rather than draw, panel transitions are instant.
- At 200% zoom the query panel stacks above the results and remains fully operable with no horizontal page scroll.

---

# Data Requirements

Before implementation, confirm for every measure and dimension:

```
Source of truth


Aggregation function and whether it is additive across dimensions


Refresh frequency and expected pipeline lag


Timezone basis for bucketing


Definition of the comparison period


Rounding and unit display rule


Cardinality of every dimension


Whether the measure can be summed after filtering


Behavior when the source is unavailable


Retention window, and what happens at its edge


Who is permitted to see it
```

Additivity must be settled before build. A measure such as unique visitors cannot be summed across dimension rows, and a table whose rows do not add to its total will be reported as a bug forever.

Never display a computed measure whose definition is unresolved.

---

# Performance Requirements

- Default view returns a first result under two seconds on a warm cache.
- Aggregation happens server-side. The client never receives raw rows to sum.
- Query results are cached by their full parameter signature, so back navigation and filter removal are instant.
- Chart libraries load only for the chart types actually rendered.
- Superseded queries are cancelled the moment a new query is issued.
- Detail tables paginate or virtualize; the browser never receives more than a defined page of rows.
- Exports beyond the row threshold run asynchronously and never hold the connection open.
- Every query carries a server-side timeout with an actionable message, so a heavy query degrades into advice instead of a hang.

---

# Anti-Patterns

Never build:

- an empty query builder as the landing state, with every selector unset
- charts with more than six series, or rainbow palettes that require legend lookup
- a chart whose exact numbers are unavailable anywhere on the screen
- a table whose rows do not sum to the displayed total, with no explanation
- filters that silently disappear when the measure changes
- saved views that freeze relative ranges into fixed dates without saying so
- exports that omit the filters and timezone that produced them
- state that lives only in memory, making views unshareable and bugs unreproducible
- pie charts for more than four categories, or donuts where a ranked list is clearer
- a spinner covering the whole screen for every filter change
- comparison series distinguished by hue alone
- percentage changes shown without their absolute values
- "Other" buckets that are never explained
- treating a partial current day as a complete period in a trend

---

# Pattern Output Example

```
Product

Subscription Analytics Workspace


Primary Question

Which acquisition channel is driving the revenue change?


Layout

Persistent query panel + result header + trend + ranked breakdown + detail table


Primary Measure

Net revenue


Dimensions Allowed

Channel, Plan, Region, Cohort month — maximum two active


Comparison Basis

Previous period of equal length, timezone UTC


Series Ceiling

6, remainder grouped as Other and labeled


Persistence

Full state in URL, saved views store relative ranges


Export

CSV and XLSX, query definition in header block, async beyond 50,000 rows


Mobile

Pill controls into bottom sheets, single-series chart, delta instead of comparison line


Empty States

Pre-first-event setup guidance, and constraint-naming no-results state


Partial Data

Current day labeled partial with cutoff time


Accessibility

Chart text alternatives, greyscale-safe deltas, polite result announcements, 200% zoom verified


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The default view is a real answer, not an unset builder
- [ ] Every measure and dimension has a written definition
- [ ] Additivity is documented and non-additive measures are labeled
- [ ] Full query state is in the URL and restores exactly
- [ ] Saved views store relative ranges unless explicitly pinned
- [ ] Changing a measure states which filters were dropped and why
- [ ] Charts never exceed six series; the remainder is labeled
- [ ] Exact numbers are reachable as a table from every chart
- [ ] First-visit empty state guides setup rather than showing zeros
- [ ] No-results state names the narrowest constraint and offers relaxation
- [ ] A failed region leaves the rest of the screen accurate and usable
- [ ] Query timeout produces actionable advice and a reference identifier
- [ ] Superseded queries are cancelled and cannot overwrite newer results
- [ ] Partial periods and truncated dimensions are labeled honestly
- [ ] Data freshness is visible whenever lag is possible
- [ ] Exports include measure, range, filters, and timezone
- [ ] Mobile uses 44×44 targets, bottom sheets, and single-series charts
- [ ] Deltas and series survive greyscale
- [ ] Focus stays on the control used after a query change
- [ ] Result announcements are polite, error announcements are assertive
- [ ] 200% zoom keeps the query panel operable without horizontal scroll
- [ ] Reduced motion respected

---

# Final Rule

Analytics earns its place by making a user's own question cheap to ask and cheap to abandon.

Every control must justify itself against one question:

Does this help the user test an idea faster than opening a spreadsheet?

If the answer is no, remove it.
