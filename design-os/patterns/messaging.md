# Messaging Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Layout Intelligence, Lists Component, Forms Component, Feedback System, Navigation System, Accessibility Intelligence

---

# Purpose

The Messaging Pattern defines the complete solution for screens whose job is to let two or more people hold a conversation that both sides can trust.

Messaging is not a list of text records.

Messaging is a shared timeline with an honesty requirement. Every message must accurately represent whether it left the device, reached the server, and reached the recipient.

If a user believes a message was sent and it was not, the product has caused a real-world failure that no amount of visual polish repairs.

---

# When To Use

Use this pattern when:

- two or more people exchange messages over time
- the history of the exchange has ongoing value
- responses are expected but not immediate
- the conversation itself is the unit of work, not an individual message

---

# When Not To Use

Do not use this pattern when:

- the system sends one-way updates with no reply — use the Notifications pattern
- the exchange is a structured intake with fixed fields — use a form
- a single support question needs one answer — use a contact form with a stated response time
- the content is broadcast to an audience — use a feed

The most common product mistake is adding chat to a product where nobody is staffed to answer it, producing a conversation surface that permanently shows an unanswered message.

---

# User Goal

The primary goal is always one of three:

```
Who needs a reply from me?

↓

What was said in this conversation?

↓

Did my message actually get through?
```

The list view must answer the first question in the first viewport, without opening anything.

---

# User Journey

```
Opens messaging with an unread indicator

↓

Scans the conversation list for who is waiting

↓

Opens the conversation that matters

↓

Reads backward far enough to recover context

↓

Composes a reply

↓

Sends and confirms it was delivered

↓

Receives a response, in session or by notification

↓

Returns and picks the thread up without re-reading everything
```

The last step is the one products forget.

A thread that reopens at the top of history, or at a position unrelated to what the user has already read, forces them to re-find their place every single time.

---

# UX Flow

## Entry

The user arrives from:

- an app launch with an unread badge, scanning for who is waiting
- a push notification about a specific message, expecting that thread open at that message
- a contextual link elsewhere in the product, such as an order or a task, expecting the related thread
- a search result matching message text, expecting the thread scrolled to the match

Each entry has a different landing position, and each must be honoured. A notification that opens the inbox rather than the thread it announced is a broken promise.

---

## Triage

Within the conversation list's first viewport, the user must be able to determine:

- which conversations are unread
- who each conversation is with
- what the last message said
- when it arrived
- whether they were the last to reply

The last point matters more than products assume. Knowing whether the ball is in your court is the core triage question.

---

## Read

Opening a thread follows a strict positioning rule:

```
Unread messages exist

↓

Open at the first unread message, with a divider above it

↓

No unread messages

↓

Open at the most recent message
```

Never open at the top of history. Never open at an arbitrary saved scroll offset that no longer corresponds to what was read.

---

## Compose

The composer is always visible and always ready.

Focus behaviour differs by device: autofocus on desktop where a keyboard is present, no autofocus on mobile where it would raise the keyboard and hide the conversation the user came to read.

---

## Confirm

Every sent message passes through explicit states:

```
Sending

↓

Sent

↓

Delivered

↓

Read
```

Only claim what the system actually knows. A product that shows "delivered" when it only knows the server accepted the message is lying, and users discover the lie at the worst possible moment.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Messages           ✎  🔍 │
├──────────────────────────┤
│ ┌──┐ Ade Okoro        2m │
│ │AO│ Can you check the ● │  unread dot
│ └──┘ invoice before…     │
├──────────────────────────┤
│ ┌──┐ Support         14m │
│ │ S│ You: I'll send it   │  you replied last
│ └──┘ this afternoon   ✓✓ │
├──────────────────────────┤
│ ┌──┐ Sam Ibe          1d │
│ │SI│ Thanks — received   │
│ └──┘                     │
└──────────────────────────┘
│ Bottom navigation    (2) │
└──────────────────────────┘

