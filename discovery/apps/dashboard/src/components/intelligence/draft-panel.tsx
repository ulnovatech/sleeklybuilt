'use client';

import { Copy, ExternalLink, Mail, MessageCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button, CollapsibleSection, EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

type DraftChannel = 'email' | 'whatsapp' | 'follow_up';

type DraftRecord = {
  id: string;
  channel: DraftChannel;
  subject: string | null;
  body: string;
  provider: string;
  model: string;
  regenerated: boolean;
  updatedAt: string;
  cached: boolean;
};

type DraftGetResponse = {
  draft: DraftRecord | null;
  budget: { cap: number; used: number; remaining: number; canSpend: boolean };
  drafts: { enabled: boolean; provider: string; model: string };
  credentialConfigured: boolean;
  credentialSource: string;
};

type DraftPostResponse = {
  draft: DraftRecord;
  budget: { cap: number; used: number; remaining: number; canSpend: boolean };
  cached: boolean;
};

const CHANNELS: Array<{ id: DraftChannel; label: string }> = [
  { id: 'email', label: 'Email' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'follow_up', label: 'Follow-up' },
];

export function DraftPanel({
  leadId,
  email,
  whatsappUrl,
  whatsappStatus,
}: {
  leadId: string;
  email: string | null;
  whatsappUrl: string | null;
  whatsappStatus: 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked';
}) {
  const [channel, setChannel] = useState<DraftChannel>('email');
  const [state, setState] = useState<DraftGetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const { push } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setState(await api<DraftGetResponse>(`/api/crm/leads/${leadId}/drafts?channel=${channel}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load drafts.');
    } finally {
      setLoading(false);
    }
  }, [channel, leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async (regenerate: boolean) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api<DraftPostResponse>(`/api/crm/leads/${leadId}/drafts`, {
        method: 'POST',
        body: JSON.stringify({ channel, regenerate }),
      });
      setState((prev) =>
        prev
          ? {
              ...prev,
              draft: result.draft,
              budget: result.budget,
            }
          : null,
      );
      push({
        tone: 'success',
        title: result.cached ? 'Cached draft loaded' : regenerate ? 'Draft regenerated' : 'Draft generated',
        description: result.cached
          ? 'No budget used — showing the last saved draft for this channel.'
          : `Budget remaining today: ${result.budget.remaining}/${result.budget.cap}.`,
      });
      await load();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Draft generation failed.';
      setError(message);
      push({ tone: 'error', title: 'Draft unavailable', description: message });
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      push({
        tone: 'success',
        title: `${label} copied`,
        description: 'Send externally, then record the outreach below.',
      });
    } catch {
      push({
        tone: 'error',
        title: `Could not copy ${label.toLowerCase()}`,
        description: 'Clipboard access was denied.',
      });
    }
  };

  const recordSend = async () => {
    if (!state?.draft?.body) return;
    setRecording(true);
    try {
      await api('/api/outreach/messages', {
        method: 'POST',
        body: JSON.stringify({
          leadId,
          subject: state.draft.subject ?? undefined,
          body: state.draft.body,
          channel: channel === 'whatsapp' ? 'phone' : channel === 'follow_up' ? 'email' : 'email',
          markContacted: true,
        }),
      });
      push({
        tone: 'success',
        title: 'Outreach recorded',
        description: 'CRM activity updated. Schedule a follow-up if needed.',
      });
    } catch (reason) {
      push({
        tone: 'error',
        title: 'Could not record outreach',
        description: reason instanceof Error ? reason.message : 'Recording failed.',
      });
    } finally {
      setRecording(false);
    }
  };

  const waBlocked = channel === 'whatsapp' && (whatsappStatus === 'wa_blocked' || whatsappStatus === 'wa_unreliable');
  const missingCreds = state ? !state.credentialConfigured : false;
  const disabledReason = !state?.drafts.enabled
    ? 'Draft generation is disabled in Settings.'
    : missingCreds
      ? `Configure ${state?.drafts.provider ?? 'provider'} credentials in Settings.`
      : waBlocked
        ? `WhatsApp screening status is ${whatsappStatus.replace('wa_', '')}.`
        : state && !state.budget.canSpend
          ? 'Daily llm_draft budget is exhausted.'
          : null;

  return (
    <CollapsibleSection
      id={`outreach-draft-${leadId}`}
      className="border-t border-line px-4 py-4"
      title="Outreach draft"
      defaultOpen={false}
      trailing={<StatusBadge tone="info">On-demand</StatusBadge>}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-xs text-ink-muted">
            Evidence-bound generation for one lead. Sends stay external; record them after you send.
          </p>
          {state && (
            <div className="text-xs text-ink-muted">
              Budget {state.budget.used}/{state.budget.cap} · {state.drafts.provider}/{state.drafts.model}
            </div>
          )}
        </div>

      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Draft channel">
        {CHANNELS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={channel === item.id}
            className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              channel === item.id
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-raised text-ink-muted hover:text-ink'
            }`}
            onClick={() => setChannel(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {!loading && error && !state?.draft && (
        <div className="mt-4">
          <ErrorState title="Draft state unavailable" description={error} onRetry={() => void load()} />
        </div>
      )}

      {!loading && state && (
        <div className="mt-4 space-y-3">
          {disabledReason && (
            <p className="rounded-md border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
              {disabledReason}
            </p>
          )}

          {!state.draft && !error && (
            <EmptyState
              title="No draft for this channel yet"
              description="Generate from the Pitch Pack facts only. Cache hits do not consume budget."
              action={
                <Button
                  size="sm"
                  variant="primary"
                  loading={generating}
                  disabled={Boolean(disabledReason)}
                  onClick={() => void generate(false)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate draft
                </Button>
              }
            />
          )}

          {state.draft && (
            <div className="space-y-3 rounded-md border border-line bg-surface-raised/40 p-3">
              {state.draft.subject && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Subject</p>
                  <p className="mt-1 text-sm text-ink">{state.draft.subject}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Body</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-6 text-ink">{state.draft.body}</pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void copy(state.draft!.body, 'Draft')}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy body
                </Button>
                {channel === 'email' && email && (
                  <Button size="sm" variant="secondary" asChild>
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(state.draft.subject ?? '')}&body=${encodeURIComponent(state.draft.body)}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Open mailto
                    </a>
                  </Button>
                )}
                {channel === 'whatsapp' && whatsappUrl && (
                  <Button size="sm" variant="secondary" asChild>
                    <a
                      href={`${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(state.draft.body)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Open WhatsApp
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="secondary" loading={recording} onClick={() => void recordSend()}>
                  Record send
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={generating}
                  disabled={Boolean(disabledReason)}
                  onClick={() => void generate(true)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
              <p className="text-[11px] text-ink-faint">
                {state.draft.cached || state.draft.regenerated === false
                  ? 'Cached drafts reopen free. Regenerate spends one llm_draft unit.'
                  : 'Last generation consumed budget.'}{' '}
                Provider {state.draft.provider}/{state.draft.model}.
              </p>
            </div>
          )}

          {state.draft && !disabledReason && (
            <Button
              size="sm"
              variant="primary"
              className="sm:hidden"
              loading={generating}
              onClick={() => void generate(false)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Refresh cache / generate
            </Button>
          )}

          {!state.draft && !disabledReason && error && (
            <Button size="sm" variant="primary" loading={generating} onClick={() => void generate(false)}>
              <Sparkles className="h-3.5 w-3.5" />
              Retry generate
            </Button>
          )}
        </div>
      )}
      </div>
    </CollapsibleSection>
  );
}
