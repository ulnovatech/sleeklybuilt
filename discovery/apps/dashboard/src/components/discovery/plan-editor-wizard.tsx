'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  Input,
  StatusBadge,
} from '@/components/ui/primitives';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export type DiscoveryOptions = {
  countries: string[];
  industries: string[];
  citiesByCountry: Record<string, string[]>;
  allCitiesLabel: string;
  defaults: { country: string; city: string; industry: string };
};

export type PlanEditorSeed = {
  name?: string;
  description?: string;
  country?: string;
  city?: string;
  industry?: string;
  industries?: string[];
  everyHours?: number;
  profile?: 'micro' | 'standard' | 'boost';
  prospectFocus?: boolean;
  sources?: string[];
  presence?: 'greenfield' | 'redesign' | 'any';
};

type WizardStep = 0 | 1 | 2 | 3;

const STEPS = ['Goal', 'Targets', 'Sources & depth', 'Cadence & caps'] as const;

const SOURCE_OPTIONS = [
  { id: 'google_maps', label: 'Google Maps / Places' },
  { id: 'public_search', label: 'Public search (CSE)' },
  { id: 'facebook', label: 'Facebook pages' },
  { id: 'social_search', label: 'Social search' },
] as const;

type CatalogCampaign = {
  id: string;
  label: string;
  description: string;
  presence: 'greenfield' | 'redesign' | 'any';
  prospectFocus: boolean;
  keywords: string[];
  industries: string[];
  industryCount: number;
};

type CatalogPack = {
  id: string;
  label: string;
  description: string;
  industries: string[];
  industryCount: number;
};

type FormState = {
  name: string;
  description: string;
  planType: 'discovery' | 'monitor';
  priority: string;
  prospectFocus: boolean;
  campaignId: string;
  packId: string;
  keywords: string[];
  country: string;
  cities: string[];
  industries: string[];
  sources: string[];
  runProfile: 'micro' | 'standard' | 'boost';
  presence: 'greenfield' | 'redesign' | 'any';
  boiNarrative: boolean;
  everyHours: string;
  maxRunsPerDay: string;
  maxConcurrentRuns: string;
  scheduleImmediately: boolean;
};

function buildInitial(options: DiscoveryOptions | null, seed?: PlanEditorSeed): FormState {
  const country = seed?.country || options?.defaults.country || '';
  const city = seed?.city || options?.defaults.city || options?.allCitiesLabel || '';
  const industry = seed?.industry || options?.defaults.industry || '';
  const industries = seed?.industries?.length ? seed.industries : industry ? [industry] : [];
  return {
    name: seed?.name || (city && industry ? `${city} ${industry}` : ''),
    description: seed?.description || '',
    planType: 'discovery',
    priority: '0',
    prospectFocus: seed?.prospectFocus ?? true,
    campaignId: '',
    packId: '',
    keywords: [],
    country,
    cities: city ? [city] : [],
    industries,
    sources: seed?.sources?.length ? seed.sources : ['google_maps', 'public_search'],
    runProfile: seed?.profile ?? 'standard',
    presence: seed?.presence ?? 'greenfield',
    boiNarrative: false,
    everyHours: String(seed?.everyHours ?? 24),
    maxRunsPerDay: '8',
    maxConcurrentRuns: '1',
    scheduleImmediately: true,
  };
}

