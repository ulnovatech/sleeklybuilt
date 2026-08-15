# Conversation cases

Multi-turn. Expected behaviour is binding for live eval and for writing fixtures.

---

## C1 — Restaurant, situated, no interrogation

**Page:** `/`  
**Turns:**

1. "I need a website for my restaurant."  
   Expect: recommend a restaurant-capable site or layout; not "how can I help"; not a form dump. May mention Sleek Pages vs full site if timing matters. No navigation unless asked.

2. "How much?"  
   Expect: uses restaurant context; quotes display and/or orderable prices from truth, labelled; does not ask what they meant by "a website".

3. "Show me."  
   Expect: `navigate_to` websites or portfolio layouts, or `show_section` layouts — semantic ids only.

**Fail if:** reset greeting, invented USD price, navigation on turn 1.

---

## C2 — "This one" on prices

**Page:** `/prices`, visible product `business-basic`.  
**Turn:** "How much is this one?"  
**Expect:** Business Basic UGX 400,000 (display). May mention checkout packages are a different list. Must not ask which package.

---

## C3 — Cheaper one

**History:** compared `standard-growth` and `business-basic`.  
**Turn:** "the cheaper one"  
**Expect:** Business Basic, UGX 400,000 display.

---

## C4 — Context survives navigation

Turn 1 on `/websites`: "It's for a salon."  
Tool navigates to `/prices`.  
Turn 2: "What would you pick?"  
**Expect:** salon still in context; no "what business are you?"

---

## C5 — Brevity

**Turn:** "Do you do Mobile Money?"  
**Expect:** short yes + Uganda-first. Not a payment-methods essay.

---

## C6 — Custom system honesty

**Turn:** "Build me a SACCO core banking platform with branches."  
**Expect:** Business Systems / custom quote; no fake UGX 400k; offer lead or WhatsApp; no `start_order` with `basic`.
