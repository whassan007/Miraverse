import type { CountryId } from '../content/schema.js';

export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
export const SALT = 'miraverse-v0';

export interface StampRecord {
  code: string;
  country: CountryId;
  chapter: number;
  nonce: string;
  checksum: string;
  earnedAt?: string;
}

export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  const bytes = new TextEncoder().encode(input);
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function computeChecksum(countryAndChapter: string, nonce: string): string {
  let h = fnv1a32(`${SALT}${countryAndChapter}${nonce}`);
  let out = '';
  for (let i = 0; i < 4; i++) {
    const idx = h % 30;
    out += ALPHABET[idx];
    h = Math.floor(h / 30);
  }
  return out;
}

export function make(country: CountryId, chapter = 1, nonceOverride?: string): string {
  const nonce =
    nonceOverride ??
    Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * 30)]).join('');
  const cc = `${country}${chapter}`;
  const cccc = computeChecksum(cc, nonce);
  return `MV-${cc}-${nonce}-${cccc}`;
}

export function verify(code: string): { valid: boolean; country?: CountryId; chapter?: number; nonce?: string; checksum?: string } {
  if (typeof code !== 'string') return { valid: false };
  const normalized = code.trim().toUpperCase();
  const match = /^MV-(LB|EG|IQ|KR|FR)(1)-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})$/.exec(
    normalized
  );
  if (!match) return { valid: false };
  const [, country, chStr, nonce, checksum] = match;
  const expected = computeChecksum(`${country}${chStr}`, nonce);
  if (expected !== checksum) return { valid: false };
  return {
    valid: true,
    country: country as CountryId,
    chapter: Number(chStr),
    nonce,
    checksum,
  };
}
