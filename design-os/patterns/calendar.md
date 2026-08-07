# Calendar Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Layout Intelligence, Data Display System, Forms System, Motion System, Mobile First, Accessibility Intelligence

---

# Purpose

The Calendar Pattern defines the complete solution for screens where time is the primary organising axis.

A calendar is not a grid of boxes. It is a spatial answer to two questions: what is happening, and when am I free.

Everything hard about calendars comes from the fact that time is not uniform. Days have different lengths across DST boundaries, timezones disagree, events overlap, recurrence has exceptions, and the same appointment means different things to the person who created it and the people invited to it.

A calendar succeeds when a user can look at a week and know, without counting, where their free time is.

---

# When To Use

Use this pattern when:

- users own and manage their own time
- events must be seen in relation to each other
- free space matters as much as occupied space
- overlap and conflict are meaningful
- items are created, moved, and deleted directly on the time axis

---

# When Not To Use

Do not use this pattern when:

- the user is choosing from someone else's availability — use the Booking Pattern
- items have deadlines but no duration — use a list sorted by date
- the work is a pipeline of stages — use a Kanban pattern
- there are fewer than a handful of dated items — use a list
- the user only needs to know what is next — use a single upcoming card

The most common product mistake is rendering a month grid for data that has no duration. A month grid full of single-line labels is a worse list than a list.

---

# User Goal

The primary goal is always one of five:

```
What is happening next?

↓

When am I free?

↓

Put something in my calendar

↓

Move something that changed

↓

Coordinate with other people's time
```

Mobile users overwhelmingly want the first two. Desktop users want the last three.

That split determines the default view on each device, and it is why a mobile calendar defaulting to month view is almost always wrong.

---

# User Journey

```
Opens with a time question

↓

Orients to now

↓

Scans the relevant range

↓

Identifies free space or a conflict

↓

Creates or moves an event

↓

Confirms the change took effect

↓

Returns later and finds the calendar unchanged except by intent
```

The last step matters more than it sounds.

A calendar that silently shifts events across timezones or DST boundaries destroys the user's trust permanently, because the user's memory says one thing and the screen says another.

---

# UX Flow

## Entry

The user arrives from:

- app launch, wanting orientation — land on today, in the device-appropriate view
- a notification, wanting one event — land on that event, opened, in day or week context
- a share link, wanting an event they do not own — land on read-only detail
- a create action elsewhere, wanting to place something — land in creation with the time pre-filled

Every entry must resolve to a visible "now" marker. A calendar that opens without showing where the present is forces the user to search for themselves.

---

## Orient

Within the first viewport the user must be able to determine:

```
What range am I looking at

↓

Where is now

↓

What is next

↓

Where is the free space
```

The current day is marked distinctly. The current time is marked with a line in day and week views.

---

## Navigate

```
Previous / next range

↓

Jump to today

↓

Jump to an arbitrary date

↓

Change granularity
```

Rules:

- "Today" is always one action away, from every view, at every distance.
- The range label is always visible and unambiguous: "March 2026", "2–8 March 2026".
- Changing granularity preserves the anchor date. Switching from month to day on 14 March lands on 14 March, never on today.
- Navigation is available by swipe on touch, by button everywhere, and by keyboard on desktop.

---

## Inspect

```
Event chip

↓

Summary popover or sheet

↓

Full detail

↓

Edit
```

A single tap shows a summary. Editing is a deliberate second step, because a mis-tap on a calendar can silently change someone else's schedule.

---

## Create

Two entry paths, both required:

```
Explicit create action  →  form with today's next round time

Direct time interaction →  form with that exact time pre-filled
```

Tapping empty space at 14:00 must produce an event starting at 14:00. Producing a form defaulted to 09:00 wastes the interaction entirely.

---

## Modify

```
Drag to move

↓

Resize to change duration

↓

Confirm if the change affects others

↓
Update, with undo available
```

