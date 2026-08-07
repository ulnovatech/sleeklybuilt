# Content Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, UX Intelligence, Accessibility Intelligence, Empty States System, Error States System, Forms System

---

# Purpose

Content Intelligence determines what the product says, how it says it, and whether that language helps users act with confidence.

Content is not decoration applied after design.

Content is the interface:

- it names actions
- it explains states
- it sets expectations
- it repairs trust when things fail
- it teaches when nothing exists yet

A polished layout with weak copy is still a weak product.

---

# Core Philosophy

Write for the next action, not for the brand brochure.

Every string should answer at least one of:

- What is this?
- What should I do?
- What happens if I do it?
- What went wrong, and how do I recover?

If a sentence does none of these, remove it.

Honesty is a product requirement. Never invent proof, inflate metrics, or soften failures into vagueness.

---

# Content Decision Pipeline

Every interface follows:

```
Product Classification

↓

Audience And Context

↓

Voice And Tone

↓

Message Hierarchy

↓

Microcopy Decisions

↓

State Language

↓

Length And Mobile Pass

↓

Honesty And Inclusion Review
```

---

# Step 1 — Classify The Product

Product type changes voice. Do not reuse marketing tone inside operational tools.

## Marketing Surfaces

Landing pages, portfolios, agency sites, product marketing.

Prefer:

- outcome language
- concrete claims
- clear next steps

Avoid:

- internal jargon
- feature dumps without benefit

---

## Operational Products

Dashboards, SaaS apps, admin panels, marketplaces, AI tools.

Prefer:

- precise nouns
- status clarity
- recoverable instructions

Avoid:

- cleverness that slows comprehension
- marketing adjectives on system messages

---

## Consumer Mobile Apps

Short sessions, one-handed use, interrupted attention.

Prefer:

- front-loaded verbs
- short labels
- immediate feedback language

Avoid:

- multi-clause sentences on primary screens

---

# Step 2 — Define Voice By Product Type

Voice is the stable personality. Tone is how voice flexes by situation.

## Voice Criteria

Decide:

- Formality level
- Warmth level
- Directness level
- Humor policy (usually none in errors and payments)

Record a one-sentence voice brief before writing UI strings.

Example:

```
Clear, calm, and specific. Speaks like a capable colleague.
Never sarcastic. Never vague about money, data, or failure.
```

---

## Tone Shifts By Situation

| Situation | Tone | Rule |
|---|---|---|
| First visit / empty | Helpful, instructive | Teach the first action |
| Success | Confirming, brief | Confirm and stop |
| Warning | Direct, calm | Name the risk |
| Error | Neutral, practical | What / why / fix |
| Marketing hero | Confident, concrete | Outcome without hype |

Never use playful tone for irreversible actions, billing, security, or data loss.

---

# Step 3 — Establish Message Hierarchy

## Primary Message

The one idea the user must understand first.

Tests:

- readable in under three seconds
- survives removal of adjectives
- does not require prior product knowledge

---

## Supporting Message

Clarifies scope, audience, or mechanism.

Length rule:

- one short sentence when possible
- two sentences maximum near a primary CTA

---

## Tertiary Message

Helpers, footnotes, legal, metadata.

Keep tertiary content out of the primary visual path unless legally required.

---

# Step 4 — Write Microcopy

## Buttons And Primary CTAs

Rules:

- Lead with a verb that names the outcome
- Prefer first person only when it reduces ambiguity (`Start my trial`)
- Avoid vague labels: `Submit`, `OK`, `Click here`, `Continue` without context
- Primary CTA ≤ 3 words when possible
- Secondary actions may use 2–5 words if clarity requires it

Good:

```
Save changes
Send message
Create project
Book call
```

Weak:

```
Submit form
Proceed
Click to continue
Get started now today
```

Destructive actions must name the object:

```
Delete project
Cancel subscription
Remove member
```

Never use `Delete` alone when multiple deletable things are on screen.

---

## Labels

Field and control labels must:

- name the data, not the UI widget
- remain visible (placeholders are not labels)
- match the vocabulary users already use

Prefer:

```
Work email
Company name
Delivery address
```

Avoid:

```
Enter your email here
Type something
Info
```

---

## Helper Text

Helpers exist to prevent errors before they happen.

Use helpers when:

- format is non-obvious
- consequences are not visible
- a field is optional but useful

Do not use helpers to restate the label.

Good:

```
Use the email where you receive invoices.
```

Weak:

```
Please enter your email address in this field.
```

---

## Link Text

Links must describe destination or action without relying on surrounding sentence alone.

Good:

```
View pricing
Read accessibility statement
```

Weak:

```
Learn more
Click here
Here
```

---

# Step 5 — Empty-State Language

Empty states teach. They do not apologize for the product existing.

