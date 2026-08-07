# Kanban Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Layout Intelligence, Cards Component, Lists Component, Drawers Component, Motion System, Accessibility Intelligence

---

# Purpose

The Kanban Pattern defines the complete solution for screens whose job is to show where work currently sits and let someone move it forward.

A board is not a prettier task list.

A board is a shared model of a process. Its columns are the stages a real organisation actually uses, and its value comes from making bottlenecks visible before anyone reports them.

If a team looks at a board and cannot tell which stage is blocked, the board failed regardless of how smoothly the cards drag.

---

# When To Use

Use this pattern when:

- work moves through a small number of named, ordered stages
- stage membership is the most important attribute of an item
- multiple people need a shared view of who is doing what
- the count of items in a stage carries meaning

---

# When Not To Use

Do not use this pattern when:

- items have no stages, only attributes — use a filtered list or table
- there are more than seven stages — the board becomes horizontal scrolling with no overview
- a single person manages a handful of items — a checklist is faster
- items are ranked by date rather than by stage — use a calendar or timeline
- users must compare many fields across items — use a table

The most common product mistake is converting a table into a board because boards look modern, producing columns nobody can name and cards that hide the fields people actually needed.

---

# User Goal

The primary goal is always one of three:

```
Where does everything stand?

↓

What is stuck?

↓

Move this one forward
```

A board must answer the first question in the first viewport without horizontal scrolling on desktop.

---

# User Journey

```
Opens the board to check state

↓

Scans column headers and counts

↓

Spots an overloaded or stalled stage

↓

Scans cards within that stage

↓

Opens one card for detail

↓

Updates it or moves it to the next stage

↓

Confirms the board reflects the change

↓

Returns later to verify it progressed
```

The confirmation step is the one products forget.

A move that appears to succeed locally and silently fails on the server destroys trust in the entire board, because the user's mental model and the shared state have diverged without any signal.

---

# UX Flow

## Entry

The user arrives from:

- a bookmark or app launch, checking overall state
- a notification about a specific item, needing that card highlighted in place
- a search result, needing the card revealed with its column context
- a deep link shared by a colleague, expecting the same filters that colleague saw

An arrival targeting a single card must scroll that card into view, highlight it briefly, and keep the surrounding board visible so context is not lost.

---

## Scan

Within the first viewport, the user must be able to determine:

- what stages exist and their order
- how many items sit in each stage
- which stage is over its limit
- what filters are currently applied

---

## Locate

Finding a specific card follows one of three routes:

```
Scan a column

↓

Filter the board

↓

Search across columns
```

Filtering must dim or remove non-matching cards without collapsing columns, so the process shape stays recognisable while filtered.

---

## Move

Every move follows the same contract:

```
Move initiated

↓

Card appears in the target column immediately

↓

Server confirms

↓

Or the card returns with a stated reason
```

Optimistic movement is required. Waiting for a server round trip before showing the card in its new column makes the board feel broken on any imperfect connection.

Optimistic movement without a visible rollback is worse than no optimism at all.

---

## Act

Moving a card is one action among several. Assigning, commenting, and editing all belong in the card detail, reachable in one interaction from the board.

The board surfaces the state. The detail view holds the work.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Board name        ⚙  🔍  │
├──────────────────────────┤
│ ‹ In Progress (4/5)    › │  column switcher
├──────────────────────────┤
│ ●Mine ✕   ●Due week ✕    │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Fix checkout timeout │ │
│ │ ⬤ High  · ULN-482    │ │
│ │ 👤 Ade    Due Fri    │ │
│ │              [ ⋮ ]   │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Update refund copy   │ │
│ │ ⬤ Low   · ULN-491    │ │
│ │ 👤 Sam    Due Mon    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ + Add card           │ │
│ └──────────────────────┘ │
└──────────────────────────┘
│ Bottom navigation        │
└──────────────────────────┘
```

Mobile rules:

- One column at a time. Side-by-side columns on a phone produce cards too narrow to read and drag targets too small to hit.
- The column switcher shows the current stage, its count, and its limit, with adjacent stages reachable by tap or horizontal swipe.
- Drag and drop is not the primary move mechanism on mobile. The card's overflow menu opens a `Move to` sheet listing every stage with its current count.
- Where drag is supported, it requires a 200ms long press to begin, so vertical scrolling is never captured accidentally.
- Cards show at most four lines: title, one metadata row, assignee and date, and a status indicator.
- Card tap opens detail. The overflow control is a separate 44×44 target.
- The add-card affordance sits at the end of the column, not floating, so it does not obscure the last card.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Board name          Filter ▾  🔍  ⚙        │
├──────────────┬──────────────┬──────────────┤
│ To Do    (7) │ In Prog (4/5)│ Done    (12) │
├──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ card     │ │ │ card     │ │ │ card     │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ card     │ │ │ card     │ │ │ card     │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
│ + Add        │ + Add        │ + Add        │
└──────────────┴──────────────┴──────────────┘
```

