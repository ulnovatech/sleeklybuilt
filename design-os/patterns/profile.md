# Profile Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Forms System, Authentication Component, UX Intelligence, Feedback System, Empty States System, Accessibility Intelligence  
**Gated By:** Security Review

---

# Purpose

The Profile Pattern defines how a product presents a person, and how that person controls what others see of them.

A profile serves two audiences on the same route, and they want opposite things.

The owner wants control and confirmation that their changes took effect.

A visitor wants identity, credibility, and a way to interact.

If one screen is built for the owner and the visitor experience is whatever remains, the profile fails as a social surface. If it is built for the visitor and editing is buried in settings, the owner never completes it.

---

# When To Use

Use this pattern when:

- people appear to other people inside the product
- identity affects trust, such as a marketplace seller or a service provider
- a person accumulates activity, contributions, or history worth showing
- team members need to know who they are working with
- an owner must control the visibility of their own information

---

# When Not To Use

Do not use this pattern when:

- the only need is changing account preferences — use the Settings pattern
- the only need is authentication credentials — that belongs in account security, not a public profile
- the person is never visible to anyone else, in which case a profile is ceremony without purpose
- the entity is an organisation rather than a person — use an organisation page with different trust signals

The most common product mistake is merging profile and settings into one screen, so the owner edits public identity and password policy in the same form.

---

# User Goal

Two goals share the route, and the pattern must serve both without compromise.

The owner:

```
Is my information correct?

↓

Who can see it?

↓

Did my change actually save?
```

The visitor:

```
Who is this?

↓

Can I trust them?

↓

What can I do with them?
```

The screen must resolve which audience is present before rendering, and never present the other audience's affordances.

---

# User Journey

## Owner Journey

```
Opens own profile from the account menu

↓

Sees exactly what visitors see, with edit affordances

↓

Edits a field in place, or opens the edit view

↓

Uploads or replaces an avatar

↓

Adjusts what each field exposes

↓

Confirms the saved result

↓

Previews the profile as a visitor sees it
```

The preview step is the one products omit, and it is the only way an owner can verify visibility settings are working.

## Visitor Journey

```
Arrives from a mention, a listing, a comment, or search

↓

Confirms this is the right person

↓

Assesses credibility from verifiable signals

↓

Scans recent activity for relevance

↓

Takes the available action: message, follow, hire, or return
```

---

# UX Flow

## Resolve Audience

Before layout, the screen determines one of four contexts:

- owner viewing their own profile
- visitor viewing another person, signed in
- visitor viewing another person, signed out
- owner previewing their profile as a visitor

Each context changes the actions, the visible fields, and the empty states.

Never render edit controls to a visitor, even disabled. A disabled edit button on someone else's profile is a design error, not a permission signal.

---

## Establish Identity

The identity block appears first in every context and contains only verifiable identity:

- avatar
- display name
- handle or unique identifier
- role, title, or relationship to the viewer
- location and joined date where relevant to trust
- verification status where the product actually verifies something

Verification badges must correspond to a real check. A badge that means nothing devalues every badge in the product.

---

## Owner Editing

Editing has two acceptable models, and the choice must be deliberate:

- inline field editing for short, independent fields such as display name and bio
- a dedicated edit view for grouped or interdependent fields such as contact details

Rules:

- edits use explicit save, never silent autosave, because a profile is public and an accidental keystroke becomes visible to others
- the field being edited shows its own save state, not a page-level one
- cancel restores the previous value without confirmation
- leaving with unsaved changes prompts once

---

## Avatar Upload

Avatars fail more often than any other profile field, and the flow must be built for failure.

```
Choose source

↓

Client-side validation of type and size

↓

Crop and position

↓

Upload with progress

↓

Server validation and processing

↓

Replace in all surfaces
```

Requirements stated before selection, not after rejection:

```
JPG or PNG · up to 5 MB · at least 200×200 px
```

---

## Privacy Control

Each shareable field carries an explicit audience, set where the field is edited rather than in a distant privacy screen.

Audiences must be named in the product's own terms, and the meaning must be stated:

