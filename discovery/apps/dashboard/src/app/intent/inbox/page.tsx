'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/primitives';

/** Legacy route — Demand inbox now lives under /intent. */
export default function DemandInboxRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/intent');
  }, [router]);
  return <Skeleton className="h-40 w-full" />;
}
