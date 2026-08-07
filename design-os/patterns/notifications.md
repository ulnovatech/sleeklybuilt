# Notifications Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Feedback System, Navigation System, Lists Component, App Shell Component, Motion System, UX Intelligence

---

# Purpose

The Notifications Pattern defines the complete solution for telling someone that something happened while they were not looking.

A notification is not an announcement.

A notification is an interruption request. Every one spends a portion of the user's attention and a portion of the product's credibility, and neither is replenished quickly.

If a user learns to dismiss notifications without reading them, the channel is dead, and the one genuinely urgent message will be dismissed with the rest.

---

# When To Use

Use this pattern when:

- something happened outside the user's current view that changes what they should do
- another person or system acted on something the user owns
- a long-running process the user started has finished or failed
- a time-sensitive condition requires a decision

---

# When Not To Use

Do not use this pattern when:

- the user performed the action themselves and can see the result — confirm inline instead
- the information is only interesting, not actionable — put it in a feed or an activity log
- the message is marketing — that belongs in a channel the user opted into deliberately
- the state is permanent and visible on the relevant screen — a badge on the record is enough

The most common product mistake is notifying users of their own actions, which trains people to ignore every notification because most of them tell you what you already know.

---

# User Goal

The primary goal is always one of three:

```
Did anything happen that needs me?

↓

What exactly happened?

↓

Deal with it, or make it stop
```

The third goal is real, frequently ignored, and the reason a preferences route must be reachable from the notification centre in one interaction.

---

# User Journey

```
Notices a badge or receives an interruption

↓

Judges urgency without opening anything

↓

Opens the centre and scans grouped items

↓

Recognises the one that matters

↓

Navigates to the thing the notification is about

↓

Resolves it

↓

Returns to find the notification marked read

↓

Adjusts preferences if the interruption was unwelcome
```

The final step is the escape valve.

A product without a fast, granular way to turn a specific notification type off will be muted entirely at the operating system level, which removes the urgent ones too.

---

# UX Flow

## Entry

The user encounters notifications through:

- a badge on navigation, noticed passively during other work
- a toast during a session, arriving unrequested
- a push or email arriving outside the product, deciding whether to return
- deliberately opening the centre to check what was missed

Each surface carries different interruption cost, and the same event must not appear on all of them without a rule governing the overlap.

---

## Judge

Before opening anything, the user must be able to determine:

- that something new exists
- roughly how much
- whether anything is urgent

A badge showing a count answers the first two. Only a distinct treatment for genuinely urgent items answers the third, and that treatment must be rare enough to retain meaning.

---

## Scan

Within the centre's first viewport, the user must be able to determine:

- what the newest items are about
- who or what caused each
- when each happened
- which are unread

---

## Resolve

Every notification points at something.

```
Notification

↓

The object it concerns

↓

The action that resolves it
```

A notification that cannot be acted on is a log entry, and log entries belong in an activity view, not in an interruption channel.

---

## Control

Preferences are part of the pattern, not a separate settings feature.

Every notification carries a route to turning its own type off, reachable from the item itself, because the moment of annoyance is the only moment a user will actually configure preferences.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ‹  Notifications    ⚙    │
├──────────────────────────┤
│ All   Unread (4)         │
├──────────────────────────┤
│ TODAY                    │
├──────────────────────────┤
│ ● ┌──┐ Ade commented on  │
│   │AO│ Invoice #4821     │
│   └──┘ "Can we push the… │
│        14 min ago     ⋮  │
├──────────────────────────┤
│ ● ┌──┐ 3 new orders      │
│   │📦│ Tap to review     │
│   └──┘ 1 hour ago     ⋮  │
├──────────────────────────┤
│   ┌──┐ Export finished   │
│   │⬇ │ sales-q3.csv      │
│   └──┘ 3 hours ago    ⋮  │
├──────────────────────────┤
│ YESTERDAY                │
├──────────────────────────┤
│   ┌──┐ Sam assigned you  │
│   │SI│ ULN-482           │
│   └──┘ 1 day ago      ⋮  │
├──────────────────────────┤
│      Mark all as read    │
└──────────────────────────┘

── toast, in session ────────

