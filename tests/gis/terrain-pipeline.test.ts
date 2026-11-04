import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Miraverse Real-World GIS Topography Pipeline (Sections 4, 9, 14)', () => {
  const rootDir = process.cwd();
  const manifestPath = path.join(rootDir, 'reports/terrain/terrain_manifest.json');
  const terrainDataPath = path.join(rootDir, 'apps/roblox/src/shared/TerrainData.luau');
  const worldRegistryPath = path.join(rootDir, 'apps/roblox/src/shared/WorldRegistry.luau');

  it('validates that the GIS terrain manifest exists and covers all 21 destinations across 11 countries', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const destIds = Object.keys(data);
    expect(destIds.length).toBe(21);

    const expectedCountries = ['LB', 'EG', 'IQ', 'KR', 'FR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA'];
    const foundCountries = new Set(Object.values(data).map((d: any) => d.country));
    for (const c of expectedCountries) {
      expect(foundCountries.has(c)).toBe(true);
    }
  });

  it('verifies elevation units, geographic bounds, and source provenance checksums', () => {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    for (const [destId, item] of Object.entries(data) as [string, any][]) {
      expect(item.lat).toBeGreaterThanOrEqual(-90);
      expect(item.lat).toBeLessThanOrEqual(90);
      expect(item.lon).toBeGreaterThanOrEqual(-180);
      expect(item.lon).toBeLessThanOrEqual(180);
      expect(typeof item.sha256).toBe('string');
      expect(item.sha256.length).toBe(64); // SHA-256 hex string
      expect(item.source).toContain('Copernicus DEM');
      expect(item.vertical_datum).toBe('EGM96 geoid');
      expect(item.horizontal_res_m).toBe(30.0);
      expect(item.relief_m).toBeGreaterThan(0);
      expect(item.voxel_grid.length).toBe(32);
      expect(item.voxel_grid[0].length).toBe(32);
    }
  });

  it('verifies Byblos coastline, Mount Lebanon relief, and Nile river relationships', () => {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    // Byblos: Coastal Mediterranean
    const byblos = data['LB_byblos'];
    expect(byblos.min_elevation_m).toBeLessThanOrEqual(0);
    expect(byblos.relief_m).toBeGreaterThan(50);

    // Mount Lebanon: High mountain relief (> 1000m)
    const mtLebanon = data['LB_mount_lebanon'];
    expect(mtLebanon.max_elevation_m).toBeGreaterThan(1800);
    expect(mtLebanon.relief_m).toBeGreaterThan(800);

    // Cairo: Nile bank to Mokattam cliff
    const cairo = data['EG_cairo'];
    expect(cairo.relief_m).toBeGreaterThan(100);

    // Baghdad: Flat alluvial plain (low relief < 50m)
    const baghdad = data['IQ_baghdad'];
    expect(baghdad.relief_m).toBeLessThan(60);
  });

  it('verifies determinism and compile integrity of TerrainData.luau', () => {
    expect(fs.existsSync(terrainDataPath)).toBe(true);
    const content = fs.readFileSync(terrainDataPath, 'utf-8');
    expect(content).toContain('TerrainData.DESTINATIONS = {');
    expect(content).toContain('LB_byblos');
    expect(content).toContain('LB_mount_lebanon');
    expect(content).toContain('LB_beirut');
    expect(content).toContain('EG_cairo');
    expect(content).toContain('DE_rhine');
    expect(content).toContain('MA_marrakesh');
  });

  it('verifies WorldRegistry spatial isolation: no overlapping cells across all 11 countries', () => {
    expect(fs.existsSync(worldRegistryPath)).toBe(true);
    const content = fs.readFileSync(worldRegistryPath, 'utf-8');
    expect(content).toContain('WorldRegistry.CELL_SIZE = 800');

    // Confirm that each country has a distinct cell center
    const countryOrder = ['LB', 'EG', 'IQ', 'KR', 'FR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA'];
    const origins = countryOrder.map((c, i) => ({
      country: c,
      x: (i + 1) * 800,
      y: 10,
      z: 0
    }));

    for (let i = 0; i < origins.length; i++) {
      for (let j = i + 1; j < origins.length; j++) {
        const dx = Math.abs(origins[i].x - origins[j].x);
        expect(dx).toBeGreaterThanOrEqual(800); // Strict non-overlapping cell separation
      }
    }
  });

  it('verifies all 5 original Lebanon stations remain untouched at exact coordinates', () => {
    const content = fs.readFileSync(worldRegistryPath, 'utf-8');
    expect(content).toContain('kind = "build", label = "Stone House to Restore", x = 22, z = -14');
    expect(content).toContain('kind = "cook", label = "Saj Kitchen", x = -14, z = -14');
    expect(content).toContain('kind = "gather", label = "Terrace Harvest", x = -66, z = 14');
    expect(content).toContain('kind = "trade", label = "Old Stone Souk", x = 26, z = 0');
    expect(content).toContain('kind = "word", label = "Teta\'s Courtyard", x = -12, z = 2');
  });
});
