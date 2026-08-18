# Discovery Plans

Scheduled Discovery Plans turn Lead Discover into an overnight Intelligence OS: configure targets once, walk away, triage the morning inbox.

## Plan types

| Type | What it does | Pipeline |
|------|----------------|----------|
| **Discovery** | Find new businesses for city × industry | Full: discover → resolve → crawl → BI → signals → score (+ optional browser/places) |
| **Monitor** | Re-check **known** accounts in a segment | Reduced: crawl → BI enrich → derive signals → score |

Monitor plans seed up to 40 known accounts for the target (forced `known_stale` so enrichment runs). They do **not** spend Places/CSE discover budget. They require prior discovery coverage for that city × industry.

When BI detects a business that previously had **no real website** and now does, the worker emits an enrichment intent signal `website_gained`.

## Operator loop

```text
Plans (Goal → Targets → Sources → Cadence)
  → Worker ticks due plans
  → Runs complete overnight
  → /ops morning inbox
  → Review queue / lead hub
  → Pitch Pack → on-demand draft → copy / mailto / wa.me → Record
  → Send to SleeklyBuilt CRM
  → Close won/lost in sleekly-dash
  → Outcomes pull → segment_performance → score + plan yield self-tune
```

## Creating a plan

1. Open **Discovery → Plans → New plan**.
2. **Goal:** name, discovery vs monitor, optional campaign/pack (pre-fills industries + presence lane).
3. **Targets:** countries, cities, industries.
4. **Sources / depth:** run profile, prospect focus (greenfield bias), BOI narrative.
5. **Cadence / caps:** every N hours, active hours, daily + concurrency caps.

Use **Run now** to enqueue immediately. Events (scheduled, skipped_*, failed, completed) appear on the plan detail page.

## Morning inbox

`/ops` shows what happened since your last visit: new qualified, plans completed, review required, outreach-ready, failed jobs — each links to work.

**Outcome learning** on the same page:

- Conversion by segment (`segment_performance`)
- Revenue by plan (CRM `lead_outcomes` → lead → business → discovery run → plan)

## CRM bridge (SleeklyBuilt / sleekly-dash)

Credentials in Settings (or env): `SLEEKLY_DASH_BASE_URL`, `SLEEKLY_DASH_SERVICE_TOKEN`.

- **Push:** lead hub “Send to SleeklyBuilt CRM” or audited bulk push.
- **Pull:** worker every ~5 minutes (outcomes + inbound) — no mocks; missing credentials = not configured.

See also: ulnovatech [`DISCOVERY_INTELLIGENCE.md`](../../ulnovatech/docs/DISCOVERY_INTELLIGENCE.md).

## Guardrails

- No scheduled LLM drafts per lead — drafts are on-demand and budget-capped.
- No email/WhatsApp auto-send — compose, copy, record only.
- Greenfield / social-only sure-deals are the primary discovery lane; redesign is a separate plan presence filter.
