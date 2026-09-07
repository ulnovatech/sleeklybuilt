import { auth, clerkClient } from '@clerk/nextjs/server';

function clerkConfigured(): boolean {
  return !!(
    process.env.CLERK_SECRET_KEY?.trim() &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  );
}

/** Comma-separated Clerk user ids allowed to operate admin consoles. */
export function adminUserIdAllowlist(): string[] {
  const raw =
    process.env.CLERK_ADMIN_USER_ID?.trim() ||
    process.env.CLERK_ADMIN_USER_IDS?.trim() ||
    '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Comma-separated emails (fallback when user id list empty). */
export function adminEmailAllowlist(): string[] {
  const raw =
    process.env.CLERK_ADMIN_EMAIL?.trim() ||
    process.env.CLERK_ADMIN_EMAILS?.trim() ||
    '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isClerkAdminConfigured(): boolean {
  return clerkConfigured() && (adminUserIdAllowlist().length > 0 || adminEmailAllowlist().length > 0);
}

/**
 * Single-operator gate: signed-in Clerk user must match allowlist.
 * Fail closed when Clerk is configured but allowlist is empty.
 */
export async function assertAdminOperator(userId: string): Promise<boolean> {
  const ids = adminUserIdAllowlist();
  if (ids.length > 0) {
    return ids.includes(userId);
  }

  const emails = adminEmailAllowlist();
  if (emails.length === 0) {
    return false;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const address =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null;
    if (!address) return false;
    return emails.includes(address.toLowerCase());
  } catch {
    return false;
  }
}

export { clerkConfigured };
