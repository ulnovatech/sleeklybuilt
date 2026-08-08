import React from 'react';

/**
 * Marks prospects pushed from Discovery Intelligence (bridge or CSV).
 */
export default function DiscoverySourceBadge({ prospect }) {
  if (!prospect) return null;
  const fromBridge = Boolean(prospect.discovery_account_id);
  const fromImport =
    typeof prospect.source === 'string' &&
    /discovery/i.test(prospect.source);
  if (!fromBridge && !fromImport) return null;

  const title = fromBridge
    ? `Discovery account ${prospect.discovery_account_id}`
    : `Source: ${prospect.source}`;

  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border border-cyan-500/40 bg-cyan-950/50 text-cyan-200"
    >
      Discovery
      {typeof prospect.discovery_score === 'number' ||
      (prospect.discovery_score !== null &&
        prospect.discovery_score !== undefined &&
        prospect.discovery_score !== '') ? (
        <span className="font-mono text-cyan-100/90 normal-case tracking-normal">
          {Number(prospect.discovery_score)}
        </span>
      ) : null}
    </span>
  );
}