Every direct manipulation is undoable for a stated window, because drag is easy to do accidentally.

---

# Screen Layout

## Mobile

Default view is a scrolling agenda, not a month grid.

```
┌──────────────────────────┐
│ March 2026        Today  │
│ M  T  W  T  F  S  S      │
│ 2  3  4 [5] 6  7  8      │
│ ·  ·· ·   ··  ·  ·       │
├──────────────────────────┤
│ THURSDAY 5 MARCH · today │
│                          │
│ 09:00  Standup      30m  │
│ ─── now 10:42 ─────────  │
│ 11:00  Design review 1h  │
│        3 guests          │
│ 14:00  Client call   45m │
│        ⚠ overlaps Review │
│ 16:30  Focus block   2h  │
│                          │
│ Free: 09:30–11:00,       │
│       12:00–14:00        │
├──────────────────────────┤
│ FRIDAY 6 MARCH           │
│ 10:00  1:1 with Ana  30m │
│                          │
│              ┌─────────┐ │
│              │    +    │ │
│              └─────────┘ │
└──────────────────────────┘
```

Mobile rules:

- Agenda by default. A month grid on a 375px screen shows dots, and dots are not information.
- A compact week strip above the agenda gives month-level orientation without sacrificing readability.
- The now line is rendered in the agenda and the view scrolls to it on open.
- Free gaps are stated in text, because "when am I free" is the top mobile question and empty space in an agenda is invisible.
- Event chips are minimum 44px tall. Two overlapping events stack vertically with an overlap note rather than splitting into unreadable half-width columns.
- Drag to reschedule is disabled by default on touch; use long-press to enter a move mode with explicit target selection.
- The create action is a floating button in the thumb zone.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ ‹  2–8 March 2026  ›   Today   [Week ▾] + │
├─────┬──────┬──────┬──────┬──────┬──────────┤
│     │ Mon 2│ Tue 3│ Wed 4│ Thu 5│ Fri 6    │
├─────┼──────┼──────┼──────┼──────┼──────────┤
│ all │      │ Leave───────────►│          │ │
├─────┼──────┼──────┼──────┼──────┼──────────┤
│09:00│      │      │      │Stand │          │
│10:00│ Sync │      │      │      │ 1:1      │
│11:00│      │ Rev  │      │Review│          │
│12:00│      │      │      │      │          │
│13:00│      │      │ Lunch│      │          │
│14:00│      │      │      │Client│          │
│15:00│      │      │      │      │          │
└─────┴──────┴──────┴──────┴──────┴──────────┘
```

Five weekdays by default with weekend days reachable by scroll or setting. Business calendars waste 28% of their width on Saturday and Sunday.

---

## Desktop

```
┌───────────────┬────────────────────────────────────────────────┐
│ ‹ March 2026 ›│ ‹  2–8 March 2026  ›  Today  [Day|Week|Month] +│
│ M T W T F S S ├─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────┤
│ 2 3 4 5 6 7 8 │     │Mon 2│Tue 3│Wed 4│Thu 5│Fri 6│Sat 7│Sun 8 │
│ 9 ...         ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────┤
│               │ all │     │ Leave ──────────►    │     │      │
│ CALENDARS     ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────┤
│ ☑ Work        │08:00│     │     │     │     │     │     │      │
│ ☑ Personal    │09:00│     │     │     │Stand│     │     │      │
│ ☐ Holidays    │10:00│Sync │     │     │▓▓▓▓▓│1:1  │     │      │
│ ☑ Team        │11:00│     │Rev  │     │Revie│     │     │      │
│               │12:00│     │     │     │─ now│     │     │      │
│ TIMEZONES     │13:00│     │     │Lunch│     │     │     │      │
│ GMT+3 local   │14:00│     │     │     │Clien│     │     │      │
│ GMT+1 Berlin  │15:00│     │     │     │     │     │     │      │
└───────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴──────┘
```

Desktop rules:

- Week view is the default. It is the only granularity that shows both commitment and free space at a usable density.
- The mini month in the rail handles navigation so the main grid never has to.
- Calendar visibility toggles live in the rail and persist across sessions.
- A secondary timezone column is available for anyone coordinating across regions.
- Month view shows a maximum of three events per day cell plus a "+4 more" affordance. Cramming more makes every day unreadable.

---

# Component Hierarchy

```
CalendarPage
├── CalendarToolbar
│   ├── RangeNavigator
│   │   ├── PreviousAction
│   │   ├── NextAction
│   │   └── RangeLabel
│   ├── TodayAction
│   ├── ViewSwitcher            day / week / month / agenda
│   ├── DatePickerTrigger
│   └── CreateEventAction
├── CalendarSidebar             desktop only
│   ├── MiniMonth
│   ├── CalendarVisibilityList
│   │   └── CalendarToggle ×n
│   └── SecondaryTimezoneList
├── WeekStrip                   mobile only
├── AgendaView                  mobile default
│   ├── DayGroup ×n
│   │   ├── DayHeading
│   │   ├── EventRow ×n
│   │   ├── NowMarker
│   │   └── FreeGapSummary
│   └── LoadMoreSentinel
├── TimeGridView                week / day
│   ├── TimeAxis
│   ├── AllDayLane
│   │   └── AllDayEventBar ×n
│   ├── DayColumn ×n
│   │   ├── HourSlot ×24
│   │   ├── EventBlock ×n
│   │   │   ├── TimeLabel
│   │   │   ├── Title
│   │   │   ├── ConflictIndicator
│   │   │   └── ResizeHandle
│   │   └── NowLine
│   └── DragGhost
├── MonthGridView
│   └── DayCell ×n
│       ├── DateNumber
│       ├── EventChip ×3
│       └── OverflowAction
├── EventPopover                desktop
├── EventSheet                  mobile
├── EventEditor
│   ├── TitleField
│   ├── DateTimeFields
│   ├── TimezoneSelector
│   ├── AllDayToggle
│   ├── RecurrenceSelector
│   ├── GuestField
│   ├── LocationField
│   ├── ConflictWarning
│   └── SaveAction
├── RecurrenceScopeDialog       this / this and following / all
├── ConflictDialog
└── UndoToast
```

Reuse rules:

- `EventBlock` and `EventChip` are variants of one event component. Colour, density, and label truncation differ; the data contract does not.
- `EventEditor` is used for create and edit. Two editors guarantee two sets of validation rules.
- The recurrence scope dialog is shared by edit, move, and delete, because all three need the same question answered.

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

The change is visible and reversible
```

