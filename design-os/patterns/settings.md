# Settings Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Forms System, Navigation System, Dialogs Component, Feedback System, UX Intelligence, Accessibility Intelligence  
**Gated By:** Security Review

---

# Purpose

The Settings Pattern defines how a product exposes its own configuration without making the user responsible for understanding it.

Settings is not a dumping ground for options nobody wanted to make a decision about.

Settings is where a user changes something specific, verifies it changed, and leaves.

Every setting is a decision the product declined to make. Each one costs the user attention, so each one must earn its place by serving a real difference in how real people work.

If a user cannot find the option they came for in under fifteen seconds, the information architecture has failed regardless of how complete the settings are.

---

# When To Use

Use this pattern when:

- users need to change behaviour that persists across sessions
- different users genuinely need different defaults
- account, security, billing, or notification preferences must be managed
- a workspace has shared configuration governed by roles
- integrations, data export, or deletion must be user-initiated

---

# When Not To Use

Do not use this pattern when:

- the option affects only the current view — put it in the view as a control, not in settings
- a sensible default serves nearly everyone — choose the default and remove the option
- the setting exists to avoid a product decision, which produces a preference nobody will find
- the configuration belongs to one feature and is only used there — keep it in that feature

The most common product mistake is a settings page that grows one option per unresolved argument, until it is a museum of past disagreements.

---

# User Goal

The user arrives with a specific intention and three questions:

```
Where is the thing I want to change?

↓

What will happen if I change it?

↓

Did it save?
```

The user does not want to explore settings. They want to leave settings.

Success is measured in time-to-exit, not time-on-page.

---

# User Journey

```
Notices something they want different

↓

Opens settings from a predictable place

↓

Finds the right section by name, or searches

↓

Reads the setting and its consequence

↓

Changes it

↓

Receives unmistakable confirmation

↓

Returns to work and observes the effect
```

The last step is the only real proof. A setting that saves but does not visibly change behaviour will be changed again by the same user next week.

---

# UX Flow

## Entry

Settings is reached from one predictable place: the account or workspace menu in the app shell.

Deep entry must also work:

- a contextual link from the feature the setting governs, opening the exact setting highlighted
- a direct URL per section, so support can send someone straight to it
- search within settings, matching setting names, descriptions, and common synonyms

A setting that can only be reached by browsing eight sections is effectively hidden.

---

## Scope Separation

Two scopes must never be mixed on one screen:

```
Account scope
Belongs to the person, follows them everywhere

↓

Workspace scope
Belongs to the organisation, affects everyone
```

Account settings include profile, language, personal notification delivery, connected devices, and personal security.

Workspace settings include members, roles, billing, retention, branding, and integrations.

The current scope must be stated at the top of every settings screen, and switching scope must be an explicit act.

```
Workspace · Adaobi Studio
```

A user editing a workspace-wide notification default while believing it is personal will disable alerts for their entire team. This is a common and expensive confusion, and clear scope labelling is the only reliable prevention.

---

## Information Architecture

Group by the user's mental model, not the codebase.

Recommended top-level grouping:

```
Account
  Profile · Language and region · Security · Devices · Notifications

Workspace
  General · Members and roles · Billing · Integrations · Data · Advanced
```

Rules:

- maximum eight top-level sections, because a longer list becomes a search problem
- maximum twelve settings per section, otherwise split it
- name sections by what the user wants to change, not by system domain: "Notifications" not "Messaging preferences service"
- one setting appears in exactly one place; duplicating a setting guarantees the two copies will disagree
- destructive and irreversible operations live in a clearly separated region at the bottom of their section

---

## Save Model

The save model must be chosen deliberately, stated in the interface, and applied consistently. Mixing models silently is the primary cause of lost settings changes.

This pattern specifies a hybrid model, with a rule that determines which applies:

```
Immediate autosave
For single-control, independently valid, instantly reversible settings

↓

Explicit save
For multi-field groups, interdependent values, and anything with consequence
```

### Immediate autosave applies when

- the setting is one control: a toggle, a radio group, or a select
- the value is valid by construction, so there is nothing to validate
- the effect is instantly visible or trivially reversible
- reverting costs exactly one interaction