```
Email          Only me
Phone          My team · visible to 14 people
Location       Anyone with the link
```

Counts make abstract audiences concrete, and concrete audiences produce correct decisions.

---

## Activity

Activity is the credibility engine of a profile, and it must be selective.

Show:

- contributions the person chose to make public
- counts that are meaningful and verifiable
- recent items with dates

Never show:

- passive behaviour such as pages viewed
- activity from private spaces the viewer cannot access
- counts inflated by trivial actions

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ‹ Back            ⋯      │
├──────────────────────────┤
│        ┌────────┐        │
│        │ Avatar │  ✎     │
│        └────────┘        │
│      Maria Adeyemi       │
│      @maria · Designer   │
│      Lagos · Joined 2023 │
│      ✓ Identity verified │
├──────────────────────────┤
│ [   Edit profile   ]     │  owner
│ [ Message ] [ Follow ]   │  visitor
├──────────────────────────┤
│ About                 ✎  │
│ Product designer working  │
│ on payments tooling.      │
├──────────────────────────┤
│ 42 projects · 128 reviews │
│ 4.9 ★ average             │
├──────────────────────────┤
│ Contact              ✎   │
│ maria@example.com         │
│ Only me                   │
├──────────────────────────┤
│ Activity                  │
│ ▸ Shipped Checkout v2     │
│   3 days ago              │
│ ▸ Reviewed 4 submissions  │
│   1 week ago              │
│ View all activity         │
└──────────────────────────┘
```

Mobile rules:

- identity block is centred and fits in the first viewport without scrolling
- one primary action, full width; secondary actions sit beside it or in the overflow menu
- edit affordances are 44×44 targets adjacent to their section heading, not tiny pencil glyphs
- privacy labels sit directly beneath their value, never in a separate screen
- activity is limited to three items with a link to the full history

---

## Tablet

```
┌────────────────────────────────────────────┐
│ ‹ Back                              ⋯      │
├──────────────────┬─────────────────────────┤
│  ┌──────────┐    │ Maria Adeyemi           │
│  │  Avatar  │ ✎  │ @maria · Designer       │
│  └──────────┘    │ Lagos · Joined 2023     │
│                  │ ✓ Identity verified     │
│                  │ [ Edit profile ]        │
├──────────────────┴─────────────────────────┤
│ About                                   ✎  │
├─────────────────────┬──────────────────────┤
│ Stats               │ Contact           ✎  │
│ 42 projects         │ maria@example.com    │
│ 128 reviews · 4.9 ★ │ Only me              │
├─────────────────────┴──────────────────────┤
│ Activity · 5 items                         │
└────────────────────────────────────────────┘
```

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────┐  Maria Adeyemi                    [ Message ]   │
│ │  Avatar  │  @maria · Product Designer         [ Follow ]   │
│ │          │  Lagos, Nigeria · Joined Mar 2023      ⋯        │
│ └──────────┘  ✓ Identity verified · Responds in 2 hours      │
├───────────────────────────────────┬──────────────────────────┤
│ About                             │ At a glance              │
│ Product designer working on       │ 42 projects              │
│ payments tooling. Previously at   │ 128 reviews · 4.9 ★      │
│ two fintech startups.             │ Member 2 years           │
│                                   │                          │
│ Skills                            │ Contact                  │
│ Interaction · Systems · Research  │ maria@example.com        │
│                                   │ Visible to: my team      │
├───────────────────────────────────┤                          │
│ Activity                          │ Shared spaces            │
│ ▸ Shipped Checkout v2   3d ago    │ 3 projects with you      │
│ ▸ Reviewed 4 submissions 1w ago   │                          │
│ ▸ Joined Payments team  2w ago    │                          │
│   View all activity               │                          │
└───────────────────────────────────┴──────────────────────────┘
```

Desktop rules:

- two columns: narrative and activity on the left, verifiable facts on the right
- the owner sees an additional "Preview as visitor" control in the overflow menu
- extra width buys context such as shared spaces and response time, not a larger avatar
- the avatar never exceeds 128px; a profile is not a portrait gallery

