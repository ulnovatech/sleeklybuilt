export { OutreachService } from './service';
export { DEFAULT_OUTREACH_TEMPLATES, OUTREACH_OPPORTUNITY_TYPES } from './default-templates';
export { buildMergeContext, mergeTemplate } from './template-merge';
export type { MergeContext } from './template-merge';
export {
  composeOutreachBody,
  type OpenerEvidenceRef,
  type RecommendedOutreachEnrichment,
} from './compose-outreach-body';
export {
  DEFAULT_EXPORT_STATUSES,
  DEFAULT_OUTREACH_QUEUE_STATUSES,
  hasContactPath,
  resolveExportStatuses,
  resolveOutreachQueueStatuses,
} from './export-gates';
export {
  assembleDraftExportCsv,
  type DraftExportAssembleResult,
  type DraftExportCachedDraft,
  type DraftExportCandidate,
} from './export-drafts-csv';
export type { OutreachDraftChannel } from './draft-channel';
export { OUTREACH_DRAFT_CHANNELS } from './draft-channel';
export type { OutreachQueueLeadRow, OutreachQueuePagedResult } from './repository';
