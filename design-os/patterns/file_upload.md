# File Upload Pattern
**Version:** 1.0
**Status:** Pattern Layer
**Depends On:** Forms System, Error States System, Accessibility Intelligence, Content Intelligence, Mobile Intelligence, Feedback System
**Gated By:** Security Review

---

# Purpose

The File Upload Pattern defines the complete solution for collecting files from users with clear expectations, safe handling, and fast recovery when things go wrong.

File upload is trust-sensitive. Users are sharing personal, legal, financial, or operational assets. The product must prove three things immediately:

- the file is accepted intentionally
- the file is processed safely
- failure does not destroy progress

If users are afraid to upload, they abandon the workflow before the product can provide value.

A successful upload is not a spinner that finishes. It is a named file with a known status and a clear next action.

---

# When To Use

Use this pattern when:

- users must submit documents, images, spreadsheets, or media
- uploaded files are needed to complete a business workflow
- server-side validation or scanning is mandatory
- upload progress and status must be visible
- users may upload from mobile devices with unstable networks
- multiple files map to distinct requirements (for example ID and proof of address)

---

# When Not To Use

Do not use this pattern when:

- input is tiny and textual, and can be pasted directly
- the source is a known system connector where import runs server-to-server
- only a URL is required and no file transfer is needed
- the content is generated in-app and never leaves the product
- the user is performing structured data import with mapping — use Data Import

Do not force file upload when copy-paste or structured form entry would reduce friction.

---

# User Goal

The primary goal is always one of four:

```
Attach my files quickly

↓

Know they are accepted and safe

↓

Fix issues without restarting

↓

Continue to the next task confidently
```

If the user cannot name which files succeeded and which need attention, the upload UI failed.

---

# User Journey

```
Arrives at upload step

↓

Sees allowed file types, size, and limits

↓

Selects or drops files

↓

Sees per-file progress and validation

↓

Fixes any rejected files

↓

Confirms upload set

↓

Continues to submission or processing step
```

The journey ends when the user continues with confidence, not when the last byte leaves the device.

---

# UX Flow

## Entry

The user arrives from onboarding, verification, claim, application, profile, or import setup.

The first viewport states:

- what to upload
- why it is required
- accepted format and size
- upload count limits
- whether previous files from this session remain

Never reveal rules only after a rejection. Rules shown after failure feel like punishment.

## Select

Users can:

- browse file picker
- drag and drop
- take camera photo on mobile (when relevant)

Selection supports multiple files when the business workflow benefits from batching.

When a requirement maps to a specific slot (for example "Front of ID"), the picker is scoped to that slot so replacement cannot attach to the wrong requirement.

## Validate

Validation occurs in this order:

1. client-side checks: type, extension, size, count, optional dimensions
2. upload acceptance: transfer success
3. server checks: virus scan, schema check, policy check
4. business checks: duplicate, quota, permission

Client checks prevent waste. Server checks are authoritative. Never treat a client pass as final acceptance.

## Confirm

Users see file state and next action:

- all valid → continue
- partial failures → fix or replace failed files
- blocked upload → clear recovery route and support reference

Continue remains disabled until every required slot has an accepted file. Optional failures never block required success.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Upload documents         │
│ 2 of 4 required          │
├──────────────────────────┤
│ What to upload           │
│ ID + Proof of address    │
│ PDF/JPG/PNG · up to 10MB │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │  Tap to choose file  │ │
│ │  or take a photo     │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ passport.pdf      100% ✓ │
│ bill.jpg           74%    │
│ [███████░░░]             │
├──────────────────────────┤
│ File issues               │
│ tax.zip Unsupported type  │
│ [Replace] [Remove]        │
├──────────────────────────┤
│ [ Continue ]              │
└──────────────────────────┘
```

Mobile rules:

- One primary continue action, sticky and reachable above the home indicator.
- Per-file rows stack vertically; never require horizontal scroll to read status.
- Camera capture appears only when the requirement accepts images.
- Failed rows expand to show reason and actions without leaving the list.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Upload documents                           │
├─────────────────────────┬──────────────────┤
│ Upload area             │ Rules and tips   │
│ Drop or choose files    │ Type, size, count│
├─────────────────────────┴──────────────────┤
│ File list with progress and actions        │
│ Continue action pinned at bottom           │
└────────────────────────────────────────────┘
```

