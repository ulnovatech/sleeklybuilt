import assert from 'node:assert/strict';
import { computeEmptyRunStreak } from '../outcome-learning';

assert.equal(
  computeEmptyRunStreak(0, { qualified: 0, highOpportunity: 0, newAccounts: 0 }),
  1,
);
assert.equal(
  computeEmptyRunStreak(2, { qualified: 0, highOpportunity: 0, newAccounts: 0 }),
  3,
);
assert.equal(
  computeEmptyRunStreak(2, { qualified: 1, highOpportunity: 0, newAccounts: 0 }),
  0,
  'productive run resets streak',
);

console.log('outcome-learning tests passed');
