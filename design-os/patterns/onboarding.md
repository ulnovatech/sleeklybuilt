# Onboarding Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** UX Intelligence, Forms System, Empty States System, Motion System, Navigation System, Mobile First

---

# Purpose

The Onboarding Pattern defines how a new account moves from signed up to actually using the product.

Onboarding is not a tour.

Onboarding is the work of producing one real outcome inside the account with the user's own data.

A user who has seen every screen and produced nothing has not been onboarded.

The pattern ends at the activation milestone, which is the first moment the product does something useful that the user can see.

---

# When To Use

Use this pattern when:

- the product cannot produce value until it is configured
- the first screen after signup would otherwise be empty
- value depends on data the user must supply, import, or connect
- a shared workspace needs a name, members, or roles before work can begin
- the first successful outcome is more than one action away

---

# When Not To Use

Do not use this pattern when:

- the product delivers value on the first screen with no setup, in which case adding steps makes the product worse
- the only requirement is creating an account — use the Authentication flow alone
- the information can be defaulted, inferred, or requested later at the moment it is actually needed
- the goal is teaching a new feature to existing users — that belongs inside the feature, not in a setup flow

The most common product mistake is collecting information during onboarding because a database column exists, rather than because the first outcome depends on it.

---

# User Goal

The user is answering three questions in order:

```
Can this product do something for me?

↓

What is the shortest path to proving it?

↓

Am I finished, and what did I get?
```

The first real result must be reachable in three required steps or fewer.

Everything beyond three steps is optional setup and must be deferrable.

---

# User Journey

```
Completes signup

↓

Reads the destination, not a form

↓

Supplies the minimum required input

↓

Product performs real work with that input

↓

Sees the first result in their own account

↓

Receives one clear next action

↓

Leaves and returns without repeating setup
```

The step products forget is the last one.

Onboarding must survive being abandoned halfway through, on a different device, days later.

---

# UX Flow

## Entry

The user arrives from one of four paths, and each needs different handling:

- self-serve signup, with no context and no data
- invitation to an existing workspace, where setup is already done and only a profile is needed
- import or migration, where the first task is connecting a source
- returning with setup incomplete, where the flow must resume rather than restart

An invited member must never be shown workspace creation steps.

---

## Orientation

One screen, before any input, that states what the user is about to get.

Required content:

- the outcome in the user's language
- how many steps it takes
- how long it takes
- what will be asked for

```
Let's get your first invoice out.

3 steps · about 2 minutes
We'll need your business name, one client, and your bank details.

[ Start ]   Skip for now
```

Orientation is not a feature list and never more than one screen.

---

## Required Setup

Only steps without which the product cannot produce its first result.

Rules:

- one decision per step
- every step shows position, for example "Step 2 of 3"
- every field explains why it is needed if the reason is not obvious
- back is always available and preserves what was entered
- nothing is required that can be edited later without consequence

If a step cannot be justified as blocking the first outcome, it belongs in optional setup.

---

## Progressive Setup

Remaining configuration is surfaced after activation, in context, at the moment it becomes relevant.

Delivery mechanisms, in order of preference:

- an inline prompt on the screen where the setting applies
- a persistent setup checklist the user can open and dismiss
- a single non-blocking banner, never more than one at a time

Progressive setup must be dismissible and must not reappear once dismissed unless the user asks for it.

---

## Activation

The moment the product produces a real result.

The activation screen must show:

- the actual artifact created, not a confirmation message about it
- what it means
- the single most valuable next action

```
Your first invoice is ready.

INV-0001 · $1,200 · Northwind Ltd

[ Send to client ]   Preview   Edit
```

Never end onboarding on a modal that says "You're all set" and then reveals an empty screen behind it.

---

## Empty-State Seeding

When a user finishes required setup but has no data, the destination screen must teach rather than sit blank.

Acceptable seeding:

- the user's own real record created during setup
- a clearly labeled example the user can inspect and delete in one action
- a guided creation flow that produces a real record

Unacceptable seeding:

- fabricated data presented as the user's own
- charts populated with invented numbers
- records that cannot be deleted

A labeled example must always carry its label in the interface, not only in a tooltip.

---

## Skip And Resume

Every step that is not required carries a visible skip.

Skipping records progress and never restarts the flow.

On return, the user lands on the first incomplete step with a summary of what is already done.

```
Welcome back. You're 2 of 3 steps in.

✓ Business details
✓ First client
○ Bank details

[ Continue ]   Go to dashboard
```

