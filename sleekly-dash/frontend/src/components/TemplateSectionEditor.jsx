import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LinkIcon,
  PhotoIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { TemplatesAPI } from '../services/api';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function fieldIcon(kind) {
  if (kind.startsWith('image_')) return PhotoIcon;
  if (kind === 'link') return LinkIcon;
  return DocumentTextIcon;
}

function FieldEditor({ field, value, changed, onChange }) {
  const Icon = fieldIcon(field.kind);
  const common = {
    value,
    maxLength: field.max_length,
    onChange: (event) => onChange(event.target.value),
    className: cx('form-input', changed && 'border-violet-500/70 bg-violet-500/5'),
  };
  const multiline = field.kind === 'text' && field.max_length > 300;

  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon className="h-4 w-4 text-slate-500" />
        <span className="min-w-0 flex-1 truncate">{field.label}</span>
        {changed && (
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
            Changed
          </span>
        )}
      </span>
      {multiline ? <textarea {...common} rows={4} className={`${common.className} resize-y`} /> : <input {...common} type="text" />}
      <span className="mt-1.5 flex justify-between text-[11px] text-slate-600">
        <span>{field.kind.replace('_', ' ')}</span>
        <span>{value.length}/{field.max_length}</span>
      </span>
    </label>
  );
}

function ChangeItem({ change }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-white">{change.label}</p>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {change.kind.replace('_', ' ')}
        </span>
      </div>
      <p className="mt-1 text-xs text-violet-300">{change.section_label}</p>
      <div className="mt-3 grid gap-2 text-xs leading-5">
        <div className="rounded-lg bg-rose-500/5 px-3 py-2 text-rose-200/70">
          <span className="mr-2 font-semibold text-rose-300">Before</span>
          <span className="break-words">{change.before || 'Empty'}</span>
        </div>
        <div className="rounded-lg bg-emerald-500/5 px-3 py-2 text-emerald-100/80">
          <span className="mr-2 font-semibold text-emerald-300">After</span>
          <span className="break-words">{change.after || 'Empty'}</span>
        </div>
      </div>
    </article>
  );
}

