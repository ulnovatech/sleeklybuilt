export { DiscoveryService } from './service';

export { DiscoveryRepository } from './repository';

export {

  getConfiguredDiscoveryProviders,

  getDiscoveryProviderStatus,

  getAcquisitionModeLabel,

} from './providers/registry';

export { GooglePlacesVerifyProvider } from './providers/places/places-verify';
export { GooglePlacesDiscoveryProvider } from './providers/places/places-discover';
export {
  OsmDiscoveryProvider,
  preferGeofabrikExtract,
  type OsmDiscoverResult,
} from './providers/osm/osm-discover';
export {
  resolveGeofabrikPaths,
  geofabrikIndexReady,
  geofabrikPbfReady,
  GEOFABRIK_UGANDA_PBF_URL,
  GEOFABRIK_EXTRACT_ID,
  type GeofabrikPaths,
} from './providers/osm/geofabrik-paths';
export { downloadGeofabrikUgandaPbf } from './providers/osm/geofabrik-download';
export {
  buildGeofabrikPoiIndex,
  queryGeofabrikPoiIndex,
  readGeofabrikIndexMeta,
  haversineMeters,
  type GeofabrikIndexMeta,
  type IndexedOsmPoi,
} from './providers/osm/geofabrik-index';
export {
  GEOFABRIK_REFRESH_CRON_HINT,
  GEOFABRIK_REFRESH_INTERVAL_MS,
  GEOFABRIK_REFRESH_TIMEZONE,
  geofabrikExtractStatus,
  type GeofabrikExtractStatus,
} from './providers/osm/geofabrik-refresh';
export {
  formatProviderStatLogLine,
  formatProviderStatsSummary,
  type ProviderStatLine,
} from './lib/format-provider-stats';
export {
  formatFactoryHealthCheckLine,
  formatFactoryHealthHeader,
} from './lib/format-factory-health';
export { osmTagsForIndustry, type OsmTagFilter } from './providers/osm/industry-tags';
export { osmElementToBusiness, type OsmBackend } from './providers/osm/map-osm-result';
export { MetaGraphDiscoveryProvider } from './providers/meta/meta-graph-provider';
export {
  tripGoogleCircuit,
  resetGoogleCircuit,
  isGoogleCircuitOpen,
  isGoogleAcquisitionDisabledByEnv,
  getPlacesLifecycle,
  type PlacesLifecycle,
} from './providers/google-circuit';
export {
  MetaGraphClient,
  MetaGraphApiError,
  type MetaPagesSearchProbeResult,
} from './providers/meta/meta-graph-client';
export {
  evaluateMetaPagesSearchCapability,
  getMetaPagesSearchEnvOverride,
  getMetaPagesSearchGateState,
  isMetaPagesSearchReady,
  markMetaPagesSearchGate,
  metaPagesSearchGateReason,
  resetMetaPagesSearchGate,
  type MetaPagesSearchGateState,
  type MetaPagesSearchGateStatus,
} from './providers/meta/meta-pages-search-gate';
export { SocialSearchProvider } from './providers/social/social-search-provider';
export { parseSocialSearchResultItem } from './providers/social/parse-social-search-result';
export {
  SearchApiClient,
  braveCountryForIso2,
  isLegacyBingEnabled,
  mergeSearchResults,
  normalizeSearchUrl,
  SEARCH_RESULTS_PER_PAGE,
} from './providers/search-api-client';
export {
  SearchApiError,
  SearchBudgetExhaustedError,
  parseBraveSearchErrorBody,
  type SearchEngineId,
} from './providers/search-api-error';
export {
  placeSearchResultToDiscoveredBusiness,
  placesIdFromExternalId,
  normalizePlacesExternalId,
} from './providers/places/place-to-candidate';
export {
  classifyWebsiteClass,
  countsAsOwnedWebsiteForScoring,
  deriveWebsiteClassFromCrawl,
  isWebsiteClass,
  keepOnMorningPath,
  mergeWebsiteClass,
  parseWebsiteClass,
  resolveWebsiteClass,
  websiteClassLabel,
  type WebsiteClass,
} from './lib/website-class';
export {
  buildWhyContactScan,
  contactabilityLabel,
  contactabilityOf,
  contactabilityTone,
  deriveWhyContactLine,
  topEvidenceFacts,
  websiteClassTone,
  type Contactability,
  type EvidenceFact,
  type WhyContactScan,
} from './lib/why-contact';
export {
  attachDiscoveryEvidence,
  finalizeEvidence,
  formatEvidenceAttribution,
  formatEvidenceConflicts,
  mergeAccountMetadata,
  mergeDiscoveryEvidence,
  readDiscoveryEvidence,
  type DiscoveryEvidence,
  type DiscoveryEvidenceEntry,
  type DiscoveryEvidenceConflict,
} from '@agency/validation';

export { GooglePlacesDetailsProvider } from './providers/places/places-details';

export { PlacesApiClient } from './providers/places/places-client';

export { buildPublicSearchQueries } from './lib/build-public-search-queries';
export { buildMetaSearchQueries } from './lib/build-meta-search-queries';
export {
  buildSocialSearchQueries,
  platformsForSocialSearch,
  type SocialSearchPlatform,
  type SocialSearchMode,
} from './lib/build-social-search-queries';
export {
  classifySearchResult,
  isKeepableSearchResult,
  isLocalDirectoryHost,
  isExtractableDirectoryListing,
  isDirectoryListicleOrSearch,
  LOCAL_DIRECTORY_HOST_FRAGMENTS,
  type SearchResultKind,
  type SocialPlatform,
} from './providers/search-result-classifier';

