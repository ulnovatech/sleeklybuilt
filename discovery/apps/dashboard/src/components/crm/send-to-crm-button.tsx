'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

type Props = {
  leadId: string;
  configured: boolean;
  lastPushAt?: string | null;
  onDone?: () => void;
};

/**
 * Send one pursuit to SleeklyBuilt CRM (sleekly-dash prospects).
 * States: disabled (not configured), idle, loading, success, error.
 */
export function SendToCrmButton({ leadId, configured, lastPushAt, onDone }: Props) {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const result = await api<{
        created: boolean;
        updated: boolean;
        prospectId: number | null;
      }>('/api/integrations/sleekly-dash/push', {
        method: 'POST',
        body: JSON.stringify({ leadId }),
      });
      push({
        tone: 'success',
        title: result.created ? 'Sent to SleeklyBuilt CRM' : 'CRM prospect updated',
        description:
          result.prospectId != null
            ? `Prospect #${result.prospectId}`
            : 'Prospect upserted in Operations CRM',
      });
      onDone?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Push failed';
      setError(message);
      push({ tone: 'error', title: 'CRM push failed', description: message });
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="space-y-1">
        <Button size="sm" variant="secondary" disabled title="Configure SLEEKLY_DASH_BASE_URL and SLEEKLY_DASH_SERVICE_TOKEN in Settings">
          Send to SleeklyBuilt CRM
        </Button>
        <p className="text-xs text-ink-muted">Bridge not configured — set CRM credentials in Settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Button size="sm" variant="secondary" loading={busy} onClick={() => void send()}>
        Send to SleeklyBuilt CRM
      </Button>
      {lastPushAt && (
        <p className="text-xs text-ink-muted">Last push {new Date(lastPushAt).toLocaleString()}</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
