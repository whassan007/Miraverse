import type { CountryId } from '../content/schema.js';

export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
export const SALT = 'miraverse-v0';
const STORAGE_KEY = 'mv.stamps';

export interface StampRecord {
  code: string;
  country: CountryId;
  chapter: number;
  nonce: string;
  checksum: string;
  earnedAt?: string;
}
export type Verification = { valid: false } | ({ valid: true } & StampRecord);

export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(input)) {
    h = Math.imul(h ^ byte, 0x01000193) >>> 0;
  }
  return h;
}

export function computeChecksum(countryAndChapter: string, nonce: string): string {
  let h = fnv1a32(`${SALT}${countryAndChapter}${nonce}`);
  let out = '';
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[h % 30];
    h = Math.floor(h / 30);
  }
  return out;
}

export function make(country: CountryId, chapter = 1, nonceOverride?: string): string {
  if (!['LB', 'EG', 'IQ', 'KR', 'FR'].includes(country) || chapter !== 1) {
    throw new RangeError('Unknown country or unsupported chapter.');
  }
  const nonce = nonceOverride ?? Array.from({ length: 4 }, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
  if (!/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/.test(nonce)) {
    throw new RangeError('Nonce must contain four uppercase stamp alphabet characters.');
  }
  return `MV-${country}${chapter}-${nonce}-${computeChecksum(`${country}${chapter}`, nonce)}`;
}

export function verify(code: string): Verification {
  if (typeof code !== 'string') return { valid: false };
  const normalized = code.trim().toUpperCase();
  const match = /^MV-(LB|EG|IQ|KR|FR)(1)-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})$/.exec(normalized);
  if (!match) return { valid: false };
  const [, country, chapter, nonce, checksum] = match;
  if (computeChecksum(`${country}${chapter}`, nonce) !== checksum) return { valid: false };
  return { valid: true, code: normalized, country: country as CountryId, chapter: Number(chapter), nonce, checksum };
}

export const GOLDEN_VECTORS = [
  { country: 'LB', chapter: 1, nonce: '2345', checksum: 'HBWS', code: 'MV-LB1-2345-HBWS' },
  { country: 'EG', chapter: 1, nonce: '6789', checksum: 'DEBH', code: 'MV-EG1-6789-DEBH' },
  { country: 'IQ', chapter: 1, nonce: 'ABCD', checksum: '9BN3', code: 'MV-IQ1-ABCD-9BN3' },
  { country: 'KR', chapter: 1, nonce: 'EFGH', checksum: 'YCMA', code: 'MV-KR1-EFGH-YCMA' },
  { country: 'FR', chapter: 1, nonce: 'JKMN', checksum: 'B5H4', code: 'MV-FR1-JKMN-B5H4' },
] as const;

/** Revalidate stored codes; never trust persisted record metadata. */
export function loadStamps(): StampRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { parsed = []; }
    const stamps: StampRecord[] = [];
    for (const entry of Array.isArray(parsed) ? parsed : []) {
      if (!entry || typeof entry !== 'object' || typeof entry.code !== 'string') continue;
      const result = verify(entry.code);
      if (!result.valid || stamps.some(s => s.country === result.country && s.chapter === result.chapter)) continue;
      const { valid: _valid, ...stamp } = result;
      if (typeof entry.earnedAt === 'string' && Number.isFinite(Date.parse(entry.earnedAt))) stamp.earnedAt = entry.earnedAt;
      stamps.push(stamp);
    }
    const repaired = JSON.stringify(stamps);
    if (repaired !== raw) {
      try { localStorage.setItem(STORAGE_KEY, repaired); } catch { /* Valid records remain readable when storage is full. */ }
    }
    return stamps;
  } catch { return []; }
}

/** False means invalid, already collected, or browser storage is unavailable. */
export function saveStamp(code: string): boolean {
  const result = verify(code);
  if (!result.valid) return false;
  const stamps = loadStamps();
  if (stamps.some(s => s.country === result.country && s.chapter === result.chapter)) return false;
  const { valid: _valid, ...stamp } = result;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...stamps, { ...stamp, earnedAt: new Date().toISOString() }]));
    return true;
  } catch { return false; }
}

export function clearStamps(): boolean {
  try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
