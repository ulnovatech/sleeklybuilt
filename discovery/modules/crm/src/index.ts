export { CrmService } from './service';
export { CrmRepository } from './repository';
export {
  canTransition,
  assertTransition,
  getAllowedTransitions,
  isTerminalLeadStatus,
  TERMINAL_LEAD_STATUSES,
} from './state-machine';
