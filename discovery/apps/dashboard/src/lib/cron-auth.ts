/** Shared cron secret check for middleware and route handlers. */
import { timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
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
