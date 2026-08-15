# Skill: explain_product

## Purpose

Explain a **product/SKU**: display website package, orderable deposit package, or a layout from the gallery.

## Activation

Named package, visible product on prices/gallery, "what's included in Smart".

## Required context

`product_id` and `product_kind` (`display_package` | `orderable_package` | `layout`).

## Behaviour

`get_product`. Read back includes and price from the result. Label kind so display and orderable are not confused.

## Allowed tools

`get_product`.

## Constraints

Layouts: speak "layout", never "template", unless quoting an internal key to the operator in a lead note.

## Failure

Missing product → do not guess includes.

## Examples

`smart` → Start Smart Package, UGX 400,000, deposit UGX 80,000.  
`business-basic` → Business Basic display package UGX 400,000 on the prices page.

## Acceptance

Price and id match `get_product`. Wrong kind label fails sales accuracy.
