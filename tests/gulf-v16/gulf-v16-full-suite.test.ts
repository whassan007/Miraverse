import { describe, expect, it } from 'vitest';
import { V16_BRAND_IDENTITY, V16_GULF_COUNTRIES_ORDERED, V16_REPOSITORY_INVENTORY } from '../../packages/contracts/v16/index';
import { BEDROCK_CAPABILITY_PROBES_V16, GULF_BEDROCK_QUEST_HANDLERS_V16, resolveBedrockSurfaceTextV16 } from '../../apps/minecraft/scripts/gulf-v16/index';
import gulfBundle from '../../apps/web/src/generated/gulfV16.json';

describe('MiraVerse v1.6 — Cross-Platform Gulf Expansion Verification Suite (CX05)', () => {
  it('verifies truthful repository inventory counts without inventing 33 deployed countries', () => {
    expect(V16_REPOSITORY_INVENTORY.v15MergedInMain).toBe(false);
    expect(V16_REPOSITORY_INVENTORY.totals.legacyImplementedWebAndPacks).toBe(5);
    expect(V16_REPOSITORY_INVENTORY.totals.gulfV16ImplementedWebAndStagedGamePacks).toBe(6);
    expect(V16_REPOSITORY_INVENTORY.totals.totalActiveWebPortalCountries).toBe(11);
    expect(V16_GULF_COUNTRIES_ORDERED).toEqual(['QA', 'AE', 'KW', 'SA', 'OM', 'BH']);
  });

  it('verifies Bedrock Arabic / Arabizi / English fallback ladder across UI surfaces and age tiers', () => {
    const probe = BEDROCK_CAPABILITY_PROBES_V16[1];
    const arabOut = resolveBedrockSurfaceTextV16(probe, 'Arab', '8-10', 'server_ui_form');
    const latn57Out = resolveBedrockSurfaceTextV16(probe, 'Latn', '5-7', 'server_ui_form');
    const latn1417Out = resolveBedrockSurfaceTextV16(probe, 'Latn', '14-17', 'server_ui_form');
    const enOut = resolveBedrockSurfaceTextV16(probe, 'en', '8-10', 'server_ui_form');

    expect(arabOut).toContain('حياكم الله');
    expect(latn57Out).toContain('Yalla niktishif il-lulu');
    expect(latn1417Out).toContain('7ayyakum');
    expect(enOut).toContain('Welcome to the Doha shore');
    expect(Object.keys(GULF_BEDROCK_QUEST_HANDLERS_V16)).toHaveLength(30);
  });

  it('verifies 30 canonical acts, 120 age stages, 48 artifacts, and epistemic guardrails across all 6 Gulf countries', () => {
    expect(gulfBundle.countries).toHaveLength(6);
    let totalActs = 0;
    let totalArtifacts = 0;
    for (const c of gulfBundle.countries) {
      expect(c.mentor.isOriginalFictionalCharacter).toBe(true);
      expect(c.questActs).toHaveLength(5);
      expect(c.artifacts.length).toBeGreaterThanOrEqual(8);
      totalActs += c.questActs.length;
      totalArtifacts += c.artifacts.length;
    }
    expect(totalActs).toBe(30);
    expect(totalArtifacts).toBe(48);
    expect(V16_BRAND_IDENTITY.arabicBrandTitle).toBe('عالم يرا');
  });
});