┌──────────────────────────┐
│                          │
│   current screen content │
│                          │
│ ┌──────────────────────┐ │
│ │ ✓ Invoice sent       │ │
│ │   Undo               │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Bottom navigation    (4) │
└──────────────────────────┘
```

Mobile rules:

- The centre is a full screen, not a dropdown. A dropdown on a phone covers the content the notification refers to.
- Rows are minimum 72px with the entire row tappable, and the overflow control a separate 44×44 target.
- Unread is indicated by a dot plus a weight change, never by background colour alone, since a subtle tint is invisible on many screens in daylight.
- Toasts appear at the bottom, above any bottom navigation and above the keyboard, never covering the primary action of the current screen.
- Only one toast is visible at a time. A second replaces the first rather than stacking, because a stack of toasts on a phone occupies the whole screen.
- Swipe on a row reveals mark-read and dismiss, and both actions are also present in the overflow menu.
- Date group headers are sticky so the user always knows the era they are scrolling through.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Notifications              ⚙   Mark all    │
├────────────────────────────────────────────┤
│ All   Unread (4)   Mentions   System       │
├────────────────────────────────────────────┤
│ TODAY                                      │
│ ● AO  Ade commented on Invoice #4821   14m │
│       "Can we push the due date?"       ⋮  │
├────────────────────────────────────────────┤
│ ● 📦  3 new orders need review          1h │
│       Tap to review                     ⋮  │
├────────────────────────────────────────────┤
│   ⬇  Export finished · sales-q3.csv     3h │
│       [ Download ]                      ⋮  │
└────────────────────────────────────────────┘
```

Category tabs become visible at this width, and inline actions such as download or approve fit on the row without crowding.

---

## Desktop

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Header                          🔔(4)   Profile │
│ Nav  │                                  ┌───────────────┴──┐
│      │                                  │ Notifications  ⚙ │
│      │                                  ├──────────────────┤
│      │                                  │ All  Unread (4)  │
│      │                                  ├──────────────────┤
│      │                                  │ TODAY            │
│      │                                  │ ● AO Ade comment-│
│      │                                  │   ed on Invoice  │
│      │                                  │   #4821      14m │
│      │                                  │   [ Reply ]   ⋮  │
│      │                                  ├──────────────────┤
│      │                                  │ ● 📦 3 new orders│
│      │                                  │   need review 1h │
│      │                                  ├──────────────────┤
│      │                                  │  Mark all read   │
│      │                                  │  See all         │
│      │                                  └──────────────────┘
└──────┴──────────────────────────────────────────────────┘

toast region, bottom-right, max 3 stacked
                              ┌──────────────────────┐
                              │ ✓ Invoice sent   Undo│
                              └──────────────────────┘
```

Desktop rules:

- The centre is a panel anchored to the bell, capped at 420px wide and 480px tall, with a route to a full page for longer history.
- The panel closes on outside click and on Escape, returning focus to the bell.
- Toasts occupy a fixed region in one corner, stacking to a maximum of three with older ones collapsing into a count.
- Toasts never cover primary navigation or a form's submit control.
- Inline actions appear directly on rows, since the width allows a verb without truncating the message.

---

# Component Hierarchy

```
NotificationSystem
├── NotificationBell
│   ├── BellIcon
│   └── UnreadBadge                  count, capped display at 99+
├── NotificationCenter
│   ├── CenterHeader
│   │   ├── Title
│   │   ├── PreferencesAction
│   │   └── MarkAllReadAction
│   ├── CategoryTabs                 all | unread | mentions | system
│   ├── NotificationList
│   │   ├── DateGroupHeader ×n
│   │   └── NotificationItem ×n
│   │       ├── ActorAvatar | TypeIcon
│   │       ├── NotificationBody
│   │       │   ├── ActorName
│   │       │   ├── ActionText
│   │       │   └── ObjectReference
│   │       ├── ContextSnippet           optional
│   │       ├── RelativeTimestamp
│   │       ├── UnreadIndicator
│   │       ├── InlineAction ×n          optional
│   │       └── ItemMenu
│   │           ├── MarkReadAction
│   │           ├── DismissAction
│   │           └── MuteTypeAction
│   ├── GroupedNotificationItem
│   │   ├── SummaryText                  "3 new orders"
│   │   ├── StackedAvatars
│   │   └── ExpandAction
│   ├── LoadMoreTrigger
│   └── CenterStates
│       ├── CenterSkeleton
│       ├── CenterEmptyState
│       ├── FilteredEmptyState
│       └── CenterErrorState
├── ToastRegion
│   └── Toast ×n
│       ├── StatusIcon
│       ├── ToastMessage
│       ├── ToastAction                  undo | view
│       ├── DismissAction
│       └── ProgressTrack                auto-dismiss timer
└── NotificationPreferences
    └── PreferenceRow ×n
        ├── TypeLabel
        ├── TypeDescription
        └── ChannelToggle ×n             in-app | push | email
