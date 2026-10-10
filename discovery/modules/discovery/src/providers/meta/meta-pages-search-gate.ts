/**
 * Capability gate for Meta Pages Search API (`GET /{version}/pages/search`).
 * Deprecated Graph `/search?type=page|place` must not be used for Plan B.
 *
 * Override with META_PAGES_SEARCH_READY=true|false after manual App Review verification.
 */

export type MetaPagesSearchGateStatus = 'unknown' | 'green' | 'red';

export type MetaPagesSearchGateState = {
  status: MetaPagesSearchGateStatus;
  reason?: string;
  sampleCount?: number;
  probedAt?: number;
};

const DEFAULT_TTL_MS = 6 * 60 * 60_000;

let gate: MetaPagesSearchGateState = { status: 'unknown' };

export function getMetaPagesSearchEnvOverride(): boolean | null {
  const v = process.env.META_PAGES_SEARCH_READY?.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') return true;
  if (v === '0' || v === 'false' || v === 'no') return false;
  return null;
}

export function resetMetaPagesSearchGate(): void {
  gate = { status: 'unknown' };
}

export function getMetaPagesSearchGateState(): MetaPagesSearchGateState {
  return { ...gate };
}

export function markMetaPagesSearchGate(
  status: 'green' | 'red',
  reason?: string,
  sampleCount?: number,
): void {
  gate = {
    status,
    reason,
    sampleCount,
    probedAt: Date.now(),
  };
}

function gateFresh(now = Date.now()): boolean {
  if (gate.status === 'unknown' || gate.probedAt == null) return false;
  return now - gate.probedAt < DEFAULT_TTL_MS;
}

/**
 * True when Pages Search may be used for discovery.
 * Env override wins; otherwise requires a fresh GREEN probe.
 */
export function isMetaPagesSearchReady(now = Date.now()): boolean {
  const env = getMetaPagesSearchEnvOverride();
  if (env === true) return true;
  if (env === false) return false;
  if (!gateFresh(now)) return false;
  return gate.status === 'green';
}

export function metaPagesSearchGateReason(): string | undefined {
  const env = getMetaPagesSearchEnvOverride();
  if (env === true) {
    return 'META_PAGES_SEARCH_READY=true — Pages Search forced GREEN';
  }
  if (env === false) {
    return 'META_PAGES_SEARCH_READY=false — Pages Search forced RED (App Review / permissions)';
  }
  if (gate.status === 'green' && gateFresh()) {
    return gate.reason ?? 'Pages Search probe GREEN';
  }
  if (gate.status === 'red') {
    return (
      gate.reason ??
      'Pages Search probe RED — need Page Public Metadata/Content Access (App Review) or a valid user token'
    );
  }
  return 'Pages Search not probed — run pnpm discovery:meta-probe or wait for first discover';
}

/** Operator-facing capability evaluation (env override + probe state). */
export function evaluateMetaPagesSearchCapability(): {
  ready: boolean;
  reason: string;
  status: MetaPagesSearchGateStatus | 'forced_green' | 'forced_red';
} {
  const env = getMetaPagesSearchEnvOverride();
  if (env === true) {
    return {
      ready: true,
      reason: metaPagesSearchGateReason() ?? 'forced green',
      status: 'forced_green',
    };
  }
  if (env === false) {
    return {
      ready: false,
      reason: metaPagesSearchGateReason() ?? 'forced red',
      status: 'forced_red',
    };
  }
  const ready = isMetaPagesSearchReady();
  return {
    ready,
    reason: metaPagesSearchGateReason() ?? (ready ? 'green' : 'not ready'),
    status: gate.status,
  };
}

/** Classify Graph errors that mean the capability is unavailable (not transient). */
export function isMetaPagesSearchCapabilityError(err: {
  code?: number;
  message?: string;
  isAuthError?: boolean;
}): boolean {
  if (err.isAuthError) return true;
  const code = err.code;
  // 10 = permission denied; 200 = permissions error; 3 = capability/API disabled; 100 = invalid param / unsupported
  if (code === 10 || code === 200 || code === 3 || code === 190 || code === 102) return true;
  const msg = (err.message ?? '').toLowerCase();
  if (msg.includes('pages_read') || msg.includes('page public')) return true;
  if (msg.includes('permission') || msg.includes('not authorized')) return true;
  if (msg.includes('unsupported get request') || msg.includes('unknown path')) return true;
  return false;
}
