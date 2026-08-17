<?php

declare(strict_types=1);

/**
 * Apply attendant SQL migrations.
 * Usage: php php/attendant/scripts/apply_attendant_migration.php [014|015|016|all]
 */

require_once dirname(__DIR__, 3) . '/php/env.php';

$host = getenv('DB_HOST') ?: '127.0.0.1';
if ($host === 'localhost') {
    $host = '127.0.0.1';
}
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'sleeklybuilt';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '';

$which = $argv[1] ?? 'all';

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName),
    $user,
    $pass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$migrationsDir = dirname(__DIR__, 3) . '/sleekly-dash/backend/migrations';

/**
 * @return list<string>
 */
function attendant_sql_statements(string $sql): array
{
    $lines = preg_split('/\R/', $sql) ?: [];
    $buf = '';
    foreach ($lines as $line) {
        $trim = ltrim($line);
        if ($trim === '' || str_starts_with($trim, '--')) {
            continue;
        }
        $buf .= $line . "\n";
    }
    return array_values(array_filter(array_map('trim', explode(';', $buf))));
}

function attendant_column_exists(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) AS c FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $stmt->execute([$table, $column]);
    $row = $stmt->fetch();
    return ((int) ($row['c'] ?? 0)) > 0;
}

function attendant_run_014(PDO $pdo, string $migrationsDir): void
{
    $sqlFile = $migrationsDir . '/014_attendant.sql';
    $sql = (string) file_get_contents($sqlFile);
    foreach (attendant_sql_statements($sql) as $statement) {
        if ($statement === '') {
            continue;
        }
        $pdo->exec($statement);
        fwrite(STDOUT, 'OK 014: ' . substr(preg_replace('/\s+/', ' ', $statement), 0, 72) . "…\n");
    }
}

function attendant_run_015(PDO $pdo): void
{
    if (!attendant_column_exists($pdo, 'attendant_conversations', 'commercial_state')) {
        $pdo->exec(
            "ALTER TABLE attendant_conversations
             ADD COLUMN commercial_state VARCHAR(32) NOT NULL DEFAULT 'discovery' AFTER draft_json"
        );
        fwrite(STDOUT, "OK 015: added commercial_state\n");
    } else {
        fwrite(STDOUT, "SKIP 015: commercial_state exists\n");
    }
    if (!attendant_column_exists($pdo, 'attendant_conversations', 'escalation_state')) {
        $pdo->exec(
            "ALTER TABLE attendant_conversations
             ADD COLUMN escalation_state VARCHAR(32) NOT NULL DEFAULT 'autonomous' AFTER commercial_state"
        );
        fwrite(STDOUT, "OK 015: added escalation_state\n");
    } else {
        fwrite(STDOUT, "SKIP 015: escalation_state exists\n");
    }
    if (!attendant_column_exists($pdo, 'attendant_conversations', 'operator_brief_json')) {
        $pdo->exec(
            'ALTER TABLE attendant_conversations
             ADD COLUMN operator_brief_json JSON NULL AFTER escalation_state'
        );
        fwrite(STDOUT, "OK 015: added operator_brief_json\n");
    } else {
        fwrite(STDOUT, "SKIP 015: operator_brief_json exists\n");
    }

    $idx = $pdo->query("SHOW INDEX FROM attendant_conversations WHERE Key_name = 'idx_attendant_conversations_commercial'");
    if ($idx && !$idx->fetch()) {
        $pdo->exec(
            'ALTER TABLE attendant_conversations ADD KEY idx_attendant_conversations_commercial (commercial_state)'
        );
        fwrite(STDOUT, "OK 015: index commercial\n");
    }
    $idx2 = $pdo->query("SHOW INDEX FROM attendant_conversations WHERE Key_name = 'idx_attendant_conversations_escalation'");
    if ($idx2 && !$idx2->fetch()) {
        $pdo->exec(
            'ALTER TABLE attendant_conversations ADD KEY idx_attendant_conversations_escalation (escalation_state)'
        );
        fwrite(STDOUT, "OK 015: index escalation\n");
    }
}

function attendant_run_016(PDO $pdo): void
{
    // Expand message roles for operator replies
    try {
        $pdo->exec(
            "ALTER TABLE attendant_messages
             MODIFY COLUMN role ENUM('visitor', 'attendant', 'system', 'human') NOT NULL"
        );
        fwrite(STDOUT, "OK 016: message role includes human\n");
    } catch (Throwable $e) {
        fwrite(STDOUT, 'SKIP 016 role: ' . $e->getMessage() . "\n");
    }

    if (!attendant_column_exists($pdo, 'attendant_messages', 'idempotency_key')) {
        $pdo->exec(
            'ALTER TABLE attendant_messages
             ADD COLUMN idempotency_key VARCHAR(64) NULL AFTER tool_ok'
        );
        fwrite(STDOUT, "OK 016: added idempotency_key\n");
    } else {
        fwrite(STDOUT, "SKIP 016: idempotency_key exists\n");
    }

    $idx = $pdo->query("SHOW INDEX FROM attendant_messages WHERE Key_name = 'uk_attendant_messages_idem'");
    if ($idx && !$idx->fetch()) {
        try {
            $pdo->exec(
                'ALTER TABLE attendant_messages
                 ADD UNIQUE KEY uk_attendant_messages_idem (conversation_id, idempotency_key)'
            );
            fwrite(STDOUT, "OK 016: unique idempotency\n");
        } catch (Throwable $e) {
            fwrite(STDOUT, 'SKIP 016 idem index: ' . $e->getMessage() . "\n");
        }
    }

    foreach (['escalated_at', 'human_taken_at', 'operator_user_id'] as $col) {
        if (!attendant_column_exists($pdo, 'attendant_conversations', $col)) {
            $type = $col === 'operator_user_id' ? 'INT NULL' : 'DATETIME NULL';
            $pdo->exec(
                "ALTER TABLE attendant_conversations ADD COLUMN {$col} {$type}"
            );
            fwrite(STDOUT, "OK 016: added {$col}\n");
        } else {
            fwrite(STDOUT, "SKIP 016: {$col} exists\n");
        }
    }
}

if ($which === '014' || $which === 'all') {
    attendant_run_014($pdo, $migrationsDir);
}
if ($which === '015' || $which === 'all') {
    attendant_run_015($pdo);
}
if ($which === '016' || $which === 'all') {
    attendant_run_016($pdo);
}

fwrite(STDOUT, "Attendant migration(s) applied on database {$dbName} (target={$which}).\n");