```

Reuse rules:

- `NotificationItem` is one component. Type differences are data, never separate components per event type.
- The toast component is the product's single feedback primitive, shared with form confirmations, so timing and dismissal behave identically everywhere.
- Preference rows are generated from the same type registry that produces notifications, guaranteeing every notification type is switchable.

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

New state is understandable and reversible
```

## Toast Appearance And Dismissal

1. The toast enters from the region edge over 200ms with an ease-out curve.
2. Auto-dismiss timing depends on content: 4 seconds for a simple confirmation, 6 seconds when the toast contains an action, and never for errors requiring a decision.
3. The timer pauses on hover and on focus, and resets when the pointer leaves.
4. A toast containing an action must be reachable by keyboard before it disappears, which is why actionable toasts hold longer and pause on focus.
5. Dismissal is available explicitly at all times.
6. Exit animates over 150ms, faster than entry.

An error the user must respond to is never auto-dismissed. If the message matters enough to interrupt, it matters enough to require acknowledgement.

## Undo

1. Undo appears in the toast for destructive or hard-to-reverse actions.
2. The underlying operation is deferred for the toast's duration where possible, so undo is instant rather than a compensating write.
3. Where deferral is impossible, undo performs a genuine reversal and confirms it: `Restored.`
4. The undo window is stated when it is short: `Undo · 6s`.
5. Undo is keyboard reachable, and focus moves to the toast for destructive confirmations only, since moving focus for every toast would constantly interrupt typing.

Undo is more valuable than a confirmation dialog for almost every reversible action, because it costs nothing when the user is right and everything is recoverable when they are wrong.

## Opening The Centre

1. The badge count clears on open, but individual items remain unread.
2. Items are marked read when they are actually displayed in the viewport for 1 second, not on panel open.
3. Marking read is optimistic and reverts visibly if the request fails.
4. Escape closes the panel and returns focus to the bell.

Clearing all unread state simply because the panel opened destroys the user's ability to come back to something they saw but could not deal with.

## Acting On A Notification

1. Selecting a row navigates to the object, not to a detail view of the notification itself.
2. The notification is marked read on navigation.
3. Where the notification is grouped, selecting it opens the group's shared context rather than an arbitrary member.
4. Inline actions such as approve, download, or reply execute in place and update the row without closing the centre.
5. An inline action that fails shows the failure on the row with a retry, and does not mark the item read.

A notification pointing at a deleted or inaccessible object must state that rather than navigating to a broken page.

```
This comment was deleted.  [ Dismiss ]
```

## Grouping

Grouping is what keeps a notification channel survivable.

Group when:

- multiple events share the same object: `Ade, Sam and 3 others commented on Invoice #4821`
- multiple events share the same type within a window: `12 new orders in the last hour`
- a single automated process emits repeatedly: `Sync completed 8 times today`

Grouping rules:

1. Group by object first, then by type, then by time window.
2. The summary states a count and the shared subject, never a generic phrase.
3. Groups expand in place to reveal members, and the expansion is animated over 200ms so the relationship between summary and members is visible.
4. A group is read when all its members are read, and the summary reflects partial read state: `3 of 12 unread`.
5. Never collapse two urgent items into a summary. Urgency is per item and must survive grouping.

## Badge Behaviour

1. The badge shows a count of unread items, capped at `99+`.
2. Counts are computed server-side so they match across devices.
3. The badge clears within one second of the items being read on any device.
4. A badge that shows a count with no corresponding items in the centre is a bug that destroys trust in the badge permanently; the count and the list must come from the same source.
5. Where a category is urgent, the badge changes shape or adds a glyph rather than only changing colour.

