'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { OutreachQueueItem } from './types';
import { PRESENCE_LABELS } from './types';

function presenceTone(presence: OutreachQueueItem['presenceClass']) {
  if (presence === 'redesign') return 'info' as const;
  return 'success' as const;
}

function followUpLabel(iso: string | null): string | null {
  if (!iso) return null;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return null;
  const now = Date.now();
  if (due.getTime() <= now) return `Follow-up overdue`;
  return `Follow-up ${due.toLocaleDateString()}`;
}

function draftCount(drafts: OutreachQueueItem['drafts']): number {
  return Number(drafts.email) + Number(drafts.whatsapp) + Number(drafts.phone) + Number(drafts.follow_up);
}

export function OutreachQueueRow({
  item,
  selected,
  onSelect,
}: {
  item: OutreachQueueItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const weakness = item.topWeaknesses[0] ?? null;
  const due = followUpLabel(item.nextFollowUpAt);
  const draftsReady = draftCount(item.drafts);
  const waReady = item.channels.whatsapp === 'wa_ready' || item.channels.whatsapp === 'wa_probable';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        selected
          ? 'border-accent bg-accent/10 shadow-panel'
          : 'border-line bg-surface hover:bg-surface-raised',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{item.business.name}</p>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            {[item.business.city, item.business.industry].filter(Boolean).join(' · ') || 'Location unknown'}
          </p>
        </div>
        <StatusBadge tone={presenceTone(item.presenceClass)}>
          {PRESENCE_LABELS[item.presenceClass]}
        </StatusBadge>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge tone="neutral">{item.status}</StatusBadge>
        {item.score != null && <StatusBadge tone="info">Score {item.score}</StatusBadge>}
        {item.reachability && (
          <StatusBadge tone="neutral" className="capitalize">
            {item.reachability}
          </StatusBadge>
        )}
        {due && <StatusBadge tone="warning">{due}</StatusBadge>}
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink">
        {weakness ?? item.pitchAngle ?? 'No weakness listed yet — open the Case File to review.'}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-faint" aria-label="Available channels">
          <Mail
            className={cn('h-3.5 w-3.5', item.channels.email ? 'text-ink' : 'opacity-30')}
            aria-label={item.channels.email ? 'Email available' : 'No email'}
          />
          <Phone
            className={cn('h-3.5 w-3.5', item.channels.phone ? 'text-ink' : 'opacity-30')}
            aria-label={item.channels.phone ? 'Phone available' : 'No phone'}
          />
          <MessageCircle
            className={cn('h-3.5 w-3.5', waReady ? 'text-ink' : 'opacity-30')}
            aria-label={waReady ? 'WhatsApp available' : 'WhatsApp not ready'}
          />
        </div>
        <p className="text-[11px] text-ink-muted">
          {draftsReady > 0
            ? `${draftsReady} pitch${draftsReady === 1 ? '' : 'es'} cached`
            : 'No pitch yet'}
        </p>
      </div>
    </button>
  );
}