Required structure:

```
What is missing

↓

Why it is empty (when useful)

↓

What to do next

↓

Primary action label
```

Rules:

- Explain the absence in plain language
- Offer one clear next step
- Do not guilt the user (`You haven't done anything yet`)
- Do not condescend (`It's easy! Just...`)
- Do not fake content to avoid emptiness

Good:

```
No orders yet
When customers place orders, they will appear here.
Create your first product to start selling.
```

Weak:

```
Nothing here!
Oops, empty.
Looks like you are lazy.
```

Consult Empty States System for layout and component behavior. Content Intelligence owns the words.

---

# Step 6 — Error Language

Errors repair trust when they tell the truth and provide a path forward.

Required structure:

```
What happened

↓

Why it matters (if not obvious)

↓

How to fix it

↓

What was preserved (when relevant)
```

Rules:

- Never blame the user
- Never use `Invalid input` without saying which field and what format is expected
- Never hide behind `Something went wrong` when a specific cause is known
- Prefer human-readable causes over raw codes in the primary message
- Technical codes may appear as secondary detail for support

Good:

```
Payment could not be completed
Your card was declined by the bank.
Try another card or contact your bank. Your cart is still saved.
```

Weak:

```
Error
You entered wrong details
Request failed with status 402
Oopsie!
```

Consult Error States System for severity, placement, and recovery patterns. Content Intelligence owns the wording contract: what / why / fix, never blame.

---

# Step 7 — Loading And Success Copy

## Loading

Loading copy is optional. Prefer skeletons that match layout.

When copy is needed:

- Name the process, not the wait
- Avoid fake precision (`Almost done...` looping forever)
- Avoid humor that ages poorly during long waits

Good:

```
Saving changes…
Uploading images…
Generating report…
```

Weak:

```
Hang tight!
Magic in progress
Please wait while we do amazing things
```

If duration is predictably long, say so once:

```
This usually takes about a minute.
```

Do not invent progress percentages unless progress is real.

---

## Success

Success copy confirms completion near the action, then gets out of the way.

Rules:

- Confirm the outcome, not the click
- Keep to one short sentence
- Include next step only when the workflow continues
- Do not celebrate routine saves with banners that block work

Good:

```
Project created
Invite sent
Changes saved
```

Weak:

```
Success!!!
You did it!
Operation completed successfully
```

---

# Step 8 — Honesty Rules

Content that cannot be verified must not ship.

Never:

- invent customer counts, ratings, or testimonials
- display placeholder social proof as if live
- claim rankings or awards that do not exist
- round metrics in a way that changes meaning
- use `as seen in` logos without permission and accuracy
- imply partnerships that are only aspirational

If proof is missing:

- remove the claim
- replace with a verifiable alternative
- or lower the ask instead of inventing evidence

Specificity beats intensity.

Prefer:

```
Ships in 2 business days
```

Over:

```
Lightning-fast delivery loved by thousands
```

When using numbers:

- source them
- date them when they age
- define the unit (`active teams`, not `users` if the metric is teams)

---

# Step 9 — Forms Language

## Field Naming

Name fields after the information requested, in the user's words.

Rules:

- One concept per label
- Avoid duplicate labels that differ only by placeholder
- Mark required fields consistently across the product
- Prefer `Required` markers over surprise validation after submit

Required-field language:

```
Required
```

Or inline:

```
Email (required)
```

Avoid:

```
* means important
Fill this or else
Mandatory field missing
```

Optional fields:

```
Company (optional)
```

Do not mark every optional field if most fields are required; mark the exception set consistently.

---

## Validation Messages

Validation messages must be specific and local to the field.

Good:

```
Enter a phone number with country code, like +234...
Password must be at least 12 characters
```

Weak:

```
Invalid
Wrong
Fix errors and try again
```

When multiple fields fail, summarize once and keep field-level detail.

Consult Forms System for structure, grouping, and interaction. Content Intelligence owns naming and message quality.

---

# Step 10 — Length Limits (Checkable)

These limits are review gates, not suggestions.

## Primary CTA

- ≤ 3 words when possible
- ≤ 24 characters preferred
- Must remain intelligible when truncated is not an option — do not truncate CTAs

## Secondary Button

- ≤ 5 words
- Must not compete with primary CTA wording

## Page Or Screen Headline

- Readable as one idea at mobile width
- Prefer ≤ 8 words for UI screens
- Marketing headlines: prefer ≤ 60 characters

## Supporting Sentence

- ≤ 160 characters near hero or page header
- One job only

## Empty-State Title

- ≤ 6 words

## Empty-State Body

- ≤ 2 short sentences

## Error Title

- ≤ 8 words

## Error Body

- What / why / fix in ≤ 3 short sentences

## Toast Or Inline Success