## Cross-Channel Rules

The same event must not arrive four times.

```
Event occurs

↓

Is the user currently active in the product?

↓

Yes → in-app only

↓

No → in-app record, plus one external channel by preference

↓

Still unread after the escalation window?

↓

Escalate to the next channel, once
```

Rules:

1. Never send push for something the user is actively looking at.
2. Never send email for something already read in-app.
3. Digest low-priority types rather than sending them individually, on a schedule the user chooses.
4. Every external notification records a matching in-app item so the centre is a complete history.
5. Respect quiet hours for every channel except a genuinely urgent, user-defined category.
6. Every external message contains a working one-click route to the specific preference that produced it.

## Preferences

1. Preferences are organised by notification type, with a channel toggle per type.
2. Each type has a plain description of when it fires: `When someone comments on an invoice you created.`
3. A mute action on any item deep-links to that item's preference row with it highlighted.
4. Changes apply immediately, confirmed inline, with no separate save step.
5. Muting a type states the consequence: `You won't be notified when someone comments on your invoices.`

---

# States

Every surface owns its own states. A failing centre must not break the badge or the toast region.

## Loading — Centre First Open

Skeleton rows matching real geometry.

```
Notification row → avatar circle + two text bars + time bar
```

Render four skeleton rows, which fills the visible panel without implying a specific count.

The panel opens at its full height immediately so it does not resize as content arrives.

---

## Loading — Marking Read

Optimistic. The unread indicator disappears immediately and the badge decrements.

On failure the indicator returns and a single quiet message appears at the top of the centre, not a toast, since a toast about a notification is absurd.

---

## Loading — Inline Action Pending

The action control shows a pending state in place, keeping its width so the row does not reflow.

The rest of the centre stays interactive.

---

## Empty — No Notifications Ever

```
┌──────────────────────────────┐
│         [illustration]       │
│                              │
│  You're all caught up        │
│                              │
│  Notifications about your    │
│  invoices, orders, and       │
│  mentions will appear here.  │
│                              │
│  Manage notifications        │
└──────────────────────────────┘
```

State what will appear here. An empty centre with no explanation leaves the user unsure whether the feature works.

---

## Empty — All Read

Distinct from never having had any, and worth celebrating briefly rather than showing the same blank state.

```
┌──────────────────────────────┐
│            ✓                 │
│      You're all caught up    │
│                              │
│      [ See earlier ]         │
└──────────────────────────────┘
```

Read history remains reachable. Notifications are the only record of many events, and deleting them on read loses that record.

---

## Empty — Filter Or Category Has Nothing

```
Nothing in Mentions.

You have 4 unread in All.
[ View all ]
```

Always state where the items actually are, so an empty tab never reads as an empty product.

---

## Error — Centre Failed To Load

The panel shows the failure. The badge keeps its last known count and states that it may be out of date.

```
┌──────────────────────────┐
│ ⚠ Couldn't load          │
│   notifications.         │
│   [ Retry ]              │
└──────────────────────────┘
```

---

## Error — Inline Action Failed

The row shows the failure with a retry and remains unread.

```
│ ⬇ Export finished        │
│   ⚠ Download failed      │
│   [ Retry ]              │
```

---

## Error — Toast For A Failure

Failure toasts state the cause and the recovery, never a code alone, and never auto-dismiss when a decision is required.

```
┌────────────────────────────────────┐
│ ⚠ Couldn't send invoice #4821      │
│   Your draft is saved.             │
│   [ Try again ]        [ Dismiss ] │
└────────────────────────────────────┘
```

---

## Error — Realtime Delivery Unavailable

When the live channel drops, the centre falls back to polling at 60-second intervals and states its accuracy honestly if the fallback also fails.

```
Notifications may be delayed. [ Refresh ]
```

Never show a live indicator while the connection is down.

---

## Partial — Some Notifications Reference Inaccessible Objects

Render the item with its reason instead of a link that leads nowhere.

```
Sam mentioned you in a project you no longer have access to.
[ Dismiss ]
```

---

## Stale — Timestamps

Relative timestamps update on a schedule: every 30 seconds under an hour, every 5 minutes under a day, then static.

The absolute time is available on hover and in the accessible name, because "3 days ago" is insufficient for anything a user needs to act on precisely.

