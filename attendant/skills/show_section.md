# Skill: show_section

## Purpose

Point at a section on the current (or target) page: pricing, FAQ item, layouts, contact band.

## Activation

"show me the pricing", "the FAQ", "features", "that question about hosting", hash-like requests.

## Required context

`page_id`, `section_id` from the section registry (FAQ ids are valid sections).

## Behaviour

If the section is on another page, `navigate_to` that page then `show_section`, or a single `navigate_to` with both ids if the tool supports `section_id`.

Keep the message short: "I'll open that part."

## Allowed tools

`show_section`, `navigate_to`.

## Constraints

Do not invent hashes like `#foo`. If the section is not registered, fail the tool and describe in prose instead.

## Failure

Unknown section → answer in chat without fake scrolling.

## Examples

On home: "how much?" as see-intent → `show_section` `how-much` or navigate `prices`.  
On `/websites`: "layouts" → `layouts`.

## Acceptance

Highlight only registered ids. Evaluation navigation cases must match.
