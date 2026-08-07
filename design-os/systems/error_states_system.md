# Error States System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** UX Intelligence, Feedback System, Component Intelligence, Accessibility Intelligence, Empty States System, Loading States System

---

# Purpose

The Error States System defines how products communicate failure, blocked progress, and recovery.

Errors are not edge cases.

They are moments where trust is either repaired or destroyed.

A good error experience communicates:

- what went wrong
- why it matters
- what the user can do next
- whether progress was preserved

Never stop at "Something went wrong."

---

# Core Philosophy

An error is a conversation with a person who is already frustrated.

Stay calm. Stay specific. Stay useful.

Never blame the user.

Uncertainty after failure is worse than the failure itself.

Every error state should transform confusion into a recovery path.

---

# Error Decision Pipeline

Every error situation follows:

```
Failure Detected

↓

Error Category

↓

User Impact

↓

Scope Of Failure

↓

Recovery Options

↓

Message And Placement

↓

Accessibility Announcement

↓

Review
```

Decide scope before copy:

```
Field → Region → Page → Session
```

Use the smallest honest scope.

---

# Field Errors

Failures on a specific input or control.

Examples:

- invalid email
- missing required field
- value outside allowed range

Requirements:

- appear near the field
- name the correction
- preserve entered values
- keep the rest of the form usable

Good:

"Enter a valid email address, like name@company.com."

Bad:

"Invalid input."

---

# Region Errors

Failures limited to one section while the page remains usable.

Examples:

- one dashboard chart failed
- comments panel unavailable
- related products timed out

Requirements:

- keep surrounding content available
- explain the local failure
- offer local retry

Never replace an entire page because one optional region failed.

---

# Page Errors

Failures that block the primary purpose of the screen.

Examples:

- order details cannot load
- checkout cannot continue
- inbox failed to fetch

Anatomy:

```
Title

↓

Explanation

↓

Primary Recovery Action

↓

Secondary Escape Action
```

Keep global navigation when possible.

Example:

"We could not load this order. Try again, or return to your orders."

---

# Network Errors

Failures from connectivity, timeouts, or unreachable services.

Requirements:

- plain-language connection or service message
- preserve progress
- offer retry
- never fake success while offline
- never discard drafts because a request failed

Good:

"You appear to be offline. Check your connection and try again."

Bad:

"ERR_NETWORK_FAILED."

---

# Permission Errors

Failures from missing access, role limits, or auth state.

Requirements:

- explain that access is blocked
- avoid leaking sensitive details
- give one next step: request access, sign in, upgrade, or contact an admin

Good:

"You do not have access to this report. Ask an admin to grant permission."

Bad:

"403 Forbidden."

---

# Conflict Errors

Failures from competing changes, stale data, or concurrent edits.

Requirements:

- explain that state changed
- show enough context for a decision when possible
- never silently overwrite

Pattern:

```
What Changed

↓

Your Version vs Current Version

↓

Keep Yours / Keep Theirs / Merge / Cancel
```

If comparison is impossible: reload latest, copy draft, or cancel without saving.

---

# Irreversible Errors

Failures around actions that cannot be undone, or failures with lasting consequences.

Examples:

- payment charged but confirmation failed
- delete already processed
- transfer interrupted mid-process

Requirements:

- say what already happened
- never be vague about money, deletion, or legal consequence
- provide the safest next step
- include a support reference when available

Good:

"Your payment was received, but confirmation did not finish. Do not pay again. Contact support with reference UT-48219."

Bad:

"Something went wrong. Please try again."

Before irreversible actions: explicit confirmation, named consequence, no double submit.

---

# Recovery Patterns

Every error needs at least one recovery path.

Retry:

Temporary failures. Preserve inputs. Disable concurrent retries. Return through loading.

Edit And Resubmit:

Validation failures. Focus first invalid field. Keep valid values.

Alternative Path:

Return to list, change payment method, skip optional data, contact support.

Refresh Latest:

Stale data and conflicts. Warn before discarding drafts.

Request Access:

Permission failures with one clear next step.

Support Escalation:

