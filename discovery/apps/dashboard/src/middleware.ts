import { isCronAuthorized } from '@/lib/cron-auth';
import { verifyOperatorWithDash } from '@/lib/operator-jwt';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API = new Set(['/api/health', '/api/auth/status']);
const CRON_API = new Set([
  '/api/intent/rss/poll',
  '/api/intent/custom-scrape/poll',
  '/api/discovery/plans/tick',
  '/api/integrations/sleekly-dash/sync',
  '/api/qualification/segment-performance/refresh',
  '/api/market-hunter/scans/scheduled',
]);

const PERFORMANTE_URL =
  process.env.PERFORMANTE_URL?.trim() || 'https://sleeklybuilt.pro/performante';

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const verified = await verifyOperatorWithDash({
    cookie: request.headers.get('cookie'),
    authorization: request.headers.get('authorization'),
  });
  return verified !== null;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (CRON_API.has(pathname) && request.method === 'POST' && isCronAuthorized(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    if (PUBLIC_API.has(pathname)) {
      return NextResponse.next();
    }
    if (!(await isAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in at Performante first.' },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(PERFORMANTE_URL);
  }

  if (!(await isAuthorized(request))) {
    return NextResponse.redirect(PERFORMANTE_URL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
