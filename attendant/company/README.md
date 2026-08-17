# SleeklyBuilt company corpus

Canonical company-truth documents for the Attendant and public policy pages.

## Authority

1. Legal / contractual public policies (05–14)
2. Company profile & catalogues (01–04)
3. Client experience (15–17)
4. Attendant authority internals (18–20) — **never expose to visitors**
5. Conversational improvisation (lowest)

Live tool results (prices, order status) override stale prose in these files.

## Access classes

See [`manifest.json`](manifest.json). Enforcement is in `php/attendant/src/CompanyDocumentStore.php` — not prompt-only.

## Sources

Derived from `docs/attendant/` Company Truth, legal briefs, and related design notes. Promote changes here before expecting runtime behavior.

## Disclaimer

Public policies are operational company policies for SleeklyBuilt. They are not a substitute for jurisdiction-specific legal counsel. Marked operating decisions should be reviewed before treating them as hard contractual commitments.
