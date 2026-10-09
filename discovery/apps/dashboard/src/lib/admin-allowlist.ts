/** Clerk allowlist retired — password auth via Performante / Dash. */

export function clerkConfigured(): boolean {
  return false;
}

export function isClerkAdminConfigured(): boolean {
  return false;
}

export function adminUserIdAllowlist(): string[] {
  return [];
}

export function adminEmailAllowlist(): string[] {
  return [];
}

export async function assertAdminOperator(_userId: string): Promise<boolean> {
  return false;
}