## Creating By Tapping Empty Space

1. The tapped time slot highlights immediately.
2. A provisional event block appears at that time with the default duration.
3. The editor opens with start time set to the tapped slot, snapped to the nearest 15 minutes.
4. Escape or dismiss removes the provisional block with no residue.
5. Save replaces the provisional block with the real event in place, without a view reload.

## Dragging To Reschedule

1. On drag start the block lifts with elevation and the original position remains visible at reduced opacity.
2. The drag ghost snaps to 15-minute increments and shows the target time continuously: "Thu 5 Mar, 15:15 – 16:00".
3. Columns and hour lines highlight as the pointer crosses them.
4. On drop, the change is applied optimistically and an undo toast appears for 10 seconds.
5. If the server rejects the change, the block animates back to its original position and the reason is stated.
6. If the drop lands on an existing event, the conflict is indicated but not blocked. Overlapping is legitimate.

Drag operations must be keyboard-equivalent. With a block focused, arrow keys move it in 15-minute steps, Shift with arrows changes duration, and Enter commits.

## Resizing To Change Duration

1. Resize handles appear on hover or on focus, never permanently on mobile.
2. Duration updates live in a label: "1h 45m".
3. Minimum duration is enforced at the snap increment and cannot be dragged below it.
4. Resizing past midnight extends into the next day rather than wrapping.