── thread view ──────────────

┌──────────────────────────┐
│ ‹  ┌──┐ Ade Okoro        │
│    │AO│ Active now    ⋮  │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Morning — did the    │ │
│ │ invoice go out?      │ │
│ │             09:14    │ │
│ └──────────────────────┘ │
│      ┌──────────────────┐│
│      │ Sending it now.  ││
│      │      09:16  ✓✓   ││
│      └──────────────────┘│
│ ─── New messages ─────── │
│ ┌──────────────────────┐ │
│ │ Perfect, thanks.     │ │
│ │             09:31    │ │
│ └──────────────────────┘ │
│ ● ● ●  Ade is typing     │
├──────────────────────────┤
│ ⊕ │ Message…       │ ➤  │
└──────────────────────────┘
```

Mobile rules:

- List and thread are separate full screens. A split view on a phone gives neither surface enough width.
- Back from a thread returns to the list at its previous scroll position with the thread now marked read.
- List rows are minimum 72px so the avatar, two lines of preview, and the timestamp all fit without crowding.
- The composer is pinned above the keyboard, never behind it, and never overlapped by a floating action.
- The send control is 44×44 minimum and sits inside the composer row, not below it.
- The message list scrolls under a fixed header showing who the conversation is with, since that context must never scroll away.
- Long-press on a message opens its action sheet. There are no hover actions on touch.
- New messages arriving while the user is scrolled up do not jump the view; a jump-to-latest control appears instead.

---

## Tablet

```
┌────────────────┬───────────────────────────┐
│ Messages    ✎  │ ‹ Ade Okoro       Active  │
├────────────────┼───────────────────────────┤
│ ● Ade Okoro 2m │ ┌───────────────────────┐ │
│   Can you ch…  │ │ Morning — did the     │ │
├────────────────┤ │ invoice go out?       │ │
│   Support  14m │ └───────────────────────┘ │
│   You: I'll s… │       ┌─────────────────┐ │
├────────────────┤       │ Sending it now. │ │
│   Sam Ibe   1d │       └─────────────────┘ │
├────────────────┼───────────────────────────┤
│                │ ⊕ │ Message…       │ ➤   │
└────────────────┴───────────────────────────┘
```

Split view begins here. The list column is fixed at 320px and the thread takes the remainder. The list shows a selected state so the user always knows which thread they are reading.

---

## Desktop

```
┌──────┬────────────────┬─────────────────────────────────┐
│      │ Messages    ✎ 🔍│ Ade Okoro · Active now       ⋮  │
│ Nav  ├────────────────┼─────────────────────────────────┤
│      │ All  Unread    │ ┌─────────────────────────────┐ │
│  (2) │ ● Ade Okoro 2m │ │ Morning — did the invoice   │ │
│      │   Can you ch…  │ │ go out?                     │ │
│      ├────────────────┤ │                     09:14   │ │
│      │   Support  14m │ └─────────────────────────────┘ │
│      │   You: I'll s… │           ┌───────────────────┐ │
│      ├────────────────┤           │ Sending it now.   │ │
│      │   Sam Ibe   1d │           │       09:16   ✓✓  │ │
│      │   Thanks       │           └───────────────────┘ │
│      ├────────────────┤ ─── New messages ────────────── │
│      │                │ ┌─────────────────────────────┐ │
│      │                │ │ Perfect, thanks.    09:31   │ │
│      │                │ └─────────────────────────────┘ │
│      │                ├─────────────────────────────────┤
│      │                │ ⊕  Message Ade…            ➤    │
└──────┴────────────────┴─────────────────────────────────┘
```

Desktop rules:

- Three regions: application navigation, conversation list, thread. A fourth details panel appears only on request.
- The composer is anchored to the bottom of the thread column and grows upward to a maximum of six lines before scrolling internally.
- Message bubbles cap at 60% of the thread width so long messages stay readable and the sender distinction stays visible.
- Hover reveals per-message actions in a floating group aligned to the message's outer edge, and these actions are duplicated in a keyboard-reachable menu.
- The unread filter is a persistent control, not a hidden setting, because triage is the desktop user's dominant task.

---

# Component Hierarchy

```
MessagingPage
├── ConversationListPanel
│   ├── ListHeader
│   │   ├── Title
│   │   ├── ComposeAction
│   │   └── ListSearch
│   ├── ListFilter                 all | unread | archived
│   ├── ConversationList
│   │   └── ConversationRow ×n
│   │       ├── ParticipantAvatar
│   │       │   └── PresenceDot
│   │       ├── ParticipantName
│   │       ├── LastMessagePreview
│   │       │   └── AuthorPrefix       "You:" when self
│   │       ├── Timestamp
│   │       ├── UnreadIndicator
│   │       └── DraftIndicator
│   └── ListStates
│       ├── ListSkeleton
│       ├── ListEmptyState
│       ├── SearchEmptyState
│       └── ListErrorState
├── ThreadPanel
│   ├── ThreadHeader
│   │   ├── BackAction               mobile
│   │   ├── ParticipantIdentity
│   │   ├── PresenceLabel
│   │   └── ThreadMenu
│   ├── ConnectionBanner             conditional
│   ├── MessageList
│   │   ├── LoadEarlierTrigger
│   │   ├── DateSeparator ×n
│   │   ├── UnreadDivider
│   │   └── MessageGroup ×n
│   │       └── MessageBubble ×n
│   │           ├── MessageBody
│   │           ├── AttachmentBlock       optional
│   │           ├── MessageTimestamp
│   │           ├── DeliveryStatus
│   │           ├── FailedRetryAction     conditional
│   │           └── MessageActions
│   ├── TypingIndicator
│   ├── JumpToLatestButton
│   └── ThreadStates
│       ├── ThreadSkeleton
│       ├── ThreadEmptyState
│       └── ThreadErrorState
└── MessageComposer
    ├── AttachmentAction
    ├── TextInput                    auto-growing
    ├── AttachmentPreviewStrip
    │   └── AttachmentChip ×n
    │       ├── Thumbnail
    │       ├── UploadProgress
    │       └── RemoveAction
    ├── SendAction
    └── ComposerError
