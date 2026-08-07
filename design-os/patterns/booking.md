# Booking Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Forms System, Feedback System, Cards Component, Mobile First, Layout Intelligence, Empty States System, Loading States System, Error States System

---

# Purpose

The Booking Pattern defines the complete solution for reserving a finite resource at a specific time.

Booking is not a form. It is a negotiation with scarcity.

The user is choosing from availability that other people are simultaneously consuming, which means the interface must handle the one thing ordinary forms never face: the correct answer can disappear while the user is typing.

A booking flow succeeds when the user leaves knowing three things without doubt: what was reserved, when it happens, and what to do if plans change.

---

# When To Use

Use this pattern when:

- a resource has finite capacity at a point in time
- two users cannot hold the same slot
- the reservation exists before the service is delivered
- the user may need to reschedule or cancel
- staff, rooms, equipment, or seats must be allocated

Typical cases: appointments, consultations, classes, tables, rooms, equipment hire, service visits.

---

# When Not To Use

Do not use this pattern when:

- the item is a product with stock but no time dimension — use the Checkout Pattern
- the resource is unlimited and time is only a preference — use a simple form
- the user is managing their own events on their own calendar — use the Calendar Pattern
- the appointment is assigned by the business rather than chosen by the user — use a request flow with status
- capacity is effectively infinite, such as a webinar with no cap

The most common product mistake is building a booking flow when the business actually triages requests. If a human decides whether the time is granted, do not present confirmed slots. Present a request, and be honest about the pending state.

---

# User Goal

The primary goal is always one of four:

```
Get the soonest suitable time

↓

Get a specific time that fits my life

↓

Change a booking I already have

↓

Cancel without a phone call
```

Most users want the first. The interface should make "the next available slot" a single tap, and treat browsing as the secondary path rather than the default.

---

# User Journey

```
Decides to book

↓

Identifies what is being booked

↓

Sees when it is possible

↓

Picks a time that fits

↓

Provides only the details required

↓

Confirms and receives proof

↓

Receives a reminder before it happens

↓

Reschedules or cancels if life changes

↓

Arrives, or is marked as no-show
```

The reminder and the reschedule are part of the pattern, not follow-on features.

A booking flow without a self-service reschedule path pushes every change into a phone call, and the interface has then solved nothing for the business.

---

# UX Flow

## Entry

The user arrives from:

- a service page, already knowing what they want
- a general "Book now" action, knowing nothing yet
- a staff member's profile, wanting that specific person
- a reminder message, intending to reschedule
- a confirmation email, intending to cancel

Each entry pre-fills a different part of the flow. A user arriving from a staff profile must never be asked to choose the staff member again.

---

## Select Service

Before times can be shown, the system must know duration and eligibility.

```
Service

↓

Duration and price

↓

Any required options

↓

Staff or resource preference
```

Rules:

- Show duration and price on the service card, before selection. A user who discovers the price at the confirmation step abandons.
- Options that change duration must be chosen here, not later, because they change which slots are valid.
- "No preference" is the default for staff selection and must be the first option, because it yields the most availability.

---

## Choose Time

This is the heart of the pattern and where most implementations fail.

```
Show the soonest available

↓

Show a date range with availability density

↓

Show slots for the selected date

↓

Hold the slot on selection
```

Rules:

- Never present an empty calendar that requires probing. Indicate which dates have availability before the user taps one.
- Default to the first date with availability, not to today.
- Show times in the user's timezone, labeled, with the venue's timezone stated when they differ.
- Group slots into morning, afternoon, and evening. A flat list of forty times is unreadable.
- A slot is held from the moment it is selected, for a stated duration, and the remaining time is visible.

---

## Provide Details

Ask for the minimum that the appointment cannot happen without.

```
Name

↓

Contact method for the reminder

↓

Anything the provider must know in advance
```

Rules:

- Never ask for information that could be collected at the appointment.
- Marketing consent is separate, unticked, and never bundled with the booking action.
- Returning users have this step pre-filled and collapsed into a summary they can edit.

---

## Confirm

Confirmation must restate everything, because this is the last chance to catch a mistake.

```
What · When · Where · Who · How much · Cancellation terms
```

The cancellation policy appears before the confirm action, not in the confirmation email. A user discovering a fee after committing is a complaint.

---

## Manage

Every booking must be reachable and changeable from the confirmation message without an account.