---

## Desktop

```
┌──────┬─────────────────────────────────────────────────┐
│ Nav  │ Upload documents                                │
│      ├──────────────────────────────┬──────────────────┤
│      │ Drag-and-drop zone           │ Requirements     │
│      │ Browse files                 │ Security notes   │
│      ├──────────────────────────────┴──────────────────┤
│      │ Upload table: name type size progress status    │
│      │ Failed row actions: Replace / Retry / Remove    │
│      ├──────────────────────────────────────────────────┤
│      │ Back                         Continue            │
└──────┴──────────────────────────────────────────────────┘
```

Desktop rules:

- Extra space buys a requirements checklist and a status-sortable queue, not decorative upload animations.
- Drag-and-drop is an accelerator; browse remains equally valid and always visible.
- Row actions stay on the row. Never hide Replace behind a hover-only menu.

---

# Component Hierarchy

```
FileUploadPage
├── PageHeader
├── UploadInstructionsCard
│   ├── RequirementList
│   ├── AcceptedTypes
│   ├── SizeAndCountLimits
│   └── PrivacyNotice
├── UploadDropzone
│   ├── BrowseTrigger
│   ├── DragStateOverlay
│   └── MobileCameraTrigger optional
├── FileQueueList
│   └── FileQueueRow ×n
│       ├── FileName
│       ├── FileMeta
│       ├── ProgressBar
│       ├── StatusBadge
│       └── RowActions
├── UploadErrorSummary optional
├── VirusScanStatusRegion optional
├── ContinueAction
└── SupportRoute
```

Reuse rules:

- `FileQueueRow` is one component with status variants. Never invent a separate card per status.
- Progress, status text, and actions share one row so screen readers can associate them.
- The requirements checklist and the queue share the same requirement identifiers so Replace maps correctly.

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

