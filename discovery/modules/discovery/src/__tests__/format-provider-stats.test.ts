import assert from 'node:assert/strict';
import {
  formatProviderStatLogLine,
  formatProviderStatsSummary,
} from '../lib/format-provider-stats';

assert.equal(
  formatProviderStatsSummary([]),
  'no provider stats',
);

assert.equal(
  formatProviderStatsSummary([
    { provider: 'openstreetmap', count: 42 },
    { provider: 'public_search', count: 8 },
    { provider: 'facebook', count: 0, error: 'Pages Search not ready' },
  ]),
  'openstreetmap: 42, public_search: 8, facebook: failed (Pages Search not ready)',
);

assert.equal(
  formatProviderStatLogLine({ provider: 'social_search', count: 3 }),
  'social_search: 3 candidates',
);
assert.equal(
  formatProviderStatLogLine({ provider: 'facebook', count: 0, error: 'token missing' }),
  'facebook: failed — token missing',
);

console.log('format-provider-stats tests passed');