Three columns visible, remaining columns reached by horizontal scroll with a visible edge affordance. Drag becomes practical at this width but the move menu remains available on every card.

---

## Desktop

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │ Sprint 14   Filter ▾  Group ▾  🔍   ⚙        [ + Card ]  │
│ Nav  ├──────────────┬──────────────┬──────────────┬─────────────┤
│      │ Backlog  (14)│ To Do    (7) │ In Prog (5/5)│ Done   (12) │
│      │              │              │ ⚠ At limit   │             │
│      ├──────────────┼──────────────┼──────────────┼─────────────┤
│      │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌─────────┐ │
│      │ │ ULN-482  │ │ │ ULN-491  │ │ │ ULN-455  │ │ │ ULN-402 │ │
│      │ │ Fix time-│ │ │ Update   │ │ │ Migrate  │ │ │ Ship v2 │ │
│      │ │ out bug  │ │ │ copy     │ │ │ payments │ │ │         │ │
│      │ │ ⬤High 👤 │ │ │ ⬤Low  👤 │ │ │ ⬤High 👤 │ │ │ ✓  👤   │ │
│      │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └─────────┘ │
│      │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │             │
│      │ │ card     │ │ │ card     │ │ │ card     │ │             │
│      │ └──────────┘ │ └──────────┘ │ └──────────┘ │             │
│      │ + Add        │ + Add        │ + Add        │ + Add       │
└──────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

Desktop rules:

- Four to six columns visible without horizontal scrolling. Beyond six, the process needs consolidating, not a wider monitor.
- Column headers are sticky during vertical scroll so counts and limits remain visible.
- Each column scrolls independently. A single page scroll across columns of different lengths makes short columns unusable.
- The at-limit warning appears in the column header, not on cards, because the limit is a property of the stage.
- Column width is fixed between 280px and 320px. Elastic columns that expand to fill the viewport make cards inconsistent between boards.

---

# Component Hierarchy

```
KanbanBoard
├── BoardToolbar
│   ├── BoardTitle
│   ├── FilterControl
│   ├── GroupByControl          swimlane selector
│   ├── BoardSearch
│   ├── BoardSettings
│   └── CreateCardAction
├── ActiveFilterBar
│   └── FilterChip ×n
├── SwimlaneGroup ×n            optional
│   ├── SwimlaneHeader
│   │   ├── SwimlaneLabel
│   │   ├── SwimlaneCount
│   │   └── CollapseToggle
│   └── ColumnTrack
│       └── BoardColumn ×n
│           ├── ColumnHeader
│           │   ├── ColumnName
│           │   ├── ItemCount
│           │   ├── WipLimitIndicator
│           │   └── ColumnMenu
│           ├── CardList
│           │   └── BoardCard ×n
│           │       ├── CardIdentifier
│           │       ├── CardTitle
│           │       ├── PriorityIndicator
│           │       ├── LabelChips
│           │       ├── AssigneeAvatar
│           │       ├── DueIndicator
│           │       ├── BlockedIndicator
│           │       └── CardMenu
│           ├── DropPlaceholder
│           ├── ColumnEmptyState
│           └── AddCardAction
├── MobileColumnSwitcher
├── MoveCardSheet               mobile primary move mechanism
├── CardDetailPanel             drawer on desktop, full screen on mobile
└── BoardStates
    ├── BoardSkeleton
    ├── BoardEmptyState
    ├── FilteredEmptyState
    └── BoardErrorState
```

