# Contact Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Forms System, Forms Component, Feedback System, Landing Page Intelligence, Mobile First, Accessibility Intelligence

---

# Purpose

The Contact Pattern defines the complete solution for the screen where a stranger decides to start a conversation with the business.

A contact page is not a form. It is a routing decision followed by a promise.

The user arrives with an intent the business has not yet identified: they want to buy, they need help, they are applying for a job, or they are reporting that something is broken. Every one of those intents needs a different destination, a different set of fields, and a different response time.

A contact page succeeds when the message reaches the right person and the sender knows when to expect a reply.

---

# When To Use

Use this pattern when:

- the business needs a general inbound channel for people without an account
- multiple intents arrive through the same door and must be routed
- enquiries convert into work, so the message quality matters
- a legal or regulatory requirement demands a reachable contact method
- users need a human when self-service has failed

---

# When Not To Use

Do not use this pattern when:

- the user has an account and a specific problem — use an in-product support flow with their context attached
- the goal is a qualified sales enquiry with defined criteria — use a lead qualification flow
- the only realistic action is a scheduled call — use the Booking Pattern
- an answer already exists in documentation — surface search before a form
- the business will not read the inbox

The most common product mistake is a contact form used as a substitute for a support process. A form with no owner and no service level trains users that the business does not reply, and they stop trying.

---

# User Goal

The primary goal is always one of five:

```
Get a question answered before I commit

↓

Report something broken and be believed

↓

Start a commercial conversation

↓

Reach a human because self-service failed

↓

Verify this business is real and reachable
```

The last goal is silent and frequently the most common. Many visitors open the contact page only to confirm a physical address, a phone number, and that the business exists.

Serve that goal with visible details, not with a form.

---

# User Journey

```
Fails to find an answer, or decides to enquire

↓

Opens the contact page

↓

Chooses the channel that matches urgency

↓

Identifies their intent

↓

Writes the message

↓

Submits and receives immediate acknowledgement

↓

Receives a confirmation to their inbox

↓

Receives a reply within the promised window

↓
Continues the conversation in one thread
```

The acknowledgement and the promised window are the parts products omit.

A form that responds with "Thanks, we will be in touch" and no timeframe leaves the user unsure whether to wait or to phone, and many will do both.

---

# UX Flow

## Entry

The user arrives from:

- the footer, with a general question
- a pricing page, with a commercial question and high intent
- a help article, having failed to solve their problem
- an error state, reporting a fault
- a search engine, looking for a phone number or address

Entry context must pre-select the intent. A user arriving from a pricing page should land with "Sales enquiry" already chosen, not with an unset dropdown.

---

## Choose Channel

Show every available channel with its real characteristics before the form.

```
Channel

↓

Expected response time

↓

Availability hours

↓

What it is best for
```

Rules:

- Order channels by speed, fastest first, and state the trade-off honestly.
- Never present a channel that is unattended. An unanswered phone number costs more trust than no phone number.
- State timezone and business hours next to any synchronous channel.
- If a channel is currently outside its hours, say so and say when it reopens.

---

## Declare Intent

Routing happens before writing, not after.

```
Intent selection

↓

Fields adapt to the intent

↓

Relevant self-service answer offered

↓

Message composed
```

Rules:

- Maximum six intents. More than six becomes a menu the user has to study.
- Each intent has a plain-language label describing the user's situation, not the internal team name. "Something is not working" beats "Tier 2 Escalation".
- Selecting an intent may add at most two fields. A form that grows by eight fields punishes the honest answer.
- Where a chosen intent has a common self-service resolution, offer it inline before the message field, without blocking the form.

---

## Compose

Ask for the minimum required to reply and to route.

```
Name

↓

Email

↓

Message

↓

At most two intent-specific fields
```

Rules:

- Every additional field measurably reduces submissions. Each one must be defensible as necessary to reply.
- Phone is optional unless the intent is a callback request.
- Company, budget, and job title belong in a qualification flow, not a general contact form.
- Give the message field a prompt that raises quality: "What are you trying to do, and what happened instead?"

---

## Submit

```
Immediate visual acknowledgement

↓

On-screen confirmation with reference and timeframe

↓

Email confirmation containing a copy of the message

↓
Route to the responsible queue
```

The email copy matters. A user who receives their own words back knows the message arrived and can forward it if the reply never comes.

---

## Recover

Failure must never cost the message.

