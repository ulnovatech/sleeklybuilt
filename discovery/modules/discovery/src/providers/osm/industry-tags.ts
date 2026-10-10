/**
 * Map platform industry labels → Overpass tag filters.
 * Prefer tags that often carry phone/name for greenfield SMB harvest.
 */

export type OsmTagFilter = {
  key: string;
  value: string;
};

/** Primary + alternate Overpass filters per industry (OR'd in one query). */
export const INDUSTRY_OSM_TAGS: Record<string, OsmTagFilter[]> = {
  Accounting: [
    { key: 'office', value: 'accountant' },
    { key: 'office', value: 'tax_advisor' },
    { key: 'office', value: 'financial' },
  ],
  Automotive: [
    { key: 'shop', value: 'car' },
    { key: 'shop', value: 'car_repair' },
    { key: 'amenity', value: 'car_wash' },
    { key: 'shop', value: 'tyres' },
  ],
  Construction: [
    { key: 'office', value: 'construction_company' },
    { key: 'craft', value: 'carpenter' },
    { key: 'craft', value: 'plumber' },
    { key: 'craft', value: 'electrician' },
  ],
  Dental: [
    { key: 'amenity', value: 'dentist' },
    { key: 'healthcare', value: 'dentist' },
  ],
  'E-commerce': [{ key: 'shop', value: 'yes' }],
  Education: [
    { key: 'amenity', value: 'school' },
    { key: 'amenity', value: 'college' },
    { key: 'amenity', value: 'language_school' },
    { key: 'amenity', value: 'driving_school' },
  ],
  'Fitness & Gym': [
    { key: 'leisure', value: 'fitness_centre' },
    { key: 'leisure', value: 'sports_centre' },
    { key: 'sport', value: 'fitness' },
  ],
  Healthcare: [
    { key: 'amenity', value: 'clinic' },
    { key: 'amenity', value: 'doctors' },
    { key: 'amenity', value: 'hospital' },
    { key: 'healthcare', value: 'clinic' },
  ],
  Hospitality: [
    { key: 'tourism', value: 'hotel' },
    { key: 'tourism', value: 'guest_house' },
    { key: 'tourism', value: 'motel' },
  ],
  Legal: [
    { key: 'office', value: 'lawyer' },
    { key: 'office', value: 'notary' },
  ],
  'Marketing Agency': [
    { key: 'office', value: 'advertising_agency' },
    { key: 'office', value: 'marketing' },
  ],
  'Non-profit': [
    { key: 'office', value: 'ngo' },
    { key: 'office', value: 'association' },
  ],
  'Real Estate': [
    { key: 'office', value: 'estate_agent' },
    { key: 'office', value: 'property' },
  ],
  Restaurant: [
    { key: 'amenity', value: 'restaurant' },
    { key: 'amenity', value: 'cafe' },
    { key: 'amenity', value: 'fast_food' },
    { key: 'amenity', value: 'bar' },
  ],
  Retail: [
    { key: 'shop', value: 'convenience' },
    { key: 'shop', value: 'supermarket' },
    { key: 'shop', value: 'clothes' },
    { key: 'shop', value: 'department_store' },
  ],
  'Salon & Spa': [
    { key: 'shop', value: 'hairdresser' },
    { key: 'shop', value: 'beauty' },
    { key: 'leisure', value: 'spa' },
    { key: 'shop', value: 'massage' },
  ],
  Technology: [
    { key: 'shop', value: 'computer' },
    { key: 'office', value: 'it' },
    { key: 'office', value: 'telecommunication' },
  ],
  Travel: [
    { key: 'shop', value: 'travel_agency' },
    { key: 'office', value: 'travel_agent' },
  ],
  Veterinary: [
    { key: 'amenity', value: 'veterinary' },
    { key: 'healthcare', value: 'veterinary' },
  ],
  'Web Development': [
    { key: 'office', value: 'it' },
    { key: 'office', value: 'company' },
  ],
};

export function osmTagsForIndustry(industry: string): OsmTagFilter[] {
  const hit = INDUSTRY_OSM_TAGS[industry.trim()];
  if (hit?.length) return hit;
  // Fallback: name search via amenity=yes is too noisy — use shop + office broadly
  return [
    { key: 'shop', value: 'yes' },
    { key: 'office', value: 'yes' },
    { key: 'craft', value: 'yes' },
  ];
}
