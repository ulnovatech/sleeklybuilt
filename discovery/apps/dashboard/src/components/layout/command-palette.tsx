'use client';

import { Command } from 'cmdk';
import { ArrowRight, Command as CommandIcon, LoaderCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { NAV_SECTIONS } from '@/lib/product-copy';
import { api } from '@/lib/api';

type SearchGroup = {
  type: string;
  label: string;
  items: Array<{ id: string; title: string; subtitle: string; href: string }>;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setGroups([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setGroups([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      api<{ groups: SearchGroup[] }>(`/api/search?q=${encodeURIComponent(q)}`)
        .then((data) => {
          if (!cancelled) setGroups(data.groups);
        })
        .catch((reason) => {
          if (!cancelled) {
            setGroups([]);
            setError(reason instanceof Error ? reason.message : 'Search failed');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [open, query]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const hasResults = useMemo(() => groups.some((group) => group.items.length > 0), [groups]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink sm:hidden"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 min-w-56 items-center justify-between rounded-md border border-line bg-surface px-2.5 text-xs text-ink-muted hover:border-line-strong hover:text-ink sm:flex"
        aria-label="Open command palette"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Search operations
        </span>
        <kbd className="rounded border border-line bg-surface-raised px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/25 px-4 pt-[15vh] backdrop-blur-[1px]"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <Command
            loop
            shouldFilter={false}
            className="w-full max-w-xl overflow-hidden rounded-lg border border-line bg-surface shadow-overlay"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="h-4 w-4 text-ink-faint" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search pursuits, businesses, runs, demand…"
                className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin text-ink-faint" /> : null}
              <button
                type="button"
                className="rounded p-1 text-ink-muted hover:bg-surface-raised"
                onClick={() => setOpen(false)}
                aria-label="Close command palette"
              >
                Esc
              </button>
            </div>
            <Command.List className="scrollbar-thin max-h-[55vh] overflow-y-auto p-2">
              {error && (
                <p className="px-3 py-2 text-sm text-danger" role="alert">
                  {error}
                </p>
              )}
              {!error && query.trim().length >= 2 && !loading && !hasResults && (
                <Command.Empty className="px-3 py-8 text-center text-sm text-ink-muted">
                  No matching pursuits, businesses, runs, or demand.
                </Command.Empty>
              )}
              {groups.map((group) => (
                <Command.Group
                  key={group.type}
                  heading={group.label}
                  className="mb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint"
                >
                  {group.items.map((item) => (
                    <Command.Item
                      key={`${group.type}-${item.id}`}
                      value={`${group.label} ${item.title} ${item.subtitle}`}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-ink aria-selected:bg-surface-selected"
                    >
                      <span>
                        <span className="block font-medium">{item.title}</span>
                        <span className="block text-xs text-ink-muted">{item.subtitle}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
              {NAV_SECTIONS.map((section) => (
                <Command.Group
                  key={section.label}
                  heading={section.label}
                  className="mb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint"
                >
                  {section.items.map((item) => (
                    <Command.Item
                      key={item.href}
                      value={`${section.label} ${item.label}`}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-ink aria-selected:bg-surface-selected"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
              <Command.Group
                heading="Commands"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint"
              >
                <Command.Item
                  value="open automation center"
                  onSelect={() => go('/automation')}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-ink aria-selected:bg-surface-selected"
                >
                  <span>Open Automation Center</span>
                  <CommandIcon className="h-3.5 w-3.5 text-ink-faint" />
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
