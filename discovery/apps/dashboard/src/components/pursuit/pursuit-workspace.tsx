'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CaseFilePanel } from './case-file-panel';
import { ChannelPitchComposer } from './channel-pitch-composer';
import { PursuitSidebar } from './pursuit-sidebar';
import type { CaseFileResponse, DraftChannel } from './types';

export function PursuitWorkspace({
  leadId,
  defaultChannel = 'email',
  onOutreachRecorded,
}: {
  leadId: string;
  defaultChannel?: DraftChannel;
  onOutreachRecorded?: () => void;
}) {
  const [caseFile, setCaseFile] = useState<CaseFileResponse['caseFile']>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [rulesOpener, setRulesOpener] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
    void load();
  }, [load]);

  const handleRecorded = () => {
    void load();
    onOutreachRecorded?.();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <CaseFilePanel
          caseFile={caseFile}
          loading={loading}
          error={error}
          message={message}
          onRetry={() => void load()}
        />
        {caseFile && <PursuitSidebar caseFile={caseFile} />}
      </div>

      {caseFile && (
        <ChannelPitchComposer
          leadId={leadId}
          caseFile={caseFile}
          defaultChannel={defaultChannel}
          rulesOpener={rulesOpener}
          onRecorded={handleRecorded}
        />
      )}
    </div>
  );
}