export {
  parseSearchResultItem,
  extractDirectoryCandidate,
  extractBusinessNameFromDirectoryTitle,
  extractNameFromDirectoryUrl,
  extractExternalWebsiteFromSnippet,
} from './providers/parse-search-results';

export {
  getRunSearchQueryLimit,
  getSearchPagesPerQuery,
  getMetaGraphQueryLimit,
  getMetaGraphPagesPerQuery,
  getSocialSearchQueryLimit,
  getAcquisitionMode,
  profileToMode,
  modeToProfile,
  getRunProfileLabel,
  type RunProfile,
} from './lib/run-profile';

export type { DiscoveredBusiness, DiscoveryProvider, DiscoverySource } from './providers/types';

export { getRunWithEnrichedBusinesses } from './run-details';

export {
  computeRunYieldStats,
  refreshRunYieldStats,
  countBySource,
  type DiscoveryRunStats,
} from './run-yield-metrics';

export {
  classifyDiscoveryState,
  isKnownFresh,
  type DiscoveryState,
} from './lib/discovery-state';

export {
  countProspectCandidates,
  countHighPotentialEstimate,
  businessRowToProspectShape,
} from './lib/prospect-metrics';

export {
  parseCsvContent,
  normalizeCsvHeader,
  buildCsvTemplate,
  CSV_TEMPLATE_HEADERS,
} from './lib/parse-csv';
export {
  mapCsvRowToCandidate,
  mapCsvRowsToCandidates,
  rowMatchesRunFilters,
  hasRequiredNameColumn,
} from './lib/map-csv-row';
export {
  getCsvImportFileInfo,
  saveCsvImportFile,
  previewCsvContent,
  validateCsvForImport,
  loadCsvCandidates,
  getCsvTemplateContent,
  CSV_MAX_BYTES,
  CSV_MAX_ROWS,
  type CsvImportFileInfo,
  type CsvUploadResult,
  type CsvParsePreview,
} from './lib/csv-import-service';

export { shouldSpendPlacesLookup, shouldFetchPlaceExternalId } from './places-refresh';

export {
  normalizePlacesReviews,
  readPlacesReviewsFromMetadata,
  extractReviewSnippets,
  mineReviewPainKeywords,
  buildBusinessSignalsFromReviews,
  reviewPainSourceUrl,
  type PlacesReviewRecord,
  type ReviewSnippet,
  type ReviewPainMatch,
  type BusinessSignalsFromReviews,
} from './providers/places/review-pain-signals';

export { needsPlacesVerify } from './providers/places/needs-verify';

export { RedditIntentProvider, parseRedditListing } from './providers/custom/reddit-intent-provider';
export {
  emptyHealthState,
  isCustomScrapeDegraded,
  recordPollOutcome,
  type CustomScrapeHealthState,
  type DailyPollRecord,
} from './providers/custom/health';
export { CustomScrapeRateLimiter } from './providers/custom/rate-limiter';
export type { CustomDemandItem } from './providers/custom/types';

export {
  DiscoveryPlanService,
  DiscoveryPlanRepository,
  tickDiscoveryPlans,
  expandPlanTargets,
  computeNextRunAt,
  computeSkipHoursNextRunAt,
  canRunAt,
  isWithinActiveHours,
  listDiscoveryCampaigns,
  listDiscoveryPacks,
  resolvePlanBlueprint,
  intersectIndustries,
  resolvePackIndustries,
  ensureFactoryPlans,
  getFactoryCredentialHealth,
  classifyCseCredential,
  FACTORY_TIMEZONE,
  FACTORY_PLACES_MONTHLY_FLOOR,
  FACTORY_CORE_TEMPLATE_KEY,
  FACTORY_EXPLORE_TEMPLATE_KEY,
  FACTORY_MARKETS,
  buildFactoryTargets,
  marketsForTiers,
  countFactorySegments,
  cohortDatesForHarvest,
  calendarDateInTimezone,
  addIsoDateDays,
  isExploreFloorSlot,
  EXPLORE_FLOOR_EVERY,
  type TickDiscoveryPlansResult,
  type PlanCadence,
  type PlanSegment,
  type DiscoveryCampaign,
  type DiscoveryPack,
  type PlanBlueprint,
  type EnsureFactoryPlansResult,
  type FactoryCredentialHealth,
  type FactoryCredentialCheck,
} from './plans';

export {
  FactoryPurifyService,
  FactoryCohortRepository,
  FactoryScoreboardService,
  classifyMissReason,
  FACTORY_MISS_REASONS,
  FACTORY_MISS_REASON_LABELS,
  dumpsterReasonLabel,
  suggestedDumpsterOps,
  isBenchEligible,
  BENCH_MISS_REASONS,
  FACTORY_KEEPER_LIMIT,
  cutKeepers,
  geoTierForCountry,
  rankScore,
  purifyTargetDates,
  hasWhatsAppHint,
  recommendPitchChannel,
  demandJumpBlockReason,
  yieldHeadline,
  type FactoryMissReason,
  type FactoryPitchChannel,
  type FactoryCohortRow,
  type PurifyResult,
  type PurifyTargetDates,
  type FactoryScoreboard,
  type FactoryTodaySnapshot,
  type FactoryYieldRow,
  type DemandJumpBlock,
} from './factory';

