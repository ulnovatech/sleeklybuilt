# Admin Panel Design Prompt

**Version:** 1.0
**Status:** Production Operational Tooling Design Prompt
**Priority:** Internal Efficiency Experience Authority

---

# Purpose

This prompt defines the process for designing production-quality admin panels and internal operational tools using the Design OS framework.

An admin panel is not a database viewer with buttons.

It is the control surface through which staff run the business:

* they answer customer questions from it
* they correct data the product got wrong
* they unblock users who cannot proceed
* they permanently change other people's records

Operators are the highest-frequency users the product will ever have, and their mistakes are visible to customers.

---

# The Internal Tool Fallacy

Reject the assumption that internal tools may be ugly, slow, or unfinished because they are only for the team.

An unclear admin interface makes an operator hesitate or guess, the wrong record is modified, and the result is a customer-visible incident with support cost attached.

An admin panel meets the same quality bar as any customer-facing surface, and a stricter one in three places:

* destructive action safety, because consequences are irreversible
* speed of repeated actions, because the same task runs hundreds of times a day
* clarity of identity, because the operator acts on someone else's data

Consult Quality Bar and Design Constitution before deciding anything is good enough for internal use.

---

# Design Mission

When creating an admin panel:

```
Model Roles And Permissions

↓

Inventory Real Operations

↓

Design List And Detail Architecture

↓

Make Frequent Work Fast

↓

Make Dangerous Work Safe

↓

Record Everything That Happened

↓

Validate Under Incident Conditions
```

Permissions and consequences are decided before layout. A layout designed before the permission model will be rebuilt.

---

# Before Designing

## Operator Context

Determine which teams use the panel, their volume per shift, their tenure, whether they work from a queue or a conversation or an alert, and what sits open beside the panel.

Support staff arrive with one customer identifier and one question. Operations staff arrive with a queue and a daily target. Finance staff arrive with a reconciliation window and no tolerance for ambiguity. Those are three entry paths and the panel must serve all of them. Staff also rotate, so nothing may depend on knowledge only long-tenured operators possess.

---

## Operation Inventory

List every operation the panel must perform. For each, record:

```
Operation name
Who is allowed to perform it
How often it runs per day
Whether it acts on one record or many
Whether it is reversible
Whether the customer is notified
What must be true before it is allowed
```

Frequency decides investment. An operation performed two hundred times a day earns a keyboard path and an inline control. An operation performed twice a month earns clarity, not speed.

Never design admin screens by mirroring database tables. Design them around these operations.

---

## Data And Permission Model

Establish before layout, consulting Authentication Flow and Security Review:

* which roles exist, and what each may read, write, and destroy
* which fields are sensitive and masked by default
* which fields are system-owned and never hand-editable
* which records are legally retained and cannot be hard-deleted
* whether access is scoped by tenant, region, or account ownership

---

## Consequence Inventory

Classify every action before designing its control:

```
Undoable        — reversible by the operator within a stated window
Confirmable     — reversible only by another team or a support request
Irreversible    — cannot be undone by anyone
```

Skipping this produces a panel where deleting a customer and renaming a label look identical.

---

# Roles And Permissions

Permissions are an experience, not a backend concern. Consult App Shell and Navigation.

* If a role cannot perform an action, remove the control. A disabled button with a lock icon and no explanation teaches operators the tool is broken.
* When a capability is withheld deliberately, state once at section level who can perform it and how to request it.
* Keep active identity, role, and scope visible in the application shell, never buried in settings.
* Design the read-only support view before the superuser view, or privileged affordances leak into every role and each leak becomes a permission bug.
* Keep item position stable across roles even when the set of items differs.
* Temporary elevation is explicitly requested, scoped to a stated action or time window, visibly indicated while active, and recorded with a reason.

---

# Impersonation Safety

Acting as another user is the most dangerous capability in an admin panel, because every keystroke looks to the system like the customer's own.

