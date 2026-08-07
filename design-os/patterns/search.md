# Search Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Search Component, Inputs Component, Lists Component, UX Intelligence, Empty States System, Accessibility Intelligence

---

# Purpose

The Search Pattern defines how a user finds a specific thing they already believe exists.

Search is not a filter on a list.

Search is the fastest available path from an intent in the user's head to a single result they can act on.

If a user types what they want, receives results, and cannot tell why those results appeared, the search failed even though it returned rows.

The measure of a search feature is not recall. It is whether the user found the one thing and acted on it.

---

# When To Use

Use this pattern when:

- the collection is too large to browse in a reasonable time
- users arrive with a specific target in mind
- items have names, identifiers, or text that users remember
- the same lookup is repeated often enough to deserve saving
- navigation cannot reach a destination in fewer than three steps

---

# When Not To Use

Do not use this pattern when:

- the collection is small enough to scan — a sorted list is faster than typing
- users do not know what exists — use browse, categories, or recommendations first
- the need is narrowing a known set — use filters on that set, not a search box
- one canonical destination exists — link to it rather than making the user search for it

The most common product mistake is adding a search box because the information architecture failed, and then treating search as the fix.

---

# User Goal

The user is answering three questions in order:

```
Can I express what I'm looking for?

↓

Is what I want in these results?

↓

Why did I get these, and how do I get closer?
```

The third question decides whether the user refines or gives up.

Search that cannot explain itself trains users to distrust it and to stop using it.

---

# User Journey

```
Forms an intent, often partial

↓

Finds the search entry point without looking for it

↓

Types a few characters

↓

Reads suggestions and either accepts one or continues

↓

Submits and scans results

↓

Recognises the target, or refines the query or filters

↓

Opens the result and acts

↓

Returns and repeats the same search later
```

The final step is why recent and saved searches exist.

A user who runs the same query weekly should never retype it.

---

# UX Flow

## Entry

Search is reached three ways, and all three must work:

- a persistent input in the app shell, visible on every screen where search applies
- a keyboard shortcut, conventionally `/` for focus and `Cmd/Ctrl+K` for a command palette
- a scoped input inside a section, searching only that section and saying so

The scope must be visible in the input, not assumed:

```
🔍 Search invoices
```

An unlabelled magnifying glass with no scope produces queries the system was never going to match.

---

## Suggest

Suggestions appear from the second character and serve four distinct purposes, in this order:

```
Recent searches

↓

Direct matches, jumping straight to a record

↓

Query completions

↓

Scoped actions, such as creating what was typed
```

Rules:

- suggestions are grouped with visible headings, because a mixed list of unlike things cannot be scanned
- a direct match shows enough detail to be identified: name, identifier, and one distinguishing attribute
- the typed portion is emphasised in each suggestion so the match is visible
- suggestions are capped at eight, because a longer list is slower than reading results
- the list never reorders while the user is arrowing through it

---

## Submit

Submission is not required when a direct match is chosen. Selecting a match navigates straight to the record, which is the fastest path in the pattern.

Submission produces a results page with a URL that reproduces the query, scope, filters, and sort.

---

## Scan

Results must be scannable in a single pass. Each result shows:

- what it is, by type
- its name or title, with matched terms emphasised
- the matched context, quoted from the source
- the one attribute that distinguishes it from similar results
- its status where status affects whether it is useful

The matched context is what makes a result trustworthy. A title alone forces the user to open the record to learn why it matched.

---

## Understand Ranking

Ranking must be legible, not secret.

Required:

- the active sort is stated: "Most relevant" or "Newest first"
- relevance can be exchanged for a deterministic sort such as date or name
- when results are boosted by something other than text match, say so: "Your team's documents first"
- the total count is real, or is honestly approximate: "About 1,200 results"

Users do not need the algorithm. They need to know which lever to pull.

---

## Refine

Filters narrow results; the query describes them. Keep the two distinct.

```
Query changes what is searched

↓

Filters change which matches are shown

↓

Sort changes their order

↓

Every change is reflected in the URL
```

Rules:

- active filters are shown as removable chips above the results
- each filter option shows its result count, and options with zero results are visible and disabled rather than hidden
- a filter that would empty the results warns before being applied where the count is known
- "Clear all" is always present when any filter is active

---

## Recover

Zero results is a normal outcome and must be designed as carefully as success.

