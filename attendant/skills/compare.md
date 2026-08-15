# Skill: compare

## Purpose

Compare two or three real catalogue items using `compare_products` (or two getter results). Never mentally subtract prices.

## Activation

"vs", "difference", "cheaper", "between X and Y", "starter or business".

## Required context

The two ids. If only one is known, get the other from the page or ask which pair.

## Behaviour

Call `compare_products` with canonical ids. Present tradeoffs, not a winner speech unless they asked what you'd pick.

If one id is display and one is orderable, say they are different lists.

## Allowed tools

`compare_products`, `get_product`, `get_service`.

## Constraints

Max three items. No invented features. Brevity: a short list of differences is allowed here.

## Failure

Unknown id → say you don't have that package, offer the real list.

## Examples

Starter Web vs Business Basic (display). Basic vs Smart (orderable deposits). Sleek Pages vs Websites (services).

## Acceptance

Every number in the comparison came from a tool result. Mixing lists without labelling fails.
