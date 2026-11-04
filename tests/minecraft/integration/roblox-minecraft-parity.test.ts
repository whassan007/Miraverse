import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  MINECRAFT_ALL_COUNTRIES,
  MINECRAFT_COUNTRY_DESTINATIONS,
  MINECRAFT_GEO_DESTINATIONS,
  getMinecraftGeoDestination,
  canTravelMinecraft,
  buildDestinationTerrainOps,
  buildAll21DestinationsTerrainOps,
} from '../../../apps/minecraft/scripts/generated/geo-terrain.js';
import { MiraVerseGlobalRuntimeV11 } from '../../../apps/minecraft/scripts/src/bootstrap/index.js';
import { loadServerCommands } from '../../../tools/minecraft-server/deploy-mcp-world.mjs';

const ROOT = process.cwd();

describe('Roblox-to-Minecraft Full Parity Suite (11 Countries, 21 Real-World DEM Destinations)', () => {
  it('replicates all 11 countries and 21 real-world DEM destinations from Roblox WorldRegistry & TerrainData into Minecraft', () => {
    expect(MINECRAFT_ALL_COUNTRIES).toEqual(['LB', 'EG', 'IQ', 'KR', 'FR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA']);
    const destIds = Object.keys(MINECRAFT_GEO_DESTINATIONS);
    expect(destIds).toHaveLength(21);

    // Multi-location countries have 3 destinations each (5 x 3 = 15)
    for (const cc of ['LB', 'EG', 'IQ', 'KR', 'FR']) {
      expect(MINECRAFT_COUNTRY_DESTINATIONS[cc]).toHaveLength(3);
      for (const locId of MINECRAFT_COUNTRY_DESTINATIONS[cc]) {
        const dest = getMinecraftGeoDestination(locId);
        expect(dest).toBeDefined();
        expect(dest!.countryId).toBe(cc);
      }
    }

    // Literary & regional countries have 1 destination each (6 x 1 = 6)
    for (const cc of ['DE', 'CN', 'JP', 'RU', 'UA', 'MA']) {
      expect(MINECRAFT_COUNTRY_DESTINATIONS[cc]).toHaveLength(1);
      const locId = MINECRAFT_COUNTRY_DESTINATIONS[cc][0];
      const dest = getMinecraftGeoDestination(locId);
      expect(dest).toBeDefined();
      expect(dest!.countryId).toBe(cc);
    }
  });

  it('matches Copernicus GLO-30 / Mapzen DEM checksums, bounding boxes, and control points with source-registry.json', () => {
    const sourceReg = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'content/terrain/manifests/source-registry.json'), 'utf-8')
    );
    expect(sourceReg.sources).toHaveLength(21);

    for (const src of sourceReg.sources) {
      const mcDest = getMinecraftGeoDestination(src.locationId);
      expect(mcDest, `Missing Minecraft destination for ${src.locationId}`).toBeDefined();
      expect(mcDest!.checksum).toBe(src.checksum);
      expect(mcDest!.boundingBox).toEqual(src.boundingBox);
      expect(mcDest!.grid16ElevationMeters).toEqual(src.grid16ElevationMeters);
      expect(mcDest!.grid16BlockY).toHaveLength(16);
      expect(mcDest!.grid16BlockIds).toHaveLength(16);
      expect(mcDest!.landmarks.length).toBeGreaterThanOrEqual(3);
      expect(mcDest!.controlPoints.every((cp) => cp.pass)).toBe(true);
    }
  });

  it('enforces non-overlapping 3D spatial bounding boxes across all 21 Minecraft destinations', () => {
    const all = Object.values(MINECRAFT_GEO_DESTINATIONS);
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i].spatialBounds;
        const b = all[j].spatialBounds;
        const overlaps =
          a.min[0] <= b.max[0] &&
          a.max[0] >= b.min[0] &&
          a.min[1] <= b.max[1] &&
          a.max[1] >= b.min[1] &&
          a.min[2] <= b.max[2] &&
          a.max[2] >= b.min[2];
        expect(overlaps, `Overlap detected between ${all[i].locationId} and ${all[j].locationId}`).toBe(false);
      }
    }
  });

  it('replicates Roblox inter-city and Lobby travel graph in MiraVerseGlobalRuntimeV11', () => {
    const runtime = new MiraVerseGlobalRuntimeV11();
    const pid = 'mc_traveler_1';
    runtime.getOrCreatePlayer(pid, 'Ziad', 'ar-LB', '11-13');

    // Lobby -> Byblos -> Mount Lebanon -> Beirut -> Lobby
    const toByblos = runtime.travelToDestination(pid, 'byblos');
    expect(toByblos.ok).toBe(true);
    expect(toByblos.countryId).toBe('LB');

    const toMtLeb = runtime.travelToDestination(pid, 'mount_lebanon');
    expect(toMtLeb.ok).toBe(true);
    expect(toMtLeb.destinationId).toBe('mount_lebanon');

    const toBeirut = runtime.travelToDestination(pid, 'beirut');
    expect(toBeirut.ok).toBe(true);
    expect(toBeirut.destinationId).toBe('beirut');

    // Cannot jump directly from Beirut to Cairo without returning to LOBBY
    const invalidCrossCountry = runtime.travelToDestination(pid, 'cairo');
    expect(invalidCrossCountry.ok).toBe(false);
    expect(invalidCrossCountry.reason).toBe('TRAVEL_CONNECTION_NOT_AVAILABLE');

    const backToLobby = runtime.travelToDestination(pid, 'LOBBY');
    expect(backToLobby.ok).toBe(true);

    // Alias resolution works (tohoku_waystation -> tohoku_route, marrakesh_atlas -> marrakesh)
    expect(canTravelMinecraft('LOBBY', 'tohoku_waystation')).toBe(true);
    expect(canTravelMinecraft('LOBBY', 'marrakesh_atlas')).toBe(true);
  });

  it('generates valid voxel operations, server-commands.mcfunction, and embeds miraverse_terrain.mcfunction in miraverse-global.mcaddon', () => {
    const allStages = buildAll21DestinationsTerrainOps();
    expect(allStages).toHaveLength(21);
    for (const stage of allStages) {
      expect(stage.ops.length).toBeGreaterThanOrEqual(260); // 256 DEM cells + spawn + portal + landmarks
    }

    const byblosOps = buildDestinationTerrainOps('byblos');
    expect(byblosOps.some((op) => op.blockId === 'minecraft:water')).toBe(true);

    const commands = loadServerCommands();
    expect(commands.length).toBeGreaterThan(5400);

    const addonPath = path.join(ROOT, 'apps/minecraft/dist/miraverse-global.mcaddon');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-mc-terrain-check-'));
    try {
      execFileSync('unzip', ['-q', addonPath, '-d', tmp]);
      const fnFile = path.join(tmp, 'bp/functions/miraverse_terrain.mcfunction');
      expect(fs.existsSync(fnFile)).toBe(true);
      const fnContent = fs.readFileSync(fnFile, 'utf-8');
      expect(fnContent).toContain('[LB] Byblos (Jbeil)');
      expect(fnContent).toContain('[LB] Mount Lebanon');
      expect(fnContent).toContain('[LB] Beirut');
      expect(fnContent).toContain('[MA] Marrakesh Haouz Plain & High Atlas Foothills');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
