'use client';

import { TooltipProvider } from '@/components/ui/primitives';
import { ToastProvider } from '@/components/ui/toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>{children}</ToastProvider>
    </TooltipProvider>
  );
}
