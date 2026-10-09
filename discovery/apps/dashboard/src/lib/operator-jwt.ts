/** Cookie name shared with sleekly-dash SessionAuth::OPERATOR_TOKEN_COOKIE */
export const OPERATOR_TOKEN_COOKIE = 'sb_operator_token';

export function operatorAuthConfigured(): boolean {
  // Discovery trusts Dash session/token via /api/auth/me.
  return true;
}

export function readOperatorTokenFromRequest(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === OPERATOR_TOKEN_COOKIE) {
      const value = rest.join('=').trim();
      return value || null;
    }
  }
  return null;
}

export function readBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(\S+)$/i);
  return m?.[1] || null;
}

/**
 * Ask Dash whether this request is an authenticated operator.
 * Edge-safe (fetch only).
 */
export async function verifyOperatorWithDash(request: {
  cookie: string | null;
  authorization: string | null;
}): Promise<{ sub: string } | null> {
  const base =
    process.env.SLEEKLY_DASH_INTERNAL_URL?.replace(/\/$/, '') ||
    process.env.SLEEKLY_DASH_URL?.replace(/\/$/, '') ||
    'https://sleeklybuilt.pro';

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (request.cookie) headers.Cookie = request.cookie;
  if (request.authorization) headers.Authorization = request.authorization;

  try {
    const res = await fetch(`${base}/api/auth/me`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: { email?: string; id?: string | number } };
    const email = data?.user?.email;
    if (!email) return null;
    return { sub: String(email) };
  } catch {
    return null;
  }
}