Never a dead end. Always at least one path forward.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ‹  🔍 invoice mar    ✕   │
├──────────────────────────┤
│ RECENT                   │
│ ↻ overdue invoices       │
│ ↻ northwind              │
├──────────────────────────┤
│ INVOICES                 │
│ ▸ INV-0142  Northwind    │
│   $1,200 · Overdue       │
│ ▸ INV-0138  Marina Ltd   │
│   $840 · Paid            │
├──────────────────────────┤
│ CLIENTS                  │
│ ▸ Marina Ltd             │
├──────────────────────────┤
│ Search all for           │
│ "invoice mar"        ↵   │
└──────────────────────────┘
```

Results screen:

```
┌──────────────────────────┐
│ ‹  🔍 invoice mar    ✕   │
├──────────────────────────┤
│ 24 results  Relevance ▾  │
│ [Filters 2] [Overdue ✕]  │
├──────────────────────────┤
│ INVOICE                  │
│ INV-0142 · Northwind Ltd │
│ "…March invoice for…"    │
│ $1,200 · Overdue 12 days │
├──────────────────────────┤
│ INVOICE                  │
│ INV-0138 · Marina Ltd    │
│ "…March retainer…"       │
│ $840 · Paid 2 Apr        │
├──────────────────────────┤
│ ...                      │
├──────────────────────────┤
│ [ Load 20 more ]         │
└──────────────────────────┘
```

Mobile rules:

- tapping the input opens a full-screen search view; a dropdown over a phone screen wastes the space
- the input keeps focus and the keyboard stays up while suggestions are shown
- a visible clear control sits inside the input, minimum 44×44
- filters open in a bottom sheet with an explicit apply, showing the resulting count on the apply action
- active filter chips are horizontally scrollable above the results
- results paginate by explicit action, not infinite scroll, so position survives a back navigation
- the back gesture from a result returns to the same results at the same scroll position

---

## Tablet

```
┌────────────────────────────────────────────┐
│ 🔍 invoice mar                        ✕    │
├────────────────────────────────────────────┤
│ 24 results · Relevance ▾    [ Filters 2 ]  │
│ Overdue ✕   March ✕   Clear all            │
├────────────────────────────────────────────┤
│ INVOICE  INV-0142 · Northwind Ltd          │
│ "…March invoice for design retainer…"      │
│ $1,200 · Overdue 12 days                   │
├────────────────────────────────────────────┤
│ INVOICE  INV-0138 · Marina Ltd             │
│ "…March retainer, paid in full…"           │
│ $840 · Paid 2 Apr                          │
└────────────────────────────────────────────┘
```

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 invoice mar                                    ✕    ⌘K    │
├──────────────┬───────────────────────────────────────────────┤
│ FILTERS      │ About 24 results · Relevance ▾   Save search  │
│              │ Overdue ✕  March ✕            Clear all       │
│ Type         ├───────────────────────────────────────────────┤
│ ☑ Invoices 18│ INVOICE   INV-0142 · Northwind Ltd            │
│ ☐ Clients  4 │ "…March invoice for design retainer…"         │
│ ☐ Notes    2 │ $1,200 · Overdue 12 days · Sent 3 Mar         │
│ ☐ Files    0 │───────────────────────────────────────────────│
│              │ INVOICE   INV-0138 · Marina Ltd               │
│ Status       │ "…March retainer, paid in full…"              │
│ ☑ Overdue  6 │ $840 · Paid 2 Apr · Sent 1 Mar                │
│ ☐ Paid    12 │───────────────────────────────────────────────│
│ ☐ Draft    6 │ CLIENT    Marina Ltd                          │
│              │ 8 invoices · $6,400 outstanding               │
│ Date         │───────────────────────────────────────────────│
│ Last 90 days │ ...                                           │
│              │ [ Load 20 more ]                              │
│ SAVED        │                                               │
│ ↻ Overdue    │                                               │
│ ↻ This month │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Desktop rules:

- filters live in a persistent left rail with counts, applying immediately since the cost of a mistake is one click
- saved searches sit below filters, because they are entry points rather than refinements
- result rows are single tab stops with a clear focus ring, navigable with arrow keys
- extra width buys matched context and distinguishing attributes, not larger thumbnails

---

# Component Hierarchy

```
SearchExperience
├── SearchInput
│   ├── ScopeLabel
│   ├── QueryField
│   ├── ClearAction
│   ├── ShortcutHint
│   └── LoadingIndicator
├── SuggestionPanel
│   ├── SuggestionGroup ×n
│   │   ├── GroupHeading
│   │   └── SuggestionItem ×n
│   │       ├── TypeIcon
│   │       ├── PrimaryLabel        matched text emphasised
│   │       ├── SecondaryLabel
│   │       └── DirectMatchBadge
│   ├── RecentSearchList
│   │   ├── RecentSearchItem ×n
│   │   └── ClearRecentAction
│   └── SubmitHint
├── SearchResultsPage
│   ├── ResultsToolbar
│   │   ├── ResultCount
│   │   ├── SortSelector
│   │   ├── RankingNote
│   │   ├── SaveSearchAction
│   │   └── FilterToggle          mobile · tablet
│   ├── ActiveFilterChips
│   │   ├── FilterChip ×n
│   │   └── ClearAllAction
│   ├── FilterRail                desktop
│   │   └── FilterGroup ×n
│   │       └── FilterOption ×n
│   │           ├── OptionLabel
│   │           └── OptionCount
│   ├── ResultList
│   │   └── ResultItem ×n
│   │       ├── TypeBadge
│   │       ├── ResultTitle
│   │       ├── MatchedSnippet
│   │       ├── DistinguishingMeta
│   │       └── StatusIndicator
│   ├── ResultsPagination
│   ├── ZeroResultsPanel
│   │   ├── QueryEcho
│   │   ├── CorrectionSuggestion
│   │   ├── RelaxedFilterAction
│   │   └── AlternativeRoutes
│   └── ResultsErrorPanel
└── SavedSearchPanel
    ├── SavedSearchItem ×n
    ├── RenameAction
    └── DeleteAction