export default function TemplateSectionEditor({ template, onClose, onApplied }) {
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState({});
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('edit');
  const [draft, setDraft] = useState(null);
  const [result, setResult] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await TemplatesAPI.sections(template.slug);
      const initial = {};
      data.sections.forEach((section) => {
        section.fields.forEach((field) => {
          initial[field.id] = field.value;
        });
      });
      setProfile(data);
      setValues(initial);
      setSelectedSectionId((current) => (
        data.sections.some((section) => section.id === current)
          ? current
          : (data.sections[0]?.id || '')
      ));
      setDraft(null);
      setStep('edit');
    } catch (loadError) {
      setError(loadError.message || 'Unable to extract editable sections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // The workspace is intentionally reloaded only when the selected template changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.slug]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, onClose]);

  const fieldMap = useMemo(() => {
    const map = new Map();
    profile?.sections.forEach((section) => {
      section.fields.forEach((field) => map.set(field.id, field));
    });
    return map;
  }, [profile]);

  const edits = useMemo(() => {
    const changed = [];
    fieldMap.forEach((field, fieldId) => {
      if (values[fieldId] !== field.value) {
        changed.push({ field_id: fieldId, value: values[fieldId] ?? '' });
      }
    });
    return changed;
  }, [fieldMap, values]);

  const selected = profile?.sections.find((section) => section.id === selectedSectionId) || null;
  const changedIds = useMemo(() => new Set(edits.map((edit) => edit.field_id)), [edits]);
  const sectionChangeCount = (section) => section.fields.filter((field) => changedIds.has(field.id)).length;

  const createPreview = async () => {
    if (!profile || edits.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const preview = await TemplatesAPI.previewSections(template.slug, {
        fingerprint: profile.fingerprint,
        edits,
      });
      setDraft(preview);
      setStep('review');
    } catch (previewError) {
      setError(previewError.message || 'Unable to create the content preview.');
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      const applied = await TemplatesAPI.applySectionDraft(template.slug, draft.token);
      setResult(applied);
      setStep('success');
      await onApplied?.();
    } catch (applyError) {
      setError(applyError.message || 'Unable to apply the content changes.');
    } finally {
      setBusy(false);
    }
  };

  const rollback = async () => {
    if (!window.confirm('Restore the homepage content from before the last section edit?')) return;
    setBusy(true);
    setError('');
    try {
      await TemplatesAPI.rollbackSections(template.slug);
      await onApplied?.();
      await load();
    } catch (rollbackError) {
      setError(rollbackError.message || 'Unable to restore the content backup.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0d11]" role="dialog" aria-modal="true" aria-label={`Edit content for ${template.title}`}>
      <header className="flex min-h-16 items-center gap-3 border-b border-slate-800 px-4 py-3 sm:px-6">
        {step === 'review' && (
          <button type="button" onClick={() => setStep('edit')} disabled={busy} className="btn-icon" aria-label="Back to editing">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Structured content editor</p>
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">{template.title}</h2>
        </div>
        {profile?.can_rollback && step === 'edit' && (
          <button type="button" onClick={rollback} disabled={busy} className="btn-danger hidden sm:inline-flex">
            Restore last version
          </button>
        )}
        <button type="button" onClick={onClose} disabled={busy} className="btn-icon" aria-label="Close editor">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </header>

      {error && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200 sm:mx-6">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          {error.toLowerCase().includes('changed') && (
            <button type="button" onClick={load} className="font-semibold text-white underline">Refresh</button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-sm text-slate-400">
            <ArrowPathIcon className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-300" />
            Extracting safe editable fields…
          </div>
        </div>
      ) : !profile ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <button type="button" onClick={load} className="btn-secondary">Try extraction again</button>
        </div>
      ) : profile.sections.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <Squares2X2Icon className="mx-auto h-10 w-10 text-slate-600" />
            <h3 className="mt-4 font-semibold text-white">No safe editable sections found</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              This homepage uses markup that cannot be changed confidently without a custom rebuild.
            </p>
          </div>
        </div>
      ) : step === 'success' ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-300" />
            <h3 className="mt-5 text-xl font-semibold text-white">Content changes are live</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result?.change_count} fields were applied atomically and the seller/CTA validation passed.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <a href={template.entry} target="_blank" rel="noreferrer" className="btn-secondary">
                View live <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
              <button type="button" onClick={onClose} className="btn-primary">Done</button>
            </div>
          </div>
        </div>
      ) : step === 'review' && draft ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="max-h-[38vh] overflow-y-auto border-b border-slate-800 p-4 lg:max-h-none lg:border-b-0 lg:border-r lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Review changes</h3>
                <p className="mt-1 text-xs text-slate-500">{draft.change_count} fields · expires {new Date(draft.expires_at).toLocaleTimeString()}</p>
              </div>
              <EyeIcon className="h-5 w-5 text-violet-300" />
            </div>
            <div className="mt-4 space-y-3">
              {draft.changes.map((change) => <ChangeItem key={change.field_id} change={change} />)}
            </div>
          </aside>
          <main className="min-h-0 bg-slate-950 p-3 sm:p-5">
            <div className="flex h-full min-h-80 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-black">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" />Private sandbox preview</span>
                <span>Scripts isolated</span>
              </div>
              <iframe
                src={draft.preview_url}
                title={`Content preview for ${template.title}`}
                sandbox="allow-scripts allow-forms"
                className="min-h-0 flex-1 bg-white"
              />
            </div>
          </main>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden overflow-y-auto border-r border-slate-800 bg-slate-950/30 p-4 md:block">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {profile.totals.sections} sections · {profile.totals.fields} fields
            </p>
            <nav className="mt-3 space-y-1">
              {profile.sections.map((section) => {
                const changed = sectionChangeCount(section);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedSectionId(section.id)}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
                      selectedSectionId === section.id
                        ? 'bg-violet-500/10 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{section.label}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-600">{section.field_count} fields</span>
                    </span>
                    {changed > 0 ? (
                      <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">{changed}</span>
                    ) : <ChevronRightIcon className="h-4 w-4 text-slate-700" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-h-0 overflow-y-auto">
            <div className="sticky top-0 z-10 border-b border-slate-800 bg-[#0b0d11]/95 px-4 py-3 backdrop-blur md:hidden">
              <select
                value={selectedSectionId}
                onChange={(event) => setSelectedSectionId(event.target.value)}
                className="form-input mt-0"
                aria-label="Select section"
              >
                {profile.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label} ({section.field_count})
                  </option>
                ))}
              </select>
            </div>
            {selected && (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">{selected.type}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{selected.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Only leaf text and explicit image/link attributes are editable.
                  </p>
                </div>
                <div className="space-y-3">
                  {selected.fields.map((field) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      value={values[field.id] ?? ''}
                      changed={changedIds.has(field.id)}
                      onChange={(value) => setValues((current) => ({ ...current, [field.id]: value }))}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {!loading && profile && step === 'edit' && profile.sections.length > 0 && (
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-[#0d0f13] px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          {profile.can_rollback && (
            <button type="button" onClick={rollback} disabled={busy} className="btn-danger sm:hidden">
              Restore last version
            </button>
          )}
          <p className="text-xs text-slate-500 sm:flex-1">
            {edits.length > 0 ? `${edits.length} unsaved field changes` : 'No changes yet'}
          </p>
          <button type="button" onClick={createPreview} disabled={busy || edits.length === 0} className="btn-primary">
            {busy ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <EyeIcon className="h-4 w-4" />}
            Review changes
          </button>
        </footer>
      )}

      {step === 'review' && draft && (
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-[#0d0f13] px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button type="button" onClick={() => setStep('edit')} disabled={busy} className="btn-secondary">Continue editing</button>
          <button type="button" onClick={apply} disabled={busy} className="btn-primary">
            {busy ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            Apply {draft.change_count} changes
          </button>
        </footer>
      )}
    </div>
  );
}
