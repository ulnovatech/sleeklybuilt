# Data Import Pattern
**Version:** 1.0
**Status:** Pattern Layer
**Depends On:** Forms System, Data Display System, Error States System, Content Intelligence, Accessibility Intelligence, Dashboard Intelligence
**Gated By:** Security Review

---

# Purpose

The Data Import Pattern defines the complete solution for bringing external structured data into a product safely, correctly, and recoverably.

Import is not a single upload action. It is a transformation flow:

```
External shape
↓
Validation
↓
Mapping
↓
Preview
↓
Commit
↓
Post-import reconciliation
```

When import fails silently or partially without clarity, users stop trusting the system's records.

---

# When To Use

Use this pattern when:

- users move data from CSV, XLSX, JSON, or flat file exports
- field mapping between source and destination is required
- duplicate handling or upsert strategy must be chosen
- imports can be long-running and asynchronous
- auditability of imported records matters

---

# When Not To Use

Do not use this pattern when:

- data is entered manually in low volume
- an API integration is available and preferred for ongoing sync
- import is one-time internal migration done by engineering only
- users only need lookup and not persistence

Never force spreadsheet import when native connectors can remove mapping burden.

---

# User Goal

The user goal is:

```
Get my data in quickly
↓
Map it correctly
↓
Avoid accidental duplicates or overwrites
↓
Confirm what happened
```

---

# User Journey

```
Opens import flow
↓
Downloads template or uses existing file
↓
Uploads source file
↓
Resolves structural and field-level issues
↓
Maps source columns to destination fields
↓
Previews create/update/skip outcomes
↓
Runs import
↓
Reviews results and fixes exceptions
```

---

# UX Flow

## Entry

Entry explains:

- accepted file formats
- maximum rows and file size
- required columns
- duplicate policy options
- estimated processing behavior

## Upload And Parse

1. file received
2. parser checks encoding, delimiter, sheet shape
3. header row normalized
4. immediate structural feedback shown

## Mapping

Users map each required destination field.

Mapping aids:

- automatic suggestions by name similarity
- data sample from first rows
- validation badges for required mappings

## Validation

Validation levels:

- file-level (invalid structure)
- row-level (missing required values)
- cell-level (format/type mismatch)
- business-rule level (uniqueness, permissions)

## Preview

Preview summarizes:

- rows to create
- rows to update
- rows to skip
- rows blocked by errors

## Commit

Import runs as job with progress and cancel rules.

## Reconcile

Result view offers:

- downloadable error report
- filtered table of failed rows
- retry import of failed subset

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Import customers         │
│ Step 1 of 4              │
├──────────────────────────┤
│ Upload file              │
│ CSV/XLSX up to 20MB      │
│ [ Choose file ]          │
├──────────────────────────┤
│ Parse result             │
│ 1,242 rows detected      │
│ 3 column issues found    │
│ [ View issues ]          │
├──────────────────────────┤
│ [ Continue ]             │
└──────────────────────────┘
```

## Tablet

```
┌────────────────────────────────────────────┐
│ Import flow header + stepper               │
├─────────────────────────┬──────────────────┤
│ Main stage              │ Validation panel │
│ Upload / Mapping / etc. │ Counts and tips  │
├─────────────────────────┴──────────────────┤
│ Primary action bar pinned                 │
└────────────────────────────────────────────┘
```

## Desktop

```
┌──────┬─────────────────────────────────────────────────┐
│ Nav  │ Import customers                                │
│      ├──────────────────────────────┬──────────────────┤
│      │ Stage workspace              │ Side insights    │
│      │ mapping table / preview      │ required fields  │
│      │ row-level issue table        │ import impact    │
│      ├──────────────────────────────┴──────────────────┤
│      │ Back         Save draft          Start import   │
└──────┴──────────────────────────────────────────────────┘
```

---

# Component Hierarchy

```
DataImportPage
├── PageHeader
├── ImportStepper
├── UploadStage
│   ├── FormatRulesCard
│   ├── FilePicker
│   ├── ParseSummary
│   └── StructuralIssuesList
├── MappingStage
│   ├── MappingTable
│   │   └── MappingRow ×n
│   │       ├── SourceColumn
│   │       ├── SampleValues
│   │       ├── DestinationFieldSelector
│   │       └── MappingStatus
│   ├── RequiredFieldChecklist
│   └── MappingValidationSummary
├── ValidationStage
│   ├── IssueTabs
│   ├── RowIssueTable
│   └── DownloadIssueReportAction
├── PreviewStage
│   ├── OutcomeSummaryCards
│   ├── DuplicatePolicySelector
│   ├── UpsertModeSelector
│   └── AffectedRecordsSample
├── ImportJobStage
│   ├── ProgressTracker
│   ├── ProcessedCounts
│   ├── JobLogRegion
│   └── CancelAction conditional
└── ResultStage
    ├── ImportResultSummary
    ├── FailedRowsTable
    ├── RetryFailedRowsAction
    └── ExportAuditAction
