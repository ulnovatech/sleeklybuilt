import assert from 'node:assert/strict';
import {
  attachDiscoveryEvidence,
  formatEvidenceAttribution,
  formatEvidenceConflicts,
  mergeAccountMetadata,
  mergeDiscoveryEvidence,
  mergeWebsiteClassField,
  readDiscoveryEvidence,
} from '../discovery-evidence';

const osm = attachDiscoveryEvidence(
  {
    name: 'Kampala Kitchen',
    source: 'openstreetmap' as const,
    sourceUrl: 'https://www.openstreetmap.org/node/1',
    externalId: 'osm:node/1',
    phone: '+256700111222',
    website: undefined,
    metadata: { osmBackend: 'geofabrik_pbf' },
  },
  {
    phone: { method: 'osm_tags.phone', backend: 'geofabrik_pbf', confidence: 'high' },
  },
);

const osmEv = readDiscoveryEvidence(osm.metadata);
assert.ok(osmEv, 'OSM evidence present');
assert.equal(osmEv?.phone?.source, 'openstreetmap');
assert.equal(osmEv?.phone?.backend, 'geofabrik_pbf');
assert.equal(osmEv?.phone?.confidence, 'high');
assert.ok(!osmEv?.website, 'no website pointer without website');

const search = attachDiscoveryEvidence(
  {
    name: 'Kampala Kitchen',
    source: 'public_search' as const,
    sourceUrl: 'https://example.com/listing',
    phone: '+256700999888',
    website: 'https://kampalakitchen.ug',
  },
  {
    phone: { method: 'snippet_regex', confidence: 'low' },
    website: { method: 'public_search.result_link', confidence: 'medium' },
  },
);

const merged = mergeDiscoveryEvidence(
  osmEv,
  readDiscoveryEvidence(search.metadata),
  { phone: '+256700111222', website: 'https://kampalakitchen.ug' },
);

assert.ok(merged);
assert.ok(merged.fields.length >= 3, 'at least phone×2 + website (+ sourceUrls)');
assert.ok(
  merged.fields.filter((f) => f.field === 'phone').length === 2,
  'both phone attributions retained',
);
assert.equal(merged.phone?.source, 'openstreetmap', 'winner matches retained phone scalar');
assert.equal(merged.website?.source, 'public_search');
assert.ok(merged.conflicts?.some((c) => c.field === 'phone'), 'phone conflict recorded');

const attr = formatEvidenceAttribution(merged.phone);
assert.ok(attr?.includes('OpenStreetMap'), attr ?? '');
assert.ok(attr?.includes('Geofabrik'), attr ?? '');
assert.ok(attr?.includes('high'), attr ?? '');

const conflictLine = formatEvidenceConflicts(merged.conflicts);
assert.ok(conflictLine?.includes('phone conflict'), conflictLine ?? '');

const meta = mergeAccountMetadata(
  { survivalSource: true, discoveryEvidence: osmEv },
  { searchQuery: 'q', discoveryEvidence: readDiscoveryEvidence(search.metadata) },
  { phone: '+256700111222', website: 'https://kampalakitchen.ug' },
);

assert.equal(meta?.survivalSource, true, 'preserves existing non-evidence keys');
assert.equal(meta?.searchQuery, 'q', 'merges incoming keys');
assert.ok(readDiscoveryEvidence(meta)?.conflicts?.length, 'merged meta keeps conflicts');

const youtube = attachDiscoveryEvidence(
  {
    name: 'Kampala Eats',
    source: 'social_search' as const,
    sourceUrl: 'https://www.youtube.com/@kampalaeats',
    metadata: { youtubeUrl: 'https://www.youtube.com/@kampalaeats', primaryPlatform: 'youtube' },
  },
  {
    sourceUrl: { method: 'social_search.profile', confidence: 'high' },
    youtubeUrl: { method: 'social_search.youtube', confidence: 'high' },
  },
);
const ytEv = readDiscoveryEvidence(youtube.metadata);
assert.ok(ytEv?.fields.some((f) => f.field === 'youtubeUrl'), 'YouTube profile evidence written');
assert.ok(ytEv?.fields.some((f) => f.field === 'sourceUrl'), 'sourceUrl evidence written');

assert.equal(
  mergeWebsiteClassField('real', 'uncertain'),
  'real',
  'ingest uncertain must not downgrade crawl-proven real',
);
assert.equal(mergeWebsiteClassField('uncertain', 'broken'), 'broken');
assert.equal(
  mergeAccountMetadata({ websiteClass: 'real' }, { websiteClass: 'uncertain' })?.websiteClass,
  'real',
  'metadata merge protects crawl-proven websiteClass',
);

console.log('discovery-evidence tests passed');