The user knows each file's status and what to do next
```

## Selecting Files

1. Browse or drop immediately adds rows in a queued state with filenames visible.
2. Client validation runs before any network request.
3. Valid files enter upload; invalid files stay in the list with a failure reason and Replace.
4. The dropzone returns to idle; it never clears the queue.

Optimistic removal of rejected files is prohibited. Users need to see what was refused and why.

## Client Validation Failure

```
┌──────────────────────────────────────────┐
│ ⚠ tax.zip cannot be uploaded             │
│                                          │
│   ZIP archives are not accepted. Use     │
│   PDF, JPG, or PNG up to 10MB.           │
│                                          │
│   [ Replace file ]  [ Remove ]           │
└──────────────────────────────────────────┘
```

Rules:

- Name the file. Generic "Upload failed" is never enough.
- State the rule that was broken and the allowed alternative.
- Keep valid siblings uploading.
- Move focus to the failed row when the failure was caused by a keyboard-driven selection.

## Upload In Progress

1. Each row shows percentage and a determinate progress bar once bytes are known.
2. Indeterminate progress is allowed only while the size cannot be determined, and must switch as soon as it can.
3. Cancel is per-file. Cancelling one file never aborts others.
4. After transfer completes, the row moves to "Running security checks…" until the server accepts.

Never show 100% while the scan is still pending. That teaches users to leave before acceptance.

## Network Interruption Mid-Upload

This is the defining failure of mobile upload and must be designed, not discovered.

```
┌──────────────────────────────────────────┐
│ Upload paused · Connection lost          │
│                                          │
│   passport.pdf stopped at 62%.           │
│   bill.jpg is already accepted.          │
│                                          │
│   [ Resume upload ]                      │
│   [ Use a smaller file ]                 │
└──────────────────────────────────────────┘
```

Rules:

- Preserve accepted files. Never force a full restart.
- Resume from the last confirmed chunk when resumable upload is available.
- If resume is impossible, say so and offer Replace without clearing the rest of the queue.
- Announce the pause assertively; the user may have backgrounded the app.

## Security Rejection

```
┌──────────────────────────────────────────┐
│ ⚠ report.exe was blocked                 │
│                                          │
│   This file type is not allowed for      │
│   security reasons. It was not stored.   │
│                                          │
│   [ Upload a different file ]            │
│   [ Contact support ]                    │
│   Reference: UPL-4419                    │
└──────────────────────────────────────────┘
```

Never expose scanner internals or signature names. State that the file was not stored. Provide a support reference for false positives.

## Replacing A Failed File

1. Replace opens the picker scoped to that requirement slot.
2. The failed file remains visible until the replacement is accepted.
3. On acceptance, the replacement inherits the slot and requirement label.
4. Audit records both the removal of the failed file and the acceptance of the replacement.

## Removing A Required File

1. If the file is optional, remove immediately with an undo toast for a short window.
2. If the file is the only accepted file for a required slot, confirm:

```
┌──────────────────────────────────────────┐
│ Remove passport.pdf?                     │
│                                          │
│   This is your only accepted ID document.│
│   You will need to upload another before │
│   you can continue.                      │
│                                          │
│   [ Keep file ]  [ Remove ]              │
└──────────────────────────────────────────┘
```

## Continuing

1. Continue enables only when every required slot is accepted.
2. On press, Continue becomes "Continuing…" and cannot be pressed twice.
3. If a background scan flips a file to rejected between enable and press, block navigation, announce the change, and focus the failed row.

---

# States

Every file owns its own states. One failing file must not blank the queue or cancel siblings.

## Loading — First Visit

```
Instructions card → renders immediately from workflow config
Dropzone          → interactive immediately
File queue         → empty or skeleton rows if restoring
Continue          → disabled with reason available
```

No full-page spinner. The user can read rules while any session restore completes.

---

## Loading — Restoring Session

```
┌──────────────────────────────────────────┐
│ Restoring your previous files…           │
│                                          │
│   passport.pdf  accepted                 │
│   bill.jpg      checking status…         │
└──────────────────────────────────────────┘
```

Microcopy:

- "Checking upload rules…"
- "Restoring your previous files…"

If restore fails, keep the empty queue and say what was lost: "We could not restore 1 previous file. Choose it again."

---

## Idle — Empty Queue

```
┌──────────────────────────────────────────┐
│ Drop files here or choose from device    │
│                                          │
│ Accepted: PDF, JPG, PNG · Max 10MB each  │
│ Up to 10 files · 2 required              │
└──────────────────────────────────────────┘
```

Microcopy:

- "Drop files here or choose from your device."
- "Accepted: PDF, JPG, PNG. Max 10MB each."

---

## Drag Hover — Accepted Types

Microcopy:

- "Release to upload 3 files."

The overlay confirms count. If some files in the drag set are invalid, prefer Drag Reject for the set or accept valid files and reject invalid ones into the queue with reasons.

---

## Drag Reject — Disallowed Types

```
┌──────────────────────────────────────────┐
│ These files cannot be uploaded here      │
│                                          │
│ Drop PDF, JPG, or PNG files only.        │
└──────────────────────────────────────────┘
```

---

## Queued

Microcopy:

- "passport.pdf waiting to upload…"

Queued files show position when the product limits concurrent transfers.

---

## Uploading

```
bill.jpg
Uploading… 74%
[████████░░] 7.4MB of 10MB
[ Cancel ]
```

Microcopy:

- "passport.pdf uploading… 62%"

---

## Awaiting Scan

Microcopy:

- "Upload complete. Running security checks…"

Progress must not read as finished. Status text is mandatory; a spinner alone is not.

---

## Success — File Accepted

Microcopy:

- "passport.pdf accepted."
- "2 of 2 required files complete."

---

## Validation Error — Type

Microcopy:

- "tax.zip is not supported. Use PDF, JPG, or PNG."
- Action: `[Replace file]`

---

## Validation Error — Size

```
┌──────────────────────────────────────────┐
│ statement.pdf is 14MB                    │
│                                          │
│ Maximum allowed is 10MB.                 │
│                                          │
│ [ Compress guide ]  [ Replace file ]     │
└──────────────────────────────────────────┘
```

---

## Validation Error — Count Limit

Microcopy:

- "You can upload up to 10 files."
- "Remove 2 files to continue."

---

## Validation Error — Dimensions Or Duration

For image or media constraints that are product-defined:

Microcopy:

- "photo.jpg is 400×300. Minimum is 800×600."
- "clip.mp4 is 4:12. Maximum length is 2:00."

---

## Upload Error — Network Interrupted

Microcopy:

- "Upload paused. Connection lost."
- Actions: `[Resume upload] [Use smaller file]`

---

## Upload Error — Timeout

Microcopy:

- "photo.jpg took too long to upload."
- Actions: `[Retry] [Replace]`

---

## Upload Error — Server Unavailable

```
┌──────────────────────────────────────────┐
│ We could not reach the upload service    │
│                                          │
│   Your files were not stored. Accepted   │
│   files from earlier remain available.   │
│                                          │
│   [ Retry failed uploads ]               │
│   Reference: UPL-4502                    │
└──────────────────────────────────────────┘
```

---

## Security Rejection

Microcopy:

- "report.exe was blocked by security policy."
- "For your safety, this file cannot be uploaded."
- Actions: `[Upload different file] [Contact support]`

---

## Scan Failed Temporarily

Microcopy:

- "We could not complete the file scan right now."
- Actions: `[Retry scan] [Save and continue later]`

Distinct from security rejection. Temporary scan failure must not be worded as a malware finding.

---

## Duplicate Detected

```
┌──────────────────────────────────────────┐
│ passport.pdf looks identical to a file   │
│ you already uploaded in this claim.      │
│                                          │
│ [ Keep both ]  [ Use existing ]          │
└──────────────────────────────────────────┘
```

---

## Quota Exceeded

Microcopy:

- "You have reached the 100MB upload limit for this account."
- Actions: `[Remove older files] [Contact support]`

---

## Permission-Limited

Microcopy:

- "Your role can view uploads but cannot add new files."
- Never show an enabled dropzone that fails only after selection.

---

## Partial Success

```
┌──────────────────────────────────────────┐
│ 3 files accepted. 1 file needs attention │
│                                          │
│   bill.jpg — accepted                    │
│   id-front.jpg — accepted                │
│   id-back.jpg — accepted                 │
│   notes.zip — unsupported type           │
│                                          │
│   [ Replace notes.zip ]                  │
└──────────────────────────────────────────┘
```

Continue stays disabled until required files pass. Optional failures are visible but do not block.

---

## Complete Success

Microcopy:

- "All required files are ready."
- Action: `[Continue]`

---

## Offline

Microcopy:

- "You are offline. Choose files now; uploads start when you reconnect."
- Or, if selection itself requires network policy fetch: "Reconnect to upload. Your draft requirement list is still here."

---

# Mobile Behavior

- Touch targets minimum 44×44 for pickers, row actions, retry, and continue, with 8px separation between Replace and Remove.
- No hover dependency; drag affordance always has a tap alternative.
- Camera capture shown only for image-allowed requirements.
- Upload progress rows remain readable at 320px width; truncate the middle of long filenames, never the extension or status.
- Sticky bottom action keeps Continue reachable above the system gesture area.
- Backgrounding the app preserves the upload queue where the platform permits resumable transfer.
- On-screen keyboard must not cover the active error row when Replace is offered after a picker return.
- Pull-to-refresh is disabled on the upload queue while transfers are active; refreshing mid-upload reads as data loss.

---

# Desktop Expansion

Added space is spent on:

- a richer queue table with sort by status and size
- a side panel with requirement checklist and security guidance
- keyboard shortcuts for remove and retry on selected rows
- a drag-drop area large enough for confident batch selection

Added space is not spent on:

- decorative upload animations that delay feedback
- per-file preview carousels that push status below the fold
- hover-only row actions

---

# Accessibility Requirements

- All interactive controls are keyboard reachable with a visible focus ring that meets 3:1 against adjacent colours.
- Browse trigger accessible name: "Choose files to upload". When scoped to a slot: "Choose file for proof of address".
- Dropzone is a labelled region; drag instructions are available as text, not only as hover visuals.
- Status updates announce through a polite live region per meaningful change: queued → uploading → scanning → accepted or failed.
- Security rejections and uncertain scan failures announce assertively; focus moves to the failed row or error summary.
- Error summary lists failed filenames as links that move focus to the corresponding row.
- Icons never carry meaning alone; every status includes a text label ("Accepted", "Uploading", "Blocked").
- Progress bars expose `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and an accessible name that includes the filename.
- Cancel, Replace, Retry, and Remove have distinct accessible names including the filename: "Replace passport.pdf".
- Filename truncation still exposes the full name to assistive technology via accessible name or title pattern documented in the component.
- Reduced motion disables animated gradients, pulsing progress, and sliding row entrances; percentage text still updates.
- Zoom at 200% preserves readable row actions without horizontal clipping of status text or primary actions.
- Colour is never the sole status signal; greyscale must still distinguish accepted, uploading, and failed.
- Touch and pointer hit areas meet 44×44 even when the visible icon is smaller.
- Camera capture control is announced as optional and only present when the requirement allows images.