```
Confirmation link

↓

Booking detail

↓

Reschedule or cancel

↓

Confirmation of the change
```

Manage links must survive for the lifetime of the booking plus a grace period, and must be single-booking scoped so one link never exposes another customer's details.

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│ ← Book an appointment    │
│ Step 2 of 3 · Choose time │
├──────────────────────────┤
│ Consultation · 45 min    │
│ With: No preference      │
│ Edit                     │
├──────────────────────────┤
│ Soonest: Today 15:30     │
│ [ Book soonest ]         │
├──────────────────────────┤
│ ‹  March 2026          › │
│ M  T  W  T  F  S  S      │
│ 2  3  4  5  6  7  8      │
│ ·  ·  ●  ●  ·  ●  —      │
│ 9 10 11 12 13 14 15      │
│ ●  ●  ●  ·  ●  —  —      │
│ ● available  · limited   │
│ — none                   │
├──────────────────────────┤
│ Wed 4 March · your time  │
│ Morning                  │
│ [ 09:00 ] [ 09:45 ]      │
│ Afternoon                │
│ [ 13:30 ] [ 15:30 ]      │
│ Evening                  │
│ [ 17:15 ]                │
├──────────────────────────┤
│ Times shown in GMT+3     │
└──────────────────────────┘
```

Mobile rules:

- One step per screen. Never compress service, date, time, and details into one scrolling page on mobile.
- Slot buttons are minimum 44×44 with at least 8px between them; mis-taps here cost the user a real appointment.
- Availability density on the date grid uses a symbol as well as color, so it survives greyscale.
- The selected service summary stays visible at the top so the user never wonders what they are booking.
- The timezone label is always visible on the time step.

---

## Tablet

```
┌────────────────────────────────────────────┐
│ Book an appointment · Step 2 of 3          │
├────────────────────────────────────────────┤
│ Consultation · 45 min · No preference  Edit│
├─────────────────────┬──────────────────────┤
│ ‹ March 2026      › │ Wed 4 March          │
│ M T W T F S S       │ your time · GMT+3    │
│ · · ● ● · ● —       │ Morning              │
│ ● ● ● · ● — —       │ [09:00] [09:45]      │
│ ● · ● ● ● — —       │ Afternoon            │
│                     │ [13:30] [15:30]      │
│ ● available         │ Evening              │
│ · limited  — none   │ [17:15]              │
└─────────────────────┴──────────────────────┘
│ Soonest available: Today 15:30  [ Book it ]│
└────────────────────────────────────────────┘
```

---

## Desktop

```
┌────────────────────────────────────────────────────────────┐
│ Book an appointment                        Step 2 of 3     │
├──────────────────┬─────────────────────────────────────────┤
│ SUMMARY          │ ‹ Week of 2 March 2026                › │
│                  ├──────┬──────┬──────┬──────┬─────────────┤
│ Consultation     │ Mon 2│ Tue 3│ Wed 4│ Thu 5│ Fri 6       │
│ 45 minutes       ├──────┼──────┼──────┼──────┼─────────────┤
│ €80              │ —    │ 10:00│ 09:00│ 09:00│ 11:00       │
│                  │      │ 14:30│ 09:45│ 13:00│ 15:45       │
│ With             │      │ 16:00│ 13:30│ 14:00│             │
│ No preference    │      │      │ 15:30│      │             │
│                  │      │      │ 17:15│      │             │
│ Edit selection   ├──────┴──────┴──────┴──────┴─────────────┤
│                  │ All times GMT+3 · Venue is GMT+1        │
│ Cancellation     │ Soonest available: Today 15:30          │
│ Free until 24h   │                                         │
└──────────────────┴─────────────────────────────────────────┘
```

Desktop rules:

- Show a week of availability at once. Extra space buys comparison across days, which is exactly what the user needs.
- The summary rail is persistent and shows price and cancellation terms throughout.
- Never widen slot buttons across the full column. Slots stay compact and scannable.

---

# Component Hierarchy

```
BookingFlow
├── StepIndicator
├── SelectionSummary
│   ├── ServiceLabel
│   ├── DurationLabel
│   ├── PriceLabel
│   ├── ResourceLabel
│   └── EditAction
├── ServiceStep
│   └── ServiceCard ×n
│       ├── Name
│       ├── Duration
│       ├── Price
│       ├── Description
│       └── SelectAction
├── ResourceStep
│   ├── NoPreferenceOption      first, default
│   └── ResourceCard ×n
├── TimeStep
│   ├── SoonestAvailableBanner
│   ├── AvailabilityCalendar
│   │   ├── MonthNavigator
│   │   ├── DayCell ×n           density indicator
│   │   └── DensityLegend
│   ├── SlotGroup ×3             morning / afternoon / evening
│   │   └── SlotButton ×n
│   ├── TimezoneNotice
│   └── SlotHoldTimer
├── DetailsStep
│   ├── ContactFields
│   ├── NotesField
│   ├── ConsentCheckbox          unticked, separate
│   └── FieldError ×n
├── ReviewStep
│   ├── BookingSummary
│   ├── CancellationPolicy
│   ├── FormError
│   └── ConfirmAction
└── ConfirmationScreen
    ├── ReferenceCode
    ├── CalendarAddAction
    ├── DirectionsAction
    ├── RescheduleAction
    └── CancelAction

