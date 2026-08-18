'use client';

import { AutomationCenter } from '@/components/automation/automation-center';
import { PageHeader } from '@/components/layout/page-header';

export default function AutomationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Automation"
        title="Automation Center"
        description="Monitor active work, queued processing, completed pipeline activity, and failures that require an operator decision."
      />
      <AutomationCenter />
    </>
  );
}