Setup progress is stored on the account, not in the browser, so switching devices does not lose it.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Step 2 of 3      Skip    │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░      │
├──────────────────────────┤
│ Add your first client    │
│ Invoices need someone    │
│ to go to.                │
├──────────────────────────┤
│ Client name              │
│ [                    ]   │
│                          │
│ Email                    │
│ [                    ]   │
│ Used to send invoices    │
├──────────────────────────┤
│                          │
├──────────────────────────┤
│ [      Continue      ]   │
│ Back                     │
└──────────────────────────┘
```

Mobile rules:

- one step per screen, never two steps stacked
- progress indicator pinned to the top and always visible
- primary action pinned to the bottom, above the keyboard, full width
- maximum four fields visible per step
- no horizontal step carousels

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Step 2 of 3                        Skip    │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░         │
├────────────────────────────────────────────┤
│                                            │
│   Add your first client                    │
│   Invoices need someone to go to.          │
│                                            │
│   Client name   [                      ]   │
│   Email         [                      ]   │
│                                            │
│   [ Continue ]      Back                   │
│                                            │
└────────────────────────────────────────────┘
```

The form stays in a single readable column at a maximum of 480px wide. Extra width becomes margin, not a second column.

---

## Desktop

```
┌───────────────────┬────────────────────────────────────┐
│ Get set up        │  Add your first client             │
│                   │  Invoices need someone to go to.   │
│ ✓ Business        │                                    │
│ ● Client          │  Client name  [                ]   │
│ ○ Bank details    │  Email        [                ]   │
│                   │  Used to send invoices             │
│ About 1 min left  │                                    │
│                   │  [ Continue ]     Back    Skip     │
│                   │                                    │
└───────────────────┴────────────────────────────────────┘
```

Desktop rules:

- the step list becomes a persistent sidebar so the user can see the whole shape of the work
- completed steps in the sidebar are clickable for review; future steps are not
- the form column keeps the same maximum width as tablet
- never expand to two form columns just because the space exists

---

# Component Hierarchy

```
OnboardingFlow
├── OnboardingHeader
│   ├── ProgressIndicator
│   ├── StepCounter
│   └── SkipAction
├── StepSidebar                 tablet and desktop
│   └── StepListItem ×n
│       ├── StatusIcon
│       └── StepLabel
├── OnboardingStep
│   ├── StepTitle
│   ├── StepDescription
│   ├── Form
│   │   ├── FieldGroup
│   │   │   ├── Label
│   │   │   ├── Input
│   │   │   ├── HelperText
│   │   │   └── FieldError
│   │   └── FormError
│   └── StepActions
│       ├── PrimaryAction
│       ├── BackAction
│       └── SkipAction
├── ActivationPanel
│   ├── ResultPreview
│   ├── ResultSummary
│   └── NextAction
└── SetupChecklist              post-activation, persistent
    ├── ChecklistItem ×n
    └── DismissAction
```

Reuse rules:

- steps use the product's standard form components, never onboarding-specific inputs
- `SetupChecklist` lives in the app shell so it survives navigation
- the progress indicator is one component shared by all flows that have ordered steps

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

## Advancing A Step

1. Validate on submit, not on every keystroke, so the user is not corrected while typing.
2. On failure, focus the first invalid field and describe the fix.
3. On success, disable the primary action and show progress on the button itself.
4. Persist the step server-side before advancing.
5. Advance with a 200ms horizontal slide, or an instant swap under reduced motion.
6. Move focus to the new step heading.

Never advance the view before the data is saved. A user who loses a step's input will not enter it twice.

## Skipping A Step

1. Skip records the step as deferred, not failed.
2. The deferred step appears in the post-activation checklist.
3. Skipping never triggers a confirmation dialog. Skip is a legitimate choice.
4. If skipping makes a later feature unavailable, say so once inline: "You can add bank details later, but invoices can't be paid online until you do."

## Resuming

1. On sign-in with setup incomplete, route to the resume screen, not the last step.
2. Show completed steps as a checked summary.
3. Continue opens the first incomplete required step.
4. Offer an explicit exit to the app so the user is never trapped in setup.

## Completing

1. Activation runs the real operation and shows real output.
2. The flow's chrome, progress bar and step list, is removed.
3. The user lands in the product, not on a dead-end confirmation screen.
4. The setup checklist appears collapsed if optional steps remain.

---

# States

Each step owns its own states. A failure in one step must never discard the whole flow.

## Loading — First Visit

The orientation screen renders from static content and needs no fetch.

If the flow depends on account data such as an invitation or a prior partial signup, show a skeleton matching the step layout:

```
Title bar          → 60% width bar
Description        → two 90% width bars
Field              → label bar + input frame ×2
Primary action     → full width button frame
```

Never show a full-page spinner before the first step. It reads as a broken signup.

---

## Loading — Step Submission

