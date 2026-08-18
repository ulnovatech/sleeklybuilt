import assert from 'node:assert/strict';
import { platformSettings } from '@agency/settings';
import {
  buildDraftFactPack,
  buildDraftPrompt,
  DraftGenerationError,
  generateOutreachDraft,
  hashFactPack,
  parseDraftResponse,
} from '../controlled-drafts';
import type { CaseFile } from '../case-file';

const caseFile: CaseFile = {
  version: 2,
  status: 'ready',
  identity: {
    businessId: '00000000-0000-0000-0000-000000000001',
    name: 'Greenfield Cafe',
    industry: 'Cafe',
    city: 'Austin',
    country: 'United States',
  },
  presence: { class: 'greenfield', website: null },
  score: 72,
  reachability: 'medium',
  weaknesses: [
    {
      id: 'gap_no_website',
      label: 'No professional website',
      severity: 'high',
      evidenceIds: ['ev1'],
    },
    {
      id: 'gap_no_menu',
      label: 'No online menu',
      severity: 'medium',
      evidenceIds: ['ev1'],
    },
  ],
  pains: [
    {
      id: 'pain_discovery',
      label: 'Customers cannot find menu online',
      confidence: 0.9,
      evidenceIds: ['ev1'],
    },
  ],
  pitchAngle: 'Launch a first professional site for local discovery',
  executiveSummary: 'Greenfield cafe lacks owned web presence.',
  recommendedServices: ['Website build'],
  purchaseReadiness: {
    score: 65,
    band: 'medium',
    factors: [{ key: 'no_site', label: 'No website', weight: 20 }],
    computedAt: new Date().toISOString(),
  },
  solutions: [
    {
      id: 'sol_web',
      service: 'Website build',
      painIds: ['pain_discovery'],
      benefits: [{ label: 'Local discovery' }],
    },
  ],
  sentiment: {
    overallRating: 4.2,
    reviewCount: 10,
    complaintThemes: [{ id: 'c1', label: 'Hard to book', mentionCount: 2, sampleExcerpt: null }],
    praiseThemes: [],
  },
  websiteGaps: [{ key: 'no_site', label: 'No owned website', severity: 'high' }],
  techStack: null,
  projectValue: null,
  evidence: [{ id: 'ev1', label: 'No owned website', excerpt: null, url: null }],
  pursuitContext: {
    leadId: 'lead-1',
    status: 'REVIEWED',
    lastOutreach: {
      channel: 'email',
      subject: 'Intro',
      body: 'Earlier note',
      sentAt: '2026-08-01T12:00:00.000Z',
    },
    nextFollowUpAt: '2026-08-10T12:00:00.000Z',
  },
  contact: {
    email: 'hello@example.com',
    phone: '+15551234567',
    whatsappUrl: null,
    whatsapp: {
      status: 'wa_ready',
      normalizedPhone: '+15551234567',
      reason: 'Valid mobile number',
      waMeUrl: 'https://wa.me/15551234567',
    },
  },
};

const emailFactPack = buildDraftFactPack(caseFile, 'email');
assert.equal(emailFactPack.channel, 'email');
assert.equal(emailFactPack.weaknesses.length, 2, 'full Case File weaknesses, not top-3 slim');
assert.equal(emailFactPack.pains.length, 1);
assert.ok(emailFactPack.executiveSummary);
assert.ok(emailFactPack.purchaseReadiness);
assert.equal(emailFactPack.solutions.length, 1);
assert.ok(emailFactPack.sentiment?.complaintThemes.length);
assert.equal(emailFactPack.pursuitContext?.status, 'REVIEWED');
assert.ok(buildDraftPrompt(emailFactPack).includes('Greenfield Cafe'));
assert.ok(buildDraftPrompt(emailFactPack).includes('pain_discovery'));
assert.ok(buildDraftPrompt(emailFactPack).includes('Platform: email'));
assert.equal(hashFactPack(emailFactPack).length, 64);

