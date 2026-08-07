# Dashboard Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, UX Intelligence, Layout Intelligence, Data Display System, Dashboard Pattern, Accessibility Intelligence

---

# Purpose

Dashboard Intelligence decides what a dashboard should contain before anyone decides how it looks.

It answers the questions that determine whether a dashboard will be used or abandoned:

- who is looking
- how often they look
- what decision they are about to make
- which numbers change that decision
- what those numbers mean exactly
- what happens when a number goes wrong

The Dashboard Pattern builds the screen.

Dashboard Intelligence decides what belongs on it.

If this layer is skipped, the pattern will be executed perfectly on the wrong content.

---

# Core Philosophy

A dashboard is not a view of data.

A dashboard is a decision instrument.

Every element must survive one question:

If this were removed, would someone make a worse decision?

Data volume is not value.

A dashboard with five metrics that trigger action is worth more than forty metrics nobody can act on.

---

# Dashboard Decision Pipeline

Every dashboard follows:

```
Product Classification

↓

Audience Type

↓

Decision Cadence

↓

Governing Question

↓

Metric Candidates

↓

Metric Qualification

↓

Metric Definition

↓

Comparison Basis

↓

Density Target

↓

Drill Architecture

↓

Threshold and Alert Design

↓

Refresh Strategy

↓

Handoff to Dashboard Pattern
```

Never begin with widgets.

---

# Step 1 — Identify the Governing Question

Every dashboard exists to answer one question repeatedly.

Write that question in one sentence before selecting anything else.

Good governing questions:

- Are any shipments at risk today?
- Is any tenant approaching a quota limit?
- Did revenue change for a reason we can act on?
- Are we on track against this quarter's target?

Bad governing questions:

- Show me everything about sales.
- Give leadership visibility.
- Surface all key data.

A dashboard without a written question becomes a storage location for metrics.

Consequence of skipping this step: the screen accumulates widgets from every stakeholder request and answers nothing.

If two unrelated questions appear, build two dashboards.

---

# Step 2 — Classify the Audience

Audience determines everything downstream: metric count, density, chart complexity, refresh rate, and whether alerts exist at all.

There are four audience types. Choose the primary one.

---

## Monitoring Audience

Operators, dispatchers, on-call engineers, support leads, shift supervisors.

They ask: is anything wrong right now?

Characteristics:

- glance-based, many times per day
- already know the domain vocabulary
- need deviation surfaced, not explained
- act within minutes

Requirements:

- exception-first, not summary-first
- 3 to 7 metrics maximum
- current state emphasised over history
- thresholds defined for every metric
- action reachable from the deviation

Consequence of choosing wrong: an analysis dashboard given to operators buries the incident inside context they have no time to read.

---

## Analysis Audience

Analysts, product managers, growth and operations owners investigating causes.

They ask: why did this change?

Characteristics:

- session-based, minutes to an hour
- arrive with a hypothesis
- need segmentation and comparison
- tolerate and expect density

Requirements:

- flexible time ranges and comparison periods
- segmentation on dimensions that map to owners
- breakdowns adjacent to the trend that caused them
- record-level drill without leaving the workflow

Consequence of choosing wrong: an oversimplified dashboard pushes analysts into exports, and the product loses authority over its own numbers.

---

## Reporting Audience

Executives, boards, clients, external stakeholders.

They ask: are we on track?

Characteristics:

- infrequent, often weekly or monthly
- limited domain context
- reading, not investigating
- decisions are about resourcing and direction

Requirements:

- targets or benchmarks beside every number
- 3 to 6 numbers total
- period comparison, not live values
- plain-language labels, no internal abbreviations
- annotation explaining notable movement

Consequence of choosing wrong: operational noise reaches an executive, one number is misread, and trust in the entire dataset collapses.

---

## Customer-Facing Audience

End users viewing their own data inside the product.

They ask: am I getting value, and is anything wrong on my side?

Characteristics:

- unfamiliar with internal terminology
- low tolerance for ambiguity
- may have very little data, especially early
- cannot ask an internal team what a metric means

Requirements:

- every metric self-explaining, with definition available inline
- no internal jargon, no internal identifiers
- first-run guidance instead of a grid of zeros
- only metrics the customer can influence

Consequence of choosing wrong: the customer sees a number they cannot interpret and opens a support ticket, or silently concludes the product is broken.

---

## Audience Decision Matrix

| Audience | Cadence | Metric count | Density | Comparison basis | Alerts |
| --- | --- | --- | --- | --- | --- |
| Monitoring | Minutes to hours | 3–7 | Low, exception-first | Same period last cycle | Required |
| Analysis | Daily to weekly | 8–15 with segmentation | High | Selectable ranges | Optional |
| Reporting | Weekly to quarterly | 3–6 | Very low | Target and prior period | Never |
| Customer-facing | On visit | 3–6 | Low | Prior period, plain language | Only account-affecting |