BookingManagement
├── BookingDetail
├── RescheduleFlow              reuses TimeStep
├── CancelDialog
│   ├── PolicyRestatement
│   ├── ReasonSelect            optional
│   └── ConfirmCancelAction
└── ChangeConfirmation
```

Reuse rules:

- `TimeStep` is one component used identically for booking and rescheduling. A separate reschedule picker guarantees the two drift apart.
- `SlotButton` handles available, limited, held-by-you, and unavailable as variants.
- The cancellation policy is one component rendered in the review step, the confirmation, and the cancel dialog, from a single source.

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

The user knows what is reserved and what is not
```

## Selecting A Slot

1. The slot enters a pressed state immediately.
2. A hold is requested from the server.
3. On success, the slot shows as held-by-you and the hold timer starts, visible: "Held for 9:42".
4. The flow advances to details.
5. If the hold fails because someone took it, the slot is marked unavailable, the failure is announced, and the two nearest alternatives are highlighted.

Optimistic advancement without a server-confirmed hold is prohibited. It produces a user who fills in a form for a slot they never had.

## Slot Taken During Checkout

This is the defining failure of the pattern and must be designed, not discovered.

```
┌──────────────────────────────────────────┐
│ ⚠ 15:30 was just booked by someone else  │
│                                          │
│   Your details are saved. Choose another  │
│   time and we will carry them over.       │
│                                          │
│   Closest available on Wed 4 March:      │
│   [ 15:00 ]   [ 16:15 ]                  │
│                                          │
│   [ See all times ]                      │
└──────────────────────────────────────────┘
```

Rules:

- Never discard entered details.
- Offer the nearest alternatives on the same day before offering a different day.
- Announce assertively; the user must stop and re-choose.
- Return focus to the first suggested alternative.

## Hold Expiry

1. At the defined warning margin, show a quiet inline warning: "Your hold on 15:30 expires in 1:00. Confirm to keep it."
2. Never move focus or interrupt typing.
3. On expiry, attempt one silent re-hold. If it succeeds, replace the warning with "Hold extended".
4. If it fails, show the slot-taken treatment above with details preserved.

Silent re-holding rescues the common case where the slot is still free and the user was simply slow.

## Confirming

1. The confirm button enters a loading state labeled "Confirming…" and cannot be pressed twice.
2. The request carries an idempotency key so a retry over a flaky connection cannot create two bookings.
3. On success, route to a confirmation screen with a reference code.
4. On failure, keep every field, state whether the booking was created, and offer retry.

Stating whether the booking exists is mandatory. A user who does not know whether they are booked will book again.

## Rescheduling

1. Open the same time picker with the original service, duration, and resource pre-selected.
2. Mark the current slot visibly as "Your current time" so the user does not rebook it accidentally.
3. Show the reschedule policy before the new slot is confirmed.
4. Hold the new slot before releasing the old one. The old booking is only released after the new one is confirmed.
5. Confirm with both times stated: "Moved from Wed 4 March 15:30 to Fri 6 March 11:00."

Releasing the old slot first is prohibited. If the new hold fails, the user is left with nothing.

## Cancelling

1. The cancel action opens a dialog, never cancels on a single tap.
2. The dialog restates the appointment, the policy, and any fee that now applies.
3. A reason is optional and never blocks the cancellation.
4. Confirmation states the outcome and any refund with a timeframe.
5. Offer rebooking immediately, because many cancellations are really reschedules.

