-- Attendant operator channel (Chunk 3G)
-- Apply via: php php/attendant/scripts/apply_attendant_migration.php 016

ALTER TABLE attendant_messages
  MODIFY COLUMN role ENUM('visitor', 'attendant', 'system', 'human') NOT NULL;

ALTER TABLE attendant_messages
  ADD COLUMN idempotency_key VARCHAR(64) NULL AFTER tool_ok;

ALTER TABLE attendant_messages
  ADD UNIQUE KEY uk_attendant_messages_idem (conversation_id, idempotency_key);

ALTER TABLE attendant_conversations
  ADD COLUMN escalated_at DATETIME NULL AFTER operator_brief_json,
  ADD COLUMN human_taken_at DATETIME NULL AFTER escalated_at,
  ADD COLUMN operator_user_id INT NULL AFTER human_taken_at;
