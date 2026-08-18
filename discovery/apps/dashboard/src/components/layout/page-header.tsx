import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  compact = false,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className={cn('mb-5 border-b border-line pb-4', compact && 'mb-4 pb-3')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{eyebrow}</p>}
          <h2 className={cn('font-semibold tracking-tight text-ink', compact ? 'text-lg' : 'text-xl')}>{title}</h2>
          {description && !compact && <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-muted">{description}</p>}
          {description && compact && <p className="mt-0.5 truncate text-sm text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
