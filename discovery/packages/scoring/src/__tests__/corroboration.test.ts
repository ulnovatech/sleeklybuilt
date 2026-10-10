import assert from 'node:assert/strict';
import {
  computeLeadScore,
  corroborationBonus,
  countCorroboratingSources,
  CORROBORATION_BONUS_CAP,
} from '../index';

assert.equal(corroborationBonus(0), 0);
assert.equal(corroborationBonus(1), 0);
assert.equal(corroborationBonus(2), 3);
assert.equal(corroborationBonus(3), 5);
assert.equal(corroborationBonus(10), CORROBORATION_BONUS_CAP);

assert.equal(
  countCorroboratingSources({
    primarySource: 'openstreetmap',
    evidenceFields: [{ field: 'phone', source: 'openstreetmap' }],
  }),
  1,
);

assert.equal(
  countCorroboratingSources({
    primarySource: 'openstreetmap',
    evidenceFields: [
      { field: 'phone', source: 'openstreetmap' },
      { field: 'website', source: 'public_search' },
    ],
  }),
  2,
);

assert.equal(
  countCorroboratingSources({
    primarySource: 'openstreetmap',
    evidenceFields: [
      { field: 'phone', source: 'openstreetmap' },
      { field: 'name', source: 'facebook' },
      { field: 'sourceUrl', source: 'social_search' },
    ],
  }),
  2,
  'name field excluded from corroboration count',
);

assert.equal(
  countCorroboratingSources({
    primarySource: 'openstreetmap',
    evidenceFields: [
      { field: 'name', source: 'openstreetmap' },
      { field: 'phone', source: 'public_search' },
    ],
  }),
  1,
  'primarySource with only name evidence does not inflate count',
);

assert.equal(
  countCorroboratingSources({
    primarySource: 'openstreetmap',
    evidenceFields: [{ field: 'name', source: 'openstreetmap' }],
  }),
  0,
  'name-only primary does not corroborate',
);

assert.equal(
  countCorroboratingSources({
    primarySource: 'facebook',
    evidenceFields: [{ source: 'facebook' }],
  }),
  0,
  'fieldless evidence entries do not count',
);

const bareOsm = computeLeadScore({
  hasWebsite: false,
  httpsEnabled: null,
  mobileFriendly: null,
  hasEmail: false,
  hasPhone: false,
  industryMatch: true,
  corroboratingSourceCount: 0,
});
assert.equal(bareOsm.score, 0, 'bare OSM name has no contact path');
assert.ok(!bareOsm.factors.multiSourceCorroboration);

const phoneSingle = computeLeadScore({
  hasWebsite: false,
  httpsEnabled: null,
  mobileFriendly: null,
  hasEmail: false,
  hasPhone: true,
  industryMatch: true,
  corroboratingSourceCount: 1,
});
assert.equal(phoneSingle.score, 45, 'phone + no-site + industry = 45');
assert.ok(!phoneSingle.factors.multiSourceCorroboration);

const phoneMulti = computeLeadScore({
  hasWebsite: false,
  httpsEnabled: null,
  mobileFriendly: null,
  hasEmail: false,
  hasPhone: true,
  industryMatch: true,
  corroboratingSourceCount: 2,
});
assert.equal(phoneMulti.score, 48, 'multi-source adds +3');
assert.equal(phoneMulti.factors.multiSourceCorroboration, 3);
assert.ok(phoneMulti.score > bareOsm.score, 'multi-source ranks above bare OSM');
assert.ok(phoneMulti.score > phoneSingle.score, 'multi-source ranks above single-source phone');

const phoneTriple = computeLeadScore({
  hasWebsite: false,
  httpsEnabled: null,
  mobileFriendly: null,
  hasEmail: false,
  hasPhone: true,
  industryMatch: true,
  corroboratingSourceCount: 3,
});
assert.equal(phoneTriple.score, 50);
assert.equal(phoneTriple.factors.multiSourceCorroboration, 5);

console.log('corroboration tests passed');
