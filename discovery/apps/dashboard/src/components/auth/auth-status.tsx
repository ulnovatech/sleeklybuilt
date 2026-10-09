'use client';

import Link from 'next/link';

const PERFORMANTE_URL =
  process.env.NEXT_PUBLIC_PERFORMANTE_URL?.trim() || 'https://sleeklybuilt.pro/performante';

/** Compact sign-out affordance — session lives on Performante / Dash cookies. */
export function AuthStatus() {
  return (
    <Link
      href={PERFORMANTE_URL}
      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
    >
      Performante
    </Link>
  );
}
