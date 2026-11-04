import type { CountryId } from '../../../../packages/content/schema.js';

export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
export const SALT = 'miraverse-v0';

const RE =
  /^MV-(LB|EG|IQ|KR|FR)([1-9][0-9]*)-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})$/;

function utf8Bytes(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const c = ch.codePointAt(0) as number;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

export function checksum(countryAndChapter: string, nonce: string): string {
  let h = 0x811c9dc5;
  for (const b of utf8Bytes(SALT + countryAndChapter + nonce)) {
    h = Math.imul(h ^ b, 16777619) >>> 0;
  }
  let out = '';
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[h % 30];
    h = Math.floor(h / 30);
  }
  return out;
}

function randomNonce(): string {
  let n = '';
  for (let i = 0; i < 4; i++) n += ALPHABET[Math.floor(Math.random() * 30)];
  return n;
}

/** Create a souvenir stamp code. `nonce` is optional (random by default). */
export function make(country: CountryId, chapter: number, nonce: string = randomNonce()): string {
  const n = nonce.toUpperCase();
  return `MV-${country}${chapter}-${n}-${checksum(`${country}${chapter}`, n)}`;
}

/** Validate a stamp code; chapter must be 1 in v0.1. */
export function verify(code: string): { country: CountryId; chapter: number } | null {
  const m = RE.exec(code.trim().toUpperCase());
  if (!m) return null;
  const chapter = Number(m[2]);
  if (chapter !== 1) return null;
  if (checksum(`${m[1]}${m[2]}`, m[3]) !== m[4]) return null;
  return { country: m[1] as CountryId, chapter };
}
