'use client';

import { useEffect, useState } from 'react';
import { Button, Input, StatusBadge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

export type AgencyPackage = {
  id: string;
  title: string;
  priceUgx: number;
  depositUgx?: number;
  badge?: string | null;
  band?: 'starter' | 'growth' | 'premium';
  description?: string;
};

export type AgencyService = {
  id: string;
  name: string;
  mapsToSolutionId?: string;
  description?: string;
};

export type AgencySettings = {
  presetId: 'generic' | 'sleeklybuilt' | 'custom';
  brandName: string;
  legalName: string;
  tagline: string;
  currency: 'UGX';
  email: string;
  phone: string;
  location: string;
  senderName: string;
  signature: string;
  packages: AgencyPackage[];
  services: AgencyService[];
};

type PresetMeta = { id: 'generic' | 'sleeklybuilt'; label: string; description: string };

type Props = {
  value: AgencySettings;
  presets: PresetMeta[];
  onChange: (next: AgencySettings) => void;
};

export function AgencyProfilePanel({ value, presets, onChange }: Props) {
  const { push } = useToast();
  const [applying, setApplying] = useState<string | null>(null);

  async function applyPreset(id: 'generic' | 'sleeklybuilt') {
    setApplying(id);
    try {
      const data = await api<{ agency: AgencySettings }>('/api/settings/agency/preset', {
        method: 'POST',
        body: JSON.stringify({ presetId: id }),
      });
      onChange(data.agency);
      push({
        title: id === 'sleeklybuilt' ? 'SleeklyBuilt preset applied' : 'Generic preset applied',
        description:
          id === 'sleeklybuilt'
            ? 'Packages and services now drive proposals, BOI, and drafts.'
            : 'Catalog cleared — legacy labels restored.',
        tone: 'success',
      });
    } catch (e) {
      push({
        title: 'Could not apply preset',
        description: e instanceof Error ? e.message : String(e),
        tone: 'error',
      });
    } finally {
      setApplying(null);
    }
  }

  return (
    <section id="settings-agency" className="scroll-mt-16 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Agency profile</h3>
          <p className="mt-1 text-sm text-slate-600">
            Single-deploy identity for outreach, proposals, BOI recommendations, and drafts. Empty
            catalog keeps legacy generic labels.
          </p>
        </div>
        <StatusBadge tone={value.presetId === 'sleeklybuilt' ? 'success' : 'neutral'}>
          {value.presetId}
        </StatusBadge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={Boolean(applying)}
            onClick={() => void applyPreset(preset.id)}
            className="rounded-md border border-slate-200 px-3 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <p className="font-medium text-slate-900">{preset.label}</p>
            <p className="mt-1 text-xs text-slate-500">{preset.description}</p>
            <p className="mt-2 text-xs font-medium text-brand-700">
              {applying === preset.id ? 'Applying…' : 'Apply preset'}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Brand name</span>
          <Input
            value={value.brandName}
            onChange={(e) => onChange({ ...value, brandName: e.target.value, presetId: 'custom' })}
            placeholder="SleeklyBuilt"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Legal name</span>
          <Input
            value={value.legalName}
            onChange={(e) => onChange({ ...value, legalName: e.target.value, presetId: 'custom' })}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">Tagline</span>
          <Input
            value={value.tagline}
            onChange={(e) => onChange({ ...value, tagline: e.target.value, presetId: 'custom' })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Sender name</span>
          <Input
            value={value.senderName}
            onChange={(e) => onChange({ ...value, senderName: e.target.value, presetId: 'custom' })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <Input
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value, presetId: 'custom' })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Phone</span>
          <Input
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value, presetId: 'custom' })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Location</span>
          <Input
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value, presetId: 'custom' })}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">Email signature</span>
          <textarea
            className="mt-1 min-h-[96px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={value.signature}
            onChange={(e) => onChange({ ...value, signature: e.target.value, presetId: 'custom' })}
            placeholder="—&#10;Your Agency&#10;email · phone"
          />
        </label>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
        <p className="font-medium text-slate-800">
          Catalog · {value.packages.length} package(s) · {value.services.length} service(s)
        </p>
        {value.packages.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">
            No packages — proposal presets and BOI bands use legacy defaults.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {value.packages.map((pkg) => (
              <li key={pkg.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  {pkg.title}
                  {pkg.badge ? ` · ${pkg.badge}` : ''}
                </span>
                <span className="tabular-nums">UGX {pkg.priceUgx.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        {value.services.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            Services remap BOI recommendations: {value.services.map((s) => s.name).slice(0, 3).join(', ')}
            {value.services.length > 3 ? ` +${value.services.length - 3}` : ''}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">
          Save the main Settings form to persist field edits. Preset apply writes immediately.
        </p>
      </div>
    </section>
  );
}

/** Load presets list once for settings page. */
export function useAgencyPresets() {
  const [presets, setPresets] = useState<PresetMeta[]>([]);
  useEffect(() => {
    void api<{ presets: PresetMeta[] }>('/api/settings/agency/preset')
      .then((d) => setPresets(d.presets))
      .catch(() =>
        setPresets([
          {
            id: 'generic',
            label: 'Generic agency',
            description: 'Empty catalog — legacy labels.',
          },
          {
            id: 'sleeklybuilt',
            label: 'SleeklyBuilt',
            description: 'Brand + UGX packages from SleeklyBuilt.',
          },
        ]),
      );
  }, []);
  return presets;
}
