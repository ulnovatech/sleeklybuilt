export type MergeContext = {
  name: string;
  business: string;
  city: string;
  website: string;
  email: string;
  phone: string;
  mapsUrl: string;
  agency: string;
  brand: string;
  sender: string;
  signature: string;
};

const TOKEN_PATTERN =
  /\{\{(name|business|city|website|email|phone|mapsUrl|agency|brand|sender|signature)\}\}/gi;

export function mergeTemplate(text: string, ctx: MergeContext): string {
  return text.replace(TOKEN_PATTERN, (_, key: string) => {
    const k = key.toLowerCase();
    if (k === 'mapsurl') return ctx.mapsUrl;
    return ctx[k as keyof MergeContext] ?? '';
  });
}

export function buildMergeContext(data: {
  businessName: string;
  canonicalName?: string | null;
  city?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  googleMapsUrl?: string | null;
  sourceUrl?: string | null;
  agencyBrand?: string | null;
  agencySender?: string | null;
  agencySignature?: string | null;
}): MergeContext {
  const business = data.canonicalName?.trim() || data.businessName;
  const firstName = business.split(/\s+/)[0] ?? business;
  const brand = data.agencyBrand?.trim() ?? '';
  const sender = data.agencySender?.trim() || brand;
  const signature = data.agencySignature?.trim() ?? '';
  return {
    name: firstName,
    business,
    city: data.city?.trim() ?? '',
    website: data.website?.trim() ?? '',
    email: data.email?.trim() ?? '',
    phone: data.phone?.trim() ?? '',
    mapsUrl: data.googleMapsUrl?.trim() || data.sourceUrl?.trim() || '',
    agency: brand,
    brand,
    sender,
    signature,
  };
}
