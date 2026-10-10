/**
 * Mirrors QualificationService.scoreBusiness corroboration path without DB:
 * readDiscoveryEvidence(metadata) → countCorroboratingSources → computeLeadScore.
 */
import assert from 'node:assert/strict';
import { computeLeadScore, countCorroboratingSources } from '@agency/scoring';
import { readDiscoveryEvidence } from '@agency/validation';

function scoreFromMetadata(input: {
  source: string;
  metadata: Record<string, unknown>;
  hasPhone: boolean;
  hasWebsite?: boolean;
}) {
  const evidence = readDiscoveryEvidence(input.metadata);
  const corroboratingSourceCount = countCorroboratingSources({
    primarySource: input.source,
    evidenceFields: evidence?.fields,
  });
  return computeLeadScore({
    hasWebsite: input.hasWebsite ?? false,
    httpsEnabled: null,
    mobileFriendly: null,
    hasEmail: false,
    hasPhone: input.hasPhone,
    industryMatch: true,
    corroboratingSourceCount,
  });
}

const bareOsmMeta = {
  websiteClass: 'none',
  discoveryEvidence: {
    fields: [
      {
        field: 'name',
        value: 'Bare Cafe',
        source: 'openstreetmap',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'medium',
      },
    ],
  },
};

const bare = scoreFromMetadata({
  source: 'openstreetmap',
  metadata: bareOsmMeta,
  hasPhone: false,
});
assert.equal(bare.score, 0, 'bare OSM name scores 0 (no contact path)');
assert.ok(!bare.factors.multiSourceCorroboration);

const multiMeta = {
  websiteClass: 'none',
  discoveryEvidence: {
    fields: [
      {
        field: 'phone',
        value: '+256700111222',
        source: 'openstreetmap',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'high',
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
        value: 'Multi Cafe',
        source: 'facebook',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'low',
      },
    ],
  },
};

const multi = scoreFromMetadata({
  source: 'openstreetmap',
  metadata: multiMeta,
  hasPhone: true,
});
assert.equal(multi.factors.multiSourceCorroboration, 3, 'two contact sources → +3');
assert.equal(multi.score, 48);
assert.ok(multi.score > bare.score, 'phone+no-site+multi-source ranks above bare OSM');

const tripleMeta = {
  websiteClass: 'none',
  discoveryEvidence: {
    fields: [
      {
        field: 'phone',
        value: '+256700111222',
        source: 'openstreetmap',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'high',
      },
      {
        field: 'sourceUrl',
        value: 'https://facebook.com/x',
        source: 'facebook',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'medium',
      },
      {
        field: 'youtubeUrl',
        value: 'https://youtube.com/@x',
        source: 'social_search',
        capturedAt: '2026-10-04T00:00:00.000Z',
        confidence: 'medium',
      },
    ],
  },
};

const triple = scoreFromMetadata({
  source: 'openstreetmap',
  metadata: tripleMeta,
  hasPhone: true,
});
assert.equal(triple.factors.multiSourceCorroboration, 5, 'three contact sources → +5 cap');
assert.equal(triple.score, 50);

console.log('corroboration-scoring tests passed');
