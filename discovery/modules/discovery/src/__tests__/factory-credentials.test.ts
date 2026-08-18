import { classifyCseCredential } from '../plans/factory-credentials';

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

const both = classifyCseCredential('key', 'cx-engine');
assert(both.configured && both.ready, 'CSE ready when key and CX are set');
assert(both.reason === undefined, 'CSE ready has no reason');

const cxOnly = classifyCseCredential(undefined, '7215411f0fcaf4220');
assert(!cxOnly.configured && !cxOnly.ready, 'CX without key is not configured');
assert(
  Boolean(cxOnly.reason?.includes('CSE API key')),
  'CX without key asks for API key',
);

const keyOnly = classifyCseCredential('key', '  ');
assert(!keyOnly.configured && !keyOnly.ready, 'key without CX is not configured');
assert(Boolean(keyOnly.reason?.includes('CX')), 'key without CX asks for engine ID');

const empty = classifyCseCredential(undefined, undefined);
assert(!empty.configured && !empty.ready, 'missing CSE is optional-off');
assert(Boolean(empty.reason?.includes('Optional overlay')), 'missing CSE is optional overlay');

const widgetCx = classifyCseCredential('', '7215411f0fcaf4220');
assert(!widgetCx.ready, 'empty key string with CX is not ready');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
