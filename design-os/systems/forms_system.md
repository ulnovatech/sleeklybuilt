# Forms System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** UX Intelligence, Component Intelligence, Accessibility Intelligence, Typography System, Spacing System

---

# Purpose

The Forms System defines how users provide information, complete tasks, and interact with structured inputs.

Forms are not collections of fields.

Forms are conversations between the product and the user.

A strong form system reduces:

- confusion
- mistakes
- effort
- abandonment

---

# Core Philosophy

Every field creates a cost.

Only ask for information that creates value.

The best form is not the one that collects the most data.

It is the one that helps users complete their goal with the least friction.

---

# Form Design Pipeline

Every form follows:

```
User Goal

↓

Required Information

↓

Field Selection

↓

Input Design

↓

Validation Strategy

↓

Feedback

↓

Completion Review
```

---

# Form Anatomy

Every form should define:

```
Context

↓

Labels

↓

Inputs

↓

Guidance

↓

Validation

↓

Submission

↓

Confirmation
```

---

# Form Structure

---

# Single Task Forms

Used for:

- search
- login
- simple actions

Characteristics:

Few fields.

Immediate completion.

---

# Multi-Step Forms

Used for:

- onboarding
- checkout
- applications

Benefits:

- lower cognitive load
- progress visibility
- easier completion

---

# Long Forms

Used only when necessary.

Requirements:

- grouping
- sections
- progress
- saving

---

# Field Selection Rules

Before adding a field ask:

Does this information:

- help the user?
- enable functionality?
- improve the result?

If not:

remove it.

---

# Input Types

Choose inputs based on user effort.

---

# Text Input

Use for:

- names
- short answers
- search

Rules:

- clear labels
- correct sizing
- helpful placeholders

---

# Text Area

Use for:

- descriptions
- messages
- longer content

Rules:

- appropriate height
- character guidance when useful

---

# Select Input

Use when:

- options are known
- choices are many

Avoid when:

few options exist.

Prefer:

radio buttons or segmented controls.

---

# Checkbox

Use when:

multiple selections are allowed.

Example:

Select services.

---

# Radio Buttons

Use when:

only one choice exists.

---

# Toggle

Use for:

immediate settings.

Example:

Notifications on/off.

Avoid using toggles for decisions requiring confirmation.

---

# Date and Time Inputs

Use:

- native pickers where possible
- clear formatting
- sensible defaults

---

# Search Inputs

Should support:

- suggestions
- clear action
- recent searches
- filtering when needed

---

# Labels

Every input requires a clear label.

Avoid depending only on:

placeholder text.

---

# Placeholder Rules

Placeholders are:

not labels.

Use them for:

examples

format hints

additional guidance

---

# Input States

Every field must support:

---

## Default

Ready for interaction.

---

## Focus

Shows active input.

---

## Filled

Shows entered value.

---

## Error

Explains the problem.

---

## Success

Confirms completion when useful.

---

## Disabled

Shows unavailable state.

---

## Loading

Shows processing state.

---

# Validation Strategy

Validation should help users succeed.

---

# Inline Validation

Use when:

mistakes can be corrected immediately.

---

# Submit Validation

Use when:

checking final requirements.

---

# Error Messages

Good errors explain:

Problem

+

Solution

Example:

Bad:

"Invalid"

Good:

"Enter a valid email address."

---

# Form Layout

---

# Mobile Forms

Rules:

- single column
- large touch targets
- minimal fields
- correct keyboards
- easy scrolling

---

# Desktop Forms

May use:

- two-column layouts
- supporting information
- grouped sections

Avoid unnecessary complexity.

---

# Form Spacing

Use clear grouping.

Example:

```
Label

8px

Input


24px


Next Field
```

Sections:

32–48px separation.

---

# Buttons in Forms

Every form needs:

Primary action.

Optional:

Secondary action.

Avoid:

multiple competing submit buttons.

---

# Progress Forms

For multi-step flows include:

- current step
- remaining steps
- ability to return
- saved progress

---

# Confirmation

After important submissions show:

- completion status
- next action
- reference information when needed

---

# Form Accessibility

Requirements:

- semantic labels
- keyboard navigation
- error announcements
- sufficient contrast
- logical focus order

---

# Form Performance

Improve completion with:

- autofill
- saved information
- intelligent defaults
- instant feedback

---

# Form Anti-Patterns

Never create:

- unnecessary fields
- unclear labels
- placeholder-only inputs
- huge forms without progress
- destructive actions without warning
- confusing validation
- tiny mobile inputs

---

# Form Tokens

Example:

```
Input Height

48px


Border Radius

12px


Label Size

14px


Input Padding

16px


Field Gap

24px


Section Gap

48px
```

---

# Form System Output

Example:

```
Product

Checkout Flow

Form Type

Multi-step

Fields

Minimal Required

Layout

Single Column Mobile

Validation

Inline

Progress

Step Indicator

Buttons

Primary Checkout CTA

Accessibility

Keyboard + Screen Reader Ready

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Every field has purpose
- [ ] Labels are clear
- [ ] Errors help recovery
- [ ] Mobile completion feels easy
- [ ] Touch targets are large enough
- [ ] Progress is clear
- [ ] Accessibility works

---

# Final Rule

A form should never feel like paperwork.

It should feel like the shortest path between the user's intention and the result they want.