## Handling A Conflict

Conflicts are surfaced, not prevented.

```
┌──────────────────────────────────────────┐
│ ⚠ This overlaps 2 events                 │
│                                          │
│   11:00–12:00  Design review             │
│   11:30–12:00  1:1 with Ana              │
│                                          │
│   Ana is also busy at this time.          │
│                                          │
│   [ Book anyway ]  [ Find a free time ]  │
└──────────────────────────────────────────┘
```

"Find a free time" proposes the nearest gaps that fit the duration for all attendees. Warning without offering an alternative makes the user do the search manually.

## Editing A Recurring Event

Always ask the scope before applying anything.

```
┌──────────────────────────────────────────┐
│ Change which events?                     │
│                                          │
│ ○ This event only                        │
│ ● This and all following events           │
│ ○ All events in the series                │
│                                          │
│ 12 future events will change.             │
│                                          │
│ [ Cancel ]            [ Apply ]          │
└──────────────────────────────────────────┘
```

Rules:

- State how many events are affected. "All events" without a count is a blind commitment.
- Default to the safest meaningful scope, which is "this and following".
- Existing exceptions within the series are named before they are overwritten: "3 events in this series were edited individually and will be reset."

## Changing Timezone

1. An event's timezone is a property of the event, not of the view.
2. Changing the view timezone moves every block visually and states the change: "Showing times in GMT+1, Berlin."
3. Changing an event's timezone keeps its absolute instant and moves its wall-clock display.
4. Cross-timezone events display both times in the detail: "15:00 your time · 13:00 Berlin".

## Crossing A DST Boundary

1. A recurring event keeps its wall-clock time by default: a 09:00 standup stays at 09:00 after the clocks change.
2. Absolute-time series, such as a market open, are marked and keep their instant, shifting wall-clock time.
3. On the week containing the transition, label it: "Clocks change on 29 March. This week has 23 hours on Sunday."
4. A day-view rendering of a transition day shows the missing or repeated hour explicitly rather than silently compressing it.

Silent DST handling is the single most damaging calendar defect. It produces missed meetings the product cannot explain.

## Deleting

1. Delete asks for confirmation only when the event has guests or is recurring; a solo event deletes with undo instead.
2. Deleting a recurring instance asks for scope using the shared dialog.
3. Undo is available for 10 seconds and restores guests, recurrence, and attachments intact.
4. Deleting an event with guests offers to notify them, defaulting to notify.

---

# States

## Loading — First Visit

```
Toolbar        → renders immediately with the real range label
Time axis      → renders immediately, it is static
Day columns    → hour lines drawn, event area shimmer
All-day lane   → single shimmer bar
Now line       → drawn as soon as the local clock is read
Sidebar        → mini month drawn, event dots as shimmer
```

The grid structure appears in the first frame because it does not depend on data. Only events are skeletons.

The view scrolls to the working-hours start, or to the now line if now falls within the range, before events arrive so no scroll jump occurs later.

---

## Loading — Range Change

- Keep the previous range's events rendered until the new range resolves, dimmed to 60%.
- Never show an empty grid between ranges; it reads as "you have nothing", which is a lie.
- Prefetch the adjacent ranges so swipe and next-week feel instant.
- Cancel superseded requests so a slow earlier range cannot paint over a newer one.

---

## Loading — Saving An Event

- The event block appears immediately in a pending style: dashed border, reduced saturation.
- The editor closes at once; the user is not held waiting.
- On success the block settles into its normal style.
- On failure the block is removed and an assertive message offers retry with the editor's content restored.

---

## Empty — No Events At All

A genuinely empty calendar is an opportunity, not an error.

