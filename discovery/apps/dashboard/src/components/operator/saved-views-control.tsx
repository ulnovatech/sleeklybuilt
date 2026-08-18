'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dialog, Input } from '@/components/ui/primitives';
import { api } from '@/lib/api';

export type SavedViewDefinition = {
  filters: Record<string, string>;
  sort?: string;
  direction?: 'asc' | 'desc';
  columns?: string[];
  density?: 'compact' | 'comfortable';
};

export type SavedView = {
  id: string;
  name: string;
  surface: string;
  isDefault: boolean;
  definition: SavedViewDefinition;
};

export type ProductSavedView = {
  id: string;
  name: string;
  definition: SavedViewDefinition;
};

type SavedViewsControlProps = {
  surface:
    | 'work_queue'
    | 'review_queue'
    | 'leads'
    | 'discovery_runs'
    | 'discovery_plans'
    | 'follow_ups';
  currentDefinition: SavedViewDefinition;
  activeViewId?: string | null;
  onApply: (view: SavedView) => void;
  onActiveViewChange?: (viewId: string | null) => void;
  /** Product-owned presets shown ahead of operator-saved views (not persisted until saved). */
  productPresets?: ProductSavedView[];
};

export function SavedViewsControl({
  surface,
  currentDefinition,
  activeViewId,
  onApply,
  onActiveViewChange,
  productPresets = [],
}: SavedViewsControlProps) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [asDefault, setAsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadViews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ views: SavedView[] }>(
        `/api/operator/saved-views?surface=${surface}`,
      );
      setViews(data.views);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load saved views');
    } finally {
      setLoading(false);
    }
  }, [surface]);

  useEffect(() => {
    void loadViews();
  }, [loadViews]);

  useEffect(() => {
    if (activeViewId || views.length === 0) return;
    const defaultView = views.find((view) => view.isDefault);
    if (!defaultView) return;
    onApply(defaultView);
    onActiveViewChange?.(defaultView.id);
    // Apply operator default once after first successful load when no view is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [views]);

  const selectableViews = useMemo(() => {
    const presets: SavedView[] = productPresets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      surface,
      isDefault: false,
      definition: preset.definition,
    }));
    return [...presets, ...views];
  }, [productPresets, surface, views]);

  const saveView = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const data = await api<{ view: SavedView }>('/api/operator/saved-views', {
        method: 'POST',
        body: JSON.stringify({
          surface,
          name: name.trim(),
          isDefault: asDefault,
          definition: currentDefinition,
        }),
      });
      setSaveOpen(false);
      setName('');
      setAsDefault(false);
      await loadViews();
      onApply(data.view);
      onActiveViewChange?.(data.view.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to save view');
    } finally {
      setSaving(false);
    }
  };

  const deleteActive = async () => {
    if (!activeViewId || activeViewId.startsWith('preset:')) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/api/operator/saved-views/${activeViewId}`, { method: 'DELETE' });
      onActiveViewChange?.(null);
      await loadViews();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to delete view');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="min-w-40 space-y-1 text-xs font-medium text-ink-muted">
        Saved view
        <select
          className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
          value={activeViewId ?? ''}
          disabled={loading}
          onChange={(event) => {
            const id = event.target.value;
            if (!id) {
              onActiveViewChange?.(null);
              return;
            }
            const view = selectableViews.find((entry) => entry.id === id);
            if (!view) return;
            onApply(view);
            onActiveViewChange?.(view.id);
          }}
        >
          <option value="">Current filters</option>
          {productPresets.length > 0 && (
            <optgroup label="Product views">
              {productPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </optgroup>
          )}
          {views.length > 0 && (
            <optgroup label="Your views">
              {views.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                  {view.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <Button size="sm" onClick={() => setSaveOpen(true)}>
        Save view
      </Button>
      {activeViewId && !activeViewId.startsWith('preset:') && (
        <Button size="sm" variant="ghost" loading={saving} onClick={() => void deleteActive()}>
          Delete view
        </Button>
      )}
      {error && <p className="w-full text-xs text-danger">{error}</p>}

      <Dialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="Save work queue view"
        description="Store the current filters for this operator. Views are server-backed, not browser-only."
      >
        <div className="mt-4 space-y-3">
          <label className="block space-y-1 text-xs font-medium text-ink-muted">
            Name
            <Input
              value={name}
              placeholder="e.g. Greenfield verified"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void saveView();
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={asDefault}
              onChange={(event) => setAsDefault(event.target.checked)}
            />
            Set as default for this surface
          </label>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} onClick={() => void saveView()}>
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
