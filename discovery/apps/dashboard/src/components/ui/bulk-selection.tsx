'use client';

import type { ColumnDef, Row, Table } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import { Check, Minus, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, IconButton, type ButtonProps } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type SelectionCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  indeterminate?: boolean;
};

export function SelectionCheckbox({
  className,
  checked,
  indeterminate,
  disabled,
  onChange,
  ...props
}: SelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const node = inputRef.current;
    if (node) node.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const state = indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked';

    return (
      <label
        className={cn(
          'inline-flex shrink-0 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <input
          {...props}
          ref={inputRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          data-state={state}
          className={cn(
            'flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors',
            'border-line-strong bg-surface',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            'peer-checked:border-accent peer-checked:bg-accent',
            'data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent/15',
          )}
          aria-hidden="true"
        >
          {state === 'checked' ? (
            <Check className="h-3 w-3 text-accent-foreground" strokeWidth={3} />
          ) : state === 'indeterminate' ? (
            <Minus className="h-3 w-3 text-accent" strokeWidth={3} />
          ) : null}
        </span>
      </label>
    );
}

export function BulkSelectionBar({
  count,
  noun = 'item',
  pluralNoun,
  onClear,
  children,
  className,
}: {
  count: number;
  noun?: string;
  pluralNoun?: string;
  onClear: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (count <= 0) return null;

  const label = `${count} ${count === 1 ? noun : (pluralNoun ?? `${noun}s`)} selected`;

  return (
    <div
      role="region"
      aria-label="Bulk selection actions"
      className={cn(
        'sticky-below-header flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 shadow-panel sm:px-4 sm:py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <p className="text-sm font-medium text-ink">{label}</p>
        <IconButton
          label="Clear selection"
          variant="ghost"
          className="h-8 w-8 shrink-0 text-ink-muted"
          onClick={onClear}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">{children}</div>
    </div>
  );
}

export function BulkActionButton({
  icon: Icon,
  label,
  className,
  children,
  ...props
}: ButtonProps & { icon: LucideIcon; label: string }) {
  return (
    <Button size="sm" className={cn('gap-1.5', className)} aria-label={label} {...props}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children ?? label}</span>
    </Button>
  );
}

export function selectColumnDef<T>(options: {
  getRowLabel: (row: T) => string;
  isRowSelectable?: (row: T) => boolean;
  headerAriaLabel?: string;
}): ColumnDef<T, unknown> {
  const {
    getRowLabel,
    isRowSelectable = () => true,
    headerAriaLabel = 'Select all on this page',
  } = options;

  return {
    id: 'select',
    header: ({ table }: { table: Table<T> }) => {
      const selectableRows = table.getRowModel().rows.filter((row) => isRowSelectable(row.original));
      const allSelected =
        selectableRows.length > 0 && selectableRows.every((row) => row.getIsSelected());
      const someSelected = selectableRows.some((row) => row.getIsSelected());

      return (
        <SelectionCheckbox
          aria-label={headerAriaLabel}
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            selectableRows.forEach((row) => row.toggleSelected(event.target.checked));
          }}
        />
      );
    },
    cell: ({ row }: { row: Row<T> }) =>
      isRowSelectable(row.original) ? (
        <SelectionCheckbox
          aria-label={`Select ${getRowLabel(row.original)}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ) : (
        <span className="text-ink-faint" aria-hidden="true">
          —
        </span>
      ),
    size: 40,
    enableSorting: false,
  };
}
