# AI Product Design Prompt
**Version:** 1.0  
**Status:** Production AI Experience Design Prompt  
**Depends On:** Product Classifier, UX Intelligence, Content Intelligence, Forms System, Error States System, Accessibility Intelligence

---

# Purpose

This prompt defines the process for designing production-quality AI products using the Design OS framework.

An AI product is not simply a chat interface connected to a model.

A successful AI product is a complete experience that helps users:

- achieve goals faster
- make better decisions
- automate tasks
- understand complex information
- collaborate with intelligent systems

---

# Design Mission

```
Understand User Intent

↓

Define AI Role

↓

Design Human-AI Interaction

↓

Create Reliable Workflows

↓

Handle Uncertainty

↓

Validate User Trust
```

---

# Before Designing

## User Context

Who uses the AI, tasks they perform, decisions they make, expertise level.

## AI Responsibility

```
What should the AI do?
What should the human control?
Where does human judgment matter?
```

Avoid replacing users unnecessarily and hiding important decisions.

---

# AI Product Principles

## AI Should Create Leverage

Help users think faster, work better, discover possibilities, and reduce repetitive work.

Avoid adding AI only because it is trendy.

## Uncertainty Is Normal

Design for partial answers, low confidence, and recoverable mistakes. Never pretend certainty the system does not have.

## Human Control Remains Visible

Approval, edit, undo, and stop actions must be available for consequential outcomes.

---

# Human-AI Relationship

Design the AI as assistant + collaborator + tool — not an unpredictable replacement.

Label generated content when users could mistake it for verified fact or human authorship.

---

# Interaction Patterns

## Conversation

Exploration, questions, guidance.

## Structured Inputs

Repeatable workflows, business processes, predictable outcomes.

## AI Actions

Automation, execution, recommendations with confirmations when irreversible.

Choose the pattern by task reliability needs, not by novelty of chat UI.

---

# Prompt And Instruction Design

Define clear expectations, capabilities, limitations, and output formats.

Users must understand:

```
What can it do?
What information does it need?
What will it produce?
```

Content Intelligence applies: short action labels, honest limitation language, no hype.

---

# Trust Design

Communicate confidence level, limitations, sources when appropriate, and reasoning where needed.

Avoid pretending certainty and hiding mistakes.

---

# Output Design

Outputs should be readable, actionable, editable, and understandable.

Support copy, refinement, feedback, and iteration.

Prefer structured results users can verify over undifferentiated walls of text.

---

# Error Handling

AI failures explain the issue, suggest alternatives, and preserve user progress.

Avoid silent failures and raw model errors as the only message.

Follow Error States System: what / why / fix, never blame.

---

# Workflow Pattern

```
User Goal

↓

Input Collection

↓

AI Processing

↓

Review

↓

Action

↓

Outcome
```

Skip review only when the action is low-risk and easily undone.

---

# Required States

```
Idle
Processing
Generating
Review
Success
Failure
```

Processing copy must name the process. Do not invent fake progress percentages.

---

# Performance And Accessibility

Optimize response speed, streaming feedback, context handling, and resource usage.

Support readable responses, keyboard interaction, screen readers, clear controls, and alternative interaction methods.

---

# Decision Criteria

Approve when:

- AI role and human control boundaries are explicit
- Consequential actions require confirmation
- Limitations are visible without burying the primary action
- Outputs are editable and recoverable
- Failure paths preserve user input
- Value is measurable as leverage on a real task

---

# Anti-Patterns

Reject:

- chat-only wrapping of workflows that need structured forms
- irreversible AI actions without confirmation
- confidence theater (`100% sure`) without basis
- hiding model limitations in legal footnotes alone
- generated content presented as verified data
- empty states that joke about “thinking” without teaching input needs

---

# AI Product Output

Example:

```
Product

Invoice extraction assistant

AI Role

Propose line items; human approves before sync

Interaction

Structured upload + review table (not chat-first)

States

Processing: Extracting line items…
Review: editable rows + confidence per field
Failure: Could not read this PDF — try a clearer scan. File kept.

Trust

Low-confidence fields flagged; never auto-post to accounting

Review

Pass
```

---

# Failure Conditions

Fails when:

- Users cannot tell suggestion from fact
- Errors lose input
- AI is present without task leverage
- Accessibility of generated content is ignored

---

# Quality Checklist

```
✓ AI purpose is clear
✓ User remains in control
✓ Outputs are useful
✓ Limitations are communicated
✓ Errors are recoverable
✓ Workflows are efficient
✓ Trust is maintained
✓ Accessibility is supported
✓ Product creates real value
```

---

# Review Questions

- What human judgment remains mandatory?
- Can a user undo or edit the AI’s last consequential step?
- Are limitations stated where decisions happen?
- Is chat used because it fits, or because it was the default?

---

# Final Instruction

Create AI products that amplify human ability.

Do not build AI features that simply generate text. Build intelligent systems that help people achieve meaningful outcomes with confidence.
