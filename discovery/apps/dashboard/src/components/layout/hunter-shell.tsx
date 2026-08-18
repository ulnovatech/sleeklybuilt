'use client';

import { Menu, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AuthStatus } from '@/components/auth/auth-status';
import { Button } from '@/components/ui/primitives';
import { HUNTER_NAV, HUNTER_PRODUCT } from '@/lib/hunter-copy';
import { PRODUCT } from '@/lib/product-copy';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href: string) {
  if (href === '/hunter') return pathname === '/hunter';
  return pathname.startsWith(href);
}

function HunterNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {HUNTER_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive(pathname, item.href)
              ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/30'
              : 'text-amber-100/70 hover:bg-amber-500/10 hover:text-amber-50',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function HunterShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-hunter-950 via-slate-900 to-slate-950">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-amber-900/40 bg-hunter-950/80 backdrop-blur lg:flex">
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-6 shrink-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
              Separate product
            </p>
            <h1 className="text-lg font-semibold text-amber-50">{HUNTER_PRODUCT.name}</h1>
            <p className="text-xs text-amber-200/60">{HUNTER_PRODUCT.edition}</p>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
            <HunterNav />
          </div>

          <div className="mt-6 shrink-0 space-y-3 border-t border-amber-900/40 pt-4">
            <Link
              href="/ops"
              className="block text-xs text-amber-200/50 transition-colors hover:text-amber-100"
            >
              ← Back to {PRODUCT.name}
            </Link>
            <div className="[&_*]:text-xs [&_*]:text-amber-100/80">
              <AuthStatus />
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-amber-900/40 bg-hunter-950 p-4 shadow-overlay">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-amber-50">{HUNTER_PRODUCT.name}</h1>
                <p className="text-xs text-amber-200/60">{HUNTER_PRODUCT.edition}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <PanelLeftClose className="h-4 w-4 text-amber-100" />
              </Button>
            </div>
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
              <HunterNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="mt-4 border-t border-amber-900/40 pt-4">
              <Link
                href="/ops"
                className="block text-xs text-amber-200/50 hover:text-amber-100"
                onClick={() => setMobileOpen(false)}
              >
                ← Back to {PRODUCT.name}
              </Link>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-amber-900/40 bg-hunter-950/60 px-4 backdrop-blur lg:hidden">
          <Button size="icon" variant="ghost" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-4 w-4 text-amber-100" />
          </Button>
          <span className="truncate text-sm font-medium text-amber-100">{HUNTER_PRODUCT.name}</span>
        </header>
        <main className="flex-1 overflow-visible p-4 text-slate-100 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