```
Submission fails

↓

Message preserved in the field and in local storage

↓

Reason stated

↓

Retry offered

↓

Direct email address offered as a fallback
```

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ Contact us               │
│ We reply within one       │
│ business day.            │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ 📞 Call              │ │
│ │ +254 700 000 000     │ │
│ │ Mon–Fri 9:00–17:00   │ │
│ │ EAT · open now       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ✉ Email              │ │
│ │ hello@example.com    │ │
│ │ Replies in ~4 hours  │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Or send a message        │
│                          │
│ What is this about?      │
│ ┌──────────────────────┐ │
│ │ Choose one         ▾ │ │
│ └──────────────────────┘ │
│                          │
│ Name                     │
│ ┌──────────────────────┐ │
│ └──────────────────────┘ │
│ Email                    │
│ ┌──────────────────────┐ │
│ └──────────────────────┘ │
│ Message                  │
│ ┌──────────────────────┐ │
│ │ What are you trying  │ │
│ │ to do, and what      │ │
│ │ happened instead?    │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │    Send message      │ │
│ └──────────────────────┘ │
│ We never share your      │
│ details.                 │
├──────────────────────────┤
│ 12 Riverside Drive       │
│ Nairobi, Kenya           │
│ [ Open in Maps ]         │
└──────────────────────────┘
```

Mobile rules:

- Direct channels appear above the form. On a phone, tapping a number is faster than typing a message, and the phone number is what most mobile visitors came for.
- Phone numbers are tap-to-call links; email addresses are tap-to-compose links; addresses open the native maps application.
- One field per row. Never place first name and last name side by side at this width.
- The message field is at least four visible lines, expanding as the user types.
- The submit button is full-width and sits above the keyboard fold when the message field is focused.
- No map embed on mobile. Ship an address plus a maps link; an interactive map hijacks scroll and costs bandwidth.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Contact us                                 │
│ We reply within one business day.          │
├─────────────────────────┬──────────────────┤
│ What is this about?     │ 📞 Call          │
│ [ Sales enquiry     ▾ ] │ +254 700 000 000 │
│                         │ Mon–Fri 9–17 EAT │
│ Name  [             ]   │                  │
│ Email [             ]   │ ✉ Email          │
│ Company [           ]   │ hello@example.com│
│                         │ ~4 hours         │
│ Message                 │                  │
│ ┌─────────────────────┐ │ 📍 Visit         │
│ │                     │ │ 12 Riverside Dr  │
│ │                     │ │ Nairobi          │
│ └─────────────────────┘ │ Open in Maps     │
│                         │                  │
│ [ Send message ]        │ Support hours    │
│ We never share your     │ Mon–Fri, EAT     │
│ details.                │                  │
└─────────────────────────┴──────────────────┘
```

---

## Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Contact us                                                   │
│ Tell us what you need. We reply within one business day.     │
├──────────────────────────────────┬───────────────────────────┤
│ What is this about?              │ FASTER OPTIONS            │
│ ● Sales enquiry                  │                           │
│ ○ Something is not working       │ 📞 +254 700 000 000       │
│ ○ Billing question               │    Mon–Fri 9:00–17:00 EAT │
│ ○ Partnership                    │    Open now               │
│ ○ Press                          │                           │
│ ○ Something else                 │ 💬 Live chat              │
│                                  │    Typically under 2 min  │
│ Name                             │                           │
│ [                              ] │ ✉ hello@example.com       │
│ Work email                       │    Replies in ~4 hours    │
│ [                              ] │                           │
│ Company (optional)               ├───────────────────────────┤
│ [                              ] │ VISIT                     │
│                                  │ 12 Riverside Drive        │
│ Message                          │ Nairobi, Kenya            │
│ ┌──────────────────────────────┐ │ Open in Maps              │
│ │ What are you trying to do,   │ │                           │
│ │ and what happened instead?   │ ├───────────────────────────┤
│ │                              │ │ Looking for help?         │
│ └──────────────────────────────┘ │ Search the help centre    │
│                                  │ Track an order            │
│ [ Send message ]                 │ Check system status       │
│ We reply to every message. We    │                           │
│ never share your details.        │                           │
└──────────────────────────────────┴───────────────────────────┘
```

Desktop rules:

- Two columns: the form on the left, channels and self-service on the right.
- Intents become radio buttons when there are six or fewer, because visible options are chosen faster than a collapsed select.
- Self-service routes sit in the rail, offering an exit for users whose question already has an answer.
- Never widen the message field beyond a comfortable reading measure; a very wide textarea discourages writing.

---

# Component Hierarchy

```
ContactPage
├── PageHeader
│   ├── Title
│   └── ResponsePromise
├── ChannelPanel
│   └── ChannelCard ×n
│       ├── ChannelIcon
│       ├── ChannelValue          tap-to-call / tap-to-email
│       ├── AvailabilityLabel
│       ├── ResponseTimeLabel
│       └── OpenNowIndicator
├── ContactForm
│   ├── IntentSelector            radios ≤6, select if more
│   ├── IntentHelperPanel         conditional self-service offer
│   ├── NameField
│   ├── EmailField
│   ├── PhoneField                conditional on intent
│   ├── IntentSpecificField ×≤2
│   ├── MessageField
│   │   └── PromptHelperText
│   ├── AttachmentField           conditional on intent
│   ├── ConsentCheckbox           unticked, separate from submit
│   ├── SpamGuard                 invisible by default
│   ├── FieldError ×n
│   ├── FormError
│   ├── PrivacyNote
│   └── SubmitAction
├── SelfServicePanel
│   ├── HelpSearchLink
│   ├── StatusPageLink
│   └── AccountActionLink ×n
├── LocationPanel
│   ├── AddressBlock
│   ├── MapsLink
│   └── HoursBlock
└── SubmissionConfirmation
    ├── ReferenceCode
    ├── ResponseWindow
    ├── MessageCopy
    ├── EscalationRoute
    └── ContinueBrowsingAction
