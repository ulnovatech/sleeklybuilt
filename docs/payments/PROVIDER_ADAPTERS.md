# Provider adapters (Phase 6)

**Status:** Boundaries shipped — official HTTP clients not live  
**Policy:** No unofficial SMS scraping. Manual admin entry is the production evidence path.

Companion to [`PAYMENT_SYSTEM.md`](./PAYMENT_SYSTEM.md) §§50–51, 87, Chunk 6–7.

---

## Architecture

```text
Checkout / Claim / Match / Verify / Receipt / Notify / Activate
        ↑ unchanged

Transaction evidence sources (pluggable):
  ├─ manual   (enabled) — admin enters merchant SMS/account in dash
  ├─ mtn      (stub)    — official MTN MoMo API when credentials + HTTP client exist
  └─ airtel   (stub)    — official Airtel Money API when credentials + HTTP client exist

Ingestion → payment_transactions (status=unmatched) → admin attach/confirm
Never auto-verify from an adapter alone.
```

---

## Code map

| Piece | Path |
| --- | --- |
| Contract | `php/payments/providers/Contract.php` |
| Normalize | `php/payments/providers/normalize.php` |
| Manual (production) | `php/payments/providers/ManualAdminAdapter.php` |
| MTN stub | `php/payments/providers/MtnMoMoAdapter.php` |
| Airtel stub | `php/payments/providers/AirtelMoneyAdapter.php` |
| Registry | `php/payments/providers/ProviderRegistry.php` |
| Ingestion | `php/payments/ingestion.php` |

---

## Admin API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/payments/adapters` | Capability report (admin) |
| `POST` | `/api/payments/adapters/{mtn\|airtel}/pull` | Attempt fetch (stubs return clear error; default `dry_run: true`) |
| `POST` | `/api/payments/webhooks/{mtn\|airtel}` | Reserved; returns `503`/`501` until adapter `can_webhook` |

---

## Enabling an official adapter (later)

1. Obtain **official** MTN / Airtel merchant API access (not device SMS forwarding).
2. Set env (examples — names only; never commit secrets):

```text
MTN_MOMO_API_ENABLED=true
MTN_MOMO_API_BASE_URL=
MTN_MOMO_API_PRIMARY_KEY=
MTN_MOMO_API_USER_ID=
MTN_MOMO_API_USER_SECRET=

AIRTEL_MONEY_API_ENABLED=true
AIRTEL_MONEY_API_BASE_URL=
AIRTEL_MONEY_API_CLIENT_ID=
AIRTEL_MONEY_API_CLIENT_SECRET=
```

3. Implement the HTTP client inside `fetchRecentTransactions` / webhook signature verify.
4. Flip `can_fetch` / `can_webhook` in `capabilities()` only when real calls work.
5. Ingest still lands in **unmatched**; admin confirm remains the financial authority unless a separate explicit policy is approved.

---

## Forbidden

* Android SMS listeners as a foundational dependency  
* Fake / demo transaction generation presented as live  
* Auto-marking claims `verified` from adapter pull alone  
* Hardcoding merchant codes in adapters (use `payment_provider_config`)
