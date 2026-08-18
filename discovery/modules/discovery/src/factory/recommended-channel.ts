export type FactoryPitchChannel = 'whatsapp' | 'phone' | 'email' | 'follow_up';

export function recommendPitchChannel(input: {
  phone?: string | null;
  email?: string | null;
  hasWhatsAppHint?: boolean;
}): FactoryPitchChannel {
  if (input.hasWhatsAppHint && input.phone?.trim()) return 'whatsapp';
  if (input.phone?.trim()) return 'phone';
  if (input.email?.trim()) return 'email';
  return 'follow_up';
}

export function hasWhatsAppHint(input: {
  website?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const website = input.website?.toLowerCase() ?? '';
  if (website.includes('wa.me') || website.includes('whatsapp')) return true;
  const crawl = input.metadata?.crawl;
  if (crawl && typeof crawl === 'object') {
    const url = (crawl as { whatsappUrl?: unknown }).whatsappUrl;
    if (typeof url === 'string' && url.trim()) return true;
  }
  return false;
}