- ≤ 6 words unless a next step is required

## Helper Text

- ≤ 2 sentences
- Prefer one

If copy exceeds a limit, rewrite before requesting a layout exception.

---

# Step 11 — Inclusive Language

Write for the widest competent audience.

Rules:

- Use people-first or identity-respecting language as appropriate to context; never demean
- Avoid gendered defaults (`guys`, `he/she` when `they` or role names work)
- Avoid ableist metaphors (`blind to`, `crazy`, `lame`)
- Avoid cultural idioms that fail translation
- Do not assume family structure, income, or device quality
- Prefer role and task language over personality judgments

Good:

```
Team members
People who place orders
Users who need screen readers
```

Weak:

```
Guys on the team
Normal users
Dumb mistakes
```

Accessibility-related copy must describe the barrier and the fix, never the person's capability.

---

# Step 12 — Content For Mobile

Mobile content is shorter and front-loaded.

Rules:

- Put the outcome in the first three words of headlines when possible
- Cut preamble (`In order to...`, `Please note that...`)
- Prefer scannable fragments over paragraphs on primary screens
- Keep key actions visible without relying on hover-only text
- Assume interrupted reading: each block should make sense alone

Mobile rewrite test:

1. Read only the first line of each block
2. Confirm the next action is still obvious
3. If not, rewrite; do not add more text

Desktop may add detail below the fold. It must not invent a different promise.

---

# Domain Rules

## Buttons

- Verb + object when ambiguity exists
- Match the result users will see after the action
- Loading state replaces label with process verb (`Saving…`) not a spinner alone without accessible name

## Navigation Labels

- Noun destinations for places (`Orders`, `Settings`)
- Verb phrases only for actions (`Create order`)
- Never duplicate two nav items with synonyms

## Permissions And Security

- Explain why access is needed before asking
- Describe consequences of denial
- Never use fear copy to force consent

## Pricing And Money

- Exact currency and amount
- State what is included
- No hidden `from` pricing without accessible full terms nearby

## AI Products

- Distinguish model suggestion from confirmed fact
- Label generated content when users could mistake it for human or verified data
- State limitations without theatrical disclaimers that bury the action

## Marketplaces

- Seller and buyer language must not blur responsibilities
- Fees, shipping, and policies use plain language before commit

---

# Content Anti-Patterns

Never ship:

- fake social proof or invented metrics
- blame-the-user errors
- empty states that shame or joke without teaching
- primary CTAs longer than necessary or vague (`Submit`, `Learn more` as primary conversion)
- placeholders left in production (dummy latin filler, unfinished copy markers, blank bracket notes)
- humor in irreversible or financial flows
- all-caps sentences for emphasis
- exclamation marks on system status by default
- contradictory promises between hero and checkout
- jargon that only the internal team understands

---

# Content Intelligence Output

Example:

```
Product

Restaurant ordering app

Voice Brief

Clear, calm, specific. No jokes in checkout or failures.

Primary CTA Pattern

Add to cart
Place order
Track order

Empty State — Orders

Title: No orders yet
Body: Your past orders will show up here after your first purchase.
Action: Browse menu

Error — Payment Declined

Title: Payment could not be completed
Body: Your bank declined this card. Try another card. Your cart is saved.
Blame: none

Success — Order Placed

Order placed
Estimated ready in 25–35 minutes

Honesty Check

No invented review counts
Prep-time range based on kitchen estimate, labeled as estimate

Mobile Pass

Headlines front-loaded
Primary CTAs ≤ 3 words
Helpers one sentence

Inclusive Language

Pass

Review

Pass
```

---

# Failure Conditions

Content Intelligence fails when:

- Voice is undefined and strings feel authored by different people
- Primary actions are vague or longer than the length gates allow
- Empty states do not teach a next step
- Errors blame the user or omit recovery
- Loading or success copy invents progress or celebrates noise
- Proof, metrics, or testimonials cannot be verified
- Form labels and required-field language are inconsistent
- Mobile copy requires full desktop context to understand
- Inclusive language rules are violated
- Placeholder or temporary copy reaches production

---

# Review Questions

Before approval:

- Does every primary screen answer what to do next in plain language?
- Are primary CTAs ≤ 3 words when possible and outcome-named?
- Do empty states teach without condescension?
- Do errors follow what / why / fix with no blame?
- Is loading and success copy honest and brief?
- Can every claim and metric be verified?
- Are form labels clear and required fields consistently marked?
- Does mobile copy remain understandable when skimmed?
- Is inclusive language respected throughout?
- Would removing any sentence improve clarity?

---

# Final Rule

Content is a product decision, not a polish pass.

If the words are vague, dishonest, or unhelpful, the interface is unfinished—no matter how refined the layout looks.

Write so users can act with confidence on the first read.
