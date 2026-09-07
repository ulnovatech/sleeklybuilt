import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { isClerkAdminConfigured, assertAdminOperator, clerkConfigured } from '@/lib/admin-allowlist';
import { isCronAuthorized } from '@/lib/cron-auth';
import { NextRequest, NextResponse } from 'next/server';

const isPublicApi = createRouteMatcher(['/api/health', '/api/auth/status']);
const isCronApi = createRouteMatcher([
  '/api/intent/rss/poll',
  '/api/intent/custom-scrape/poll',
  '/api/discovery/plans/tick',
  '/api/integrations/sleekly-dash/sync',
  '/api/qualification/segment-performance/refresh',
  '/api/market-hunter/scans/scheduled',
]);
const isPublicPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

function clerkPublishableKey(): string {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
}

async function authorize(
  request: NextRequest,
  protect: (() => Promise<unknown>) | null,
  getUserId: (() => Promise<string | null>) | null,
) {
  const { pathname } = request.nextUrl;

  if (isCronApi(request) && request.method === 'POST' && isCronAuthorized(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    if (isPublicApi(request)) {
      return NextResponse.next();
    }

    if (!clerkConfigured() || !protect || !getUserId) {
      return NextResponse.json(
        { error: 'Authentication not configured. Set Clerk keys and CLERK_ADMIN_USER_ID.' },
        { status: 401 },
      );
    }

    if (!isClerkAdminConfigured()) {
      return NextResponse.json(
        { error: 'Admin allowlist missing. Set CLERK_ADMIN_USER_ID or CLERK_ADMIN_EMAIL.' },
        { status: 401 },
      );
    }

    await protect();
    const userId = await getUserId();
    if (!userId || !(await assertAdminOperator(userId))) {
      return NextResponse.json({ error: 'Forbidden — not an authorized operator.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (isPublicPage(request)) {
    return NextResponse.next();
  }

  if (!clerkConfigured() || !protect || !getUserId) {
    return new NextResponse(
      'Authentication not configured. Set Clerk keys and CLERK_ADMIN_USER_ID.',
      { status: 401 },
    );
  }

  if (!isClerkAdminConfigured()) {
    return new NextResponse(
      'Admin allowlist missing. Set CLERK_ADMIN_USER_ID or CLERK_ADMIN_EMAIL.',
      { status: 401 },
    );
  }

  await protect();
  const userId = await getUserId();
  if (!userId || !(await assertAdminOperator(userId))) {
    return new NextResponse('Forbidden — not an authorized operator.', { status: 403 });
  }
  return NextResponse.next();
}

async function unsignedMiddleware(request: NextRequest) {
  return authorize(request, null, null);
}

export default clerkPublishableKey()
  ? clerkMiddleware(async (auth, request) =>
      authorize(
        request,
        () => auth.protect(),
        async () => (await auth()).userId,
      ),
    )
  : unsignedMiddleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
