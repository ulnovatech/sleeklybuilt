import { assembleDraftExportCsv } from '../export-drafts-csv';
import { OUTREACH_DRAFT_CHANNELS } from '../draft-channel';
import { DEFAULT_OUTREACH_TEMPLATES } from '../default-templates';

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

const greenfieldTemplateBody = DEFAULT_OUTREACH_TEMPLATES.find((t) => t.opportunityType === 'greenfield')
  ?.body;
assert(Boolean(greenfieldTemplateBody), 'greenfield template fixture available');

const candidates = [
  {
    leadId: 'lead-with-draft',
    business: 'Cantine Divino',
    email: 'hello@cantine.test',
    phone: '+256700111222',
    mapsUrl: 'https://maps.example/cantine',
    reachability: 'high' as const,
    hasContact: true,
    suppressed: false,
  },
  {
    leadId: 'lead-no-draft',
    business: 'No Draft Co',
    email: 'a@b.test',
    phone: '',
    mapsUrl: '',
    reachability: 'medium' as const,
    hasContact: true,
    suppressed: false,
  },
  {
    leadId: 'lead-no-contact',
    business: 'Silent Co',
    email: '',
    phone: '',
    mapsUrl: '',
    reachability: 'high' as const,
    hasContact: false,
    suppressed: false,
  },
  {
    leadId: 'lead-suppressed',
    business: 'Suppressed Co',
    email: 'x@y.test',
    phone: '',
    mapsUrl: '',
    reachability: 'high' as const,
    hasContact: true,
    suppressed: true,
  },
];

const draftBody =
  'Cantine Divino still has no owned website — customers ask for the menu online. Open to a short call about a starter site?';

const draftsByLeadId = new Map([
  [
    'lead-with-draft',
    {
      leadId: 'lead-with-draft',
      channel: 'email',
      subject: 'Starter site for Cantine Divino',
      body: draftBody,
      updatedAt: new Date('2026-08-14T12:00:00.000Z'),
    },
  ],
]);

const result = assembleDraftExportCsv({
  channel: 'email',
  candidates,
  draftsByLeadId,
  minReachability: 'low',
});

assert(result.exportMode === 'draft', 'export mode is draft');
assert(result.channel === 'email', 'export channel email');
assert(result.count === 1, 'only rows with cached drafts exported');
assert(result.skippedNoDraft === 1, 'skips leads without drafts');
assert(result.skippedNoContact === 1, 'skips no-contact rows');
assert(result.skippedSuppressed === 1, 'skips suppressed rows');
assert(result.csv.includes('draft_channel'), 'includes draft_channel column');
assert(result.csv.includes('draft_generated_at'), 'includes draft_generated_at column');
assert(result.csv.includes(draftBody), 'CSV body is cached draft text');
assert(
  !result.csv.includes("doesn't have a website yet — many customers search online"),
  'CSV does not use greenfield template merge',
);
assert(result.csv.includes('Cantine Divino'), 'includes business name');
assert(!result.csv.includes('No Draft Co'), 'omits no-draft business from rows');

const phoneResult = assembleDraftExportCsv({
  channel: 'phone',
  candidates,
  draftsByLeadId,
});
assert(phoneResult.count === 0, 'wrong-channel drafts do not export');
assert(phoneResult.skippedNoDraft === 2, 'contactable rows without phone draft skipped');

assert(OUTREACH_DRAFT_CHANNELS.includes('phone'), 'phone channel in draft channels');
assert(OUTREACH_DRAFT_CHANNELS.includes('follow_up'), 'follow_up channel in draft channels');

const phoneOnlyNoDraft = assembleDraftExportCsv({
  channel: 'phone',
  candidates: [
    {
      leadId: 'pursuit-phone',
      business: 'Phone Pursuit',
      email: '',
      phone: '+256762387960',
      mapsUrl: '',
      // Contact-derived low — mirrors export after alreadyContacted poisoned lead-score none
      reachability: 'low' as const,
      hasContact: true,
      suppressed: false,
    },
  ],
  draftsByLeadId: new Map(),
  minReachability: 'low',
});
assert(phoneOnlyNoDraft.skippedReachability === 0, 'phone-only low meets minReachability low');
assert(phoneOnlyNoDraft.skippedNoDraft === 1, 'phone-only without draft requires confirm path');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
