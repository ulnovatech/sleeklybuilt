'use client';

import Link from 'next/link';
import { Input, StatusBadge } from '@/components/ui/primitives';

export type DraftSettingsForm = {
  enabled: boolean;
  provider: 'openrouter' | 'openai' | 'anthropic';
  model: string;
  maxOutputTokens: number;
};

export type DraftCredentialField = {
  key: string;
  label: string;
  envVar: string;
  configured: boolean;
  source: string;
  hasStoredValue: boolean;
};

export type DraftBudgetStatus = {
  cap: number;
  used: number;
  remaining: number;
  canSpend: boolean;
  period?: string;
};

const PROVIDER_CREDENTIAL: Record<DraftSettingsForm['provider'], string> = {
  openrouter: 'openrouter_api_key',
  openai: 'openai_api_key',
  anthropic: 'anthropic_api_key',
};

const PROVIDER_LABEL: Record<DraftSettingsForm['provider'], string> = {
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

const PROVIDER_MODELS: Record<DraftSettingsForm['provider'], Array<{ value: string; label: string }>> = {
  openrouter: [
    { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (default)' },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 via OpenRouter' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-0', label: 'Claude Sonnet 4' },
    { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
  ],
};

function defaultModel(provider: DraftSettingsForm['provider']): string {
  return PROVIDER_MODELS[provider][0]?.value ?? 'google/gemini-2.5-pro';
}

function sourceLabel(credential: DraftCredentialField): string {
  if (!credential.configured) return 'Missing';
  if (credential.source === 'env') return credential.envVar;
  if (credential.source === 'database') return 'Database';
  return credential.source;
}

export function OutreachDraftsSettingsPanel({
  drafts,
  onDraftsChange,
  dailyCap,
  onDailyCapChange,
  credentials,
  credentialValues,
  onCredentialValueChange,
  budget,
}: {
  drafts: DraftSettingsForm;
  onDraftsChange: (next: DraftSettingsForm) => void;
  dailyCap: number;
  onDailyCapChange: (next: number) => void;
  credentials: DraftCredentialField[];
  credentialValues: Record<string, string>;
  onCredentialValueChange: (key: string, value: string) => void;
  budget: DraftBudgetStatus | null;
}) {
  const credentialKey = PROVIDER_CREDENTIAL[drafts.provider];
  const credential = credentials.find((item) => item.key === credentialKey);
  const presets = PROVIDER_MODELS[drafts.provider];
  const knownPreset = presets.some((item) => item.value === drafts.model);
  const usedPct =
    budget && budget.cap > 0 ? Math.min(100, Math.round((budget.used / budget.cap) * 100)) : 0;
  const selectedMissing = Boolean(credential && !credential.configured);
  const capExhausted = Boolean(budget && !budget.canSpend);

  return (
    <section id="settings-drafts" className="scroll-mt-16 space-y-4 rounded-lg border border-line bg-surface p-4 shadow-panel">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">Channel pitches (on-demand)</h3>
          <StatusBadge tone={drafts.enabled ? 'success' : 'neutral'}>
            {drafts.enabled ? 'Enabled' : 'Disabled'}
          </StatusBadge>
          {credential && (
            <StatusBadge tone={credential.configured ? 'success' : 'warning'}>
              {credential.configured ? `Key via ${sourceLabel(credential)}` : 'Credential missing'}
            </StatusBadge>
          )}
          {budget && (
            <StatusBadge tone={budget.canSpend ? 'info' : 'warning'}>
              {budget.used}/{budget.cap} today
            </StatusBadge>
          )}
        </div>
        <p className="text-sm leading-6 text-ink-muted">
          Pitches are generated on demand from Case File facts — not during discovery. Operators pick
          one lead and one channel (email, WhatsApp, phone, follow-up) in{' '}
          <Link href="/outreach" className="font-medium text-accent hover:underline">
            Outreach Queue
          </Link>
          . Missing credentials or an exhausted daily cap fail clearly — the product never substitutes
          a generic template.
        </p>
      </header>

      {!drafts.enabled && (
        <p className="rounded-md border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
          Generate pitch is blocked until this is enabled.
        </p>
      )}
      {drafts.enabled && selectedMissing && (
        <p className="rounded-md border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger-foreground">
          {PROVIDER_LABEL[drafts.provider]} is selected but has no key. Save a value below or set{' '}
          <code className="text-[11px]">{credential?.envVar}</code>.
        </p>
      )}
      {drafts.enabled && capExhausted && (
        <p className="rounded-md border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
          Daily cap is exhausted ({budget?.used}/{budget?.cap}). Raise the cap or wait until the next
          day — cached pitches still open without spending budget.
        </p>
      )}

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={drafts.enabled}
          onChange={(event) => onDraftsChange({ ...drafts, enabled: event.target.checked })}
        />
        <span>
          Enable pitch generation
          <span className="mt-0.5 block text-xs text-ink-muted">
            When off, Generate pitch explains that drafts are disabled here.
          </span>
        </span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Provider
          <select
            className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
            value={drafts.provider}
            onChange={(event) => {
              const provider = event.target.value as DraftSettingsForm['provider'];
              onDraftsChange({
                ...drafts,
                provider,
                model: defaultModel(provider),
              });
            }}
          >
            <option value="openrouter">OpenRouter (Gemini default)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Model
          <select
            className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
            value={knownPreset ? drafts.model : '__custom__'}
            onChange={(event) => {
              const value = event.target.value;
              if (value === '__custom__') return;
              onDraftsChange({ ...drafts, model: value });
            }}
          >
            {presets.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
            {!knownPreset && <option value="__custom__">Custom: {drafts.model}</option>}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted sm:col-span-2">
          Custom model id
          <Input
            className="font-mono text-xs"
            value={drafts.model}
            onChange={(event) => onDraftsChange({ ...drafts, model: event.target.value })}
            placeholder="google/gemini-2.5-pro"
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Daily pitch cap (llm_draft)
          <Input
            type="number"
            min={0}
            value={dailyCap}
            onChange={(event) => onDailyCapChange(parseInt(event.target.value, 10) || 0)}
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Max output tokens
          <Input
            type="number"
            min={100}
            max={4000}
            value={drafts.maxOutputTokens}
            onChange={(event) =>
              onDraftsChange({
                ...drafts,
                maxOutputTokens: parseInt(event.target.value, 10) || 900,
              })
            }
          />
        </label>
      </div>

      <div className="space-y-2 rounded-md border border-line bg-surface-raised p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-ink">Today's budget</p>
          {budget ? (
            <p className="text-xs text-ink-muted">
              {budget.used} used · {budget.remaining} remaining · {budget.period ?? 'daily'} cap {budget.cap}
            </p>
          ) : (
            <p className="text-xs text-ink-muted">Usage unavailable — save and reload to refresh.</p>
          )}
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-line"
          role="meter"
          aria-label="Daily pitch budget used"
          aria-valuemin={0}
          aria-valuemax={budget?.cap ?? 0}
          aria-valuenow={budget?.used ?? 0}
        >
          <div
            className={`h-full ${capExhausted ? 'bg-warning' : 'bg-accent'}`}
            style={{ width: `${budget ? usedPct : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-ink-muted">Provider credentials</p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(Object.keys(PROVIDER_CREDENTIAL) as DraftSettingsForm['provider'][]).map((provider) => {
            const key = PROVIDER_CREDENTIAL[provider];
            const item = credentials.find((entry) => entry.key === key);
            const selected = drafts.provider === provider;
            return (
              <li
                key={provider}
                className={`rounded-md border px-3 py-2 ${
                  selected ? 'border-accent bg-accent-muted' : 'border-line bg-surface-raised'
                }`}
              >
                <p className="text-xs font-medium text-ink">
                  {PROVIDER_LABEL[provider]}
                  {selected ? ' · selected' : ''}
                </p>
                <p className="mt-1 text-[11px] text-ink-muted">
                  {item ? (item.configured ? `Ready (${sourceLabel(item)})` : 'Not configured') : 'Unknown'}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {credential && (
        <div className="space-y-2 rounded-md border border-line bg-surface-raised p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink">{credential.label}</p>
            <StatusBadge tone={credential.configured ? 'success' : 'danger'}>
              {credential.configured ? 'Configured' : 'Not configured'}
            </StatusBadge>
          </div>
          <p className="text-xs text-ink-muted">
            Required for the selected provider. Leave blank to keep the stored value. Env{' '}
            <code className="text-[11px]">{credential.envVar}</code> overrides the database.
          </p>
          <Input
            type="password"
            autoComplete="off"
            placeholder={
              credential.hasStoredValue
                ? '••••••••  (leave blank to keep)'
                : `Enter ${credential.envVar}`
            }
            value={credentialValues[credential.key] ?? ''}
            onChange={(event) => onCredentialValueChange(credential.key, event.target.value)}
          />
        </div>
      )}
    </section>
  );
}