```

Reuse rules:

- `ConversationRow` is one component; unread, draft, and self-authored preview are data-driven variants.
- `MessageBubble` is one component; direction, status, and attachment presence are properties, never separate components.
- The composer's attachment handling reuses the product's standard upload component so progress, cancellation, and size limits behave identically.

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

## Sending A Message

1. The message appears in the thread immediately, before any network call, with a sending indicator.
2. The composer clears and the thread scrolls to the bottom.
3. Focus stays in the composer so the next message can be typed without a click.
4. On server acknowledgement the indicator becomes sent.
5. On recipient acknowledgement it becomes delivered.
6. On recipient read, and only where read receipts are genuinely supported and enabled, it becomes read.

The optimistic message must be visually distinguishable from a confirmed one. A pending message rendered identically to a sent one is the root cause of most messaging trust failures.

## Send Failure And Retry

1. After the request fails or times out at 10 seconds, the message shows a failed state.
2. The bubble takes an error treatment with text, not colour alone.
3. A retry action sits directly on the message.

```
      ┌────────────────────────┐
      │ Sending it now.        │
      │ ⚠ Not sent             │
      │ [ Retry ]  [ Delete ]  │
      └────────────────────────┘
```

4. Retry re-sends the same message and returns it to the sending state.
5. The message stays in position in the timeline rather than moving to the end, so the conversation order the user intended is preserved.
6. Failed messages persist across app restarts. Losing an unsent message on reload is a data-loss bug, not a UI issue.
7. Messages sent while offline queue in order and flush automatically on reconnection, in the order they were composed.

Never remove a failed message automatically. Never show a generic toast as the only indication that a specific message failed.

## Receiving A Message

1. If the user is scrolled to the bottom, the new message appends and the view scrolls smoothly to reveal it.
2. If the user is scrolled up reading history, the view does not move. A jump-to-latest control appears with a count.

```
┌──────────────────────────┐
│      ↓ 3 new messages    │
└──────────────────────────┘
```

3. Auto-scrolling a user away from what they are reading is the single most common messaging defect.
4. The thread is marked read only when the message is actually visible in the viewport, not when the thread is opened.

## Typing Indicator

1. The indicator appears after the other participant has typed continuously for 1 second.
2. It clears 3 seconds after typing stops, or immediately when a message arrives.
3. It occupies reserved space at the bottom of the thread so its appearance does not shift the messages above it.
4. In group conversations it names up to two people and then counts: `Ade and Sam are typing` or `3 people are typing`.
5. It is never sent while the composer contains only whitespace.

## Attachments

1. Selecting a file adds a chip to the composer with a thumbnail and a determinate progress indicator.
2. Upload begins immediately, before send, so the message sends instantly once the user is ready.
3. Send is disabled while any attachment is still uploading, and the button states why.
4. A failed upload marks its chip with a retry and does not block sending the remaining content.
5. Files exceeding the size limit are rejected at selection with the limit stated: `Files must be under 25 MB. invoice.pdf is 31 MB.`
6. Images render inline with a reserved aspect ratio. Other files render as a named row with type and size.
7. Removing an attachment cancels its upload.

## Reconnection

The connection state is always represented honestly.

1. On disconnect, a persistent banner appears below the thread header.

```
┌────────────────────────────────────────┐
│ ⚠ Reconnecting… messages will send     │
│   when you're back online.             │
└────────────────────────────────────────┘
```

2. The composer stays enabled. Disabling composition while offline prevents users from writing the message they opened the app to write.
3. Messages composed while offline queue with an explicit queued state rather than a sending state, because nothing is being sent.
4. Reconnection attempts use exponential backoff starting at 1 second and capping at 30 seconds, with a manual retry always available.
5. On reconnection, missed messages are fetched and inserted in chronological order, an unread divider is placed correctly, and the queue flushes in composition order.
6. The banner changes to a brief success state for 2 seconds, then disappears.

```
┌────────────────────────────────────────┐
│ ✓ Back online · 2 messages sent        │
└────────────────────────────────────────┘
```

7. If reconnection fails repeatedly, escalate the banner to state that messages remain unsent and offer a manual retry.

Never silently drop a queued message. Never show a connected state while the socket is down.

## Loading Earlier History

1. Scrolling to the top of the loaded history triggers a fetch.
2. Scroll position is anchored to the message that was at the top, so the content grows upward without moving what the user is reading.
3. A loading row appears above that anchor.
4. When the beginning of the conversation is reached, state it: `This is the beginning of your conversation with Ade.`

Position anchoring is not optional. A history load that jumps the reading position makes reading backwards impossible.

## Search

1. Search filters the conversation list by participant name and message content.
2. Selecting a result opens the thread scrolled to the matching message with it briefly highlighted.
3. Surrounding messages load so the match has context.
4. A control returns the user to the latest message without losing the search results.

---

# States

Every region owns its own states. A failed thread must not blank the conversation list.

## Loading — First Visit

Skeletons matching the real geometry of both panels.

```
Conversation row → avatar circle + name bar + preview bar + time bar
Message bubble   → alternating-width bars at realistic message lengths
```

Render five conversation skeletons and six message skeletons of varied width, which reads as a conversation rather than a form.

The composer renders immediately in its real, usable state. It requires no data.

---

## Loading — Thread Opening

The thread header renders instantly from the list data already loaded, so the user immediately sees who they are opening.

Messages fill in beneath it. The header never shows a skeleton.

---

## Loading — Sending

The optimistic bubble is at 70% opacity with a small clock indicator in place of the timestamp.

If sending exceeds 3 seconds, the indicator changes to `Still sending…` so the user knows the delay is real rather than a stuck interface.

---

## Loading — Loading Earlier Messages

A single row above the anchor point.

```
┌──────────────────────────┐
│    Loading earlier…      │
├──────────────────────────┤
│ existing messages stay   │
│ exactly where they are   │
└──────────────────────────┘
```

---

## Empty — No Conversations

```
┌──────────────────────────────┐
│         [illustration]       │
│                              │
│  No messages yet             │
│                              │
│  Start a conversation and    │
│  it'll appear here.          │
│                              │
│  [ New message ]             │
└──────────────────────────────┘
```

---

## Empty — Conversation Has No Messages

A newly created thread shows who it is with and an invitation to begin, with the composer focused on desktop.

```
┌──────────────────────────────┐
│         ┌────┐               │
│         │ AO │               │
│         └────┘               │
│       Ade Okoro              │
│                              │
│  Send your first message.    │
│  Ade usually replies within  │
│  an hour.                    │
└──────────────────────────────┘
```

State a response expectation only where it is derived from real data.

---

## Empty — No Search Results

```
No conversations match "invoice attachment"

