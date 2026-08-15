# Tool: handoff

**Purpose:** Return human channels from `GET /api/public/site-contact` (server-side fetch or shared SettingsController data). Fallback: static company record from knowledge JSON, still not from the model.

**Input:** `{ "reason"?: string }` optional telemetry.

**Confirmation:** none. This does not send a WhatsApp message as the visitor.

**Side effects:** none (telemetry `handoff=true`).

**Success:** `{ whatsapp_url, primary_phone, email, phones[] }`.

**Failure:** if both remote and fallback missing — `ok: false` (should not happen if knowledge JSON exists).

**User-visible:** model presents these channels. Widget header already shows them (Chunk 2).

**Acceptance:** numbers ⊆ public contact settings or site.config fallback used by the engine.