Reuse rules:

- `BoardCard` is one component with variants driven by data presence, never a card type per column.
- The card detail panel is the product's standard drawer, so dismissal, focus trapping, and width behave identically everywhere.
- The move sheet on mobile and the move submenu on desktop render the same destination list component.

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

## Drag And Drop — Pointer

1. Pressing and moving beyond a 5px threshold begins the drag. A threshold prevents a click being interpreted as a drag.
2. The card lifts: elevation increases, it rotates by 2 degrees, and it follows the pointer at 95% opacity.
3. A placeholder of the card's exact height remains in the origin position so the source column does not collapse.
4. Valid target columns receive a subtle outline. A column at its limit receives a warning outline, not a blocked one, because limits are advisory.
5. Hovering a column shows an insertion placeholder at the exact drop index. Other cards shift over 150ms.
6. Near the horizontal edge of the board, the board auto-scrolls at a rate proportional to proximity, capped so it never outruns the user's control.
7. On release, the card animates into position over 200ms, the counts update, and the drag state clears.
8. The change persists in the background.

## Drag Failure Mid-Drop

If the persistence request fails after an optimistic drop:

1. The card animates back to its original column and index over 300ms, slowly enough to be seen.
2. Counts revert in both columns.
3. A persistent inline message appears at the top of the board, not a toast that disappears before it is read.

```
┌──────────────────────────────────────────────┐
│ ⚠ Couldn't move ULN-482 to In Progress.      │
│   The card is back in To Do.  [ Try again ]  │
└──────────────────────────────────────────────┘
```

4. Retry re-attempts the same move without requiring the user to drag again.

If the drop fails because someone else moved the card first, state that specifically: `Sam moved this card to Done a moment ago.` and offer to reload the card rather than to retry blindly.

If the pointer is released outside any valid target, the card returns to origin over 200ms with no error. A cancelled drag is not a failure.

If the drag is interrupted by the tab losing focus or the pointer being lost, treat it as a cancellation and restore the card.

## Keyboard Move — Required Equivalent

Drag and drop must never be the only way to move a card.

1. Tab focuses a card. The focus ring is clearly visible against the card surface.
2. Space or Enter picks the card up and enters move mode. A live region announces: `Fix checkout timeout, grabbed from To Do, position 2 of 7.`
3. Arrow Left and Right move between columns. Arrow Up and Down move the position within a column.
4. Each movement announces the new destination: `In Progress, position 1 of 5. Column is at its limit of 5.`
5. Space or Enter drops the card. The live region announces: `Moved to In Progress, position 1 of 6.`
6. Escape cancels and returns the card to its original position, announcing the cancellation.
7. Focus remains on the moved card so consecutive moves are possible.

The keyboard path must support every move the pointer path supports, including reordering within a column and moving across swimlanes.

## Move Via Menu

Available on every card at every breakpoint, and the primary mechanism on mobile.

1. The card menu opens with a `Move to` option.
2. The destination list shows every column with its current count and limit state.
3. Selecting a destination moves the card to the end of that column and confirms inline on the card.
4. The current column is listed but disabled with its state stated.

This path is what makes the board usable with a screen reader, with a switch device, on a phone, and by anyone whose drag failed twice.

## WIP Limit Interaction

Limits are advisory, not enforced.

1. A column at its limit shows a warning in its header: `In Progress (5/5) · At limit`.
2. A column over its limit escalates the treatment and states the overage: `In Progress (7/5) · Over by 2`.
3. Dropping into a full column succeeds and produces a confirmation that names the consequence: `Moved. In Progress is now over its limit of 5.`
4. Where an organisation genuinely blocks overfilling, the block must be stated before the drop begins, with the target column visibly non-droppable and the reason given on hover and focus.

Silently rejecting a drop into a full column is the worst possible behaviour, because the user sees the card snap back with no explanation.

## Swimlanes

1. Swimlanes group rows by one attribute: assignee, priority, epic, or customer.
2. Each swimlane header shows its label and total count and can collapse.
3. Collapsed swimlanes persist per user across sessions.
4. Dragging between swimlanes changes the grouping attribute and must confirm that change explicitly, because moving a card from the "Ade" lane to the "Sam" lane reassigns it.
5. On mobile, swimlanes become a filter rather than a nested layout. Two levels of nesting inside one narrow column is unreadable.