---

# Component Hierarchy

```
ProfilePage
├── ProfileHeader
│   ├── AvatarDisplay
│   │   ├── AvatarImage
│   │   ├── AvatarFallbackInitials
│   │   └── AvatarEditAction          owner only
│   ├── IdentityBlock
│   │   ├── DisplayName
│   │   ├── Handle
│   │   ├── RoleLabel
│   │   ├── LocationAndTenure
│   │   └── VerificationBadge         conditional
│   └── ProfileActions
│       ├── OwnerActions              Edit · Preview as visitor
│       ├── VisitorActions            Message · Follow · Report
│       └── OverflowMenu
├── ProfileSections
│   ├── AboutSection
│   │   ├── SectionHeader
│   │   ├── BioText
│   │   ├── InlineEditField           owner only
│   │   └── FieldVisibilityLabel
│   ├── CredibilityPanel
│   │   └── StatItem ×n
│   ├── ContactSection
│   │   ├── ContactField ×n
│   │   ├── VisibilitySelector        owner only
│   │   └── ContactEmptyState
│   └── SharedContextPanel            visitor, signed in
├── ActivityFeed
│   ├── ActivityItem ×n
│   ├── ActivityEmptyState
│   └── ViewAllAction
├── AvatarUploadDialog
│   ├── SourcePicker
│   ├── RequirementsNotice
│   ├── CropCanvas
│   ├── UploadProgress
│   └── UploadError
└── UnsavedChangesDialog
```

Reuse rules:

- `AvatarDisplay` is one component used in the header, comments, member lists, and mentions, so a new avatar propagates everywhere at once.
- `InlineEditField` is the product's standard inline editor with its own loading, error, and success states.
- Visitor actions come from the product's standard action set, never profile-specific buttons.

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

## Inline Field Edit — Owner

1. Activating edit replaces the value with an input containing the current value, cursor at the end.
2. The field's own save and cancel actions appear beneath it.
3. Save disables the actions and shows progress on the save control only.
4. On success, the field returns to display mode with the new value and a brief confirmation next to it.
5. On failure, the input stays open with the typed value intact and the reason stated.
6. Escape cancels; Enter saves for single-line fields; Enter inserts a newline in multi-line fields where save is explicit.

Never autosave a public field. A half-typed bio should not become someone's public identity.

## Avatar Upload

1. Requirements are shown before the file picker opens.
2. Client-side validation rejects wrong type or oversized files immediately, naming the actual problem and the actual file size.
3. Crop opens with a square selection sized to the image, movable and zoomable, with a live circular preview matching the final rendering.
4. Upload shows determinate progress and can be cancelled.
5. Server processing may still reject the file; that failure is reported with the same clarity as client failure.
6. On success the avatar updates in the header and everywhere else in the session without a page reload.

Rejection microcopy must name the fix:

```
┌──────────────────────────────┐
│ ⚠  That image is 8.4 MB.     │
│    The limit is 5 MB.        │
│                              │
│    Try a smaller file, or    │
│    we can compress this one. │
│                              │
│    [ Compress and use ]      │
│    [ Choose another ]        │
└──────────────────────────────┘
```

Never say "Upload failed" without the reason. The owner cannot fix an unnamed problem.

## Visibility Change

1. The selector shows the audiences the product actually supports, each with its meaning.
2. Changing audience saves on selection, because this control has no ambiguous intermediate state.
3. Confirmation states the new consequence: "Your phone number is now visible to anyone with the link."
4. Widening visibility to a public audience asks for confirmation once; narrowing does not.

## Save Conflict With Another Session

1. Saves carry the version the owner started from.
2. If the field changed elsewhere, the save is refused rather than overwriting.
3. Both values are shown with their times, and the owner chooses.

```
┌──────────────────────────────┐
│ This was changed on another  │
│ device 4 minutes ago.        │
│                              │
│ There: Senior Product Designer│
│ Here:  Product Designer, Lead │
│                              │
│ [ Keep mine ] [ Keep theirs ]│
└──────────────────────────────┘
```

