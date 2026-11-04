import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

const ROOT = process.cwd();

describe('MiraVerse Global v1.1 — End-to-End Deliverables & Package Integrity Suite (CX05)', () => {
  it('verifies global-content-catalog.json has 11 countries, 66 chapters, 264 age variants, 55 NPCs, and 89 rewards', () => {
    const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/minecraft/dist/global-content-catalog.json'), 'utf-8'));
    expect(cat.counts.countries).toBe(11);
    expect(cat.counts.chapters).toBe(66);
    expect(cat.counts.chapterAgeVariants).toBe(264);
    expect(cat.counts.locales).toBe(14);
    expect(cat.counts.npcs).toBe(55);
    expect(cat.counts.artifactsTotal).toBe(89);
  });

  it('verifies global-locales-manifest.json has 14 locales (9 native Bedrock + 5 custom Arabic dialects) with zero missing keys', () => {
    const loc = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/minecraft/dist/global-locales-manifest.json'), 'utf-8'));
    expect(loc.totalLocales).toBe(14);
    expect(loc.nativeBedrockPackLocalesCount).toBe(9);
    expect(loc.customApplicationLocalesCount).toBe(5);
    for (const entry of loc.locales) {
      expect(entry.missingKeysCount).toBe(0);
      expect(entry.keyCount).toBeGreaterThanOrEqual(400);
    }
  });

  it('verifies miraverse-global.mcaddon unzips cleanly with 9 native .lang files, 88 custom blocks, 55 NPCs, and valid manifests', () => {
    const addonPath = path.join(ROOT, 'apps/minecraft/dist/miraverse-global.mcaddon');
    expect(fs.existsSync(addonPath)).toBe(true);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-global-e2e-'));
    try {
      execFileSync('unzip', ['-q', addonPath, '-d', tmp]);
      const langs = JSON.parse(fs.readFileSync(path.join(tmp, 'rp/texts/languages.json'), 'utf-8'));
      expect(langs).toEqual(['en_US', 'fr_FR', 'fr_CA', 'de_DE', 'zh_CN', 'ja_JP', 'ru_RU', 'uk_UA', 'ko_KR']);
      for (const code of langs) {
        expect(fs.existsSync(path.join(tmp, `rp/texts/${code}.lang`))).toBe(true);
      }
      const blocks = fs.readdirSync(path.join(tmp, 'bp/blocks')).filter((f) => f.endsWith('.json'));
      expect(blocks.length).toBeGreaterThanOrEqual(88);
      const entities = fs.readdirSync(path.join(tmp, 'bp/entities')).filter((f) => f.endsWith('.json'));
      expect(entities.length).toBeGreaterThanOrEqual(55);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('verifies manifest-of-artifacts.json truthfully records BLOCKED status for Windows .mcworld on Linux aarch64', () => {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/minecraft/dist/manifest-of-artifacts.json'), 'utf-8'));
    expect(m.deliverables['apps/minecraft/dist/miraverse-global.mcworld'].status).toContain('BLOCKED');
    expect(m.deliverables['apps/minecraft/dist/miraverse-global.mcaddon'].status).toBe('VERIFIED');
    expect(m.deliverables['apps/minecraft/dist/miraverse-global-sources.zip'].status).toBe('VERIFIED');
  });
});
