import { describe, expect, it } from 'vitest';
import gulfBundle from '../../../../apps/web/src/generated/gulfV16.json';

describe('MiraVerse v1.6 — Gulf Expansion Portal, 30 Quests, 120 Age Stages & Script Toggle E2E Contract (DX19)', () => {
  it('ships all 6 Gulf countries (QA, AE, KW, SA, OM, BH) and excludes Yemen (YE) as a future candidate', () => {
    expect(gulfBundle.countries.map((c: any) => c.countryCode)).toEqual(['QA', 'AE', 'KW', 'SA', 'OM', 'BH']);
    expect(gulfBundle.sixthAddedCountry).toBe('BH');
    expect(gulfBundle.excludedFutureCandidates).toEqual(['YE']);
  });

  it('distinguishes عالم يرا and Mira\'s World branding and provides 120 age-adapted localization records', () => {
    expect(gulfBundle.brand.arabic).toBe('عالم يرا');
    expect(gulfBundle.brand.english).toBe("Mira's World");
    expect(gulfBundle.localizationRecordsCount).toBe(120);
  });
});