[ Clear search ]   [ Search all messages ]
```

Distinguish between no matching conversations and no matching messages, and offer the broader search as the next step.

---

## Error — Conversation List Failed

The list region shows the failure. Any open thread keeps working, because an already-loaded conversation does not depend on the list.

```
┌──────────────────────────┐
│ ⚠ Couldn't load messages │
│   [ Retry ]              │
└──────────────────────────┘
```

---

## Error — Thread Failed To Load

The thread region shows the failure with a retry. The list stays usable so the user can open another conversation.

Any draft in the composer is preserved through the failure and the retry.

---

## Error — Message Failed To Send

Covered in the interaction flow. The requirements are: per-message error treatment with text, in-place retry, position preserved, and persistence across restarts.

---

## Error — Attachment Upload Failed

The chip shows the failure and a retry. The message text remains sendable independently.

```
┌────────────────────┐
│ 📄 invoice.pdf     │
│ ⚠ Upload failed    │
│ [ Retry ] [ ✕ ]    │
└────────────────────┘
```

---

## Error — Page Failed

Only when nothing renders. Required: cause, retry, and a support route with a reference identifier.

---

## Partial — Delivery Status Unknown

Where the platform cannot confirm delivery, show sent and stop. Never upgrade to delivered without confirmation.

Where read receipts are disabled by either party, show delivered and never imply more.

State the limitation once in settings rather than annotating every message.

---

## Stale — Reconnected After A Long Absence

When a large number of messages arrived while disconnected, insert a divider stating the gap rather than silently appending fifty messages.

```
─── 14 messages while you were away ───
```

---

## Success

Sending confirms through the status indicator, not a toast. A toast for every sent message is unusable at conversational speed.

Attachment upload confirms by the chip becoming a completed state.

Reconnection confirms with a 2-second banner stating how many queued messages were sent.

---

## Permission-Limited — Read-Only Or Closed Conversation

Replace the composer with a clear statement and a route forward.

```
┌────────────────────────────────────────┐
│ This conversation is closed.           │
│ [ Start a new conversation ]           │
└────────────────────────────────────────┘
```

Never render a disabled composer with no explanation, and never let a user type a full message into a field that will refuse to send it.

---

# Mobile Behavior

- List and thread are separate screens with real back navigation and preserved list scroll position.
- The composer never autofocuses on entry. The user came to read; raising the keyboard hides half the conversation.
- The composer sits directly above the keyboard, with the thread resizing rather than scrolling behind it.
- The composer grows to a maximum of five lines, then scrolls internally.
- Send is 44×44 minimum, inside the composer row.
- Long-press opens message actions. Every hover action on desktop has a long-press equivalent here.
- Attachment selection offers camera, photo library, and files as distinct entries rather than a single generic picker.
- Images are compressed before upload on cellular, with the reduction stated at selection.
- Pull to refresh on the list revalidates conversations; pull at the top of a thread loads earlier history.
- Unread counts appear on the bottom navigation and are cleared only when messages are actually seen.
- Typing indicators reserve their space so the composer never shifts up and down while the other person types.

---

# Desktop Expansion

Added space is spent on:

- list and thread visible simultaneously, removing navigation between triage and reply
- keyboard shortcuts: Enter to send, Shift+Enter for a newline, Escape to clear focus, Up to edit the last message
- hover-revealed per-message actions, duplicated in a keyboard-accessible menu
- a persistent unread filter for triage
- a details panel for participants, shared files, and settings, opened on request

Added space is never spent on:

- message bubbles stretched to the full width of a wide monitor
- a permanently open details panel that squeezes the thread
- a third pane nobody asked for
- larger avatars that reduce the number of visible conversations

---

# Accessibility Requirements

- The conversation list is a list with each row a single tab stop whose accessible name states participant, unread status, last message, and relative time.
- The message list is a log region with polite announcement, so incoming messages are read after the user's current speech completes rather than interrupting it.
- Each message's accessible name includes the sender, the content, the time, and the delivery status. Status conveyed only by a check glyph is invisible to screen readers.
- Delivery states are distinguished by text or shape, not colour or check count alone, so they survive greyscale.
- Failed messages announce assertively, because a silent failure is the most damaging possible outcome.
- Connection state changes announce politely on disconnect and on reconnect.
- The typing indicator announces at most once per burst rather than continuously, which would make the thread unusable with a screen reader.
- Focus stays in the composer after sending.
- Opening a thread on mobile moves focus to the thread header; back returns focus to the originating conversation row.
- The unread divider is a real landmark that screen reader users can navigate to, labelled `New messages`.
- Loading earlier messages announces the count added and preserves the reading position for assistive technology as well as visually.
- Attachment chips state file name, size, and upload progress as text.
- Images in messages require alt text where the sender provides it, and are announced as an image with the sender's caption where they do not.
- Composer input is a labelled multiline field. Placeholder text is never the only label.
- Respect reduced motion: messages appear without slide animation, the typing indicator becomes static text rather than animated dots, and scroll-to-bottom is instant.
- At 200% zoom the split view collapses to the mobile single-column arrangement, and the composer remains visible without horizontal scrolling.

---

# Data Requirements

Before implementation, confirm for the conversation model:

```
Source of truth for message ordering, and how ties are broken