```

Reuse rules:

- `SearchInput` is one component; scope is a property, never a separate implementation per section.
- `ResultItem` renders every result type through a type property, so a new searchable type requires no new component.
- Filter chips and filter options share one source of truth, so the rail and the chips can never disagree.

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

## Typing

1. Suggestions request after a 150ms debounce, so a fast typist issues one request rather than ten.
2. In-flight requests are cancelled when the query changes.
3. Results arrive in query order; a late response for an earlier query is discarded, never rendered.
4. The input shows a subtle inline loading indicator, never a spinner that replaces the suggestion list.
5. Fewer than two characters shows recent searches instead of matches.

## Keyboard Navigation

1. Arrow down moves into the suggestion list, arrow up moves back to the input.
2. The active suggestion is visually marked and referenced by `aria-activedescendant`; focus remains in the input so typing continues to work.
3. Enter opens the active suggestion, or submits the raw query when nothing is active.
4. Escape closes the panel and keeps the query; a second Escape clears the query.
5. Tab moves out of search entirely rather than through each suggestion.

## Submitting

1. The results URL contains query, scope, filters, sort, and page.
2. The query stays in the input so the user can refine rather than retype.
3. Result count and active sort appear above the results.
4. Focus moves to the results heading so screen reader users are told the outcome.
5. The count is announced politely: "24 results for invoice mar."

## Filtering

1. On desktop, selecting an option applies immediately and updates counts on the remaining options.
2. On mobile, selections accumulate in a sheet and apply together, with the resulting count on the apply action: "Show 6 results".
3. Options with zero results stay visible and disabled, because their absence hides the shape of the data.
4. Each applied filter becomes a removable chip.
5. Removing all filters restores the unfiltered result set without re-running the query from scratch.

## Sorting

1. Changing sort re-orders without re-fetching where the result set is already complete.
2. Relevance sort states that it is relevance, so the user understands why order is not chronological.
3. Sort persists across queries within the session, because a user who prefers newest first usually still does.

## Saving A Search

1. Save captures query, scope, filters, and sort as one unit.
2. The user names it, with a sensible default derived from the query.
3. Saved searches are listed as entry points and open to their exact prior state.
4. Rename and delete are available in place.
5. If a saved search later returns nothing, it opens showing its zero state with its criteria intact, so the user can adjust rather than lose it.

## Recovering From Zero Results

The zero state must diagnose, not merely report.

1. Echo the exact query so a typo becomes visible.
2. Offer a spelling correction when one is confidently available, and state it: "Showing results for northwind. Search instead for northwlnd."
3. If filters are excluding everything, say which one and offer to remove it, with the count that would result.
4. Offer the broadest sensible fallback: the same query with no filters, or the same query across all scopes.
5. Offer a non-search route: browse the collection, or create the thing being searched for.

```
┌──────────────────────────────┐
│ No results for "northwlnd"   │
│                              │
│ Did you mean northwind?      │
│ [ Search northwind ]         │
│                              │
│ Your filters exclude 18      │
│ matches.                     │
│ [ Remove "Overdue" · 18 ]    │
│                              │
│ [ Search all types ]         │
│ [ Browse all invoices ]      │
└──────────────────────────────┘
```

## Returning From A Result

1. Back restores the results, the scroll position, the query, and every filter.
2. The previously opened result is marked as visited so the user can continue down the list.
3. Nothing is re-fetched if the cached results are still fresh.

---

# States

Each region owns its states. A failed filter count must not blank the results.

## Loading — First Search

The results area shows skeleton rows matching the final row height.

```
Result row  → type badge + title bar + snippet bar + meta bar
Filter rail → 3 group headings with 4 option bars each
```

Rules:

- the toolbar renders immediately with the query echoed, so the user knows their input was received
- the count position is reserved, showing nothing rather than "0 results" before data arrives
- five skeleton rows is enough; twenty implies a promise about the result count

Never show "0 results" while loading. It is the wrong answer, briefly, and users act on it.

---

## Loading — Suggestions

The suggestion panel keeps its previous content and shows a thin progress line at its top edge.

Recent searches remain visible during the first fetch, so the panel is never empty.

Never replace suggestions with a spinner. The user is typing and needs continuity.

---

## Loading — Refinement

Keep the previous results visible.

Dim the list to 60% and show a progress line at the top of the results region.

Preserve scroll position; a refinement that jumps the user to the top loses their place in a list they were already reading.

---

## Empty — No Query Yet

The pre-query panel is a real state with real value, not a blank surface.

```
┌──────────────────────────────┐
│ RECENT                       │
│ ↻ overdue invoices           │
│ ↻ northwind                  │
│ ↻ INV-0142                   │
│              Clear recent    │
├──────────────────────────────┤
│ SAVED                        │
│ ↻ Overdue this month         │
├──────────────────────────────┤
│ Search invoices, clients,    │
│ notes, and files by name,    │
│ number, or content.          │
└──────────────────────────────┘
```

For a first-time user with no history, state what is searchable and give one example query.

---

## Empty — Nothing Searchable Yet

When the account genuinely has no data, search must not blame the query.

```
There's nothing to search yet.

