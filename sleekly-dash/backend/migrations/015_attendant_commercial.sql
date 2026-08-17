-- SleeklyBuilt Attendant — commercial / escalation columns for operator queries
-- Apply: php php/attendant/scripts/apply_attendant_migration.php 015
-- Safe to re-run: uses information_schema guards in the apply script for ALTER paths.

ALTER TABLE attendant_conversations
  ADD COLUMN commercial_state VARCHAR(32) NOT NULL DEFAULT 'discovery' AFTER draft_json,
  ADD COLUMN escalation_state VARCHAR(32) NOT NULL DEFAULT 'autonomous' AFTER commercial_state,
  ADD COLUMN operator_brief_json JSON NULL AFTER escalation_state,
  ADD KEY idx_attendant_conversations_commercial (commercial_state),
  ADD KEY idx_attendant_conversations_escalation (escalation_state);
