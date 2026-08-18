'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Bot,
  CalendarClock,
  Clock,
  Crosshair,
  DollarSign,
  FileText,
  FolderKanban,
  HandCoins,
  Inbox,
  ListChecks,
  Mail,
  PanelLeftOpen,
  Play,
  Radar,
  Settings2,
  ShieldCheck,
  Sun,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthStatus } from '@/components/auth/auth-status';
import { Button, Tooltip } from '@/components/ui/primitives';
import { NAV_SECTIONS, PRODUCT } from '@/lib/product-copy';
import { cn } from '@/lib/utils';

const sectionIcons: Record<string, LucideIcon> = {
  Discover: Radar,
  Decide: Target,
  Qualification: ShieldCheck,
  Pursue: FolderKanban,
  Close: HandCoins,
  Automation: Bot,
  Analytics: BarChart3,
  Settings: Settings2,
};

const navItemIcons: Record<string, LucideIcon> = {
  '/discovery': Play,
  '/discovery/plans': CalendarClock,
  '/intent': Inbox,
  '/review': ListChecks,
  '/data-quality': ShieldCheck,
  '/leads': FolderKanban,
  '/follow-ups': Clock,
  '/outreach': Mail,
  '/proposals': FileText,
  '/revenue': DollarSign,
  '/automation': Bot,
  '/hunter': Crosshair,
  '/ops': Sun,
  '/settings': Settings2,
};

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/intent' && pathname.startsWith('/intent/inbox')) return false;
  return pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  pathname,
  compact = false,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = navItemIcons[href] ?? Radar;
  const active = isNavActive(pathname, href);

  if (compact) {
    return (
      <Tooltip content={label} side="right">
        <Link
          href={href}
          onClick={onNavigate}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
            active ? 'bg-surface-selected text-accent' : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-8 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        active ? 'bg-surface-selected font-medium text-accent' : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function CollapsedSidebarRail({ onExpand }: { onExpand: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-14 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex justify-center border-b border-line py-3">
        <Tooltip content="Expand navigation" side="right">
          <Button size="icon" variant="ghost" onClick={onExpand} aria-label="Expand navigation">
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
      <nav aria-label="Operations pipeline" className="scrollbar-thin flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-3">
        {NAV_SECTIONS.flatMap((section) =>
          section.items.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} compact />
          )),
        )}
      </nav>
    </aside>
  );
}

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={cn('flex h-full w-72 shrink-0 flex-col border-r border-line bg-surface', mobile ? 'min-h-full' : 'min-h-screen')}>
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-sm">
          <Activity className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight text-ink">{PRODUCT.name}</h1>
          <p className="truncate text-[11px] text-ink-faint">{PRODUCT.edition}</p>
        </div>
      </div>
      <nav aria-label="Operations pipeline" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Business pipeline</p>
        <div className="space-y-4">
          {NAV_SECTIONS.map((section) => {
            const Icon = sectionIcons[section.label] ?? Radar;
            return (
              <section key={section.label}>
                <p className="mb-1.5 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} onNavigate={onNavigate} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-line px-5 py-4">
        <AuthStatus />
      </div>
    </aside>
  );
}