Server-authoritative timestamps, with client time never used for ordering

Which delivery states the transport can actually confirm

Read receipt support, and whether either party can disable it

Presence accuracy and its staleness window

Message retention period and deletion semantics

Edit and delete rules: window, and what the other party sees afterwards

Attachment size limit, permitted types, virus scanning, and storage lifetime

Offline queue durability across app restarts

Maximum participants per conversation

Realtime transport and its fallback when websockets are blocked

Permission model: who may read, reply, add participants, and close a thread
```

Message identity must be assigned client-side at composition and preserved through the server round trip, otherwise a retried message can be delivered twice.

Never display a delivery state the transport cannot verify. Never order a timeline by client clock.

---

# Performance Requirements

- The conversation list renders under 500ms from cache, then revalidates in the background.
- Opening a thread renders the last 30 messages immediately; earlier history loads on demand.
- Threads exceeding 200 rendered messages are virtualised, with the virtualiser preserving anchored scroll during upward growth.
- Optimistic send renders in under 16ms. No network call is awaited before the message appears.
- The realtime connection is a single shared socket across all conversations, not one per open thread.
- Typing events are throttled to at most one per second per participant.
- Reconnection uses exponential backoff from 1 second to 30 seconds with jitter, so a server recovery does not receive a synchronised reconnection storm.
- Image attachments are compressed client-side before upload and served as thumbnails in the thread, with the full asset fetched only on expansion.
- Unread counts come from the server, not from counting locally cached messages.

---

# Anti-Patterns

Never build:

- a message that appears sent when the request has not been acknowledged
- a delivered indicator based on server receipt rather than recipient receipt
- a read receipt the recipient cannot disable
- auto-scroll that moves a user away from history they are reading
- a thread that opens at the top of all history instead of at the first unread message
- a failed message that disappears on reload
- a failed send reported only by a transient toast
- a retry that moves the message to the end of the conversation
- a disabled composer while offline
- a connected state shown while the socket is down
- reconnection without backoff, hammering a recovering server
- a typing indicator that shifts the layout each time it appears
- unread counts cleared on thread open rather than on messages being seen
- a notification that opens the inbox instead of the announced thread
- attachments that block sending the text portion of a message
- message bubbles stretched to the full width of a wide monitor
- delivery status conveyed only by the number of check marks
- chat added to a product with nobody staffed to reply

---

# Pattern Output Example

```
Product

