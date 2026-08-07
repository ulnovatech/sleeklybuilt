# Support Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Search Component, Forms System, Feedback System, Empty States System, UX Intelligence, Accessibility Intelligence

---

# Purpose

The Support Pattern defines how a user who is stuck becomes unstuck.

Support is not a help centre with a contact form at the end.

Support is a graduated system where the cheapest resolution is tried first and the path to a human is never hidden.

A user arriving at support has already failed at something. Every additional obstacle compounds a frustration that is already present.

If a user cannot reach a human when self-service does not work, the support system has converted a product problem into a trust problem.

---

# When To Use

Use this pattern when:

- users encounter problems the product cannot resolve on their own screen
- the product has enough surface area to produce recurring questions
- account, billing, or data issues require staff intervention
- a service commitment exists that support must be measured against
- users need to track an issue that outlives a single session

---

# When Not To Use

Do not use this pattern when:

- the confusion is on one specific screen — fix that screen, or explain it in place
- the question is answered by a single sentence of inline guidance
- the product is small enough that a direct contact route serves better than a help centre
- support content exists purely to substitute for an interface nobody wants to redesign

The most common product mistake is writing a help article to explain a confusing interface, rather than fixing the interface. Every article that explains a screen is a design defect with documentation attached.

---

# User Goal

The user is answering three questions in order:

```
Is there a fast answer to this?

↓

If not, can I reach someone who knows?

↓

Is my problem actually being worked on?
```

The third question is where support experiences fail most often.

A user who has submitted a ticket and heard nothing assumes they have been ignored, regardless of what is happening internally.

---

# User Journey

```
Encounters a problem inside the product

↓

Opens support from where the problem occurred

↓

Reads or searches for an answer

↓

Follows guided troubleshooting for their specific case

↓

Resolves it, or escalates with context already captured

↓

Creates a ticket with the problem described once

↓

Receives acknowledgement with a real expectation

↓

Tracks progress and replies without losing history

↓

Confirms resolution and returns to work
```

The escalation step must never require the user to re-describe what they already told the troubleshooter.

---

# UX Flow

## Entry

Support is reached three ways, and all three must carry context:

- a persistent help entry point in the app shell, available on every screen
- contextual help from the screen where the problem occurred, scoped to that screen
- a direct link from an error state, carrying the error reference

Contextual entry is the highest-value path. A user who opens help from the billing screen should see billing content first, not a generic index.

```
Help · Billing
```

An error state must offer help with its reference already attached:

```
⚠  We couldn't process that payment.
   [ Get help with this ]   ref PAY-8841
```

---

## Find

Support content is found by search first and browsed second, because a stuck user has a specific question.

```
Search across articles

↓

Direct answer for common questions

↓

Article

↓

Guided troubleshooter

↓

Contact
```

Rules:

- search matches article titles, body content, and the words users actually use, not only the product's internal vocabulary
- results show the article type: explanation, step-by-step, or troubleshooter
- the most-viewed articles for the user's current context appear before any query is typed
- every result shows when it was last updated, because a stale article about a changed interface is worse than no article

---

## Read

Articles are written to be scanned by someone in a hurry.

Requirements:

- the first sentence states what the article resolves
- steps are numbered and each step contains one action
- screenshots reflect the current interface, and each carries a date or version
- prerequisites are stated before step one, not discovered at step four
- the article ends with a resolution check and an escalation route

Every article must end with the same two questions:

```
Did this solve your problem?
[ Yes ]   [ No, get help ]
```

"No" is the most valuable signal in the support system, and it must lead somewhere useful rather than to a satisfaction survey.

---

## Troubleshoot

Guided troubleshooting is a decision tree that narrows the problem and collects context as it goes.

```
Symptom selection

↓

Narrowing question

↓

Automated check where possible

↓

Suggested fix

↓

Verification

↓

Resolved · or · escalate with everything gathered
```

Rules:

- each step asks exactly one question, in the user's language, not the system's
- where the product can check something itself, it checks rather than asking: connection status, plan entitlement, permission level, recent error events
- automated checks state what they found, including when they found nothing wrong
- three to five steps maximum before escalation is offered, because a longer tree feels like an obstacle course
- back is always available and preserves prior answers
- escalation is offered at every step, never only at the end

A troubleshooter that cannot be exited to a human is a maze, and users learn to skip it entirely.

---

## Escalate

Escalation is a transition, not a restart.

Everything gathered during troubleshooting is carried into the ticket and shown to the user before submission, so they can correct it.

```
We'll include:
· Screen: Billing › Payment methods
· Error: PAY-8841 at 14:02
· Plan: Pro, 8 seats
· Browser: Chrome 141 on Windows
· Your answers: card declined, tried twice

[ Edit what's included ]
```

The user must be able to see and edit what is attached. Silent diagnostic collection is a privacy failure even when the data is benign.

---

## Create

The ticket form asks for the minimum that support genuinely needs.

Required:

- a subject, prefilled from the troubleshooter where possible
- a description, prefilled with the answers already given
- a category, preselected from the entry context

Optional:

- attachments
- preferred contact method where more than one is offered

Never ask for information the product already knows: account identifier, plan, version, browser, or the screen the user came from.

---

## Track

After submission the user needs certainty, not gratitude.

Acknowledgement must state:

- the reference
- what happens next
- when to expect a reply, as a real commitment
- where to see it again

```
Ticket #4471 created

A billing specialist will reply by
tomorrow 14:00.

We'll email you and it'll appear in
Help › My requests.

[ View request ]
```

"Thanks, we'll be in touch" is not an expectation. It is an evasion.

---

## Resolve

Resolution is confirmed by the user, not declared by the system.