```
┌──────────────────────────────────────────┐
│              [illustration]              │
│                                          │
│  Your week is clear                      │
│                                          │
│  Tap any time to add an event, or        │
│  connect an existing calendar to bring   │
│  your events across.                     │
│                                          │
│  [ Add an event ]                        │
│  [ Connect a calendar ]                  │
└──────────────────────────────────────────┘
```

The empty state overlays the grid rather than replacing it, so the primary create interaction — tapping a time — remains available underneath.

---

## Empty — Nothing In This Range

Common and must be reassuring rather than alarming.

```
Nothing scheduled 2–8 March.

Your next event is Tue 17 March, 10:00.

[ Go to 17 March ]
```

Naming the next event prevents the user from paging forward looking for it.

---

## Empty — All Calendars Hidden

The user has switched everything off and is looking at a blank grid.

```
┌──────────────────────────────────────────┐
│ All 4 calendars are hidden               │
│                                          │
│ Your events are still there.             │
│                                          │
│ [ Show all calendars ]                   │
└──────────────────────────────────────────┘
```

Without this, a hidden-calendar state is indistinguishable from data loss.

---

## Error — Field Level

```
End time
┌──────────────────────────────┐
│ 09:00                        │
└──────────────────────────────┘
⚠ End time is before the start time.
  [ Set to 11:00 ]
```

Offer the correction as an action. The user's intent is obvious and retyping is wasted effort.

---

## Error — Save Failed

```
┌──────────────────────────────────────────┐
│ ⚠ Design review was not saved            │
│                                          │
│   Your changes are still here. Nothing   │
│   was sent to guests.                    │
│                                          │
│   [ Try again ]  [ Keep editing ]        │
└──────────────────────────────────────────┘
```

Whether guests were notified is the first thing the user needs to know, because a wrongly-sent invitation cannot be recalled.

---

## Error — Calendar Source Failed

One source failing must not blank the grid.

```
┌──────────────────────────────────────────┐
│ ⚠ Team calendar could not load           │
│    Your other 3 calendars are shown.     │
│    Times may look free when they are not.│
│    [ Retry ]                             │
└──────────────────────────────────────────┘
```

The warning about apparent free time is essential. A partially loaded calendar causes double bookings.

---

## Partial / Stale Data

When a connected external calendar is degraded or syncing:

```
Work calendar last synced 14:02.
Newer events may be missing.
```

Where free/busy for a guest is unavailable:

```
Ana's availability is unknown.
```

Never render unknown availability as free. Absence of data is not evidence of a gap.

---

## Success

- Creation confirms by the event appearing in place, with a brief highlight that respects reduced motion.
- Moves and deletions confirm through an undo toast that names the change: "Design review moved to Fri 6 Mar, 11:00. Undo".
- Guest notification is stated explicitly: "Invitation sent to 3 guests."

---

## Permission-Limited

Read-only and restricted calendars must look different, not merely behave differently.

- Blocks on a read-only calendar have no resize handles and are not draggable.
- Attempting to drag one shows a single line: "You can view this calendar but not change it."
- Events whose details are private to the owner render as "Busy" with no title, and the block states it: "Busy · details hidden".

Never render a private event with an empty title. An untitled block reads as a bug.

---

# Mobile Behavior

- Agenda is the default view; month is available but never the landing view.
- Touch targets minimum 44×44. Event rows are at least 44px tall regardless of duration, with the real duration in text.
- Horizontal swipe navigates ranges; vertical scroll moves through time. The two gestures never compete on the same axis.
- Drag-to-move is behind a long press so scrolling never reschedules a meeting by accident. Long press announces "Move mode. Choose a new time."
- Every drag interaction has a non-drag equivalent in the editor, because precision dragging on a phone is unreliable.
- Overlapping events stack with an overlap note rather than splitting into sub-40px columns.
- The now line is visible on open and the view auto-scrolls to it once, never repeatedly.
- All-day events occupy a fixed lane that does not push the timed grid off screen.
- Pull to refresh re-syncs connected calendars.
- Timezone is stated in the toolbar whenever the device timezone differs from the calendar's default.