Mixed audiences are the most common failure. When two audiences genuinely share a screen, design for the more frequent one and give the other a separate entry point.

---

# Step 3 — Determine Decision Cadence

Cadence is how often a decision can actually be made, not how often data can be fetched.

Ask: if this number changed right now, how soon could anyone do something about it?

Cadence sets four things:

- the default time range
- the refresh interval
- the delta comparison window
- whether alerting is meaningful

Rules:

- Refresh faster than the decision cadence creates anxiety and flicker without improving outcomes.
- Refresh slower than the decision cadence makes the dashboard untrustworthy during incidents.
- The default range should equal one decision cycle, not the longest available history.

Examples of cadence reasoning:

- Staffing can change within an hour, so hourly data and hourly refresh are useful.
- Pricing changes monthly, so live revenue refresh adds noise, not value.
- Inventory reordering happens daily, so a daily boundary and a day-over-day delta are correct.

Consequence of ignoring cadence: real-time dashboards for weekly decisions, where every normal fluctuation looks like an event.

---

# Step 4 — Generate Metric Candidates

Collect candidates from decisions, not from database tables.

For each recurring decision the audience makes, ask what evidence they currently use, including evidence they gather manually.

Manual work is the strongest signal of a required metric.

Sources of legitimate candidates:

- decisions already being made with spreadsheets
- questions asked repeatedly in messages and meetings
- conditions that have previously caused incidents
- commitments the team is measured against

Do not collect candidates by listing every available field.

---

# Step 5 — Qualify Every Metric

A candidate becomes a metric only if it passes all five tests.

## The Owner Test

Someone is accountable for this number.

If no name can be attached, it is context, not a metric.

## The Action Test

There is a specific action available when the number moves the wrong way.

If the only available response is "note it", it belongs in a report.

## The Movement Test

A magnitude of change can be stated that would matter.

If nobody can say what a meaningful change looks like, no threshold can exist and no alert can be designed.

## The Direction Test

The metric can get worse.

Numbers that only ever increase cannot signal a problem.

## The Attribution Test

A move in this number can be traced to something.

A metric with no drill path becomes decoration within weeks.

Any candidate failing a test is either redefined or removed.

---

# Step 6 — Reject Vanity Metrics

Vanity metrics are numbers that reliably look good and reliably change nothing.

Signatures of a vanity metric:

- cumulative totals that can only grow
- counts without a denominator
- activity measured instead of outcome
- averages hiding a distribution
- metrics nobody on the team can influence
- metrics with no defined bad value

Replacements:

- replace a cumulative total with a rate per period
- replace a raw count with a ratio and show the denominator
- replace an average with a median plus a tail measure when the tail is where the harm is
- replace activity with the outcome the activity is supposed to produce
- replace a headline aggregate with a segment when only one segment is actionable

Rule: total signups is a vanity metric; activated accounts this week against last week is a decision metric.

Consequence of keeping vanity metrics: the dashboard becomes a morale artifact, and real deterioration hides between numbers that always rise.

---

# Step 7 — Define Every Metric Precisely

An undefined metric is worse than a missing metric, because it will be trusted and then discovered to be wrong.

Before a metric is displayed, resolve:

- source of truth, and what happens when it disagrees with another source
- unit and currency
- aggregation function
- aggregation window and its boundaries
- timezone the boundaries are evaluated in
- inclusions and exclusions, especially test, internal, refunded, and cancelled records
- deduplication rule
- rounding rule and displayed precision
- comparison period used for the delta
- refresh frequency and expected latency
- who is permitted to see it

Rules:

- Two dashboards must never define the same-named metric differently.
- A metric whose definition is unresolved is not displayed, not approximated, and not labelled "beta".
- Definitions must be reachable from the metric itself, because the first argument about a number always concerns its definition.

Precision discipline:

- Never display more precision than the data supports.
- Never round in a way that hides a sign change, such as showing 0% for a real decline.
- Suppress or explicitly label ratios computed on very small samples, since a conversion rate over a handful of events is noise presented as fact.

---

# Step 8 — Choose the Comparison Basis

A number alone is not information.

Every metric needs one comparison, chosen deliberately.

Options and when each is correct:

- Previous equivalent period, when the metric has weekly or seasonal shape. Compare the same weekday, not the previous 24 hours.
- Target or commitment, when the audience is accountable to a plan.
- Threshold, when only the crossing matters and trend is irrelevant.
- Cohort baseline, when the population changes over time and totals mislead.
- Peer segment, when relative performance is the decision.

Rules:

- State the comparison basis in the interface. An unlabelled delta is an unanswerable question.
- Do not compare against an incomplete period without labelling it incomplete.
- Do not present a delta whose direction is ambiguous in meaning, such as a change in a metric where lower is sometimes better.

