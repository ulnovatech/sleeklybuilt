'use client';

import { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { BOI_COPY } from '@/lib/product-copy';
import {
  OpportunityBriefPanel,
  type WebsiteOpportunityBrief,
} from '@/components/opportunities/opportunity-brief-panel';

export function OpportunityBriefExpand({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState<WebsiteOpportunityBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (!next) return;
    if (brief || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api<{ brief: WebsiteOpportunityBrief }>(
        `/api/qualification/opportunity-brief/${businessId}`,
      );
      setBrief(res.brief);
    } catch (e) {
      setError(e instanceof Error ? e.message : BOI_COPY.websiteBrief.errorLoad);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CollapsibleSection
      id={`website-brief-${businessId}`}
      className="border-t border-line pt-3"
      title={open ? BOI_COPY.websiteBrief.hideBrief : BOI_COPY.websiteBrief.viewBrief}
      defaultOpen={false}
      open={open}
      onOpenChange={(next) => void handleOpenChange(next)}
      trailing={loading ? <span className="text-xs text-ink-faint">Loading…</span> : undefined}
    >
      {error && <p className="text-xs text-danger">{error}</p>}
      {brief && <OpportunityBriefPanel brief={brief} />}
    </CollapsibleSection>
  );
}
