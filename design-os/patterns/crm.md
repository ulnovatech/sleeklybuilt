# CRM Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Lists Component, Tables Component, Layout Intelligence, Forms System, Navigation System, Data Display System

---

# Purpose

The CRM Pattern defines the complete solution for screens where a person manages relationships with many other people over time.

A CRM is not a database with a nice skin. It is a working memory shared between colleagues.

Its job is to answer, in a few seconds, what happened with this person, what was promised, and what happens next. Everything else in a CRM exists to serve those three questions.

A CRM succeeds when someone picking up a colleague's account can act confidently without asking anyone anything.

---

# When To Use

Use this pattern when:

- records represent people or organisations with an ongoing relationship
- history matters as much as current state
- multiple colleagues touch the same record
- work progresses through recognisable stages
- follow-ups must not be forgotten
- notes written today must be findable in six months

---

# When Not To Use

Do not use this pattern when:

- records have no history and no owner — use a plain list or table
- the work is a queue processed once and closed — use a task queue with a completion state
- the primary question is aggregate performance — use the Dashboard or Analytics pattern
- there is one stage and no follow-up — a contact list is sufficient
- the relationship is anonymous and transactional

The most common product mistake is building a pipeline board before anyone has agreed what the stages mean. A board whose stages are undefined becomes a place where records go to be forgotten in the second column.

---

# User Goal

The primary goal is always one of five:

```
Who should I contact today?

↓

What is the current state of this relationship?

↓

What did we last say, and what did we promise?

↓

Move this forward one step

↓

Where is the work stalling?
```

The first goal dominates daily use. A CRM that opens on an unsorted list of every record has failed the most frequent task in the product.

Open on the work that is due.

---

# User Journey

```
Opens with a working session in mind

↓

Sees what is due and what is overdue

↓

Opens one record

↓

Reads the recent history in seconds

↓

Takes an action: call, email, note, stage change

↓

Logs what happened

↓

Sets the next step with a date

↓

Returns to the queue

↓

Repeats until the queue is empty
```

The seventh step is the one that keeps a CRM alive.

If logging an outcome and setting the next step is not a single motion, the history rots within a month and every subsequent decision is made from memory instead of the record.

---

# UX Flow

## Entry

The user arrives from:

- daily work start, wanting today's queue
- a notification about a due task, wanting one record
- a search, wanting a named person
- an inbound email or call, wanting that person's history immediately
- a report, wanting the records behind a number

The inbound path is the most time-critical. When someone is on the phone, the record must be reachable in one search and readable without scrolling past fields nobody needs.

---

## Orient

The landing view answers "who needs me today".

```
Overdue

↓

Due today

↓

Due this week

↓

Everything else, on request
```

Rules:

- Overdue is always visible and always first. Hiding it behind a filter guarantees it is ignored.
- Counts are shown so the user knows the size of the session before starting.
- The default view is scoped to the user's own records, with a visible switch to the wider team scope.

---

## Find

```
Search by name, company, email, or phone

↓

Filter by owner, stage, and activity recency

↓

Sort by the field that matches the task

↓
Save the combination as a view
```

Rules:

- Search matches partial names and phone numbers with or without formatting, because that is how the data arrives on a phone call.
- Filters are visible as removable chips with a total count, never hidden behind an icon.
- Saved views handle the recurring questions so the user does not rebuild filters daily.

---

## Read

The record detail is the most-used screen in the product and must be ordered by how often each part is read.

```
Identity and how to reach them

↓

Current state: stage, owner, value, next step

↓

Recent activity, newest first

↓

Open tasks

↓

Related records

↓

Everything else, collapsed
```

Rules:

- The next step with its date sits in the first viewport. It is the single most consequential field in a CRM.
- Recent activity outranks static field data. What happened last week matters more than the industry classification.
- Fields nobody reads are collapsed, not deleted, because someone eventually needs them.

---

## Act

Actions are taken from the record, and their outcome is logged in the same motion.

```
Action

↓

Outcome logged automatically where possible

↓

Prompt for the next step

↓

Record reflects both immediately
```

Never require a user to complete an action and then separately remember to log it.

---

## Progress

Stage changes are the pipeline's heartbeat and must carry meaning.

```
Stage change

↓

Required information for the new stage collected inline

↓

Timestamp and actor recorded

↓
Next step confirmed or updated
```

