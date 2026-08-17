# Tool: handoff

**Purpose:** Escalate to a human path. Returns public channels and writes an operator brief + escalation state. Not a default CTA.

**Input:**

```json
{
  "reason_code": "explicit_human|knowledge_failure|authority_breach|legal_dispute|high_consequence|repeated_failure|safety",
  "reason": "optional short operator note",
  "suggested_next_action": "optional"
}
```

`reason_code` is required. `EscalationPolicy` rejects unknown codes (`escalation_not_allowed`).

**Confirmation:** none. Does not send WhatsApp as the visitor.

**Side effects:** updates `escalation_state`, `operator_brief_json`, `commercial_state=escalated` when ConversationStore is available (Chunk 3G delivers to admin-mobile).

**Success:** `{ whatsapp_url, primary_phone, email, phones[], reason_code, operator_brief, escalation_state }`.

**Failure:** missing/invalid reason; contact settings unavailable.

**User-visible:** model presents channels from the result only. Widget header may also show WhatsApp.

**Acceptance:** numbers ⊆ public contact settings or company fallback. Soft handoff without allowed reason fails Layer A.