---

## Success

An action taken from a notification confirms at the object, not in the notification centre.

A toast confirming an action includes the affected object by name so the confirmation is verifiable: `Invoice #4821 sent to Ade Okoro.`

Muting confirms with the consequence stated and an immediate undo.

---

## Permission-Limited — Notifications Governed By An Administrator

Where an organisation enforces certain notification types, show the toggle in a locked state with the reason.

```
Security alerts · Required by your organisation
```

Never hide a locked preference. A user who cannot find the setting will assume the product is ignoring them.

---

# Mobile Behavior

- The centre is a full screen reached from navigation, never a dropdown over the content.
- Rows are minimum 72px with a 44×44 separate target for the overflow control.
- Swipe actions have menu equivalents, since swipe is undiscoverable and unavailable to assistive technology.
- One toast at a time, positioned above bottom navigation and above the keyboard.
- Toasts never cover the primary action of the current screen, which is the most common toast placement failure on mobile.
- Undo in a toast is a full-width tappable region, not a small text link.
- Push notifications deep-link to the exact object, never to the app's home screen.
- The badge on bottom navigation matches the server count exactly and clears within one second of reading on any device.
- Pull to refresh revalidates the centre.
- Quiet hours default to the device's do-not-disturb schedule where the platform exposes it.

---

# Desktop Expansion

Added space is spent on:

- inline actions on rows, resolving items without navigation
- category tabs visible rather than behind a menu
- a stacked toast region handling up to three concurrent messages
- richer context snippets showing the comment or change itself
- keyboard shortcuts to open the centre and mark all read

Added space is never spent on:

- a permanently open notification sidebar competing with the work
- toasts placed centrally over content
- more than three simultaneous toasts
- a centre panel taller than 480px, which becomes a scrolling page inside a dropdown

---

# Accessibility Requirements

- The bell is a button with an accessible name including the unread count: `Notifications, 4 unread`.
- The badge count is part of the button's accessible name, never a visual-only element.
- The centre is a dialog or a disclosure with a correct role, traps focus when modal, closes on Escape, and returns focus to the bell.
- The notification list uses list semantics so position and length are announced.
- Each item's accessible name reads as a complete sentence including actor, action, object, absolute time, and unread state.
- Unread state is conveyed by text in the accessible name and by a dot plus weight visually, never by background tint alone.
- Toasts render in a status region with polite announcement for confirmations and an alert region with assertive announcement for errors. Announcing every confirmation assertively makes the product unusable with a screen reader.
- An actionable toast moves focus to itself only for destructive confirmations. Otherwise it announces without stealing focus, and its action is reachable through a documented keyboard shortcut or by tabbing to the toast region.
- Toast auto-dismiss pauses on focus so a keyboard user can always reach the action.
- Urgency is never conveyed by colour alone. An urgent item carries a text label and an icon, and the entire system survives greyscale.
- Grouped items announce their count and read state: `3 of 12 unread`.
- Expanding a group announces the number of items revealed.
- Marking all read announces the result: `All notifications marked as read`.
- Respect reduced motion: toasts fade rather than slide, groups expand without height animation, and the badge does not pulse.
- At 200% zoom the desktop panel becomes a full-width sheet rather than a clipped dropdown.

---

# Data Requirements

Before implementation, confirm for every notification type:

```
Trigger event, stated precisely

Who receives it, and whether the actor is excluded

The object it references, and its permanent identifier

Whether it is actionable, and what the action is

Priority: urgent, standard, or digest-eligible

Grouping key and grouping time window

Channels permitted: in-app, push, email

Escalation window before moving to the next channel

Default state: on or off for new users

Whether an administrator can enforce it

Retention period in the centre

Behaviour when the referenced object is deleted or access is revoked
```

Unread counts must come from a single server-side source shared by every surface. Counting locally guarantees the badge and the list will eventually disagree, and a badge that lies is worse than no badge.

Never ship a notification type with no corresponding preference control. Never send a notification for an event the recipient caused.

---

# Performance Requirements

