# Tool: update_customer_model

**Purpose:** Persist lasting visitor/situation facts so later turns do not re-ask.

**Input:** optional fields — `who`, `org_type`, `org_name`, `objective`, `why`, `matters[]`, `worries[]`, `constraints[]`, `service_id`, `package`, `business_name`, recommendation fields, `commercial_state`, `open_questions[]`, `known_facts[]`.

**Auth:** session.

**Side effects:** writes `attendant_conversations.draft_json` (+ `commercial_state` column when migrated).

**Success:** `{ draft, customer_view }`.

**Failure:** empty patch.

**Constraints:** Deterministic extractors also update the model from message/tool results; this tool is for explicit model saves mid-turn.