A stage change with no next step is how records stall silently.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ☰  My work        🔍  +  │
├──────────────────────────┤
│ Overdue (3)          ▼   │
│ ┌──────────────────────┐ │
│ │ Ana Mwangi           │ │
│ │ Riverside Ltd        │ │
│ │ ⚠ Call · 4 days late │ │
│ │ Proposal · €12,000   │ │
│ │ [ Call ] [ Email ]   │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Tom Odhiambo         │ │
│ │ Delta Supplies       │ │
│ │ ⚠ Email · 1 day late │ │
│ │ Qualified · €4,500   │ │
│ │ [ Call ] [ Email ]   │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Due today (5)        ▼   │
├──────────────────────────┤
│ Later this week (11) ▶   │
├──────────────────────────┤
│ [ Home ][ Pipeline ]     │
│ [ Search ][ Me ]         │
└──────────────────────────┘
```

Record detail on mobile:

```
┌──────────────────────────┐
│ ← Ana Mwangi        ⋯    │
│ Riverside Ltd            │
│ [ Call ] [ Email ] [ + ] │
├──────────────────────────┤
│ Proposal · €12,000       │
│ Owner: you               │
│ ⚠ Next: Call to confirm  │
│    budget · 4 days late  │
│    [ Done ] [ Reschedule]│
├──────────────────────────┤
│ ACTIVITY                 │
│ Mon 2 Mar · you          │
│ Call · 12 min            │
│ "Wants to start in April,│
│ needs sign-off from      │
│ finance first."          │
│                          │
│ Fri 27 Feb · you         │
│ Email · Proposal sent    │
│                          │
│ Thu 26 Feb · Sam         │
│ Stage → Proposal         │
│                          │
│ Show all 24 activities   │
├──────────────────────────┤
│ Tasks (1)            ▼   │
│ Details              ▶   │
│ Related (2)          ▶   │
└──────────────────────────┘
```

Mobile rules:

- The landing view is the work queue grouped by urgency, never an alphabetical list of all records.
- Each card carries exactly what is needed to decide: name, organisation, next step with lateness, stage, value, and two direct actions.
- Call and email are one tap from the list, because most CRM use on a phone is calling someone.
- The record detail leads with actions and the next step. Field data is collapsed below activity.
- Never render a pipeline board on a phone. A board at 375px shows one column, which is a filtered list with worse ergonomics.
- Logging an activity opens a sheet with the type pre-selected by the action taken.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ My work            🔍  Filters (2)     +   │
├─────────────────────────┬──────────────────┤
│ OVERDUE (3)             │ Ana Mwangi       │
│ ▸ Ana Mwangi       ⚠ 4d │ Riverside Ltd    │
│   Riverside · Proposal  │ [Call] [Email]   │
│ ▸ Tom Odhiambo     ⚠ 1d ├──────────────────┤
│   Delta · Qualified     │ Proposal €12,000 │
│                         │ ⚠ Next: Call to  │
│ DUE TODAY (5)           │ confirm budget   │
│ ▸ Grace Wanjiru         │ 4 days late      │
│   Nova · Discovery      ├──────────────────┤
│ ▸ Peter Kimani          │ ACTIVITY         │
│   Arc Ltd · Proposal    │ Mon 2 Mar · Call │
│                         │ "Wants April     │
│ THIS WEEK (11)          │ start, finance   │
│ ▸ ...                   │ sign-off first." │
└─────────────────────────┴──────────────────┘
```

Master–detail begins at tablet. Selection in the list updates the detail without a navigation.

---

## Desktop

