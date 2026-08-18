import { Building2, CircleGauge, Globe2, Mail, Network, Radar, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

export function IntelligenceCard({
  title,
  status,
  children,
  className,
}: {
  title: string;
  status?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface p-4 shadow-panel', className)}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">{title}</h3>
        {status}
      </header>
      {children}
    </section>
  );
}

export function OpportunityBadge({ tier }: { tier: 'sure-deal' | 'redesign' | 'watch' | 'not-ready' }) {
  const config = {
    'sure-deal': { tone: 'success' as const, label: 'Sure deal' },
    redesign: { tone: 'info' as const, label: 'Redesign lane' },
    watch: { tone: 'warning' as const, label: 'Watch' },
    'not-ready': { tone: 'neutral' as const, label: 'Not ready' },
  }[tier];
  return <StatusBadge tone={config.tone}><Radar className="h-3 w-3" />{config.label}</StatusBadge>;
}

export function LeadScore({ score, label = 'Lead score' }: { score: number | null; label?: string }) {
  const safeScore = Math.max(0, Math.min(100, score ?? 0));
  const tone = safeScore >= 70 ? 'text-success' : safeScore >= 40 ? 'text-warning' : 'text-ink-muted';
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-line" style={{ background: `conic-gradient(hsl(var(--accent)) ${safeScore * 3.6}deg, transparent 0deg)` }}>
        <div className="absolute inset-[3px] rounded-full bg-surface" />
        <span className={cn('relative text-[10px] font-bold tabular-nums', tone)}>{safeScore}</span>
      </div>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

export function InfrastructureIndicator({
  label,
  state,
}: {
  label: string;
  state: 'healthy' | 'gap' | 'unknown' | 'processing';
}) {
  const config = {
    healthy: { tone: 'success' as const, label: 'Healthy' },
    gap: { tone: 'warning' as const, label: 'Gap found' },
    unknown: { tone: 'neutral' as const, label: 'Unknown' },
    processing: { tone: 'info' as const, label: 'Processing' },
  }[state];
  return <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2 last:border-b-0"><span className="text-sm text-ink">{label}</span><StatusBadge tone={config.tone}>{config.label}</StatusBadge></div>;
}

export function WorkflowStatus({
  state,
}: {
  state: 'queued' | 'processing' | 'syncing' | 'partial' | 'awaiting-review' | 'complete' | 'failed';
}) {
  const config = {
    queued: { tone: 'neutral' as const, label: 'Queued' },
    processing: { tone: 'info' as const, label: 'Processing' },
    syncing: { tone: 'info' as const, label: 'Syncing' },
    partial: { tone: 'warning' as const, label: 'Partial results' },
    'awaiting-review': { tone: 'warning' as const, label: 'Awaiting review' },
    complete: { tone: 'success' as const, label: 'Complete' },
    failed: { tone: 'danger' as const, label: 'Failed' },
  }[state];
  return <StatusBadge tone={config.tone}>{config.label}</StatusBadge>;
}

const channelIcons: Record<string, LucideIcon> = { email: Mail, website: Globe2, social: Network, business: Building2, score: CircleGauge };

export function ContactChip({ channel, value }: { channel: 'email' | 'website' | 'social'; value: string }) {
  const Icon = channelIcons[channel];
  return <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-surface-raised px-2 py-1 text-xs text-ink-muted"><Icon className="h-3 w-3 shrink-0" /><span className="truncate">{value}</span></span>;
}

export function SocialAccountSummary({
  network,
  handle,
  followers,
}: {
  network: string;
  handle?: string | null;
  followers?: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2 last:border-b-0">
      <span className="text-sm font-medium text-ink">{network}</span>
      <span className="truncate text-xs text-ink-muted">{handle ?? 'Not found'}{followers != null ? ` · ${followers.toLocaleString()}` : ''}</span>
    </div>
  );
}