```
┌──────────────────────────────────────────┐
│ Cancel this appointment?                 │
│                                          │
│ Consultation · Wed 4 March, 15:30        │
│                                          │
│ You are within 24 hours, so a €20        │
│ late-cancellation fee applies.           │
│                                          │
│ Reason (optional)          [ Select ▾ ]  │
│                                          │
│ [ Keep appointment ]  [ Cancel it ]      │
└──────────────────────────────────────────┘
```

---

# States

## Loading — First Visit

```
Selection summary → renders immediately from the entry context
Service cards     → 3 skeleton cards matching final height
Calendar grid     → day cells rendered, density dots as shimmer
Slot area         → 6 slot-shaped skeletons in two groups
```

The calendar frame appears before availability resolves, so the user understands the shape of the step immediately.

No spinner over the whole step.

---

## Loading — Availability Refresh

Triggered by changing month, staff, or service.

- Keep the previous slots visible and dimmed to 60%.
- Show a thin progress line at the top of the slot area.
- Disable slot buttons during the fetch so a tap cannot land on stale availability.
- Cancel the superseded request; a late response must never repaint newer availability.

---

## Loading — Submitting

- The confirm button shows "Confirming…" with a spinner.
- All fields become read-only rather than disabled.
- The hold timer keeps counting and remains visible.
- Beyond five seconds add: "Still confirming. Do not close this page."

---

## Empty — Nothing Bookable At All

The service exists but has no configured availability.

```
┌──────────────────────────────────────────┐
│              [illustration]              │
│                                          │
│  Online booking is not open yet          │
│                                          │
│  This service is not accepting online    │
│  appointments at the moment.             │
│                                          │
│  [ Call +254 700 000 000 ]               │
│  [ Request a callback ]                  │
└──────────────────────────────────────────┘
```

Never render an empty calendar with no explanation. It reads as a broken product rather than a closed diary.

---

## Empty — No Availability In This Range

Different from having no availability at all.

```
┌──────────────────────────────────────────┐
│ No times available in March              │
│                                          │
│ The next opening is Tue 7 April, 10:00.  │
│                                          │
│ [ Go to 7 April ]                        │
│ [ Notify me if something opens ]         │
└──────────────────────────────────────────┘
```

Always name the next real opening. Making the user page forward through empty months is the single most common booking failure.

---

## Empty — No Availability For This Filter

When the constraint is the resource or option, not the date.

```
No times with Dr Okoth in the next 30 days.

The soonest with any available practitioner
is today at 15:30.

[ Show all practitioners ]   [ Keep waiting for Dr Okoth ]
```

Name the constraint that caused the emptiness so the user does not remove the wrong one.

---

## Error — Field Level

```
Mobile number
┌──────────────────────────────┐
│ 07                           │
└──────────────────────────────┘
⚠ Enter a full mobile number so we can
  send your reminder.
```

The reason is stated, because a user who understands why a field matters completes it.

Validate on blur, clear on correction, reserve the space so nothing shifts.

---

## Error — Submission Failed

```
┌──────────────────────────────────────────┐
│ ⚠ We could not confirm your booking      │
│                                          │
│   Nothing was reserved and you have not  │
│   been charged. Your 15:30 hold is still │
│   active for 4:12.                       │
│                                          │
│   [ Try again ]                          │
│   Reference: BKG-8821                    │
└──────────────────────────────────────────┘
```

The three facts a user needs after a failed booking: whether it exists, whether they paid, and whether the slot is still theirs.

---

## Error — Availability Unavailable

When the availability source itself cannot be reached.

```
┌──────────────────────────────────────────┐
│ ⚠ We cannot load times right now         │
│                                          │
│   [ Retry ]                              │
│   Or call +254 700 000 000 to book        │
└──────────────────────────────────────────┘
```

Always provide the offline channel. A booking flow that fails with no human fallback loses the appointment entirely.

---

## Partial / Stale Availability

When availability is cached or a resource calendar is degraded:

```
Times shown may be up to 5 minutes old.
We confirm availability before booking.
```

Stating that final confirmation happens at booking sets the expectation that a slot may still be lost, which makes the failure case feel like a system working rather than a system broken.

---

## Success

