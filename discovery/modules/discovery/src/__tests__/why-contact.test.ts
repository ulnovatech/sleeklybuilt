import assert from 'node:assert/strict';
import {
  buildWhyContactScan,
  contactabilityOf,
  deriveWhyContactLine,
  topEvidenceFacts,
  websiteClassTone,
} from '../lib/why-contact';
import { readDiscoveryEvidence } from '@agency/validation';

assert.equal(contactabilityOf({ phone: '+2567', email: null }), 'phone');
assert.equal(contactabilityOf({ phone: null, email: 'a@b.com' }), 'email');
assert.equal(contactabilityOf({ phone: '+2567', email: 'a@b.com' }), 'both');
assert.equal(contactabilityOf({}), 'none');

assert.equal(websiteClassTone('none'), 'success');
assert.equal(websiteClassTone('broken'), 'warning');
assert.equal(websiteClassTone('real'), 'neutral');

const meta = {
  websiteClass: 'none',
  discoveryEvidence: {
    fields: [
      {
        field: 'phone',
        value: '+256700111222',
        source: 'openstreetmap',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'high',
        backend: 'geofabrik_pbf',
      },
      {
        field: 'website',
        value: 'https://dead.example',
        source: 'public_search',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'medium',
      },
      {
        field: 'name',
        value: 'Cafe',
        source: 'facebook',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'low',
      },
    ],
    phone: {
      field: 'phone',
      value: '+256700111222',
      source: 'openstreetmap',
      capturedAt: '2026-10-04T00:00:00.000Z',
      confidence: 'high',
      backend: 'geofabrik_pbf',
    },
  },
};

const evidence = readDiscoveryEvidence(meta);
const facts = topEvidenceFacts(evidence, 2);
assert.equal(facts.length, 2);
assert.equal(facts[0]?.field, 'phone');
assert.equal(facts[1]?.field, 'website');
assert.match(facts[0]!.attribution, /OpenStreetMap/);

const scan = buildWhyContactScan({
  website: null,
  phone: '+256700111222',
  email: null,
  metadata: meta,
});
assert.equal(scan.websiteClass, 'none');
assert.equal(scan.contactability, 'phone');
assert.equal(scan.evidenceFacts.length, 2);
assert.match(scan.whyContact, /Uncertain|incomplete|No website|greenfield|phone/i);
assert.equal(scan.greenfieldStatus, 'uncertain');
assert.equal(scan.thinEvidence, false);

const thin = buildWhyContactScan({
  website: null,
  phone: null,
  email: null,
  metadata: { websiteClass: 'none' },
});
assert.equal(thin.contactability, 'none');
assert.match(thin.whyContact, /verify|phone or email/i);
assert.equal(thin.thinEvidence, true);

const withFactors = deriveWhyContactLine({
  websiteClass: 'none',
  contactability: 'phone',
  scoreFactors: { noWebsite: 20, hasPhone: 15, industryMatch: 10 },
  hasWebsite: false,
});
assert.match(withFactors, /phone|greenfield|call/i);

const owned = buildWhyContactScan({
  website: 'https://real.example',
  phone: '+2567',
  metadata: {
    websiteClass: 'real',
    greenfieldStatus: 'existing_website',
    prospectProof: {
      version: 1,
      greenfieldStatus: 'existing_website',
      websiteSearchCoverage: 1,
      searchCompletion: 'complete',
      websiteSearchAt: new Date().toISOString(),
      classificationReason: 'owned',
      queries: [],
      websiteHits: [],
      contacts: [],
      ownedWebsiteUrl: 'https://real.example',
    },
  },
});
assert.equal(owned.websiteClass, 'real');
assert.match(owned.whyContact, /Existing website|owned|exclude/i);

console.log('why-contact tests passed');
