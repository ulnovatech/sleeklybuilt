'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button, CollapsibleSection, InspectorDrawer } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { CaseFilePanel } from './case-file-panel';
import { ChannelPitchComposer } from './channel-pitch-composer';
import { PursuitSidebar } from './pursuit-sidebar';
import type { CaseFileResponse, DraftChannel } from './types';

export function recommendedChannelToDraft(channel: string | null | undefined): DraftChannel {
  if (channel === 'whatsapp' || channel === 'phone' || channel === 'email' || channel === 'follow_up') {
    return channel;
  }
  return 'phone';
}

type PitchOverlayDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  title: string;
  description?: string;
  defaultChannel?: DraftChannel;
  onRecorded?: () => void;
  moreHref?: string;
  /** Shown above the pitch composer (e.g. Restore on dumpster). */
  promoteAction?: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

export function PitchOverlayDrawer({
  open,
  onOpenChange,
  leadId,
  title,
  description,
  defaultChannel = 'phone',
  onRecorded,
  moreHref,
  promoteAction,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: PitchOverlayDrawerProps) {
  const [caseFile, setCaseFile] = useState<CaseFileResponse['caseFile']>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [rulesOpener, setRulesOpener] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const load = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api<CaseFileResponse>(`/api/crm/leads/${leadId}/case-file`);
      setCaseFile(data.caseFile);
      setMessage(data.message);
      setRulesOpener(data.rulesOpener ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load Case File.');
      setCaseFile(null);
      setRulesOpener(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (!open || !leadId) return;
    setMoreOpen(false);
    void load();
  }, [leadId, load, open]);

  const handleRecorded = () => {
    void load();
    onRecorded?.();
  };

  const showNav = Boolean(onPrev || onNext);

  return (
    <InspectorDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        leadId ? (
          <div className="space-y-3">
            {promoteAction}
            {caseFile ? (
              <div className="max-h-[min(52vh,28rem)] overflow-y-auto rounded-lg border border-line">
                <ChannelPitchComposer
                  leadId={leadId}
                  caseFile={caseFile}
                  defaultChannel={defaultChannel}
                  rulesOpener={rulesOpener}
                  onRecorded={handleRecorded}
                />
              </div>
            ) : null}
          </div>
        ) : null
      }
    >
      {leadId ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {showNav ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-11 min-h-11"
                  disabled={!hasPrev}
                  onClick={onPrev}
                  aria-label="Previous keeper"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-11 min-h-11"
                  disabled={!hasNext}
                  onClick={onNext}
                  aria-label="Next keeper"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span />
            )}
            {moreHref ? (
              <Button size="sm" variant="ghost" asChild>
                <Link href={moreHref}>
                  More
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>

          <CaseFilePanel
            caseFile={caseFile}
            loading={loading}
            error={error}
            message={message}
            onRetry={() => void load()}
          />

          {caseFile ? (
            <CollapsibleSection
              id={`pitch-overlay-more-${leadId}`}
              title="Contact & pursuit details"
              open={moreOpen}
              onOpenChange={setMoreOpen}
            >
              <div className="pt-2">
                <PursuitSidebar caseFile={caseFile} />
              </div>
            </CollapsibleSection>
          ) : null}
        </div>
      ) : null}
    </InspectorDrawer>
  );
}
