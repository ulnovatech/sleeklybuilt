import assert from 'node:assert/strict';
import { computeLeadScore } from '../index';
import {
  computeSegmentAdjustment,
  formatSegmentRecordLabel,
  segmentKeyFor,
  SEGMENT_MIN_SAMPLE,
} from '../segment-outcomes';

assert.equal(
  segmentKeyFor({
    industry: 'Restaurant',
    city: 'Kampala',
    presenceClass: 'social_only',
    primaryGap: 'no_website',
  }),
  'restaurant|kampala|social_only|no_website',
);

assert.equal(
  computeSegmentAdjustment(0.75, 0.5),
  5,
  'winRate 0.75 vs 0.5 → +5',
);
assert.equal(computeSegmentAdjustment(0.25, 0.5), -5);
assert.equal(computeSegmentAdjustment(1, 0.5), 8, 'clamped to +8');
assert.equal(computeSegmentAdjustment(0, 0.5), -8, 'clamped to -8');

const label = formatSegmentRecordLabel({
  won: 3,
  lost: 1,
  industry: 'restaurant',
  city: 'kampala',
  presenceClass: 'social_only',
});
assert.match(label, /Segment record: 3 won \/ 1 lost/);
assert.match(label, /Restaurant/);
assert.match(label, /Kampala/);
assert.match(label, /Social Only/);

assert.equal(SEGMENT_MIN_SAMPLE, 5);

const scored = computeLeadScore({
  hasWebsite: false,
  httpsEnabled: null,
  mobileFriendly: null,
  hasEmail: true,
  hasPhone: false,
  industryMatch: true,
  segmentOutcomes: 5,
});
assert.equal(scored.factors.segmentOutcomes, 5);
assert.ok(scored.score >= 5);

console.log('segment-outcomes tests passed');
