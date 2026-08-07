# Empty, Loading, And Error States Overview
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** Empty States System, Loading States System, Error States System, UX Intelligence, Feedback System

---

# Purpose

This overview defines how Empty, Loading, and Error states work together as one communication model.

It does not replace the specialist systems.

Use this document to classify states and keep transitions coherent.

Use specialists for depth:

- Empty States System — expected content does not exist yet
- Loading States System — the system is working and the user must wait
- Error States System — something failed or progress is blocked

---

# Core Principle

Never leave users in uncertainty.

Every state should answer:

```
What is the current situation?

Why is it happening?

What action can the user take?
```

---

# The Three-State Model

```
User Request

↓

System Outcome

↓

Empty | Loading | Error

↓

Next Action Or Content
```

Success is the destination.

Empty, loading, and error are how users reach it without confusion.

---

# Routing To Specialists

Empty — system succeeded, nothing to show.

Examples: first-use, no results, cleared inbox.

Consult Empty States System.

Loading — outcome not ready, system still working.

Examples: page fetch, save, export generation.

Consult Loading States System.

Error — failure, blocked access, or required recovery.

Examples: timeout, permission denied, save conflict, uncertain payment.

Consult Error States System.

---

# Cross-Cutting Rules

---

# Never Leave The User Uncertain

Reject blank screens, unexplained missing sections, endless spinners, and failures disguised as emptiness.

If the user cannot answer "what is happening?", the state design has failed.

---

# Region Versus Page Failure

Choose the smallest honest scope.

```
One widget failed → region error, page remains usable

Primary content failed → page error, recovery is the main task

One field failed → field error, form remains usable
```

Do not punish the whole page for a local problem.

Do not minimize a blocking failure into a missable toast.

---

# Successive States

Transitions must be deliberate.

```
Loading → Content

Loading → Empty

Loading → Error → Retry → Loading

Empty → User Action → Loading → Content
```

Never jump from a failed load into empty without saying the load failed.

Never leave loading visible after failure is known.

---

# Partial States

Mixed outcomes are normal.

Show what is available.

Label what is missing.

Give each sub-area its own honest state.

Do not block the primary goal for optional incompleteness.

---

# Shared Communication Standard

```
Situation

↓

Meaning

↓

Next Step
```

Empty emphasizes activation or filter recovery.

Loading emphasizes confidence while waiting.

Error emphasizes recovery and truth about impact.

---

# Mobile And Accessibility

Keep messages short, actions visible, and touch targets comfortable.

Avoid full-screen takeover for local issues.

Do not communicate state through color, animation, or icons alone.

Shared needs: readable text, keyboard-accessible actions, meaningful status announcements, helpful focus management.

---

# How To Route Work

```
Identify incomplete outcomes

↓

Classify Empty, Loading, or Error

↓

Decide field, region, or page scope

↓

Apply the matching specialist system

↓

Check transitions
```

Depend on specialists for depth.

Depend on this overview for the shared model, routing, or successive-state coherence.

---

# Anti-Patterns

Reject blank screens, infinite loading that hides failure, empty states masking errors, unclear errors with no recovery, technical primary messages, dead ends, and missing transitions.

---

# Review Questions

```
Does every incomplete path have a state?

Is Empty vs Loading vs Error correct?

Are region and page scopes correct?

Do transitions remain honest?

Can the user recover or proceed?
```

---

# Final Rule

Empty, loading, and error are not leftovers after the happy path.

Design them as one model.

Implement them through their specialist systems.
