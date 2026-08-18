import assert from 'node:assert/strict';
import { buildBusinessIntelligenceProfile } from '../bi/build-profile';
import { writeBoiToProfile } from '../boi/boi-repository';
import { synthesizeOpportunityIntelligence } from '../boi/synthesize-opportunity-intelligence';
import { buildCaseFile } from '../case-file';
import { buildPitchPack } from '../pitch-pack';

function greenfieldProfile() {
  const base = buildBusinessIntelligenceProfile({
    account: {
      id: 'acc-case',
      canonicalName: 'Cantine Divino',
      phone: '+256 700 111222',
      city: 'Kampala',
      country: 'UG',
      crawlStatus: 'no_website',
    },
    business: {
      id: 'biz-case',
      name: 'Cantine Divino',
      source: 'google_maps',
      city: 'Kampala',
      country: 'UG',
      industry: 'Restaurant',
      phone: '+256 700 111222',
      reviewCount: 8,
      metadata: {
        reviews: [{ text: 'Great food but no website to check the menu.', rating: 4 }],
      },
    },
    analysis: { hasWebsite: false },
  });
  const boi = synthesizeOpportunityIntelligence({ profile: base });
  return writeBoiToProfile(base, boi);
}

assert.equal(buildCaseFile({ profile: null, websiteBrief: null }), null, 'null profile → null');

const profile = greenfieldProfile();
const websiteBrief = {
  pitchAngle: 'First professional website for local discovery',
  websiteGaps: [{ key: 'no_site', label: 'No owned website', severity: 'high' as const }],
  score: 78,
  reachability: 'high',
};

const caseFile = buildCaseFile({
  profile,
  websiteBrief,
  pursuitContext: {
    leadId: 'lead-1',
    status: 'REVIEWED',
    lastOutreach: null,
    nextFollowUpAt: null,
  },
});

assert.ok(caseFile);
assert.equal(caseFile!.version, 2);
assert.equal(caseFile!.identity.name, 'Cantine Divino');
assert.equal(caseFile!.identity.businessId, 'biz-case');
assert.equal(caseFile!.identity.city, 'Kampala');
assert.equal(caseFile!.presence.class, 'greenfield');
assert.equal(caseFile!.presence.website, null);
assert.equal(caseFile!.score, 78);
assert.equal(caseFile!.reachability, 'low', 'phone-only contact reachability (not brief alreadyContacted-poisoned none/high)');
assert.ok(caseFile!.weaknesses.length > 0, 'includes weaknesses');
assert.ok(caseFile!.weaknesses.length <= 8, 'weakness cap is 8');
assert.ok(caseFile!.pains.length > 0, 'includes pains from BOI');
assert.ok(caseFile!.pitchAngle, 'includes pitch angle');
assert.ok(caseFile!.executiveSummary || caseFile!.pitchAngle, 'has sales brief signal');
assert.ok(caseFile!.evidence.length > 0, 'includes evidence');
assert.ok(caseFile!.purchaseReadiness, 'maps purchase readiness');
assert.ok(Array.isArray(caseFile!.solutions), 'maps solutions array');
assert.equal(caseFile!.pursuitContext?.status, 'REVIEWED');
assert.equal(caseFile!.pursuitContext?.leadId, 'lead-1');
assert.ok(caseFile!.contact.phone?.includes('700'), 'maps phone contact');
assert.ok(caseFile!.contact.whatsapp.status, 'screens WhatsApp status');
assert.ok(
  ['ready', 'partial', 'processing'].includes(caseFile!.status),
  'status is a Case File status',
);

const blocked = buildCaseFile({
  profile,
  websiteBrief,
  suppressed: true,
});
assert.equal(blocked?.status, 'blocked', 'suppressed account yields blocked Case File');


const severities = caseFile!.weaknesses.map((w) => w.severity);
const rank = { high: 0, medium: 1, info: 2 } as const;
for (let i = 1; i < severities.length; i++) {
  assert.ok(rank[severities[i]] >= rank[severities[i - 1]], 'weaknesses severity-sorted');
}

const pitchPack = buildPitchPack({ profile, websiteBrief });
assert.ok(pitchPack);
assert.equal(pitchPack!.version, 1);
assert.ok(pitchPack!.weaknesses.length <= 3, 'pitch pack v1 keeps top 3 weaknesses');
assert.ok(
  pitchPack!.weaknesses.length <= caseFile!.weaknesses.length,
  'case file can carry fuller weakness set than pitch pack',
);

console.log('case-file tests passed');
