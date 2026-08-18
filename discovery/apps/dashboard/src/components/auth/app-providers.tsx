'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { TooltipProvider } from '@/components/ui/primitives';
import { ToastProvider } from '@/components/ui/toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const content = (
    <TooltipProvider>
      <ToastProvider>{children}</ToastProvider>
    </TooltipProvider>
  );
  if (!publishableKey) return content;
  return <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>;
}