Consequence of choosing wrong: teams react to normal weekly seasonality as if it were a regression.

---

# Step 9 — Set the Density Target

Density is chosen, not inherited.

Inputs to the decision:

- audience type from Step 2
- session length
- viewing distance, since wall-mounted displays require far lower density
- device priority from the Product Classifier
- whether the reader is scanning or investigating

Working limits:

- 3 headline metrics maximum, because a reader can only hold one primary conclusion
- 4 metric cards per row at the widest layout
- 6 chart series maximum, and 3 for a shared or projected screen
- 1 chart above the fold on the smallest layout
- 7 metrics total for monitoring audiences before exception-based presentation becomes mandatory

Additional width buys comparison and context.

Additional width never buys more metrics.

Consequence of unbounded density: everything is equally prominent, which means nothing is prominent, and the reader defaults to whichever number is largest.

---

# Step 10 — Design the Drill Architecture

Every metric must be traceable to the records that produced it.

Standard descent:

```
Metric

↓

Segment or dimension

↓

Record list

↓

Single record

↓

Action on that record
```

Decisions to make per metric:

- which dimension is the first breakdown, chosen because it maps to an owner or a fix
- how many levels exist, with four as the practical ceiling
- which filters and time range carry down, and how the reader can see what carried
- what action is available at the record level

Rules:

- Filters and range must persist through the descent and back out again.
- A metric that genuinely cannot be decomposed must say so and state why, for example because the source provides only an aggregate.
- Never present a number that looks clickable and is not.

Exploration beyond a fixed descent belongs to the Analytics Pattern, not to the dashboard.

Consequence of a missing drill path: the reader cannot verify a surprising number, so surprising numbers get ignored.

---

# Step 11 — Design Thresholds and Alerts

A threshold turns a number into a decision. Most dashboards fail here.

## Deriving the Threshold

Base thresholds on observed variation, not round numbers.

Process:

- establish the metric's normal range across at least one full seasonal cycle
- identify the value at which the available action becomes worthwhile
- set the threshold at that value, not at a memorable one

A round number chosen because it is round produces alerts that fire during normal operation.

## Severity Levels

Use three, and no more.

- Informational: visible in context, no interruption, no recipient.
- Warning: attention needed this cycle, routed to the owner, no interruption outside working hours.
- Critical: action needed now, interrupts, has an escalation path.

If a level has no distinct response, it does not exist.

## Required Definition Per Alert

Before an alert ships, resolve:

- the condition, including the sustained duration required before firing
- the recovery condition, which must be different from the firing condition to prevent flapping
- the recipient by role
- the action the recipient is expected to take
- the maximum acceptable frequency
- what suppression applies during known maintenance or known seasonal events

## The Alert Budget

An alert that fires more often than the recipient can act is noise, and noise trains people to ignore the channel.

Rule: if the recipient would not change their day, it is not an alert. It is a chart annotation.

Rule: silence must be meaningful. If a dashboard never signals anything, the audience stops opening it; if it signals constantly, they stop reading it.

---

# Step 12 — Decide Refresh and Data Honesty

## Refresh

Match refresh to decision cadence from Step 3.

Decide explicitly:

- automatic or manual refresh
- interval
- whether the interval changes when the tab is inactive
- what happens to a refresh in progress when the range changes

Rule: refresh must never move content while it is being read.

## Staleness

Every metric that can be stale must display its age.

Decide the threshold at which a passive timestamp escalates to an explicit warning, based on the decision cadence.

## Partial Data

The least trustworthy dashboards are the ones that hide incompleteness.

Decide, per metric, what to do when a source is degraded or a period is still filling:

- label the value as incomplete and name what is missing
- suppress the value rather than show a misleading one
- show the last known complete period instead

Never silently present a partial number as final.

## Zeros

A new account must never be shown a grid of zeros.

Zeros read as a broken product, not an empty one. Decide the first-run guidance instead, and hand the presentation to the Dashboard Pattern.

## Permission

Decide which metrics are restricted, and state the restriction once rather than rendering empty cards.

---

# Chart Selection Decisions

Chart choice is a decision about the question, not a stylistic preference.

- Change over time: line, one series per compared entity.
- Ranked comparison across categories: horizontal bar, sorted by value.
- Contribution to a total over time: stacked bar, only when the total is also meaningful.
- Part of a whole at one moment: stacked bar or plain labelled values, not a pie.
- Distribution where the tail matters: histogram or percentile summary, never a lone average.
- Relationship between two measures: scatter, only for analysis audiences.
- Status of many entities: table with an inline trend indicator per row.

Rules:

- If a single number answers the question, use the number.
- Reject gauges and donuts; they consume space to communicate less than a labelled value with a target.
- Reject dual axes; they imply relationships that may not exist.
- Reject any chart whose series cannot be distinguished without colour.