The primary action becomes the progress surface.

```
[  Saving…                 ]
```

Rules:

- the button is disabled and labeled with the operation, not "Loading"
- fields remain visible and readable, not blanked
- fields become read-only rather than disabled, so entered values keep full contrast
- if the operation exceeds 5 seconds, add a line beneath: "Still working. This can take a moment."

---

## Loading — Activation Work

Activation often performs real work such as an import, a sync, or a first render.

Show determinate progress when a count is known, indeterminate with a description when it is not:

```
┌──────────────────────────────┐
│ Importing your clients       │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░  84 of 120│
│                              │
│ You can leave this page.     │
│ We'll email you when it's    │
│ finished.                    │
└──────────────────────────────┘
```

Long activation work must not hold the user hostage in a tab.

---

## Empty — Nothing Set Up Yet

This is the state that decides whether the account survives.

Required content:

- what this screen will contain
- why it is empty
- the one action that fills it
- how long that takes

```
┌──────────────────────────────┐
│        [illustration]        │
│                              │
│  No invoices yet             │
│                              │
│  Create your first invoice   │
│  and it will appear here      │
│  with its payment status.     │
│                              │
│  [ Create invoice ]          │
│  See an example invoice      │
└──────────────────────────────┘
```

Never show a zeroed dashboard to a new account. Zeros read as a broken product rather than a new one.

---

## Empty — Seeded Example Present

When an example record is provided, it must be unmistakably labeled and removable.

```
┌──────────────────────────────┐
│ EXAMPLE  Northwind Ltd       │
│ INV-0000 · $1,200 · Draft    │
│ This is a sample so you can  │
│ see how invoices look.       │
│ [ Delete example ]           │
└──────────────────────────────┘
```

The label stays visible in every view that lists the record, including search results and exports.

---

## Error — Field Level

Validation errors sit beneath the field, in text, with the fix stated.

```
Email
[ maria@ ]
✕ Enter a full email address, like maria@northwind.com
```

Rules:

- never clear the field the user typed
- never rely on a red border alone
- state the requirement, not the violation: "Use at least 8 characters" rather than "Invalid"

---

## Error — Step Submission Failed

The step stays intact and offers a retry.

```
┌──────────────────────────────┐
│ ⚠  We couldn't save this step│
│    Your details are still    │
│    here. Check your          │
│    connection and try again. │
│    [ Try again ]             │
└──────────────────────────────┘
```

Entered values are preserved in every case. A network failure must never cost the user their typing.

---

## Error — Blocking Dependency

When setup cannot continue because an external requirement is unmet, say so and stop. Do not fake success.

```
┌──────────────────────────────┐
│ ⚠  Bank verification is      │
│    unavailable right now.    │
│                              │
│    You can finish setup and  │
│    add bank details later.   │
│                              │
│    [ Continue without it ]   │
│    [ Try again ]             │
└──────────────────────────────┘
```

Always offer a path forward that does not require the broken dependency, if one exists.

---

## Partial — Setup Incomplete

After activation with steps still deferred, progress is shown quietly and persistently.

```
┌──────────────────────────────┐
│ Finish setting up      2 of 4│
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░          │
│ Add bank details  →          │
│ Invite your team  →          │
│                       Dismiss│
└──────────────────────────────┘
```

Rules:

- the checklist is collapsible and dismissible
- dismissal is permanent until the user reopens it from settings
- it never blocks content and never floats over the primary action

---

## Success

Activation confirms with the artifact itself and one next action.

Success is not a badge or a confetti burst. It is evidence that the product works.

```
Your first invoice is ready.
INV-0001 · $1,200 · Northwind Ltd

[ Send to client ]   Preview
```

---

## Permission-Limited

An invited member cannot complete workspace-level setup.

Show only the steps they can complete, and name the owner for the rest.

```
Your workspace is already set up by Dana Okoro.
Just add your name and photo.
```

Never render a disabled step with a lock icon and no explanation.

---

# Mobile Behavior

- Touch targets minimum 44×44, with 8px minimum spacing between adjacent actions.
- Primary action pinned above the keyboard and never obscured by it.
- Correct keyboard per field: email keyboard for email, numeric for codes, with autocomplete and autofill attributes set.
- One-time codes accept paste and support platform autofill from SMS.
- No modal step containers. Onboarding steps are full screens so the back gesture behaves predictably.
- Skip is reachable with the thumb, in the header, not only at the bottom of a scrolled page.
- Uploads offer camera and file source, and continue if the user backgrounds the app.
- Reduce steps, never font size, to fit a small screen.

---

# Desktop Expansion

Added space is spent on:

