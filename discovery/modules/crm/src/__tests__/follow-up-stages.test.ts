import { crmFollowUpsListQuerySchema, FOLLOW_UP_STAGES } from '@agency/validation';
import { isTerminalLeadStatus } from '../state-machine';

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

assert(FOLLOW_UP_STAGES.includes('CONTACTED'), 'contacted is a due stage');
assert(FOLLOW_UP_STAGES.includes('REPLIED'), 'replied is a due stage');
assert(
  FOLLOW_UP_STAGES.every((stage) => !isTerminalLeadStatus(stage)),
  'no terminal status is a due stage',
);
assert(!FOLLOW_UP_STAGES.includes('NEW' as never), 'uncontacted leads are not follow-ups');

const noStatus = crmFollowUpsListQuerySchema.safeParse({});
assert(noStatus.success, 'stage filter is optional');
assert(noStatus.success && noStatus.data.status === undefined, 'omitted stage means all due stages');
assert(
  noStatus.success && noStatus.data.sort === 'nextFollowUpAt' && noStatus.data.direction === 'asc',
  'defaults sort by soonest due date',
);

const validStage = crmFollowUpsListQuerySchema.safeParse({ status: 'PROPOSAL_SENT' });
assert(validStage.success, 'proposal_sent accepted as a due stage');

const closedStage = crmFollowUpsListQuerySchema.safeParse({ status: 'CLOSED_WON' });
assert(!closedStage.success, 'closed pursuits rejected by the follow-up contract');

const archivedStage = crmFollowUpsListQuerySchema.safeParse({ status: 'ARCHIVED' });
assert(!archivedStage.success, 'archived pursuits rejected by the follow-up contract');

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