Examples: dark mode, email digest frequency, default view, sound on or off.

Autosave here is correct because an explicit save button for a single toggle adds a step, and users routinely flip a toggle and leave without pressing save, losing the change they intended.

### Explicit save applies when

- multiple fields form one coherent change, such as a billing address
- values validate against each other, such as a start date and an end date
- free text is involved, because a partially typed value must never be committed
- the change affects other people
- the change is expensive or slow to reverse
- the change is destructive or irreversible

Explicit save here is correct because a half-typed workspace name should never become the workspace name, and a partially entered address should never be submitted to a payment processor.

### Requirements for autosaved settings

- confirmation appears within 500ms, adjacent to the control
- failure reverts the control to its true value and states why
- the control is briefly non-interactive during the save, so rapid toggling cannot desynchronise it

```
Dark mode                          [ ON ]  ✓ Saved
```

### Requirements for explicit-save groups

- the save action is disabled until something changes
- the action states the change count when more than one field changed: "Save 3 changes"
- a summary of unsaved changes is available before saving
- navigating away with unsaved changes prompts once
- cancel reverts every field in the group and asks for confirmation only if more than one field changed

```
┌──────────────────────────────┐
│ You have unsaved changes     │
│                              │
│ Workspace name, time zone,   │
│ and default currency.        │
│                              │
│ [ Save changes ]             │
│ [ Discard ]  [ Keep editing ]│
└──────────────────────────────┘
```

---

## Destructive Actions

Destructive actions are separated visually and procedurally from everything else.

```
Reversible change
Immediate, undo offered

↓

Consequential change
Explicit save, consequence stated

↓

Destructive change
Typed confirmation, consequence enumerated

↓
```

Requirements for any destructive action:

- placed in a visually distinct region, at the end of its section, never adjacent to a routine save
- the consequence is enumerated with real counts before confirmation
- confirmation requires typing the exact name of the thing being destroyed, not clicking "Yes"
- the confirming control is labeled with the action, never "OK"
- irreversibility is stated plainly, and if a grace period exists its exact length is stated
- the operation is logged with actor and timestamp

```
┌──────────────────────────────────────┐
│ Delete workspace                     │
│                                      │
│ This permanently removes:            │
│ · 148 invoices                       │
│ · 32 clients                         │
│ · 4 members lose access              │
│                                      │
│ Data is deleted after 30 days and    │
│ cannot be recovered after that.      │
│                                      │
│ Type ADAOBI STUDIO to confirm        │
│ [                                  ] │
│                                      │
│ [ Delete workspace ]     Cancel      │
└──────────────────────────────────────┘
```

A single-click "Are you sure?" is not protection. It is a habit users learn to click through.

---

## Defaults

Every setting ships with a default, and the default is a design decision.

Rules:

- the default is what serves most users well, not the safest-looking option
- the default is visible in the interface, so a user can tell they have diverged: "Default: Every morning"
- each setting group offers "Reset to defaults", scoped to that group
- a workspace default may be set once and inherited, with clear indication when a personal value overrides it
- changing a workspace default does not overwrite personal overrides, and the interface says so

```
Digest frequency        Every morning
Workspace default: Every morning · you haven't changed this
```

