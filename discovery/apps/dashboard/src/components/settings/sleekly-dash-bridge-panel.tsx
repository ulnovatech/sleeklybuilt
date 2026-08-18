'use client';

import { useEffect, useState } from 'react';
import { Button, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

type BridgeStatus = {
  configured: boolean;
  message: string;
  watermarks?: {
    outcomesSince: string | null;
    inboundSince: string | null;
    lastSyncAt: string | null;
    lastError: string | null;
  };
};

export function SleeklyDashBridgePanel() {
  const { push } = useToast();
  const [status, setStatus] = useState<BridgeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<BridgeStatus>('/api/integrations/sleekly-dash/status');
      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bridge status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function syncNow() {
    setSyncing(true);
    try {
      const result = await api<{
        configured: boolean;
        outcomes?: { upserted: number; fetched: number } | null;
        inbound?: { created: number; fetched: number } | null;
        message?: string | null;
      }>('/api/integrations/sleekly-dash/sync', { method: 'POST' });
      if (!result.configured) {
        push({
          tone: 'error',
          title: 'CRM bridge not configured',
          description: result.message ?? 'Set SLEEKLY_DASH_BASE_URL and SLEEKLY_DASH_SERVICE_TOKEN',
        });
      } else {
        push({
          tone: 'success',
          title: 'CRM sync complete',
          description: `Outcomes ${result.outcomes?.upserted ?? 0}/${result.outcomes?.fetched ?? 0} · Inbound ${result.inbound?.created ?? 0}/${result.inbound?.fetched ?? 0}`,
        });
      }
      await load();
    } catch (e) {
      push({
        tone: 'error',
        title: 'CRM sync failed',
        description: e instanceof Error ? e.message : 'Request failed',
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">SleeklyBuilt CRM bridge</h3>
          <p className="text-sm text-slate-600 mt-1">
            Push pursuits to sleekly-dash Prospects. Worker/cron pulls closed outcomes and inbound forms.
          </p>
        </div>
        {loading ? (
          <StatusBadge tone="neutral">Loading…</StatusBadge>
        ) : status?.configured ? (
          <StatusBadge tone="success">Configured</StatusBadge>
        ) : (
          <StatusBadge tone="warning">Not configured</StatusBadge>
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {status && (
        <div className="text-xs text-slate-600 space-y-1">
          <p>{status.message}</p>
          {status.watermarks?.lastSyncAt && (
            <p>Last sync: {new Date(status.watermarks.lastSyncAt).toLocaleString()}</p>
          )}
          {status.watermarks?.lastError && (
            <p className="text-red-700">Last error: {status.watermarks.lastError}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>
          Refresh status
        </Button>
        <Button
          size="sm"
          loading={syncing}
          disabled={!status?.configured}
          onClick={() => void syncNow()}
          title={status?.configured ? 'Pull outcomes and inbound now' : 'Configure credentials first'}
        >
          Sync now
        </Button>
      </div>
    </section>
  );
}
