'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BoIOpportunityBriefPayload } from '@agency/intelligence';
import { CollapsibleSection } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { BOI_COPY } from '@/lib/product-copy';
import {
  OpportunityBriefPanel,
  OpportunityBriefPanelEmpty,
  OpportunityBriefPanelError,
  OpportunityBriefPanelSkeleton,
} from './opportunity-brief-panel';

type BoiBriefExpandProps = {
  businessId: string;
  pipelineRunning?: boolean;
  defaultOpen?: boolean;
  compact?: boolean;
  onClose?: () => void;
  embedded?: boolean;
};

export function BoiBriefExpand({
  businessId,
  pipelineRunning = false,
  defaultOpen = false,
  compact = false,
  onClose,
  embedded = false,
}: BoiBriefExpandProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [brief, setBrief] = useState<BoIOpportunityBriefPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await api<{ brief: BoIOpportunityBriefPayload }>(
        `/api/intelligence/opportunity-brief/${businessId}`,
      );
      setBrief(res.brief);
    } catch (e) {
      const message = e instanceof Error ? e.message : BOI_COPY.errorLoad;
      if (message.toLowerCase().includes('not available') || message.toLowerCase().includes('not found')) {
        setNotFound(true);
        setBrief(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (defaultOpen && !brief && !loading && !notFound && !error) {
      void load();
      setOpen(true);
    }
  }, [defaultOpen, brief, loading, notFound, error, load]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      onClose?.();
      return;
    }
    if (!brief && !notFound && !error) {
      void load();
    }
  };

  return (
    <CollapsibleSection
      id={`boi-brief-${businessId}`}
      className={embedded ? '' : 'border-t border-line pt-3'}
      title={open ? BOI_COPY.hideBrief : BOI_COPY.viewBrief}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={handleOpenChange}
      trailing={loading ? <span className="text-xs text-ink-faint">Loading…</span> : undefined}
    >
      {loading && <OpportunityBriefPanelSkeleton />}
      {!loading && error && <OpportunityBriefPanelError message={error} onRetry={() => void load()} />}
      {!loading && !error && notFound && <OpportunityBriefPanelEmpty pipelineRunning={pipelineRunning} />}
      {!loading && !error && brief && <OpportunityBriefPanel brief={brief} compact={compact} />}
    </CollapsibleSection>
  );
}