const phoneFactPack = buildDraftFactPack(caseFile, 'phone');
const phonePrompt = buildDraftPrompt(phoneFactPack);
assert.ok(phonePrompt.includes('Platform: phone'));
assert.ok(phonePrompt.includes('sections.opening15s'));
assert.ok(phonePrompt.includes('spoken cadence'));
assert.ok(phonePrompt.includes('objectionHandlers'));

const waFactPack = buildDraftFactPack(caseFile, 'whatsapp');
assert.ok(buildDraftPrompt(waFactPack).includes('Platform: WhatsApp'));
assert.ok(buildDraftPrompt(waFactPack).includes('max 420'));

const followUpFactPack = buildDraftFactPack(caseFile, 'follow_up');
assert.ok(buildDraftPrompt(followUpFactPack).includes('Platform: follow-up'));
assert.ok(buildDraftPrompt(followUpFactPack).includes('pursuitContext'));

const emailParsed = parseDraftResponse(
  JSON.stringify({
    subject: 'Quick idea for Greenfield Cafe',
    body: 'Saw you are still without a professional website — happy to share a simple first-site plan.',
  }),
  'email',
);
assert.equal(emailParsed.subject?.startsWith('Quick idea'), true);
assert.ok(emailParsed.body.includes('website'));
assert.ok(
  !emailParsed.body.includes("doesn't have a website yet — many customers search online"),
  'parsed draft is not the greenfield default template',
);

const phoneParsed = parseDraftResponse(
  JSON.stringify({
    subject: null,
    body: 'Hi, this is Alex from Example Agency calling about Greenfield Cafe in Austin...',
    sections: {
      opening15s: 'Hi, is this Greenfield Cafe?',
      valueHook: 'Many cafes lose walk-ins without a menu online.',
      evidenceMention: 'No professional website on record.',
      ask: 'Would a 10-minute call about a starter site work this week?',
      objectionHandlers: [
        'We are too busy — totally fair, I can email a one-pager.',
        'Already have a friend who builds sites — great, I can still share a checklist.',
        'Ignored third handler',
      ],
      close: 'Thanks for your time.',
    },
  }),
  'phone',
);
assert.ok(phoneParsed.body.includes('Greenfield Cafe'));
assert.equal(phoneParsed.subject, null);
assert.ok(phoneParsed.phoneSections?.opening15s.includes('Greenfield'));
assert.equal(phoneParsed.phoneSections?.objectionHandlers.length, 2, 'caps objections at 2');

const phoneNoSections = parseDraftResponse(
  JSON.stringify({
    subject: null,
    body: 'Full spoken script for the operator about Greenfield Cafe.',
  }),
  'phone',
);
assert.equal(phoneNoSections.phoneSections, null);

const waParsed = parseDraftResponse(
  JSON.stringify({
    subject: 'ignored',
    body: 'Hi — noticed Greenfield Cafe still has no site. Open to a quick chat?',
  }),
  'whatsapp',
);
assert.equal(waParsed.subject, null);

let failed = false;
try {
  parseDraftResponse(JSON.stringify({ subject: 'x', body: '' }), 'email');
} catch (error) {
  failed = true;
  assert.ok(error instanceof DraftGenerationError);
  assert.equal(error.code, 'provider_failed');
}
assert.equal(failed, true, 'empty body rejected');

failed = false;
try {
  parseDraftResponse(JSON.stringify({ body: 'Missing subject for email' }), 'email');
} catch (error) {
  failed = true;
  assert.ok(error instanceof DraftGenerationError);
}
assert.equal(failed, true, 'email requires subject');

failed = false;
try {
  parseDraftResponse('not-json', 'phone');
} catch (error) {
  failed = true;
  assert.ok(error instanceof DraftGenerationError);
  assert.equal((error as DraftGenerationError).code, 'provider_failed');
}
assert.equal(failed, true, 'non-JSON rejected');

const fenced = parseDraftResponse(
  '```json\n{"subject":"Menu online for Macos Grills","body":"Hi — Macos Grills still has no owned site for the menu. Open to a short call?"}\n```',
  'email',
);
assert.equal(fenced.subject, 'Menu online for Macos Grills');
assert.ok(fenced.body.includes('Macos Grills'), 'fenced JSON body parsed');

