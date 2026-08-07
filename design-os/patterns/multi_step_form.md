# Multi-Step Form Pattern
**Version:** 1.0
**Status:** Pattern Layer
**Depends On:** Forms System, UX Intelligence, Content Intelligence, Accessibility Intelligence, Mobile Intelligence, Error States System

---

# Purpose

The Multi-Step Form Pattern defines the complete solution for collecting complex information in sequenced steps while reducing cognitive load and preserving progress.

A long form is not a single screen problem. It is a motivation problem. Users quit when effort is unclear, mistakes feel risky, or a failure resets work.

This pattern turns one intimidating form into a guided, recoverable flow with one clear action per step.

---

# When To Use

Use this pattern when:

- data collection exceeds a comfortable single-screen form
- fields belong to distinct groups with validation boundaries
- submission can be staged or reviewed before final confirmation
- users may need to pause and resume later
- legal or compliance steps require explicit acknowledgment

---

# When Not To Use

Do not use this pattern when:

- fewer than 6 to 8 fields can fit clearly on one page
- all fields are optional and order does not matter
- data can be captured from profile defaults or integrations
- users only need one transactional action (use a focused single-step form)

Never split a simple form into steps just to mimic enterprise software aesthetics.

---

# User Goal

The primary goal is:

```
Complete required information correctly

↓

Understand progress and remaining effort

↓

Fix errors without redoing completed work

↓

Submit with confidence
```

---

# User Journey

```
Starts form from entry point

↓

Sees total steps and purpose

↓

Completes current step with inline help

↓

Moves forward with validation feedback

↓

Reviews summary before final submit

↓

Submits and receives confirmation

↓

Returns later to edit if allowed
```

---

# UX Flow

## Entry

The entry view states:

- why this form exists
- estimated completion time
- number of steps
- whether save-and-resume is available

## Step Completion

Each step includes:

- focused field group
- optional context panel or examples
- inline validation
- one primary action ("Continue")

## Navigation

Navigation rules:

- next step allowed only when required fields pass step-level validation
- back never clears data
- direct jump to previous steps always allowed
- direct jump to future steps allowed only when prerequisites are satisfied

## Review

A review step consolidates all captured data with edit links by section.

## Submit

Final submit confirms:

- what will happen next
- response time expectation
- recovery path if submission fails

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Business application     │
│ Step 2 of 5              │
│ About your company       │
├──────────────────────────┤
│ Progress: ███░░ 40%      │
├──────────────────────────┤
│ Legal name               │
│ [____________________]   │
│ Registration number      │
│ [____________________]   │
│ Industry                 │
│ [ Select ]               │
│                          │
│ Need help finding reg no?│
│ [ See example ]          │
├──────────────────────────┤
│ [ Back ] [ Continue ]    │
└──────────────────────────┘
```

## Tablet

```
┌────────────────────────────────────────────┐
│ Stepper + title + time estimate            │
├─────────────────────────┬──────────────────┤
│ Form step fields        │ Help / examples  │
│ Inline validation       │ Rules and tips   │
├─────────────────────────┴──────────────────┤
│ Back                      Continue          │
└────────────────────────────────────────────┘
```

## Desktop

```
┌──────┬─────────────────────────────────────────────────┐
│ Nav  │ Multi-step form title                           │
│      ├───────────────┬─────────────────────────────────┤
│      │ Step sidebar  │ Active step form               │
│      │ 1. Profile ✓  │ Fields                          │
│      │ 2. Company •  │ Inline checks                    │
│      │ 3. Documents  │ Error summary if needed          │
│      │ 4. Review     │                                 │
│      ├───────────────┴─────────────────────────────────┤
│      │ Back                              Continue       │
└──────┴──────────────────────────────────────────────────┘
```

---

# Component Hierarchy

```
MultiStepFormPage
├── PageHeader
│   ├── FormTitle
│   ├── StepCounter
│   └── TimeEstimate
├── ProgressIndicator
├── StepNavigation
│   └── StepItem ×n
├── ActiveStepPanel
│   ├── StepHeading
│   ├── FieldGroup ×n
│   │   ├── FieldLabel
│   │   ├── InputControl
│   │   ├── HelperText
│   │   └── FieldError
│   ├── StepErrorSummary optional
│   └── StepActions
├── SaveAndResumeBanner optional
├── ReviewStep optional
│   └── ReviewSection ×n
│       ├── SummaryRows
│       └── EditLink
└── SubmissionResult
```

---

# Interaction Flow

```
Field entry
↓
Inline format checks
↓
Step validation on continue
↓
Move to next step with saved progress
↓
Review and edit
↓
Final submit
↓
Success or recoverable failure
```

Key rules:

- Enter key submits current step action, not final form, unless on review step.
- Autosave runs after stable input pauses when save-and-resume is enabled.
- On return visits, users resume at first incomplete required step.
- Step change preserves scroll position per step for long sections.

## Interaction Branches And Recovery Flows

### Branch A — Happy Path Completion

```
User completes step fields
↓
Continue validation passes
↓
Step marked complete
↓
Next step opened at first incomplete field
```

Guardrails:

- keep exactly one primary action label per step (`Continue` or `Review`)
- show immediate progress update ("Step 2 complete. 3 steps remaining.")
- persist step completion event before navigation transition

### Branch B — Validation Blocked Continue

```
User selects Continue
↓
Required/dependency checks fail
↓
Error summary receives focus
↓
User jumps to first invalid field and corrects
↓
Continue becomes available again
```

Recovery details:

- keep valid fields untouched; never reset a whole step
- retain user cursor position when returning from summary links
- include one corrective hint per failing field, not generic errors

### Branch C — Autosave Interruption

```
Autosave request starts
↓
Network or server error occurs
↓
Local draft remains active
↓
Retry in background with explicit status
↓
User can manually retry or copy answers
```

Recovery details:

- preserve unsaved draft in encrypted local storage where policy requires
- show "Last successful save at HH:MM" to reduce uncertainty
- disable destructive navigation prompts once save catches up

### Branch D — Session Expiry And Re-Authentication

```
Expiry threshold reached
↓
Warning banner + countdown shown
↓
User extends session OR session expires
↓
Re-auth flow returns to last durable checkpoint
```

Recovery details:

- identify what was saved vs local-only before redirecting to sign-in
- after return, announce resume context ("Back at Step 4: Billing")
- record expiry events for operational monitoring

### Branch E — Cross-Device Draft Conflict

```
User resumes draft
↓
Version mismatch detected
↓
Conflict chooser shown
↓
User compares sections and selects merge strategy
↓
Merged draft becomes active version
```

Recovery details:

- show per-section modified timestamps and actor metadata
- default to safest non-destructive option (`Keep both as draft copy`) where policy allows
- generate audit event for every merge decision

---

# States

## Loading — First Open

Microcopy:

- "Preparing your form..."
- "Loading saved progress..."

Behavior:

- step shell appears first
- active step fields skeletonized
- do not block step sidebar when basic metadata is ready

## Empty — New Form

Microcopy:

- "This form takes about 6 minutes."
- "You can save and continue later."

## In Progress — Valid

Microcopy:

- "Step 3 of 5 complete after this section."
- "Saved just now."

## In Progress — Unsaved Changes

Microcopy:

- "Saving..."
- "Changes not yet saved."

## Field Error — Required Missing

Microcopy:

- "Enter your legal company name."

## Field Error — Format

Microcopy:

- "Registration number must be 8 digits."
- "Use format +254 7XX XXX XXX."

## Field Error — Dependency

Microcopy:

- "Select your country first to choose a state."

## Step Error Summary

Microcopy:

- "3 fields need attention before you continue."
- linked list of field names for focus navigation

## Cross-Step Validation Error

Microcopy:

- "Billing contact must match an existing team member from Step 1."
- actions: `[Go to Step 1] [Change billing contact]`

## Save Failure

Microcopy:

- "We could not save your progress."
- "Your latest changes are still on this device."
- actions: `[Retry save] [Copy responses]`

## Session Expiry Warning

Microcopy:

- "Your secure session expires in 2 minutes."
- actions: `[Extend session]`

## Session Expired

Microcopy:

- "Your session expired for security."
- "Sign in again to continue from your last saved step."

## Review Step

Microcopy:

- "Review your responses before submitting."
- "Edit any section without losing progress."

## Submission Loading

Microcopy:

- "Submitting your form..."
- "Do not close this page."

## Submission Error — Temporary

Microcopy:

- "We could not submit right now."
- "Your answers are saved."
- actions: `[Try again] [Submit later]`

## Submission Error — Conflict

Microcopy:

- "This application was updated from another session."
- actions: `[Load latest] [Keep my draft copy]`

## Success

Microcopy:

- "Application submitted."
- "Reference APP-20489."
- "We emailed confirmation to a@example.com."

## Expanded State Matrix

The matrix below turns state names into implementation-ready behavior and microcopy.

### State Matrix — Entry And Progress

**State:** First-open loading  
**Trigger:** route opens and form metadata not yet hydrated  
**UI response:** step shell visible, active step skeletonized, disabled primary action  
**Primary microcopy:** "Preparing your form..."  
**Secondary microcopy:** "Loading saved progress..."  
**Recovery action:** automatic retry with fallback prompt after timeout  
**Telemetry:** `form_open_started`, `form_open_ready_ms`

**State:** New draft ready  
**Trigger:** no prior saved progress for current user+entity  
**UI response:** Step 1 active, effort estimate and save behavior visible  
**Primary microcopy:** "This form takes about 6 minutes."  
**Secondary microcopy:** "You can save and continue later."  
**Recovery action:** offer template/sample answers only when domain allows  
**Telemetry:** `form_draft_created`

**State:** In-progress and valid  
**Trigger:** required fields in current step satisfy validation  
**UI response:** continue action enabled, completion preview shown  
**Primary microcopy:** "Step 3 of 5 complete after this section."  
**Secondary microcopy:** "Saved just now."  
**Recovery action:** none required  
**Telemetry:** `step_valid`, `step_continue_enabled`

**State:** Unsaved local changes  
**Trigger:** user edits field and save has not completed  
**UI response:** subtle save indicator, navigation guard active  
**Primary microcopy:** "Saving..."  
**Secondary microcopy:** "Changes not yet saved."  
**Recovery action:** manual retry control appears after retry threshold  
**Telemetry:** `autosave_pending`, `autosave_retry_count`

### State Matrix — Validation And Submission

**State:** Required field missing  
**Trigger:** continue selected with empty required field  
**UI response:** inline error + summary link target  
**Primary microcopy:** "Enter your legal company name."  
**Secondary microcopy:** "This field is required to continue."  
**Recovery action:** focus moved to missing field label and input  
**Telemetry:** `field_error_required`

**State:** Format error  
**Trigger:** value fails pattern/format rule  
**UI response:** inline corrective hint with accepted example  
**Primary microcopy:** "Registration number must be 8 digits."  
**Secondary microcopy:** "Use numbers only, no spaces."  
**Recovery action:** keep entered value for quick correction  
**Telemetry:** `field_error_format`

**State:** Dependency error  
**Trigger:** conditional field requested before parent field chosen  
**UI response:** dependent field disabled with explanatory helper text  
**Primary microcopy:** "Select your country first to choose a state."  
**Secondary microcopy:** "Country controls available state options."  
**Recovery action:** jump action to prerequisite field  
**Telemetry:** `field_error_dependency`

**State:** Submission temporary failure  
**Trigger:** submit request times out or receives transient 5xx  
**UI response:** keep review data frozen, show retry actions  
**Primary microcopy:** "We could not submit right now."  
**Secondary microcopy:** "Your answers are saved."  
**Recovery action:** `[Try again]` and `[Submit later]`  
**Telemetry:** `submit_failed_transient`, `submit_retry_selected`

**State:** Submission conflict  
**Trigger:** stale version or policy conflict returned by server  
**UI response:** conflict banner + safe merge options  
**Primary microcopy:** "This application was updated from another session."  
**Secondary microcopy:** "Choose whether to load latest or keep a draft copy."  
**Recovery action:** `[Load latest] [Keep my draft copy]`  
**Telemetry:** `submit_failed_conflict`, `conflict_resolution_selected`

## State Microcopy Blocks

Use these blocks for consistency across product surfaces using this pattern.

### Save-State Block

- status-ready: "Saved just now."
- status-pending: "Saving..."
- status-failed: "We could not save your progress."
- action-retry: "Retry save"

### Validation Block

- summary-title: "{n} fields need attention before you continue."
- missing-required: "This field is required."
- dependency-guidance: "Complete the previous field to continue."
- help-navigation: "Jump to the first issue"

### Submission Block

- in-progress: "Submitting your form..."
- temporary-failure: "Submission is unavailable right now."
- conflict-failure: "Your draft differs from the latest version."
- success-confirmation: "Application submitted."

## Step Decision Matrix

Use this matrix to keep step behavior deterministic across implementations.

| Condition | Continue Enabled | Error Summary | Autosave | Navigation Guard |
| --- | --- | --- | --- | --- |
| No edits yet | No (until required met) | Hidden | Idle | Off |
| Required missing | No | Visible after attempt | Active | On |
| Required met + format valid | Yes | Hidden | Active | On until save |
| Async validator pending | No | Hidden | Active | On |
| Async validator failed | No | Visible with inline context | Active | On |
| Save failed, local draft intact | Yes with warning | Optional | Retry queue | On |
| Session expiring <2 min | Yes | Optional | Active | On + session prompt |
| Submission in progress | No | Hidden | Locked | On |

Interpretation rules:

- do not disable back navigation for validation failures unless policy requires signed attestation continuity
- when `Continue` is disabled, expose reason text close to action controls
- async validator pending states must include explicit non-blocking explanation when user can still edit

## Branch-Specific Recovery Playbooks

### Playbook 1 — Required Field Loop

1. User selects Continue with required missing.
2. Move focus to summary heading and announce issue count.
3. On summary link activation, move focus to label then field.
4. Keep current value and helper context; do not clear input.
5. Re-run only affected validations after correction.

### Playbook 2 — Cross-Step Dependency Loop

1. Detect dependency mismatch (for example, billing contact no longer exists).
2. Show actionable choice near conflict:
   - go to source step
   - select alternate value in current step
3. Preserve current step draft while user resolves source dependency.
4. Return user to originating point with context retained.

### Playbook 3 — Save Failure With Local Draft

1. Mark save status as failed and keep local-draft badge visible.
2. Provide immediate retry and background retry.
3. Offer secure copy/export of responses for high-risk forms.
4. Prevent destructive exits without explicit confirmation.
5. Record save failure diagnostics for operations monitoring.

### Playbook 4 — Submission Conflict

1. Lock final submit action to avoid duplicate requests.
2. Surface conflict source and recency.
3. Allow compare-and-choose by section, not just all-or-nothing.
4. Persist user selection with conflict audit stamp.
5. Re-validate only affected sections before final commit.

## Accessibility Verification Scenarios

### Scenario A — Keyboard-Only Completion

- user can traverse step nav, fields, and actions in expected order
- no keyboard trap in date pickers, combo boxes, or rich text fields
- error correction does not require pointer to reveal hidden guidance

### Scenario B — Screen Reader Clarity

- step header announces form name, step number, and remaining steps
- every error summary link resolves to identifiable label text
- autosave announcements remain polite and not repetitive during rapid typing

### Scenario C — Cognitive Load And Readability

- each step has one clear primary action label
- helper text precedes uncommon/complex fields, not after failure
- review step presents grouped summaries rather than dense raw dumps

## Instrumentation And Success Metrics

Track these events to validate pattern quality in production:

- `form_step_viewed` with step id and session id
- `form_step_completed` with validation-attempt count
- `form_validation_error` with rule category and correction latency
- `form_autosave_result` with duration and retry count
- `form_resume_used` with checkpoint source (same device or cross-device)
- `form_submit_result` with outcome class (success/transient/conflict/permanent)

Recommended thresholds:

- median correction latency for required errors under 30 seconds
- autosave success rate above 99% on stable network segments
- resume success above 98% for interrupted sessions
- duplicate submission incidence near zero under retry behavior

---

# Mobile Behavior

- touch targets minimum 44x44 for step controls and actions
- one step in viewport; avoid crowded dual-column fields
- sticky bottom action bar keeps Back and Continue reachable
- numeric and email keyboards mapped correctly
- auto-scroll to first error field after failed continue
- network loss banner persists until recovery; inputs remain editable locally
- reduced-motion mode disables animated step transitions

---

# Desktop Expansion

Added space is used for:

- persistent step sidebar with completion state
- contextual help panel for complex sections
- side-by-side optional fields where semantic grouping allows
- richer review comparison rows

Added space is not used to increase required fields per step beyond cognitive comfort.

---

# Accessibility Requirements

- each step has clear heading hierarchy and announced position ("Step 2 of 5")
- labels are persistent and associated; placeholders are supplemental only
- error summary receives focus on failed continue and links to fields
- all step navigation is keyboard operable with visible focus states
- progress indicator has text equivalent, not color-only completion markers
- live region announces autosave status politely
- reduced motion respected for progress and transitions
- 200% zoom preserves usable layout and visible action controls
- screen-reader users can navigate by step landmarks and field groups
- error messages are programmatically tied to controls via `aria-describedby`
- review step changes are announced as context changes, not silent DOM updates
- timeout warnings are conveyed with text and live region messaging
- keyboard users can complete entire form without pointer-only affordances

---

# Data Requirements

Define before implementation:

- step schema and field ownership by business domain
- required/optional logic including conditional branches
- cross-step dependency map
- autosave payload frequency and merge strategy
- resume token lifetime and access controls
- submission idempotency and duplicate prevention
- edit window rules after submission
- audit events for step completion and field updates
- PII classification tags per field for encryption and logging policies
- data minimization rules for optional fields and retention boundaries
- secure draft storage requirements for shared/public devices
- deterministic server-side validation parity with client validation rules
- replay-safe submit tokens for network retries

---

# Performance Requirements

- initial shell render under 1s on warm route
- step transition under 200ms after validation success
- autosave debounced to avoid network flooding
- validation logic runs incrementally, not full-form on every keypress
- payload chunking for large forms with file attachments
- resume hydration avoids blocking first interactive step
- background save retries use capped exponential backoff with jitter
- field-level async validators are cancellable during rapid typing
- large select datasets are lazy-loaded with searchable fallback
- attachment preflight checks run before full upload to reduce waste
- step analytics emission is batched to avoid chatty network overhead

## Data Integrity And Privacy Controls

- draft payload encryption at rest when forms include regulated identifiers
- server redaction for high-risk fields in operational logs and traces
- strict separation of draft ownership to prevent cross-tenant leakage
- conflict merge records include actor, source version, and chosen resolution
- explicit retention schedule for abandoned drafts and submitted payload snapshots

---

# Anti-Patterns

Never build:

- unknown total effort with no step count
- hidden required fields revealed only at final submit
- clearing entire step on one validation error
- forcing users to repeat completed steps after transient errors
- generic "Invalid input" messages with no correction hint
- progress indicators without text equivalents
- auto-advancing steps that skip user confirmation on critical fields
- final submit button labeled "Continue"

---

# Pattern Output Example

```
Product
B2B supplier onboarding

