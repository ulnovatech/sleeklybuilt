import { deriveAcquisitionLane } from '../acquisition-lane';

let failed = 0;
function assert(condition: boolean, name: string) {
  if (condition) console.log(`ok ${name}`);
  else {
    failed++;
    console.error(`fail ${name}`);
  }
}

assert(
  deriveAcquisitionLane({ hasRealWebsite: false, opportunityType: 'greenfield' }) === 'greenfield',
  'no real website enters the primary greenfield lane',
);
assert(
  deriveAcquisitionLane({ hasRealWebsite: false, opportunityType: 'demand_response' }) === 'greenfield',
  'demand without a real website remains greenfield',
);
assert(
  deriveAcquisitionLane({ hasRealWebsite: true, opportunityType: 'redesign' }) === 'redesign',
  'real-site redesign enters the secondary lane',
);
assert(
  deriveAcquisitionLane({ hasRealWebsite: true, opportunityType: 'demand_response' }) === 'redesign',
  'demand with a real site does not displace greenfield prospects',
);

if (failed) process.exit(1);