Invoices, clients, and notes become
searchable as soon as you create them.

[ Create your first invoice ]
```

---

## Empty — Zero Results For The Query

Handled in full in Interaction Flow. The required elements are the echoed query, a correction if available, filter diagnosis with counts, a broader fallback, and a non-search route.

---

## Empty — Zero Results Because Of Filters

Distinct from a query that matches nothing, and the difference must be visible.

```
24 matches for "invoice mar", but none are Overdue and from Marina Ltd.

[ Remove "Overdue" · 12 ]   [ Remove "Marina Ltd" · 18 ]   [ Clear all · 24 ]
```

Naming the count behind each removal lets the user choose the most productive undo.

---

## Empty — Saved Search Now Returns Nothing

The saved search is preserved, not deleted, and its criteria are shown.

```
"Overdue this month" has no results today.

Nothing is overdue. This search will
show results again when something is.

[ Edit search ]   [ Search all invoices ]
```

An empty result is sometimes good news, and the copy should reflect that.

---

## Error — Suggestions Failed

Suggestions are an enhancement. Their failure must not block submission.

Close the panel silently, keep the query, and let Enter run the full search.

Never show an error banner over a suggestion list. The user is mid-thought.

---

## Error — Results Failed

The results region shows the failure with the query intact.

```
┌──────────────────────────────┐
│ ⚠  We couldn't run that      │
│    search.                   │
│    Your query and filters    │
│    are still here.           │
│    [ Try again ]             │
└──────────────────────────────┘
```

---

## Error — Query Rejected

When a query cannot be processed, name the constraint and the fix.

```
Search needs at least 2 characters.
```

```
That query is too long. Try fewer than 200 characters.
```

Never return zero results for an invalid query. The user will conclude their data is missing.

---

## Error — One Source Failed

When search spans multiple indexes and one is unavailable, return what worked and label what did not.

```
Showing 18 invoices and 4 clients.
File search is unavailable right now. [ Retry files ]
```

Silently omitting a source is the most damaging failure in search, because the user reads absence as proof.

---

## Partial — Approximate Counts

When an exact total is expensive, say the count is approximate rather than presenting an estimate as fact.

```
About 1,200 results
```

---

## Partial — Truncated Index

When results are capped, state the cap.

```
Showing the first 500 matches. Narrow your search to see more.
```

---

## Success — Result Opened

The result opens in place, and the path back preserves the full search state.

Visited results are marked, so a user working down a list does not re-open the same record.

---

## Permission-Limited Results

When matches exist that the user may not open, the product must choose one behaviour and apply it consistently.

If the existence of the record is not sensitive, show it as restricted with a request path. If existence is sensitive, exclude it entirely and never hint at it in the count.

```
CONTRACT  Acme master agreement
You don't have access · [ Request access ]
```

Document this decision once. Inconsistency leaks the existence of records the count claims not to include.

---

# Mobile Behavior

- Touch targets minimum 44×44 for the clear control, suggestion rows, filter chips, and chip dismiss controls.
- Tapping the input opens a full-screen search view and keeps the keyboard raised.
- The keyboard's return key is labeled "Search" and submits.
- The input type avoids autocorrect and autocapitalisation, which corrupt names and identifiers.
- Voice input is offered where the platform provides it, and it populates the field rather than searching immediately, so the user can correct it.
- Filters open in a bottom sheet with an explicit apply showing the resulting count.
- Filter chips scroll horizontally with a visible edge affordance; they never wrap into three lines and push the results off-screen.
- Pagination is an explicit action, so returning from a result restores position reliably.
- Recent searches are the mobile fast path and appear immediately on focus.
- Result rows are two or three lines maximum; a fourth line makes the list unscannable at this width.

---

# Desktop Expansion

Added space is spent on:

- a persistent filter rail with live counts, removing the open-apply-close cycle
- matched context snippets long enough to identify the result without opening it
- saved searches as visible entry points rather than a hidden menu
- keyboard operation: `/` to focus, `Cmd/Ctrl+K` for the palette, arrows to traverse, Enter to open, `Cmd/Ctrl+Enter` to open in a new tab
- a preview pane for products where results are read more often than opened

Added space is never spent on:

- larger result thumbnails at the cost of context
- a third column of unrelated recommendations
- ten filter groups shown at once, which is a browse interface wearing a search costume
- animated transitions between result sets

---

# Accessibility Requirements

- The input uses `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant`, and the suggestion list uses `role="listbox"` with `role="option"` children.
- Focus stays in the input while arrowing through suggestions, so typing continues to work.
- Each suggestion's accessible name includes its type and distinguishing attribute: "Invoice INV-0142, Northwind Ltd, overdue".
- Matched-term emphasis uses a semantic mark element, so it is conveyed by more than colour and weight.
- The result count is announced through a polite live region on every change, including refinements: "24 results. 6 shown after filtering."
- Zero results is announced politely with the recovery available, never assertively; the user is not in danger, they are unsuccessful.
- A results loading failure is announced assertively, because the user is waiting on it.
- Focus moves to the results heading on submit, and the heading states the query and count.
- Filter options expose their result counts in their accessible names, so a screen reader user learns which filter is productive.
- Filter chips are buttons whose accessible names state the removal: "Remove filter: Overdue".
- Status indicators on results use text or an icon with an accessible name, never colour alone, so status survives greyscale.
- Keyboard shortcuts are discoverable in the input's hint text and do not conflict with assistive technology or browser defaults.
- At 200% zoom the filter rail collapses to the mobile sheet pattern and results remain a single readable column.
- Reduced motion removes suggestion panel animation and result list transitions.

---

# Data Requirements

Before implementation, confirm for the search system:

```
Which entity types are searchable

