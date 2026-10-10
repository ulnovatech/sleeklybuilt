/**
 * Process-local circuit breaker for suspended / blocked Google acquisition APIs.
 * Survives across runs in the same worker process until expiry or env override.
 *
 * Places lifecycle:
 * - dormant — env kill-switch or circuit open (billing/suspended); Plan B harvest continues
 * - active — Places may be used when keys + mode allow
 */

const DEFAULT_OPEN_MS = 6 * 60 * 60_000; // 6 hours

type CircuitState = {
  openUntil: number;
  reason: string;
};

const circuits = new Map<'places' | 'cse', CircuitState>();

export type PlacesLifecycle = 'active' | 'dormant';

export function isGoogleAcquisitionDisabledByEnv(): boolean {
  const v = process.env.GOOGLE_ACQUISITION_DISABLED?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function tripGoogleCircuit(
  channel: 'places' | 'cse',
  reason: string,
  openMs = DEFAULT_OPEN_MS,
): void {
  circuits.set(channel, { openUntil: Date.now() + openMs, reason });
}

export function isGoogleCircuitOpen(channel: 'places' | 'cse', now = Date.now()): boolean {
  if (isGoogleAcquisitionDisabledByEnv()) return true;
  const state = circuits.get(channel);
  if (!state) return false;
  if (now >= state.openUntil) {
    circuits.delete(channel);
    return false;
  }
  return true;
}

/** Places provider lifecycle for factory health / operator UI (does not delete Places code). */
export function getPlacesLifecycle(now = Date.now()): PlacesLifecycle {
  return isGoogleCircuitOpen('places', now) ? 'dormant' : 'active';
}

export function googleCircuitReason(channel: 'places' | 'cse'): string | undefined {
  if (isGoogleAcquisitionDisabledByEnv()) {
    return 'GOOGLE_ACQUISITION_DISABLED — Places/CSE dormant; Plan B sources (OSM / search / Meta / CSV) harvest';
  }
  const state = circuits.get(channel);
  if (!state || Date.now() >= state.openUntil) return undefined;
  return state.reason;
}

export function resetGoogleCircuit(channel?: 'places' | 'cse'): void {
  if (channel) circuits.delete(channel);
  else circuits.clear();
}

/** True when Google error indicates billing/consumer suspension or hard auth failure. */
export function isGoogleConsumerSuspendedError(
  status: number,
  reason?: string,
  message?: string,
): boolean {
  if (
    reason === 'CONSUMER_SUSPENDED' ||
    reason === 'BILLING_DISABLED' ||
    reason === 'API_KEY_SERVICE_BLOCKED'
  ) {
    return true;
  }
  const text = `${reason ?? ''} ${message ?? ''}`.toLowerCase();
  if (text.includes('consumer') && text.includes('suspended')) return true;
  if (text.includes('billing') && (text.includes('disabled') || text.includes('not enabled'))) {
    return true;
  }
  if (status === 403 && text.includes('permission denied')) return true;
  return false;
}