## Preview As Visitor — Owner

1. Preview renders the profile exactly as the selected audience sees it, with all edit affordances removed.
2. A persistent bar states the mode and the audience being simulated.
3. Exiting returns to the owner view at the same scroll position.

```
Previewing as: anyone with the link        [ Exit preview ]
```

Preview must derive from the real visibility rules, not from a separate code path, or it will disagree with reality.

## Visitor Actions

1. Message opens a composer prefilled with nothing, so the visitor writes their own opening.
2. Follow confirms with an immediate state change and is reversible in the same place.
3. Report opens a categorised form and confirms receipt with what happens next.
4. Signed-out visitors see the actions, and selecting one prompts authentication and returns to the completed action.

---

# States

Each region owns its states. A failed activity load must not hide identity.

## Loading — First Visit

Identity loads first. Activity and shared context load after.

```
Avatar        → circular shimmer at final diameter
Name          → 40% width bar
Handle        → 25% width bar
Actions       → two button frames at final size
About         → three 90% width bars
Stats         → three label and value pairs
Activity      → 3 skeleton rows
```

Reserve the avatar's exact diameter so the header does not resize when the image arrives.

Never show a generic placeholder person illustration during load; it is indistinguishable from a real fallback avatar.

---

## Loading — Field Save

The field is the progress surface. The rest of the profile stays interactive.

```
Display name
[ Maria Adeyemi        ]  Saving…
```

Other fields remain editable, because one slow save should not freeze the profile.

---

## Loading — Avatar Upload

Determinate progress over the crop preview, cancellable.

```
┌──────────────────────────────┐
│      ┌──────────┐            │
│      │  preview │            │
│      └──────────┘            │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░  62%       │
│ Uploading · [ Cancel ]       │
└──────────────────────────────┘
```

The previous avatar stays in place until the new one is confirmed, so a failed upload does not leave the owner with no picture.

---

## Empty — Owner, Nothing Filled In

The owner's empty profile must convert, not scold.

```
┌──────────────────────────────┐
│        ┌────────┐            │
│        │  MA    │            │
│        └────────┘            │
│  Add a photo so teammates    │
│  recognise you.              │
│  [ Add photo ]               │
│                              │
│  Your profile is 40% done.   │
│  Adding a role and bio helps │
│  people know who to ask.     │
│  [ Add role ]  [ Add bio ]   │
└──────────────────────────────┘
```

Completeness prompts state the benefit, never a score with no explanation.

---

## Empty — Visitor, Sparse Profile

A visitor must not see the owner's to-do list.

Omit empty sections entirely. Show only what exists.

```
Maria Adeyemi
@maria · Joined Mar 2023

[ Message ]

No public activity yet.
```

Never show "This user has not added a bio" to a visitor. It is an accusation, not information.

---

## Empty — No Activity Yet

```
┌──────────────────────────────┐
│ Nothing public yet           │
│                              │
│ Projects and reviews appear  │
│ here once they're published. │
└──────────────────────────────┘
```

For the owner, add the action that produces activity. For a visitor, state the fact and stop.

---

## Error — Field Validation

The message names the constraint, beneath the field, in text.

```
Handle
[ maria adeyemi ]
✕ Handles can use letters, numbers, and underscores. Try maria_adeyemi.
```

```
Handle
[ maria ]
✕ @maria is taken. @maria_a and @mariaad are free.
```

Offer the fix, not just the rejection.

---

## Error — Avatar Rejected

Distinguish the causes, because each has a different fix:

- wrong type: "PNG and JPG only. That file is a HEIC."
- too large: state the file size and the limit, offer compression
- too small: state both dimensions, "That image is 96×96. It needs to be at least 200×200."
- content rejected by moderation: state that it was rejected and how to appeal
- upload interrupted: retry with the same crop preserved

---

## Error — Profile Failed To Load

Distinguish a missing person from a broken request, because the recovery differs.

```
This profile doesn't exist, or it's private.

[ Back to team ]   Search people
```

```
We couldn't load this profile.

[ Retry ]   Contact support · ref PRF-2210
```

