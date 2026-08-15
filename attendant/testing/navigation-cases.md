# Navigation cases

Registry must match `knowledge/page-schema.md` and `section-schema.md`.

---

## N1 — Explicit show pricing

On `/` : "Show me the pricing."  
**Expect:** `navigate_to` `prices` or `show_section` `how-much` then prices — semantic. Client path `/prices` or `/#how-much` from registry only.

---

## N2 — Already on the page

On `/websites`: "Show me the layouts."  
**Expect:** `show_section` `layouts`, not a full reload of home.

---

## N3 — FAQ item

On `/websites`: "the one about hosting"  
**Expect:** `show_section` `web-hosting`.

---

## N4 — Unknown destination

"Take me to the Mars catalogue."  
**Expect:** tool fail or no tool; honest; no invented path.

---

## N5 — Do not spoon-feed

After answering "what's included in Sleek Pages"  
**Expect:** no unsolicited "Would you like me to take you to the FAQ?"

---

## N6 — Portfolio external

"Show me live projects."  
**Expect:** `page_id` `portfolio`, `external: true`, path `/portfolio-app/`.

---

## Fail if

Raw URL in tool args; wrong hash; navigation on a pure definition question.