* Entered through an explicit named action, never as a side effect of opening a record.
* A persistent banner names the impersonated user and offers one-click exit; it is not dismissible, does not scroll away, and survives navigation.
* The indicator uses a colour reserved exclusively for impersonation, plus text — never colour alone.
* Default to read-only. Writing while impersonating is a separate, separately-permissioned mode, and irreversible actions stay blocked throughout.
* Never send customer-facing notifications as a side effect of impersonated browsing.
* Record both identities in every audit entry, and end impersonation on idle timeout and tab close.

An operator must never be able to forget who they currently are.

---

# Admin Architecture

Most admin work resolves to one spine:

```
Entity Directory
↓
Filtered List
↓
Record Detail
↓
Action On Record
↓
Confirmation And Audit Entry
```

Design this spine first, then add queues, dashboards, and reports around it. Navigation stays flat enough that any entity type is one click from anywhere, and is organised by entity and task rather than by engineering service boundaries. Global search is the primary navigation method in a mature panel: an operator holding an order number or an email address reaches the record by typing it, without first choosing a section.

Consult CRM and Search for directory and lookup, Dashboard for monitoring, Settings for configuration, and Navigation System for structure.

---

## List Layer

The list is where operators spend most of their time. Consult Tables, Lists, and Data Display System.

* Columns are chosen for decision-making, not schema completeness. A column that never changes what the operator does next is removed.
* Identity first, then status, then the field the current queue is sorted by, with status conveyed by label plus icon or shape and never colour alone.
* Filters are visible, combinable, and reflected in the URL so a view can be pasted into a ticket.
* Saved views are first-class: recurring queues become named team-owned views, not filter combinations rebuilt from memory each morning.
* Sorting is server-side and stable so two operators working one queue see the same order, and row count with active filters stays visible because bulk decisions depend on true scope.
* Pagination is explicit for auditable work. Infinite scroll destroys sense of position and makes "I processed up to here" impossible.

---

## Detail Layer

The detail view answers what state this record is in, how it got there, and what can be done about it. Consult Profile and Cards.

```
Identity header — name, identifier, status, created date
Primary actions — the operations run most often on this record
Core fields — grouped by meaning, not by table
Related records — linked, counted, reachable
History — audit entries newest first
```

* The identifier is copyable in one action, because operators paste it into tickets constantly, and sensitive fields are masked by default with a reveal that is itself audited.
* Related records show counts before being opened, so the operator knows whether a deletion is safe.
* History lives on the record. "What happened to this one" must be answerable without leaving.

---

# Operator Speed

An admin panel is judged by how quickly a competent operator completes a repeated task without leaving the keyboard.

## Keyboard And Inline Editing

Define a documented shortcut baseline covering: focus global search from anywhere, move selection through a list, open the focused record, enter edit mode on the focused field, save with modifier-return, cancel with escape, and step to the next or previous record from inside detail without returning to the list.

Every action reachable by mouse is reachable by keyboard, focus is visible at all times at 3:1 contrast, and focus is never trapped except intentionally inside a modal.

High-frequency single-field corrections happen in place, never on a separate form page:

* the field enters edit mode from keyboard or click, cursor placed and existing value selected
* save on blur or return, cancel on escape restoring the prior value
* saving state shows on the field, not as a page-level spinner
* failure keeps the entered value and states the reason beside the field, never silently reverting

For recurring data entry, use correct input types and keyboards, context-derived defaults that are visibly stated, field-level validation at the moment a value can be judged, a save-and-create-next path that retains shared values, and draft preservation so a navigation mistake or dropped connection never discards typed work. Consult Forms, Inputs, Forms System, and Interaction Principles.

---

## Bulk Operations

Bulk is what makes an operations team viable, and what makes one mistake enormous.

* Selection is page-scoped by default. Selecting the whole filtered set is a separate, explicitly labelled action stating the true count.
* The selection count stays visible together with the filter that produced it, and clears after completion rather than persisting invisibly across filter changes.
* The action bar appears only when a selection exists, stays anchored within reach, and names the count in the action itself rather than in a generic label.
* Before execution, preview the effect: how many records change, how many are ineligible and why, and the resulting state. Never silently drop ineligible records, which makes operators believe work completed that did not.
* Cap synchronous execution. Beyond a defined threshold, run as a background job with visible progress, a cancel control, and a result summary the operator can return to.
* Report partial failure honestly — succeeded, failed, and skipped counts, failures listed with reasons, retry offered for the failed subset only.