A ticket marked resolved by staff stays reopenable for a stated period, and the user is told how long.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ‹  Help                  │
├──────────────────────────┤
│ 🔍 What do you need help  │
│    with?                  │
├──────────────────────────┤
│ ABOUT THIS SCREEN        │
│ ▸ Adding a payment card  │
│ ▸ Why a card is declined │
│ ▸ Changing your plan     │
├──────────────────────────┤
│ MY REQUESTS · 1 open     │
│ ▸ #4471 Card declined    │
│   Waiting on support     │
│   Reply by 14:00 tomorrow│
├──────────────────────────┤
│ POPULAR                  │
│ ▸ Reset your password    │
│ ▸ Export your data       │
├──────────────────────────┤
│ [ Contact support ]      │
│ Usually replies in 4h    │
└──────────────────────────┘
```

Troubleshooter:

```
┌──────────────────────────┐
│ ‹  Card declined   2 of 4│
│    ▓▓▓▓▓▓▓░░░░░░░        │
├──────────────────────────┤
│ We checked your account  │
│ ✓ Your plan is active    │
│ ✓ Billing address is set │
│ ⚠ Last charge failed at  │
│   14:02 today            │
├──────────────────────────┤
│ What did your bank say?  │
│                          │
│ ○ Insufficient funds     │
│ ○ Card blocked           │
│ ○ I haven't checked      │
│ ○ Something else         │
├──────────────────────────┤
│ [ Continue ]             │
│ Back  ·  Talk to support │
└──────────────────────────┘
```

Ticket thread:

```
┌──────────────────────────┐
│ ‹  #4471 Card declined   │
│    Waiting on support    │
│    Reply by 14:00 tomor. │
├──────────────────────────┤
│ You · yesterday 14:06    │
│ My card keeps getting    │
│ declined on the Pro plan.│
│ 📎 screenshot.png        │
├──────────────────────────┤
│ Ada · support · 16:20    │
│ Thanks — I can see the   │
│ failed charge. Can you   │
│ confirm the last 4       │
│ digits of the card?      │
├──────────────────────────┤
│ [ Write a reply        ] │
│ 📎 Attach                │
├──────────────────────────┤
│ [ This is resolved ]     │
└──────────────────────────┘
```

Mobile rules:

- contextual articles for the current screen appear before popular articles
- open requests appear above browse content, because an existing ticket is more urgent than a new question
- each request shows its status and its next-reply expectation in the list, so opening it is not required to know where it stands
- the troubleshooter is one question per screen with progress visible
- escalation is present on every troubleshooter screen as a secondary action
- the reply composer is pinned above the keyboard with the attach control beside it
- contact support states the current expected response time, not a generic promise

---

## Tablet

```
┌────────────────────────────────────────────┐
│ ‹ Help                              🔍     │
├──────────────────┬─────────────────────────┤
│ Browse           │ ABOUT THIS SCREEN       │
│ Getting started  │ ▸ Adding a payment card │
│ Billing          │ ▸ Why a card is declined│
│ Account          │                         │
│ Integrations     │ MY REQUESTS · 1 open    │
│                  │ #4471 Card declined     │
│ My requests · 1  │ Reply by 14:00 tomorrow │
│                  │                         │
│ Contact          │ POPULAR                 │
│ Replies in ~4h   │ ▸ Reset your password   │
└──────────────────┴─────────────────────────┘
```

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Help centre                    🔍 Search help                │
├───────────────────┬──────────────────────────────────────────┤
│ BROWSE            │ Why a card is declined                   │
│ Getting started   │ Updated 12 days ago · 3 min read         │
│ Billing           │                                          │
│ Account           │ This explains the four reasons a card is │
│ Integrations      │ declined and how to fix each one.        │
│ Data & privacy    │                                          │
│                   │ Before you start                         │
│ MY REQUESTS       │ You'll need access to the card and your  │
│ #4471 Open        │ bank's app or statement.                 │
│   Reply by 14:00  │                                          │
│ #4318 Resolved    │ 1. Check the card hasn't expired          │
│                   │    Billing › Payment methods shows the   │
│ CONTACT           │    expiry date beside each card.         │
│ Replies in ~4h    │                                          │
│ Mon–Fri 08:00–18:00│ 2. Confirm the billing address matches   │
│ [ Contact support]│    ...                                   │
│                   │                                          │
│                   │ ──────────────────────────────────────── │
│                   │ Did this solve your problem?             │
│                   │ [ Yes ]   [ No, get help ]               │
│                   │                                          │
│                   │ RELATED                                  │
│                   │ ▸ Changing your payment method           │
│                   │ ▸ Understanding failed payment retries   │
└───────────────────┴──────────────────────────────────────────┘
```

Desktop rules:

- a persistent left rail holding browse categories, open requests, and the contact route with real availability hours
- article content capped at a readable measure of roughly 70 characters per line
- the resolution check sits at the end of every article, in the same position every time
- extra width buys related articles and request status visibility, not wider text lines

---

# Component Hierarchy