Implementation belongs to the Charts Component and the Data Display System.

---

# Segmentation Decisions

Choose segments that map to accountability.

Good dimensions are ones where a person owns the segment and can change its outcome: region, team, route, plan, channel, product line.

Poor dimensions are ones nobody owns, or where cardinality is so high that every slice is noise.

Rules:

- Limit visible segments to the number the reader can hold, and group the remainder honestly as an aggregated remainder with its own value.
- Never sort segments by name when the reader is looking for outliers.
- Never show a segmented breakdown whose parts do not reconcile with the headline metric.

---

# Mobile Dashboard Decisions

Mobile is not a reduced dashboard. It is a different question.

Decide which single question the reader needs answered away from a desk. Usually it is the monitoring question, even when the desktop audience is analytical.

Decisions:

- one primary metric, and at most two supporting metrics before the fold
- one chart, single series
- reduce series and segments, never font size
- alerts and their actions must be complete on mobile, because that is where they will be received

Consequence of porting the desktop metric set: the reader pinches, scrolls, and gives up, then calls someone.

---

# Reporting Versus Monitoring Versus Analysis

These are three products, not three tabs.

- Monitoring optimises for detection. It is worthless if it is slow or noisy.
- Analysis optimises for explanation. It is worthless if it cannot segment or drill.
- Reporting optimises for accountability. It is worthless if the definitions shift between periods.

A single screen attempting all three satisfies none.

When a stakeholder asks for a metric that belongs to a different mode, route it to the correct surface rather than adding it.

---

# Handoff

When these decisions are resolved, hand off:

- screen structure, states, and interaction to the Dashboard Pattern
- exploratory segmentation and ad-hoc querying to the Analytics Pattern
- tables and value formatting to the Data Display System
- chart rendering and accessibility alternatives to the Charts Component
- alert delivery and routing to the Notifications Pattern
- verification to the Product Review and Accessibility Review

Dashboard Intelligence does not specify layout, components, or QA steps.

---

# Dashboard Intelligence Output

Example:

```
Product

Field Service Operations Platform


Audience

Dispatchers, monitoring


Governing Question

Which jobs today will miss their promised window?


Decision Cadence

Hourly


Headline Metric

Jobs at risk in the next 4 hours


Supporting Metrics

Unassigned jobs
Technicians running behind
Average arrival variance


Rejected Candidates

Total jobs completed all time — cumulative, no action
Technician utilisation — no owner able to act within cadence
App sessions — activity, not outcome


Metric Definition Example

Jobs at risk = scheduled jobs whose projected arrival exceeds the promised
window end, projected from current technician position and remaining
job durations, excluding cancelled jobs, evaluated in branch local time,
recomputed every 5 minutes


Comparison Basis

Same weekday, previous week


Density

4 metrics, 1 trend chart, 1 ranked list


Drill Path

Jobs at risk → branch → technician → job → reassign


Thresholds

Warning at 3 at-risk jobs sustained 15 minutes
Critical at 6, or any job for a contractual customer
Recovery below 2 sustained 15 minutes


Refresh

Background every 5 minutes, deferred during interaction


Staleness

Timestamp always visible, explicit warning beyond 15 minutes


Partial Data

Branches not reporting position are excluded and named


Mobile

One metric, one list, full reassign action available


Empty State

Pre-first-job setup guidance, never zeros


Handoff

Dashboard Pattern, Notifications Pattern, Data Display System


Review

Pass
```

---

# Failure Conditions

Dashboard Intelligence fails when:

- The governing question is unwritten.
- Metrics were selected from available data rather than from decisions.
- A displayed metric has no written definition.
- The same metric name means two things in the product.
- Cumulative totals occupy headline positions.
- No metric has a threshold, so nothing can ever be wrong.
- Alerts fire more often than anyone can act.
- Deltas exist with no stated comparison basis.
- A number cannot be traced to its records.
- Monitoring, analysis, and reporting share one screen.
- Partial or stale data is presented as complete.
- New accounts are shown a grid of zeros.
- Mobile carries the desktop metric set.

---

# Review Questions

Before approval:

- Can the governing question be answered without scrolling?
- Is every metric owned by someone?
- Is there a specific action for every metric that can worsen?
- Would two people reading the same number agree on its definition?
- Is the comparison basis stated?
- Does any metric only ever increase?
- Does every threshold have a recipient and a recovery condition?
- Can every number be verified by descending to its records?
- Is data age visible wherever staleness is possible?
- Does the mobile view answer a question worth answering away from a desk?
- If half the widgets were removed, would any decision get worse?

---

# Final Rule

A dashboard earns its place by shortening the distance between noticing and doing.

Everything that does not shorten that distance is weight.

Decide the question first, the metrics second, and the screen last.