---

# Data Requirements

Before implementation, confirm:

```
Accepted MIME types and extension allow-list, including mismatch policy
(when MIME and extension disagree)


Max file size per type and absolute request body cap


File count limits per workflow, per user, and per time window


Required vs optional slots and their identifiers


Storage destination, encryption at rest, and retention duration


Malware or content-scan provider, timeout, and failure behaviour
(fail closed vs retryable)


Metadata captured: hash, checksum, uploader id, timestamp, source device class


Legal and privacy classification; whether files may leave the region


Resumable upload protocol, chunk size threshold, and token expiry


Duplicate detection keys (hash, name+size, or business document id)


Quota model and what the user can delete to free space


Audit events for add, replace, remove, scan result, and continue


Who may upload, who may download, who may delete


Support reference format for blocked or failed uploads
```

Mismatch policy must be written before build. Accepting a file whose extension lies about its contents is a security incident waiting for a support thread.

Scan timeout behaviour must exist before launch. An upload that hangs forever at "scanning" trains users to abandon and re-upload duplicates.

---

# Performance Requirements

- First interactive upload UI under 1s on a warm path.
- Client validation under 50ms per file for typical office-document sizes; heavy image dimension checks may defer to a short "Checking file…" state.
- Upload progress updates are throttled for UI smoothness, not redrawn per byte.
- Resumable uploads use chunking for files above the defined threshold.
- Retries use exponential backoff with a visible attempt count and a hard ceiling.
- File list rendering is virtualised when batch uploads exceed a defined row count.
- Thumbnails, when shown, are generated off the main thread and never block the status row.
- Superseded uploads after Replace cancel in-flight requests for the replaced file only.