```
Digest frequency        Weekly
Workspace default: Every morning · overridden by you  [ Reset ]
```

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ‹  Settings              │
├──────────────────────────┤
│ 🔍 Search settings       │
├──────────────────────────┤
│ ACCOUNT                  │
│ Profile               ›  │
│ Language and region   ›  │
│ Security              ›  │
│ Notifications         ›  │
├──────────────────────────┤
│ WORKSPACE                │
│ Adaobi Studio            │
│ General               ›  │
│ Members · 4           ›  │
│ Billing · Pro         ›  │
│ Integrations · 2      ›  │
│ Data                  ›  │
└──────────────────────────┘
```

Section detail:

```
┌──────────────────────────┐
│ ‹  Notifications         │
│    Account · you only    │
├──────────────────────────┤
│ EMAIL                    │
│ Daily digest      [ ON ] │
│ Sent at 08:00 your time  │
│                          │
│ Mentions          [ ON ] │
│                          │
│ Marketing        [ OFF ] │
├──────────────────────────┤
│ PUSH                     │
│ Mentions          [ ON ] │
│                          │
│ All activity     [ OFF ] │
│ Default: off             │
├──────────────────────────┤
│ Quiet hours              │
│ 22:00 – 07:00         ›  │
├──────────────────────────┤
│ [ Reset to defaults ]    │
└──────────────────────────┘
```

Mobile rules:

- settings is a two-level list: sections, then a section's controls; never a three-level drill for common settings
- the section header states the scope, so the user always knows who a change affects
- toggles sit right-aligned with the label left-aligned, and the whole row is a 44×44 minimum target
- each setting's explanation sits beneath its label, not behind an information icon
- autosaved controls confirm inline, adjacent to the control
- explicit-save groups pin their save action to the bottom of the screen, showing the change count
- destructive actions sit in their own region at the end, after a visible divider and a heading

---

## Tablet

```
┌────────────────────────────────────────────┐
│ ‹ Settings · Account                       │
├──────────────────┬─────────────────────────┤
│ ACCOUNT          │ Notifications           │
│ Profile          │ Account · you only      │
│ Language         │                         │
│ Security         │ EMAIL                   │
│ ▸ Notifications  │ Daily digest    [ ON ]  │
│                  │ Sent at 08:00           │
│ WORKSPACE        │                         │
│ General          │ Mentions        [ ON ]  │
│ Members          │                         │
│ Billing          │ Marketing      [ OFF ]  │
│ Integrations     │                         │
│ Data             │ PUSH                    │
│                  │ Mentions        [ ON ]  │
└──────────────────┴─────────────────────────┘
```

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Settings                              🔍 Search settings     │
├───────────────────┬──────────────────────────────────────────┤
│ ACCOUNT           │ Notifications                            │
│ Profile           │ Account scope · affects only you         │
│ Language & region │                                          │
│ Security          │ EMAIL                                    │
│ ▸ Notifications   │ Daily digest              [ ON ]  ✓Saved │
│ Devices           │ A summary of activity, sent 08:00 your   │
│                   │ time. Default: on                        │
│ WORKSPACE         │                                          │
│ Adaobi Studio     │ Mentions                  [ ON ]         │
│ General           │ When someone names you in a comment.     │
│ Members & roles   │                                          │
│ Billing           │ Marketing                [ OFF ]         │
│ Integrations      │ Product news, at most monthly.           │
│ Data & retention  │                                          │
│ Advanced          │ QUIET HOURS                              │
│                   │ From [ 22:00 ]  To [ 07:00 ]             │
│                   │ Push is held until quiet hours end.      │
│                   │ [ Save 1 change ]   Cancel               │
│                   │                                          │
│                   │ ──────────────────────────────────────── │
│                   │ [ Reset notifications to defaults ]      │
└───────────────────┴──────────────────────────────────────────┘
```

Desktop rules:

- a persistent left rail with account and workspace visibly separated by heading and label
- the content column is capped at a readable width; extra space becomes margin, never a second column of settings
- each setting's explanation sits beside or beneath the control, permanently visible
- the save action for an explicit-save group sits at the end of that group, not floating in the page header
- extra width buys explanation and current-value visibility, not more settings per row

---

# Component Hierarchy

```
SettingsPage
├── SettingsHeader
│   ├── Title
│   ├── ScopeIndicator
│   └── SettingsSearch
├── SettingsNav
│   ├── NavGroup ×2                 Account · Workspace
│   │   ├── GroupHeading
│   │   ├── ScopeLabel
│   │   └── NavItem ×n
│   │       ├── ItemLabel
│   │       └── ItemSummary         current value or count
│   └── ScopeSwitcher
├── SettingsSection
│   ├── SectionHeader
│   │   ├── SectionTitle
│   │   ├── ScopeNotice
│   │   └── PermissionNotice        conditional
│   ├── SettingGroup ×n
│   │   ├── GroupHeading
│   │   ├── SettingRow ×n
│   │   │   ├── SettingLabel
│   │   │   ├── SettingDescription
│   │   │   ├── SettingControl      toggle · select · input · stepper
│   │   │   ├── DefaultIndicator
│   │   │   ├── InheritanceNotice
│   │   │   ├── SaveStatus          autosave feedback
│   │   │   └── SettingError
│   │   └── GroupActions            explicit-save groups only
│   │       ├── SaveAction
│   │       └── CancelAction
│   ├── ResetToDefaultsAction
│   └── DangerZone
│       ├── DangerHeading
│       ├── DangerDescription
│       └── DestructiveAction ×n
├── UnsavedChangesDialog
├── DestructiveConfirmDialog
│   ├── ConsequenceList
│   ├── IrreversibilityNotice
│   ├── TypedConfirmationField
│   └── ConfirmAction
└── SettingsSearchResults
    └── SettingResult ×n
        ├── SettingPath
        └── JumpAction
```