```
┌──────┬──────────────────────────┬───────────────────────────────┐
│      │ MY WORK      Filters (2) │ Ana Mwangi · Riverside Ltd    │
│ Home │ ────────────────────────  │ [Call] [Email] [Log] [Task] ⋯ │
│ Work │ OVERDUE (3)              ├───────────────────────────────┤
│ Pipe │ ▸ Ana Mwangi        ⚠ 4d │ Stage  Proposal    Value €12k │
│ Accts│   Proposal · €12,000     │ Owner  you         Since 26/2 │
│ Tasks│ ▸ Tom Odhiambo      ⚠ 1d │                               │
│ Views│   Qualified · €4,500     │ ⚠ NEXT STEP                   │
│      │ ▸ Nia Abdi          ⚠ 6d │   Call to confirm budget      │
│ ─────│   Discovery · €8,000     │   Due 2 March · 4 days late   │
│ SAVED│                          │   [ Done ] [ Reschedule ]     │
│ ·Mine│ DUE TODAY (5)            ├───────────────────────────────┤
│ ·Stal│ ▸ Grace Wanjiru          │ ACTIVITY          [ Filter ▾ ]│
│ ·>10k│   Discovery · €3,200     │ Mon 2 Mar · you · Call 12m    │
│      │ ▸ Peter Kimani           │ "Wants to start in April,     │
│      │   Proposal · €22,000     │  needs finance sign-off."     │
│      │                          │ Fri 27 Feb · you · Email      │
│      │ THIS WEEK (11)           │ Proposal sent · opened 3×     │
│      │ ▸ ...                    │ Thu 26 Feb · Sam · Stage      │
│      │                          │ Qualified → Proposal          │
│      │ 3 selected               │ ─────────────────────────     │
│      │ [Assign] [Stage] [Task]  │ Tasks 1 · Details · Related 2 │
└──────┴──────────────────────────┴───────────────────────────────┘
```

Pipeline board on desktop:

```
┌─────────────────────────────────────────────────────────────────┐
│ Pipeline · Q1 · Owner: everyone          Filters (1)   Table ▾  │
├────────────┬────────────┬────────────┬────────────┬─────────────┤
│ Discovery  │ Qualified  │ Proposal   │ Negotiation│ Won         │
│ 8 · €41k   │ 5 · €28k   │ 6 · €74k   │ 2 · €31k   │ 4 · €52k    │
├────────────┼────────────┼────────────┼────────────┼─────────────┤
│ Grace W.   │ Tom O.     │ Ana M.  ⚠  │ Leo K.     │ Ruth N.     │
│ €3,200     │ €4,500     │ €12,000    │ €18,000    │ €14,000     │
│ 2d idle    │ 9d idle    │ 21d idle   │ 4d idle    │ closed 1/3  │
├────────────┼────────────┼────────────┼────────────┼─────────────┤
│ Nia A.  ⚠  │ Sara M.    │ Peter K.   │ Dan W.     │ ...         │
│ €8,000     │ €6,100     │ €22,000    │ €13,000    │             │
│ 14d idle   │ 3d idle    │ 5d idle    │ 1d idle    │             │
└────────────┴────────────┴────────────┴────────────┴─────────────┘
```

Desktop rules:

- Three regions: navigation, list, detail. The user works a queue without ever losing their place in it.
- Column headers on the board carry count and total value, because a stage with no numbers cannot be judged.
- Idle time is shown on every card. Time since last activity is the single most useful signal a pipeline can display.
- Bulk actions appear in a bar at the bottom of the list when a selection exists, never as a permanently visible toolbar.

---

# Component Hierarchy

```
CrmWorkspace
├── PrimaryNavigation
│   ├── NavItem ×n
│   └── SavedViewList
│       └── SavedViewItem ×n
├── RecordListPane
│   ├── ListToolbar
│   │   ├── SearchField
│   │   ├── FilterChipStack
│   │   │   └── FilterChip ×n
│   │   ├── ScopeSwitcher            mine / team / all
│   │   ├── SortSelector
│   │   └── CreateRecordAction
│   ├── UrgencyGroup ×n
│   │   ├── GroupHeading             label + count
│   │   └── RecordRow ×n
│   │       ├── SelectionCheckbox
│   │       ├── Name
│   │       ├── OrganisationLabel
│   │       ├── StageBadge
│   │       ├── ValueLabel
│   │       ├── NextStepLabel
│   │       ├── OverdueIndicator
│   │       └── QuickActionGroup     call / email
│   ├── ListEmptyState
│   ├── ListPagination
│   └── BulkActionBar                conditional on selection
│       ├── SelectionCount
│       ├── AssignAction
│       ├── StageChangeAction
│       ├── CreateTaskAction
│       ├── ExportAction
│       └── ClearSelectionAction
├── RecordDetailPane
│   ├── RecordHeader
│   │   ├── Name
│   │   ├── OrganisationLink
│   │   ├── PrimaryActionGroup       call / email / log / task
│   │   └── OverflowMenu
│   ├── StatePanel
│   │   ├── StageSelector
│   │   ├── OwnerSelector
│   │   ├── ValueField
│   │   └── StageAgeLabel
│   ├── NextStepPanel
│   │   ├── Description
│   │   ├── DueDate
│   │   ├── CompleteAction
│   │   └── RescheduleAction
│   ├── ActivityTimeline
│   │   ├── TimelineFilter
│   │   ├── ActivityEntry ×n
│   │   │   ├── TypeIcon
│   │   │   ├── Actor
│   │   │   ├── Timestamp
│   │   │   ├── Summary
│   │   │   └── ExpandAction
│   │   ├── TimelineEmptyState
│   │   └── LoadOlderAction
│   ├── TaskPanel
│   │   └── TaskItem ×n
│   ├── DetailFieldPanel             collapsed by default
│   └── RelatedRecordPanel
├── PipelineBoard                    tablet and desktop only
│   ├── StageColumn ×n
│   │   ├── ColumnHeader             count + value
│   │   ├── DealCard ×n
│   │   │   ├── Name
│   │   │   ├── ValueLabel
│   │   │   ├── IdleTimeLabel
│   │   │   └── OverdueIndicator
│   │   └── ColumnEmptyState
│   └── DragGhost
├── LogActivitySheet
│   ├── TypeSelector
│   ├── OutcomeSelector
│   ├── NoteField
│   ├── NextStepFields               inline, required
│   └── SaveAction
└── StageChangeDialog
    ├── StageSummary
    ├── RequiredFieldGroup
    ├── NextStepFields
    └── ConfirmAction
```