```
SupportExperience
├── SupportEntryPoint
│   ├── HelpTrigger              app shell
│   ├── ContextualHelpTrigger    per screen
│   └── ErrorStateHelpLink       carries reference
├── SupportHome
│   ├── SupportSearch
│   ├── ContextualArticleList
│   ├── OpenRequestSummary
│   │   └── RequestSummaryRow ×n
│   │       ├── RequestReference
│   │       ├── RequestSubject
│   │       ├── RequestStatus
│   │       └── NextReplyExpectation
│   ├── PopularArticleList
│   └── ContactPanel
│       ├── AvailabilityNotice
│       ├── ResponseTimeNotice
│       └── ContactAction
├── ArticleView
│   ├── ArticleHeader
│   │   ├── Title
│   │   ├── LastUpdated
│   │   └── ReadingTime
│   ├── PrerequisiteBlock
│   ├── ArticleBody
│   │   ├── StepList
│   │   └── AnnotatedScreenshot
│   ├── ResolutionCheck
│   │   ├── ResolvedAction
│   │   └── EscalateAction
│   └── RelatedArticles
├── Troubleshooter
│   ├── TroubleshooterProgress
│   ├── AutomatedCheckPanel
│   │   └── CheckResult ×n
│   ├── TroubleshooterQuestion
│   │   └── AnswerOption ×n
│   ├── SuggestedFix
│   ├── VerificationStep
│   └── TroubleshooterActions
│       ├── ContinueAction
│       ├── BackAction
│       └── EscalateAction
├── TicketComposer
│   ├── CategorySelect
│   ├── SubjectField
│   ├── DescriptionField
│   ├── AttachmentUploader
│   │   ├── AttachmentRequirements
│   │   ├── AttachmentItem ×n
│   │   └── AttachmentError
│   ├── DiagnosticContextPanel
│   │   ├── ContextItem ×n
│   │   └── EditContextAction
│   └── SubmitAction
├── RequestList
│   └── RequestRow ×n
└── RequestThread
    ├── ThreadHeader
    │   ├── StatusBadge
    │   └── ExpectationNotice
    ├── ThreadMessage ×n
    │   ├── AuthorLabel
    │   ├── Timestamp
    │   ├── MessageBody
    │   └── MessageAttachments
    ├── ReplyComposer
    ├── ResolveAction
    └── ReopenAction
```

Reuse rules:

- `SupportSearch` is the product's standard search input with a help scope, not a separate search implementation.
- `AttachmentUploader` is the product's standard uploader, so its size limits, progress, and error handling match the rest of the product.
- `RequestSummaryRow` and `RequestRow` share one status component, so a status can never render differently in two places.

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

## Opening Contextual Help

1. Help opens as a panel over the current screen, never a new tab, so the user does not lose their place.
2. The panel shows articles scoped to the current screen first, with the scope named.
3. The user's current screen and any active error reference are captured for later escalation.
4. Closing the panel returns the user exactly where they were, with any form state intact.

## Searching Help

1. Suggestions appear after a 150ms debounce and are grouped by article type.
2. Each result shows its last-updated date, so the user can judge freshness.
3. Zero results never dead-ends; it offers the contact route with the query attached as the subject.
4. The count and query are announced politely.

```
No articles match "invoice says pending forever".

[ Contact support about this ]
We'll include your search so you don't retype it.
```

## Running The Troubleshooter

1. Automated checks run first and report what they found, including negative findings.
2. Each question presents three to five plain-language options plus an escape option such as "Something else".
3. Answers are stored as they are given, so back never loses them.
4. A suggested fix is followed by a verification question, because an untested fix is not a resolution.
5. If verification fails, the troubleshooter escalates rather than looping the user back to the start.

```
✓ Your plan is active
✓ Billing address is set
⚠ Last charge failed at 14:02 today
  Reason from your bank: do not honour
```

Reporting a negative check builds trust. "We checked and your plan is fine" removes a worry the user was carrying.

## Escalating

1. Escalation opens the composer with subject, category, and description prefilled from the troubleshooter.
2. Diagnostic context is listed explicitly with an edit control.
3. The user can remove any context item, and the interface does not warn or nag when they do.
4. Submission requires no re-entry of anything already provided.

## Attaching A File

1. Requirements are stated before the picker opens.

```
PNG, JPG, PDF, or LOG · up to 10 MB each · 5 files maximum
```

2. Client-side validation rejects an invalid file immediately, naming the real problem and the real size.
3. Upload shows determinate progress per file and can be cancelled per file.
4. A failed attachment does not block the ticket. The user is offered submission without it.

```
┌──────────────────────────────┐
│ ⚠  screen-recording.mov      │
│    couldn't be attached      │
│                              │
│    It's 42 MB. The limit is  │
│    10 MB per file.           │
│                              │
│    [ Choose another file ]   │
│    [ Send without it ]       │
│                              │
│ Your message is saved.       │
└──────────────────────────────┘
```