```

---

# Interaction Flow

```
Select file
↓
Parse + structure validation
↓
Map required fields
↓
Resolve high-priority issues
↓
Preview import outcomes
↓
Confirm policies and run
↓
Track progress
↓
Review result and recover exceptions
```

Rules:

- users can save mapping presets for recurring imports
- commit button remains disabled until required mappings and critical validations pass
- cancel before commit is immediate; cancel during commit follows safe-stop policy
- duplicate policy must be explicit before run: skip / update / create-new-version

## Interaction Branches And Recovery Flows

### Branch A — Clean Import Path

```
File selected
↓
Structure parses successfully
↓
Required fields mapped
↓
Critical validation passes
↓
Preview confirmed
↓
Import committed and completed
```

Guardrails:

- lock duplicate policy before enabling commit
- show destination object and mutation scope in final confirmation
- require explicit confirmation when updates or overwrites are possible

### Branch B — Structural Parse Failure

```
File selected
↓
Parser cannot read structure
↓
Actionable parse error shown
↓
User downloads template or re-uploads corrected file
↓
Parsing restarts with previous settings retained
```

Recovery details:

- preserve delimiter/encoding preferences where possible
- provide concrete failing indicator (sheet name, missing header row, encoding issue)
- avoid vague "invalid file" failures with no correction path

### Branch C — Mapping Incomplete Or Ambiguous

```
Parse succeeds
↓
Required destination fields unmapped or multiply mapped
↓
Mapping blocker summary shown
↓
User completes mapping or loads preset
↓
Validation resumes automatically
```

Recovery details:

- highlight highest-risk unmapped fields first (keys, identifiers, ownership)
- block commit until unmapped required fields reach zero
- preserve manual mappings when switching presets, with explicit merge rules

### Branch D — High-Volume Validation Failures

```
Validation starts
↓
Many row-level issues detected
↓
Issue panel groups by severity and fixability
↓
User resolves in-source or in-tool where allowed
↓
Re-validate only affected rows
```

Recovery details:

- separate fatal vs warning rows with clear impact counts
- allow failed-row export with deterministic column order
- support retry of failed subset without repeating successful rows

### Branch E — Long-Running Job Interruption

```
Import job running
↓
Service/network interruption detected
↓
Job pauses or continues server-side based on policy
↓
User sees checkpoint and recovery actions
↓
User resumes, cancels safely, or monitors until completion
```

Recovery details:

- always report what already committed versus what remains
- return a durable job reference for status resumption
- prevent duplicate commit for same job payload through idempotency key

### Branch F — Security Or Policy Violation

```
File accepted structurally
↓
Security scan or policy rule fails
↓
Sensitive-content blocker shown
↓
User removes prohibited columns/data and retries
↓
Import allowed only after clean scan
```

Recovery details:

- classify violations (PII policy, malware signature, restricted fields)
- redact sensitive snippets in UI while preserving actionable location
- audit every policy block and bypass attempt where role permits exception flow

---

# States

## Loading — Import Setup

Microcopy:

- "Preparing import workspace..."
- "Loading destination fields..."

## Empty — No File Selected

Microcopy:

- "Upload your file to begin."
- "Need a starting point? Download the template."

## Parse Success

Microcopy:

- "1,242 rows and 18 columns detected."
- "Delimiter and encoding look good."

## Parse Error — File Unreadable

Microcopy:

- "We could not read this file."
- "Use UTF-8 CSV or XLSX with a header row."
- actions: `[Download template] [Choose another file]`

## Parse Error — Wrong Sheet / Header Missing

Microcopy:

- "No header row found in Sheet1."
- "Row 1 should contain column names."

## Mapping Incomplete

Microcopy:

- "3 required fields are not mapped: Email, Company, Country."
- action: `[Complete mappings]`

## Row Validation Errors

Microcopy:

- "184 rows need fixes before import."
- "Top issue: Email format invalid in 77 rows."

## Duplicate Conflict Warning

Microcopy:

- "312 rows match existing records."
- "Choose how to handle duplicates before importing."

## Preview Ready

Microcopy:

- "Ready to import: 930 create, 280 update, 32 skip."

## Import Running

Microcopy:

- "Import in progress... 46% complete."
- "Processed 572 of 1,242 rows."

## Import Paused — Transient Service Failure

Microcopy:

- "Import paused due to temporary service issue."
- actions: `[Resume] [Cancel safely]`

## Import Failed — Job-Level Error

Microcopy:

- "Import stopped at row 884."
- "No partial rollback required. Completed rows were committed."
- actions: `[Download failure report] [Retry remaining rows]`

## Partial Success

Microcopy:

- "1,210 rows imported. 32 rows failed."
- actions: `[Fix and retry failed rows] [Export failed rows]`

## Complete Success

Microcopy:

- "Import complete. 1,242 rows processed successfully."
- "Audit reference IMP-49824."

## Expanded State Matrix

### State Matrix — Setup Through Validation

**State:** Import setup loading  
**Trigger:** import workspace route opens  
**UI response:** destination schema and field catalog loading placeholders  
**Primary microcopy:** "Preparing import workspace..."  
**Secondary microcopy:** "Loading destination fields..."  
**Recovery action:** automatic retry + manual refresh after timeout  
**Telemetry:** `import_setup_started`, `import_setup_ready_ms`

**State:** Awaiting file selection  
**Trigger:** no source selected for active session  
**UI response:** dropzone with template and format requirements  
**Primary microcopy:** "Upload your file to begin."  
**Secondary microcopy:** "Need a starting point? Download the template."  
**Recovery action:** template download, sample file guidance  
**Telemetry:** `import_file_waiting`

**State:** Parse success  
**Trigger:** parser reads structure and header successfully  
**UI response:** detected shape summary and next-action focus on mapping  
**Primary microcopy:** "1,242 rows and 18 columns detected."  
**Secondary microcopy:** "Delimiter and encoding look good."  
**Recovery action:** none required  
**Telemetry:** `import_parse_success`

**State:** Parse failure  
**Trigger:** unreadable file, missing header, unsupported sheet structure  
**UI response:** error callout with explicit corrective actions  
**Primary microcopy:** "We could not read this file."  
**Secondary microcopy:** "Use UTF-8 CSV or XLSX with a header row."  
**Recovery action:** `[Download template] [Choose another file]`  
**Telemetry:** `import_parse_failed`, `import_parse_failure_reason`

**State:** Required mapping incomplete  
**Trigger:** required destination fields unmapped  
**UI response:** blocker summary with direct mapping jumps  
**Primary microcopy:** "3 required fields are not mapped: Email, Company, Country."  
**Secondary microcopy:** "Complete required mappings to continue."  
**Recovery action:** `[Complete mappings]`  
**Telemetry:** `import_mapping_incomplete`

**State:** Row validation failures  
**Trigger:** row-level rule engine detects critical issues  
**UI response:** grouped issue panel + row table + severity filters  
**Primary microcopy:** "184 rows need fixes before import."  
**Secondary microcopy:** "Top issue: Email format invalid in 77 rows."  
**Recovery action:** failed-row export or in-tool correction path  
**Telemetry:** `import_validation_failed_rows`, `import_validation_error_types`

### State Matrix — Commit Through Reconciliation

**State:** Preview ready  
**Trigger:** critical validations pass and policy choices completed  
**UI response:** create/update/skip impact summary with commit gating  
**Primary microcopy:** "Ready to import: 930 create, 280 update, 32 skip."  
**Secondary microcopy:** "Review impact before committing changes."  
**Recovery action:** return to mapping or validation  
**Telemetry:** `import_preview_ready`

**State:** Import running  
**Trigger:** commit request accepted and job started  
**UI response:** progress timeline with processed counts and checkpoint id  
**Primary microcopy:** "Import in progress... 46% complete."  
**Secondary microcopy:** "Processed 572 of 1,242 rows."  
**Recovery action:** safe cancel when policy allows  
**Telemetry:** `import_job_started`, `import_job_progress`

**State:** Job paused transiently  
**Trigger:** dependent service unavailable or throttled  
**UI response:** paused badge + resume/cancel options + committed-so-far count  
**Primary microcopy:** "Import paused due to temporary service issue."  
**Secondary microcopy:** "No committed rows will be reprocessed on resume."  
**Recovery action:** `[Resume] [Cancel safely]`  
**Telemetry:** `import_job_paused_transient`

**State:** Partial success  
**Trigger:** some rows committed, some failed irrecoverably in current run  
**UI response:** result summary with failed-row retry route  
**Primary microcopy:** "1,210 rows imported. 32 rows failed."  
**Secondary microcopy:** "Fix and retry failed rows only."  
**Recovery action:** `[Fix and retry failed rows] [Export failed rows]`  
**Telemetry:** `import_job_partial_success`

**State:** Complete success  
**Trigger:** all intended rows resolved successfully  
**UI response:** success summary, audit reference, and next-step recommendations  
**Primary microcopy:** "Import complete. 1,242 rows processed successfully."  
**Secondary microcopy:** "Audit reference IMP-49824."  
**Recovery action:** view import history, optional quality review  
**Telemetry:** `import_job_success`, `import_audit_reference_created`

## State Microcopy Blocks

### Parse Block

- status-pending: "Checking file structure..."
- status-success: "Structure recognized."
- status-failure: "We could not read this file."
- action-template: "Download template"

### Mapping Block

- required-missing: "{n} required fields are not mapped."
- duplicate-source-warning: "One source column is mapped to multiple targets."
- helper-guidance: "Map source columns before continuing."
- action-resolve: "Complete mappings"

### Run And Result Block

- run-started: "Import started."
- run-paused: "Import paused due to temporary issue."
- run-partial: "{success} imported, {failed} failed."
- run-success: "Import complete."

## Import Decision Matrix

| Condition | Commit Enabled | User Warning Level | Recovery Path |
| --- | --- | --- | --- |
| Required mappings missing | No | Blocking | Complete mappings |
| Critical validation errors > 0 | No | Blocking | Fix rows then re-validate |
| Warnings only | Yes | Caution | Proceed or refine |
| Duplicate policy unset | No | Blocking | Choose duplicate policy |
| Security policy violation present | No | Blocking | Remove prohibited data |
| Preview totals unavailable | No | Blocking | Recompute preview |
| Job already running for same idempotency key | No | Blocking | Open running job |
| Partial success result available | Yes (retry failed only) | Caution | Failed-row retry flow |

Interpretation rules:

- never permit commit while critical unknowns exist
- keep warning severity explicit and text-labeled
- route duplicate job attempts to current job status, not new commit

## Reconciliation Playbooks

### Playbook 1 — Partial Success Re-import

1. Export failed rows with immutable failure codes.
2. User fixes issues in source tooling.
3. Re-import failed subset with preserved mapping preset.
4. Validate only failed subset unless schema changed.
5. Link retry job to original audit reference chain.

### Playbook 2 — Duplicate Policy Dispute

1. Pause before commit when update/overwrite risk is high.
2. Show examples of affected existing records.
3. Require role-confirmed policy choice where destructive.
4. Record selected policy in audit event metadata.
5. Surface policy in final success summary for traceability.

### Playbook 3 — Security Block Remediation

1. Identify blocked columns/rows by policy category.
2. Redact sensitive snippets while showing location hints.
3. Provide remediated template guidance.
4. Require clean re-parse before remapping.
5. Capture remediation cycle count for governance review.

## Operational And Compliance Metrics

Track to verify import health:

- `import_parse_success_rate`
- `import_mapping_blocker_rate`
- `import_validation_failure_distribution`
- `import_commit_start_to_complete_ms`
- `import_partial_success_rate`
- `import_failed_row_retry_success_rate`
- `import_policy_block_rate`
- `import_duplicate_prevented_count`

Suggested thresholds:

- parse success above 97% for template-compliant files
- failed-row retry success above 80% within two remediation cycles
- policy-block false-positive rate below agreed governance threshold
- commit completion p95 within service objective by row band

---

# Mobile Behavior

- 44x44 minimum touch targets for mapping selectors and action controls
- compressed mapping cards replace wide tables at small widths
- row issue details open in bottom sheets with clear next actions
- progress stage remains readable without horizontal scrolling for key counts
- long-running import state can be left and resumed from notification/status center
- offline transition warns user that job continues server-side when applicable

---

# Desktop Expansion

Added space is spent on:

- full mapping table with sample values and validation badges
- side-by-side issue breakdown and preview impact charts
- advanced duplicate policy explanation panel
- bulk editing for mapping rows and issue filters

Added space is not spent on visual clutter that obscures import status clarity.

---

# Accessibility Requirements

- mapping selectors are keyboard operable and announce source and target labels
- issue counts are text-based, not color-only badges
- row error table supports screen-reader column associations
- progress updates announced politely at meaningful increments
- import failure region announced assertively with focus transfer
- downloadable reports have descriptive names and file metadata
- reduced motion disables animated counters and timeline flourishes
- 200% zoom keeps commit and recovery actions visible and operable
- drag-and-drop upload has fully equivalent keyboard file selection flow
- mapping grid announces source-target relationships with clear headers
- severity filters expose text labels and counts for non-visual parsing
- progress checkpoints are announced at stable intervals, not noisy tick updates
- result actions are reachable in logical focus order after job completion

---

# Data Requirements

Define before build:

- canonical destination schema and required fields
- supported import formats, encodings, and delimiters
- max row and file limits by plan or role
- duplicate detection keys and conflict strategy
- validation rule catalog and severity model
- transaction boundaries (row-wise, batch-wise, all-or-nothing where needed)
- audit log model for who imported what and when
- import job retry semantics and idempotency keys
- secure storage and retention policy for source files
- PII handling and masking rules in error reports
- column-level data classification before persistence (public/internal/restricted)
- file scanning requirements (malware and policy checks) before parsing at scale
- immutable audit record linking actor, file hash, policy choices, and outcome
- import authorization model by role, destination object, and mutation scope
- retention/deletion workflows for source files and generated failure exports
- reconciliation link between import job ids and downstream created/updated records

---

# Performance Requirements

- parse first 100 rows quickly to provide near-instant structural feedback
- background processing for full validation on large files
- streaming parse to avoid memory spikes on large imports
- import job queue with observable progress checkpoints
- incremental UI updates throttled for responsiveness
- issue table virtualization for high-error-volume files
- chunked commit strategy with bounded transaction windows for large files
- checksum-based deduplication to skip accidental repeated uploads quickly
- parser worker isolation to keep UI thread responsive during heavy validation
- server-side pagination for issue lists above virtualization thresholds
- resume from checkpoint without revalidating already committed successful chunks

## Scalability Bands

Define import behavior by row volume bands:

- up to 5k rows: synchronous parse feedback with near-real-time issue list
- 5k to 50k rows: asynchronous deep validation with progressive checkpoints
- above 50k rows: enforced background job, checkpoint resume, and batched reconciliation

Each band must preserve:

- deterministic totals for create/update/skip
- reliable checkpoint persistence
- full audit continuity across retries

---

# Anti-Patterns

Never build:

- opaque "Import failed" without row-level reason
- hidden required field mappings revealed only at commit
- committing import with unresolved critical validation issues
- no preview of create/update/skip impact
- forcing full file re-upload for a handful of failed rows
- blocking users from downloading detailed failure reports
- duplicate handling defaults that overwrite records silently
- no audit reference after a major data mutation

---

# Pattern Output Example

```
Product
CRM contact ingestion