```

Reuse rules:

- `ChannelCard` is one component. Phone, email, chat, and physical location are variants sharing availability and response-time logic.
- The form uses the product's standard field components so validation and error presentation match every other form in the product.
- The confirmation is a state of the page, not a separate route, so the browser back button never resubmits.

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

The sender knows the message arrived and when to expect a reply
```

## Selecting An Intent

1. Selection is immediate with no page reload.
2. Any intent-specific field appears directly beneath the selector, with a brief reason for its presence: "Order number — so we can find your order straight away."
3. Fields removed by changing intent retain their values in memory in case the user switches back.
4. Where the intent maps to a known self-service resolution, a single suggestion appears above the message field.

```
● Something is not working

  Most connection problems are resolved
  by checking the status page first.
  Check system status

  Continue with your message below.
```

The suggestion never blocks the form. Forcing a user through documentation before allowing contact is how support pages earn contempt.

## Writing The Message

1. The prompt text sits as helper text above the field, not as a placeholder that vanishes on focus.
2. No character counter unless a hard limit exists; a counter on an open question suppresses detail.
3. Where a limit exists, the counter appears only after 80% of the limit is used.
4. Content is saved to local storage as the user types, keyed to the page, so a crash or an accidental navigation does not destroy a long message.

## Submitting

1. The submit button shows "Sending…" with a spinner and cannot be pressed twice.
2. Fields become read-only rather than disabled, keeping their values announced.
3. The request carries a submission key so a retry cannot create a duplicate ticket.
4. On success, the form area is replaced in place by the confirmation, focus moves to the confirmation heading, and the local draft is cleared.
5. On failure, everything is preserved and a fallback email address is offered.

## Submission Failure

```
┌──────────────────────────────────────────┐
│ ⚠ Your message was not sent              │
│                                          │
│   Nothing was lost — your message is      │
│   still below.                            │
│                                          │
│   [ Try again ]                           │
│                                          │
│   Or email it directly to                 │
│   hello@example.com                       │
└──────────────────────────────────────────┘
```

The direct address is mandatory. A contact form that fails without offering an alternative has blocked the only channel the user was given.

## Handling Spam Without Punishing Humans

Spam defence is layered, and the layers are ordered by how much they cost a legitimate user.

```
Honeypot field, invisible, zero user cost

↓

Timing check, rejects sub-second submissions

↓

Server-side rate limit per address

↓

Content heuristics routed to a review queue, never rejected outright

↓

Challenge, only after a failed heuristic
```

Rules:

- Never show a challenge on first attempt. It taxes every honest sender to stop a bot that a honeypot already caught.
- Any challenge must have an accessible alternative path.
- Never silently discard a suspected message. Route it to a review queue and still show the sender a normal confirmation, because a false positive that vanishes is indistinguishable from a bug.
- Never require an account or a phone verification to send a first message.

