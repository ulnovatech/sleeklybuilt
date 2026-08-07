# Error Recovery Pattern
**Version:** 1.0
**Status:** Pattern Layer
**Depends On:** Error States System, Feedback System, UX Intelligence, Accessibility Intelligence, Mobile Intelligence, Content Intelligence

---

# Purpose

The Error Recovery Pattern defines cross-cutting product flows for restoring progress after failures through retry, undo, resume, conflict resolution, and offline catch-up.

This pattern is not the same as a component-level error state library.

- Error States System defines message and scope behavior.
- Error Recovery Pattern defines end-to-end product journeys after failure.

If errors are handled locally but the user cannot finish their original goal, the product still fails.

---

# When To Use

Use this pattern when:

- users can lose progress due to network, session, service, or conflict failures
- workflows include non-trivial operations with partial completion risk
- asynchronous jobs or multi-step flows need resumability
- actions may need undo and safe rollback windows
- offline usage requires queued changes and later synchronization

---

# When Not To Use

Do not use this pattern when:

- operation is atomic and idempotent with instant safe retry and no user impact
- failure is purely informational and does not block goals
- system has no user-created state to preserve

Do not over-engineer recovery for disposable interactions, but never under-design it for business-critical workflows.

---

# User Goal

The user goal is:

```
Understand what failed
↓
Know what already happened
↓
Recover without losing meaningful work
↓
Finish the original task safely
```

---

# User Journey

```
Performs action
↓
Failure detected
↓
Sees clear failure scope and consequence
↓
Chooses recovery path (retry/undo/resume/conflict/offline sync)
↓
System preserves or restores valid progress
↓
Task completes or escalates with support reference
```

---

# UX Flow

## Entry Into Recovery

Recovery can be triggered from:

- inline failure in a form or table
- persistent banner after route change
- status center for background jobs
- notification from offline sync queue

Recovery entry must carry context:

- operation name
- resource involved
- timestamp
- current consequence state

## Branch Selection

Recovery branch is chosen by failure type:

1. temporary failure -> retry
2. accidental successful destructive action -> undo
3. interrupted long flow -> resume
4. concurrent update -> conflict resolution
5. offline change queue -> catch-up sync

## Rejoin Original Task

