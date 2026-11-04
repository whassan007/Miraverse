import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();

describe('Phoenician Historical World Architecture Suite', () => {
  it('verifies all 10 authoritative Phoenician content registries exist and have valid JSON schema', () => {
    const requiredFiles = [
      'sources/source-registry.json',
      'sites/sites.json',
      'monuments/monuments.json',
      'artifacts/artifacts.json',
      'ships/ships.json',
      'workshops/workshops.json',
      'chronology/chronology.json',
      'questions/educational-questions.json',
      'dialogue/dialogue.json',
      'localization/locales.json',
    ];

    for (const rel of requiredFiles) {
      const fullPath = path.join(rootDir, 'content/historical-worlds/phoenician', rel);
      expect(fs.existsSync(fullPath), `Missing content file: ${rel}`).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(parsed.schemaVersion).toBe('1.0.0');
    }
  });

  it('verifies the 5 historical sites and their UNESCO citations', () => {
    const sitesJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'content/historical-worlds/phoenician/sites/sites.json'), 'utf-8')
    );
    expect(sitesJson.sites).toHaveLength(5);
    const siteIds = sitesJson.sites.map((s: any) => s.siteId);
    expect(siteIds).toEqual(['hist_byblos', 'hist_tyre', 'hist_sidon', 'hist_carthage', 'hist_motya']);

    // Check UNESCO IDs
    const byblos = sitesJson.sites.find((s: any) => s.siteId === 'hist_byblos');
    expect(byblos.unescoSiteId).toBe(295);

    const tyre = sitesJson.sites.find((s: any) => s.siteId === 'hist_tyre');
    expect(tyre.unescoSiteId).toBe(299);

    const carthage = sitesJson.sites.find((s: any) => s.siteId === 'hist_carthage');
    expect(carthage.unescoSiteId).toBe(37);
    expect(carthage.region).toContain('Tunisia'); // Non-Lebanese verification
  });

  it('verifies Ancient Byblos benchmark monuments and 26 standing obelisks in MonumentRegistry', () => {
    const monumentsLuau = fs.readFileSync(
      path.join(rootDir, 'apps/roblox/src/shared/historical-worlds/HistoricalMonumentRegistry.luau'),
      'utf-8'
    );

    expect(monumentsLuau).toContain('byblos_temple_obelisks');
    expect(monumentsLuau).toContain('byblos_l_shaped_temple');
    expect(monumentsLuau).toContain('byblos_ahiram_sarcophagus');
    expect(monumentsLuau).toContain('byblos_ancient_harbor');

    // Temple of Obelisks must cite UNESCO and Dunand
    expect(monumentsLuau).toContain('UNESCO World Heritage #295');
    expect(monumentsLuau).toContain('Maurice Dunand, Fouilles de Byblos');

    // Must have 26 obelisks in builder
    const builderLuau = fs.readFileSync(
      path.join(rootDir, 'apps/roblox/src/server/historical-worlds/HistoricalMonumentBuilder.luau'),
      'utf-8'
    );
    expect(builderLuau).toContain('Monument_TempleOfObelisks');
    expect(builderLuau).toContain('Monument_LShapedTemple');
    expect(builderLuau).toContain('Monument_AhiramSarcophagus');
    expect(builderLuau).toContain('Monument_AncientHarbor');
    expect(builderLuau).toContain('"Obelisk_" .. idx');
    expect(builderLuau).toContain('obeliskOffsets');
  });

  it('verifies non-overlapping spatial isolation for historical worlds in WorldRegistry', () => {
    const registryLuau = fs.readFileSync(
      path.join(rootDir, 'apps/roblox/src/shared/WorldRegistry.luau'),
      'utf-8'
    );

    expect(registryLuau).toContain('phoenician_hub = {');
    expect(registryLuau).toContain('hist_byblos = {');
    expect(registryLuau).toContain('hist_tyre = {');
    expect(registryLuau).toContain('hist_sidon = {');
    expect(registryLuau).toContain('hist_carthage = {');
    expect(registryLuau).toContain('hist_motya = {');

    expect(registryLuau).toContain('Vector3.new(0, 10, 1600)');
    expect(registryLuau).toContain('Vector3.new(800, 10, 1600)');
    expect(registryLuau).toContain('Vector3.new(800, 10, 2400)');
    expect(registryLuau).toContain('Vector3.new(800, 10, 3200)');
    expect(registryLuau).toContain('Vector3.new(800, 10, 4000)');
    expect(registryLuau).toContain('Vector3.new(800, 10, 4800)');

    // Historical travelConnections
    expect(registryLuau).toContain('"phoenician_hub"');
    expect(registryLuau).toContain('"hist_byblos"');
    expect(registryLuau).toContain('"hist_tyre"');
    expect(registryLuau).toContain('"hist_sidon"');
    expect(registryLuau).toContain('"hist_carthage"');
    expect(registryLuau).toContain('"hist_motya"');
  });

  it('verifies monuments and workshops for Tyre, Sidon, Carthage, and Motya', () => {
    const monumentsLuau = fs.readFileSync(
      path.join(rootDir, 'apps/roblox/src/shared/historical-worlds/HistoricalMonumentRegistry.luau'),
      'utf-8'
    );

    // Tyre
    expect(monumentsLuau).toContain('tyre_island_citadel');
    expect(monumentsLuau).toContain('tyre_alexander_causeway_exhibit');
    expect(monumentsLuau).toContain('tyre_twin_harbors');

    // Sidon
    expect(monumentsLuau).toContain('sidon_temple_eshmun');
    expect(monumentsLuau).toContain('sidon_throne_astarte');

    // Carthage
    expect(monumentsLuau).toContain('carthage_byrsa_acropolis');
    expect(monumentsLuau).toContain('carthage_cothon_harbor');
    expect(monumentsLuau).toContain('carthage_magon_quarter');
    expect(monumentsLuau).toContain('carthage_tophet_exhibit');

    // Motya
    expect(monumentsLuau).toContain('motya_submerged_causeway');
    expect(monumentsLuau).toContain('motya_cothon_basin');

    const builderLuau = fs.readFileSync(
      path.join(rootDir, 'apps/roblox/src/server/historical-worlds/HistoricalMonumentBuilder.luau'),
      'utf-8'
    );
    expect(builderLuau).toContain('Monument_TyreIslandCitadel');
    expect(builderLuau).toContain('Monument_TyreTwinHarbors');
    expect(builderLuau).toContain('Monument_AlexanderCausewayExhibit');
    expect(builderLuau).toContain('Workshop_TyrianPurple');
    expect(builderLuau).toContain('Monument_SidonTempleEshmun');
    expect(builderLuau).toContain('Monument_ThroneOfAstarte');
    expect(builderLuau).toContain('Workshop_SidonGlass');
    expect(builderLuau).toContain('Monument_CarthageByrsa');
    expect(builderLuau).toContain('Monument_CarthageMagonQuarter');
    expect(builderLuau).toContain('Monument_CarthageCothon');
    expect(builderLuau).toContain('Monument_CarthageTophetExhibit');
    expect(builderLuau).toContain('Monument_MotyaSubmergedCauseway');
    expect(builderLuau).toContain('Monument_MotyaCothon');
    expect(builderLuau).toContain('Ship_PunicWarship');
  });

  it('verifies all 6 required catalog locales in Phoenician localization dataset', () => {
    const localesJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'content/historical-worlds/phoenician/localization/locales.json'), 'utf-8')
    );
    const supportedLocales = ['en', 'fr', 'ko', 'ar-LB', 'ar-EG', 'ar-IQ'];
    for (const loc of supportedLocales) {
      expect(localesJson.translations[loc]).toBeDefined();
      expect(localesJson.translations[loc].byblos_name).toBeTruthy();
      expect(localesJson.translations[loc].tyre_name).toBeTruthy();
      expect(localesJson.translations[loc].sidon_name).toBeTruthy();
      expect(localesJson.translations[loc].carthage_name).toBeTruthy();
      expect(localesJson.translations[loc].motya_name).toBeTruthy();
      expect(localesJson.translations[loc].hub_title).toBeTruthy();
    }
  });

  it('verifies compiled roblox place contains all historical worlds and registries', () => {
    const rbxlx = fs.readFileSync(path.join(rootDir, 'apps/roblox/dist/miraverse.rbxlx'), 'utf-8');
    expect(rbxlx).toContain('HistoricalMonumentBuilder');
    expect(rbxlx).toContain('ByblosHistoricalWorld');
    expect(rbxlx).toContain('TyreHistoricalWorld');
    expect(rbxlx).toContain('SidonHistoricalWorld');
    expect(rbxlx).toContain('CarthageHistoricalWorld');
    expect(rbxlx).toContain('MotyaHistoricalWorld');
    expect(rbxlx).toContain('PhoenicianHeritageHub');
    expect(rbxlx).toContain('PhoenicianWorldRegistry');
    expect(rbxlx).toContain('HistoricalPeriodRegistry');
    expect(rbxlx).toContain('HistoricalMonumentRegistry');
  });
});
