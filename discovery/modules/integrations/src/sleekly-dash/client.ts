import type { SleeklyDashConfig } from './config';

export type SleeklyDashProspectUpsertBody = {
  discovery_account_id: string;
  name: string;
  industry?: string | null;
  location?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_method?: string | null;
  priority?: 'high' | 'medium' | 'low';
  notes?: string | null;
  source?: string;
  discovery_score?: number | null;
  discovery_payload?: Record<string, unknown>;
};

export type SleeklyDashProspectUpsertResult = {
  created: boolean;
  updated: boolean;
  prospect: {
    id: number;
    discovery_account_id?: string | null;
    name?: string;
    [key: string]: unknown;
  } | null;
};

export type SleeklyDashOutcomeRow = {
  company_id: number;
  name: string;
  industry?: string | null;
  location?: string | null;
  status: 'closed_won' | 'closed_lost' | string;
  discovery_account_id?: string | null;
  closed_at?: string | null;
  project_value_ugx?: number | null;
  services_sold?: unknown;
  loss_reason?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type SleeklyDashInboundRow = {
  request_type: string;
  source_id: number | string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  submitted_at?: string | null;
};

async function sleeklyDashFetch<T>(
  config: SleeklyDashConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.serviceToken}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  if (!res.ok) {
    const errMsg =
      body && typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : text.slice(0, 300);
    throw new Error(`sleekly-dash ${res.status}: ${errMsg || res.statusText}`);
  }
  return body as T;
}

export async function upsertProspect(
  config: SleeklyDashConfig,
  body: SleeklyDashProspectUpsertBody,
): Promise<SleeklyDashProspectUpsertResult> {
  return sleeklyDashFetch<SleeklyDashProspectUpsertResult>(config, '/api/integrations/prospects', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchOutcomes(
  config: SleeklyDashConfig,
  params?: { since?: string | null; limit?: number },
): Promise<{ data: SleeklyDashOutcomeRow[]; count: number }> {
  const q = new URLSearchParams();
  if (params?.since) q.set('since', params.since);
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return sleeklyDashFetch(config, `/api/integrations/outcomes${qs ? `?${qs}` : ''}`);
}

export async function fetchCatalog(config: SleeklyDashConfig): Promise<unknown> {
  return sleeklyDashFetch(config, '/api/integrations/catalog');
}

export async function fetchInbound(
  config: SleeklyDashConfig,
  params?: { since?: string | null; limit?: number },
): Promise<{ data: SleeklyDashInboundRow[]; count: number }> {
  const q = new URLSearchParams();
  if (params?.since) q.set('since', params.since);
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return sleeklyDashFetch(config, `/api/integrations/inbound${qs ? `?${qs}` : ''}`);
}