---

# Anti-Patterns

Never build:

- hidden file rules only shown after failure
- one global spinner for multiple file uploads
- silently dropped failed files
- forcing restart of all uploads because one file failed scan
- delete-without-undo for accidental removal of an optional file during upload
- toast-only errors for blocked required files
- ambiguous "Upload failed" with no file name and no action
- progress bars without percentage or completion state
- showing 100% while server scan is still pending
- hover-only row actions on desktop
- enabled dropzone for users without upload permission
- wording temporary scan failure as a malware finding
- clearing accepted files when the network drops
- exposing raw scanner signatures or internal error codes to end users

---

# Pattern Output Example

```
Product
Insurance claim intake

Goal
Collect evidence documents from mobile users

Upload policy
PDF/JPG/PNG, 10MB each, 12 files max

Security
Malware scan + policy filter before acceptance

Recovery
Per-file retry and resumable uploads after reconnect

Mobile
Camera capture shortcut, sticky continue, 44×44 actions

Success state
"All 4 required documents accepted"

Review
Pass
```

---

# QA Checklist

Before approval:

- [ ] Upload purpose, rules, and limits are visible before selection
- [ ] Required vs optional slots are labelled and gated correctly
- [ ] Per-file progress and status remain visible throughout transfer and scan
- [ ] Failed files show a named reason and a direct recovery action
- [ ] Partial success preserves accepted files and does not restart the queue
- [ ] Network interruption offers resume or replace without wiping siblings
- [ ] Security rejections state that the file was not stored and provide a support reference
- [ ] Temporary scan failure is distinguishable from a security block
- [ ] Continue stays disabled until required slots are accepted, and re-validates on press
- [ ] Keyboard and screen-reader paths cover select, status, failure, replace, and continue
- [ ] Mobile actions meet 44×44 and remain reachable with the keyboard open
- [ ] Reduced motion and 200% zoom paths preserve status legibility
- [ ] Audit trail records add, replace, remove, scan outcome, and continue
- [ ] Anti-Patterns list items are absent from the implemented UI

---

# Final Rule

File upload is complete only when users can submit confidently, recover quickly, and continue safely without losing valid progress.

Every element must justify itself against one question:

If this element were removed, would a user be more likely to abandon or re-upload blindly?

If the answer is no, remove it.