- The badge count loads with the application shell, not after the centre is opened.
- The centre renders its first ten items under 300ms from cache, then revalidates.
- Older history loads on demand rather than all at once.
- Realtime delivery uses the application's single shared socket, not a dedicated connection.
- Where realtime is unavailable, polling runs at 60-second intervals and stops entirely when the tab is hidden.
- Toast rendering never blocks the interaction that produced it.
- Marking read is batched: multiple items seen in one scroll produce one request, not one per item.
- Notification payloads carry rendered text rather than requiring a lookup per item to display a row.
- The centre is virtualised beyond 100 items.

---

# Anti-Patterns

Never build:

- notifications about the user's own actions
- a badge whose count does not match the items in the centre
- a badge that clears everything to read simply because the panel was opened
- an error toast that auto-dismisses before it can be read or acted on
- a toast that covers the primary action of the current screen
- more than three stacked toasts
- toasts as the only record of an event, with no entry in the centre
- ungrouped floods, such as forty separate rows for forty comments on one document
- a notification with no route to the object it describes
- a notification pointing at a deleted object with no explanation
- the same event delivered by in-app, push, and email simultaneously
- push notifications for something the user is currently looking at
- a notification type with no preference toggle
- preferences reachable only through several layers of settings
- an external message with no working unsubscribe or preference link
- urgency conveyed only by red
- marketing content inside a transactional notification channel
- a notification centre that deletes read items, destroying the only record of an event

---

# Pattern Output Example

```
Product

Invoicing And Orders Platform


Primary Question

Did anything happen that needs me?


Surfaces

Badge, centre panel, toast region, push, digest email


Centre

Desktop panel 420×480 with a full-page route; mobile full screen


Types

Comment, mention, order received, payment failed, export complete


Urgent Types

Payment failed only — distinct icon and label, never grouped


Grouping

By object, then type, then a 1-hour window; partial read state shown


Read Semantics

Marked read after 1 second in viewport, not on panel open


Badge Source

Server-computed, shared across devices, capped at 99+


Toast Timing

4s confirmation, 6s with action, errors never auto-dismiss


Undo

Deferred execution during the toast window, 6 seconds, stated


Cross-Channel

Active in product → in-app only; inactive → push after 5 minutes;
unread after 24 hours → digest email


Preferences

Per type, per channel, reachable in one tap from any item


Deleted Objects

Stated in place with a dismiss action, never a broken link


Accessibility

Polite for confirmations, assertive for errors, greyscale-safe urgency


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] No notification is sent for an action the recipient performed
- [ ] Every notification type has a preference toggle per channel
- [ ] Every notification points at a real object with a resolving action
- [ ] Deleted or inaccessible objects are stated in place, never linked
- [ ] The badge count comes from the server and matches the centre exactly
- [ ] The badge clears within one second of reading on any device
- [ ] Opening the centre does not mark everything read
- [ ] Items are marked read after being visibly displayed
- [ ] Read history remains reachable after being read
- [ ] Grouping collapses floods and states a real count and subject
- [ ] Urgent items are never absorbed into a group summary
- [ ] Groups show partial read state
- [ ] Toasts confirm at 4 seconds, 6 with an action, and never auto-dismiss on errors
- [ ] Toast timers pause on hover and on focus
- [ ] Toasts never cover the current screen's primary action
- [ ] No more than three toasts stack, one on mobile
- [ ] Undo is present for destructive actions and states its window
- [ ] Every external notification has a matching in-app record
- [ ] No event is delivered on more than one external channel at a time
- [ ] Push is suppressed while the user is active in the product
- [ ] Quiet hours are respected except for user-defined urgent types
- [ ] Every external message links to the specific preference that produced it
- [ ] Empty, all-read, and empty-filter states are all distinct
- [ ] Failed inline actions leave the item unread with a retry
- [ ] Confirmations announce politely and errors announce assertively
- [ ] Urgency survives greyscale
- [ ] Accessible names include actor, action, object, absolute time, and unread state
- [ ] Mobile rows are 72px with 44×44 separate controls and menu equivalents for swipe
- [ ] Reduced motion removes slide, expansion, and badge animation
- [ ] 200% zoom converts the desktop panel to a full-width sheet

---

# Final Rule

A notification earns its place by being worth the interruption it costs.

Every notification type must justify itself against one question:

If this were never sent, would the user miss something they needed to act on?

If the answer is no, it is noise, and noise is what makes people turn everything off.
