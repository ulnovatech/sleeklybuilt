import {
  canExportProspect,
  canPromoteFromReview,
  isProspectVerified,
} from '../review-verification';

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

assert(
  isProspectVerified({ businessEmail: '  hello@example.com ' }),
  'business email counts as verified',
);
assert(
  isProspectVerified({ accountPhone: '+1 555-0100' }),
  'account phone counts as verified',
);
assert(
  !isProspectVerified({ accountMetadata: { placesVerified: true } }),
  'placesVerified alone is NOT verified',
);
assert(
  !isProspectVerified({ accountMetadata: { placesId: 'ChIJabc123' } }),
  'placesId alone is NOT verified',
);
assert(!isProspectVerified({}), 'empty contact is not verified');

const blocked = canPromoteFromReview({
  verified: false,
  reachability: 'none',
  hasEmail: false,
  hasPhone: false,
});
assert(!blocked.allowed, 'blocks promote when no contact');
assert(!!blocked.reason, 'blocked promote includes reason');

const placesOnly = canPromoteFromReview({
  verified: true,
  reachability: 'none',
  hasEmail: false,
  hasPhone: false,
});
assert(!placesOnly.allowed, 'places-only verified flag cannot promote without phone/email');

const allowed = canPromoteFromReview({
  verified: true,
  reachability: 'none',
  hasEmail: false,
  hasPhone: true,
});
assert(allowed.allowed, 'allows promote when phone present');

assert(
  !canExportProspect({ hasEmail: false, hasPhone: false }).allowed,
  'export blocked without contact',
);
assert(
  canExportProspect({ hasEmail: true, hasPhone: false }).allowed,
  'export allowed with email',
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