Reuse rules:

- `SettingRow` is one component covering every control type, so label placement, description, and save feedback are identical everywhere.
- `DangerZone` is one component; destructive actions never appear outside it.
- `DestructiveConfirmDialog` requires a consequence list and a typed confirmation as mandatory properties, making an unguarded destructive action impossible to build.

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

## Autosaved Toggle

1. The control moves immediately and becomes briefly non-interactive.
2. The request is sent; a save status appears next to the control.
3. On success, "Saved" appears for three seconds and then fades, leaving the new value.
4. On failure, the control returns to its true previous position and the reason is stated inline.
5. The change is announced politely: "Daily digest on. Saved."

```
Daily digest              [ ON ]  ✓ Saved
```

```
Daily digest             [ OFF ]  ⚠ Not saved · [ Retry ]
```

The control must never remain in the new position after a failed save. A control showing a state the server does not hold is the single most damaging bug in settings.

## Explicit-Save Group

1. Editing any field enables the save action and labels it with the change count.
2. A changed field is marked so the user can see what will be saved.
3. Validation runs on blur per field and again on submit for the group.
4. Save disables the group's actions and shows progress on the save control.
5. Success confirms at the group and clears the changed markers.
6. Failure keeps every entered value and states the cause.

## Leaving With Unsaved Changes

1. In-app navigation, browser navigation, and the mobile back gesture all trigger one prompt.
2. The prompt lists which fields are unsaved by name.
3. Three options: save, discard, keep editing. Discard is not the default focus.
4. Choosing save completes the navigation after a successful save, and cancels the navigation if the save fails.

## Concurrent Modification

Settings are frequently open in two tabs or edited by two administrators.

1. Every save carries the version the user loaded.
2. A version mismatch refuses the save rather than overwriting.
3. Both values are shown with who changed them and when.
4. The user chooses; there is no silent merge.

```
┌──────────────────────────────┐
│ Someone else changed this    │
│                              │
│ Retention period             │
│ Dana set it to 90 days       │
│ 6 minutes ago                │
│                              │
│ You entered 365 days         │
│                              │
│ [ Keep 365 days ]            │
│ [ Keep Dana's 90 days ]      │
└──────────────────────────────┘
```

For autosaved single controls, a conflict resolves to the server value with a notice, because there is no partial state to preserve.

## Destructive Action

1. The action opens a dialog, never an inline expansion, so the decision is isolated.
2. The dialog enumerates consequences with real counts fetched at open time, not estimates.
3. The typed confirmation field is compared exactly, including case, and the confirm control stays disabled until it matches.
4. Confirming shows progress and cannot be triggered twice.
5. Completion navigates somewhere valid, because the previous screen may no longer exist.
6. Where a grace period exists, the recovery route and its deadline are stated in the confirmation.

```
Workspace deleted. You can restore it until 4 Sep 2026.
[ Restore now ]
```

## Reset To Defaults

1. Reset is scoped to the visible group, never the whole product.
2. The dialog lists which settings will change and their target values.
3. Reset is a single reversible operation where possible, with undo offered for thirty seconds.

## Settings Search

1. Search matches setting names, descriptions, and synonyms, so "dark" finds "Appearance" and "2FA" finds "Two-factor authentication".
2. Each result shows its full path: "Account › Security › Two-factor authentication".
3. Selecting a result opens the section and highlights the setting for two seconds.
4. Search never edits a setting from the results list, because a setting changed without its context is a setting changed without its explanation.

---

# States

