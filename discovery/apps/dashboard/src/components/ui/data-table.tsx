'use client';

import {
  type ColumnDef,
  type ColumnPinningState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type GroupingState,
  type RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronRight, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, EmptyState, Skeleton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

export type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onSelectionChange?: (ids: string[]) => void;
  onRowInspect?: (row: TData) => void;
  onRowActivate?: (row: TData) => void;
  focusedRowId?: string | null;
  selectionResetToken?: string | number;
  showSelectionFooter?: boolean;
  selectionFooter?: ReactNode;
  renderExpanded?: (row: TData) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
  estimateRowHeight?: number;
};

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  isLoading,
  error,
  onRetry,
  onSelectionChange,
  onRowInspect,
  onRowActivate,
  focusedRowId,
  selectionResetToken,
  showSelectionFooter = false,
  selectionFooter,
  renderExpanded,
  emptyTitle,
  emptyDescription,
  emptyAction,
  estimateRowHeight = 52,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const parentRef = useRef<HTMLDivElement>(null);
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { rowSelection, columnPinning, grouping, expanded },
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableExpanding: Boolean(renderExpanded),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 12,
  });

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  );

  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [onSelectionChange, selectedIds]);

  useEffect(() => {
    setRowSelection({});
  }, [selectionResetToken]);

  if (isLoading) return <DataTableSkeleton columnCount={columns.length} />;
  if (error) {
    return (
      <EmptyState
        title="Could not load this table"
        description={error.message}
        action={onRetry && <Button size="sm" onClick={onRetry}>Retry</Button>}
      />
    );
  }
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
      <div ref={parentRef} className="scrollbar-thin max-h-[calc(100vh-17rem)] overflow-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-raised">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-line">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
                    style={{ width: header.getSize() }}
                  >
                    <div className="relative flex items-center gap-1">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-ink"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : null}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                      {header.column.getCanResize() && (
                        <button
                          type="button"
                          className="absolute -right-3 top-0 h-6 w-2 cursor-col-resize touch-none opacity-0 hover:opacity-100 focus:opacity-100"
                          onDoubleClick={() => header.column.resetSize()}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          aria-label={`Resize ${String(header.column.columnDef.header ?? 'column')}`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              const focused = focusedRowId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr
                    data-index={virtualRow.index}
                    ref={(node) => virtualizer.measureElement(node)}
                    className={cn(
                      'absolute left-0 flex w-full border-b border-line/70 bg-surface hover:bg-surface-raised',
                      row.getIsSelected() && 'bg-surface-selected',
                      focused && 'ring-2 ring-inset ring-accent/60',
                    )}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                    onClick={() => onRowActivate?.(row.original)}
                    onDoubleClick={() => onRowInspect?.(row.original)}
                  >
                    {renderExpanded && (
                      <td className="flex w-8 items-center justify-center px-1">
                        <button
                          type="button"
                          className="rounded p-1 text-ink-faint hover:bg-surface hover:text-ink"
                          onClick={(event) => {
                            event.stopPropagation();
                            row.toggleExpanded();
                          }}
                          aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                        >
                          {row.getIsExpanded() ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="flex min-w-0 flex-1 items-center px-3 py-2.5 text-sm text-ink">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    {onRowInspect && (
                      <td className="flex w-10 items-center justify-center px-1">
                        <button
                          type="button"
                          className="rounded p-1 text-ink-faint hover:bg-surface hover:text-ink"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRowInspect(row.original);
                          }}
                          aria-label="Inspect row"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                  {renderExpanded && row.getIsExpanded() && (
                    <tr
                      className="absolute left-0 w-full border-b border-line bg-surface-raised"
                      style={{ transform: `translateY(${virtualRow.start + estimateRowHeight}px)` }}
                    >
                      <td
                        colSpan={row.getVisibleCells().length + (onRowInspect ? 1 : 0) + 1}
                        className="px-4 py-3"
                      >
                        {renderExpanded(row.original)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {showSelectionFooter && selectedIds.length > 0 && (
        <div className="flex items-center justify-between border-t border-line bg-surface-selected px-3 py-2">
          {selectionFooter ?? (
            <>
              <p className="text-xs font-medium text-accent">{selectedIds.length} selected</p>
              <p className="text-xs text-ink-muted">Use the page bulk bar for audited actions.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DataTableSkeleton({ columnCount }: { columnCount: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface p-3 shadow-panel">
      <div className="flex gap-3 border-b border-line pb-3">
        {Array.from({ length: columnCount }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      <div className="space-y-3 pt-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