```
┌──────────────────────────────────────────┐
│ ✓ You are booked                         │
│                                          │
│ Consultation · 45 minutes                │
│ Wednesday 4 March 2026, 15:30            │
│ Times shown in GMT+3                     │
│ With Dr Okoth                            │
│ 12 Riverside Drive, Nairobi              │
│ €80 payable at the appointment            │
│                                          │
│ Reference BKG-4471                       │
│ Confirmation sent to a@example.com       │
│                                          │
│ [ Add to calendar ]  [ Get directions ]  │
│ Reschedule · Cancel                      │
│                                          │
│ Free cancellation until 3 March, 15:30   │
└──────────────────────────────────────────┘
```

Required on every confirmation: reference code, full date with weekday, timezone, location, price, where the confirmation was sent, and the reschedule and cancel paths.

A reference code is not decoration. It is what the user reads out on the phone.

---

## Permission-Limited

When a service is restricted to certain customers:

```
This service is available to members only.

[ Sign in ]   [ See open services ]
```

Never show slots the user cannot actually book.

---

# Mobile Behavior

- Touch targets minimum 44×44 for slots, day cells, and stepper controls, with 8px minimum separation.
- One step per screen, with a back action that preserves every earlier choice.
- The date grid scrolls horizontally by week only if the density indicators remain visible; otherwise paginate by month.
- The hold timer is pinned to the top of the details step so it is never scrolled out of view.
- Correct input types: tel for phone, email for email, so the right keyboard appears.
- Autofill tokens on name, email, and phone so platform autofill completes the details step in one tap.
- Add-to-calendar uses the native calendar handoff, not a downloaded file the user must find.
- Never open a slot picker inside a bottom sheet that the keyboard will collapse.
- Pull to refresh re-fetches availability for the visible date.

---

# Desktop Expansion

Added space is spent on:

- a full week of availability visible at once
- a persistent summary rail carrying price and cancellation terms through every step
- details and review side by side, removing one step
- keyboard navigation across the slot grid with arrow keys

Added space is never spent on:

- a month view crowded with individual times
- combining all steps onto one long scrolling page
- decorative imagery of the venue beside the slot picker
- a second copy of the service description

---

# Accessibility Requirements

- The availability calendar is a grid with arrow-key navigation between days, Home and End for week bounds, and Page Up / Page Down for months.
- Each day cell has an accessible name including the date, weekday, and availability: "Wednesday 4 March, 5 times available".
- Availability density is conveyed by symbol and text, never color alone, so greyscale rendering still communicates it.
- Slot buttons announce their full meaning: "15:30, Wednesday 4 March, available".
- Unavailable slots are rendered as disabled buttons with an accessible name explaining why, or removed entirely — never as visually greyed text that screen readers announce as selectable.
- Selecting a slot announces politely: "15:30 held for you for 10 minutes."
- Hold expiry warnings announce politely at the warning threshold only, not on every tick. Expiry itself announces assertively.
- A slot lost to another user announces assertively, and focus moves to the first suggested alternative.
- Step changes move focus to the new step's heading and announce the step position: "Step 3 of 3, Review".
- The cancel dialog traps focus, defaults focus to "Keep appointment", and returns focus to the cancel trigger on close.
- Times are always accompanied by a text timezone label, never only an offset abbreviation the user must interpret.
- All text meets 4.5:1; slot borders and density indicators meet 3:1.
- Reduced motion: steps replace instantly, no sliding transitions, no pulsing hold timer.
- At 200% zoom the slot grid reflows to fewer columns and the calendar remains fully navigable with no horizontal page scroll.
- Timers never impose a limit shorter than users can reasonably meet, and expiry always offers a recovery path rather than dropping the user to the start.

---

# Data Requirements

Before implementation, confirm:

```
Duration of every service, including any buffer before and after


Resource capacity per slot


Slot granularity and whether starts are aligned to the grid


Working hours, breaks, holidays, and one-off closures


Lead time: how soon from now a booking may be made


Booking horizon: how far ahead availability is open


Timezone of the resource and how DST transitions are handled


Hold duration and whether holds are extendable


Concurrency rule: what happens when two users confirm the same slot


Idempotency key strategy for confirmation


Cancellation window and fee rule


Reschedule window and limit on changes


Reminder schedule and channel


No-show definition and consequence


Whether payment is taken at booking or at the appointment


Retention of manage-link tokens and their expiry


Who may see and modify a booking
```

The concurrency rule must be settled in the data layer, not the interface. Two users will confirm the same slot in the same second, and only the server can decide who wins.

DST must be settled explicitly. A recurring appointment across a DST boundary either keeps its wall-clock time or its absolute time, and choosing silently guarantees a missed appointment.

