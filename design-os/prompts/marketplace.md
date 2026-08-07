# Marketplace Design Prompt
**Version:** 1.0  
**Status:** Production Marketplace Experience Design Prompt  
**Depends On:** Product Classifier, Ecommerce Intelligence, UX Intelligence, Content Intelligence, Forms System, Security Review

---

# Purpose

This prompt defines the process for designing production-quality marketplace platforms using the Design OS framework.

A marketplace is not simply an ecommerce store.

It is a system connecting multiple user groups:

- buyers
- sellers
- operators
- administrators

The experience must create trust, discovery, efficiency, and successful transactions between participants.

---

# Design Mission

```
Understand Participants

↓

Define Marketplace Dynamics

↓

Design Discovery

↓

Build Trust Systems

↓

Optimize Transactions

↓

Support Growth
```

---

# Before Designing

## Buyers

What they need, how they search, what builds confidence, what prevents purchase.

## Sellers

How they provide value, manage listings, and which tools they need.

## Operators

Moderation, quality control, dispute handling, marketplace health.

Decision criterion: write success metrics per side before UI. If one side’s success is undefined, stop.

---

# Marketplace Principles

## Trust Before Transactions

Accurate information, transparent processes, reputation systems, secure interactions.

Avoid unclear seller identity, hidden costs, and unreliable information.

## Dual-Sided Clarity

Buyer and seller language must not blur responsibilities, fees, or next steps.

## Honesty

No fake reviews, inflated ratings, or invented “popular” badges.

---

# Marketplace Architecture

```
Discovery

↓

Search And Filtering

↓

Listing Evaluation

↓

Communication Or Purchase

↓

Transaction

↓

Review And Retention
```

---

# Discovery And Search

Support categories, search, recommendations, sorting, and filtering.

Search should handle intent, suggestions, typos, and relevant ranking.

Avoid irrelevant results and overwhelming unfiltered choice.

---

# Listing Design

Every listing must answer:

```
What is offered?
Who provides it?
Why should I trust it?
What happens next?
```

Include clear title, quality imagery, description, pricing, availability, and seller information.

Fees and constraints that affect commit must appear before payment intent.

---

# Seller Experience

Support creating listings, managing inventory, receiving requests, and tracking performance.

Avoid unnecessary complexity and confusing seller workflows.

Seller empty states teach the first quality listing, not generic “nothing here.”

---

# Transaction Experience

Transactions must be clear, predictable, and secure.

Communicate status, responsibilities, and next steps for each side.

---

# Reviews, Reputation, Communication

Support authentic feedback, ratings, seller history, and buyer confidence.

If users communicate: clear threads, notifications, status updates, and safety controls.

Avoid fake reviews and misleading aggregates.

---

# Required Flow States

```
Loading
No Results
Unavailable
Pending
Completed
Failed
Disputed
```

Each state needs recovery language. Consult Empty and Error States systems.

---

# Mobile Marketplace Design

Prioritize discovery speed, image quality, easy filtering, simple communication, and quick actions.

Front-load listing titles and prices. Keep primary CTA ≤ 3 words when possible.

---

# Accessibility And Performance

Listings readable, images with alternatives, accessible controls and forms, assistive-tech navigation.

Optimize catalogs, search results, images, and updates. Slow discovery fails the marketplace.

---

# Decision Criteria

Approve when:

- Buyer and seller success paths are both complete
- Trust signals are real and understandable
- Fees and policies are clear before commit
- Search and empty/no-result states teach next steps
- Disputes and failures have owned recovery paths
- Operator tools cover moderation essentials for launch scope

---

# Anti-Patterns

Reject:

- single-sided design that ignores seller tooling
- hidden fees
- fake social proof
- infinite undifferentiated listings without filters
- chat without safety or expectation setting
- admin/moderation as an afterthought for launch-critical risk

---

# Marketplace Output

Example:

```
Participants

Buyers booking home services; verified local sellers; ops moderators

Buyer Success

Find → Compare trust signals → Book → Track → Review

Seller Success

Verify → List → Accept → Fulfill → Get paid

Trust

Verified badge rules documented; reviews only after completed jobs

Fees

Service fee shown in quote breakdown before confirm

States

No results: broaden area + clear filters
Failed payment: cart/job draft preserved

Review

Pass with dispute flow required before public launch
```

---

# Failure Conditions

Fails when:

- One side cannot complete its core job
- Trust is simulated rather than earned
- Money changes hands without clear terms
- Search failure leaves users with no recovery
- Safety/moderation gaps exist on known high-risk flows

---

# Quality Checklist

```
✓ User roles are understood
✓ Discovery is efficient
✓ Listings are trustworthy
✓ Transactions are clear
✓ Sellers have useful tools
✓ Reviews create confidence
✓ Mobile experience works
✓ Accessibility is supported
✓ Platform can scale within defined launch scope
```

---

# Review Questions

- Can a first-time buyer complete a trusted purchase?
- Can a new seller publish a quality listing without support chat?
- Are fees and responsibilities obvious before commit?
- What happens when search returns nothing?
- Who owns disputes, and is that visible in the product?

---

# Final Instruction

Create marketplaces that make exchanges feel safe, simple, and valuable.

Do not build listing pages alone. Build ecosystems where users can discover, trust, transact, and return.