Each section owns its states. One failed section must not blank the settings shell.

## Loading — First Visit

The navigation rail renders from static structure immediately. Only values load.

```
Setting row  → label bar + description bar + control frame at final size
Nav summary  → 20% width bar where the current value will appear
```

Rules:

- controls render disabled with their final dimensions, so nothing shifts when values arrive
- a toggle never renders in the off position before its value is known, because the user will read it as off and change it
- the disabled state is explained once per section: "Loading your settings"

Never render a control in a guessed position. A guessed toggle causes real misconfiguration.

---

## Loading — Autosave In Progress

The control is briefly non-interactive with an inline status.

```
Daily digest              [ ON ]  Saving…
```

Nothing else on the page is blocked, because unrelated settings must remain editable.

---

## Loading — Group Save

Progress appears on the save control. Fields become read-only rather than disabled, so entered values keep full contrast and remain readable.

```
[  Saving 3 changes…      ]
```

---

## Empty — No Configurable Settings In A Section

Occurs when a section's contents depend on something the account does not have yet.

```
┌──────────────────────────────┐
│ No integrations connected    │
│                              │
│ Connect a tool and its       │
│ options appear here.         │
│                              │
│ [ Browse integrations ]      │
└──────────────────────────────┘
```

---

## Empty — Settings Search Found Nothing

```
Nothing in settings matches "invoice colour".

Try "branding" for logos and colours,
or search the help centre.

[ Search help ]   [ Clear ]
```

Redirect to the likely correct term. A bare no-results state leaves the user believing the capability does not exist.

---

## Error — Field Validation

The message is beneath the field, in text, naming the constraint and the fix.

```
Workspace name
[                                ]
✕ Enter a name. This appears on invoices and in emails.
```

```
Retention period
[ 4000 ]
✕ Choose between 30 and 3650 days.
```

---

## Error — Autosave Failed

The control reverts to its true value and the failure is stated with a retry.

```
Push mentions             [ OFF ]  ⚠ Couldn't save · [ Retry ]
```

A dismissible toast is not sufficient here. The user needs to see, at the control, that the value is not what they set.

---

## Error — Group Save Failed

Every entered value is preserved. The cause is stated at the group.

```
┌──────────────────────────────┐
│ ⚠  These changes weren't     │
│    saved. Your edits are     │
│    still here.               │
│    [ Try again ]             │
└──────────────────────────────┘
```

---

## Error — Section Failed To Load

One section fails; the rest of settings continues working.

```
┌──────────────────────────────┐
│ ⚠  Billing settings are      │
│    unavailable right now.    │
│    [ Retry ]                 │
│    Contact support · SET-118 │
└──────────────────────────────┘
```

No controls are rendered for a section whose values are unknown.

---

## Error — Destructive Action Failed Partway

Partial destruction must be reported precisely, never as a generic failure.

```
┌──────────────────────────────┐
│ Deletion stopped partway     │
│                              │
│ 32 clients were removed.     │
│ 148 invoices were not.       │
│ Your workspace still exists. │
│                              │
│ [ Try again ]                │
│ Contact support · DEL-4471   │
└──────────────────────────────┘
```

---

## Partial — Inherited And Overridden

Show the inheritance chain so the user knows why a value is what it is.

```
Time zone           Africa/Lagos
Workspace default · you haven't changed this
```

```
Time zone           Europe/London
Overridden by you · workspace default is Africa/Lagos  [ Reset ]
```

---

## Partial — Setting Requires Something Else

State the dependency and link to it rather than showing a control that cannot work.

```
Single sign-on
Requires a verified domain. [ Verify a domain ]
```

---

## Success — Saved

Confirmation is adjacent to what changed, and states the effect when the effect is not immediately visible.

```
Quiet hours saved · push is held 22:00–07:00
```

For a setting whose effect appears elsewhere, say where: "Applied to new invoices from now on."

---

## Permission-Limited

A member without rights sees the setting, its current value, and who can change it. Controls are not rendered.

```
Retention period           90 days
Only workspace owners can change this.
Ask Dana Okoro.  [ Send request ]
```

A disabled control with a lock icon and no explanation teaches users the product is broken. Show the value, name the authority, and offer the request path.

