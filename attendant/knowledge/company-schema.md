# Company schema (structured truth)

## Why

Company facts must not be sampled from the model's pretraining. The engine supplies a company record each session (and after `handoff`).

## Record

| Field | Type | Source |
| --- | --- | --- |
| `brand_name` | string | `site.config` / public site-contact `brandName` |
| `legal_name` | string | same |
| `tagline` | string | site.config |
| `description` | string | site.config |
| `email` | string | public site-contact, fallback `sales@sleeklybuilt.pro` |
| `phones` | string[] | public site-contact |
| `primary_phone` | string | E.164-ish as stored |
| `whatsapp_url` | string | `https://wa.me/…` |
| `location` | string | Kampala, Uganda |
| `address_note` | string | e.g. office under development |
| `social` | object | x, instagram, linkedin, youtube URLs |

## Behaviour

The attendant may quote these. If site-contact fetch fails, PHP may fill from `site.config.js` equivalents in the knowledge JSON — still not from the model.

## Out of bounds

No employee roster, no Discovery accounts, no bank details, no Flutterwave keys.

## Acceptance

Visitor-visible phone/email ⊆ this record for the turn.
