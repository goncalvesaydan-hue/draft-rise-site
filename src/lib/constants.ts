export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://draftandrise.com';

export const CONTACT_EMAIL = 'geral@draftandrise.com';

export const CONTACT_PHONE_DISPLAY = '+351 928 384 627';
export const CONTACT_PHONE_RAW = '351928384627';
export const CONTACT_PHONE_TEL = '+351928384627';

export const WHATSAPP_DEPARTMENTS = {
  comercial: process.env.NEXT_PUBLIC_WHATSAPP_COMMERCIAL || '351928384627',
  suporte: process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || '351928384627',
} as const;

export type DepartmentKey = keyof typeof WHATSAPP_DEPARTMENTS;

export function getTelHref() {
  return `tel:${CONTACT_PHONE_TEL}`;
}

function normalizeInterests(interest?: string | string[]): string[] {
  if (!interest) return [];
  return Array.isArray(interest) ? interest.filter(Boolean) : [interest];
}

export function getEmailHref(
  interest?: string | string[],
  department: DepartmentKey = 'comercial',
) {
  const list = normalizeInterests(interest);
  const joined = list.join(', ');

  if (department === 'suporte') {
    const subject = joined
      ? `Apoio ao Cliente (${joined}) — Draft & Rise`
      : 'Apoio ao Cliente — Draft & Rise';
    const body = joined
      ? `Olá, equipa de suporte Draft & Rise!\n\nO meu negócio chama-se...\n\nPreciso de apoio relativamente a: ${joined}.\n\nDetalhes:\n`
      : 'Olá, equipa de suporte Draft & Rise!\n\nO meu negócio chama-se...\n\nPreciso de apoio com...\n';
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const subject = joined
    ? `Vamos conversar: ${joined}`
    : 'Vamos conversar — Draft & Rise';
  const body = joined
    ? `Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nTenho interesse em: ${joined}.\n\nGostava de conversar convosco sobre...\n`
    : 'Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nGostava de conversar convosco sobre...\n';
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getWhatsAppHref(
  interest?: string | string[],
  department: DepartmentKey = 'comercial',
) {
  const phone = WHATSAPP_DEPARTMENTS[department];
  const list = normalizeInterests(interest);
  const joined = list.join(', ');

  if (department === 'suporte') {
    const message = joined
      ? `Olá, Draft & Rise! Já sou cliente e preciso de suporte relativamente a: ${joined}.`
      : 'Olá, Draft & Rise! Já sou cliente e gostava de falar com o suporte.';
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  const message = joined
    ? `Olá, Draft & Rise! Gostava de saber como podem ajudar o meu negócio (${joined}).`
    : 'Olá, Draft & Rise! Gostava de saber como podem ajudar o meu negócio.';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getGoogleAuditWhatsAppHref() {
  const phone = WHATSAPP_DEPARTMENTS.comercial;
  const message =
    'Olá, Draft & Rise! Gostava de pedir uma análise gratuita ao posicionamento da minha empresa no Google. O meu negócio chama-se: ';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
