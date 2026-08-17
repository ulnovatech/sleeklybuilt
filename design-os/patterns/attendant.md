# Attendant Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Messaging, Support, Contact, Empty States, Loading States, Error States, Feedback System, Mobile First, Accessibility Intelligence, Content Intelligence  
**Gated By:** Security Review, UX Review, Accessibility Review, Final Approval

---

# Purpose

The Attendant Pattern defines the complete solution for a site-resident professional who talks with a visitor in natural language, knows the current page, and can act through approved tools.

This is not a chatbot, not a help-centre search box, and not a contact form with a speech bubble. It is a natural-language operating interface to the SleeklyBuilt website and the backends that already exist.

The product succeeds when the visitor feels they are speaking with a competent person who works here: short answers, correct facts, useful next steps, real actions, honest failures.

The product fails when it generates impressive text, invents prices, claims an order was placed, or hides the path to a human.

---

# When To Use

Use this pattern when:

- the visitor is already on the marketing site and needs advice, navigation, or a real business action
- the business has structured products, pages, and backends the attendant can call
- a human path (WhatsApp, phone, email) must remain visible
- conversation history must survive across pages in one session

---

# When Not To Use

Do not use this pattern when:

- the only job is a one-shot contact form — use the Contact Pattern
- staff must triage many human-to-human threads — use the Messaging Pattern
- the visitor is already inside an authenticated product with a ticket workflow — use the Support Pattern
- there is no real backend for the promised action — do not ship a simulated attendant

---

# User Goal

The visitor is answering one of these, in order:

```
Can someone here tell me whether this is right for my business?

↓

Can they show me the relevant page or section?

↓

Can they actually send my request or start an order?

↓

If not, can I reach a person without starting over?
```

---

# User Journey

```
Arrives on a SleeklyBuilt page (home, product, prices, layout gallery)

↓

Opens the attendant from a persistent launcher

↓

Sees a situated empty state that already knows the current page

↓

Asks in their own words

↓

Gets a short, correct answer (and optionally is taken to a section)

↓

If ready: confirms a lead or quote request

↓

Sees the real backend result, or an honest failure plus WhatsApp/call
```

The last step is the honesty requirement. A message that looks sent and was not is a product failure.

---

# UX Flow

## Entry

- Persistent launcher on every marketing route, bottom-right, 48×48 minimum.
- Opening from the current page must carry URL, page id, section id, and visible product/service into the first turn.
- Do not reset conversation when the visitor navigates because the attendant took them somewhere.

## Conversation

- One composer. One transcript. No suggested-chip wall competing with the first message.
- Answer first. One useful next step. Do not interrogate.
- Streaming text must not be presented as complete until the server finishes.

## Action

- Navigation and section highlight happen without a confirm dialog.
- Lead capture and quote submission require an explicit confirm control in the panel, backed by a server `confirmation_token`.
- Payment is never taken in this surface. Direct the visitor to `/portfolio-app/order` or say the attendant cannot take payment.

## Exit to human

WhatsApp and call are in the panel header at every state, including error. Hiding them until the bot fails is prohibited.

---

# Screen Layout

## Mobile (collapsed)

```
┌──────────────────────────┐
│                          │
│  page content            │
│                          │
│                     [A]  │  launcher only
└──────────────────────────┘
```

One gold control in the viewport: the launcher. Do not keep a second floating WhatsApp chip beside it.

## Mobile (open)

```
┌──────────────────────────┐
│ SleeklyBuilt      WA  Call X │
├──────────────────────────┤
│                          │
│  transcript              │
│  (situated empty,        │
│   stream, confirm,       │
│   or error)              │
│                          │
├──────────────────────────┤
│  composer                │
│  [ message field ] [send]│
└──────────────────────────┘
```

Full-bleed bottom sheet ~92vh. Composer padding accounts for the home indicator. Touch targets 44×44.

## Tablet / Desktop (open)

```
┌─────────────────────────────────────┐
│ page content                        │
│                          ┌─────────┐│
│                          │ header  ││
│                          │ transcript│
│                          │ composer││
│                          └─────────┘│
└─────────────────────────────────────┘
```

Docked panel ~380px wide, above the footer, not covering the primary heading of the page. Same component tree as mobile.

---

# Component Hierarchy

```
AttendantProvider
  AttendantLauncher
  AttendantPanel
    AttendantHeader (title, WhatsApp, call, close)
    AttendantTranscript
      AttendantMessage (visitor | attendant | system)
      AttendantStatus (streaming | tool-in-progress)
      AttendantConfirm (consequential actions only)
      AttendantEmpty
      AttendantError
    AttendantComposer
```

Do not introduce a second conversation surface. Do not nest cards inside the transcript unless a confirm block is the interaction.

Tokens: `surface-raised`, `content-primary`, `action-primary`, `accent` (launcher only), `status-*`, `ring-dos`. No raw hex.

---

# Interaction Flow

```
Tap launcher
  → panel open, focus composer (desktop) or first heading (mobile)
  → empty state uses current page

Send
  → visitor bubble appears immediately (optimistic, marked sending)
  → server ack promotes it to sent
  → stream attendant tokens
  → optional client actions: navigate, highlight
  → optional confirm block

Confirm
  → POST confirm with token
  → report verified backend result only

Close
  → conversation id persists in session storage
  → reopen at the last read position
```

