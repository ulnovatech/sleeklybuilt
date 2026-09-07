import assert from 'node:assert/strict';
import { normalizeGapId, resolveSelectedOffer } from '../boi/resolve-selected-offer';

const catalog = {
  siteUrl: 'https://sleeklybuilt.pro',
  productLines: [
    { id: 'sleek_pages' as const, label: 'Sleek Page', path: '/sleek-pages' },
    { id: 'websites' as const, label: 'Website', path: '/websites' },
    { id: 'mobile_apps' as const, label: 'Mobile app', path: '/mobile-apps' },
    { id: 'business_systems' as const, label: 'Business system', path: '/business-systems' },
  ],
};

function assertOfferUrl(url: string) {
  assert.ok(url.startsWith('https://sleeklybuilt.pro/'), `url origin: ${url}`);
  assert.notEqual(new URL(url).pathname, '/', `must not be homepage: ${url}`);
}

{
  assert.equal(normalizeGapId('no_site'), 'no_website');
  assert.equal(normalizeGapId('not_mobile'), 'not_mobile_friendly');
  assert.equal(normalizeGapId('gap:social_only'), 'social_only');
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'social_only',
    opportunityType: 'greenfield',
    industry: 'Hair salon',
    businessName: 'Kampala Cuts',
    hasPhone: true,
    gapIds: ['social_only'],
    painIds: ['pain:no_web_presence'],
  });
  assert.ok(offer, 'social-only salon yields offer');
  assert.equal(offer!.productLine, 'sleek_pages');
  assert.equal(offer!.packageId, 'basic');
  assert.match(offer!.url, /\/sleek-pages$/);
  assertOfferUrl(offer!.url);
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'link_in_bio',
    gapIds: ['link_in_bio_only'],
    hasPhone: true,
  });
  assert.equal(offer?.productLine, 'sleek_pages');
  assert.match(offer!.url, /\/sleek-pages$/);
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'greenfield',
    opportunityType: 'greenfield',
    industry: 'Hotel',
    businessName: 'Lake View Hotel',
    gapIds: ['no_website'],
    painIds: ['pain:no_web_presence'],
    hasPhone: true,
  });
  assert.ok(offer, 'hotel no-site yields offer');
  assert.equal(offer!.productLine, 'websites');
  assert.equal(offer!.packageId, 'smart');
  assert.match(offer!.url, /\/websites$/);
  assertOfferUrl(offer!.url);
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'redesign',
    opportunityType: 'modernize',
    industry: 'Dental clinic',
    gapIds: ['missing_online_booking'],
    painIds: ['pain:booking_gap'],
    hasPhone: true,
    hasEmail: true,
  });
  assert.ok(offer, 'booking gap yields offer');
  assert.equal(offer!.productLine, 'website_modules');
  assert.ok(
    offer!.url.endsWith('/business-systems') || offer!.url.endsWith('/websites'),
    `booking URL should be systems or websites, got ${offer!.url}`,
  );
  assertOfferUrl(offer!.url);
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'greenfield',
    opportunityType: 'demand_response',
    industry: 'Delivery startup',
    intentTexts: ['Need an Android app with MoMo for local delivery'],
    gapIds: ['no_website'],
    hasPhone: true,
  });
  assert.ok(offer, 'demand+app yields offer');
  assert.ok(
    offer!.productLine === 'app_plus_site' || offer!.productLine === 'mobile_apps',
    `expected app line, got ${offer!.productLine}`,
  );
  assert.match(offer!.url, /\/mobile-apps$/);
  assertOfferUrl(offer!.url);
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'redesign',
    opportunityType: 'demand_response',
    industry: 'Village SACCO',
    intentTexts: ['Need software for SACCO loan tracking'],
    hasPhone: true,
  });
  assert.equal(offer?.productLine, 'business_systems');
  assert.match(offer!.url, /\/business-systems$/);
}

{
  const blocked = resolveSelectedOffer({
    ...catalog,
    status: 'blocked',
    presenceClass: 'greenfield',
    gapIds: ['no_website'],
  });
  assert.equal(blocked, null, 'blocked status returns null');
}

{
  const offer = resolveSelectedOffer({
    ...catalog,
    presenceClass: 'redesign',
    gapIds: ['website_unreachable'],
    hasPhone: true,
  });
  assert.equal(offer?.productLine, 'websites');
  assert.match(offer!.why, /unreachable/i);
  assert.ok(!/no site/i.test(offer!.why) || /verify/i.test(offer!.why));
}

console.log('ok resolve-selected-offer');
console.log('passed');
