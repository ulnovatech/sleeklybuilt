import { assertAdminOperator, clerkConfigured, isClerkAdminConfigured } from '@/lib/admin-allowlist';
import { auth } from '@clerk/nextjs/server';

export async function getOperatorId(): Promise<string | null> {
  if (!clerkConfigured() || !isClerkAdminConfigured()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) return null;
  if (!(await assertAdminOperator(userId))) return null;
  return userId;
}

export async function requireAuth(): Promise<string> {
  const id = await getOperatorId();
  if (!id) throw new Error('Unauthorized');
  return id;
}

export function getAuthMode(): 'clerk' | 'none' {
  if (clerkConfigured() && isClerkAdminConfigured()) return 'clerk';
  return 'none';
}