---

# Desktop Expansion

Added space is spent on:

- week view as the default granularity
- a mini month plus calendar toggles in a persistent rail
- a secondary timezone column for cross-region coordination
- keyboard-driven creation, movement, and navigation
- guest free/busy shown inline while choosing a time

Added space is never spent on:

- more events per month cell than three plus overflow
- a year view nobody navigates by
- decorative weather or holiday imagery inside day cells
- simultaneous day, week, and month views on one screen

---

# Accessibility Requirements

- The time grid is a semantic grid. Arrow keys move between slots and columns, Home and End reach the day bounds, Page Up and Page Down change range.
- Each grid cell has an accessible name giving weekday, date, and time: "Thursday 5 March, 14:00, free".
- Each event is a single tab stop with a complete accessible name: "Design review, 11:00 to 12:00, Thursday 5 March, 3 guests, overlaps 1 event".
- Keyboard equivalents exist for every drag operation: arrows to move by 15 minutes, Shift with arrows to resize, Enter to commit, Escape to cancel and restore.
- Moving an event announces politely on commit only: "Design review moved to Friday 6 March, 11:00." Never on every intermediate step.
- Conflicts announce politely on creation and assertively when the user attempts to save into a hard block they do not own.
- Save failures announce assertively.
- Calendar colours are never the only carrier of meaning; each event exposes its calendar name in text.
- Overlap and conflict use an icon plus text, so the state survives greyscale.
- All text meets 4.5:1 against its event background. Event fill colours meet 3:1 against the grid so block boundaries are visible without relying on text.
- The now line is distinguishable by both position and a text marker for screen readers: "Current time, 10:42".
- Popovers and sheets trap focus and return it to the originating event block on close.
- The recurrence scope dialog defaults focus to the safest option and cannot be dismissed by clicking away, because the choice is destructive.
- Reduced motion: no drag ghost animation, no event fade-in, no view slide transitions; the highlight on a new event is a static outline held briefly.
- At 200% zoom week view reduces to three visible days rather than compressing columns, and month view falls back to agenda.
- Screen reader users are offered a list equivalent of the current range, reachable from the toolbar, because a grid is a poor linear reading experience.

---

# Data Requirements

Before implementation, confirm:

```
Event start and end stored as absolute instants, with an explicit event timezone


Whether an all-day event is a date range or a midnight-to-midnight instant range


Recurrence rule format, and how exceptions and cancellations are represented


DST policy per series: wall-clock preserving or instant preserving


First day of the week and locale date formatting source


Working hours, used for default scroll position and free-time suggestions


Snap increment for creation, drag, and resize


Maximum and minimum event duration


Overlap policy: allowed, warned, or blocked, and by whom


Free/busy source for guests and what "unknown" means


Calendar ownership, sharing scope, and per-calendar permissions


Visibility rule for private event details


Sync direction and conflict resolution for connected external calendars


Notification rules on create, move, and delete


Undo window and what it restores


Range limits for how far forward and back events may be queried
```

The DST policy must be documented per series type before any recurrence code is written. Retrofitting it means rewriting every stored event.

Storing local times without a timezone is prohibited. It is unrecoverable the moment a user travels.

---

# Performance Requirements

- The grid structure renders in the first frame without waiting for data, because axis and hour lines are static.
- Events are fetched for the visible range plus one adjacent range in each direction.
- Range prefetching makes next and previous navigation feel instant without a loading state.
- Recurrence is expanded server-side for the requested range. The client never receives a rule to expand across years.
- Superseded range requests are cancelled on navigation.
- Drag and resize run at 60fps using transform-based positioning, never layout-triggering property changes.
- Month view virtualises nothing but limits each cell to three rendered chips plus a count, so a heavy month cannot produce thousands of nodes.
- Agenda view paginates forward on scroll rather than loading a year.
- External calendar sync runs in the background and never blocks rendering of local events.

