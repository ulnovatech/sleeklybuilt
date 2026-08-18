'use client';

import { PursuitWorkspace } from '@/components/pursuit/pursuit-workspace';
import type { DraftChannel } from '@/components/pursuit/types';

/** @deprecated Use PursuitWorkspace — kept for imports during migration. */
export function PitchPackPanel({
  leadId,
  defaultChannel,
  onOutreachRecorded,
}: {
  leadId: string;
  defaultChannel?: DraftChannel;
  onOutreachRecorded?: () => void;
}) {
  return (
    <PursuitWorkspace
      leadId={leadId}
      defaultChannel={defaultChannel}
      onOutreachRecorded={onOutreachRecorded}
    />
  );
}