Input
CSV up to 50,000 rows

Flow
Upload -> Map -> Validate -> Preview -> Run -> Reconcile

Duplicate policy
Match on email + company domain, update selected fields only

Recovery
Retry only failed rows from exported error file

Security
PII masked in error exports, import audited with actor and timestamp

Outcome
48,902 imported, 1,098 failed with downloadable report

Review
Pass
```

---

# QA Checklist

- [ ] Import requirements and limits visible before file selection
- [ ] Structural parse errors include actionable correction
- [ ] Required mappings cannot be skipped
- [ ] Validation issues categorized by severity and scope
- [ ] Preview clearly states create/update/skip counts
- [ ] Duplicate handling decision required before commit
- [ ] Long-running import progress is transparent and recoverable
- [ ] Partial success supports failed-row retry path
- [ ] Error reports are downloadable and privacy-safe
- [ ] Keyboard and screen-reader usage covers mapping through result
- [ ] Mobile interaction remains usable with dense mapping data
- [ ] Audit reference and import history record are produced

## Outcome-Based QA Scenarios

### Outcome: Users predict import impact before commit

- [ ] Test users can explain create/update/skip outcomes before pressing commit
- [ ] Duplicate policy choice is understood and intentionally selected
- [ ] Preview totals match eventual import totals within accepted variance rules

### Outcome: Data integrity is preserved under failure

- [ ] Transient failures do not duplicate committed rows after resume
- [ ] Failed-row retry imports only unresolved rows
- [ ] Idempotency keys prevent duplicate job execution from repeated submits

### Outcome: Security and compliance are enforced

- [ ] Restricted columns are blocked or redacted according to policy
- [ ] Error exports mask sensitive values while keeping remediation context
- [ ] Audit trail is complete enough for post-incident traceability

### Outcome: Large imports remain operable

- [ ] High-row-count imports provide progress feedback without UI freeze
- [ ] Partial validation results appear early enough to guide user corrections
- [ ] Recovery from pause/interruption returns to accurate checkpoint

### Outcome: Accessible parity across interaction modes

- [ ] Keyboard-only users complete upload, mapping, preview, and commit flow
- [ ] Screen-reader users can identify issue counts and navigate row errors
- [ ] Zoomed mobile and desktop flows preserve all critical import/recovery actions

### Outcome: Governance and traceability confidence

- [ ] Every import run can be reconstructed from audit records and file hash
- [ ] Policy-related blocks and overrides are attributable to actor and time
- [ ] Reconciliation artifacts link cleanly to downstream record outcomes

## Scenario Acceptance Set

### Scenario 1 — Template-Compliant File, High Row Volume

- user receives early parse confidence before full validation completes
- progress checkpoints remain understandable through completion
- result summary totals match checkpointed processing counts

### Scenario 2 — Header Mismatch And Remediation

- parse failure identifies missing/incorrect headers clearly
- template guidance reduces re-upload attempts
- remediated file preserves selected destination object context

### Scenario 3 — Duplicate-Heavy Import

- duplicate policy impact is visible before commit
- update/skip behavior matches policy exactly in final results
- audit summary includes duplicate policy selected at run time

### Scenario 4 — Security Policy Violation

- blocked columns/rows are identified without exposing sensitive values
- remediated retry path is explicit and fast
- policy block and clearance events appear in audit trail

## Reference Microcopy Library

- setup-loading: "Preparing import workspace..."
- file-empty: "Upload your file to begin."
- parse-success: "Structure recognized."
- parse-failed: "We could not read this file."
- mapping-blocked: "{n} required fields are not mapped."
- preview-ready: "Review import impact before commit."
- run-progress: "Processed {done} of {total} rows."
- partial-success: "{success} rows imported, {failed} failed."
- complete-success: "Import complete."

## Implementation Handoff Criteria

- import mutation scope, duplicate policy options, and role permissions are explicit
- idempotency key lifecycle is documented and testable
- security policy checks run before high-cost commit operations
- reconciliation outputs are linked to immutable audit records

## Release Readiness Signals

- import retries do not generate duplicate writes in chaos-test runs
- policy block messaging drives successful remediation without support escalation
- large-volume jobs complete within agreed operational service targets

---

# Final Rule

Data import is complete only when users can predict impact before commit and recover failed rows without corrupting trusted records.
