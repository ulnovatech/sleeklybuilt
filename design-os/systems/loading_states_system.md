# Loading States System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** UX Intelligence, Motion System, Component Intelligence, Data Display System

---

# Purpose

The Loading States System defines how products communicate waiting, progress, and system activity.

Loading is not a technical detail.

It is a user experience moment where trust is either created or lost.

A good loading experience communicates:

- the system is working
- progress is happening
- the user should know what to expect

---

# Core Philosophy

Never make users wonder:

"Did something break?"

Loading states should transform waiting into confidence.

---

# Loading Decision Pipeline

Every loading situation follows:

```
Action

↓

Expected Duration

↓

User Impact

↓

Loading Pattern

↓

Feedback

↓

Completion State

↓

Review
```

---

# Loading Categories

---

# Instant Response

Duration:

0–100ms

No loading indicator required.

Examples:

- button state change
- local updates
- simple interactions

Use:

Immediate feedback.

---

# Short Loading

Duration:

100ms–1s

Use:

Subtle indicators.

Examples:

- saving
- filtering
- searching

---

# Medium Loading

Duration:

1–5s

Use:

Clear progress feedback.

Examples:

- page loading
- data fetching
- uploads

---

# Long Loading

Duration:

5s+

Requires:

- progress information
- explanation
- cancellation when possible

Examples:

- processing
- exports
- AI generation

---

# Loading Patterns

---

# Skeleton Loading

Default for content loading.

Best for:

- pages
- cards
- lists
- dashboards

Benefits:

- preserves layout
- reduces perceived waiting
- shows structure

---

# Spinner

Use only for:

short uncertain waits.

Examples:

- button processing
- small actions

Avoid:

full-page spinners.

---

# Progress Bar

Use when:

completion can be measured.

Examples:

- upload
- export
- installation

---

# Optimistic UI

Use when:

the action is likely to succeed.

Examples:

- likes
- favorites
- toggles

Pattern:

Action happens immediately.

System confirms afterward.

---

# Placeholder Content

Use carefully.

Never display fake information that could confuse users.

---

# Skeleton Rules

Skeletons should match:

- final layout
- content structure
- approximate dimensions

Avoid:

random placeholder blocks.

---

# Button Loading States

Buttons must communicate processing.

Example:

Before:

```
Save
```

After:

```
Spinner + Saving...
```

Rules:

- prevent duplicate submission
- preserve context
- show completion

---

# Page Loading States

Avoid:

blank screens.

Preferred:

Show:

- navigation
- layout structure
- skeleton content

---

# Data Loading

For tables:

Use:

- row skeletons

For cards:

Use:

- card skeletons

For dashboards:

Use:

- metric placeholders

---

# Media Loading

Images and videos require:

- reserved dimensions
- placeholders
- progressive loading

Avoid layout shifts.

---

# AI/Product Processing States

For long-running intelligent tasks:

Communicate:

- current stage
- progress
- expected result

Example:

```
Analyzing content

↓

Creating structure

↓

Generating output
```

---

# Error During Loading

If loading fails:

Provide:

- explanation
- retry option
- recovery path

---

# Loading Motion Rules

Motion should be:

- subtle
- calm
- predictable

Avoid:

- distracting animations
- endless spinning
- excessive movement

---

# Mobile Loading

Mobile requires:

- immediate feedback
- lightweight animations
- efficient rendering

Consider:

- slower networks
- battery usage
- interruptions

---

# Desktop Loading

Desktop can support:

- richer progress
- background processing
- multi-task workflows

---

# Accessibility

Loading states must communicate to:

- screen readers
- keyboard users
- visual users

Requirements:

- meaningful status messages
- accessible progress indicators
- no focus traps

---

# Loading Anti-Patterns

Never create:

- blank white screens
- infinite spinners
- fake progress
- unclear waiting
- disabled buttons without explanation
- layout jumps

---

# Loading Tokens

Example:

```
Skeleton Animation

1.5s


Spinner Size

20px


Progress Height

4px


Transition

200ms
```

---

# Loading State Output

Example:

```
Product

AI Content Generator

Action

Generate Video

Duration

30 seconds

Loading Pattern

Progress Stages

Feedback

Current processing step

Completion

Preview Available

Error

Retry Enabled

Accessibility

Status Announced

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Users know something is happening
- [ ] Loading matches expected duration
- [ ] Layout does not jump
- [ ] Progress is clear when needed
- [ ] Errors recover gracefully
- [ ] Accessibility is supported

---

# Final Rule

Loading is not the space between action and result.

Loading is part of the product experience.

A great loading state preserves trust while the system works.