Which fields of each type are indexed

Index freshness: how long after a change a record becomes findable

Ranking inputs and their relative weight

Whether personalisation or boosting is applied, and whether it is disclosed

Tokenisation behaviour for identifiers, punctuation, and hyphens

Stemming, synonym, and stop-word rules

Whether the count is exact or approximate, and any cap

Permission model: filtered at index time or at query time

Where recent searches are stored and how long they are kept

Whether saved searches are per-user or shareable
```

Also define, per surface:

```
Default scope and how the user changes it

Default sort

Which filters exist and what generates their counts

Behavior when one index is unavailable
```

Identifier tokenisation is the most common silent failure in search. If "INV-0142" does not match "0142", users will conclude the record does not exist.

Index lag must be documented and surfaced. A user who creates a record and cannot find it two seconds later will file a bug and lose trust.

---

# Performance Requirements

- Suggestions return within 150ms on a warm index. Beyond 400ms the feature is slower than typing the full query and submitting.
- Requests are debounced at 150ms and in-flight requests are cancelled on query change.
- Out-of-order responses are discarded by comparing against the current query.
- The first page of results renders within one second; subsequent pages within 500ms.
- Permission filtering happens server-side. The client never receives records the user may not see.
- Filter counts are computed in the same request as results, so the rail and the list can never disagree.
- Results are cached for the session so back navigation restores instantly without a re-fetch.
- Result rows carry fixed heights so skeleton to content causes no layout shift.

---

# Anti-Patterns

Never build:

- a search box with no scope label, so users cannot know what it searches
- suggestions that reorder while the user is arrowing through them
- a suggestion list replaced by a spinner on every keystroke
- "0 results" shown during loading
- a zero-results state with no correction, no filter diagnosis, and no alternative route
- identical treatment of zero-matches and zero-after-filtering
- filter options hidden when their count is zero, concealing the shape of the data
- filters applied without appearing in the URL, so results cannot be shared
- a back navigation that loses the query, the filters, or the scroll position
- infinite scroll on results that must be returned to
- relevance ranking with no way to sort deterministically
- a source silently omitted when its index is unavailable
- highlighted matches conveyed by colour alone
- recent searches that cannot be cleared
- a saved search deleted because it currently returns nothing
- autocorrect and autocapitalisation left enabled on a field that receives identifiers
- a search that returns records the user cannot open, with no explanation and no request path
- a count that includes records excluded by permission

---

# Pattern Output Example

```
Product