Client Support Workspace


Primary Question

Who needs a reply from me?


Layout

Desktop three-pane; mobile separate list and thread screens


Conversation Row

Avatar, name, preview with "You:" prefix, relative time, unread dot


Thread Entry Position

First unread message with divider; latest when fully read


Delivery States

Sending, sent, delivered — read receipts unsupported by transport, not shown


Optimistic Send

Immediate render at 70% opacity, clock indicator, 10s timeout


Send Failure

In-place error with retry and delete, position preserved, survives restart


Offline

Composer stays enabled, messages queue, flush in composition order


Reconnection

Exponential backoff 1s to 30s with jitter, banner states queued count on recovery


Typing

1s to appear, 3s to clear, reserved space, named up to two participants


Attachments

25 MB limit, upload starts at selection, text sendable if an upload fails


History

Anchored upward loading, 30 initial messages, virtualised above 200


Accessibility

Log region with polite announcement, assertive on send failure, status as text


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Conversation rows show who replied last and whether the thread is unread
- [ ] Threads open at the first unread message with a labelled divider
- [ ] List scroll position is preserved on return from a thread
- [ ] Sent messages appear optimistically and are visually distinct until confirmed
- [ ] Delivery states reflect only what the transport can actually confirm
- [ ] Delivery status is conveyed by text or shape, not check count or colour alone
- [ ] Failed messages stay in position with an in-place retry
- [ ] Failed messages survive an app restart
- [ ] Offline messages queue and flush in composition order
- [ ] The composer stays enabled while offline
- [ ] The connection banner is honest and persistent while disconnected
- [ ] Reconnection uses backoff with jitter and offers manual retry
- [ ] Reconnection inserts missed messages in order with a correct unread divider
- [ ] Incoming messages never scroll the user away from history
- [ ] A jump-to-latest control with a count appears when scrolled up
- [ ] Loading earlier history anchors the scroll position
- [ ] The beginning of a conversation is stated when reached
- [ ] Typing indicators reserve space and do not shift the layout
- [ ] Attachment failures do not block sending text
- [ ] Attachment size limits are stated at selection with the actual file size
- [ ] Unread counts clear only when messages are seen
- [ ] Notifications open the specific thread and message
- [ ] Focus stays in the composer after sending
- [ ] Mobile does not autofocus the composer on entry
- [ ] Touch targets are 44×44 minimum and long-press replaces every hover action
- [ ] Message log announces politely; send failures announce assertively
- [ ] Reduced motion removes slide, animated dots, and smooth scrolling
- [ ] 200% zoom collapses to single column with the composer visible

---

# Final Rule

Messaging earns its place by being trustworthy about what happened to every message.

Every element must justify itself against one question:

Does the user know, without guessing, whether their message got through?

If they have to guess, the interface is lying by omission.
