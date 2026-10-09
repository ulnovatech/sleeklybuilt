import { headers } from 'next/headers';
import { verifyOperatorWithDash } from '@/lib/operator-jwt';

export async function getOperatorId(): Promise<string | null> {
  const headerStore = await headers();
  const verified = await verifyOperatorWithDash({
    cookie: headerStore.get('cookie'),
    authorization: headerStore.get('authorization'),
  });
  return verified?.sub ?? null;
}

export async function requireAuth(): Promise<string> {
  const id = await getOperatorId();
  if (!id) throw new Error('Unauthorized');
  return id;
}

export function getAuthMode(): 'password' | 'none' {
  return 'password';
}
