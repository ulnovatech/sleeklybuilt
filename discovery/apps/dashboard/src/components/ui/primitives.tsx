'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Slot } from '@radix-ui/react-slot';
import { AlertCircle, ChevronDown, Inbox, LoaderCircle, X } from 'lucide-react';
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-foreground hover:brightness-95 shadow-sm',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-raised',
  ghost: 'text-ink-muted hover:bg-surface-raised hover:text-ink',
  danger: 'bg-danger text-white hover:brightness-95',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-sm',
  lg: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9 p-0',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', loading, disabled, asChild, children, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Slot accepts exactly one child, so link-style buttons never receive the spinner slot. */}
      {asChild ? (
        children
      ) : (
        <>
          {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Component>
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-ink-faint',
        className,
      )}
      {...props}
    />
  );
});

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
const statusStyles: Record<StatusTone, string> = {
  neutral: 'bg-surface-raised text-ink-muted ring-line',
  success: 'bg-success-muted text-success-foreground ring-success/20',
  warning: 'bg-warning-muted text-warning-foreground ring-warning/20',
  danger: 'bg-danger-muted text-danger-foreground ring-danger/20',
  info: 'bg-info-muted text-info-foreground ring-info/20',
};
const statusDots: Record<StatusTone, string> = {
  neutral: 'bg-ink-faint',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

export function StatusBadge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', statusStyles[tone], className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', statusDots[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-surface-raised', className)} {...props} />;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface px-6 py-10 text-center', className)}>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-raised text-ink-muted">
        <Inbox className="h-4 w-4" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-ink-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}

export function ErrorState({
  title = 'Unable to load this workspace',
  description,
  onRetry,
  className,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <section className={cn('flex min-h-56 flex-col items-center justify-center rounded-lg border border-danger/20 bg-danger-muted px-6 py-10 text-center', className)} role="alert">
      <AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-danger-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-danger-foreground/80">{description}</p>
      {onRetry && (
        <Button className="mt-4" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </section>
  );
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={250}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-xs rounded-md bg-ink px-2 py-1 text-xs text-surface shadow-overlay"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-ink" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: Omit<ButtonProps, 'size' | 'aria-label'> & { label: string }) {
  return (
    <Tooltip content={label} side="bottom">
      <Button size="icon" aria-label={label} className={className} {...props}>
        {children}
      </Button>
    </Tooltip>
  );
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  onExpand,
  children,
  className,
  id,
  trailing,
}: {
  title: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExpand?: () => void;
  children: ReactNode;
  className?: string;
  id?: string;
  trailing?: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const panelId = id ?? `collapsible-${title.toLowerCase().replace(/\s+/g, '-')}`;

  const toggle = () => {
    const next = !open;
    if (next) onExpand?.();
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section className={className}>
      <button
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm font-medium text-ink hover:bg-surface-raised"
      >
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-muted transition-transform', !open && '-rotate-90')} aria-hidden="true" />
        <span className="min-w-0 flex-1">{title}</span>
        {trailing}
      </button>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} className="mt-1">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[1px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-5 shadow-overlay">
          <DialogPrimitive.Title className="text-base font-semibold text-ink">{title}</DialogPrimitive.Title>
          {description && <DialogPrimitive.Description className="mt-1 text-sm text-ink-muted">{description}</DialogPrimitive.Description>}
          <div className="mt-5">{children}</div>
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function InspectorDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/25" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-line bg-surface shadow-overlay">
          <header className="flex shrink-0 items-start justify-between border-b border-line px-5 py-4">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-ink">{title}</DialogPrimitive.Title>
              {description && <DialogPrimitive.Description className="mt-1 text-sm text-ink-muted">{description}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink" aria-label="Close inspector">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </header>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
          {footer ? (
            <footer className="shrink-0 border-t border-line bg-surface px-5 py-3">{footer}</footer>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const Tabs = TabsPrimitive.Root;
export const TabsList = forwardRef<HTMLDivElement, TabsPrimitive.TabsListProps>(function TabsList({ className, ...props }, ref) {
  return <TabsPrimitive.List ref={ref} className={cn('inline-flex gap-1 rounded-md bg-surface-raised p-1', className)} {...props} />;
});
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsPrimitive.TabsTriggerProps>(function TabsTrigger({ className, ...props }, ref) {
  return <TabsPrimitive.Trigger ref={ref} className={cn('rounded px-2.5 py-1.5 text-xs font-medium text-ink-muted data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm', className)} {...props} />;
});
export const TabsContent = TabsPrimitive.Content;

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuContentProps
>(function DropdownMenuContent({ className, sideOffset = 4, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[10rem] overflow-hidden rounded-md border border-line bg-surface p-1 shadow-overlay',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuItemProps
>(function DropdownMenuItem({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-raised data-[highlighted]:text-ink',
        className,
      )}
      {...props}
    />
  );
});
export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />;
});
export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuLabelProps
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn('px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint', className)}
      {...props}
    />
  );
});