---

# Anti-Patterns

Never build:

- month view as the mobile default, showing dots instead of information
- a calendar that opens without showing where now is
- tapping an empty 14:00 slot and getting a form defaulted to 09:00
- times displayed with no timezone when the audience crosses timezones
- local times stored without a timezone
- silent DST handling with no policy and no label on transition weeks
- recurring edits applied without asking for scope
- an "All events" scope option with no count of what will change
- drag as the only way to move an event
- drag enabled on touch without a long press, so scrolling reschedules meetings
- overlapping events split into columns narrower than 40px
- unknown guest availability rendered as free
- a failed calendar source leaving the grid looking empty
- hidden calendars indistinguishable from an empty calendar
- private events rendered as blank untitled blocks
- calendar identity carried by colour alone
- an empty grid shown between range navigations
- deletion of a guest event with no confirmation and no undo
- conflict warnings with no suggested alternative time
- a year view added because the view switcher looked short
- resize handles permanently visible on touch, so every tap risks a duration change

---

# Pattern Output Example

```
Product

Team Scheduling Workspace


Primary Question

When am I free, and does this time work for everyone?


Default View

Agenda on mobile, week on desktop, anchored to today


Mobile Structure

Week strip + agenda + stated free gaps + floating create action


Snap Increment

15 minutes for create, drag, and resize


Overlap Policy

Allowed, warned inline, alternatives suggested for all attendees


Timezone Model

Absolute instants with per-event timezone, dual display when they differ


DST Policy

Wall-clock preserving by default, instant-preserving series marked explicitly


Recurrence

Scope dialog on every edit, affected count stated, exceptions named before reset


Month Cell Limit

3 chips plus overflow count


Direct Manipulation

Drag and resize with keyboard equivalents, 10 second undo


Partial Sources

Failed calendar warns that free time may be inaccurate


Private Events

Rendered as "Busy · details hidden", never blank


Accessibility

Grid keyboard model, list equivalent of range, polite move announcements, 200% zoom to 3 days


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Mobile defaults to agenda, never month
- [ ] The view shows where now is on open
- [ ] "Today" is one action away from every view
- [ ] Changing granularity preserves the anchor date
- [ ] Tapping empty space pre-fills that exact time
- [ ] Every drag operation has a keyboard equivalent
- [ ] Drag on touch requires a long press
- [ ] Snap increment is consistent across create, drag, and resize
- [ ] Every event stores an explicit timezone
- [ ] Times display a timezone label whenever timezones can differ
- [ ] DST transition weeks are labeled and render the changed day honestly
- [ ] Recurring edits always ask scope and state the affected count
- [ ] Existing series exceptions are named before being overwritten
- [ ] Conflicts warn and offer an alternative free time
- [ ] Unknown guest availability is never shown as free
- [ ] A failed calendar source warns that free time may be inaccurate
- [ ] Hidden-calendar state is distinguishable from an empty calendar
- [ ] Private events render as "Busy · details hidden"
- [ ] Calendar identity is carried by text as well as colour
- [ ] Range navigation never shows an empty grid mid-transition
- [ ] Moves and deletions offer undo for a stated window
- [ ] Save failure states whether guests were notified
- [ ] Event rows are at least 44px tall on mobile with duration in text
- [ ] Overlapping events never render narrower than 40px
- [ ] Event text meets 4.5:1 and blocks meet 3:1 against the grid
- [ ] A list equivalent of the current range is available
- [ ] 200% zoom reduces visible days rather than compressing columns
- [ ] Reduced motion respected

---

# Final Rule

A calendar is trusted only if it never changes a time the user did not change.

Every element must justify itself against one question:

Does this help the user see their free time, or does it only display their busy time more decoratively?

If it is the second, remove it.