Reuse rules:

- `RecordRow` and `DealCard` are variants of one record summary component. The board card is a denser rendering of the same data contract.
- `ActivityEntry` is one component with a variant per activity type. A separate component per type guarantees inconsistent timestamps.
- The next-step fields inside the log sheet and the stage dialog are the same component, so the prompt to set a next step is identical everywhere.

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

The record's history explains what changed and who changed it
```

## Logging An Activity

1. Any direct action — call, email, meeting — pre-selects its own activity type.
2. The sheet opens with the type set, the timestamp set to now, and focus in the note field.
3. An outcome is chosen from a short list, so the timeline is filterable later.
4. The next-step fields are part of the same sheet and are required unless the user explicitly marks the record closed.
5. Saving writes the activity and the next step in one operation and both appear immediately.

```
┌──────────────────────────────────────────┐
│ Log a call                               │
│                                          │
│ Outcome   [ Spoke · positive        ▾ ]  │
│                                          │
│ What happened                            │
│ ┌──────────────────────────────────────┐ │
│ │ Wants to start in April, needs       │ │
│ │ finance sign-off first.               │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Next step                                │
│ [ Call to confirm budget            ]    │
│ [ Fri 6 March              ] [ You ▾ ]   │
│                                          │
│ ☐ No next step — this is closed          │
│                                          │
│ [ Cancel ]                    [ Save ]   │
└──────────────────────────────────────────┘
```

Requiring a next step, with an explicit opt-out, is the mechanism that stops records from stalling.

## Changing Stage

1. Stage change is immediate and optimistic in the interface.
2. If the target stage requires information the record lacks, collect it inline in a dialog rather than rejecting the change.
3. The previous stage, the new stage, the actor, and the timestamp are written to the timeline automatically.
4. The next step is confirmed or replaced as part of the same interaction.
5. Moving to a closed stage asks for a reason from a fixed list, because unstructured loss reasons cannot be analysed later.

```
┌──────────────────────────────────────────┐
│ Move to Negotiation                      │
│                                          │
│ Negotiation needs two details:           │
│                                          │
│ Expected close date                      │
│ [ 31 March 2026                      ]   │
│ Decision maker                           │
│ [ Ana Mwangi                       ▾ ]   │
│                                          │
│ Next step                                │
│ [ Send revised terms               ]     │
│ [ Mon 9 March                     ]      │
│                                          │
│ [ Cancel ]                    [ Move ]   │
└──────────────────────────────────────────┘
```

## Dragging On The Board

1. The card lifts with elevation; the origin position stays visible at reduced opacity.
2. Target columns highlight as the pointer crosses them, and column totals preview the change.
3. On drop, the change applies optimistically and any required-field dialog opens immediately.
4. Cancelling the dialog returns the card to its original column with no change written.
5. If the server rejects the move, the card animates back and the reason is stated.
6. Every drag has a keyboard equivalent: with a card focused, a stage selector is reachable and arrow keys move between columns.

## Bulk Actions

1. Selection is per row with a select-all that applies to the current filtered page and states its scope: "All 25 on this page selected. Select all 312 matching."
2. The bulk bar names the count in every action label: "Assign 25 records".
3. Destructive bulk actions require typed or explicit confirmation and name the count again.
4. Execution shows progress and a per-record result summary, because partial failure is normal at volume.
5. Completion reports honestly: "22 records updated. 3 could not be changed because you do not own them."

```
┌──────────────────────────────────────────┐
│ ✓ 22 of 25 records assigned to Sam       │
│                                          │
│   3 were not changed:                     │
│   · Nia Abdi — owned by another team      │
│   · Leo Kamau — owned by another team     │
│   · Ruth Njeri — record is closed         │
│                                          │
│   [ View the 3 ]              [ Done ]   │
└──────────────────────────────────────────┘
```

A bulk operation that reports success while silently skipping records destroys trust in the data.

## Writing A Note

1. Notes save on blur and on an explicit save, with the saved state visible: "Saved 14:02".
2. Notes are attributed and timestamped and cannot be edited by others.
3. Editing your own note preserves an edited marker with the original time.
4. Notes are never deleted silently; deletion leaves a tombstone entry stating a note was removed and by whom.

An unattributed note is worthless six months later, when the only question that matters is who wrote it.

## Merging Duplicates

1. Duplicates are detected on email, phone, and organisation and surfaced on the record: "This may be the same person as Ana Mwangi at Riverside Ltd."
2. The merge screen shows both records side by side with a per-field choice.
3. Activity timelines are combined chronologically, never discarded.
4. The merge is recorded in the timeline of the surviving record and is reversible for a stated window.

---

# States

## Loading — First Visit

```
Navigation      → renders immediately
List toolbar    → renders immediately and is interactive
Urgency groups  → heading with skeleton count, 5 skeleton rows each
Detail pane     → empty prompt: "Select a record to see its history"
Board columns   → headers with skeleton counts, 3 skeleton cards each
```

Group headings render before counts resolve so the structure of the session is visible immediately.

The detail pane never shows a spinner on first load; it shows a prompt, because nothing is selected yet.

---

## Loading — List Refresh Or Filter Change

- Keep the previous rows visible and dimmed to 60% with a thin progress line under the toolbar.
- Preserve selection across the refresh where the selected records still match, and state it if some no longer do.
- Never collapse urgency groups during a refresh; the user is mid-session and loses their position.
- Cancel superseded requests so a slow earlier filter cannot repaint newer results.

---

## Loading — Record Detail

- The header renders immediately from the list row data already in memory, so the name and organisation never flash.
- State panel and next step show skeletons sized to their final layout.
- The timeline loads the ten most recent entries first, with older entries fetched on demand.
- Actions are disabled with a visible reason until the record's permissions resolve, which must take under 500ms.

---

## Loading — Saving

- Optimistic for stage, owner, and next step: the interface reflects the change immediately with a pending style.
- Pessimistic for merges and bulk operations: they show progress and wait, because they are not safely reversible in the interface.
- A failed optimistic change reverts visibly and states what happened, never silently.

---

## Empty — No Records At All

A new workspace, and this state decides whether the CRM is adopted.

```
┌──────────────────────────────────────────┐
│              [illustration]              │
│                                          │
│  No contacts yet                         │
│                                          │
│  Add your first contact, or bring your   │
│  existing list across from a spreadsheet │
│  or your email account.                  │
│                                          │
│  [ Add a contact ]                       │
│  [ Import from CSV ]                     │
│  [ Connect email ]                       │
└──────────────────────────────────────────┘
```

Import is offered first-class. Every CRM adoption begins with a spreadsheet, and a product that ignores that fact is abandoned during setup.

---

## Empty — Queue Is Clear

The best state in the product, and it must feel like an achievement rather than an error.

```
┌──────────────────────────────────────────┐
│ ✓ Nothing due today                      │
│                                          │
│ You have cleared 8 follow-ups today.     │
│                                          │
│ 4 records have had no activity for over  │
│ 30 days.                                  │
│                                          │
│ [ Review stalled records ]               │
│ [ See this week ]                        │
└──────────────────────────────────────────┘
```

Offering the stalled records converts an empty queue into useful work instead of a dead end.

---

## Empty — No Results For This Filter

```
No records match: Owner is Sam · Stage is Proposal · Idle over 30 days