Bulk destructive operations use the strictest tier below that applies to any record in the selection.

---

# Destructive Action Safety

Match friction to consequence. Uniform confirmation dialogs train operators to dismiss them unread.

## Undoable

For status transitions, assignment, and archiving: execute immediately with no dialog, confirm inline near the origin, and offer undo for a defined window — long enough to notice a mistake, short enough not to imply permanence. Undo restores the previous state completely, including side effects.

Speed is the safety mechanism at this tier, because immediate feedback plus undo catches errors faster than a dialog nobody reads.

---

## Confirmable

For refunds, plan changes, permission grants, and customer communications, consulting Dialogs and Feedback System:

* require an explicit confirmation step
* name the specific record, the specific change, and who will be notified
* label the confirming button with the verb of the action, never "OK"
* keep cancel available and holding default focus

---

## Irreversible

For hard deletion, data purge, key rotation, and cancellation without reinstatement:

* require typed confirmation of the record's own name or identifier, so the action cannot complete by muscle memory
* state the blast radius before confirming — the counts of every dependent record affected
* name in plain language what cannot be recovered
* require a reason, captured into the audit trail
* require re-authentication or second-factor confirmation for the highest-consequence operations
* keep the destructive control visually and physically separated from routine actions

Prefer soft deletion with a stated retention window wherever the domain permits. Reversibility is a design feature, not a database detail, and an operator who cannot see the blast radius will eventually detonate one.

---

# Audit Trail Design

If an admin panel cannot answer who changed this and why, it cannot be trusted during an incident.

Capture for every write operation:

```
Acting operator identity
Active role at time of action
Impersonated subject, when applicable
Action performed
Target entity type and identifier
Field-level before and after values
Timestamp in UTC, displayed in the viewer's timezone
Source address and client
Correlation identifier linking related changes
Operator-supplied reason, where required
Outcome — succeeded, failed, partially applied
```

Present it so that it is readable by a non-engineer — "Status changed from Pending to Approved," not a raw diff payload — newest first, grouped when one operation produced many changes, filterable by operator, action, and date range, immutable and never editable from the panel, and including reveals of sensitive data as actions in their own right.

Audit history is also the fastest debugging tool the operations team has. Design it as a feature, not as compliance overhead.

---

# States

Every admin surface defines all states, because operators meet them daily. Consult Empty States System, Loading States System, and Error States System.

```
Loading — skeletons matching final row and field dimensions
Empty — no records yet, with the action that creates the first
Filtered empty — names the filter that excluded everything, offers to clear it
Partial — unavailable data labelled explicitly, page still usable
Error — plain cause, scoped retry, reference identifier for escalation
Saving — field-level or row-level, never a blocking page spinner
Success — inline confirmation, with undo where the action is undoable
Conflict — another operator changed this record; show both values, require a choice
Permission-limited — capability absent, with one statement of who has it
```

Concurrent editing is normal in admin work, and a panel that silently overwrites a colleague's change manufactures incidents.

---

# Mobile Admin

Admin panels are used on phones during incidents, on call, and away from a desk. Mobile is a required mode, not a courtesy.

Define which operations must work on a phone. At minimum: global search and record lookup, reading current state and recent history, the time-critical approvals the on-call role owns, and acknowledging alerts.

* touch targets minimum 44×44, with clear separation between routine and destructive actions
* tables become stacked record cards showing identity, status, and the field being scanned; horizontal scroll only where a true matrix must survive, with a visible edge affordance
* primary action reachable in the lower half of the screen, destructive actions never adjacent to it
* filters and record actions open in a bottom sheet rather than a desktop dropdown
* confirmation strength is never reduced on mobile — typed confirmation stays required
* forms stay short, keyboard-appropriate, and preserve drafts across app switching and connection loss

Operations that should not be attempted on a phone say so plainly and offer a hand-off, rather than presenting a cramped control that invites a mistake.