Goal
Collect legal, tax, contact, and payout details

Flow
5 steps + review + confirmation

Recovery
Autosave every stable change, resume across devices

Error handling
Step-level summary + field guidance + conflict recovery

Mobile
Single-column fields, sticky actions, keyboard-safe errors

Outcome
Submission reference + next review timeline

Review
Pass
```

---

# QA Checklist

- [ ] Form purpose and effort estimate visible before first input
- [ ] Step count and current position always visible
- [ ] One primary action per step
- [ ] Back navigation preserves all entered values
- [ ] Step validation errors provide specific correction guidance
- [ ] Error summary links focus to each invalid field
- [ ] Cross-step dependencies are validated before final submit
- [ ] Autosave behavior is clear, resilient, and announced accessibly
- [ ] Session expiry warning and recovery exist
- [ ] Review step enables section edits without data loss
- [ ] Submission failures preserve data and provide retry path
- [ ] Mobile targets are 44x44 and keyboard does not hide key actions
- [ ] Reduced motion and 200% zoom paths verified

## Outcome-Based QA Scenarios

### Outcome: User finishes without assistance

- [ ] At least 90% of users in test cohort complete flow without opening help
- [ ] Median completion time stays within stated estimate tolerance
- [ ] Users can identify remaining steps at every point in the journey

### Outcome: Validation improves accuracy, not friction

- [ ] Required field error rate decreases between first and second attempt
- [ ] Error messages lead to correction within one revisit for common cases
- [ ] Cross-step dependency violations are caught before submission call

### Outcome: Progress survives interruption

- [ ] Closing tab and returning restores latest durable checkpoint correctly
- [ ] Session expiry returns users to preserved step after re-auth
- [ ] Save failures never cause silent data loss in observed test runs

### Outcome: Submission is trustworthy

- [ ] Duplicate submits do not create duplicate records under retry conditions
- [ ] Conflict path produces a clear choice and preserved draft option
- [ ] Success message includes a durable reference users can retrieve later

### Outcome: Accessible completion parity

- [ ] Keyboard-only users complete at comparable success rate to pointer users
- [ ] Screen-reader flow exposes step position, errors, and save state clearly
- [ ] Zoomed and reduced-motion contexts preserve all critical actions

### Outcome: Operational reliability at scale

- [ ] Peak-hour autosave throughput maintains acceptable p95 latency
- [ ] Resume checkpoints load within defined performance budget
- [ ] Submission conflicts are resolved without support intervention in most cases

### Outcome: Compliance-safe handling

- [ ] Sensitive fields are masked in logs, exports, and diagnostics
- [ ] Draft retention and purge policies execute as documented
- [ ] Audit history links edits, saves, conflicts, and final submission cleanly

## Scenario Acceptance Set

Use these acceptance scenarios during final review.

### Scenario 1 — First-Time Applicant, No Interruptions

- entry message sets realistic effort expectation
- user completes each step without encountering ambiguous controls
- review step clearly distinguishes editable sections from final attestations

### Scenario 2 — Applicant With Repeated Validation Errors

- correction hints remain specific and non-judgmental
- summary links always return to intended invalid field
- previously valid sections never regress due to unrelated edits

### Scenario 3 — Interrupted Session On Mobile

- warning appears before secure session expiry
- re-auth returns user to correct step and scroll position
- keyboard reopening does not hide step actions or key messages

### Scenario 4 — Concurrent Draft Edit Across Devices

- conflict path shows clear recency and author information
- user can preserve their draft even when loading latest canonical version
- merged result revalidates only impacted sections

## Reference Microcopy Library

Use consistent voice for critical form moments:

- effort-intro: "This form takes about {minutes} minutes."
- progress-confirmation: "Step {current} of {total} complete after this section."
- save-pending: "Saving..."
- save-confirmed: "Saved just now."
- save-failed: "We could not save your progress."
- required-error: "This field is required."
- dependency-error: "Complete the previous field to continue."
- session-warning: "Your secure session expires in {minutes} minutes."
- submit-loading: "Submitting your form..."
- submit-success: "Application submitted."

Tone and clarity constraints:

- lead with outcome before technical detail
- keep imperative instructions short and direct
- avoid blame language ("you entered invalid data")
- include concrete next action whenever progress is blocked

## Implementation Handoff Criteria

Engineering handoff is ready only when:

- step schemas and dependency graph are versioned and test-covered
- autosave conflict semantics are defined for same-device and cross-device edits
- session expiry and re-auth return contract is implemented and validated
- observability events are wired with stable names and documented payload fields
- accessibility acceptance scenarios pass with keyboard and screen-reader checks
- QA outcome scenarios include both happy path and interruption-heavy journeys

## Release Readiness Signals

Before shipping a form built with this pattern, confirm:

- draft abandonment rate does not spike after introducing new validation rules
- conflict frequency is monitored and routed to design/product review when elevated
- support tickets referencing lost progress remain within agreed baseline
- mobile completion rate remains close to desktop completion rate for same workflow
- submission reference retrieval works from confirmation, history, and notifications

## Post-Launch Monitoring Focus

Monitor weekly:

- step-by-step drop-off deltas after copy or validation changes
- top five repeated validation errors and their correction time
- save failure hotspots by browser, device class, and connection quality
- conflict branch usage rate and successful self-resolution percentage
- accessibility defect reports tied to focus order, summaries, or live regions

## Continuous Improvement Loop

- prioritize fixes where correction latency is high and completion impact is measurable
- refine microcopy using observed misunderstanding patterns, not stylistic preference
- re-run outcome-based QA scenarios after every major validation or flow change
- compare mobile and desktop error-correction paths for parity each release
- review conflict-resolution outcomes with support and operations stakeholders

Execution note:

Treat completion quality and recovery quality as equal priorities.
Users remember whether progress felt safe more than they remember visual polish.
When trade-offs appear, preserve clarity of next action and data safety first.
Prefer deterministic behavior over clever automation that hides status.
If a user cannot explain where they are and what happens next, simplify again.
Confirming progress should feel immediate, accurate, and reversible where possible.
Consistency across steps is a trust feature, not just visual polish.
Reliable recovery is part of completion, not an edge case.

---

# Final Rule

A multi-step form is complete only when users always know where they are, what remains, and how to recover without losing work.
