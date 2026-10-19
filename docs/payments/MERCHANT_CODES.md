> Spec companion to [`PAYMENT_SYSTEM.md`](./PAYMENT_SYSTEM.md). UX gate: [`UX-GATE.md`](./UX-GATE.md). Admin UI lives in **sleekly-dash** (Settings → Payments), not Attendant.

**The payment system spec does not explicitly specify the merchant codes as configurable payment credentials.** It only says things like:

> `Merchant Code: XXXXXX`

inside the example payment instructions.

That is not sufficient for the actual implementation.

### How it should work

The **MTN merchant code and Airtel merchant number should be stored as configurable business/payment-provider settings in the admin dashboard**, not hardcoded throughout the frontend.

For example:

```text
Payment Settings
────────────────────────

MTN Mobile Money
Status: Active
Merchant Code: 123456

Airtel Money
Status: Active
Merchant Number: 070XXXXXXX

[Save Changes]
```

Then the customer checkout dynamically pulls the active configuration:

```text
Customer selects MTN
        ↓
System loads current MTN merchant code
        ↓
Shows the current code/instructions
```

Same for Airtel.

### Are the codes static or changeable?

The **merchant identifier assigned to your merchant account is normally persistent**, rather than something that changes for every payment. But the system should **not assume it is permanently hardcoded**.

There are legitimate reasons you may need to change what the website displays:

* you change merchant account
* you obtain a new merchant number/code
* you add another payment account
* you temporarily disable a provider
* you replace a merchant account
* business operations change

So architecturally:

**Merchant code = configurable provider credential, not application code.**

### I would add this to the specification

The payment configuration should be:

```text
PaymentProviderConfig

provider
display_name
merchant_identifier
is_active
display_order
payment_instructions
ussd_instruction
updated_at
updated_by
```

And the admin dashboard should have:

```text
ADMIN
→ Settings
→ Payments
→ MTN Mobile Money
→ Merchant Code

→ Airtel Money
→ Merchant Number
```

The checkout should **never contain a hardcoded `123456`-style merchant code**.

Also, changing the merchant code should **not alter historical transactions**. Existing payment records retain the provider/account context they were verified against; only new checkout/payment instructions use the updated configuration.

So yes: **make the merchant codes configurable from the dashboard, with MTN and Airtel independently enabled/disabled.** That's the production-correct design.


And for clarity, the payments dashboard shd be built as part of the existing sleeklybuilt admin dash system. 
here, admin can tweak merchants codes and other tweakable data. 