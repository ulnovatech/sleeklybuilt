'use client';

import {
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CaseFileUi, DraftChannel } from './types';

type PhoneSections = {
  opening15s: string;
  valueHook: string;
  evidenceMention: string;
  ask: string;
  objectionHandlers: string[];
  close: string;
};

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
  phoneSections?: PhoneSections | null;
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
  warning?: string;
  caseFileStatus?: string;
};

const CHANNELS: Array<{ id: DraftChannel; label: string }> = [
  { id: 'email', label: 'Email' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'phone', label: 'Phone script' },
  { id: 'follow_up', label: 'Follow-up' },
];

function recordChannelForDraft(channel: DraftChannel): string {
  if (channel === 'whatsapp') return 'other';
  if (channel === 'phone') return 'phone';
  if (channel === 'follow_up') return 'email';
  return 'email';
}

export function ChannelPitchComposer({
  leadId,
  caseFile,
  defaultChannel = 'email',
  rulesOpener = null,
  onRecorded,
}: {
  leadId: string;
  caseFile: CaseFileUi;
  defaultChannel?: DraftChannel;
  rulesOpener?: string | null;
  onRecorded?: () => void;
}) {
  const [channel, setChannel] = useState<DraftChannel>(defaultChannel);
  const [state, setState] = useState<DraftGetResponse | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const { push } = useToast();

  const email = caseFile.contact.email;
  const phone = caseFile.contact.phone;
  const whatsappUrl = caseFile.contact.whatsapp.waMeUrl;
  const whatsappStatus = caseFile.contact.whatsapp.status;
  const waIneligible = whatsappStatus === 'wa_blocked' || whatsappStatus === 'wa_unreliable';
  const accountBlocked = caseFile.status === 'blocked';

  const syncDraftToEditor = useCallback((draft: DraftRecord | null) => {
    setEditedSubject(draft?.subject ?? '');
    setEditedBody(draft?.body ?? '');
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api<DraftGetResponse>(`/api/crm/leads/${leadId}/drafts?channel=${channel}`);
      setState(response);
      syncDraftToEditor(response.draft);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load pitch state.');
    } finally {
      setLoading(false);
    }
  }, [channel, leadId, syncDraftToEditor]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (channel === 'whatsapp' && waIneligible) {
      const fallback = CHANNELS.find((item) => item.id !== 'whatsapp')?.id ?? 'email';
      setChannel(fallback);
    }
  }, [channel, waIneligible]);

  const generate = async (regenerate: boolean) => {
    setGenerating(true);
    setError(null);
    setWarning(null);
    try {
      const result = await api<DraftPostResponse>(`/api/crm/leads/${leadId}/drafts`, {
        method: 'POST',
        body: JSON.stringify({ channel, regenerate }),
      });
      setState((prev) =>
        prev ? { ...prev, draft: result.draft, budget: result.budget } : null,
      );
      syncDraftToEditor(result.draft);
      if (result.warning) setWarning(result.warning);
      push({
        tone: 'success',
        title: result.cached ? 'Cached pitch loaded' : regenerate ? 'Pitch regenerated' : 'Pitch generated',
        description: result.cached
          ? 'No budget used — showing the saved draft for this channel.'
          : `Budget remaining today: ${result.budget.remaining}/${result.budget.cap}.`,
      });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Pitch generation failed.';
      setError(message);
      push({ tone: 'error', title: 'Generate unavailable', description: message });
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      push({ tone: 'success', title: `${label} copied`, description: 'Send externally, then record below.' });
    } catch {
      push({ tone: 'error', title: `Could not copy ${label.toLowerCase()}` });
    }
  };

  const insertOpener = () => {
    if (!rulesOpener?.trim()) return;
    setEditedBody((prev) => {
      const opener = rulesOpener.trim();
      if (!prev.trim()) return opener;
      if (prev.includes(opener)) return prev;
      return `${opener}\n\n${prev}`;
    });
    push({
      tone: 'success',
      title: 'Rules opener inserted',
      description: 'Evidence-backed fragment only — edit before sending.',
    });
  };

  const recordSend = async () => {
    if (!editedBody.trim()) return;
    setRecording(true);
    try {
      await api('/api/outreach/messages', {
        method: 'POST',
        body: JSON.stringify({
          leadId,
          subject: editedSubject.trim() || undefined,
          body: editedBody,
          channel: recordChannelForDraft(channel),
          markContacted: true,
        }),
      });
      push({ tone: 'success', title: 'Outreach recorded', description: 'CRM updated.' });
      onRecorded?.();
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

  const waBlocked = channel === 'whatsapp' && waIneligible;
  const phoneBlocked = channel === 'phone' && !phone?.trim();
  const missingCreds = state ? !state.credentialConfigured : false;

  const disabledReason = accountBlocked
    ? 'This account is suppressed — pitch generation is blocked.'
    : !state
      ? null
      : !state.drafts.enabled
        ? (
            <>
              Pitch generation is disabled.{' '}
              <Link href="/settings#settings-drafts" className="font-medium underline">
                Enable it in Channel pitches
              </Link>
              .
            </>
          )
        : missingCreds
          ? (
              <>
                Configure {state.drafts.provider} credentials in{' '}
                <Link href="/settings#settings-drafts" className="font-medium underline">
                  Channel pitches
                </Link>
                .
              </>
            )
          : waBlocked
            ? `WhatsApp screening status is ${whatsappStatus.replace('wa_', '')}.`
            : phoneBlocked
              ? 'Phone script requires a phone number on the Case File.'
              : !state.budget.canSpend
                ? (
                    <>
                      Daily pitch budget is exhausted.{' '}
                      <Link href="/settings#settings-drafts" className="font-medium underline">
                        Raise the cap
                      </Link>{' '}
                      or try again tomorrow. Cached pitches still open.
                    </>
                  )
                : null;

  const phoneSections = state?.draft?.phoneSections ?? null;
  const whatsappCharCount = editedBody.length;

  return (
    <section className="rounded-lg border border-line bg-surface shadow-panel">
      <header className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Channel pitch composer</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Generate evidence-bound pitches on demand — one channel at a time.
          </p>
        </div>
        {state && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span>
              Budget {state.budget.used}/{state.budget.cap}
            </span>
            <span>·</span>
            <span>
              {state.drafts.provider}/{state.drafts.model}
            </span>
            <StatusBadge tone={state.credentialConfigured ? 'success' : 'danger'}>
              {state.credentialConfigured ? `Key via ${state.credentialSource}` : 'Credential missing'}
            </StatusBadge>
            <Link href="/settings#settings-drafts" className="font-medium text-accent hover:underline">
              Settings
            </Link>
          </div>
        )}
      </header>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pitch channel">
          {CHANNELS.map((item) => {
            const tabDisabled = item.id === 'whatsapp' && waIneligible;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={channel === item.id}
                aria-disabled={tabDisabled}
                disabled={tabDisabled}
                title={
                  tabDisabled
                    ? `WhatsApp unavailable: ${whatsappStatus.replace('wa_', '')}`
                    : undefined
                }
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  tabDisabled && 'cursor-not-allowed opacity-50',
                  channel === item.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-surface-raised text-ink-muted hover:text-ink',
                )}
                onClick={() => {
                  if (!tabDisabled) setChannel(item.id);
                }}
              >
                {item.label}
                {tabDisabled ? ' · blocked' : state?.draft && channel === item.id ? ' · ready' : ''}
              </button>
            );
          })}
        </div>

        {disabledReason && (
          <p className="rounded-md border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
            {disabledReason}
          </p>
        )}
        {warning && (
          <p className="rounded-md border border-info/30 bg-info-muted px-3 py-2 text-xs text-info-foreground">
            {warning}
          </p>
        )}

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!loading && error && !state?.draft && (
          <ErrorState title="Pitch state unavailable" description={error} onRetry={() => void load()} />
        )}

        {!loading && (
          <>
            {!state?.draft && !error && (
              <EmptyState
                title="No pitch for this channel yet"
                description="Generate from the Case File facts. Cached pitches reopen without spending budget."
                action={
                  <Button
                    size="sm"
                    variant="primary"
                    loading={generating}
                    disabled={Boolean(disabledReason)}
                    onClick={() => void generate(false)}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate pitch
                  </Button>
                }
              />
            )}

            {(state?.draft || editedBody) && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    loading={generating}
                    disabled={Boolean(disabledReason)}
                    onClick={() => void generate(Boolean(state?.draft))}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {state?.draft ? 'Regenerate pitch' : 'Generate pitch'}
                  </Button>
                  {rulesOpener && (
                    <Button size="sm" variant="ghost" onClick={insertOpener}>
                      Insert opener fragment
                    </Button>
                  )}
                </div>

                {(channel === 'email' || channel === 'follow_up') && (
                  <label className="block space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                      Subject
                    </span>
                    <input
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
                      placeholder="Subject line"
                    />
                  </label>
                )}

                <label className="block space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                    {channel === 'phone' ? 'Talk track' : 'Message'}
                  </span>
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={channel === 'whatsapp' ? 5 : channel === 'phone' ? 12 : 8}
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 font-sans text-sm leading-6 text-ink focus:border-accent focus:outline-none"
                  />
                  {channel === 'whatsapp' && (
                    <p className="text-xs text-ink-faint">{whatsappCharCount}/420 characters</p>
                  )}
                </label>

                {channel === 'phone' && phoneSections && (
                  <details className="rounded-md border border-line bg-surface-raised/50 px-3 py-2 text-sm">
                    <summary className="cursor-pointer font-medium text-ink">Script sections</summary>
                    <dl className="mt-2 space-y-2 text-xs text-ink-muted">
                      <div>
                        <dt className="font-semibold text-ink">Opening (15s)</dt>
                        <dd>{phoneSections.opening15s}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-ink">Value hook</dt>
                        <dd>{phoneSections.valueHook}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-ink">Evidence</dt>
                        <dd>{phoneSections.evidenceMention}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-ink">Ask</dt>
                        <dd>{phoneSections.ask}</dd>
                      </div>
                      {phoneSections.objectionHandlers.map((item) => (
                        <div key={item}>
                          <dt className="font-semibold text-ink">Objection</dt>
                          <dd>{item}</dd>
                        </div>
                      ))}
                      <div>
                        <dt className="font-semibold text-ink">Close</dt>
                        <dd>{phoneSections.close}</dd>
                      </div>
                    </dl>
                  </details>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void copy(editedBody, 'Pitch')}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  {channel === 'email' && email && (
                    <Button size="sm" variant="secondary" asChild>
                      <a
                        href={`mailto:${email}?subject=${encodeURIComponent(editedSubject)}&body=${encodeURIComponent(editedBody)}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Open mailto
                      </a>
                    </Button>
                  )}
                  {channel === 'whatsapp' && whatsappUrl && !waIneligible && (
                    <Button size="sm" variant="secondary" asChild>
                      <a
                        href={`${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(editedBody)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Open WhatsApp
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {channel === 'phone' && phone && (
                    <Button size="sm" variant="secondary" asChild>
                      <a href={`tel:${phone.replace(/\s/g, '')}`}>
                        <Phone className="h-3.5 w-3.5" />
                        Dial
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" loading={recording} onClick={() => void recordSend()}>
                    Record send
                  </Button>
                  {state?.draft && (
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
                  )}
                </div>

                {state?.draft && (
                  <p className="text-[11px] text-ink-faint">
                    Provider {state.draft.provider}/{state.draft.model}. Regenerate spends one llm_draft unit;
                    reopening cache is free.
                  </p>
                )}
              </div>
            )}

            {!state?.draft && !disabledReason && error && (
              <Button size="sm" variant="primary" loading={generating} onClick={() => void generate(false)}>
                <Sparkles className="h-3.5 w-3.5" />
                Retry generate
              </Button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
