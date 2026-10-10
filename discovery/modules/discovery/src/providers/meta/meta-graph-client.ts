import { logger } from '@agency/config';
import { platformSettings } from '@agency/settings';
import {
  isMetaPagesSearchCapabilityError,
  markMetaPagesSearchGate,
} from './meta-pages-search-gate';
import type {
  MetaGraphErrorBody,
  MetaGraphPageResult,
  MetaGraphSearchResponse,
} from './meta-graph-types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/** Fields for Pages Search — location/phone/website when App Review allows. */
const PAGE_SEARCH_FIELDS =
  'id,name,link,location,phone,website,category,fan_count,instagram_business_account{id,username,name,website}';

/** Minimal fields for capability probe (metadata access). */
const PAGE_PROBE_FIELDS = 'id,name,link,location';

export class MetaGraphApiError extends Error {
  readonly code?: number;
  readonly errorType?: string;
  readonly isRateLimit: boolean;
  readonly isAuthError: boolean;

  constructor(body: MetaGraphErrorBody) {
    super(body.message);
    this.name = 'MetaGraphApiError';
    this.code = body.code;
    this.errorType = body.type;
    this.isRateLimit = isRateLimitCode(body.code);
    this.isAuthError = isAuthErrorCode(body.code, body.type);
  }
}

function isRateLimitCode(code?: number): boolean {
  return code === 4 || code === 17 || code === 32 || code === 613;
}

function isAuthErrorCode(code?: number, type?: string): boolean {
  if (type === 'OAuthException') return true;
  return code === 190 || code === 102 || code === 200;
}

export type MetaGraphSearchOptions = {
  limit?: number;
  after?: string;
  /** Use reduced field mask for capability probes. */
  probe?: boolean;
};

export type MetaPagesSearchProbeResult = {
  ok: boolean;
  status: 'green' | 'red';
  reason: string;
  sampleCount: number;
  httpStatus?: number;
};

export class MetaGraphClient {
  getAccessToken(): string | undefined {
    return platformSettings.getCredential('meta_graph_api_token');
  }

  isConfigured(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Official Pages Search API — replaces deprecated `GET /search?type=page`.
   * @see https://developers.facebook.com/docs/pages-api/search-pages/
   */
  async searchPages(
    query: string,
    options: MetaGraphSearchOptions = {},
  ): Promise<MetaGraphSearchResponse<MetaGraphPageResult>> {
    const token = this.getAccessToken();
    if (!token) {
      return { data: [] };
    }

    const fields = options.probe ? PAGE_PROBE_FIELDS : PAGE_SEARCH_FIELDS;
    const params = new URLSearchParams({
      q: query,
      fields,
      limit: String(Math.min(25, Math.max(1, options.limit ?? 25))),
      access_token: token,
    });
    if (options.after) params.set('after', options.after);

    const url = `${GRAPH_BASE}/pages/search?${params.toString()}`;
    const res = await fetch(url);
    const body = (await res.json()) as MetaGraphSearchResponse<MetaGraphPageResult>;

    if (!res.ok || body.error) {
      const err = body.error ?? {
        message: `Meta Graph HTTP ${res.status}`,
        code: res.status,
      };
      logger.warn('Meta Pages Search failed', {
        query,
        status: res.status,
        code: err.code,
        message: err.message.slice(0, 200),
      });
      throw new MetaGraphApiError(err);
    }

    return body;
  }

  /**
   * Live capability probe against `/pages/search`.
   * Marks the process-local gate GREEN or RED.
   */
  async probePagesSearch(query = 'restaurant Kampala'): Promise<MetaPagesSearchProbeResult> {
    if (!this.isConfigured()) {
      const result: MetaPagesSearchProbeResult = {
        ok: false,
        status: 'red',
        reason: 'No META_GRAPH_API_TOKEN / Settings Meta Graph token',
        sampleCount: 0,
      };
      markMetaPagesSearchGate('red', result.reason, 0);
      return result;
    }

    try {
      const response = await this.searchPages(query, { limit: 3, probe: true });
      const sampleCount = response.data?.length ?? 0;
      const reason =
        sampleCount > 0
          ? `Pages Search GREEN — ${sampleCount} page(s) for "${query}"`
          : `Pages Search GREEN — endpoint accepted, 0 pages for "${query}"`;
      markMetaPagesSearchGate('green', reason, sampleCount);
      return { ok: true, status: 'green', reason, sampleCount };
    } catch (err) {
      const apiErr = err instanceof MetaGraphApiError ? err : null;
      const message = apiErr?.message ?? String(err);
      const capability = apiErr
        ? isMetaPagesSearchCapabilityError(apiErr)
        : true;
      const reason = capability
        ? `Pages Search RED — ${message.slice(0, 180)}`
        : `Pages Search probe failed (transient?) — ${message.slice(0, 180)}`;
      // Capability / auth → red; rate limits leave gate unknown so discover can retry later
      if (apiErr?.isRateLimit) {
        return { ok: false, status: 'red', reason, sampleCount: 0, httpStatus: apiErr.code };
      }
      markMetaPagesSearchGate('red', reason, 0);
      return {
        ok: false,
        status: 'red',
        reason,
        sampleCount: 0,
        httpStatus: apiErr?.code,
      };
    }
  }
}