Losing a written description because an attachment failed is the most avoidable failure in this pattern, and it must be impossible.

## Submitting A Ticket

1. The submit action shows progress on itself and cannot be triggered twice.
2. Success returns the reference, the expectation, and the location where the request can be found.
3. Failure preserves the entire composer including uploaded attachments, and states the cause.
4. The user is offered an alternative channel when submission repeatedly fails, because a broken ticket system must not trap a stuck user.

```
┌──────────────────────────────┐
│ ⚠  We couldn't send your     │
│    request. Everything you   │
│    wrote is still here.      │
│                              │
│    [ Try again ]             │
│    Email support@example.com │
└──────────────────────────────┘
```

## Tracking A Request

1. Status is stated in the user's terms, not the internal workflow's: "Waiting on support", "Waiting on you", "Resolved".
2. "Waiting on you" is visually distinct, because it is the only status requiring action.
3. Every status carries its next expectation with a real time.
4. New replies arrive by notification and update the thread without a manual refresh.
5. Full history is preserved and visible, including what the user originally submitted.

```
Status  Waiting on you
Ada asked a question 3 hours ago.
Requests with no reply for 7 days are closed automatically.
```

## Replying

1. The composer supports text and attachments with the same rules as creation.
2. A draft reply is preserved locally until sent, so a navigation or a connection loss does not destroy it.
3. Sending appends the message optimistically and marks it as sending until confirmed.
4. A failed send keeps the text in the composer and offers retry.

## Resolving And Reopening

1. Only the user marks their own request resolved from their side.
2. When staff resolve it, the user is told and given a reopen window with an exact deadline.
3. Reopening continues the same thread rather than creating a new request, so history is not fragmented.

```
Ada marked this resolved.
You can reopen it until 12 Aug.

[ This is still a problem ]   [ That's fixed, thanks ]
```

---

# States

Each region owns its states. A failed article load must not hide open requests.

## Loading — First Visit

Contextual articles and open requests load in parallel; neither blocks the other.

```
Article row    → title bar + 30% width meta bar ×3
Request row    → reference bar + subject bar + status pill frame
Contact panel  → availability bar + button frame
```

The contact action renders immediately from static configuration, because a user in trouble must never wait to find the way to a human.

---

## Loading — Article

```
Title          → 60% width bar
Meta           → two short bars
Body           → 8 bars at varying widths
```

Reserve the resolution check position so it does not appear suddenly beneath the user's reading position.

---

## Loading — Automated Checks

Checks are announced as they run, with results appearing progressively.

```
Checking your account…
✓ Your plan is active
◐ Checking recent payments…
```

If a check exceeds 5 seconds, say so and allow the user to skip it: "This is taking a while. [ Skip and continue ]".

---

## Loading — Ticket Submission

```
[  Sending your request…    ]
```

Attachments show their own progress. Nothing is cleared until the reference is returned.

---

## Empty — No Requests Yet

```
┌──────────────────────────────┐
│ You haven't asked us          │
│ anything yet                  │
│                              │
│ When you contact support,      │
│ your requests appear here      │
│ with their status.             │
│                              │
│ [ Browse help articles ]      │
└──────────────────────────────┘
```

---

## Empty — Help Search Found Nothing

Never a dead end. The query becomes the ticket subject.

```
No articles match "invoice says pending forever".

Support can look at this directly.
[ Contact support about this ]
We'll include your search so you don't retype it.
```

---

## Empty — No Contextual Articles For This Screen

Fall back to the category rather than showing an empty section.

```
Nothing specific to this screen yet.
[ Browse billing help ]   [ Contact support ]
```

---

## Empty — Filtered Request List

```
No resolved requests in the last 30 days.

[ Show all requests ]   [ Clear filter ]
```

---

## Error — Article Failed To Load