Freelance Operations Platform


Primary Question

Where is the specific invoice, client, or note I remember?


Entry Points

App shell input · "/" focus · Cmd+K palette · scoped section inputs


Searchable Types

Invoices · Clients · Notes · Files


Suggestion Groups

Recent · Direct matches · Completions · Create action


Suggestion Latency

150ms debounce, 150ms target response, cancel on change


Ranking

Relevance default, stated in toolbar, date and name sorts available


Boosting Disclosure

"Your team's records first" shown when applied


Filters

Type, status, date range, with live counts, zero-count options disabled


State Persistence

Query, scope, filters, sort, and page in the URL


Zero Results

Query echoed, correction offered, filter counts for each removal, browse route


Index Lag

Under 2 seconds, surfaced as "Just created items may take a moment"


Partial Failure

Working sources returned and labeled, failed source named with retry


Permission Model

Filtered at query time, restricted records shown with request path


Mobile

Full-screen search view, bottom-sheet filters with result count on apply


Accessibility

Combobox semantics, polite count announcements, greyscale-safe status


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every search input states its scope
- [ ] Suggestions appear from the second character and are grouped with headings
- [ ] Recent searches show before any query is typed
- [ ] Direct matches carry enough detail to be identified
- [ ] Matched terms are emphasised semantically, not by colour alone
- [ ] The suggestion list never reorders during keyboard traversal
- [ ] Out-of-order responses are discarded
- [ ] "0 results" never appears while loading
- [ ] Query, scope, filters, sort, and page are all in the URL
- [ ] The query remains in the input after submission
- [ ] Focus moves to the results heading on submit
- [ ] Result count and active sort are stated above the results
- [ ] Ranking that is boosted or personalised is disclosed
- [ ] Every result shows matched context, not just a title
- [ ] Filter options show counts and zero-count options are visible but disabled
- [ ] Active filters appear as removable chips with Clear all
- [ ] Zero-matches and zero-after-filtering are visibly different states
- [ ] Zero results offers correction, filter diagnosis with counts, and a non-search route
- [ ] A saved search returning nothing is preserved with its criteria
- [ ] Suggestion failure does not block full search
- [ ] A failed index is named rather than silently omitted
- [ ] Approximate or capped counts are labeled honestly
- [ ] Back from a result restores query, filters, and scroll position
- [ ] Visited results are marked
- [ ] Identifiers match on partial input
- [ ] Index lag is documented and surfaced
- [ ] Permission filtering is server-side and consistent with the count
- [ ] Autocorrect and autocapitalisation are disabled on mobile
- [ ] Result status survives greyscale
- [ ] 200% zoom collapses the filter rail without breaking results
- [ ] Reduced motion removes panel and list animation

---

# Final Rule

Search succeeds when the user finds the one thing and understands why it was found.

Every element must justify itself against one question:

Does this get the user closer to the specific thing they came for?

A feature that increases the number of results without increasing the chance of recognition has made search worse. Remove it.
