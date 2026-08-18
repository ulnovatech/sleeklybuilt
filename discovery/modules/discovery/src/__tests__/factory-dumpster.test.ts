import {
  dumpsterReasonLabel,
  isBenchEligible,
  suggestedDumpsterOps,
} from '../factory/dumpster';

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

assert(dumpsterReasonLabel('over_cut') === 'Over the 100', 'over_cut label is operator language');
assert(isBenchEligible('over_cut'), 'over_cut returns to the next-night bench');
assert(isBenchEligible('no_phone'), 'no_phone can compete again if a number appears');
assert(!isBenchEligible('has_website'), 'owned websites stay off the bench');
assert(!isBenchEligible('already_pursued'), 'active pursuits stay off the bench');
assert(suggestedDumpsterOps('over_cut')[0] === 'restore', 'over the 100 primary op is restore');
assert(suggestedDumpsterOps('already_pursued').length === 0, 'already pursued has no dumpster op');
assert(suggestedDumpsterOps('has_website').includes('suppress'), 'real website can suppress');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