Every branch has one objective: return user to original intent with minimum repeated effort.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Action interrupted       │
├──────────────────────────┤
│ Draft invoice save failed│
│ at 11:08 AM              │
│                          │
│ Your changes are stored  │
│ on this device.          │
├──────────────────────────┤
│ [ Retry now ]            │
│ [ Continue offline ]     │
│ [ View details ]         │
└──────────────────────────┘
```

## Tablet

```
┌────────────────────────────────────────────┐
│ Recovery banner + action summary           │
├─────────────────────────┬──────────────────┤
│ Primary recovery action │ Details timeline │
│ Retry/Resume/Undo       │ What happened    │
├─────────────────────────┴──────────────────┤
│ Secondary options + support route          │
└────────────────────────────────────────────┘
```

## Desktop

```
┌──────┬─────────────────────────────────────────────────┐
│ Nav  │ Recovery center                                 │
│      ├──────────────────────────────┬──────────────────┤
│      │ Action cards by failure type │ Event timeline   │
│      │ Retry / Resume / Conflicts   │ attempt history  │
│      ├──────────────────────────────┴──────────────────┤
│      │ Return to task      Contact support             │
└──────┴──────────────────────────────────────────────────┘
```

---

# Component Hierarchy

```
ErrorRecoverySurface
├── RecoverySummary
│   ├── FailedOperationName
│   ├── CurrentConsequenceStatement
│   ├── LastAttemptTimestamp
│   └── ReferenceId optional
├── RecoveryActionGroup
│   ├── RetryAction optional
│   ├── UndoAction optional
│   ├── ResumeAction optional
│   ├── ResolveConflictAction optional
│   └── SyncNowAction optional
├── RecoveryDetailsPanel
│   ├── WhatFailed
│   ├── WhatSucceeded
│   ├── WhatWasPreserved
│   └── NextRecommendedAction
├── ProgressPreservationIndicator
├── BranchSpecificUI
│   ├── RetryStatus
│   ├── UndoWindowTimer
│   ├── ResumeCheckpointList
│   ├── ConflictDiffView
│   └── OfflineQueueView
└── EscalationRoute
```

---

# Interaction Flow

```
Failure event
↓
Recovery summary shown
↓
User selects branch
↓
Branch executes with feedback
↓
Outcome verified
↓
User returned to original task context
```

Rules:

- recovery controls appear near failure context first, with optional central recovery hub for cross-flow tracking
- irreversible uncertainty states block duplicate risky actions
- branch actions are idempotent where possible
- every failed attempt increments timeline and preserves diagnostic context

## Interaction Branches And Recovery Flows

### Branch A — Retry For Transient Failures

```
Transient error classified
↓
Retry offered with attempt budget
↓
User retries (manual or auto policy)
↓
Operation succeeds OR attempt budget exhausted
↓
User returns to task or moves to next safe branch
```

Recovery details:

- surface current attempt and max attempts clearly
- preserve original input payload across attempts
- escalate after budget exhaustion instead of hidden infinite retry

### Branch B — Undo For Recent Destructive Actions

```
Destructive action completed
↓
Undo window starts
↓
User undoes within window OR window expires
↓
State restores or archive/recovery path shown
```

Recovery details:

- include countdown with text fallback and exact expiry time
- verify linked entities restore consistently (not partial object only)
- log undo invocation and final state for audit confidence

### Branch C — Resume Interrupted Work

```
Workflow interrupted (session/network/navigation)
↓
Checkpoint discovered
↓
User resumes at last valid checkpoint
↓
Pending dependencies revalidated
↓
Workflow continues
```

Recovery details:

- show what was saved and what needs reconfirmation
- reopen at meaningful task context, not generic home screen
- block resume when underlying object state changed incompatibly

### Branch D — Conflict Resolution On Diverged State

```
Version mismatch detected
↓
Conflict review launched
↓
Per-field/per-section resolution chosen
↓
Merged state validated
↓
Task proceeds with explicit final ownership
```

Recovery details:

- prefer field-level merge where safe; avoid binary overwrite default
- present actor/timestamp for each conflicting value
- store explicit conflict decision events for compliance and debugging

### Branch E — Offline Queue And Deferred Sync

```
Connection loss detected
↓
Changes queued locally
↓
User continues with offline-safe operations
↓
Connectivity restored and sync attempted
↓
Success OR partial failure remediation
```

Recovery details:

- classify queue items by dependency and conflict risk
- prevent offline actions that require immediate authoritative server checks
- support per-item retry and discard with clear consequences

### Branch F — Uncertain Outcome (Critical)

```
Timeout or ambiguous commit response
↓
Outcome status unknown
↓
Duplicate-risking actions blocked
↓
Definitive status check performed
↓
Task either confirmed complete or safely resumable
```

Recovery details:

- present immutable reference id for support and audit
- prioritize status verification endpoint over user-initiated re-submit
- show explicit "do not repeat" warning with rationale

---

# States

## Recovery Pending

Microcopy:

- "We are checking what completed..."
- "Do not repeat this action yet."

## Retry Available

Microcopy:

- "This looks temporary. Try again now."
- primary: `[Retry]`

## Retry In Progress

Microcopy:

- "Retrying save..."
- "Attempt 2 of 3."

## Retry Success

Microcopy:

- "Saved successfully. You can continue."
- secondary: `[Return to invoice]`

## Retry Exhausted

Microcopy:

- "Still failing after 3 attempts."
- actions: `[Continue offline] [Contact support]`

## Undo Available

Microcopy:

- "Invoice deleted."
- "Undo available for 30 seconds."
- primary: `[Undo delete]`

## Undo Completed

Microcopy:

- "Invoice restored."
- "All linked drafts are back."

## Undo Window Expired

Microcopy:

- "Undo period has ended."
- action: `[Restore from archive]` when policy allows

## Resume Available

Microcopy:

- "Continue where you left off."
- "Last completed step: Company details."
- primary: `[Resume]`

## Resume Conflict

Microcopy:

- "Your draft and latest saved version differ."
- actions: `[Review differences] [Use latest] [Keep my draft copy]`

## Conflict Resolution — Field Level

Microcopy:

- "Phone number changed by Ama at 11:03."
- options per field: `[Keep mine] [Keep latest]`

## Conflict Resolution — Record Locked

Microcopy:

- "This record is currently being edited by another user."
- actions: `[Open read-only] [Notify me when unlocked]`

## Offline Queue Active

Microcopy:

- "You are offline. 5 changes waiting to sync."
- actions: `[Review queue] [Sync when online]`

## Offline Sync In Progress

Microcopy:

- "Syncing 5 queued changes..."

## Offline Sync Partial Failure

Microcopy:

- "3 changes synced. 2 need attention."
- actions: `[Resolve now] [Keep queued]`

## Uncertain Outcome (Critical)

Microcopy:

- "We are confirming whether this action completed."
- "Do not perform it again."
- reference shown
- primary: `[Check status]`

## Escalation Needed

Microcopy:

- "Self-recovery is not available for this issue."
- actions: `[Contact support] [Copy reference]`

## Recovery Complete

Microcopy:

- "Issue resolved. You're back on track."

## Expanded State Matrix

### State Matrix — Detection Through Decision

**State:** Recovery pending  
**Trigger:** failure detected and classifier still resolving scope  
**UI response:** temporary hold state with duplicate-action guard  
**Primary microcopy:** "We are checking what completed..."  
**Secondary microcopy:** "Do not repeat this action yet."  
**Recovery action:** automatic diagnostic check  
**Telemetry:** `recovery_pending_started`, `failure_scope_classified_ms`

**State:** Retry available  
**Trigger:** failure class marked transient and idempotent  
**UI response:** primary retry action + attempt budget indicator  
**Primary microcopy:** "This looks temporary. Try again now."  
**Secondary microcopy:** "No duplicate action will be created."  
**Recovery action:** `[Retry]`  
**Telemetry:** `recovery_retry_available`

**State:** Retry exhausted  
**Trigger:** retry attempt budget reached without success  
**UI response:** retry disabled, alternate branch actions shown  
**Primary microcopy:** "Still failing after 3 attempts."  
**Secondary microcopy:** "Choose an alternate recovery path."  
**Recovery action:** `[Continue offline] [Contact support]`  
**Telemetry:** `recovery_retry_exhausted`

**State:** Undo available  
**Trigger:** destructive action committed and undo policy allows rollback  
**UI response:** high-visibility undo control with window timer  
**Primary microcopy:** "Invoice deleted."  
**Secondary microcopy:** "Undo available for 30 seconds."  
**Recovery action:** `[Undo delete]`  
**Telemetry:** `recovery_undo_available`

**State:** Resume available  
**Trigger:** resumable checkpoint located for interrupted workflow  
**UI response:** resume card with last durable step details  
**Primary microcopy:** "Continue where you left off."  
**Secondary microcopy:** "Last completed step: Company details."  
**Recovery action:** `[Resume]`  
**Telemetry:** `recovery_resume_available`

### State Matrix — Conflict Through Completion

**State:** Resume conflict  
**Trigger:** checkpoint diverges from latest persisted version  
**UI response:** conflict chooser with safe defaults  
**Primary microcopy:** "Your draft and latest saved version differ."  
**Secondary microcopy:** "Review differences before continuing."  
**Recovery action:** `[Review differences] [Use latest] [Keep my draft copy]`  
**Telemetry:** `recovery_resume_conflict`

**State:** Offline sync partial failure  
**Trigger:** queued sync processes some items and fails others  
**UI response:** split outcome with unresolved item actions  
**Primary microcopy:** "3 changes synced. 2 need attention."  
**Secondary microcopy:** "Resolve remaining items or keep queued."  
**Recovery action:** `[Resolve now] [Keep queued]`  
**Telemetry:** `recovery_offline_sync_partial_failure`

**State:** Uncertain outcome critical  
**Trigger:** server timeout/ambiguous response on high-impact action  
**UI response:** blocking warning + status verification action  
**Primary microcopy:** "We are confirming whether this action completed."  
**Secondary microcopy:** "Do not perform it again."  
**Recovery action:** `[Check status]`  
**Telemetry:** `recovery_uncertain_outcome`, `uncertain_outcome_resolution_ms`

**State:** Escalation needed  
**Trigger:** no self-service path available or policy requires human intervention  
**UI response:** support route with prefilled diagnostic reference  
**Primary microcopy:** "Self-recovery is not available for this issue."  
**Secondary microcopy:** "Share this reference with support for faster resolution."  
**Recovery action:** `[Contact support] [Copy reference]`  
**Telemetry:** `recovery_escalation_required`

**State:** Recovery complete  
**Trigger:** selected branch successfully restores user progression  
**UI response:** completion confirmation + return-to-task link  
**Primary microcopy:** "Issue resolved. You're back on track."  
**Secondary microcopy:** "Continue your original task."  
**Recovery action:** contextual return action  
**Telemetry:** `recovery_completed`

## State Microcopy Blocks

### Retry Block

- ready: "This looks temporary. Try again now."
- in-progress: "Retrying save..."
- exhausted: "Still failing after 3 attempts."
- action: "Retry"

### Resume And Conflict Block

- resume-ready: "Continue where you left off."
- resume-detail: "Last completed step: {checkpointName}."
- conflict-alert: "Your draft and latest saved version differ."
- conflict-action: "Review differences"

### Uncertain Outcome Block

- warning-title: "Outcome still being confirmed."
- warning-body: "Do not repeat this action yet."
- status-action: "Check status"
- escalation-action: "Copy reference"

## Recovery Branch Decision Matrix

| Failure Class | Preferred Branch | User Risk If Wrong Action | Guardrail |
| --- | --- | --- | --- |
| Network timeout, idempotent save | Retry | Low to medium | Attempt cap + visible counter |
| Network timeout, non-idempotent payment-like action | Uncertain outcome | High | Block duplicate submit until verified |
| User accidental destructive action | Undo | Medium to high | Time-bounded undo + restore audit |
| Session/navigation interruption | Resume | Medium | Durable checkpoint + dependency recheck |
| Concurrent edit version mismatch | Conflict resolution | High | Field-level diff before commit |
| Offline connectivity loss | Offline queue | Medium | Queue visibility + sync status |
| Policy/authorization failure | Escalation or role re-auth | High | No local bypass of restricted action |

Interpretation rules:

- classify failure before presenting branch choices whenever possible
- when uncertainty involves financial/legal mutation risk, default to safe blocking branch
- branch labels must explain consequence, not only mechanism

## Failure Taxonomy To Recovery Mapping

### Class T1 — Transient Infrastructure

- examples: gateway timeout, brief dependency outage
- default branch: retry with bounded attempts
- escalation trigger: repeated failure past threshold

### Class T2 — Ambiguous Completion

- examples: request timeout after possible commit
- default branch: uncertain outcome verification
- escalation trigger: verification endpoint unavailable

### Class D1 — Data Conflict

- examples: stale version, locked record, concurrent overwrite
- default branch: conflict resolution
- escalation trigger: merge policy cannot produce deterministic outcome

### Class U1 — User Reversible Mistake

- examples: accidental delete/archive/close
- default branch: undo
- escalation trigger: undo window elapsed with no archive fallback

### Class O1 — Offline Or Device Interruption

- examples: connectivity loss, app restart mid-flow
- default branch: offline queue or resume checkpoint
- escalation trigger: local checkpoint corruption or queue integrity failure

## Recovery Timeline Requirements

Every recovery branch should populate a user-visible timeline:

- failure detected timestamp
- classification result and confidence
- branch selected and actor
- attempt count and outcomes
- final resolution state
- support reference linkage if escalated

Timeline quality rules:

- keep ordering strictly chronological
- never hide failed attempts after eventual success
- expose enough context to rebuild user trust quickly

## Escalation Payload Contract

When support escalation is required, payload must include:

- immutable reference id
- operation id and user-visible object identifier
- branch attempts and results
- failure class and top diagnostics (sanitized)
- user environment context (platform/version/network state)
- user-provided notes, if any

Privacy and safety:

- strip secrets and full sensitive field values
- include masked examples only when needed for diagnosis
- enforce least-privilege visibility for escalation viewers

---

# Mobile Behavior

- 44x44 minimum target size for all recovery actions
- persistent recovery banner stacks above content with clear dismiss rules
- bottom sheet for conflict comparison with field-by-field options
- offline queue accessible in one tap from app status area
- retry/undo actions remain reachable while keyboard is open
- reduced-motion mode disables animated countdown urgency effects

---

# Desktop Expansion

Added space is spent on:

- richer event timeline showing failure and attempts
- side-by-side conflict diff comparison
- queue management table for offline sync exceptions
- multi-item recovery operations for admins

Added space is not spent on modal overload; maintain direct task re-entry paths.

---

# Accessibility Requirements

- failure summaries receive focus when they block progress
- assertive live regions for critical uncertain-outcome warnings
- polite live regions for retry and sync status updates
- conflict options keyboard-operable per field
- countdown-based undo has text equivalent and no motion-only urgency
- support reference copy action has clear announced result
- color is never sole indicator for branch type or severity
- 200% zoom keeps recovery actions visible without horizontal loss
- blocked-action states are conveyed to assistive tech with explicit rationale
- timers (undo/session) include non-visual and non-motion equivalents
- conflict diffs expose semantic labels so fields are understandable by screen reader
- recovery completion transitions announce destination context clearly
- keyboard users can trigger every branch without hidden gesture dependencies

---

# Data Requirements

Define before build:

- operation idempotency strategy per action class
- rollback/undo eligibility windows and legal boundaries
- checkpoint model for resumable workflows
- conflict detection keys (version, timestamp, actor)
- offline queue storage model and retention duration
- sync conflict resolution policy precedence
- escalation reference generation format
- audit trail for retries, undos, resumes, and conflict decisions
- failure taxonomy model that maps error classes to allowed recovery branches
- immutable event chain linking original action id and all recovery attempts
- security/privacy classification for diagnostic payload displayed to end users
- retention and purge policy for offline queue and local checkpoints
- role-based constraints for destructive recovery actions (undo/force-resolve)

---

# Performance Requirements

- recovery summary appears within 300ms after failure classification
- retry actions initiate immediately with visible acknowledgment
- resume checkpoint retrieval under 500ms warm path
- conflict diff generation scalable for large records
- offline queue sync runs in background without blocking app shell
- branch transitions avoid full-page reload where context can be preserved
- failure classification pipeline responds fast enough for in-flow recovery
- status verification endpoint for uncertain outcomes returns deterministic results
- offline queue processing uses bounded concurrency to protect battery/perf
- conflict merge computation avoids main-thread lock in large form payloads
- support escalation payload generation remains sub-second with references attached

## Reliability Objectives

Define service objectives for recovery quality:

- recovery entry render p95 under 500ms after classified failure
- uncertain outcome verification success within SLA aligned to operation criticality
- checkpoint restoration success above 99% for resumable workflows
- duplicate prevention effectiveness near 100% for protected operations
- escalation payload generation failure below 0.1%

---

# Anti-Patterns

Never build:

- error dismissal with no recovery path
- retry loops that hide uncertain outcomes
- undo as toast-only for high-impact actions
- resume flow that discards unsaved local state silently
- conflict handling that auto-overwrites user data
- offline mode that pretends sync succeeded
- support escalation with no reference id
- forcing users to restart long workflows after transient failures

---

# Pattern Output Example

```
Product
Field service operations platform