const proseWrapped = parseDraftResponse(
  'Here is the draft:\n{"subject":"Quick idea","body":"Short evidence-bound note about no website."}\nThanks',
  'email',
);
assert.equal(proseWrapped.subject, 'Quick idea');

async function runGateTests() {
  const originalEnsure = platformSettings.ensureLoaded.bind(platformSettings);
  const originalGetSync = platformSettings.getSync.bind(platformSettings);

  platformSettings.ensureLoaded = (async () => platformSettings.getSync()) as typeof platformSettings.ensureLoaded;

  platformSettings.getSync = (() => {
    const snap = originalGetSync();
    return {
      ...snap,
      drafts: {
        ...snap.drafts,
        enabled: false,
        provider: 'openrouter',
        model: 'google/gemini-2.5-pro',
        maxOutputTokens: 900,
      },
    };
  }) as typeof platformSettings.getSync;

  let code: string | null = null;
  try {
    await generateOutreachDraft({
      leadId: '00000000-0000-0000-0000-000000000099',
      channel: 'email',
      caseFile,
    });
  } catch (error) {
    code = error instanceof DraftGenerationError ? error.code : 'other';
  }
  assert.equal(code, 'disabled', 'disabled drafts fail clearly');

  platformSettings.getSync = (() => {
    const snap = originalGetSync();
    return {
      ...snap,
      drafts: {
        ...snap.drafts,
        enabled: true,
        provider: 'openrouter',
        model: 'google/gemini-2.5-pro',
        maxOutputTokens: 900,
      },
    };
  }) as typeof platformSettings.getSync;

  code = null;
  try {
    await generateOutreachDraft({
      leadId: '00000000-0000-0000-0000-000000000099',
      channel: 'email',
      caseFile: {
        ...caseFile,
        status: 'blocked',
      },
    });
  } catch (error) {
    code = error instanceof DraftGenerationError ? error.code : 'other';
  }
  assert.equal(code, 'account_suppressed', 'blocked Case File fails clearly');

  code = null;
  try {
    await generateOutreachDraft({
      leadId: '00000000-0000-0000-0000-000000000099',
      channel: 'phone',
      caseFile: {
        ...caseFile,
        contact: {
          ...caseFile.contact,
          phone: null,
        },
      },
    });
  } catch (error) {
    code = error instanceof DraftGenerationError ? error.code : 'other';
  }
  assert.equal(code, 'phone_ineligible', 'phone channel requires phone');

  code = null;
  try {
    await generateOutreachDraft({
      leadId: '00000000-0000-0000-0000-000000000099',
      channel: 'whatsapp',
      caseFile: {
        ...caseFile,
        contact: {
          ...caseFile.contact,
          whatsapp: {
            ...caseFile.contact.whatsapp,
            status: 'wa_blocked',
          },
        },
      },
    });
  } catch (error) {
    code = error instanceof DraftGenerationError ? error.code : 'other';
  }
  assert.equal(code, 'whatsapp_ineligible', 'blocked WhatsApp fails clearly');

  code = null;
  try {
    await generateOutreachDraft({
      leadId: '00000000-0000-0000-0000-000000000099',
      channel: 'email',
      caseFile: {
        ...caseFile,
        weaknesses: [],
        pains: [],
        pitchAngle: null,
      },
    });
  } catch (error) {
    code = error instanceof DraftGenerationError ? error.code : 'other';
  }
  assert.equal(code, 'invalid_fact_pack', 'empty Case File intelligence rejected');

  code = null;
  try {
    await generateOutreachDraft({
      leadId: '00000000-0000-0000-0000-000000000099',
      channel: 'email',
    });
  } catch (error) {
    code = error instanceof DraftGenerationError ? error.code : 'other';
  }
  assert.equal(code, 'invalid_fact_pack', 'missing Case File rejected');

  platformSettings.ensureLoaded = originalEnsure;
  platformSettings.getSync = originalGetSync;
}

runGateTests()
  .then(() => {
    console.log('controlled-drafts tests passed');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
