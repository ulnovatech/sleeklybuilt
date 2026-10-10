/**
 * Operator-facing discover provider stats (Plan B Chunk 10).
 * Used by job-worker run logs and stage summaries.
 */

export type ProviderStatLine = {
  provider: string;
  count: number;
  error?: string;
};

/** Single-line summary for discover stage logs, e.g. "openstreetmap: 42, public_search: 8". */
export function formatProviderStatsSummary(stats: ProviderStatLine[]): string {
  if (!stats.length) return 'no provider stats';
  return stats
    .map((s) =>
      s.error
        ? `${s.provider}: failed (${s.error})`
        : `${s.provider}: ${s.count}`,
    )
    .join(', ');
}

/** Per-provider log message body (without stage prefix). */
export function formatProviderStatLogLine(stat: ProviderStatLine): string {
  if (stat.error) return `${stat.provider}: failed — ${stat.error}`;
  return `${stat.provider}: ${stat.count} candidates`;
}