---

## Error — Save Failed

The typed value is never discarded.

```
┌──────────────────────────────┐
│ ⚠  Your bio wasn't saved.    │
│    The text is still here.   │
│    [ Try again ]             │
└──────────────────────────────┘
```

---

## Partial — Verification Pending

State the pending status honestly rather than showing an unearned badge or nothing at all.

```
Identity check in review · started 2 days ago
Usually completes within 3 business days.
```

---

## Success — Change Saved

Confirmation is inline, adjacent to the field, and states the consequence when visibility is involved.

```
Location saved · visible to anyone with the link
```

A page-level toast for a field-level change forces the owner to look away from what they just did.

---

## Permission-Limited — Restricted Fields

When a visitor cannot see a field that exists, the pattern depends on the product's privacy promise.

If the existence of the field is not itself sensitive, say it is restricted. If it is, omit it entirely.

Decide this once, document it, and apply it consistently. Inconsistency here leaks information.

---

# Mobile Behavior

- Touch targets minimum 44×44 for edit affordances, avatar action, and visibility selectors.
- The identity block fits the first viewport; avatar diameter is capped at 96px on mobile.
- Inline editing opens the keyboard with the correct type, and the field scrolls above the keyboard so both the input and its save control remain visible.
- Avatar source picker offers camera and library, and upload continues if the app is backgrounded.
- Crop uses one-finger drag and two-finger pinch, with an on-screen zoom slider as the accessible alternative.
- The visibility selector opens as a bottom sheet listing audiences with their meaning, not a compact dropdown.
- Secondary actions such as report and block live in the overflow menu, never as visible siblings of Message.
- Unsaved-change prompts use the platform-consistent sheet, triggered by both the back gesture and in-app navigation.

---

# Desktop Expansion

Added space is spent on:

- verifiable facts in a persistent right column beside narrative content
- shared context: projects in common, mutual connections, overlapping teams
- inline editing without navigation, since fields and their labels fit side by side
- keyboard flow, where Tab reaches each edit affordance and Escape cancels the active edit
- preview-as-visitor without leaving the page

Added space is never spent on:

- a cover image that pushes identity below the fold
- an oversized avatar
- an unfiltered activity river
- decorative badges with no verified meaning

---

# Accessibility Requirements

- The profile has one `h1` containing the person's display name.
- The avatar's alternative text is the person's name plus "profile photo"; the initials fallback is marked decorative and the name is read from the heading instead.
- Edit affordances have accessible names identifying the field: "Edit display name", never "Edit".
- Activating inline edit moves focus into the input and announces the field name and current value.
- Cancelling an edit returns focus to the edit affordance that opened it.
- Save results are announced through a polite live region including the field and outcome: "Bio saved."
- Upload failures are announced assertively, because the owner is waiting on the result and the file picker may have closed.
- Upload progress is exposed as a progressbar with a text percentage, not a bar alone.
- The crop tool is keyboard operable: arrow keys move the selection, plus and minus zoom, and the current crop is described in text.
- Verification status is text, not a badge glyph alone, so it survives both greyscale and screen readers.
- Visibility labels are text adjacent to their value, never conveyed by an icon alone.
- Preview mode announces itself on entry and the exit control is the first focusable element in the mode bar.
- At 200% zoom the header stacks to a single column with the avatar above the name and no clipped actions.
- Reduced motion removes avatar crossfades and section expansion animation.

---

# Data Requirements

Before implementation, confirm for every profile field:

```
Who owns the value: the person, or an administrator

Whether the person may edit it

Available audiences and their exact membership

Default audience for a new account

Validation rule and uniqueness constraint

Whether history is retained on change

Whether the field is included in exports

Whether an administrator override exists and is visible
```

Also define, profile-wide:

```
Avatar accepted types, size limit, minimum dimensions, and stored renditions

Moderation policy for avatars and bios, and the appeal route

What "verified" verifies, and who performs the check

Which activity types are public and which spaces are excluded

Version basis for conflict detection

Deletion behaviour: what remains visible after a person leaves
```