## Card Creation

1. The add action inserts an inline composer at the end of the column, not a modal.
2. The title field autofocuses. Enter creates and immediately opens a new composer beneath, supporting rapid entry.
3. Escape closes the composer, discarding an empty title without a confirmation prompt.
4. A created card appears optimistically and marks itself as saving until confirmed.

---

# States

Every column owns its own states. A failing column must not blank the board.

## Loading — First Visit

Skeletons matching real column and card geometry.

```
Column header  → name bar + count chip
Card           → title bar + metadata bar + avatar circle
```

Render three skeleton cards per column, which is enough to establish the shape without implying a specific count.

Column headers render with real names as soon as the board structure resolves, before card data arrives, because the process shape is the most valuable thing on the screen.

---

## Loading — Refresh Or Filter Change

Keep existing cards visible. Dim to 60% and show a thin progress line under the toolbar.

Never replace a populated board with skeletons on refresh. A user who sees skeletons cannot tell whether their filter matched nothing or the board is still loading.

---

## Loading — Card Persisting

A card whose move or edit is in flight shows a subtle saving indicator in its corner and remains fully readable.

The card is not disabled during save. Blocking interaction on a card for the duration of a network request makes a fast board feel slow.

---

## Empty — Board Has No Cards

This is a new-project state and it determines whether the board gets adopted.

```
┌──────────────────────────────┐
│         [illustration]       │
│                              │
│  Nothing on this board yet   │
│                              │
│  Add your first card to      │
│  To Do, or import from a     │
│  spreadsheet.                │
│                              │
│  [ Add first card ]          │
│  Import cards                │
└──────────────────────────────┘
```

Columns still render with their names, because the stage structure is the first thing a new team needs to review.

---

## Empty — Column Has No Cards

A quiet drop-target message inside the column, sized to the height of one card so the column does not collapse.

```
┌──────────────┐
│              │
│  Nothing in  │
│  Review      │
│              │
│  + Add card  │
└──────────────┘
```

An empty column must remain a valid drop target with a clearly indicated area. A zero-height empty column is impossible to drop into.

---

## Empty — No Cards Match The Filter

Different from an empty board, and shown at board level rather than per column.

```
┌────────────────────────────────────────┐
│ No cards match Mine · Due this week    │
│                                        │
│ Removing "Due this week" shows 9 cards.│
│                                        │
│ [ Remove date filter ]   [ Clear all ] │
└────────────────────────────────────────┘
```

Columns remain visible with zero counts so the user can see the filter applied across the whole process rather than to an empty page.

---

## Error — Column Failed To Load

The column shows the failure. Other columns keep working and remain droppable.

```
┌──────────────┐
│ Review    ⚠  │
├──────────────┤
│ Couldn't load│
│ this column. │
│ [ Retry ]    │
└──────────────┘
```

A failed column is not a valid drop target, and this must be visible during a drag rather than discovered on release.

---

## Error — Board Failed To Load

Only when nothing renders. Required: cause, retry, and a support route with a reference identifier.

---

## Error — Move Rejected

Covered in the interaction flow. The requirements are: the card returns visibly, counts revert, the reason is stated in persistent text, and retry does not require repeating the gesture.

---

## Partial — Some Cards Hidden By Permissions

When a user can see a board but not every card, state the omission once at board level rather than rendering locked placeholder cards.

```
3 cards are hidden by your access level.
```

Counts in column headers must state whether they include hidden cards. A count that disagrees with the visible cards makes the board look broken.

---

## Stale — Board Changed By Someone Else

For collaborative boards, remote changes apply live with a brief highlight on the affected card lasting 1.5 seconds.

A remote change must never move a card the current user is dragging or has focused in keyboard move mode. Defer the update until the interaction completes, then apply it with the highlight.

Where live updates are not available, show the data age in the toolbar and offer a manual refresh once it exceeds five minutes.

---

## Success

Moves confirm silently through the board's own state change. A toast for every successful drag is noise.