When self-recovery is impossible. Include reference id. No stack traces as UI.

---

# Error Anatomy And Placement

A useful error contains:

```
What Failed

↓

Cause When Useful

↓

What To Do Next

↓

Optional Reference
```

Placement matches scope:

```
Field → beside or below the field

Region → inside the failed region

Page → primary content area

Session → persistent banner or blocking state
```

Serious failures must remain visible until resolved.

Do not hide payment, permission, or data-loss risks in a disappearing toast alone.

---

# Microcopy Rules

Write for humans under stress.

- plain language
- specific object names when known
- no blame
- no technical codes as primary message
- recovery verbs

Field: one short sentence.

Region: title + one short sentence.

Page: title + short explanation + actions.

One calm sentence beats three nervous ones.

---

# Relationship To Loading And Empty

Loading: system is working.

Empty: system worked, nothing exists.

Error: system failed or progress is blocked.

Rules:

- never present an error as empty
- never leave loading spinning after failure
- failed loads must transition into error with recovery

```
Loading → Error → Retry → Loading → Content
```

After recovery, clear the error and restore expected content.

---

# Partial Failure And Forms

Show available content. Isolate failed regions. Label missing pieces.

Do not block the primary goal for optional failure.

Forms need:

```
Inline field errors

↓

Section summary when many fields fail

↓

Submission-level failure when the server rejects the attempt
```

Around delete, pay, transfer, or overwrite:

- say what completed and what did not
- block unsafe retries when double execution would harm
- offer status-check or support paths when confirmation is uncertain

---

# Mobile, Desktop, And Accessibility

Mobile:

- concise copy
- visible actions
- 44–48px recovery targets
- no hover-only explanations

Desktop may support richer conflict comparison and multi-panel partial failure.

Accessibility requires:

- field errors associated with inputs
- thoughtful focus on submit failure
- live-region announcements for important page or region failures
- no color-only meaning
- keyboard-reachable recovery controls
- text, not icon-only failure meaning

Respect reduced motion.

---

# Severity And Product Guidance

```
Low → short correction near the control

Medium → local failure with retry

High → blocking explanation, preserved progress, safe next step

Critical → explicit consequence language, no ambiguous retry, support reference
```

Ecommerce: payment certainty first. Never encourage a second payment when outcome is unknown.

Dashboards: isolate regions. Keep the page usable.

Admin: conflicts, permissions, reference ids.

Consumer mobile: short copy, obvious retry, offline honesty.

---

# Error Tokens

Example:

```
Error Text

semantic error color


Error Background

subtle surface


Error Border

semantic error border


Icon Size

20px


Page Error Max Width

480px


Region Error Padding

24px


Field Error Spacing

8px below control
```

---

# Error State Output

Example:

```
Product

B2B Order Management

Scenario

Order detail failed to load

Category

Page + Network

Message

"We could not load this order. Check your connection and try again."

Primary Action

Try Again

Secondary Action

Back To Orders

Preserved Context

Navigation remains

Reference

UT-91340 when available

Accessibility

Status announced, retry focusable

Review

Pass
```

---

# Anti-Patterns

Never create:

- "Something went wrong" with no next step
- blank screens after failure
- infinite spinners hiding failure
- stack traces as UI
- blaming copy
- toast-only handling for destructive or payment uncertainty
- full-page takeover for a field error
- silent failures
- retries that double-submit payments or deletions
- empty states masking errors
- color-only error indication
- recovery that discards input without warning

---

# QA Checklist

Before approval:

- [ ] Category and scope are correct
- [ ] Message is plain and specific
- [ ] Recovery action is obvious
- [ ] Progress is preserved when possible
- [ ] Conflicts do not silently overwrite
- [ ] Network failures offer safe retry
- [ ] Permission failures explain the next step
- [ ] Irreversible or payment uncertainty is explicit
- [ ] Accessibility associations work
- [ ] Mobile recovery targets are usable
- [ ] Loading failures become real error states

---

# Final Rule

An error state is not an apology screen.

It is a guided recovery experience.

The product earns trust not by avoiding failure, but by telling the truth quickly and helping the user continue.