- a persistent step list that shows the full shape of the work
- inline explanation of why each field is needed, adjacent rather than hidden
- side-by-side preview of the result being configured, such as the invoice taking shape as fields are filled
- keyboard flow, where Enter advances and Escape exits with progress saved

Added space is never spent on:

- more fields per step
- a second form column
- decorative illustrations that push the primary action below the fold
- a video that autoplays instead of letting the user start

---

# Accessibility Requirements

- The step heading is an `h1` on each step and receives focus when the step changes, so screen reader users hear the new context.
- Progress is announced as text, "Step 2 of 3", not conveyed by a bar alone.
- The progress bar exposes `role="progressbar"` with current, minimum, and maximum values.
- Tab order is heading, then fields in visual order, then primary action, then back, then skip.
- Each field has a persistent visible label. Placeholders never replace labels.
- Errors are associated with fields via `aria-describedby` and announced through a polite live region on submit; a submission failure announcement uses assertive politeness because the user is waiting on it.
- The error summary at the top of a failed step lists each problem as a link that moves focus to the field.
- Focus is trapped only inside genuine dialogs, never inside a step.
- Reduced motion replaces step transitions with instant swaps and removes progress-bar animation.
- At 200% zoom the flow remains single-column, with no clipped labels or overlapped actions.
- Step status in the sidebar is conveyed by icon and text, so completion survives greyscale.
- Time limits on verification codes are announced and extendable.

---

# Data Requirements

Before implementation, confirm for every step:

```
Whether it blocks the first outcome

Where its value is stored

Whether it can be edited later

Default value when skipped

Validation rule and its source of truth

Server-side persistence point

Behavior when the account already has the value

Which roles are permitted to complete it
```

Also define, for the flow as a whole:

```
The activation event and how it is recorded

Where partial progress is stored

How long partial progress survives

What happens to a seeded example on real data arrival

Invitation path versus self-serve path differences
```

A step whose necessity is not written down will be defended by whoever added it and never removed.

---

# Performance Requirements

- First step interactive within one second of signup completion.
- Each step's assets load with the step, not upfront for the whole flow.
- Step submission acknowledges within 300ms, even if the operation continues.
- Progress is written server-side before the next step renders.
- Long activation work runs asynchronously with progress polling, never a blocked request.
- Illustrations are compressed and lazily loaded below the primary action.
- Autofill and paste are never blocked by input masking.

---

# Anti-Patterns

Never build:

- a slideshow tour with no input and no result
- a modal carousel of feature screenshots shown before the product is seen
- required fields that exist only to enrich a marketing database
- more than three required steps before any value appears
- a progress bar that hides how many steps remain
- a flow with no skip, forcing users to enter fake data to escape
- setup progress stored only in local storage, lost on the next device
- an "All set!" screen that reveals an empty dashboard behind it
- fabricated sample data indistinguishable from the user's own
- workspace creation steps shown to an invited member
- tooltips that chain, each requiring dismissal, on the first visit
- a flow that restarts from step one after abandonment

---

# Pattern Output Example

```
Product

Freelance Invoicing Platform


Activation Milestone

First invoice created and sent


Required Steps

Business details · First client · Bank details


Optional Steps

Logo upload · Team invites · Tax defaults


Step Count

3 required, about 2 minutes


Skip Behavior

All optional steps skippable, tracked in persistent checklist


Resume Behavior

Server-stored progress, resume at first incomplete step


Empty-State Seeding

Labeled example invoice, deletable in one action


Mobile

Full-screen steps, pinned primary action, max 4 fields


Failure Handling

Bank verification outage offers continue-without path


Accessibility

Focus moves to step heading, progress announced as text


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The activation milestone is written down and reachable in ≤3 required steps
- [ ] Every required step is justified as blocking the first outcome
- [ ] Skip exists on every optional step and never asks for confirmation
- [ ] Progress persists server-side and survives a device change
- [ ] Resume lands on the first incomplete step, not step one
- [ ] Invited members never see workspace-creation steps
- [ ] Field values survive a failed submission
- [ ] Seeded example data is labeled everywhere it appears and is deletable
- [ ] The destination screen guides instead of showing zeros
- [ ] Long activation work releases the user and notifies on completion
- [ ] Focus moves to the step heading on each advance
- [ ] Progress is announced as text and exposed via progressbar role
- [ ] Errors are field-associated, announced, and state the fix
- [ ] Primary action stays above the keyboard on mobile
- [ ] Reduced motion removes step transitions
- [ ] 200% zoom keeps a single readable column

---

# Final Rule

Onboarding is finished when the product has done real work with the user's own data and the user can see it.

Every step must justify itself against one question:

Would removing this step prevent the first real outcome?

If the answer is no, move it out of the required path.