Confirmation is required only when the move had a consequence the user might not have intended: crossing a WIP limit, changing an assignee via a swimlane move, or triggering an automation.

```
Moved to Done. Ade was notified.
```

---

## Permission-Limited — Read-Only Access

Cards render fully but are not draggable, the add action is absent, and the reason is stated once in the toolbar.

```
You have view access to this board.
```

Never render a drag affordance that does nothing, and never let a drag begin before revealing that moves are not permitted.

---

# Mobile Behavior

- One column visible at a time with a switcher showing the current stage, count, and limit.
- Horizontal swipe moves between columns. Vertical scroll moves through cards. These gestures never compete because they operate on different axes.
- Move by menu is the primary mechanism. Drag requires a 200ms long press and is a secondary path.
- All interactive targets are minimum 44×44, including the card menu, which must not overlap the card's tap area.
- Card detail opens as a full-screen view with an explicit back action, not a partial sheet that leaves the board half-visible and unusable.
- The card composer keeps its input above the keyboard, and the create action is reachable without dismissing the keyboard.
- Swimlanes become a grouping filter rather than nested rows.
- Pull to refresh revalidates the board without resetting filters or the current column.
- Long card titles wrap to three lines maximum, then truncate with the full title available in detail.

---

# Desktop Expansion

Added space is spent on:

- four to six columns visible simultaneously, giving genuine process overview
- the card detail panel opening beside the board rather than over it, so context is retained while editing
- keyboard shortcuts for creating, moving, and filtering
- swimlanes as real nested rows
- hover-revealed quick actions on cards for assignment and priority

Added space is never spent on:

- wider columns that reduce the number of visible stages
- cards showing every field, which destroys scannability
- a board stretched across an ultrawide monitor with 200px of gap between columns
- more than six columns, which is a process problem rather than a layout problem

---

# Accessibility Requirements

- The board is a set of labelled regions, one per column, each named by its column heading and stating its count.
- Each column's card list uses list semantics so position and length are announced: `card 3 of 7`.
- Every card is focusable in a logical order: down each column, then to the next column.
- Keyboard move mode is mandatory and must reach every destination the pointer can reach, including within-column reordering.
- Grab, move, drop, and cancel each produce an assertive announcement, because these are the user's only feedback in the absence of visual drag.
- Column and position are always included in move announcements, since a screen reader user has no spatial model of the board.
- WIP limit state is announced when entering a column during a keyboard move.
- The move-by-menu path is always available and never hidden behind a hover-only affordance.
- Priority, blocked status, and due state are conveyed by text or icon plus text, never colour alone. The board must remain fully usable in greyscale.
- Focus is never lost after a move. Focus follows the card to its new position.
- Focus is never lost after a delete. Focus moves to the adjacent card, or to the column's add action if the column is now empty.
- The card detail panel traps focus, closes on Escape, and returns focus to the originating card.
- Live region politeness is calibrated: drag announcements are assertive, remote collaborator changes are polite, and background refreshes are silent.
- Respect reduced motion: cards move instantly to their new position instead of animating, the lift rotation is removed, and the rollback animation becomes an immediate reposition paired with the error message.
- At 200% zoom the board keeps its column structure with horizontal scrolling, which is the acceptable exception to the no-horizontal-scroll rule because column adjacency is the pattern's core meaning.

---

# Data Requirements

Before implementation, confirm for the board:

```
Source of truth for card state

Column definitions and their order, and who may change them

Whether stage is a real field or derived from other attributes

Card ordering within a column: manual rank, or a sorted field

Conflict resolution when two people move the same card

WIP limits: per column, advisory or enforced, and who sets them

Swimlane grouping attributes available

Which fields appear on the card versus in detail

Maximum cards per column before virtualisation is required

Permission model: view, move, edit, create, per board and per card

Behaviour when the realtime channel is unavailable

Automation triggered by a stage change, and whether it is reversible
```

Manual ordering requires a rank field that survives concurrent insertion. Ordering by array index guarantees cards will silently reorder for one user when another inserts a card.

Never ship a board where a stage change triggers an irreversible action without stating it before the move.

---

# Performance Requirements