A field with no defined audience will default to the widest one during implementation, which is how private data becomes public.

---

# Performance Requirements

- Identity block renders within one second on a warm cache; activity may follow.
- Avatars are served as pre-generated renditions at the exact rendered size, never a full-resolution original scaled in the browser.
- Avatar dimensions are reserved before load so the header never shifts.
- Field saves acknowledge within 300ms and are optimistic only for fields whose failure is safely reversible.
- Uploads are validated client-side before any bytes are sent, so an oversized file costs no bandwidth.
- Upload progress reflects real transfer, never a simulated animation.
- Activity is paginated and never loads a complete history to render three rows.
- A changed avatar invalidates its cached renditions immediately, so stale pictures do not persist across the product.

---

# Anti-Patterns

Never build:

- one screen that mixes public identity with password and security settings
- disabled edit controls shown to visitors
- autosave on public fields such as display name or bio
- "This user has not added a bio" shown to visitors
- an owner's completion checklist visible to visitors
- an upload error that says "Failed" without naming the cause
- an avatar upload that discards the crop on retry
- a verification badge that verifies nothing
- profile-completion percentages with no stated benefit
- privacy controls in a separate screen from the fields they govern
- audience names such as "Level 2" that require a help article to interpret
- silent last-write-wins on concurrent edits
- an activity feed showing views, sessions, or other passive behaviour
- a cover image that pushes the person's name below the fold
- a preview mode built on separate logic from real visibility rules
- deleting an account and leaving orphaned name fragments across the product

---

# Pattern Output Example

```
Product

Professional Services Marketplace


Audiences

Owner editing · signed-in visitor · signed-out visitor · owner preview


Identity Fields

Avatar · display name · handle · role · location · tenure · verification


Save Model

Explicit per field, inline, version-checked


Avatar Rules

JPG or PNG · 5 MB max · 200×200 minimum · crop before upload


Privacy Audiences

Only me · my team (14 people) · anyone with the link


Visibility Placement

Adjacent to each field, never a separate screen


Verification Meaning

Government ID checked by provider, 3 business day SLA


Activity Scope

Published projects and completed reviews only


Conflict Handling

Version mismatch shows both values with timestamps


Visitor Empty State

Sparse sections omitted, no completion prompts shown


Mobile

96px avatar, identity in first viewport, bottom-sheet visibility picker


Accessibility

Field-specific edit names, polite save announcements, keyboard crop


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The four audience contexts are handled distinctly
- [ ] Visitors never see edit affordances, enabled or disabled
- [ ] Owner preview derives from real visibility rules
- [ ] Public fields use explicit save, not autosave
- [ ] Unsaved changes prompt once before navigation, including the back gesture
- [ ] Cancel restores the previous value without a confirmation
- [ ] Every field's audience is shown next to the field
- [ ] Audience names state their meaning and membership count
- [ ] Widening visibility to public asks for confirmation
- [ ] Avatar requirements appear before the file picker
- [ ] Each avatar rejection cause has its own specific message and fix
- [ ] The previous avatar remains until a new one is confirmed
- [ ] Crop is preserved when an upload is retried
- [ ] Concurrent edits are detected and resolved by the owner, not overwritten
- [ ] Owner empty states convert; visitor empty states omit
- [ ] "Has not added a bio" never appears to a visitor
- [ ] Verification status is text and reflects a real check
- [ ] Missing profile and failed load are distinguished
- [ ] Save failures preserve typed values
- [ ] Upload progress reflects real transfer and is cancellable
- [ ] Avatars propagate to every surface in the session
- [ ] Field edits are announced politely; upload failures assertively
- [ ] Crop is fully keyboard operable
- [ ] 200% zoom stacks the header without clipping
- [ ] Reduced motion removes avatar and section animation

---

# Final Rule

A profile succeeds when the owner is confident about what they are showing and the visitor is confident about who they are looking at.

Every element must justify itself against two questions:

For the owner: does this help them control their identity?

For the visitor: does this help them decide whether to trust and act?

An element that serves neither audience belongs somewhere else.