## Outside Business Hours

1. Synchronous channels show a closed state with the reopening time in the visitor's timezone.
2. The form remains fully available and its response promise adjusts: "Sent outside our hours. We reply the next business morning."
3. Never hide the form outside hours.

```
┌──────────────────────────────────────────┐
│ 📞 +254 700 000 000                      │
│    Closed now · opens Monday 09:00       │
│    (10:00 your time)                     │
└──────────────────────────────────────────┘
```

---

# States

## Loading — First Visit

Most of a contact page is static content and must render immediately.

```
Header and promise  → immediate, real text
Channel cards       → immediate, with availability as a small skeleton
Form fields         → immediate and focusable
Open-now indicator  → resolves after the clock and hours are evaluated
```

The form is interactive in the first frame. Nothing about a contact form should wait on a network request.

If availability cannot be determined, show the hours as static text without a live open-or-closed claim, rather than blocking.

---

## Loading — Submitting

- The button label becomes "Sending…" with a spinner beside it.
- Fields read-only, values still visible.
- No overlay obscuring the message the user just wrote.
- Beyond five seconds add a line: "Still sending. Your message is safe."

---

## Empty — Untouched Form

The first state every visitor sees.

- No red styling and no error text anywhere before interaction.
- The intent selector has no pre-selected option unless entry context supplied one.
- Helper text sits under labels as neutral guidance.
- The submit button is enabled from the start; validity is decided on submit, not by pre-emptively disabling the only action on the page.

A disabled submit button with no explanation is the most common cause of an abandoned contact form.

---

## Empty — No Channels Configured

Reachable in a misconfigured deployment and must fail visibly rather than silently.

```
┌──────────────────────────────────────────┐
│ Send us a message                        │
│                                          │
│ The form below reaches our team          │
│ directly. We reply within one business   │
│ day.                                     │
└──────────────────────────────────────────┘
```

Never render an empty channel panel with headings and no values. Hide the panel entirely and keep the promise.

---

## Error — Field Level

```
Email
┌──────────────────────────────┐
│ ana@                         │
└──────────────────────────────┘
⚠ Enter a complete email address so we
  can reply.
```

Rules:

- Validate on blur only, never per keystroke.
- Once an error is shown, revalidate on input so it clears the moment the value is valid.
- State the consequence, not just the rule. "So we can reply" converts better than "Invalid format".
- Reserve the message space so nothing shifts.
- Never mark an optional field as an error for being empty.

---

## Error — Form Level

```
┌──────────────────────────────────────────┐
│ ⚠ 2 details need attention               │
│   · Choose what your message is about    │
│   · Enter a complete email address       │
└──────────────────────────────────────────┘
```

The summary sits above the form, receives focus, is announced assertively, and each item moves focus to its field.

---

## Error — Rate Limited

```
┌──────────────────────────────────────────┐
│ You have already sent 3 messages         │
│                                          │
│ We have them all and will reply to the   │
│ first one. Adding another will not make   │
│ it faster.                                │
│                                          │
│ Your reference: MSG-3318                 │
│ Need it urgently? Call +254 700 000 000  │
└──────────────────────────────────────────┘
```

Reassure rather than scold. Repeat submissions are a symptom of an unclear confirmation, not bad behaviour.

---

## Error — Attachment Rejected

```
Attachment
⚠ screenshot.tiff is not supported.
  Use PNG, JPG, or PDF, up to 10 MB each.
  [ Choose another file ]
```

Reject at selection time, never at submission, so the rejection does not cost the whole message.

---

## Partial / Stale Data

When the live availability of a channel cannot be determined:

```
📞 +254 700 000 000
   Usually Mon–Fri 9:00–17:00 EAT
```

Drop the confident "open now" claim rather than guessing. Telling a user a line is open when it is not is worse than telling them nothing.

Where the response promise is degraded by volume, say so honestly:

```
We are replying more slowly than usual.
Expect a reply within 2 business days.
```

---

## Success

```
┌──────────────────────────────────────────┐
│ ✓ Message sent                           │
│                                          │
│ Reference MSG-4471                       │
│                                          │
│ We reply within one business day. Your    │
│ reply will come from support@example.com  │
│ — add it to your contacts so it does not  │
│ land in spam.                             │
│                                          │
│ A copy has been sent to ana@example.com.  │
│                                          │
│ Urgent? Call +254 700 000 000             │
│ Mon–Fri 9:00–17:00 EAT                    │
│                                          │
│ [ Back to the homepage ]                  │
└──────────────────────────────────────────┘
```