---

# Performance Requirements

- Availability for the default date returns under one second; it is the reason the user is here.
- Availability is fetched per visible range, never as a full year of slots.
- Density indicators for a month arrive in one request, not one per day.
- Slot holds respond under 500ms; anything slower makes the tap feel unacknowledged.
- Superseded availability requests are cancelled when the range or resource changes.
- Confirmation is idempotent and retry-safe on the client and the server.
- Availability may be cached briefly, and when it is, the staleness window is stated on screen.
- Reminder dispatch is queued server-side and never depends on the browser session.

---

# Anti-Patterns

Never build:

- an empty calendar the user must probe date by date to find availability
- a month view that opens on today when today has no availability
- availability shown without a timezone label
- price or duration revealed only at the confirmation step
- a cancellation policy that first appears in the confirmation email
- slot selection with no server-side hold
- discarding entered details when a slot is lost
- a "slot unavailable" message with no alternatives offered
- releasing the old booking before the new one is confirmed during a reschedule
- cancellation on a single tap with no confirmation
- confirmation screens without a reference code
- confirmation without the weekday spelled out, which is where date mistakes hide
- forty slot times in one flat unlabeled list
- a reschedule picker that behaves differently from the booking picker
- requiring an account to cancel a booking made without one
- a hold timer that expires and returns the user to step one
- availability density communicated by color alone
- booking flows with no offline phone fallback when the system fails
- confirming a booking twice because the retry had no idempotency key
- marketing consent pre-ticked inside the booking action

---

# Pattern Output Example

```
Product

Clinic Appointment Booking


Primary Goal

Reserve the soonest suitable consultation without calling


Layout

Three steps: service, time, details and review; week grid on desktop


Slot Granularity

15 minutes, aligned, 45 minute services with 10 minute buffer


Default Date

First date with availability, never today by default


Density Indicator

Symbol plus text on each day cell, greyscale safe


Hold

10 minutes, visible countdown, one silent re-hold attempt on expiry


Concurrency

Server-authoritative, loser sees nearest alternatives with details preserved


Timezone

User timezone shown, venue timezone stated when different, DST keeps wall-clock time


Confirmation

Reference code, weekday spelled out, calendar handoff, directions, manage links


Cancellation

Free until 24 hours before, €20 fee inside 24 hours, stated before confirm


Reschedule

Same picker, current time marked, new slot held before old is released


Failure Fallback

Phone number shown whenever availability cannot load


Mobile

One step per screen, 44×44 slots, pinned hold timer, native calendar handoff


Accessibility

Grid keyboard navigation, polite hold announcements, assertive slot-lost, 200% zoom verified


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] The flow opens on the first date with availability, not today
- [ ] Availability density is visible before the user taps a date
- [ ] Density survives greyscale
- [ ] Duration and price are visible before the time step
- [ ] Timezone is labeled on every time shown
- [ ] Venue timezone is stated when it differs from the user's
- [ ] Selecting a slot creates a server-side hold before advancing
- [ ] Hold duration is visible and warns before expiry
- [ ] Expiry attempts a silent re-hold before failing
- [ ] A lost slot preserves all entered details and offers nearest alternatives
- [ ] Confirmation is idempotent and cannot double-book on retry
- [ ] Failed submission states whether the booking exists and whether payment occurred
- [ ] No availability in range names the next real opening
- [ ] No availability for a resource names the constraint and offers alternatives
- [ ] Cancellation policy appears before the confirm action
- [ ] Confirmation includes reference code, weekday, timezone, location, and price
- [ ] Reschedule reuses the booking picker and marks the current time
- [ ] Reschedule holds the new slot before releasing the old one
- [ ] Cancellation requires confirmation and restates any fee
- [ ] Manage links work without an account and are scoped to one booking
- [ ] A phone fallback is offered whenever availability fails to load
- [ ] Slots and day cells meet 44×44 with 8px separation on mobile
- [ ] Calendar is fully keyboard navigable with arrow keys
- [ ] Slot-lost announces assertively and moves focus to an alternative
- [ ] 200% zoom reflows the slot grid without horizontal scroll
- [ ] Reduced motion respected

---

# Final Rule

A booking flow is judged by what happens when the slot is gone.

Every element must justify itself against one question:

If availability changed while the user was deciding, would this interface keep their trust?

If the answer is no, redesign it before shipping.
