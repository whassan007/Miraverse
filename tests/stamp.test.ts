import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALPHABET, SALT, GOLDEN_VECTORS, fnv1a32, computeChecksum, make, verify, loadStamps, saveStamp, clearStamps } from '../packages/shared/stamp';
import type { CountryId } from '../packages/content/schema';

// BigInt multiplication and modulo independently model unsigned 32-bit wrapping.
function referenceHash(input: string): number {
  let hash = BigInt('2166136261');
  for (const byte of new TextEncoder().encode(input)) {
    hash = ((hash ^ BigInt(byte)) * BigInt('16777619')) % BigInt('4294967296');
  }
  return Number(hash);
}
function referenceChecksum(countryChapter: string, nonce: string): string {
  const alphabet = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  const hash = referenceHash('miraverse-v0' + countryChapter + nonce);
  return [0, 1, 2, 3].map(power => alphabet[Math.floor(hash / (30 ** power)) % 30]).join('');
}

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn((key: string) => { values.delete(key); }),
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('stamp contract', () => {
  it('exports the frozen constants and all five countries', () => {
    expect(ALPHABET).toBe('23456789ABCDEFGHJKMNPQRSTVWXYZ');
    expect(ALPHABET.length).toBe(30);
    expect(SALT).toBe('miraverse-v0');
    expect(GOLDEN_VECTORS.map(v => v.country)).toEqual(['LB', 'EG', 'IQ', 'KR', 'FR']);
  });
  it.each(GOLDEN_VECTORS)('verifies independent golden vector $country', vector => {
    expect(referenceChecksum(vector.country + vector.chapter, vector.nonce)).toBe(vector.checksum);
    expect(computeChecksum(vector.country + vector.chapter, vector.nonce)).toBe(vector.checksum);
    expect(make(vector.country, vector.chapter, vector.nonce)).toBe(vector.code);
    expect(verify(vector.code)).toEqual({ valid: true, ...vector });
    expect(verify(` \n${vector.code.toLowerCase()}\t`)).toEqual({ valid: true, ...vector });
  });
  it.each(['', 'hello', 'é한글🙂', 'miraverse-v0LB12345'])('hashes UTF-8 %j', input => {
    expect(fnv1a32(input)).toBe(referenceHash(input));
  });
  it.each([
    '', 'MV-US1-2345-HBWS', 'MV-LB0-2345-HBWS', 'MV-LB01-2345-HBWS',
    'MV-LB2-2345-HBWS', 'MV-LB-1-2345-HBWS', 'MV-LB1-234-HBWS',
    'MV-LB1-23456-HBWS', 'MV-LB1-2345-HBW', 'MV-LB1-2345-HBWS-extra',
    'MV-LB1-2345-2BWS', 'MV-LB1-3345-HBWS', 'MV-LB1-23 5-HBWS',
    'MV-LB1-0345-HBWS', 'MV-LB1-I345-HBWS', 'MV-LB1-2345-HBWO',
  ])('rejects malformed or modified code %j', code => { expect(verify(code)).toEqual({ valid: false }); });
  it('rejects unsupported chapters even with a correct checksum', () => {
    for (const chapter of ['0', '01', '2', '999999999999999999999']) {
      expect(verify(`MV-LB${chapter}-2345-${referenceChecksum(`LB${chapter}`, '2345')}`).valid).toBe(false);
    }
  });
  it('handles non-string values at runtime', () => {
    for (const value of [null, undefined, {}, 12]) expect(verify(value as string).valid).toBe(false);
  });
  it('validates generation arguments and generates valid random nonces', () => {
    expect(() => make('US' as CountryId)).toThrow();
    for (const chapter of [0, 2, -1, 1.5, NaN]) expect(() => make('LB', chapter)).toThrow();
    for (const nonce of ['', '1234', 'abcd', 'ABCDE']) expect(() => make('LB', 1, nonce)).toThrow();
    for (const vector of GOLDEN_VECTORS) expect(verify(make(vector.country)).valid).toBe(true);
  });
});

describe('local passport storage', () => {
  it('starts empty and saves canonical validated records', () => {
    expect(loadStamps()).toEqual([]);
    expect(saveStamp(` ${GOLDEN_VECTORS[0].code.toLowerCase()} `)).toBe(true);
    expect(loadStamps()).toEqual([expect.objectContaining(GOLDEN_VECTORS[0])]);
    expect(JSON.parse(localStorage.getItem('mv.stamps')!)).toHaveLength(1);
  });
  it('rejects invalid codes without writing storage', () => {
    expect(saveStamp('invalid')).toBe(false);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it('rejects the same country and chapter even with a different nonce', () => {
    expect(saveStamp(GOLDEN_VECTORS[0].code)).toBe(true);
    expect(saveStamp(GOLDEN_VECTORS[0].code)).toBe(false);
    expect(saveStamp(make('LB', 1, 'ZZZZ'))).toBe(false);
    expect(saveStamp(GOLDEN_VECTORS[1].code)).toBe(true);
    expect(loadStamps()).toHaveLength(2);
  });
  it.each(['{', 'null', '{}', '42', '"bad"'])('recovers corrupt storage %j', raw => {
    localStorage.setItem('mv.stamps', raw);
    expect(loadStamps()).toEqual([]);
    expect(localStorage.getItem('mv.stamps')).toBe('[]');
    expect(saveStamp(GOLDEN_VECTORS[0].code)).toBe(true);
  });
  it('sanitizes mixed records, forged metadata, and duplicates', () => {
    localStorage.setItem('mv.stamps', JSON.stringify([
      null, 'bad', { code: 'invalid' }, { code: GOLDEN_VECTORS[0].code, country: 'FR', chapter: 99, earnedAt: 'bad' },
      { code: make('LB', 1, 'ZZZZ') }, { code: GOLDEN_VECTORS[1].code, earnedAt: '2026-01-01T00:00:00.000Z' },
    ]));
    expect(loadStamps()).toEqual([
      GOLDEN_VECTORS[0], { ...GOLDEN_VECTORS[1], earnedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(JSON.parse(localStorage.getItem('mv.stamps')!)).toEqual(loadStamps());
  });
  it('resets only passport storage and permits collecting again', () => {
    localStorage.setItem('other', 'preserve');
    saveStamp(GOLDEN_VECTORS[0].code);
    expect(clearStamps()).toBe(true);
    expect(localStorage.getItem('mv.stamps')).toBeNull();
    expect(localStorage.getItem('other')).toBe('preserve');
    expect(loadStamps()).toEqual([]);
    expect(saveStamp(GOLDEN_VECTORS[0].code)).toBe(true);
  });
  it('handles unavailable storage without crashing or claiming success', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadStamps()).toEqual([]);
    expect(saveStamp(GOLDEN_VECTORS[0].code)).toBe(false);
    expect(clearStamps()).toBe(false);
  });
  it('retains readable valid records when repair or saving exceeds quota', () => {
    localStorage.setItem('mv.stamps', JSON.stringify([{ code: GOLDEN_VECTORS[0].code }]));
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('Quota exceeded'); });
    expect(loadStamps()).toEqual([GOLDEN_VECTORS[0]]);
    expect(saveStamp(GOLDEN_VECTORS[1].code)).toBe(false);
  });
});
