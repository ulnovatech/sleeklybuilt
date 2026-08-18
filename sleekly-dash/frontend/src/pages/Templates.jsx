import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { TemplateImportsAPI, TemplatesAPI } from '../services/api';
import TemplateSectionEditor from '../components/TemplateSectionEditor';

const ACTIVE_STATES = new Set(['queued', 'running', 'scrubbing', 'validating']);
const PHASES = ['queued', 'running', 'scrubbing', 'ready'];
const CATEGORIES = ['business', 'ecommerce', 'food', 'health', 'beauty', 'services'];
const COLLECTIONS = [
  { id: 'websites', label: 'Websites' },
  { id: 'sleek-pages', label: 'Sleek Pages' },
];

function collectionLabel(id) {
  return COLLECTIONS.find((item) => item.id === id)?.label || id || 'Websites';
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatBytes(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(Number(bytes)) / Math.log(1024)), units.length - 1);
  return `${(Number(bytes) / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function StatusBadge({ status }) {
  const styles = {
    queued: 'border-slate-600 bg-slate-800 text-slate-300',
    running: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    scrubbing: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    validating: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    ready: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    published: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    rolled_back: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    failed: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    discarded: 'border-slate-600 bg-slate-800 text-slate-400',
  };
  return (
    <span className={cx(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
      styles[status] || styles.queued,
    )}>
      {String(status || 'queued').replace('_', ' ')}
    </span>
  );
}

function MetricCard({ label, value, detail, tone = 'violet' }) {
  const tones = {
    violet: 'from-violet-500/15 to-transparent border-violet-500/20',
    cyan: 'from-cyan-500/15 to-transparent border-cyan-500/20',
    amber: 'from-amber-500/15 to-transparent border-amber-500/20',
  };
  return (
    <div className={cx('rounded-2xl border bg-gradient-to-br p-4', tones[tone])}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function EmptyState({ onImport }) {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
        <Squares2X2Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">Build your template library</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        Import a licensed Webflow preview, remove seller branding automatically, review it safely, then publish.
      </p>
      <button type="button" onClick={onImport} className="btn-primary mt-6">
        <PlusIcon className="h-4 w-4" />
        Import first template
      </button>
    </div>
  );
}

function TemplateCard({ template, onEditMetadata, onEditContent }) {
  const initial = template.title?.trim()?.charAt(0)?.toUpperCase() || 'T';
  const cover = template.entry
    ? `${String(template.entry).replace(/\/?$/, '/') }images/main.png`
    : null;
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#111318] transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-2xl hover:shadow-violet-950/20">
      <div className="relative flex h-36 items-end overflow-hidden bg-gradient-to-br from-violet-600/30 via-blue-600/10 to-cyan-500/20 p-5">
        {cover && !coverFailed ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top opacity-90 transition duration-300 group-hover:scale-[1.02]"
            onError={() => setCoverFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-black/20 to-transparent" />
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
        {(!cover || coverFailed) && (
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-2xl font-bold text-white backdrop-blur">
            {initial}
          </div>
        )}
        <span className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-200 backdrop-blur">
          {template.category}
        </span>
        <span className="absolute left-4 top-4 z-10 rounded-full border border-cyan-400/20 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-100 backdrop-blur">
          {collectionLabel(template.collection)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="truncate text-base font-semibold text-white">{template.title}</h3>
        <p className="mt-1 truncate text-xs text-slate-500">{template.slug}</p>
        <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-slate-400">
          {template.description || 'No description added yet.'}
        </p>
        <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4">
          <a
            href={template.entry}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary flex-1"
          >
            <EyeIcon className="h-4 w-4" />
            Preview
          </a>
          <button
            type="button"
            onClick={() => onEditContent(template)}
            className="btn-icon"
            aria-label={`Edit ${template.title} content`}
            title="Edit page content"
          >
            <DocumentTextIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onEditMetadata(template)}
            className="btn-icon"
            aria-label={`Edit ${template.title} metadata`}
            title="Edit catalog details"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Drawer({ title, eyebrow, onClose, children, wide = false, error = '', centered = false }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={cx(
        'fixed inset-0 z-50 flex p-4 sm:p-6',
        centered ? 'items-center justify-center' : 'items-stretch justify-end p-0 sm:p-0',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close panel"
      />
      <section
        className={cx(
          'relative flex w-full flex-col bg-[#0d0f13] shadow-2xl',
          centered
            ? 'max-h-[min(90vh,52rem)] rounded-2xl border border-slate-800'
            : 'h-full border-l border-slate-800',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-xl',
        )}
      >
        <header
          className={cx(
            'relative border-b border-slate-800 px-5 py-5 sm:px-7',
            centered ? 'pr-14 text-center' : 'flex items-start justify-between',
          )}
        >
          <div className={centered ? 'mx-auto max-w-md' : undefined}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cx('btn-icon', centered && 'absolute right-4 top-4 sm:right-5 sm:top-5')}
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {error && (
            <div className="mb-5 flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{hint}</span>}
    </label>
  );
}

function ProgressSteps({ status }) {
  const normalized = status === 'validating' ? 'scrubbing' : status;
  const current = status === 'failed' ? -1 : PHASES.indexOf(normalized);
  return (
    <div className="grid grid-cols-4 gap-2" aria-label={`Import status: ${status}`}>
      {PHASES.map((phase, index) => {
        const complete = current >= index;
        return (
          <div key={phase}>
            <div className={cx('h-1.5 rounded-full', complete ? 'bg-violet-500' : 'bg-slate-800')} />
            <p className={cx(
              'mt-2 text-[10px] font-semibold uppercase tracking-wider',
              complete ? 'text-slate-200' : 'text-slate-600',
            )}>
              {phase}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ImportForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    source_url: '',
    title: '',
    description: '',
    category: '',
    collection: 'websites',
  });
  const host = useMemo(() => {
    try {
      return new URL(form.source_url).hostname;
    } catch {
      return '';
    }
  }, [form.source_url]);

  const change = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm leading-6 text-slate-300">
        Use a licensed <strong className="text-white">*.webflow.io</strong> preview. HTML is saved locally;
        Webflow CDN assets stay remote. Seller docks and marketplace links are removed before review.
      </div>
      <Field label="Webflow preview URL" hint={host ? `Stable template ID: ${host}` : 'HTTPS Webflow subdomains only.'}>
        <input
          required
          type="url"
          value={form.source_url}
          onChange={change('source_url')}
          placeholder="https://example.webflow.io/"
          className="form-input"
        />
      </Field>
      <Field label="Display title">
        <input
          required
          value={form.title}
          onChange={change('title')}
          placeholder="e.g. Modern Property"
          maxLength={160}
          className="form-input"
        />
      </Field>
      <Field
        label="Collection"
        hint="Product line shown on the marketing site. Distinct from industry category."
      >
        <select
          required
          value={form.collection}
          onChange={change('collection')}
          className="form-input"
        >
          {COLLECTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Category" hint="Industry vertical for browsing (food, business, …).">
        <input
          required
          list="template-categories"
          value={form.category}
          onChange={change('category')}
          placeholder="e.g. business"
          maxLength={100}
          className="form-input"
        />
        <datalist id="template-categories">
          {CATEGORIES.map((category) => <option key={category} value={category} />)}
        </datalist>
      </Field>
      <Field label="Description" hint="Shown in the catalog. You can edit this after publishing.">
        <textarea
          value={form.description}
          onChange={change('description')}
          rows={4}
          maxLength={5000}
          placeholder="Describe who this template is best for."
          className="form-input resize-none"
        />
      </Field>
      <div className="sticky bottom-0 -mx-5 mt-8 border-t border-slate-800 bg-[#0d0f13]/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <RocketLaunchIcon className="h-4 w-4" />}
          {submitting ? 'Starting secure import…' : 'Start import'}
        </button>
      </div>
    </form>
  );
}

function ScreenshotStatus({ shots, busyAction, onRecapture }) {
  const status = shots?.status || 'pending';
  const files = Array.isArray(shots?.files) ? shots.files : [];
  const pages = Array.isArray(shots?.pages) ? shots.pages : [];
  const capturing = status === 'queued' || status === 'running';

  const copy = {
    pending: {
      title: 'Gallery shots not started',
      body: 'After publish we capture the homepage plus a few main nav pages for the gallery strip.',
    },
    queued: {
      title: 'Gallery shots queued',
      body: 'Capturing the homepage and main pages next — usually under a minute.',
    },
    running: {
      title: 'Capturing main pages',
      body: 'Homepage becomes main.png. Inner pages are limited to the primary nav (max 6 total).',
    },
    ready: {
      title: 'Gallery shots ready',
      body: `${files.length || pages.length || 0} page shot${(files.length || pages.length) === 1 ? '' : 's'} saved for the portfolio card strip.`,
    },
    failed: {
      title: 'Gallery shots failed',
      body: shots?.error || 'Could not capture screenshots. Retry after Node/Chromium is available.',
    },
  }[status] || {
    title: 'Gallery shots',
    body: 'Homepage and main pages only.',
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-5">
      <div className="flex items-start gap-3">
        {capturing ? (
          <ArrowPathIcon className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-cyan-300" />
        ) : status === 'ready' ? (
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        ) : status === 'failed' ? (
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        ) : (
          <Squares2X2Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">{copy.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{copy.body}</p>
          {pages.length > 0 && status === 'ready' && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {pages.map((page) => (
                <li
                  key={`${page.path}-${page.filename}`}
                  className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-300"
                >
                  {page.label || page.filename}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onRecapture}
            disabled={busyAction || capturing}
            className="btn-secondary mt-4"
          >
            {busyAction || capturing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
            {status === 'ready' ? 'Recapture shots' : 'Capture shots'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportReview({
  job,
  busyAction,
  onPublish,
  onDiscard,
  onRollback,
  onCaptureScreenshots,
  onStartOver,
}) {
  const report = job.report || {};
  const acquisition = report.acquisition || {};
  const scrub = report.scrub || {};
  const shots = report.screenshots || null;
  const active = ACTIVE_STATES.has(job.status);
  const warnings = report.asset_probe?.warnings || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <StatusBadge status={job.status} />
        <span className="truncate text-xs text-slate-500">{job.slug}</span>
      </div>
      <ProgressSteps status={job.status} />

      {active && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="flex items-start gap-3">
            <ArrowPathIcon className="mt-0.5 h-5 w-5 animate-spin text-blue-300" />
            <div>
              <h3 className="font-semibold text-white">Preparing your clean preview</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                The worker is downloading pages, removing seller branding, and checking every HTML file.
              </p>
            </div>
          </div>
        </div>
      )}

      {job.status === 'ready' && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Sandboxed staged preview
              </div>
              <span className="text-xs text-slate-600">Scripts isolated</span>
            </div>
            <iframe
              src={job.preview_url}
              title={`Staged preview of ${job.title}`}
              sandbox="allow-scripts allow-forms"
              className="h-[48vh] min-h-80 w-full bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ReviewMetric label="Pages" value={acquisition.html_count ?? '—'} />
            <ReviewMetric label="Files" value={acquisition.file_count ?? '—'} />
            <ReviewMetric label="Size" value={formatBytes(acquisition.bytes)} />
            <ReviewMetric label="CTAs fixed" value={scrub.cta_scripts_injected ?? '—'} />
          </div>
          {warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <p className="text-sm font-semibold text-amber-100">Asset warnings</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-200/70">
                    {warnings.slice(0, 4).map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {job.status === 'failed' && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-rose-300" />
            <div>
              <h3 className="font-semibold text-rose-100">Import stopped safely</h3>
              <p className="mt-1 text-sm leading-6 text-rose-200/70">
                {job.error_message || 'The source could not be imported.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {job.status === 'published' && (
        <>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-300" />
            <h3 className="mt-3 font-semibold text-white">Template is live</h3>
            <p className="mt-1 text-sm text-slate-400">
              It appears in the gallery. Main-page shots fill the card strip automatically.
            </p>
            <a href={`/portfolio/portfolio/${encodeURIComponent(job.slug)}/`} target="_blank" rel="noreferrer" className="btn-secondary mt-4">
              Open template <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>
          <ScreenshotStatus
            shots={shots}
            busyAction={busyAction}
            onRecapture={() => onCaptureScreenshots(job)}
          />
        </>
      )}

      <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-2 border-t border-slate-800 bg-[#0d0f13]/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:flex-row sm:px-7">
        {job.status === 'ready' && (
          <>
            <button type="button" onClick={() => onDiscard(job)} disabled={busyAction} className="btn-danger sm:w-auto">
              <TrashIcon className="h-4 w-4" /> Discard
            </button>
            <button type="button" onClick={() => onPublish(job, false)} disabled={busyAction} className="btn-primary sm:ml-auto">
              {busyAction ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <RocketLaunchIcon className="h-4 w-4" />}
              Publish template
            </button>
          </>
        )}
        {job.status === 'failed' && (
          <>
            <button type="button" onClick={() => onDiscard(job)} disabled={busyAction} className="btn-danger">
              Discard failed import
            </button>
            <button type="button" onClick={onStartOver} className="btn-secondary sm:ml-auto">Start again</button>
          </>
        )}
        {job.status === 'published' && (
          <>
            {job.report?.replaced_existing && (
              <button type="button" onClick={() => onRollback(job)} disabled={busyAction} className="btn-danger">
                Roll back replacement
              </button>
            )}
            <button type="button" onClick={onStartOver} className="btn-primary sm:ml-auto">Import another</button>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function EditTemplateForm({ template, saving, onSave }) {
  const [form, setForm] = useState({
    title: template.title,
    description: template.description,
    category: template.category,
    collection: template.collection || 'websites',
    aliases: (template.aliases || []).join(', '),
  });
  const change = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          title: form.title,
          description: form.description,
          category: form.category,
          collection: form.collection,
          aliases: form.aliases.split(',').map((value) => value.trim()).filter(Boolean),
        });
      }}
    >
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stable template ID</p>
        <p className="mt-1 break-all text-sm text-slate-200">{template.slug}</p>
      </div>
      <Field label="Display title">
        <input required maxLength={160} value={form.title} onChange={change('title')} className="form-input" />
      </Field>
      <Field label="Description">
        <textarea required rows={5} maxLength={5000} value={form.description} onChange={change('description')} className="form-input resize-none" />
      </Field>
      <Field label="Collection" hint="Product line on the marketing site.">
        <select required value={form.collection} onChange={change('collection')} className="form-input">
          {COLLECTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Category">
        <input required maxLength={100} list="template-categories" value={form.category} onChange={change('category')} className="form-input" />
      </Field>
      <Field label="Aliases" hint="Comma-separated names that can resolve to this template.">
        <input value={form.aliases} onChange={change('aliases')} placeholder="Restaurant, Café" className="form-input" />
      </Field>
      <div className="sticky bottom-0 -mx-5 border-t border-slate-800 bg-[#0d0f13]/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving metadata…' : 'Save catalog changes'}
        </button>
      </div>
    </form>
  );
}

function JobsPanel({ jobs, onSelect }) {
  if (jobs.length === 0) return null;
  return (
    <section className="rounded-2xl border border-slate-800 bg-[#101216]">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Recent imports</h2>
          <p className="mt-0.5 text-xs text-slate-500">Worker activity and publish history</p>
        </div>
        <ClockIcon className="h-5 w-5 text-slate-600" />
      </div>
      <div className="divide-y divide-slate-800">
        {jobs.slice(0, 5).map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelect(job)}
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-800/35"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-200">{job.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-600">{job.slug}</p>
            </div>
            <StatusBadge status={job.status} />
            <ChevronRightIcon className="h-4 w-4 text-slate-600" />
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [collection, setCollection] = useState('all');
  const [panel, setPanel] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [toast, setToast] = useState('');

  const loadAll = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const [templateResult, jobResult] = await Promise.all([
        TemplatesAPI.list(),
        TemplateImportsAPI.list({ limit: 30 }),
      ]);
      setTemplates(templateResult.items || []);
      setJobs(jobResult.items || []);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Unable to load templates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll(true);
  }, [loadAll]);

  const hasActiveJobs = jobs.some((job) => ACTIVE_STATES.has(job.status));
  const hasScreenshotJobs = jobs.some((job) => {
    const status = job?.report?.screenshots?.status;
    return status === 'queued' || status === 'running';
  });
  useEffect(() => {
    if (!hasActiveJobs && !hasScreenshotJobs) return undefined;
    const timer = window.setInterval(() => loadAll(true), 2000);
    return () => window.clearInterval(timer);
  }, [hasActiveJobs, hasScreenshotJobs, loadAll]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null;
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(templates.map((item) => item.category))).sort()],
    [templates],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = category === 'all' || template.category === category;
      const matchesCollection = collection === 'all' || template.collection === collection;
      const matchesSearch = !needle || [template.title, template.slug, template.description, template.collection]
        .some((value) => String(value || '').toLowerCase().includes(needle));
      return matchesCategory && matchesCollection && matchesSearch;
    });
  }, [templates, search, category, collection]);

  const openJob = (job) => {
    setError('');
    setSelectedJobId(job.id);
    setPanel('import');
  };

  const createImport = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      const job = await TemplateImportsAPI.create(form);
      setSelectedJobId(job.id);
      setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
      setToast('Secure import started.');
      await loadAll(true);
    } catch (createError) {
      setError(createError.message || 'Unable to start import.');
    } finally {
      setSubmitting(false);
    }
  };

  const publish = async (job, force) => {
    setBusyAction(true);
    try {
      await TemplateImportsAPI.publish(job.id, force);
      setToast(force ? 'Published — capturing gallery shots.' : 'Published — capturing gallery shots.');
      await loadAll(true);
    } catch (publishError) {
      if (publishError.status === 409 && !force) {
        const confirmed = window.confirm(
          `${job.slug} already exists. Replace it and keep one rollback revision?`,
        );
        if (confirmed) {
          setBusyAction(false);
          return publish(job, true);
        }
      } else {
        setError(publishError.message || 'Unable to publish template.');
      }
    } finally {
      setBusyAction(false);
    }
    return undefined;
  };

  const captureScreenshots = async (job) => {
    setBusyAction(true);
    try {
      await TemplateImportsAPI.captureScreenshots(job.id, true);
      setToast('Gallery screenshot capture started.');
      await loadAll(true);
    } catch (captureError) {
      setError(captureError.message || 'Unable to capture screenshots.');
    } finally {
      setBusyAction(false);
    }
  };

  const discard = async (job) => {
    if (!window.confirm(`Discard the staged import for ${job.title}?`)) return;
    setBusyAction(true);
    try {
      await TemplateImportsAPI.discard(job.id);
      setToast('Import discarded.');
      setPanel(null);
      setSelectedJobId(null);
      await loadAll(true);
    } catch (discardError) {
      setError(discardError.message || 'Unable to discard import.');
    } finally {
      setBusyAction(false);
    }
  };

  const rollback = async (job) => {
    if (!window.confirm('Restore the previous template version and catalog metadata?')) return;
    setBusyAction(true);
    try {
      await TemplateImportsAPI.rollback(job.id);
      setToast('Previous template version restored.');
      setPanel(null);
      setSelectedJobId(null);
      await loadAll(true);
    } catch (rollbackError) {
      setError(rollbackError.message || 'Unable to roll back template.');
    } finally {
      setBusyAction(false);
    }
  };

  const saveMetadata = async (payload) => {
    setBusyAction(true);
    try {
      await TemplatesAPI.update(panel.template.slug, payload);
      setToast('Catalog details updated.');
      setPanel(null);
      await loadAll(true);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update template.');
    } finally {
      setBusyAction(false);
    }
  };

  const activeCount = jobs.filter((job) => ACTIVE_STATES.has(job.status)).length;
  const readyCount = jobs.filter((job) => job.status === 'ready').length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Portfolio operations</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Template Library</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Acquire licensed Webflow previews, remove seller branding, review safely, and publish without SSH.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => loadAll()} disabled={refreshing} className="btn-secondary">
            <ArrowPathIcon className={cx('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setSelectedJobId(null);
              setPanel('import');
            }}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Import template
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Published" value={templates.length} detail="Live in the portfolio gallery" />
        <MetricCard label="Processing" value={activeCount} detail="Secure background imports" tone="cyan" />
        <MetricCard label="Ready to review" value={readyCount} detail="Awaiting publish or discard" tone="amber" />
      </div>

      <JobsPanel jobs={jobs} onSelect={openJob} />

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Published templates</h2>
            <p className="mt-1 text-xs text-slate-500">{filtered.length} shown</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search templates"
                className="form-input mt-0 py-2 pl-9 sm:w-60"
              />
            </label>
            <select value={collection} onChange={(event) => setCollection(event.target.value)} className="form-input mt-0 py-2 sm:w-44">
              <option value="all">All collections</option>
              {COLLECTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="form-input mt-0 py-2 sm:w-44">
              {categories.map((value) => (
                <option key={value} value={value}>{value === 'all' ? 'All categories' : value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
              ))
            : filtered.map((template) => (
                <TemplateCard
                  key={template.slug}
                  template={template}
                  onEditMetadata={(value) => {
                    setError('');
                    setPanel({ type: 'edit', template: value });
                  }}
                  onEditContent={(value) => {
                    setError('');
                    setPanel({ type: 'sections', template: value });
                  }}
                />
              ))}
          {!loading && filtered.length === 0 && !search && category === 'all' && collection === 'all' && (
            <EmptyState onImport={() => setPanel('import')} />
          )}
          {!loading && filtered.length === 0 && (search || category !== 'all' || collection !== 'all') && (
            <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
              No templates match these filters.
            </div>
          )}
        </div>
      </section>

      {panel === 'import' && (
        <Drawer
          title={selectedJob ? selectedJob.title : 'Import a Webflow template'}
          eyebrow={selectedJob ? 'Import workspace' : 'New acquisition'}
          onClose={() => setPanel(null)}
          wide={Boolean(selectedJob?.preview_url)}
          error={error}
          centered
        >
          {selectedJob ? (
            <ImportReview
              job={selectedJob}
              busyAction={busyAction}
              onPublish={publish}
              onDiscard={discard}
              onRollback={rollback}
              onCaptureScreenshots={captureScreenshots}
              onStartOver={() => {
                setError('');
                setSelectedJobId(null);
              }}
            />
          ) : (
            <ImportForm onSubmit={createImport} submitting={submitting} />
          )}
        </Drawer>
      )}

      {panel?.type === 'edit' && (
        <Drawer title={`Edit ${panel.template.title}`} eyebrow="Catalog metadata" onClose={() => setPanel(null)} error={error}>
          <EditTemplateForm template={panel.template} saving={busyAction} onSave={saveMetadata} />
        </Drawer>
      )}

      {panel?.type === 'sections' && (
        <TemplateSectionEditor
          template={panel.template}
          onClose={() => setPanel(null)}
          onApplied={() => loadAll(true)}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-100 shadow-2xl">
          <CheckCircleIcon className="h-5 w-5 text-emerald-300" />
          {toast}
        </div>
      )}
    </div>
  );
}
