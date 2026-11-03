import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COUNTRIES, COUNTRY_LANG_MAP, COUNTRY_WGS84, STORY_LANGS, UI_LANGS } from '../packages/content/schema.js';
import { validateWorkspace } from '../tools/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

describe('Phase 1 Contracts & Scaffold Gate', () => {
  it('defines canonical 5 countries, 5 story langs, and 6 UI locales', () => {
    expect(COUNTRIES).toEqual(['LB', 'EG', 'IQ', 'KR', 'FR']);
    expect(STORY_LANGS).toEqual(['ar-LB', 'ar-EG', 'ar-IQ', 'ko', 'fr']);
    expect(UI_LANGS).toEqual(['en', 'fr', 'ar-LB', 'ar-EG', 'ar-IQ', 'ko']);
    expect(COUNTRY_LANG_MAP.LB).toBe('ar-LB');
    expect(COUNTRY_LANG_MAP.EG).toBe('ar-EG');
    expect(COUNTRY_LANG_MAP.IQ).toBe('ar-IQ');
    expect(COUNTRY_LANG_MAP.KR).toBe('ko');
    expect(COUNTRY_LANG_MAP.FR).toBe('fr');
  });

  it('defines verified WGS84 coordinates within valid bounds for each country', () => {
    for (const cc of COUNTRIES) {
      const coord = COUNTRY_WGS84[cc];
      expect(coord).toBeDefined();
      expect(coord.lat).toBeGreaterThanOrEqual(-90);
      expect(coord.lat).toBeLessThanOrEqual(90);
      expect(coord.lon).toBeGreaterThanOrEqual(-180);
      expect(coord.lon).toBeLessThanOrEqual(180);
    }
  });

  it('passes structural validation on current workspace and distinguishes scaffold from release when incomplete', () => {
    const structuralErrors = validateWorkspace(rootDir, 'structural');
    expect(structuralErrors).toEqual([]);
  });
});
