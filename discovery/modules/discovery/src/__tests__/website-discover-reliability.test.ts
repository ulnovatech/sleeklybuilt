/**
 * Reliability pipeline tests — website search contract, classification, Pitch Today gates.
 * Uses injected search fixtures (no live Brave spend).
 */
import assert from 'node:assert/strict';
import { WebsiteDiscoverService } from '../enrichment/website-discover-service';
import { classifyWebsiteHit, isCredibleOwnedWebsiteHit } from '../lib/classify-website-hit';
import {
  buildWebsiteSearchPlan,
  computeWebsiteSearchCoverage,
  emptyResultsAreNegativeEvidence,
  planHasSufficientIdentity,
} from '../lib/website-search-contract';
import { evaluatePitchTodayEligibility } from '../lib/pitch-today-eligibility';
import { resolveEffectiveGreenfieldStatus } from '../lib/prospect-evidence';

const svc = new WebsiteDiscoverService(async () => ({ items: [] }));

// 1. Owned .ug / .com discovered → existing_website
{
  const proof = svc.classifyFromEvidence({
    planIdentityOk: true,
    queries: [
      { query: '"Acme Salon" "Kampala"', required: true, role: 'name_locality', outcome: 'completed', hitCount: 1 },
      {
        query: '"Acme Salon" Kampala, Uganda website OR official site',
        required: false,
        role: 'website_intent',
        outcome: 'empty',
        hitCount: 0,
      },
    ],
    hits: [
      {
        url: 'https://acmesalon.ug',
        kind: 'owned_site',
        confidence: 0.9,
        matchedOn: ['acme', 'salon'],
      },
    ],
  });
  assert.equal(proof.greenfieldStatus, 'existing_website');
  assert.equal(proof.ownedWebsiteUrl, 'https://acmesalon.ug');
}

// 2. Empty URL without completed search → uncertain
{
  const status = resolveEffectiveGreenfieldStatus({ websiteClass: 'none' });
  assert.equal(status, 'uncertain');
  const pitch = evaluatePitchTodayEligibility({
    phone: '+256700000000',
    email: 'a@b.com',
    metadata: { websiteClass: 'none' },
  });
  assert.equal(pitch.eligible, false);
}

// 3. Similar names — weak identity match stays ambiguous / not auto-merge owned
{
  const hit = classifyWebsiteHit({
    link: 'https://other-cafe.com',
    title: 'Beta Cafe Nairobi',
    snippet: 'Different business',
    businessName: 'Alpha Salon Kampala',
  });
  assert.notEqual(hit.kind, 'owned_site');
}

// 4. Directory listing is not owned website
{
  const hit = classifyWebsiteHit({
    link: 'https://www.yellowpages.co.ug/business/acme-salon-kampala',
    title: 'Acme Salon Kampala',
    snippet: 'Salon in Kampala',
    businessName: 'Acme Salon',
  });
  assert.equal(hit.kind, 'directory');
  assert.equal(isCredibleOwnedWebsiteHit(hit), false);
}

// 5. Hosted storefront with strong identity match is credible owned destination
{
  const hit = classifyWebsiteHit({
    link: 'https://acme-salon.myshopify.com',
    title: 'Acme Salon — Shop',
    snippet: 'Acme Salon Kampala official store',
    businessName: 'Acme Salon',
  });
  assert.equal(hit.kind, 'hosted_storefront');
  assert.equal(isCredibleOwnedWebsiteHit(hit), true);
}

// 6. Social / link-in-bio distinguished
{
  const social = classifyWebsiteHit({
    link: 'https://facebook.com/acmesalon',
    title: 'Acme Salon',
    snippet: 'Official page',
    businessName: 'Acme Salon',
  });
  assert.equal(social.kind, 'social');
  const lib = classifyWebsiteHit({
    link: 'https://linktr.ee/acmesalon',
    title: 'Acme Salon',
    snippet: 'Links',
    businessName: 'Acme Salon',
  });
  assert.equal(lib.kind, 'link_in_bio');
}

// 7. Budget skip / error / unconfigured never confirmed greenfield
{
  for (const outcome of ['budget_skip', 'error', 'timeout', 'rate_limited', 'unconfigured'] as const) {
    const proof = svc.classifyFromEvidence({
      planIdentityOk: true,
      queries: [
        { query: '"Acme" "Kampala"', required: true, role: 'name_locality', outcome, hitCount: 0 },
      ],
      hits: [],
    });
    assert.notEqual(proof.greenfieldStatus, 'confirmed_greenfield', outcome);
  }
}

