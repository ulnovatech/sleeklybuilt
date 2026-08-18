'use client';

import { Activity, Menu, PanelLeftClose } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CommandPalette } from '@/components/layout/command-palette';
import { HunterShell } from '@/components/layout/hunter-shell';
import { CollapsedSidebarRail, Sidebar } from '@/components/layout/sidebar';
import { Button, StatusBadge, Tooltip } from '@/components/ui/primitives';
import { useApiQuery } from '@/lib/use-api-query';

const AUTH_PREFIXES = ['/sign-in', '/sign-up'];

function AutomationHealthBadge({
  status,
  loading,
}: {
  status: 'ok' | 'degraded' | undefined;
  loading: boolean;
}) {
  const tone = status === 'degraded' ? 'danger' : loading ? 'neutral' : 'success';
  const label = status === 'degraded' ? 'Automation needs attention' : loading ? 'Checking automation' : 'Automation healthy';

  return (
    <>
      <Tooltip content={label}>
        <a href="/automation" className="inline-flex sm:hidden" aria-label={label}>
          <StatusBadge tone={tone}>
            <Activity className="h-3 w-3" aria-hidden="true" />
          </StatusBadge>
        </a>
      </Tooltip>
      <a href="/automation" className="hidden sm:block">
        <StatusBadge tone={tone}>
          <Activity className="h-3 w-3" aria-hidden="true" />
          {label}
        </StatusBadge>
      </a>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const health = useApiQuery<{ status: 'ok' | 'degraded'; database: string }>('/api/health', { intervalMs: 60000 });

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (pathname.startsWith('/hunter')) {
    return <HunterShell>{children}</HunterShell>;
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block">
        {collapsed ? (
          <CollapsedSidebarRail onExpand={() => setCollapsed(false)} />
        ) : (
          <Sidebar />
        )}
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-ink/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full w-72 shadow-overlay"><Sidebar mobile onNavigate={() => setSidebarOpen(false)} /></div>
        </div>
      )}

      <div className={collapsed ? 'lg:pl-14' : 'lg:pl-72'}>
        <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center justify-between border-b border-line bg-surface/95 px-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
            {!collapsed && (
              <Button size="icon" variant="ghost" className="hidden lg:inline-flex" onClick={() => setCollapsed(true)} aria-label="Collapse navigation">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
            <span className="hidden truncate text-xs font-medium text-ink-muted sm:block">Operations intelligence console</span>
          </div>
          <div className="flex items-center gap-2">
            <CommandPalette />
            <AutomationHealthBadge status={health.data?.status} loading={health.isLoading} />
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-var(--header-height))] max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