The idle filter is the narrowest constraint.

[ Remove idle filter ]   [ Clear all filters ]
```

Naming the narrowest constraint saves the user from removing filters one at a time.

---

## Empty — Timeline Has No Activity

A record with no history is a record nobody has worked, and the state should say so plainly.

```
┌──────────────────────────────────────────┐
│ No activity recorded yet                 │
│                                          │
│ Added by Sam on 26 February.             │
│                                          │
│ [ Log a call ]  [ Log an email ]         │
└──────────────────────────────────────────┘
```

---

## Empty — Board Column

```
Nothing in Negotiation

Drag a card here, or change a record's
stage from its detail view.
```

Never render a zero-height column. A collapsed column makes the pipeline shape unreadable.

---

## Error — Field Level

```
Value
┌──────────────────────────────┐
│ 12.0000                      │
└──────────────────────────────┘
⚠ Enter an amount in euros, for example
  12000 or 12,000.
```

Validate on blur, clear on correction, reserve the space so nothing shifts.

---

## Error — Save Failed

```
┌──────────────────────────────────────────┐
│ ⚠ Stage was not changed                  │
│                                          │
│   Ana Mwangi is still in Proposal.       │
│   Sam changed this record 2 minutes ago. │
│                                          │
│   [ See their change ]  [ Try again ]    │
└──────────────────────────────────────────┘
```

Concurrent edits are the normal condition in a shared CRM. Naming who changed what turns a conflict into a conversation.

---

## Error — Conflict On Concurrent Edit

```
┌──────────────────────────────────────────┐
│ Sam changed this while you were editing  │
│                                          │
│ Stage    Sam set Negotiation             │
│          You set Proposal                │
│                                          │
│ Notes are kept in both cases.            │
│                                          │
│ [ Keep Sam's ]  [ Keep mine ]            │
└──────────────────────────────────────────┘
```

Never resolve a conflict silently by last-write-wins on a field a human is looking at.

---

## Error — Region Failed

One panel failing must not blank the record.

```
┌──────────────────────────────────────────┐
│ ⚠ Activity could not load                │
│    The rest of this record is accurate.  │
│    [ Retry ]                             │
└──────────────────────────────────────────┘
```

---

## Partial / Stale Data

When a connected email or calendar source is behind:

```
Email sync last ran 09:14.
Messages after that time are not shown yet.
```

When a computed field such as pipeline value excludes records:

```
€74,000 *
* Excludes 2 records with no value set
```

Never present an incomplete total as complete. The first time two colleagues disagree about a pipeline number, the CRM loses its authority permanently.

---

## Success

- Logging an activity confirms by the entry appearing at the top of the timeline with a brief static highlight, and the next step visibly updated.
- Stage changes confirm by the badge updating and a timeline entry appearing, with undo available for ten seconds.
- Bulk operations confirm with counts and an explicit list of what was skipped.
- Assignment confirms and states whether the new owner was notified.

---

## Permission-Limited

Restricted records must be visible as existing but not readable, or hidden entirely — never rendered as broken.

```
┌──────────────────────────────────────────┐
│ 🔒 This record belongs to another team    │
│                                          │
│    Owner: Marketing                      │
│    Last activity: 4 days ago             │
│                                          │
│    [ Request access ]                    │
└──────────────────────────────────────────┘
```

Read-only records show no editable controls at all, rather than controls that fail on use.

Fields hidden by permission are removed with one explanation at the panel level, never rendered as empty rows.

---

# Mobile Behavior

- The landing view is the urgency-grouped work queue. An alphabetical list of all records is never the mobile default.
- Touch targets minimum 44×44 for rows, quick actions, and stage controls, with 8px separation between call and email so a mis-tap does not start a call.
- Call and email are direct native handoffs from the list, and returning to the app prompts to log the call with the duration pre-filled where the platform provides it.
- The record detail leads with actions, state, and next step; detail fields are collapsed.
- The activity timeline paginates on scroll, loading ten entries at a time.
- No pipeline board. Offer a stage filter on the list instead, which is the same information with better ergonomics at this width.
- No drag interactions. Stage changes happen through an explicit selector.
- Bulk selection is available through an explicit select mode, never by long-press on a row that also opens the record.
- Search is reachable from every screen, because inbound calls happen while the user is anywhere in the app.
- Notes autosave, so a call that interrupts note-taking does not lose it.

---

# Desktop Expansion

Added space is spent on:

- three-region master–detail so the queue is never lost
- a pipeline board with counts, values, and idle time per card
- bulk selection with a contextual action bar
- keyboard navigation through the queue: move between records, log an activity, and set a next step without a mouse
- side-by-side duplicate merge

Added space is never spent on:

- rendering every field of a record at once because the screen is wide
- a permanently visible toolbar of rarely used actions
- decorative summary tiles above a queue the user came to work
- a second copy of the pipeline as a chart beside the board

---

# Accessibility Requirements

- Tab order follows the three regions in visual order: navigation, list toolbar, list rows, detail header, detail panels.
- The record list is a semantic list where each row is one tab stop with a complete accessible name: "Ana Mwangi, Riverside Ltd, Proposal, 12,000 euros, next step overdue by 4 days".
- Quick actions inside a row are reachable without leaving the row, and their accessible names include the record: "Call Ana Mwangi".
- The board is a set of labelled columns; each card is a tab stop announcing its column: "Ana Mwangi, Proposal column, position 1 of 6".
- Every drag has a keyboard equivalent, and moving a card by keyboard announces the outcome on commit only: "Moved to Negotiation."
- Overdue state is conveyed by icon and text as well as colour, so it survives greyscale and colour blindness.
- Stage badges include the stage name in text; stage is never communicated by colour alone.
- The activity timeline is a list in reverse chronological order with each entry announcing type, actor, and a relative plus absolute timestamp: "Call, by you, Monday 2 March, three days ago".
- Timeline updates announce politely; save failures and edit conflicts announce assertively.
- Selection changes announce the count politely: "3 records selected."
- Bulk operation completion announces the result including skipped records.
- Dialogs for stage change, merge, and destructive bulk actions trap focus, label themselves, default focus to the safest control, and return focus to the trigger on close.
- The detail pane's heading receives focus when a record is opened from the list, so the context change is announced.
- All text meets 4.5:1; stage badges and idle indicators meet 4.5:1 for text and 3:1 for their boundaries.
- Reduced motion: no card lift animation, no timeline entry slide-in, no column reflow animation; the new-entry highlight is a static outline held briefly.
- At 200% zoom the three-region desktop layout collapses to list-then-detail navigation rather than compressing all three, and the board falls back to a filtered list.
- Relative timestamps always carry an absolute date in the accessible name, because "3 days ago" is ambiguous when read out of sequence.

---

# Data Requirements

Before implementation, confirm:

```
Record types and the relationships between them


Definition and order of every pipeline stage, agreed by the team that uses it


Which fields are required to enter each stage


Ownership model and what happens to records when a user leaves


Visibility rules per team, per record, and per field


Activity types and the outcome list for each


Whether activities are immutable, and the edit policy for notes


Next-step model: due date, owner, and whether it is required


Definition of overdue, including whether weekends count


Definition of idle: which activity types reset the clock


Duplicate detection keys and the merge precedence rule


Value field currency, and how mixed currencies are totalled


Closed-lost reason list


Audit requirements: what is logged, retained, and for how long


Email and calendar sync direction, and what is stored of message content


Personal data retention and deletion obligations


Bulk operation limits and partial-failure reporting
```

The stage definitions must be written and agreed before the board is built. A pipeline whose stages mean different things to different colleagues produces forecasts nobody believes.

The definition of idle must be settled explicitly. If an automated email resets the idle clock, the stalled-record report becomes useless within a month.

---

# Performance Requirements

- The work queue renders its first group under one second; it is the screen the user opens every morning.
- Lists are paginated or virtualised. The browser never receives an unbounded record set.
- Record detail opens using data already present in the list row, so the header appears instantly and only the timeline and panels fetch.
- The timeline loads ten entries initially and fetches older entries on demand.
- Search returns results within 300ms of typing, debounced, and matches partial names and unformatted phone numbers server-side.
- Filter and sort operate server-side; the client never sorts a page and calls it a sorted result.
- Superseded list and search requests are cancelled on every change.
- Optimistic updates apply locally and reconcile against the server response, reverting visibly on failure.
- Bulk operations run server-side in batches with progress reported, and never hold a request open for the whole set.
- Board drag and drop runs at 60fps using transform-based positioning.

---

# Anti-Patterns

Never build:

- an alphabetical list of every record as the default landing view
- a work queue that hides overdue items behind a filter
- a pipeline board with stages nobody has defined
- a board card with no idle time, so stalling is invisible
- a stage change that does not record who made it and when
- a stage change that leaves no next step
- activity logging as a separate step the user must remember after a call
- unattributed or untimestamped notes
- notes that other users can edit
- silent deletion of activity history
- last-write-wins on a field two colleagues are editing simultaneously
- a bulk action that reports success while silently skipping records
- select-all that ambiguously means the page or the whole result set
- a pipeline board on a phone
- drag as the only way to change a stage
- long-press on a row serving both selection and opening the record
- a record detail that renders sixty fields above the activity timeline
- a pipeline total that silently excludes records with no value
- an idle metric reset by automated email
- fields hidden by permission rendered as empty rows
- read-only records with editable-looking controls that fail on use
- stage conveyed by colour alone
- relative timestamps with no absolute date available
- a merge that discards one record's history
- an empty CRM with no import path

---

# Pattern Output Example

```
Product

B2B Sales Workspace


Primary Question

Who needs me today, and what did we last promise them?


Landing View

Work queue grouped Overdue, Due today, This week, scoped to the user


Layout

Queue on mobile, master–detail from tablet, three regions plus board on desktop


Stages

Discovery, Qualified, Proposal, Negotiation, Won, Lost — defined and documented


Stage Entry Requirements

Negotiation requires expected close date and decision maker


Next Step

Required on every activity log and stage change, with an explicit closed opt-out


Overdue Definition

Past due date, business days only


Idle Definition

Days since last human activity; automated email does not reset it


Activity Types

Call, Email, Meeting, Note, Stage change, Task completed — each with an outcome list


Notes

Attributed, timestamped, author-editable only, deletion leaves a tombstone


Concurrency

Field-level conflict dialog naming the other actor, never last-write-wins


Bulk Actions

Assign, stage change, task creation; per-record result reporting with skip reasons


Duplicates

Detected on email and phone, side-by-side merge, timelines combined, reversible 24 hours


Mobile

Urgency queue, tap-to-call with return-to-log prompt, no board, no drag


Accessibility

Row-level accessible names, keyboard board moves, greyscale-safe overdue, 200% zoom collapses regions


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The landing view is the work queue, not an alphabetical list
- [ ] Overdue is visible first and always, never behind a filter
- [ ] Group counts are shown before the session starts
- [ ] Every pipeline stage has a written, agreed definition
- [ ] Stage entry requirements are collected inline, not by rejection
- [ ] Every stage change records actor and timestamp in the timeline
- [ ] Every activity log requires a next step, with an explicit closed opt-out
- [ ] Overdue and idle definitions are documented and consistent everywhere
- [ ] Idle time is visible on every board card
- [ ] Activity logging is part of the action, not a separate remembered step
- [ ] Notes are attributed, timestamped, and editable only by their author
- [ ] Note deletion leaves a tombstone entry
- [ ] Concurrent edits produce a conflict dialog naming the other actor
- [ ] Optimistic changes revert visibly on failure
- [ ] Bulk actions state their count in every label
- [ ] Select-all states whether it means the page or the whole result set
- [ ] Bulk results report skipped records and the reason for each
- [ ] Totals that exclude records say so
- [ ] No-results state names the narrowest constraint
- [ ] Empty queue offers stalled records rather than a dead end
- [ ] Empty workspace offers import as a first-class path
- [ ] Empty board columns remain visible at full height
- [ ] A failed panel leaves the rest of the record accurate
- [ ] Sync lag is stated when a connected source is behind
- [ ] Restricted records show ownership and a request path, never broken controls
- [ ] Read-only records render no editable controls
- [ ] Mobile leads with actions and next step, fields collapsed
- [ ] Mobile offers no board and no drag
- [ ] Call and email are separated by at least 8px on mobile
- [ ] Every drag has a keyboard equivalent
- [ ] Overdue and stage survive greyscale
- [ ] Relative timestamps carry absolute dates in accessible names
- [ ] 200% zoom collapses regions rather than compressing them
- [ ] Reduced motion respected

---

# Final Rule

A CRM is only worth what its history is worth.

Every element must justify itself against one question:

Does this make it easier to record what happened, or easier to see what happens next?

If it does neither, remove it.
