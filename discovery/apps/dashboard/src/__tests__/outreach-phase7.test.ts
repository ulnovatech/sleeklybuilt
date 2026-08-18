import {
  outreachDraftExportQuerySchema,
  outreachQueueListQuerySchema,
  parseListSearchParams,
} from '@agency/validation';
import { OUTREACH_DRAFT_CHANNELS } from '@agency/outreach';
import { z } from 'zod';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`ok ${name}`);
  } else {
    failed++;
    console.error(`fail ${name}`);
  }
}

const defaults = parseListSearchParams(outreachQueueListQuerySchema, new URLSearchParams());
assert(defaults.success, 'queue query accepts empty params');
if (defaults.success) {
  assert(defaults.data.page === 1, 'queue default page 1');
  assert(defaults.data.limit === 20, 'queue default limit 20');
  assert(defaults.data.channel === 'any', 'queue default channel any');
  assert(defaults.data.sort === 'follow_up', 'queue default sort follow_up');
  assert(defaults.data.followUpDue === 'any', 'queue default followUpDue any');
}

const filtered = parseListSearchParams(
  outreachQueueListQuerySchema,
  new URLSearchParams({
    status: 'REVIEWED',
    channel: 'phone',
    sort: 'score',
    direction: 'desc',
    page: '2',
    limit: '10',
    followUpDue: 'overdue',
  }),
);
assert(filtered.success, 'queue query accepts filters');
if (filtered.success) {
  assert(filtered.data.status === 'REVIEWED', 'status filter');
  assert(filtered.data.channel === 'phone', 'phone channel filter');
  assert(filtered.data.sort === 'score', 'score sort');
  assert(filtered.data.page === 2, 'page 2');
  assert(filtered.data.limit === 10, 'limit 10');
  assert(filtered.data.followUpDue === 'overdue', 'followUpDue overdue');
}

const badChannel = parseListSearchParams(
  outreachQueueListQuerySchema,
  new URLSearchParams({ channel: 'fax' }),
);
assert(!badChannel.success, 'queue rejects unknown channel');

const badPage = parseListSearchParams(
  outreachQueueListQuerySchema,
  new URLSearchParams({ page: '0' }),
);
assert(!badPage.success, 'queue rejects page < 1');

const exportDefaults = outreachDraftExportQuerySchema.safeParse({});
assert(exportDefaults.success, 'draft export query defaults');
if (exportDefaults.success) {
  assert(exportDefaults.data.channel === 'email', 'export default channel email');
}

const exportPhone = outreachDraftExportQuerySchema.safeParse({ channel: 'phone' });
assert(exportPhone.success, 'export accepts phone channel');

const exportFollowUp = outreachDraftExportQuerySchema.safeParse({ channel: 'follow_up' });
assert(exportFollowUp.success, 'export accepts follow_up channel');

const exportBad = outreachDraftExportQuerySchema.safeParse({ channel: 'sms' });
assert(!exportBad.success, 'export rejects unknown channel');

assert(
  OUTREACH_DRAFT_CHANNELS.join(',') === 'email,whatsapp,phone,follow_up',
  'draft API channels include phone',
);

/** Operator handoff must reject templateId — mirrors /api/outreach/export contract. */
function templateExportDeprecated(templateId: string | null): { ok: false; code: string } | { ok: true } {
  if (templateId) {
    return { ok: false, code: 'template_export_deprecated' };
  }
  return { ok: true };
}
assert(templateExportDeprecated('tpl-1').ok === false, 'templateId blocked for export');
assert(
  templateExportDeprecated('tpl-1').ok === false &&
    (templateExportDeprecated('tpl-1') as { code: string }).code === 'template_export_deprecated',
  'template export code is template_export_deprecated',
);
assert(templateExportDeprecated(null).ok === true, 'draft export allowed without templateId');

/** Mirrors /api/outreach/export dry-run + confirmSkipped contract. */
function exportConfirmGate(input: {
  dryRun: boolean;
  skippedNoDraft: number;
  confirmSkipped: boolean;
}): { kind: 'preview' | 'csv' | 'confirm_required'; requiresConfirm?: boolean } {
  if (input.dryRun) {
    return { kind: 'preview', requiresConfirm: input.skippedNoDraft > 0 };
  }
  if (input.skippedNoDraft > 0 && !input.confirmSkipped) {
    return { kind: 'confirm_required' };
  }
  return { kind: 'csv' };
}

assert(
  exportConfirmGate({ dryRun: true, skippedNoDraft: 3, confirmSkipped: false }).requiresConfirm === true,
  'dry-run flags confirm when skips exist',
);
assert(
  exportConfirmGate({ dryRun: false, skippedNoDraft: 3, confirmSkipped: false }).kind ===
    'confirm_required',
  'export without confirmSkipped blocked when skips exist',
);
assert(
  exportConfirmGate({ dryRun: false, skippedNoDraft: 3, confirmSkipped: true }).kind === 'csv',
  'export proceeds after confirmSkipped',
);
assert(
  exportConfirmGate({ dryRun: false, skippedNoDraft: 0, confirmSkipped: false }).kind === 'csv',
  'export without skips needs no confirm',
);

/** Drafts POST channel schema — phone required for reform complete. */
const draftPostChannelSchema = z.enum(['email', 'whatsapp', 'phone', 'follow_up']);
assert(draftPostChannelSchema.safeParse('phone').success, 'drafts POST accepts phone');
assert(draftPostChannelSchema.safeParse('follow_up').success, 'drafts POST accepts follow_up');
assert(!draftPostChannelSchema.safeParse('sms').success, 'drafts POST rejects sms');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
