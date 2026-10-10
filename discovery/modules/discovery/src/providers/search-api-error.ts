export type SearchEngineId = 'google_cse' | 'brave_search' | 'bing_search';

export class SearchApiError extends Error {
  readonly status: number;
  readonly engine: SearchEngineId;
  readonly reason?: string;

  constructor(engine: SearchEngineId, status: number, message: string, reason?: string) {
    super(formatSearchApiMessage(engine, status, message, reason));
    this.name = 'SearchApiError';
    this.engine = engine;
    this.status = status;
    this.reason = reason;
  }
}

export class SearchBudgetExhaustedError extends Error {
  readonly provider: SearchEngineId;

  constructor(provider: SearchEngineId) {
    super(
      provider === 'google_cse'
        ? 'Google Custom Search daily budget is exhausted. Raise CSE_DAILY_CAP in Settings or retry tomorrow.'
        : provider === 'brave_search'
          ? 'Brave Search daily budget is exhausted. Raise BRAVE_DAILY_CAP in Settings or retry tomorrow.'
          : 'Bing Search daily budget is exhausted. Raise BING_DAILY_CAP in Settings or retry tomorrow.',
    );
    this.name = 'SearchBudgetExhaustedError';
    this.provider = provider;
  }
}

function engineLabel(engine: SearchEngineId): string {
  if (engine === 'google_cse') return 'Google Custom Search';
  if (engine === 'brave_search') return 'Brave Search';
  return 'Bing Search';
}

function formatSearchApiMessage(
  engine: SearchEngineId,
  status: number,
  message: string,
  reason?: string,
): string {
  const label = engineLabel(engine);

  if (
    engine === 'google_cse' &&
    (reason === 'dailyLimitExceeded' ||
      /daily limit|quota exceeded|rate limit/i.test(message))
  ) {
    return `${label} quota exceeded. Check CSE billing/limits in Google Cloud Console. Original: ${message}`;
  }

  if (status === 403) {
    return `${label} denied the request (403). Verify API key and product access. Original: ${message}`;
  }
  if (status === 401) {
    return `${label} key is invalid or unauthorized (401): ${message}`;
  }
  if (status === 429) {
    return `${label} rate limited (429). Retry later or raise the daily cap. Original: ${message}`;
  }
  return `${label} error (${status}): ${message}`;
}

export function parseGoogleSearchErrorBody(errText: string): { message: string; reason?: string } {
  try {
    const parsed = JSON.parse(errText) as {
      error?: {
        message?: string;
        errors?: Array<{ reason?: string; message?: string }>;
        status?: string;
      };
    };
    const message =
      parsed.error?.message?.trim() ||
      parsed.error?.errors?.[0]?.message?.trim() ||
      errText.slice(0, 300);
    const reason = parsed.error?.errors?.[0]?.reason ?? parsed.error?.status;
    return { message, reason };
  } catch {
    return { message: errText.slice(0, 300) };
  }
}

export function parseBingSearchErrorBody(errText: string): { message: string; reason?: string } {
  try {
    const parsed = JSON.parse(errText) as {
      error?: { code?: string; message?: string };
      message?: string;
    };
    const message = parsed.error?.message?.trim() || parsed.message?.trim() || errText.slice(0, 300);
    const reason = parsed.error?.code;
    return { message, reason };
  } catch {
    return { message: errText.slice(0, 300) };
  }
}

export function parseBraveSearchErrorBody(errText: string): { message: string; reason?: string } {
  try {
    const parsed = JSON.parse(errText) as {
      error?: { code?: string | number; message?: string; detail?: string; meta?: { errors?: string[] } };
      message?: string;
      type?: string;
    };
    const metaErr = parsed.error?.meta?.errors?.[0];
    const message =
      parsed.error?.message?.trim() ||
      parsed.error?.detail?.trim() ||
      metaErr?.trim() ||
      parsed.message?.trim() ||
      errText.slice(0, 300);
    const reason =
      parsed.error?.code != null
        ? String(parsed.error.code)
        : parsed.type?.trim() || undefined;
    return { message, reason };
  } catch {
    return { message: errText.slice(0, 300) };
  }
}