- The board structure with column names renders under 500ms; cards follow progressively.
- Drag animation runs at 60fps using transform only. Any drag implementation that triggers layout on pointer move will stutter on a long board.
- Columns exceeding 50 cards are virtualised, with the drag layer accounting for virtualised items so dropping below the rendered window still works.
- Card data is fetched per column so one slow column does not delay the board.
- Optimistic updates apply locally before the request is sent; the request is never awaited before the visual move.
- Rapid consecutive moves are queued in order rather than fired concurrently, preventing the server from receiving an out-of-order rank sequence.
- Realtime updates are batched at no more than four applications per second so a busy board does not thrash.
- Filtering runs client-side against loaded cards where the board is under 500 cards, and server-side above that.

---

# Anti-Patterns

Never build:

- a board where drag and drop is the only way to move a card
- a drop that silently fails with the card snapping back and no explanation
- a full column that rejects a drop without having shown it was non-droppable
- optimistic moves with no rollback path
- a toast confirmation for every successful drag
- more than seven columns, hiding a process that needs redesigning
- cards displaying every available field, making the column unscannable
- an empty column rendered at zero height, impossible to drop into
- swimlanes nested inside a single narrow mobile column
- a remote update that moves a card while the user is dragging it
- horizontal page scrolling that moves column headers out of view
- a board that loses filters and scroll position when returning from card detail
- counts in column headers that disagree with visible cards
- priority conveyed only by colour
- drag handles that appear only on hover, making them unreachable by touch and keyboard
- a stage change that silently triggers an irreversible automation

---

# Pattern Output Example

```
Product

Engineering Delivery Tracker


Primary Question

What is stuck?


Columns

Backlog, To Do, In Progress, Review, Done — 5 stages, order fixed by admin


WIP Limits

In Progress 5, Review 3 — advisory, overage stated on drop


Card Fields

Identifier, title, priority, assignee, due date, blocked flag


Ordering

Manual rank with fractional indexing, concurrent-safe


Move Mechanisms

Pointer drag, keyboard move mode, move-by-menu — all three complete


Mobile

Single column with switcher; move-by-menu primary; drag on long press


Swimlanes

By assignee on desktop; becomes a filter on mobile


Drop Failure

Card animates back, counts revert, persistent message, one-tap retry


Conflict

Names the colleague and the change, offers reload rather than blind retry


Realtime

Live updates, deferred during any active drag or keyboard move


Empty Column

One-card-height drop target with add action


Accessibility

Keyboard move mode with assertive position announcements; greyscale-safe priority


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every column name reflects a real stage the team uses
- [ ] Column counts and WIP limits are visible in headers
- [ ] Six columns or fewer are visible on desktop without horizontal scroll
- [ ] Column headers stay visible during vertical scroll
- [ ] Each column scrolls independently
- [ ] Drag shows an origin placeholder so the source column does not collapse
- [ ] Drop index is indicated before release
- [ ] Board auto-scrolls near the edge at a controllable rate
- [ ] Cancelled drags return the card with no error
- [ ] Failed drops animate the card back, revert counts, and state the reason persistently
- [ ] Retry after a failed move does not require repeating the gesture
- [ ] Conflicts name the other person and offer reload
- [ ] Keyboard move mode reaches every destination including within-column reorder
- [ ] Grab, move, drop, and cancel are all announced with column and position
- [ ] Move-by-menu is available on every card at every breakpoint
- [ ] Empty columns remain valid, visible drop targets
- [ ] Filtered-empty differs from board-empty and keeps columns visible
- [ ] A failed column does not break the board and is not droppable
- [ ] Full columns state the consequence rather than silently rejecting
- [ ] Remote updates never move a card mid-interaction
- [ ] Focus follows a moved card and survives deletion
- [ ] Priority and blocked state survive greyscale
- [ ] Mobile uses one column, 44×44 targets, and menu-based moves
- [ ] Reduced motion removes lift, rotation, and reposition animation
- [ ] Filters and scroll position survive returning from card detail

---

# Final Rule

A board earns its place by making the state of work obvious to everyone who looks at it, at the same time, without asking.

Every element must justify itself against one question:

Does this help someone see where work is stuck, or move it forward?

If it does neither, it is decoration on a process diagram.