---

# Mobile Behavior

- Every setting row is a minimum 44×44 target, with the entire row activating the control where the control is a toggle.
- Toggles are right-aligned with generous separation, so an adjacent toggle cannot be hit by mistake.
- Descriptions are always visible beneath labels; information icons that hide the explanation behind a tap are prohibited.
- Explicit-save groups pin their save action above the safe area with the change count visible.
- Numeric and time inputs use the correct keyboard and the platform picker.
- Destructive confirmations are full-screen, not compact sheets, because a cramped destructive dialog produces mis-taps.
- The typed confirmation field disables autocorrect and autocapitalisation, so the required exact string can actually be typed.
- The back gesture triggers the unsaved-changes prompt exactly like in-app navigation.
- Settings search is reachable from the settings root without scrolling.
- Section navigation preserves scroll position when returning from a subsection.

---

# Desktop Expansion

Added space is spent on:

- a persistent navigation rail showing both scopes with their labels
- current values summarised in the rail, so a user can scan without opening sections
- permanently visible descriptions and default indicators beside controls
- inheritance and override state shown inline rather than behind a link
- keyboard flow: Tab through controls in visual order, Space toggles, `Cmd/Ctrl+S` saves an open group

Added space is never spent on:

- two columns of settings side by side, which destroys scanning order
- more settings per screen
- a settings dashboard with usage charts
- decorative section illustrations

---

# Accessibility Requirements

- Each setting's label is programmatically associated with its control, and the description is linked via `aria-describedby` so it is read with the control.
- Toggles are switches with `role="switch"` and `aria-checked`, announced as on or off, never as "checkbox".
- Autosave results are announced through a polite live region naming the setting and outcome: "Daily digest on. Saved."
- Autosave failures are announced assertively, because the control's visible state has changed back and the user must know.
- The scope is announced as part of the section heading, so a screen reader user knows whether a change affects others.
- Default and inherited state are conveyed as text within the control's description, never by styling alone.
- Save actions state their change count in their accessible name: "Save 3 changes".
- Destructive dialogs use `role="alertdialog"`, trap focus, place initial focus on the typed confirmation field rather than the confirm control, and close on Escape.
- The unsaved-changes prompt places initial focus on "Keep editing", so a reflexive Enter does not discard work.
- Permission-limited settings expose their value and the authority as text, and are not focusable controls.
- Section load failures are announced politely, with the retry reachable in the tab order.
- Status indicators such as "Saved" and "Not saved" use text and iconography, so they survive greyscale.
- At 200% zoom the navigation rail collapses to the mobile list and setting rows stack label above control without clipping.
- Reduced motion removes save-status fades and section expansion animation; status text appears and disappears without transition.

---

# Data Requirements

Before implementation, confirm for every setting:

```
Scope: account or workspace

Default value and the reasoning for it

Whether a workspace default can be inherited and overridden

Validation rule and its bounds

Which roles may read it and which may change it

Save model: autosave or explicit, per the stated rule

Whether the effect is immediate or applies to future records only

Whether prior records are affected retroactively

Version basis for conflict detection

Whether the change is audit-logged

Dependencies on other settings or verifications
```

Also define, for destructive operations:

```
Exact scope of destruction, enumerated by entity type

Real counts, fetched at confirmation time

Whether a grace period exists and its exact length

Recovery route during the grace period

Behaviour on partial failure

Who is notified when it completes
```

A setting whose retroactivity is undefined will be implemented one way and documented another, and the first support ticket will reveal the gap.

Every setting must have a written answer to "what does the user observe change, and when".

---

# Performance Requirements

- The settings shell and navigation render within 500ms from static structure; values follow.
- Each section loads its own values, so one slow section does not delay the rest.
- Autosave acknowledges within 500ms; beyond that the inline status escalates from "Saving…" to "Still saving".
- Autosave requests are debounced at 400ms for controls that can be changed rapidly, and the final state always wins.
- Group saves are a single request, so a partial application is impossible.
- Version checks are server-side, and a mismatch never results in a write.
- Destructive consequence counts are fetched at dialog open, so the numbers shown are current.
- Settings search runs client-side against the loaded settings manifest, returning results within 100ms.

---