// 8. Empty results are negative evidence only when complete
{
  const incomplete = [
    { query: '"Acme" "Kampala"', required: true, role: 'name_locality' as const, outcome: 'empty' as const },
  ];
  // Only required empty — coverage may still complete if weighted ok with only required
  const plan = buildWebsiteSearchPlan({ name: 'Acme', city: 'Kampala', country: 'Uganda', phone: '+256700' });
  assert.equal(planHasSufficientIdentity(plan), true);
  const queries = plan.map((p) => ({
    query: p.query,
    required: p.required,
    role: p.role,
    outcome: 'empty' as const,
    hitCount: 0,
  }));
  assert.equal(computeWebsiteSearchCoverage(queries).complete, true);
  assert.equal(emptyResultsAreNegativeEvidence(queries), true);
  const confirmed = svc.classifyFromEvidence({
    planIdentityOk: true,
    queries,
    hits: [],
  });
  assert.equal(confirmed.greenfieldStatus, 'confirmed_greenfield');
}

// 9. Conflicting / stronger evidence — crawl real not downgraded by empty search path
{
  const status = resolveEffectiveGreenfieldStatus({
    websiteClass: 'real',
    greenfieldStatus: 'existing_website',
    prospectProof: {
      version: 1,
      greenfieldStatus: 'existing_website',
      websiteSearchCoverage: 1,
      searchCompletion: 'complete',
      websiteSearchAt: new Date().toISOString(),
      classificationReason: 'crawl-proven',
      queries: [],
      websiteHits: [],
      contacts: [],
      ownedWebsiteUrl: 'https://real.example',
    },
  });
  assert.equal(status, 'existing_website');
}

// 10. Stale greenfield becomes uncertain
{
  const stale = resolveEffectiveGreenfieldStatus({
    greenfieldStatus: 'confirmed_greenfield',
    prospectProof: {
      version: 1,
      greenfieldStatus: 'confirmed_greenfield',
      websiteSearchCoverage: 1,
      searchCompletion: 'complete',
      websiteSearchAt: '2020-01-01T00:00:00.000Z',
      classificationReason: 'old',
      queries: [],
      websiteHits: [],
      contacts: [],
    },
  });
  assert.equal(stale, 'uncertain');
}

// 13. Pitch Today rejects phone-only, uncertain, existing website
{
  const now = new Date().toISOString();
  const baseProof = {
    version: 1 as const,
    websiteSearchCoverage: 1,
    searchCompletion: 'complete' as const,
    websiteSearchAt: now,
    classificationReason: 'ok',
    queries: [
      { query: '"A" "Kampala"', required: true, role: 'name_locality' as const, outcome: 'empty' as const },
      {
        query: '"A" Kampala website',
        required: false,
        role: 'website_intent' as const,
        outcome: 'empty' as const,
      },
    ],
    websiteHits: [],
    contacts: [],
  };
  assert.equal(
    evaluatePitchTodayEligibility({
      phone: '+256700000000',
      metadata: {
        greenfieldStatus: 'confirmed_greenfield',
        prospectProof: { ...baseProof, greenfieldStatus: 'confirmed_greenfield' },
      },
    }).eligible,
    false,
    'phone-only rejected',
  );
  assert.equal(
    evaluatePitchTodayEligibility({
      phone: '+256700000000',
      email: 'a@b.com',
      metadata: { greenfieldStatus: 'uncertain' },
    }).eligible,
    false,
    'uncertain rejected',
  );
  assert.equal(
    evaluatePitchTodayEligibility({
      phone: '+256700000000',
      email: 'a@b.com',
      metadata: {
        greenfieldStatus: 'existing_website',
        prospectProof: {
          ...baseProof,
          greenfieldStatus: 'existing_website',
          ownedWebsiteUrl: 'https://x.com',
        },
      },
    }).eligible,
    false,
    'existing website rejected',
  );
  assert.equal(
    evaluatePitchTodayEligibility({
      phone: '+256700000000',
      email: 'a@b.com',
      metadata: {
        greenfieldStatus: 'confirmed_greenfield',
        prospectProof: { ...baseProof, greenfieldStatus: 'confirmed_greenfield' },
      },
    }).eligible,
    true,
    'confirmed + phone + email accepted',
  );
}

console.log('website-discover-reliability: ok');
