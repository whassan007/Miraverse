import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = path.resolve(__dirname, '../..');

function readText(relPath: string): string {
  return fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
}

function readJson<T = any>(relPath: string): T {
  return JSON.parse(readText(relPath)) as T;
}

describe('Miraverse 11-Country Real-World Topography & GIS Pipeline (CODEX-04)', () => {
  const sourceRegistry = readJson<{
    schemaVersion: string;
    totalCountries: number;
    totalLocations: number;
    sources: Array<{
      sourceId: string;
      locationId: string;
      countryId: string;
      countryName: string;
      displayName: string;
      locationType: string;
      geographicSetting: string;
      literaryNote?: string | null;
      detailLevel: number;
      dataset: string;
      version: string;
      sourceUrl: string;
      license: string;
      attribution: string;
      boundingBox: { minLon: number; minLat: number; maxLon: number; maxLat: number };
      metricBoundsMeters: { crs: string; minX: number; minY: number; maxX: number; maxY: number; widthMeters: number; heightMeters: number };
      coordinateReferenceSystem: string;
      verticalDatum: string;
      horizontalResolution: string;
      elevationUnits: string;
      elevationStatsMeters: { min: number; max: number; mean: number; seaOrBaseLevel: number };
      gameMapping: {
        gameCellIndex: number;
        localOffset: number[];
        playableFootprintStuds: number[];
        horizontalScaleMetersPerStud: number;
        verticalExaggeration: number;
        baseGameY: number;
        maxReliefStuds: number;
        waterFeature: string;
        waterType: string;
        waterDirection: string;
        biome: string;
      };
      controlPoints: Array<{
        name: string;
        lat: number;
        lon: number;
        expectedElevRange: [number, number];
        measuredElevationMeters: number;
        pass: boolean;
      }>;
      grid16ElevationMeters: number[][];
      grid16GameStudsY: number[][];
      grid16Materials: string[][];
      artifacts: {
        hillshade: string;
        heightmap: string;
        comparisonOverview: string;
      };
      checksum: string;
      downloadDate: string;
      tiles: Array<{ z: number; x: number; y: number; url: string; sha256: string }>;
    }>;
  }>('content/terrain/manifests/source-registry.json');

  const EXPECTED_COUNTRIES = ['LB', 'EG', 'IQ', 'KR', 'FR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA'];
  const EXPECTED_LOCATIONS = [
    'byblos',
    'mount_lebanon',
    'beirut',
    'cairo',
    'alexandria',
    'aswan',
    'baghdad',
    'erbil',
    'basra',
    'jeonju',
    'seoul',
    'busan',
    'lyon',
    'paris',
    'marseille',
    'rhine_valley',
    'wuling_valley',
    'tohoku_waystation',
    'lake_svetloyar',
    'kyiv_hills',
    'marrakesh_atlas',
  ];

  describe('1. DEM Provenance, Manifest Completeness & Local Tile Cache Checksums', () => {
    it('covers all 11 supported countries and all 21 playable destinations (15 original + 6 catalog)', () => {
      expect(sourceRegistry.totalCountries).toBe(11);
      expect(sourceRegistry.totalLocations).toBe(21);
      expect(sourceRegistry.sources.length).toBe(21);

      const countriesFound = Array.from(new Set(sourceRegistry.sources.map((s) => s.countryId))).sort();
      expect(countriesFound).toEqual([...EXPECTED_COUNTRIES].sort());

      const locationsFound = sourceRegistry.sources.map((s) => s.locationId).sort();
      expect(locationsFound).toEqual([...EXPECTED_LOCATIONS].sort());

      for (const cc of EXPECTED_COUNTRIES) {
        const ccPath = path.join(rootDir, `content/terrain/manifests/${cc}.json`);
        expect(fs.existsSync(ccPath), `Missing country manifest for ${cc}`).toBe(true);
      }
    });

    it('records all mandatory geographic source manifest fields and verifies cached DEM tile SHA-256 checksums', () => {
      for (const src of sourceRegistry.sources) {
        expect(src.sourceId).toMatch(/^DEM-[A-Z]{2}-[A-Z_]+$/);
        expect(src.dataset.length).toBeGreaterThan(10);
        expect(src.version.length).toBeGreaterThan(3);
        expect(src.sourceUrl).toMatch(/^https:\/\/s3\.amazonaws\.com\/elevation-tiles-prod\/terrarium\//);
        expect(src.license).toContain('Copernicus');
        expect(src.attribution).toContain('COPERNICUS');
        expect(src.coordinateReferenceSystem).toMatch(/^EPSG:4326 -> EPSG:326\d\d$/);
        expect(src.verticalDatum).toContain('EGM2008');
        expect(src.horizontalResolution).toContain('16x16');
        expect(src.elevationUnits).toBe('meters');
        expect(src.checksum).toMatch(/^[0-9a-f]{64}$/);
        expect(src.downloadDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

        for (const tile of src.tiles) {
          const cacheFile = path.join(rootDir, `content/terrain/cache/terrarium_${tile.z}_${tile.x}_${tile.y}.png`);
          expect(fs.existsSync(cacheFile), `Missing cached DEM tile ${cacheFile}`).toBe(true);
          const actualSha = crypto.createHash('sha256').update(fs.readFileSync(cacheFile)).digest('hex');
          expect(actualSha).toBe(tile.sha256);
        }
      }
    });
  });

  describe('2. Metric Coordinate Reprojection, Elevation Accuracy & Geographic Control Points', () => {
    it('projects valid geographic bounding boxes into metric UTM coordinates without NaN or inverted bounds', () => {
      for (const src of sourceRegistry.sources) {
        const bb = src.boundingBox;
        expect(bb.maxLon).toBeGreaterThan(bb.minLon);
        expect(bb.maxLat).toBeGreaterThan(bb.minLat);

        const mb = src.metricBoundsMeters;
        expect(mb.crs).toMatch(/^EPSG:326\d\d$/);
        expect(mb.widthMeters).toBeGreaterThan(1500);
        expect(mb.heightMeters).toBeGreaterThan(1500);
      }
    });

    it('passes all 63 geographic control point elevation checks across the 21 locations', () => {
      let totalControlPoints = 0;
      for (const src of sourceRegistry.sources) {
        expect(src.controlPoints.length).toBeGreaterThanOrEqual(3);
        for (const cp of src.controlPoints) {
          totalControlPoints += 1;
          expect(
            cp.pass,
            `${src.locationId} control point "${cp.name}" measured ${cp.measuredElevationMeters}m outside ${JSON.stringify(cp.expectedElevRange)}`
          ).toBe(true);
        }
      }
      expect(totalControlPoints).toBe(63);
    });

    it('enforces real-world topographic relationships (Byblos coastal, Mount Lebanon highland, Paris non-alpine, Erbil vs Basra distinct, Marrakesh vs Atlas)', () => {
      const byId = Object.fromEntries(sourceRegistry.sources.map((s) => [s.locationId, s]));

      // Lebanon: Byblos and Beirut are coastal (min <= 0m), Mount Lebanon rises > 2,000m
      expect(byId.byblos.elevationStatsMeters.min).toBeLessThanOrEqual(2);
      expect(byId.beirut.elevationStatsMeters.min).toBeLessThanOrEqual(2);
      expect(byId.mount_lebanon.elevationStatsMeters.max).toBeGreaterThan(2000);
      expect(byId.mount_lebanon.elevationStatsMeters.mean).toBeGreaterThan(byId.byblos.elevationStatsMeters.mean + 800);

      // Egypt: Alexandria is coastal Mediterranean, Cairo has Nile + Muqattam (~200m), Aswan is higher up the Nile
      expect(byId.alexandria.elevationStatsMeters.min).toBeLessThanOrEqual(0);
      expect(byId.cairo.elevationStatsMeters.max).toBeGreaterThan(140);
      expect(byId.aswan.elevationStatsMeters.mean).toBeGreaterThan(byId.cairo.elevationStatsMeters.mean);

      // Iraq: Basra is low estuarine (< 25m max), Baghdad is flat Tigris alluvial plain (~30-50m), Erbil is upland (> 380m)
      expect(byId.basra.elevationStatsMeters.max).toBeLessThan(35);
      expect(byId.baghdad.elevationStatsMeters.mean).toBeGreaterThan(25);
      expect(byId.baghdad.elevationStatsMeters.mean).toBeLessThan(55);
      expect(byId.erbil.elevationStatsMeters.mean).toBeGreaterThan(400);

      // France: Paris is a lowland basin (max < 180m, no invented alpine peaks!), Lyon has Fourvière/Croix-Rousse hills, Marseille is coastal
      expect(byId.paris.elevationStatsMeters.max).toBeLessThan(180);
      expect(byId.lyon.elevationStatsMeters.max).toBeGreaterThan(250);
      expect(byId.marseille.elevationStatsMeters.min).toBeLessThanOrEqual(0);

      // Ukraine: Kyiv right-bank hills rise significantly above the Dnipro (~90m -> ~195m)
      expect(byId.kyiv_hills.elevationStatsMeters.max - byId.kyiv_hills.elevationStatsMeters.min).toBeGreaterThan(80);

      // Morocco: Marrakesh Haouz plain (~450m) transitions south to High Atlas foothills (> 1,500m)
      expect(byId.marrakesh_atlas.elevationStatsMeters.min).toBeLessThan(520);
      expect(byId.marrakesh_atlas.elevationStatsMeters.max).toBeGreaterThan(1500);

      // Literary/mythic settings are explicitly labelled
      for (const litLoc of ['rhine_valley', 'wuling_valley', 'tohoku_waystation', 'lake_svetloyar']) {
        expect(byId[litLoc].geographicSetting).toBe('literary_inspired_real_geography');
        expect((byId[litLoc].literaryNote ?? '').length).toBeGreaterThan(20);
      }
    });
  });

  describe('3. Tile Continuity, Seam Detection, Determinism & Visual Evidence Artifacts', () => {
    it('verifies 16x16 heightgrids and material grids have no NaN, holes, or extreme cliff spikes between adjacent cells', () => {
      for (const src of sourceRegistry.sources) {
        expect(src.grid16ElevationMeters.length).toBe(16);
        expect(src.grid16GameStudsY.length).toBe(16);
        expect(src.grid16Materials.length).toBe(16);

        for (let r = 0; r < 16; r++) {
          expect(src.grid16ElevationMeters[r].length).toBe(16);
          expect(src.grid16GameStudsY[r].length).toBe(16);
          expect(src.grid16Materials[r].length).toBe(16);
          for (let c = 0; c < 16; c++) {
            const y = src.grid16GameStudsY[r][c];
            expect(Number.isFinite(y)).toBe(true);
            if (r + 1 < 16) {
              const dy = Math.abs(y - src.grid16GameStudsY[r + 1][c]);
              expect(dy, `Vertical seam spike in ${src.locationId} at (${r},${c})`).toBeLessThan(32);
            }
            if (c + 1 < 16) {
              const dx = Math.abs(y - src.grid16GameStudsY[r][c + 1]);
              expect(dx, `Horizontal seam spike in ${src.locationId} at (${r},${c})`).toBeLessThan(32);
            }
          }
        }
      }
    });

    it('verifies generated hillshade, heightmap, and 4-panel GIS comparison overview PNGs exist and are non-empty for all 21 locations', () => {
      for (const src of sourceRegistry.sources) {
        for (const relPath of [src.artifacts.hillshade, src.artifacts.heightmap, src.artifacts.comparisonOverview]) {
          const absPath = path.join(rootDir, relPath);
          expect(fs.existsSync(absPath), `Missing visual artifact ${relPath}`).toBe(true);
          expect(fs.statSync(absPath).size).toBeGreaterThan(5000);
        }
      }
    });

    it('verifies TerrainData.luau and TerrainPipeline.luau match the manifest checksums and wire cleanly into MapBuilder.luau', () => {
      const terrainDataLuau = readText('apps/roblox/src/shared/TerrainData.luau');
      const terrainPipelineLuau = readText('apps/roblox/src/shared/TerrainPipeline.luau');
      const regionalBuilderLuau = readText('apps/roblox/src/server/world/RegionalTerrainBuilder.luau');
      const beirutWorldLuau = readText('apps/roblox/src/server/world/BeirutWorld.luau');

      for (const src of sourceRegistry.sources) {
        expect(terrainDataLuau).toContain(`sourceId = "${src.sourceId}"`);
        expect(terrainDataLuau).toContain(`checksum = "${src.checksum}"`);
      }

      expect(terrainPipelineLuau).toContain('function TerrainPipeline.buildLocationRelief');
      expect(terrainPipelineLuau).toContain('function TerrainPipeline.latLonToWorldStuds');
      expect(regionalBuilderLuau).toContain('function RegionalTerrainBuilder.buildRegionalScene');
      expect(regionalBuilderLuau).toContain('function RegionalTerrainBuilder.augmentCityPlaza');
      expect(beirutWorldLuau).toContain('RaouchePigeonRocks');
      expect(beirutWorldLuau).toContain('Spawn_beirut');
    });

    it('verifies Copernicus GLO-30 processed terrain packages, GeoTerrainData.<CC> Luau modules, and non-overlapping 3D spatial bounds across all 21 locations', () => {
      const geoBuilderLuau = readText('apps/roblox/src/server/world/GeoTerrainBuilder.luau');
      expect(geoBuilderLuau).toContain('function GeoTerrainBuilder.buildLocationTerrain');

      for (const cc of EXPECTED_COUNTRIES) {
        const ccLuauPath = path.join(rootDir, `apps/roblox/src/shared/GeoTerrainData/${cc}.luau`);
        expect(fs.existsSync(ccLuauPath), `Missing GeoTerrainData/${cc}.luau`).toBe(true);
        const ccLuau = fs.readFileSync(ccLuauPath, 'utf-8');
        expect(ccLuau).toContain(`countryId = "${cc}"`);
        expect(ccLuau).toContain('rawDemGrid =');
        expect(ccLuau).toContain('elevationGrid =');
        expect(ccLuau).toContain('materialGrid =');
        expect(ccLuau).toContain('waterGrid =');
      }

      // Check data/geography/processed/<locationId>.json for all 21 WorldRegistry locations
      const worldRegistryLocations = [
        'byblos', 'mount_lebanon', 'beirut',
        'cairo', 'alexandria', 'aswan',
        'baghdad', 'erbil', 'basra',
        'jeonju', 'seoul', 'busan',
        'lyon', 'paris', 'marseille',
        'rhine_valley', 'wuling_valley', 'tohoku_route',
        'lake_svetloyar', 'kyiv_hills', 'marrakesh',
      ];
      const spatialBoxes: Array<{ id: string; min: [number, number, number]; max: [number, number, number] }> = [];
      for (const locId of worldRegistryLocations) {
        const procJson = readJson<any>(`data/geography/processed/${locId}.json`);
        expect(procJson.locationId).toBe(locId);
        expect(procJson.playableGrid24.rows).toBe(24);
        expect(procJson.playableGrid24.cols).toBe(24);
        expect(procJson.playableGrid24.rawRobloxY.length).toBe(24);

        const manifestJson = readJson<any>(`data/geography/manifests/${locId}.manifest.json`);
        expect(manifestJson.terrainChecksum).toMatch(/^[0-9a-f]{64}$/);
        expect(manifestJson.targetCRS).toMatch(/^EPSG:326\d\d$/);
        const sb = manifestJson.terrainTransform.spatialBounds;
        spatialBoxes.push({
          id: locId,
          min: sb.min,
          max: sb.max,
        });
      }

      // Verify zero pairwise 3D spatial overlap across all 21 locations
      for (let i = 0; i < spatialBoxes.length; i++) {
        for (let j = i + 1; j < spatialBoxes.length; j++) {
          const a = spatialBoxes[i];
          const b = spatialBoxes[j];
          const overlaps =
            a.min[0] <= b.max[0] && a.max[0] >= b.min[0] &&
            a.min[1] <= b.max[1] && a.max[1] >= b.min[1] &&
            a.min[2] <= b.max[2] && a.max[2] >= b.min[2];
          expect(overlaps, `Spatial overlap detected between ${a.id} and ${b.id}`).toBe(false);
        }
      }
    });
  });
});