```
┌──────────────────────────────┐
│ ⚠  We couldn't load this      │
│    article.                   │
│    [ Retry ]                  │
│    [ Contact support ]        │
└──────────────────────────────┘
```

The escalation route is always present in an error state, because a user who cannot read the answer still needs the answer.

---

## Error — Automated Check Failed

State that the check could not run, and continue rather than blocking.

```
⚠ We couldn't check your payment history.
  Support will look at it. Continuing anyway.
```

A failed diagnostic must never stop a user from reaching help.

---

## Error — Attachment Failed

Distinguish the causes, because each has a different fix:

- too large: state the file size and the limit, offer another file or submission without it
- wrong type: name the accepted types and the type provided
- upload interrupted: retry the same file, keeping its position in the list
- rejected by scanning: state that it was rejected and offer an alternative such as pasting text

In every case the written message is preserved.

---

## Error — Ticket Submission Failed

The composer is preserved in full, including attachments already uploaded, and an alternative channel is offered after a second failure.

---

## Error — Request Thread Failed To Load

Show what is known from the request summary rather than an empty screen.

```
┌──────────────────────────────┐
│ #4471 · Waiting on support   │
│                              │
│ We can't load the messages   │
│ right now.                   │
│                              │
│ [ Retry ]                    │
│ Reply by 14:00 tomorrow      │
└──────────────────────────────┘
```

---

## Partial — Support Outside Hours

State the real situation and the real consequence, and still accept the request.

```
Support is offline until Monday 08:00.

You can send this now and it'll be
first in the queue.

[ Send request ]
```

Never hide the contact route outside hours. A user with a problem at 23:00 still needs to record it.

---

## Partial — Response Time Elevated

Honesty about delay costs less than silence.

```
Replies are taking about 12 hours today,
longer than our usual 4.
```

---

## Partial — Article Out Of Date

When an article is known to lag a released change, label it rather than removing it.

```
⚠ This article describes the previous billing screen.
  We're updating it. The steps still apply.
```

---

## Success — Ticket Created

```
┌──────────────────────────────┐
│ ✓ Request #4471 sent         │
│                              │
│ A billing specialist will    │
│ reply by 14:00 tomorrow.     │
│                              │
│ We'll email ada@example.com  │
│ and it's in Help › My        │
│ requests.                    │
│                              │
│ [ View request ]             │
│ [ Back to billing ]          │
└──────────────────────────────┘
```

Every success confirmation returns the user to what they were doing, not to a support dead end.

---

## Success — Self-Resolved

When the user marks an article as solving their problem, close the loop and return them to work.

```
Glad that worked.
[ Back to billing ]
```

Do not follow a successful resolution with a satisfaction survey. The user came to solve a problem, not to be interviewed.

---

## Permission-Limited — Account-Level Issues

When a request concerns something only an owner can authorise, say so and route it rather than refusing it.

```
Billing changes need a workspace owner.

We'll copy Dana Okoro on this request
so they can approve it.
```

---

# Mobile Behavior

- Touch targets minimum 44×44 for article rows, answer options, request rows, and attach controls.
- Contextual help opens as a full-height sheet over the current screen, preserving underlying form state.
- One troubleshooter question per screen with visible progress; answer options are full-width rows, not compact radio buttons.
- Escalation is a secondary action on every troubleshooter screen, always reachable with the thumb.
- The reply composer is pinned above the keyboard with the attach control beside it and the send control always visible.
- Attachments offer camera, screenshot library, and file sources, and upload continues if the app is backgrounded.
- Draft replies persist locally, so a call or an app switch cannot destroy them.
- Request status and next-reply expectation are visible in the list, so opening the thread is not required to know where things stand.
- New replies arrive by push notification and deep-link into the correct thread.
- Long articles offer an in-page contents list, because scrolling a phone through twelve steps loses the reader's place.

---

# Desktop Expansion

Added space is spent on:

- a persistent rail holding browse categories, open requests, and contact availability at once
- article content at a readable measure with related articles adjacent rather than below
- the troubleshooter beside the article that prompted it, so context is not lost
- request threads with the original submission and diagnostic context visible alongside the conversation
- keyboard operation: `/` focuses help search, Enter opens a result, Escape closes the help panel

Added space is never spent on:

- article text stretched across the full viewport width
- a chat widget that covers the primary action of the underlying screen
- promotional content inside the help centre
- an animated assistant that intercepts every query before the search field

---

# Accessibility Requirements

- The help panel is a dialog with an accessible name, traps focus while open, closes on Escape, and returns focus to the trigger that opened it.
- Article structure uses real heading levels in order, so a screen reader user can navigate by heading rather than reading linearly.
- Steps are ordered lists, so position and total are announced.
- Screenshots have alternative text describing what the reader must find, not the file name: "The Payment methods list, with the expiry date shown beside each card."
- Any information conveyed only by a screenshot is also written as text, because an image is not an instruction for someone who cannot see it.
- Troubleshooter progress is announced as text, "Step 2 of 4", and exposed via `role="progressbar"`.
- Answer options are a radio group with a group label repeating the question.
- Automated check results are announced politely as they complete, each naming the check and its outcome.
- Ticket submission success is announced politely with the reference; submission failure is announced assertively because the user is waiting.
- Attachment progress is exposed as a progressbar with a text percentage, and attachment failures are announced assertively.
- Request status uses text and an icon, never colour alone, so "Waiting on you" survives greyscale.
- New messages arriving in an open thread are announced politely, with the author and time.
- The reply composer's send control is never the only focusable element below a long thread; a skip link reaches it directly.
- At 200% zoom the rail collapses to the mobile list, article text reflows without horizontal scroll, and the composer remains visible.
- Reduced motion removes panel slide animation, progress pulses, and message-arrival transitions.

---

# Data Requirements

Before implementation, confirm for the support system:

```
Article source, ownership, and review cadence

Last-updated date exposed per article

Which product version each article describes

Search index scope and whether user-facing synonyms are mapped

Troubleshooter tree source and who maintains it

Which automated checks are possible, and what each reads

Exactly what diagnostic context is collected and shown to the user

Ticket categories and their routing rules

Response time commitment per category and how it is measured

Business hours, holidays, and time zone basis

Attachment types, per-file limit, count limit, and scanning policy

Retention period for tickets and attachments

Auto-close policy and its notice period

Reopen window after resolution

Which roles may see and act on a workspace's requests
```

A response time displayed to a user is a commitment. It must be derived from measured performance, not from an aspiration.

Diagnostic context must be enumerable and reviewable by the user before submission. Anything collected silently must be documented in the privacy policy and disclosed in the interface.

---

# Performance Requirements

- The contact route renders from static configuration in the first paint, before any content loads.
- Help search returns within 300ms; article content within one second.
- Contextual articles and open requests load in parallel requests, so neither blocks the other.
- Automated checks run concurrently with a 5 second ceiling each, after which the check is reported as unavailable and the flow continues.
- Attachments validate client-side before any bytes are sent.
- Attachment uploads are independent, so one failure does not cancel the others.
- Draft ticket and reply text is persisted locally on every pause in typing, so no crash or navigation loses it.
- Thread updates arrive by push or a persistent connection, not an interval poll.
- Article content is cached for offline reading where the platform allows it, because connectivity problems are themselves a support category.

---

# Anti-Patterns

Never build:

- a help centre with no visible route to a human
- a chatbot that must be defeated before a ticket can be created
- a troubleshooter with no escalation until the final step
- an article that ends with a satisfaction rating instead of an escalation route
- escalation that requires re-describing a problem already described to the troubleshooter
- diagnostic data collected silently with no disclosure or edit control
- a ticket form asking for account, plan, version, or browser the product already knows
- an attachment failure that discards the written message
- "Thanks, we'll be in touch" with no time commitment
- internal workflow statuses such as "Tier 2 triage" shown to users
- a "Waiting on you" status that looks identical to "Waiting on support"
- a resolved ticket the user cannot reopen
- a reopen that creates a new ticket and orphans the history
- articles with no last-updated date
- screenshots of an interface that no longer exists
- a help article written to explain a screen that should have been redesigned
- contact routes hidden outside business hours
- an unacknowledged support backlog, with the usual response time still displayed
- a chat widget that covers the primary action of the screen behind it
- auto-close with no notice to the user
- support content that opens in a new tab, losing the user's unsaved work

---

# Pattern Output Example

```
Product

Multi-Tenant Studio Operations Platform


Primary Question

Can I fix this myself, and if not, who will?


Entry Points

App shell trigger · per-screen contextual help · error-state deep link


Context Carried

Screen path, error reference, plan, role, browser, troubleshooter answers


Content Types

Explanations · step-by-step guides · guided troubleshooters


Article Requirements

Last-updated date, prerequisites first, resolution check at end


Troubleshooter Depth

Maximum 5 steps, escalation offered on every step


Automated Checks

Plan status, permission level, recent error events, payment history


Escalation Model

Prefilled composer, context listed and editable, no re-description


Attachments

PNG, JPG, PDF, LOG · 10 MB per file · 5 files · message never lost on failure


Response Commitment

Billing 4h, technical 8h, measured and displayed, elevated times disclosed


Status Vocabulary

Waiting on support · Waiting on you · Resolved


Auto-Close

7 days without user reply, with notice in the thread


Reopen Window

14 days after resolution, same thread preserved


Out Of Hours

Contact remains open, queue position stated


Mobile

Full-height help sheet, one question per screen, pinned composer, push updates


Accessibility

Heading-navigable articles, text step progress, greyscale-safe statuses


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] A route to a human is visible from every support screen, including error states
- [ ] Contextual help shows content for the current screen first, with the scope named
- [ ] Help opens without losing the user's place or unsaved work
- [ ] Error states link to help with their reference attached
- [ ] Every article shows a last-updated date
- [ ] Every article states prerequisites before step one
- [ ] Every article ends with a resolution check offering escalation
- [ ] Screenshots match the current interface and their content is also written as text
- [ ] The troubleshooter asks one question per step in plain language
- [ ] Automated checks report negative findings as well as problems
- [ ] A failed automated check does not block progress
- [ ] Escalation is available on every troubleshooter step
- [ ] Escalation prefills the ticket and requires no re-description
- [ ] Diagnostic context is listed and editable before submission
- [ ] The composer never asks for data the product already holds
- [ ] Attachment requirements appear before the file picker
- [ ] Each attachment failure cause has its own message and fix
- [ ] An attachment failure never discards the written message
- [ ] Submission failure preserves the entire composer and offers an alternative channel
- [ ] Acknowledgement states reference, next step, and a real time commitment
- [ ] Request status uses user-facing language, not internal workflow terms
- [ ] "Waiting on you" is visually and textually distinct
- [ ] Status and next expectation are visible in the request list
- [ ] Replies arrive without a manual refresh
- [ ] Draft replies survive navigation and connection loss
- [ ] Resolved requests can be reopened in the same thread within a stated window
- [ ] Auto-close is disclosed in the thread before it happens
- [ ] Help search zero-results offers contact with the query attached
- [ ] Contact remains available outside business hours with queue expectation
- [ ] Elevated response times are disclosed
- [ ] Statuses survive greyscale
- [ ] 200% zoom reflows articles without horizontal scroll
- [ ] Reduced motion removes panel and message animation

---

# Final Rule

Support succeeds when a stuck user becomes unstuck in the fewest steps, and always knows who is working on their problem.

Every element must justify itself against one question:

Does this get the user closer to a resolution, or does it only delay the moment they reach a person?

A support system that optimises for deflection rather than resolution is not saving cost. It is deferring it into churn.