Required on every confirmation: a reference code, a specific response window, the address the reply will come from, confirmation of where the copy was sent, and an escalation route for urgency.

A generic "Thanks for getting in touch" with none of these is the reason users submit the same message three times.

---

## Permission-Limited

When an intent requires an account, say so before the message is written, not after.

```
○ Billing question

  Billing enquiries need your account so we
  can verify the request.

  [ Sign in to continue ]
  Or choose "Something else" to reach us
  without signing in.
```

Always leave one route open for someone who cannot sign in, because being locked out is itself a common reason for contact.

---

# Mobile Behavior

- Touch targets minimum 44×44 for channel cards, radio options, and the submit button.
- Direct channels above the form; a phone number is the fastest resolution on a phone.
- Tap-to-call, tap-to-email, and native maps handoff on the relevant values.
- Correct input types: email for email, tel for phone, so the right keyboard appears.
- Autofill tokens on name, email, and phone so platform autofill completes the identity fields in one tap.
- The message field grows with content and never becomes a two-line scrolling box.
- The keyboard never covers the active field or its error message; the field and message scroll into view together.
- Draft is preserved in local storage against accidental navigation and app backgrounding.
- No embedded interactive map; an address plus a maps link is faster and does not capture scroll.
- No modal form. Modals collapse when the keyboard opens.

---

# Desktop Expansion

Added space is spent on:

- intents as visible radio options rather than a collapsed select
- channels and self-service routes in a persistent rail
- office details and hours visible alongside the form
- keyboard completion from the first field to submit without a mouse

Added space is never spent on:

- a full-width message textarea beyond a comfortable reading measure
- a large decorative map above the form
- a team photo grid pushing the form below the fold
- duplicate contact details repeated in three places on the page

---

# Accessibility Requirements

- Tab order is exactly visual order: channel links, intent options, identity fields, message, consent, submit.
- The intent selector is a grouped radio set with a fieldset legend, and arrow keys move between options.
- Every field has a persistent visible label, programmatically associated. Placeholder-only labelling is prohibited.
- Helper text is associated with its field so it is announced after the label.
- Optional fields are marked "optional" in the label text rather than marking required fields with a symbol that must be explained by a legend.
- Field errors are linked to their field so label, value, and error are announced together.
- The form-level error summary is focusable, announced assertively, and each item moves focus to its field.
- "Sending" and "Message sent" are announced via a polite live region; failures are announced assertively.
- On success, focus moves to the confirmation heading so the outcome is announced without the user hunting for it.
- Any spam challenge has a non-visual alternative path, and the form is never the only channel available to someone who cannot complete it.
- The open-or-closed indicator conveys state in text, not only by a coloured dot.
- All text meets 4.5:1; focus indicators meet 3:1 against both field and background.
- Error and success states carry an icon and text so they survive greyscale.
- Reduced motion: the confirmation replaces the form instantly with no slide or fade, and no animated success mark.
- At 200% zoom the two-column layout stacks with channels first, and no field or button is clipped.
- Phone numbers are marked up so they remain readable when linearised, and the number is written out in text rather than rendered as an image.

---

# Data Requirements

Before implementation, confirm:

```
Intent list and the owning team or queue for each


Response time commitment per intent and per channel


Business hours, timezone, and holiday calendar


Routing rule when an intent is ambiguous or "Something else"


Required fields per intent and the reply-critical justification for each


Reference code format and where the sender can quote it


Reply-from address and its deliverability configuration


Whether a copy is sent to the sender and what it contains


Spam thresholds, review queue destination, and false-positive handling


Rate limit per email address and per network address


Attachment types, size limits, and storage location


Retention period for submitted messages and personal data


Consent text for marketing, stored separately from the enquiry


Escalation path when the response window is missed


Whether an account is required for any intent, and the alternative route
```

The response time commitment must be a real operational number, not a marketing claim. A promise the business misses converts a solvable enquiry into a complaint.

Never publish a channel without a named owner. An unowned inbox is worse than no inbox.

---

# Performance Requirements

