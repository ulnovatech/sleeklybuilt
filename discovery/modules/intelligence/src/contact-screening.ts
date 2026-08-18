export type WhatsAppReadiness = 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked';

export type WhatsAppScreening = {
  status: WhatsAppReadiness;
  normalizedPhone: string | null;
  reason: string;
  waMeUrl: string | null;
};

const COUNTRY_DIAL_CODES: Record<string, string> = {
  uganda: '256',
  ug: '256',
  kenya: '254',
  ke: '254',
  tanzania: '255',
  tz: '255',
  rwanda: '250',
  rw: '250',
  nigeria: '234',
  ng: '234',
  'south africa': '27',
  za: '27',
  ghana: '233',
  gh: '233',
};

export function normalizePhoneE164(phone: string | null | undefined, country: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    const normalized = `+${digits.slice(1).replace(/\D/g, '')}`;
    return normalized.length >= 9 && normalized.length <= 16 ? normalized : null;
  }
  if (digits.startsWith('00')) {
    const normalized = `+${digits.slice(2).replace(/\D/g, '')}`;
    return normalized.length >= 9 && normalized.length <= 16 ? normalized : null;
  }
  const localDigits = digits.replace(/\D/g, '');
  const dialCode = country ? COUNTRY_DIAL_CODES[country.trim().toLowerCase()] : undefined;
  if (!dialCode || localDigits.length < 7) return null;
  const normalized = `+${dialCode}${localDigits.replace(/^0/, '')}`;
  return normalized.length <= 16 ? normalized : null;
}

function digitsFromWhatsappUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!/(^|\.)wa\.me$|(^|\.)whatsapp\.com$/i.test(parsed.hostname)) return null;
    const fromPath = parsed.pathname.replace(/\D/g, '');
    const fromQuery = parsed.searchParams.get('phone')?.replace(/\D/g, '') ?? '';
    return fromPath || fromQuery || null;
  } catch {
    return null;
  }
}

export function screenWhatsAppNumber(
  phone: string | null | undefined,
  whatsappUrl: string | null | undefined,
  country: string | null | undefined,
): WhatsAppScreening {
  const normalizedPhone = normalizePhoneE164(phone, country);
  const whatsappDigits = digitsFromWhatsappUrl(whatsappUrl);
  const phoneDigits = normalizedPhone?.replace(/\D/g, '') ?? null;
  const waMeUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : null;

  if (whatsappDigits && phoneDigits && whatsappDigits === phoneDigits) {
    return { status: 'wa_ready', normalizedPhone, reason: 'A crawled WhatsApp link matches the business phone.', waMeUrl };
  }
  if (whatsappDigits && phoneDigits && whatsappDigits !== phoneDigits) {
    return { status: 'wa_unreliable', normalizedPhone, reason: 'A WhatsApp link exists but does not match the business phone.', waMeUrl: null };
  }
  if (normalizedPhone) {
    return { status: 'wa_probable', normalizedPhone, reason: 'Phone is normalized; confirm availability in WhatsApp before sending.', waMeUrl };
  }
  return { status: 'wa_blocked', normalizedPhone: null, reason: 'No safely normalized phone number is available for WhatsApp.', waMeUrl: null };
}