# Anti-Patterns

Never build:

- account and workspace settings mixed on one screen with no scope label
- a mixture of autosaved and explicit-save controls with no visible distinction between them
- a save button for a single toggle
- autosave on a free-text field, committing half-typed values
- a control that stays in its new position after a failed save
- a toggle rendered off before its real value has loaded
- explanations hidden behind an information icon
- a destructive action adjacent to a routine save action
- "Are you sure?" as the only barrier to permanent deletion
- a delete confirmation that does not enumerate what will be deleted
- a typed-confirmation field with autocapitalisation enabled, making the required string untypeable
- discard as the default focus in an unsaved-changes prompt
- silent last-write-wins between two open tabs
- the same setting in two places, able to disagree
- a settings section that grows past twelve options without being split
- "Reset to defaults" that resets the entire product from within one section
- a disabled control with a lock icon and no explanation
- settings search that changes a value without opening its context
- a setting with no default, so a new account starts in an undefined state
- retroactive effects applied silently to existing records

---

# Pattern Output Example

```
Product

Multi-Tenant Studio Operations Platform


Primary Question

Where do I change this, and did it save?


Scope Model

Account and Workspace, separated in navigation and labeled per section


Section Count

5 account, 6 workspace, maximum 12 settings each


Save Model

Hybrid: autosave for single reversible controls, explicit save for groups


Autosave Feedback

Inline "Saved" adjacent to control, 3 second dwell, revert on failure


Explicit Save

Change count on the action, unsaved-change prompt on all exit routes


Conflict Handling

Version-checked, both values shown with actor and time, user chooses


Defaults

Documented per setting, visible in interface, group-scoped reset


Inheritance

Workspace defaults inheritable, personal overrides preserved and labeled


Destructive Actions

Isolated danger zone, enumerated counts, typed name confirmation, 30 day grace


Partial Failure

Reported by entity type with real counts and a support reference


Permission Model

Value visible, authority named, request path offered, no disabled controls


Settings Search

Name, description, and synonym matching with full path and highlight


Mobile

Two-level list, 44px rows, pinned save with count, full-screen destructive dialogs


Accessibility

Switch roles, polite save announcements, assertive failures, focus on Keep editing


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Account and workspace scope are separated and labeled on every screen
- [ ] The save model is documented and each control follows the stated rule
- [ ] No single toggle has its own save button
- [ ] No free-text field autosaves
- [ ] Autosave confirms inline within 500ms adjacent to the control
- [ ] A failed autosave reverts the control to its true value and says why
- [ ] No control renders in a guessed position before its value loads
- [ ] Explicit-save actions state the change count
- [ ] Changed fields are visibly marked before saving
- [ ] Unsaved changes prompt once on in-app, browser, and back-gesture exits
- [ ] The unsaved prompt lists the affected fields by name
- [ ] Keep editing holds initial focus in the unsaved prompt
- [ ] Concurrent modification is detected and resolved by the user
- [ ] Every setting has a documented default, visible in the interface
- [ ] Reset to defaults is scoped to its group only
- [ ] Inherited and overridden values are labeled with the inheritance chain
- [ ] Destructive actions live in an isolated danger zone
- [ ] Destructive confirmations enumerate real counts fetched at open
- [ ] Destructive confirmation requires typing the exact name
- [ ] Autocapitalisation is disabled on the typed confirmation field
- [ ] Grace period length and recovery route are stated
- [ ] Partial destruction is reported by entity with real counts
- [ ] A failed section does not break the rest of settings
- [ ] Permission-limited settings show value, authority, and request path
- [ ] No disabled control appears without an explanation
- [ ] Settings search matches synonyms and shows full paths
- [ ] Search results open the section rather than editing in place
- [ ] Every setting states when its effect applies and whether it is retroactive
- [ ] Save status survives greyscale
- [ ] 200% zoom stacks rows without clipping controls
- [ ] Reduced motion removes save-status transitions

---

# Final Rule

Settings succeeds when a user changes exactly what they came for, knows it saved, and leaves immediately.

Every setting must justify itself against one question:

Do enough real users genuinely need this different, and can they tell what changes when they change it?

If the answer is no, make the decision for them and delete the setting.
