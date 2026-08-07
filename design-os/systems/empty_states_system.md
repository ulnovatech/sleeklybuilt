# Empty States System
**Version:** 1.0  
**Status:** System Layer  
**Depends On:** UX Intelligence, Component Intelligence, Feedback System, Accessibility Intelligence

---

# Purpose

The Empty States System defines how products communicate moments where expected content, data, or activity does not exist yet.

Empty states are not failures.

They are guidance moments.

A good empty state helps users understand:

- why nothing exists
- what they can do next
- how to create value

---

# Core Philosophy

An empty screen is still an experience.

Never leave users staring at:

- blank pages
- empty containers
- unexplained sections

Every empty state should guide progress.

---

# Empty State Decision Pipeline

Every empty state follows:

```
Context

↓

Reason For Empty State

↓

User Expectation

↓

Helpful Explanation

↓

Next Action

↓

Visual Treatment

↓

Review
```

---

# Empty State Types

---

# First Use State

User has never created or used anything.

Examples:

- new account
- first project
- empty dashboard

Goal:

Teach and activate.

---

# No Data State

Data exists in the system, but nothing matches.

Examples:

- no search results
- no filtered items

Goal:

Help users recover.

---

# Completed State

Nothing remains because work is finished.

Examples:

- completed tasks
- processed queue

Goal:

Confirm success.

---

# Error State

Content cannot load.

Examples:

- failed request
- unavailable service

Goal:

Explain and recover.

---

# Permission State

User cannot access content.

Examples:

- restricted reports
- private projects

Goal:

Explain access requirements.

---

# Search Empty State

No results found.

Should provide:

- what was searched
- correction suggestions
- alternative actions

---

# Empty State Anatomy

Every empty state should contain:

```
Visual

↓

Title

↓

Explanation

↓

Primary Action

↓

Optional Secondary Action
```

---

# Visual Element

Optional.

Can include:

- illustration
- icon
- animation

Rules:

The visual should reinforce meaning.

Avoid:

random decoration.

---

# Title Rules

The title should explain the situation.

Good:

"No projects yet"

Bad:

"Nothing here"

---

# Description Rules

The description should provide context.

Example:

"Create your first project to start tracking progress."

---

# Action Rules

Every empty state should define the next step.

Examples:

Create Project

Add Product

Upload File

Clear Filters

Try Again

---

# Button Hierarchy

Primary action:

The expected next step.

Secondary action:

Alternative recovery.

Avoid:

multiple competing actions.

---

# Empty States by Product Type

---

# Ecommerce

Examples:

Cart empty:

Show:

- explanation
- recommended products
- shopping action

---

# Dashboard

Empty analytics:

Show:

- required setup
- data source connection
- first step

---

# Content Platform

Empty feed:

Show:

- discovery options
- follow suggestions
- categories

---

# CRM

Empty pipeline:

Show:

- create customer
- import contacts
- connect data

---

# Mobile Empty States

Mobile requires:

- concise explanations
- visible action
- minimal scrolling

Avoid:

large illustrations consuming the whole screen.

---

# Desktop Empty States

Desktop can support:

- richer explanations
- onboarding guidance
- supporting visuals

---

# Loading vs Empty

Do not confuse:

Loading:

Information is coming.

Empty:

Information does not exist.

---

# Empty State Motion

Allowed:

- subtle entrance
- progress encouragement

Avoid:

large animations delaying action.

---

# Accessibility

Empty states require:

- readable text
- proper hierarchy
- accessible actions
- meaningful labels

---

# Empty State Content Rules

Avoid:

technical language.

Bad:

"No records returned from database query."

Good:

"No orders found yet."

---

# Empty State Anti-Patterns

Never create:

- blank screens
- unclear messages
- decorative illustrations without purpose
- no next action
- generic error wording
- dead ends

---

# Empty State Tokens

Example:

```
Illustration Size

120px


Title

24px


Description

16px


Action Spacing

24px


Container Padding

32px
```

---

# Empty State Output

Example:

```
Product

Task Management App

Scenario

No tasks created

Message

"Create your first task"

Action

Create Task

Visual

Simple illustration

Secondary Action

Import Tasks

Mobile

Centered compact layout

Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] User understands why it is empty
- [ ] Next action is obvious
- [ ] Copy is human-friendly
- [ ] Visual supports meaning
- [ ] Mobile layout works
- [ ] No dead ends exist

---

# Final Rule

An empty state is not the absence of experience.

It is the moment where the product teaches the user what happens next.