Failure case
Job completion submission timed out

Recovery branches
Retry, uncertain-outcome status check, offline queue fallback

Conflict handling
Field-level merge for notes and parts usage

Undo
30-second undo for accidental job closure

Resume
Checkpoint resumes at "Customer signature" step

Result
User completes original job without duplicate billing

Review
Pass
```

---

# QA Checklist

- [ ] Recovery entry clearly states what failed and what succeeded
- [ ] Branch selection aligns with failure class (retry/undo/resume/conflict/offline)
- [ ] Uncertain outcomes explicitly block unsafe duplicate actions
- [ ] Retry attempts are bounded and transparent
- [ ] Undo windows and expiry behavior are explicit
- [ ] Resume preserves meaningful progress and context
- [ ] Conflict resolution prevents silent overwrite
- [ ] Offline queue supports partial sync recovery
- [ ] Escalation path includes support reference
- [ ] Keyboard and screen-reader paths cover full recovery flow
- [ ] Mobile actions remain reachable with 44x44 targets
- [ ] Recovery completion returns user to original task effectively

## Outcome-Based QA Scenarios

### Outcome: Users regain control quickly

- [ ] Users can identify safest next action within 5 seconds of recovery entry
- [ ] Failure scope ("what failed vs what completed") is understood without support
- [ ] Recovery branch labels reduce incorrect action retries in usability tests

### Outcome: Data loss and duplication are prevented

- [ ] Uncertain outcome path blocks duplicate submissions until status resolves
- [ ] Retry policies never create duplicate records for idempotent operations
- [ ] Resume/checkpoint logic restores intended progress with no hidden rollback

### Outcome: Conflict decisions are trustworthy

- [ ] Field-level conflict context (actor/time/value) is sufficient for informed choice
- [ ] Merge choices are persisted and auditable for later review
- [ ] No silent overwrite occurs in any tested conflict branch

### Outcome: Offline behavior is reliable

- [ ] Queued actions survive app restart/device sleep according to retention policy
- [ ] Partial sync failures produce item-level recovery paths
- [ ] Users can distinguish synced vs unsynced changes accurately

### Outcome: Escalation is effective when self-recovery fails

- [ ] Support reference includes enough diagnostics for first-response resolution
- [ ] Escalation handoff does not require user to re-explain core context
- [ ] Users can return to task context after escalation without dead-end screens

### Outcome: Accessibility parity in high-stress moments

- [ ] Critical warnings are announced appropriately without overwhelming noise
- [ ] Keyboard-only and screen-reader users can complete branch recovery at parity
- [ ] Zoom and reduced-motion contexts preserve urgency and clarity

### Outcome: Trust restoration after failure

- [ ] Users report clear understanding of what happened and what to do next
- [ ] Recovery timeline communicates progression without hidden system steps
- [ ] Completion confirmation resolves uncertainty about final system state

### Outcome: Support efficiency when escalation occurs

- [ ] First support response can act using provided reference without extra repro steps
- [ ] Escalation payload contains sufficient sanitized diagnostics
- [ ] Escalated users can return to task context without dead-end loops

## Scenario Acceptance Set

### Scenario 1 — Transient Save Failure

- retry appears immediately with attempt budget context
- successful retry returns user to original task point without data loss
- timeline captures each retry attempt and result

### Scenario 2 — Critical Uncertain Outcome

- user is clearly prevented from duplicate high-risk action
- status check resolves outcome to complete or resumable state
- escalation path remains available when verification fails

### Scenario 3 — Interrupted Multi-Step Workflow

- resume card identifies correct checkpoint and completion confidence
- dependency rechecks run only where state may be stale
- resumed flow does not force restart from first step

### Scenario 4 — Concurrent Edit Conflict

- conflicting fields expose actor/time/value context clearly
- chosen merge option persists and is auditable
- no silent overwrite occurs during merge apply

### Scenario 5 — Offline Queue Partial Sync

- synced and unsynced items are clearly differentiated
- user can retry unresolved items selectively
- queue integrity persists across app restart and reconnect

## Reference Microcopy Library

- recovery-pending: "We are checking what completed..."
- retry-offered: "This looks temporary. Try again now."
- retry-exhausted: "Still failing after 3 attempts."
- undo-window: "Undo available for {seconds} seconds."
- resume-ready: "Continue where you left off."
- conflict-alert: "Your draft and latest saved version differ."
- uncertain-warning: "Do not perform this action again yet."
- escalation-needed: "Self-recovery is not available for this issue."
- recovery-complete: "Issue resolved. You're back on track."

Microcopy standards:

- name outcome first, cause second
- avoid technical stack details in primary line
- always provide a next best action when blocked
- preserve calm, non-blaming tone in high-stress scenarios

## Implementation Handoff Criteria

- failure taxonomy and branch mapping are encoded in product logic, not ad hoc UI
- uncertain-outcome verification path exists for all high-impact operations
- undo/resume policies are bounded by explicit legal and business constraints
- conflict-resolution decisions are persisted with auditable provenance
- escalation payload contract is validated for privacy-safe diagnostic completeness
- recovery telemetry supports branch-level success and abandonment analysis

## Release Readiness Signals

Before release, verify these recovery outcomes in production-like staging:

- uncertain-outcome incidents resolve without duplicate high-risk mutations
- branch recommendation accuracy is high for observed failure classes
- recovery completion returns users to task context with minimal abandonment
- escalation references consistently reduce support resolution time
- offline queue recovery behavior remains stable across app restarts

## Post-Launch Monitoring Focus

Track continuously:

- time-to-safe-next-action from recovery entry
- uncertain-outcome frequency and verification resolution latency
- branch abandonment rate before recovery completion
- conflict merge reversal incidents and root causes
- offline sync exception recurrence by operation type

## Continuous Improvement Loop

- review branch recommendation mismatches and update classifier logic
- tune microcopy where users repeatedly select unsafe recovery actions
- replay high-severity incidents against outcome-based QA scenarios quarterly
- run periodic failover drills to validate uncertain-outcome guardrails
- track support escalations that could have been self-recovered and close gaps

Execution note:

Recovery design is successful when users can proceed with confidence after failure.
Speed matters, but certainty and safety matter more in high-impact actions.
Default to paths that minimize irreversible risk when evidence is incomplete.
Never hide ambiguity from users when duplicate actions could cause harm.
Make recovery status explicit until the original goal is safely completed.

---

# Final Rule

Error recovery is complete only when users can finish their original goal safely after failure, without fear of hidden duplication, loss, or inconsistency.