Desktop space is spent on more records per screen, detail beside list so queue position survives, side-by-side comparison, and keyboard movement between records — never on decorative charts, unused columns, or wider forms. Consult Mobile First, Mobile Intelligence, Bottom Sheets, and Responsive Review.

---

# Accessibility Requirements

Operators use this tool for entire shifts, so accessibility failures compound into fatigue and error. Consult Accessibility Intelligence and Accessibility Review.

* text contrast minimum 4.5:1; borders, focus rings, and status indicators minimum 3:1
* status, severity, and impersonation state carry text or shape in addition to colour
* tables use real header semantics so screen reader users can navigate by column
* selection state, row counts, and bulk results are announced through a live region
* dialogs trap focus, dismiss on escape, and return focus to the triggering control
* every action is keyboard operable with a visible focus indicator at all times
* layout survives 200% zoom without loss of function, and reduced motion is respected so state changes appear rather than animate

---

# Performance Requirements

* global search returns results as the operator types, cancelling in-flight requests
* lists paginate, filter, and sort server-side; the client never receives full tables to process locally
* the first screen of a queue is usable in under one second on a warm cache
* inline edits commit optimistically with clear rollback on failure
* bulk work beyond the synchronous threshold moves to background jobs with progress reporting
* record detail loads identity and status first, then related records progressively

---

# Anti-Patterns

Never build:

* an admin panel that looks like a raw database client because it is internal
* generated CRUD screens mirroring table structure instead of operations
* one confirmation style applied identically to archiving and to permanent deletion
* delete controls placed beside routine actions, or disabled buttons with lock icons and no statement of who may act
* impersonation without a persistent, undismissable indicator
* bulk selection that silently persists across filter changes
* bulk actions reporting success while skipping ineligible records
* destructive actions with no recorded reason and no audit entry
* history rendering raw diff payloads to non-engineers, or mouse-only workflows for high-frequency tasks
* forms that discard typed work on navigation or connection loss
* mobile views hiding the actions the on-call role needs, or silent overwrites when two operators edit one record
* admin dashboards full of metrics nobody acts on

---

# Deliverables

Produce for every admin panel:

* **Operator and role map** — roles, permitted operations, scope limits, elevation paths
* **Operation inventory** — frequency, cardinality, reversibility, notification effect, preconditions
* **Consequence classification** — every action assigned undoable, confirmable, or irreversible, with the confirmation design that follows
* **Architecture definition** — navigation model, directories, list columns and filters, saved views, detail structure
* **Efficiency specification** — keyboard map, inline-editable fields, bulk limits and thresholds, repeated-entry flows
* **Audit specification** — fields captured, retention, presentation, and which actions require a reason
* **State definitions** — every state above, for every surface
* **Responsive specification** — operations guaranteed on mobile, layout transformation, mobile action placement
* **Review record** — UX Review, Component Review, Security Review, Accessibility Review, Mobile Review, Performance Review, Final Approval

---

# Completion Criteria

An admin panel is complete only when:

```
✓ Every role's capabilities are defined and enforced in the interface
✓ Every action is classified by consequence
✓ Irreversible actions require typed confirmation, stated blast radius, and a reason
✓ Undoable actions execute immediately and offer real undo
✓ Impersonation is unmistakable, scoped, and audited on both identities
✓ Bulk operations state true scope, preview effects, and report partial failure
✓ Frequent tasks are completable without the mouse
✓ Inline editing saves at field level with real failure states
✓ Every write produces a readable audit entry
✓ Concurrent edits are detected rather than overwritten
✓ All states exist, including conflict and permission-limited
✓ On-call operations work on a phone at full confirmation strength
✓ Contrast, focus, keyboard, and screen reader requirements pass
✓ Lists and search stay fast at production data volume
✓ A new operator completes the most common task without training
```

The last criterion is the honest one. If the panel requires tribal knowledge, the design is unfinished.

---

# Final Rule

An admin panel is where the product's promises are kept or broken by hand.

Design it for the operator who is tired, three hours into a queue, on a phone during an incident, one keystroke away from changing a real customer's life.

Make the frequent action fast.

Make the dangerous action deliberate.

Make everything that happened permanently answerable.