---

# States

## Loading — session restore

Skeleton rows matching message bubbles. No spinner occupying the whole sheet.

## Loading — in-flight reply

Keep prior messages. Show a streaming cursor on the attendant bubble. Disable send.

## Empty — new conversation

One or two sentences that name the current page. Example on `/websites`: "You're on Websites. Ask about a layout, timing, or whether a Sleek Page is enough." No "How can I help you today?"

## Empty — restored but no messages (expired session)

"That session ended. Ask again — I'll stay on this page." Offer WhatsApp.

## Error — network or 5xx

What failed, that nothing was submitted, Retry, WhatsApp. Never blame the visitor.

## Error — missing Gemini key / model unavailable

"I can't reply just now." WhatsApp and call remain. Do not invent an answer.

## Error — tool failed

"I couldn't complete that just now." If a lead or order was attempted: "It was not sent."

## Success — lead or quote

Short confirmation near the confirm control, including the real reference the backend returned (`MSG-0001` style or order id).

## Disabled

Send disabled while streaming or while a confirm is unresolved.

## Hover / focus / pressed

Launcher and send use visible focus rings (`ring-dos`). Pressed state 150–200ms. Respect `prefers-reduced-motion`.

---

# Mobile Behavior

- Sheet, not a tiny floating card.
- One-handed reach: launcher and send in the thumb zone.
- Keyboard open must not hide the last message; transcript scrolls.
- WhatsApp and call stay tappable while the keyboard is open (header, not overlaying the field).

---

# Desktop Expansion

- Wider transcript, still one column of messages.
- Opening does not steal the page's primary CTA.
- Keyboard: `Esc` closes. Focus trap while open.

---

# Accessibility Requirements

- Launcher `aria-label` "Open SleeklyBuilt attendant". Panel `role="dialog"` `aria-modal="true"` with labelled title.
- Transcript is a live region for new attendant text (`aria-live="polite"`). Do not live-region every token if that floods AT; announce when a reply completes and when a confirm appears.
- Composer has a visible label, not placeholder-only.
- Colour is not the only status signal (sending / failed / confirmed).
- Contrast on cream and on any obsidian header must meet AA.
- Reduced motion: no entrance bounce; instant open.

---

# Data Requirements

The client sends structured page context with every message. The server owns conversation history, pending confirmation tokens, and tool results.

The UI must never display a price, order id, or "sent" state that did not come from a tool result or structured knowledge payload.

---

# Performance Requirements

- First panel paint from local session metadata, not a blocking round trip.
- Target reply start 1–4s after send under normal load.
- Do not load the Gemini SDK in the browser. The browser talks only to `/php/attendant/`.

---

# Anti-Patterns

- Purple chat bubble, unread badge theatre, or "AI assistant" sparkle branding
- Chip carousels of canned questions as the empty state
- Repeating the visitor's sentence back
- Offering navigation after every answer
- Confirm dialogs for scrolling to pricing
- Taking payment in the panel
- Claiming success when the backend did not
- A second floating WhatsApp button competing with the launcher
- Resetting the thread on route change
- Exposing skills, prompts, or model names to the visitor

---

# Pattern Output Example

Visitor on `/prices`, looking at Business Basic:

> How much is this one?

Attendant:

> Business Basic is UGX 400,000 on this page. That is the published website package for most small businesses. Layout deposits at checkout use the Basic / Smart / Premium set — I can show those, or send a quote request.

No navigation unless they ask to see it.

---

# QA Checklist

- [ ] Launcher on every marketing route, 48×48, one gold control
- [ ] Panel empty state names the current page
- [ ] WhatsApp and call visible in the header in empty, loading, error, success
- [ ] Streaming is not marked complete until the server finishes
- [ ] Navigate/highlight require no confirm; lead/quote require confirm + token
- [ ] Failed tool never shows a success line
- [ ] Keyboard: focus trap, Esc, labelled composer
- [ ] Mobile sheet usable with one hand and with keyboard open
- [ ] Tokens only — no unexplained raw hex
- [ ] Conversation survives in-site navigation

---

# Final Rule

If the panel could be swapped onto another brand's site after stripping the header word "SleeklyBuilt", the attendant is too generic. If it could claim an order without `order.php` succeeding, it is not this pattern.

---

# As-built notes (repo — Chunks 2–3)

These are product facts already shipped; do not re-invent:

- **Decision UI:** SSE `choices` → chips → `choice.php` (composer disabled while pending).
- **Policies:** `/policies/:slug` with `data-attendant-section`; path-segment registry nav; highlight via `section_id` when hash is null.
- **Payment:** confirmed quote → client navigate to `/portfolio-app/order` only; never attendant `payment-init`.
- **Human channel:** escalation pauses the LLM; admin-mobile Attendant inbox; visitor polls human messages; WhatsApp remains a parallel escape.
- **Quality gate:** `attendant/QUALITY_RUBRIC.md` + Layer A `php/attendant/tests/run.php` + widget check script.
