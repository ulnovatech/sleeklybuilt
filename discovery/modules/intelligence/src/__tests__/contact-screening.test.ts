import { normalizePhoneE164, screenWhatsAppNumber } from '../contact-screening';

let failed = 0;
function assert(condition: boolean, name: string) {
  if (condition) console.log(`ok ${name}`);
  else {
    failed++;
    console.error(`fail ${name}`);
  }
}

assert(normalizePhoneE164('0700 123 456', 'Uganda') === '+256700123456', 'normalizes Uganda local phone');
assert(normalizePhoneE164('+256700123456', 'Uganda') === '+256700123456', 'preserves valid E.164 phone');
assert(normalizePhoneE164('0700 123 456', 'Unknown') === null, 'does not guess unknown country dialing code');

const ready = screenWhatsAppNumber('+256700123456', 'https://wa.me/256700123456', 'Uganda');
assert(ready.status === 'wa_ready', 'matching crawled WhatsApp URL is ready');

const mismatch = screenWhatsAppNumber('+256700123456', 'https://wa.me/256700000000', 'Uganda');
assert(mismatch.status === 'wa_unreliable', 'mismatching WhatsApp URL is unreliable');

const probable = screenWhatsAppNumber('0700 123 456', null, 'Uganda');
assert(probable.status === 'wa_probable' && probable.waMeUrl === 'https://wa.me/256700123456', 'normalized phone is probable');

const blocked = screenWhatsAppNumber(null, null, 'Uganda');
assert(blocked.status === 'wa_blocked', 'missing phone is blocked');

if (failed) process.exit(1);