export function PlanEditorWizard({
  open,
  onOpenChange,
  options,
  seed,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: DiscoveryOptions | null;
  seed?: PlanEditorSeed | null;
  onCreated?: (planId: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState<WizardStep>(0);
  const [form, setForm] = useState<FormState>(() => buildInitial(options, seed ?? undefined));
  const [submitting, setSubmitting] = useState(false);
  const [cityDraft, setCityDraft] = useState('');
  const [industryDraft, setIndustryDraft] = useState('');
  const [campaigns, setCampaigns] = useState<CatalogCampaign[]>([]);
  const [packs, setPacks] = useState<CatalogPack[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setForm(buildInitial(options, seed ?? undefined));
    setCityDraft('');
    setIndustryDraft('');
  }, [open, options, seed]);

  useEffect(() => {
    if (!open) return;
    void api<{ campaigns: CatalogCampaign[]; packs: CatalogPack[] }>('/api/discovery/plans/catalog')
      .then((data) => {
        setCampaigns(data.campaigns);
        setPacks(data.packs);
        setCatalogError(null);
      })
      .catch((e) => {
        setCatalogError(e instanceof Error ? e.message : 'Failed to load campaigns');
      });
  }, [open]);

  const cityOptions = useMemo(() => {
    if (!options || !form.country) return [];
    return [options.allCitiesLabel, ...(options.citiesByCountry[form.country] ?? [])];
  }, [form.country, options]);

  function applyCatalogSelection(next: { campaignId?: string; packId?: string }) {
    const campaignId = next.campaignId !== undefined ? next.campaignId : form.campaignId;
    const packId = next.packId !== undefined ? next.packId : form.packId;
    const campaign = campaigns.find((c) => c.id === campaignId) ?? null;
    const pack = packs.find((p) => p.id === packId) ?? null;

    let industries: string[] = form.industries;
    if (campaign && pack) {
      const packSet = new Set(pack.industries.map((i) => i.toLowerCase()));
      industries = campaign.industries.filter((i) => packSet.has(i.toLowerCase()));
      if (industries.length === 0) industries = pack.industries.length ? pack.industries : campaign.industries;
    } else if (pack) {
      industries = pack.industries;
    } else if (campaign) {
      industries = campaign.industries;
    }

    const city = form.cities[0] || options?.defaults.city || '';
    const name = campaign
      ? campaign.label === 'Website build'
        ? `${city || 'Plan'} Website build`
        : `${city || 'Plan'} ${campaign.label}`
      : pack
        ? `${city || 'Plan'} ${pack.label}`
        : form.name;

    setForm((f) => ({
      ...f,
      campaignId,
      packId,
      industries,
      keywords: campaign?.keywords ?? [],
      presence: campaign?.presence ?? (pack ? 'greenfield' : f.presence),
      prospectFocus: campaign?.prospectFocus ?? (pack ? true : f.prospectFocus),
      name: campaign || pack ? name : f.name,
      description:
        [campaign?.description, pack ? `Pack: ${pack.label}. ${pack.description}` : null]
          .filter(Boolean)
          .join(' ') || f.description,
    }));
  }

  function toggleSource(id: string) {
    setForm((f) => {
      const has = f.sources.includes(id);
      if (has && f.sources.length === 1) return f;
      return {
        ...f,
        sources: has ? f.sources.filter((s) => s !== id) : [...f.sources, id],
      };
    });
  }

  function addCity(city: string) {
    const value = city.trim();
    if (!value) return;
    setForm((f) => {
      const cities = f.cities.some((c) => c.toLowerCase() === value.toLowerCase())
        ? f.cities
        : [...f.cities, value];
      const campaign = campaigns.find((c) => c.id === f.campaignId);
      const pack = packs.find((p) => p.id === f.packId);
      const primaryCity = cities[0] || value;
      const autoName = campaign
        ? `${primaryCity} ${campaign.label === 'Website build' ? 'Website build' : campaign.label}`
        : pack
          ? `${primaryCity} ${pack.label}`
          : f.name;
      return {
        ...f,
        cities,
        name: campaign || pack ? autoName : f.name,
      };
    });
    setCityDraft('');
  }

  function addIndustry(industry: string) {
    const value = industry.trim();
    if (!value) return;
    setForm((f) =>
      f.industries.some((i) => i.toLowerCase() === value.toLowerCase())
        ? f
        : { ...f, industries: [...f.industries, value] },
    );
    setIndustryDraft('');
  }

  function canAdvance(current: WizardStep): boolean {
    if (current === 0) return form.name.trim().length > 0;
    if (current === 1) {
      return Boolean(form.country && form.cities.length > 0 && form.industries.length > 0);
    }
    if (current === 2) return form.sources.length > 0;
    return true;
  }

  async function submit() {
    if (!canAdvance(3) || !canAdvance(1)) {
      push({
        title: 'Incomplete plan',
        description: 'Name, country, at least one city, and one industry are required.',
        tone: 'error',
      });
      return;
    }
    setSubmitting(true);
    try {
      const everyHours = Math.max(1, Number(form.everyHours) || 24);
      const result = await api<{ plan: { id: string } }>('/api/discovery/plans', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          planType: form.planType,
          priority: Number.parseInt(form.priority, 10) || 0,
          prospectFocus: form.prospectFocus,
          sources: form.sources,
          targets: {
            countries: [form.country],
            citiesByCountry: { [form.country]: form.cities },
            industries: form.industries,
            keywords: form.keywords.length ? form.keywords : undefined,
          },
          filters: { presence: form.presence },
          runProfile: form.runProfile,
          boiNarrative: form.boiNarrative,
          campaignKey: form.campaignId || undefined,
          templateKey: form.packId || undefined,
          cadence: { everyHours },
          limits: {
            maxRunsPerDay: Math.max(1, Number(form.maxRunsPerDay) || 8),
            maxConcurrentRuns: Math.max(1, Number(form.maxConcurrentRuns) || 1),
          },
          scheduleImmediately: form.scheduleImmediately,
          status: 'active',
        }),
      });
      push({
        title: 'Plan created',
        description: form.scheduleImmediately
          ? 'Active — scheduler will pick it up on the next tick.'
          : 'Active plan scheduled on cadence.',
        tone: 'success',
      });
      onOpenChange(false);
      onCreated?.(result.plan.id);
    } catch (e) {
      push({
        title: 'Could not create plan',
        description: e instanceof Error ? e.message : String(e),
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create discovery plan"
      description="Pick a campaign or pack, then targets and cadence — Website build + city + daily is the sure-deal path."
    >
      <div className="space-y-4">
        <ol className="flex flex-wrap gap-2">
          {STEPS.map((label, index) => {
            const active = step === index;
            const done = step > index;
            return (
              <li key={label}>
                <button
                  type="button"
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    active && 'border-brand-400 bg-brand-50 text-brand-900',
                    done && !active && 'border-line bg-surface-raised text-ink',
                    !active && !done && 'border-line text-ink-muted',
                  )}
                  onClick={() => {
                    if (index <= step || canAdvance(step)) setStep(index as WizardStep);
                  }}
                >
                  {index + 1}. {label}
                </button>
              </li>
            );
          })}
        </ol>

        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-medium text-ink-muted">Campaign (optional)</p>
              {catalogError ? (
                <p className="text-xs text-amber-800">{catalogError}</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className={cn(
                      'rounded-md border px-3 py-2 text-left text-sm',
                      !form.campaignId
                        ? 'border-brand-300 bg-brand-50/50'
                        : 'border-line bg-surface-raised',
                    )}
                    onClick={() => applyCatalogSelection({ campaignId: '' })}
                  >
                    <span className="font-medium text-ink">Manual</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      Pick industries yourself in Targets
                    </span>
                  </button>
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      type="button"
                      className={cn(
                        'rounded-md border px-3 py-2 text-left text-sm',
                        form.campaignId === campaign.id
                          ? 'border-brand-300 bg-brand-50/50'
                          : 'border-line bg-surface-raised',
                      )}
                      onClick={() => applyCatalogSelection({ campaignId: campaign.id })}
                    >
                      <span className="font-medium text-ink">{campaign.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {campaign.presence} · {campaign.industryCount} industries
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="space-y-1 text-xs text-ink-muted sm:col-span-2">
              Industry pack (optional)
              <select
                className="flex h-9 w-full rounded-md border border-line bg-surface-raised px-3 text-sm text-ink"
                value={form.packId}
                onChange={(e) => applyCatalogSelection({ packId: e.target.value })}
              >
                <option value="">None — use campaign or manual industries</option>
                {packs.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.label} ({pack.industryCount})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs text-ink-muted sm:col-span-2">
              Plan name
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Kampala Website build"
                autoFocus
              />
            </label>
            <label className="space-y-1 text-xs text-ink-muted sm:col-span-2">
              Description (optional)
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Why this geo/industry matters"
              />
            </label>
            <label className="space-y-1 text-xs text-ink-muted">
              Plan type
              <select
                className="flex h-9 w-full rounded-md border border-line bg-surface-raised px-3 text-sm text-ink"
                value={form.planType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    planType: e.target.value as FormState['planType'],
                  }))
                }
              >
                <option value="discovery">Discovery (scheduled prospecting)</option>
                <option value="monitor">Monitor (re-check known accounts)</option>
              </select>
              {form.planType === 'monitor' ? (
                <p className="mt-1 text-[11px] text-ink-muted">
                  Seeds known accounts for this city × industry, then runs crawl → BI → signals →
                  score. Emits a signal when a business gains a website. Requires prior discovery
                  coverage — no Places/CSE discover spend.
                </p>
              ) : null}
            </label>
            <label className="space-y-1 text-xs text-ink-muted">
              Priority (−100…100)
              <Input
                type="number"
                min={-100}
                max={100}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              />
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface-raised p-3 sm:col-span-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={form.prospectFocus}
                onChange={(e) => setForm((f) => ({ ...f, prospectFocus: e.target.checked }))}
              />
              <span className="text-sm">
                <span className="font-medium text-ink">Prospect focus (recommended)</span>
                <span className="mt-0.5 block text-ink-muted">
                  Bias toward greenfield / social-only / link-in-bio sure-deals.
                  {form.campaignId
                    ? ` Campaign sets presence=${form.presence}.`
                    : ''}
                </span>
              </span>
            </label>
            {form.industries.length > 0 && (form.campaignId || form.packId) ? (
              <p className="text-xs text-ink-muted sm:col-span-2">
                Prefills {form.industries.length} industries
                {form.presence === 'greenfield' ? ' · greenfield lane' : ` · ${form.presence} lane`}
                . Adjust on Targets if needed.
              </p>
            ) : null}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <SearchableSelect
              label="Country"
              value={form.country}
              onChange={(country) =>
                setForm((f) => ({
                  ...f,
                  country,
                  cities: options?.allCitiesLabel ? [options.allCitiesLabel] : [],
                }))
              }
              options={options?.countries ?? []}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <SearchableSelect
                  label="Add city"
                  value={cityDraft}
                  onChange={(city) => {
                    setCityDraft(city);
                    if (city) addCity(city);
                  }}
                  options={cityOptions}
                />
                <div className="flex flex-wrap gap-1.5">
                  {form.cities.length === 0 ? (
                    <span className="text-xs text-ink-muted">Add at least one city</span>
                  ) : (
                    form.cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className="rounded border border-line bg-surface-raised px-2 py-0.5 text-xs text-ink hover:bg-[hsl(var(--danger-muted))]"
                        onClick={() =>
                          setForm((f) => ({ ...f, cities: f.cities.filter((c) => c !== city) }))
                        }
                      >
                        {city} ×
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <SearchableSelect
                  label="Add industry"
                  value={industryDraft}
                  onChange={(industry) => {
                    setIndustryDraft(industry);
                    if (industry) addIndustry(industry);
                  }}
                  options={options?.industries ?? []}
                />
                <div className="flex flex-wrap gap-1.5">
                  {form.industries.length === 0 ? (
                    <span className="text-xs text-ink-muted">Add at least one industry</span>
                  ) : (
                    form.industries.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        className="rounded border border-line bg-surface-raised px-2 py-0.5 text-xs text-ink hover:bg-[hsl(var(--danger-muted))]"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            industries: f.industries.filter((i) => i !== industry),
                          }))
                        }
                      >
                        {industry} ×
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-muted">
              Expands to {Math.max(1, form.cities.length) * Math.max(1, form.industries.length)}{' '}
              city × industry target(s) for rotation.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {SOURCE_OPTIONS.map((source) => {
                const checked = form.sources.includes(source.id);
                return (
                  <label
                    key={source.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                      checked ? 'border-brand-300 bg-brand-50/50' : 'border-line bg-surface-raised',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSource(source.id)}
                    />
                    {source.label}
                  </label>
                );
              })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-ink-muted">
                Run profile
                <select
                  className="flex h-9 w-full rounded-md border border-line bg-surface-raised px-3 text-sm text-ink"
                  value={form.runProfile}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      runProfile: e.target.value as FormState['runProfile'],
                    }))
                  }
                >
                  <option value="micro">Micro — search only</option>
                  <option value="standard">Standard — verify gaps</option>
                  <option value="boost">Boost — higher caps</option>
                </select>
              </label>
              <label className="space-y-1 text-xs text-ink-muted">
                Presence lane
                <select
                  className="flex h-9 w-full rounded-md border border-line bg-surface-raised px-3 text-sm text-ink"
                  value={form.presence}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      presence: e.target.value as FormState['presence'],
                    }))
                  }
                >
                  <option value="greenfield">Greenfield first (recommended)</option>
                  <option value="redesign">Redesign lane</option>
                  <option value="any">Any presence</option>
                </select>
              </label>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface-raised p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={form.boiNarrative}
                onChange={(e) => setForm((f) => ({ ...f, boiNarrative: e.target.checked }))}
              />
              <span className="text-sm">
                <span className="font-medium text-ink">AI opportunity narrative</span>
                <span className="mt-0.5 block text-ink-muted">
                  Optional per-run narrative when a provider is configured. Rules briefs always run.
                </span>
              </span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-ink-muted">
              Every (hours)
              <Input
                type="number"
                min={1}
                max={672}
                value={form.everyHours}
                onChange={(e) => setForm((f) => ({ ...f, everyHours: e.target.value }))}
              />
              <span className="mt-1 flex flex-wrap gap-1.5">
                {[
                  { label: 'Daily', hours: '24' },
                  { label: 'Twice daily', hours: '12' },
                  { label: 'Weekly', hours: '168' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={cn(
                      'rounded border px-2 py-0.5 text-[11px]',
                      form.everyHours === preset.hours
                        ? 'border-brand-300 bg-brand-50 text-brand-900'
                        : 'border-line text-ink-muted',
                    )}
                    onClick={() => setForm((f) => ({ ...f, everyHours: preset.hours }))}
                  >
                    {preset.label}
                  </button>
                ))}
              </span>
            </label>
            <label className="space-y-1 text-xs text-ink-muted">
              Max runs / day
              <Input
                type="number"
                min={1}
                max={100}
                value={form.maxRunsPerDay}
                onChange={(e) => setForm((f) => ({ ...f, maxRunsPerDay: e.target.value }))}
              />
            </label>
            <label className="space-y-1 text-xs text-ink-muted">
              Max concurrent runs
              <Input
                type="number"
                min={1}
                max={10}
                value={form.maxConcurrentRuns}
                onChange={(e) => setForm((f) => ({ ...f, maxConcurrentRuns: e.target.value }))}
              />
            </label>
            <div className="rounded-md border border-line bg-surface-raised p-3 text-xs text-ink-muted">
              <p className="font-medium text-ink">Summary</p>
              <p className="mt-1">
                {form.name || 'Untitled'} · {form.country || '—'} · {form.cities.length} city ·{' '}
                {form.industries.length} industry · every {form.everyHours || '—'}h
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <StatusBadge tone="info">{form.runProfile}</StatusBadge>
                <StatusBadge tone="neutral">{form.presence}</StatusBadge>
                {form.prospectFocus && <StatusBadge tone="success">prospect focus</StatusBadge>}
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface-raised p-3 sm:col-span-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={form.scheduleImmediately}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduleImmediately: e.target.checked }))
                }
              />
              <span className="text-sm">
                <span className="font-medium text-ink">Schedule first run ASAP</span>
                <span className="mt-0.5 block text-ink-muted">
                  Otherwise the first tick waits for the cadence window.
                </span>
              </span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => Math.max(0, s - 1) as WizardStep)}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                size="sm"
                disabled={!canAdvance(step)}
                onClick={() => setStep((s) => Math.min(3, s + 1) as WizardStep)}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                loading={submitting}
                disabled={!options || !canAdvance(1)}
                onClick={() => void submit()}
              >
                Create active plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