- The page is interactive in the first frame; a contact form has no legitimate reason to wait on JavaScript to become usable.
- The form submits and validates without requiring a heavy client framework; server-side validation is authoritative regardless.
- No third-party map, chat, or analytics script blocks first paint. Chat widgets load after the page is interactive and never cover the submit button.
- Availability evaluation happens locally against published hours, requiring no request.
- Attachments upload progressively with visible progress and can be removed during upload.
- Submission responds under two seconds at the median, with an extended-wait message beyond five.
- Spam challenge scripts load only when a challenge is actually required.
- Draft persistence writes to local storage with debouncing so typing never stutters.

---

# Anti-Patterns

Never build:

- a contact form with no owner and no response commitment
- "We will get back to you soon" with no timeframe
- a confirmation with no reference code
- a phone number published on an unattended line
- a submit button disabled until the form is valid, with no explanation
- validation firing on every keystroke while the user is still typing
- placeholder text as the only label
- an intent list of fifteen internal team names
- an intent selection that adds eight new fields
- company, budget, and job title on a general contact form
- required phone number when the reply will be by email
- a challenge shown to every sender on the first attempt
- a challenge with no accessible alternative
- silently discarding a suspected-spam message while showing a success screen with no record
- a submission failure that loses the message
- a submission failure with no direct email fallback
- hiding the form outside business hours
- an interactive map above the form on mobile
- a chat widget covering the submit button
- marketing consent pre-ticked or bundled into the send action
- a form that resubmits when the user presses the browser back button
- contact details rendered as an image
- three copies of the same phone number on one page

---

# Pattern Output Example

```
Product

Professional Services Website


Primary Goal

Route an enquiry to the right team with a stated reply time


Layout

Two columns on desktop, channels above form on mobile


Channels

Phone Mon–Fri 9:00–17:00 EAT, live chat under 2 minutes, email ~4 hours


Intents

Sales, Not working, Billing, Partnership, Press, Something else


Intent Fields

Not working adds order number; Billing requires sign-in with an open alternative


Self-Service Offer

Status page suggested for "Not working", never blocking


Message Prompt

"What are you trying to do, and what happened instead?"


Draft Safety

Local storage, debounced, cleared on success


Spam Defence

Honeypot, timing check, address rate limit, review queue, challenge only after heuristic failure


Failure Fallback

Message preserved plus direct address hello@example.com


Confirmation

Reference code, one business day window, reply-from address, copy to sender, phone escalation


Out Of Hours

Channels show reopening time in visitor timezone, form stays available


Mobile

Tap-to-call, autofill tokens, growing message field, no embedded map


Accessibility

Fieldset intents, assertive error summary, focus to confirmation heading, 200% zoom stacks


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every intent has a named owner and a response commitment
- [ ] The response window is stated before submission and repeated on confirmation
- [ ] Confirmation includes a reference code and the reply-from address
- [ ] A copy of the message is sent to the sender
- [ ] Direct channels appear above the form on mobile
- [ ] Phone, email, and address are tappable and handed off to native apps
- [ ] Channel availability shows timezone and current open state in text
- [ ] Out-of-hours state names the reopening time and keeps the form available
- [ ] Entry context pre-selects the intent where known
- [ ] Intent list is six or fewer with user-language labels
- [ ] Changing intent adds no more than two fields and preserves earlier values
- [ ] Every field is justified as necessary to reply
- [ ] Optional fields are labelled optional
- [ ] Submit is enabled from the start
- [ ] Validation runs on blur, clears on correction, and never shifts layout
- [ ] Field errors state the consequence, not only the rule
- [ ] Error summary receives focus and links to each field
- [ ] Draft persists against accidental navigation
- [ ] Attachments are validated at selection, not at submission
- [ ] Submission is duplicate-safe on retry
- [ ] Submission failure preserves the message and offers a direct address
- [ ] No challenge is shown before a heuristic fails
- [ ] Any challenge has an accessible alternative
- [ ] Suspected spam is routed to review, never silently discarded
- [ ] Rate-limit messaging reassures rather than scolds
- [ ] Restricted intents offer an alternative route for locked-out users
- [ ] Back button after success does not resubmit
- [ ] No third-party script blocks first paint or covers the submit button
- [ ] Success announcement moves focus to the confirmation heading
- [ ] 200% zoom stacks the layout with nothing clipped
- [ ] Reduced motion respected

---

# Final Rule

A contact page is a promise made in public, and the business is judged by whether it keeps it.

Every element must justify itself against one question:

Does this help the message reach the right person, or help the sender trust that it will?

If the answer is no, remove it.
