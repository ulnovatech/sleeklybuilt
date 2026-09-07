/** Shared cron secret check for middleware and route handlers (Edge-safe). */

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token && safeEqual(token, secret)) return true;
  }

  const headerSecret = request.headers.get('x-cron-secret')?.trim() ?? '';
  return headerSecret !== '' && safeEqual(headerSecret, secret);
}
