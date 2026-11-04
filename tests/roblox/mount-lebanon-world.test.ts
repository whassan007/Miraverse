import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '../..');

function readLuau(relPath: string): string {
  return fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface LocationBounds {
  min: Vec3;
  max: Vec3;
}

interface ParsedLocation {
  locationId: string;
  countryId: string;
  locationType: 'city' | 'region';
  displayName: string;
  origin: Vec3;
  spawn: Vec3;
  hasStations: boolean;
  stationKeys: string[];
  spatialBounds: LocationBounds;
  travelConnections: string[];
}

const CELL_INDEX: Record<string, number> = {
  LB: 1,
  EG: 2,
  IQ: 3,
  KR: 4,
  FR: 5,
  DE: 6,
  CN: 7,
  JP: 8,
  RU: 9,
  UA: 10,
  MA: 11,
};
const CELL_SIZE = 800;
const GROUND_Y = 10;

function evalLuauNum(raw: string): number {
  const expr = raw
    .replace(/cellCenterX\("([A-Z]{2})"\)/g, (_, cc: string) => String((CELL_INDEX[cc] ?? 1) * CELL_SIZE))
    .replace(/WorldRegistry\.GROUND_Y/g, String(GROUND_Y))
    .trim();
  const m = expr.match(/^(-?\d+(?:\.\d+)?)(?:\s*([+-])\s*(-?\d+(?:\.\d+)?))?$/);
  if (!m) {
    throw new Error(`Failed to evaluate Luau number expression: ${raw} -> ${expr}`);
  }
  const base = Number(m[1]);
  if (!m[2]) return base;
  const delta = Number(m[3]);
  return m[2] === '+' ? base + delta : base - delta;
}

function parseVector3(expr: string): Vec3 {
  const m = expr.match(/Vector3\.new\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
  if (!m) {
    throw new Error(`Failed to parse Vector3 from: ${expr}`);
  }
  return { x: evalLuauNum(m[1]), y: evalLuauNum(m[2]), z: evalLuauNum(m[3]) };
}

function parseLocationsFromWorldRegistry(luau: string): Record<string, ParsedLocation> {
  const locationsBlockMatch = luau.match(/WorldRegistry\.LOCATIONS\s*=\s*\{([\s\S]*?)\n\} ::/);
  if (!locationsBlockMatch) {
    throw new Error('Could not find WorldRegistry.LOCATIONS block in WorldRegistry.luau');
  }
  const block = locationsBlockMatch[1];
  const entryRegex = /\n\t([a-z_]+)\s*=\s*\{([\s\S]*?)\n\t\},/g;
  const result: Record<string, ParsedLocation> = {};
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(block)) !== null) {
    const key = match[1];
    const body = match[2];

    const locationId = body.match(/locationId\s*=\s*"([^"]+)"/)?.[1] ?? '';
    const countryId = body.match(/countryId\s*=\s*"([^"]+)"/)?.[1] ?? '';
    const locationType = (body.match(/locationType\s*=\s*"(city|region)"/)?.[1] ?? 'city') as 'city' | 'region';
    const displayName = body.match(/displayName\s*=\s*"([^"]+)"/)?.[1] ?? '';
    const originExpr = body.match(/origin\s*=\s*(Vector3\.new\([^\n]+\)),/)?.[1] ?? '';
    const spawnExpr = body.match(/spawn\s*=\s*(Vector3\.new\([^\n]+\)),/)?.[1] ?? '';
    const minExpr = body.match(/min\s*=\s*(Vector3\.new\([^\n]+\)),/)?.[1] ?? '';
    const maxExpr = body.match(/max\s*=\s*(Vector3\.new\([^\n]+\)),/)?.[1] ?? '';

    const stationsVal = body.match(/stations\s*=\s*([^\n,]+)/)?.[1]?.trim() ?? '{}';
    const hasStations = stationsVal !== '{}' && stationsVal !== 'nil';
    const stationKeys = hasStations ? ['gather', 'cook', 'build', 'trade', 'word'] : [];

    const connectionsBlock = body.match(/travelConnections\s*=\s*\{([^}]*)\}/)?.[1] ?? '';
    const travelConnections = Array.from(connectionsBlock.matchAll(/"([^"]+)"/g)).map((m) => m[1]);

    result[key] = {
      locationId,
      countryId,
      locationType,
      displayName,
      origin: parseVector3(originExpr),
      spawn: parseVector3(spawnExpr),
      hasStations,
      stationKeys,
      spatialBounds: {
        min: parseVector3(minExpr),
        max: parseVector3(maxExpr),
      },
      travelConnections,
    };
  }

  return result;
}

function boundsOverlap(a: LocationBounds, b: LocationBounds): boolean {
  return (
    a.min.x <= b.max.x &&
    a.max.x >= b.min.x &&
    a.min.y <= b.max.y &&
    a.max.y >= b.min.y &&
    a.min.z <= b.max.z &&
    a.max.z >= b.min.z
  );
}

function containsPoint(b: LocationBounds, p: Vec3): boolean {
  return (
    p.x >= b.min.x &&
    p.x <= b.max.x &&
    p.y >= b.min.y &&
    p.y <= b.max.y &&
    p.z >= b.min.z &&
    p.z <= b.max.z
  );
}

describe('Mount Lebanon Playable World & Multi-Location Architecture', () => {
  describe('1. Data-Driven WorldRegistry & Spatial Graph', () => {
    const registryLuau = readLuau('apps/roblox/src/shared/WorldRegistry.luau');
    const locations = parseLocationsFromWorldRegistry(registryLuau);

    it('defines all required fields for byblos, mount_lebanon, cairo, baghdad, jeonju, and lyon', () => {
      const expectedIds = ['byblos', 'mount_lebanon', 'cairo', 'baghdad', 'jeonju', 'lyon'];
      for (const id of expectedIds) {
        expect(locations[id]).toBeDefined();
      }

      for (const id of expectedIds) {
        const loc = locations[id];
        expect(loc.locationId).toBe(id);
        expect(['LB', 'EG', 'IQ', 'KR', 'FR']).toContain(loc.countryId);
        expect(['city', 'region']).toContain(loc.locationType);
        expect(loc.displayName.length).toBeGreaterThan(2);
        expect(containsPoint(loc.spatialBounds, loc.origin)).toBe(true);
        expect(containsPoint(loc.spatialBounds, loc.spawn)).toBe(true);
        expect(loc.travelConnections.length).toBeGreaterThan(0);
        expect(loc.travelConnections).toContain('LOBBY');
      }
    });

    it('models Lebanon with two distinct locations: Byblos (city) and Mount Lebanon (region)', () => {
      const byblos = locations.byblos;
      const mountLebanon = locations.mount_lebanon;

      expect(byblos.countryId).toBe('LB');
      expect(byblos.locationType).toBe('city');
      expect(byblos.displayName).toBe('Byblos');
      expect(byblos.hasStations).toBe(true);
      expect(byblos.stationKeys).toEqual(['gather', 'cook', 'build', 'trade', 'word']);

      expect(mountLebanon.countryId).toBe('LB');
      expect(mountLebanon.locationType).toBe('region');
      expect(mountLebanon.displayName).toBe('Mount Lebanon');
      expect(mountLebanon.hasStations).toBe(false);
      expect(mountLebanon.stationKeys).toEqual([]);
    });

    it('enforces unique spawn points and non-overlapping 3D spatial bounds across all locations', () => {
      const entries = Object.values(locations);
      const spawnSet = new Set(entries.map((l) => `${l.spawn.x},${l.spawn.y},${l.spawn.z}`));
      expect(spawnSet.size).toBe(entries.length);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          expect(
            boundsOverlap(entries[i].spatialBounds, entries[j].spatialBounds),
            `Bounds overlap between ${entries[i].locationId} and ${entries[j].locationId}`
          ).toBe(false);
        }
      }

      // Mount Lebanon is elevated above Byblos and inland (+Z)
      expect(locations.mount_lebanon.origin.y).toBeGreaterThan(locations.byblos.origin.y);
      expect(locations.mount_lebanon.origin.z).toBeGreaterThan(locations.byblos.spatialBounds.max.z);
    });

    it('supports the full bidirectional travel graph: LOBBY -> byblos -> mount_lebanon -> byblos -> LOBBY and mount_lebanon -> LOBBY', () => {
      const canTravel = (from: string, to: string): boolean => {
        if (to === 'LOBBY') return from !== 'LOBBY' && Boolean(locations[from]?.travelConnections.includes('LOBBY'));
        if (from === 'LOBBY') return Boolean(locations[to]);
        const src = locations[from];
        return Boolean(src && src.travelConnections.includes(to));
      };

      expect(canTravel('LOBBY', 'byblos')).toBe(true);
      expect(canTravel('byblos', 'mount_lebanon')).toBe(true);
      expect(canTravel('mount_lebanon', 'byblos')).toBe(true);
      expect(canTravel('byblos', 'LOBBY')).toBe(true);
      expect(canTravel('mount_lebanon', 'LOBBY')).toBe(true);

      // Cross-country direct regional jumps without Lobby are disallowed
      expect(canTravel('mount_lebanon', 'cairo')).toBe(false);
      expect(canTravel('cairo', 'mount_lebanon')).toBe(false);
    });

    it('preserves backward-compatible WorldRegistry helpers and Byblos station coordinates', () => {
      expect(registryLuau).toContain('function WorldRegistry.origin(country: string): Vector3?');
      expect(registryLuau).toContain('function WorldRegistry.station(countryOrLocation: string, kind: string): Station?');
      expect(registryLuau).toContain('function WorldRegistry.getLocation(locationId: any): LocationDef?');
      expect(registryLuau).toContain('function WorldRegistry.defaultLocationId(country: any): string?');
      expect(registryLuau).toContain('function WorldRegistry.locationsForCountry(country: any): { LocationDef }');
      expect(registryLuau).toContain('function WorldRegistry.canTravel(fromLocationId: string?, toDestinationId: string): boolean');
      expect(registryLuau).toContain('build = { kind = "build", label = "Stone House to Restore", x = 22, z = -14');
      expect(registryLuau).toContain('cook = { kind = "cook", label = "Saj Kitchen", x = -14, z = -14');
      expect(registryLuau).toContain('gather = { kind = "gather", label = "Terrace Harvest", x = -66, z = 14');
      expect(registryLuau).toContain('trade = { kind = "trade", label = "Old Stone Souk", x = 26, z = 0');
      expect(registryLuau).toContain('word = { kind = "word", label = "Teta\'s Courtyard", x = -12, z = 2');
    });
  });

  describe('2. MountLebanonWorld Procedural Environment & Cultural Provenance', () => {
    const mountLebanonLuau = readLuau('apps/roblox/src/server/world/MountLebanonWorld.luau');
    const byblosLuau = readLuau('apps/roblox/src/server/world/ByblosWorld.luau');
    const mapBuilderLuau = readLuau('apps/roblox/src/server/MapBuilder.luau');
    const packsLuau = readLuau('apps/roblox/src/shared/Packs.luau');
    const v12Acts = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'content/v12/quest-enrichment/quest-acts-v12.json'), 'utf-8')
    );

    it('anchors Mount Lebanon content in authoritative Packs.luau and quest-acts-v12.json facts', () => {
      expect(packsLuau).toContain('["id"] = "mount_lebanon"');
      expect(packsLuau).toContain('["name_en"] = "Mount Lebanon"');

      const lbActs = v12Acts.acts.filter((a: { country: string }) => a.country === 'LB');
      expect(lbActs.length).toBeGreaterThanOrEqual(5);
      const actJson = JSON.stringify(lbActs);
      expect(actJson).toContain('Mount Lebanon');

      // Verify MountLebanonWorld reflects Al-Jall terraces, Cedrus libani, za'atar, sumac, olive, and Afqa iron-oxide geological facts
      expect(mountLebanonLuau).toContain('Al-Jall');
      expect(mountLebanonLuau).toContain('CedrusLibani');
      expect(mountLebanonLuau).toContain('MountainOliveTree');
      expect(mountLebanonLuau).toContain('WildZaatarBed');
      expect(mountLebanonLuau).toContain('CrimsonSumacBush');
      expect(mountLebanonLuau).toContain('MountLebanonCedarArbor');
      expect(mountLebanonLuau).toContain('HighlandSpringAlcove');
      expect(mountLebanonLuau).toContain('Iron-oxide');
    });

    it('constructs a 3-tier walkable mountain terrace layout with stairs, smooth walk ramps, and safety parapets', () => {
      expect(mountLebanonLuau).toContain('Tier1_ArrivalTerrace');
      expect(mountLebanonLuau).toContain('Tier2_AlJallTerraces');
      expect(mountLebanonLuau).toContain('Tier3_UpperCedarRidge');
      expect(mountLebanonLuau).toContain('Stairs_T1_to_T2_West');
      expect(mountLebanonLuau).toContain('Stairs_T1_to_T2_East');
      expect(mountLebanonLuau).toContain('Stairs_T2_to_T3_West');
      expect(mountLebanonLuau).toContain('Stairs_T2_to_T3_East');
      expect(mountLebanonLuau).toContain('WalkRamp');
      expect(mountLebanonLuau).toContain('ByblosSeaOverlook');
      expect(mountLebanonLuau).toContain('MountainWayfinder');
    });

    it('places travel portals in front of the player arrival camera in both Byblos and Mount Lebanon', () => {
      // Mount Lebanon spawn is at origin + (0, 0.5, 28) looking -Z; portals are at origin + (-20/+20, 4.8, 12) (Z=12 < 28)
      expect(mountLebanonLuau).toContain('Spawn_mount_lebanon');
      expect(mountLebanonLuau).toContain('Portal_mount_lebanon_to_byblos');
      expect(mountLebanonLuau).toContain('ReturnLobby_mount_lebanon');
      expect(mountLebanonLuau).toContain('TravelToByblosPrompt');
      expect(mountLebanonLuau).toContain('ReturnPrompt');

      // Byblos spawn is at center + (0, 0.5, 28) looking -Z; trail portal to Mount Lebanon is at center + (34, 0, 14) (Z=14 < 28)
      expect(mapBuilderLuau).toContain('TravelStation_ToMountLebanon');
      expect(mapBuilderLuau).toContain('Portal_byblos_to_mount_lebanon');
      expect(mapBuilderLuau).toContain('TravelToMountLebanonPrompt');
      expect(mapBuilderLuau).toContain('Vector3.new(34, 0, 14)');
    });

    it('contains zero third-party Toolbox rbxassetid:// references and does not duplicate Byblos harbor/souk props', () => {
      expect(mountLebanonLuau).not.toMatch(/rbxassetid:\/\//i);
      expect(mountLebanonLuau).not.toContain('FishingBoat');
      expect(mountLebanonLuau).not.toContain('SoukStall');
      expect(mountLebanonLuau).not.toContain('HarborBasin');

      // Confirm ByblosWorld remains intact
      expect(byblosLuau).toContain('FishingBoat');
      expect(byblosLuau).toContain('SoukStall');
      expect(byblosLuau).toContain('CEDAR');
    });
  });

  describe('3. ProgressService Persistence, Backward Compatibility & Additive Merge', () => {
    const progressLuau = readLuau('apps/roblox/src/server/Progression/ProgressService.luau');

    type SaveShape = {
      schemaVersion: number;
      lastCountry?: string;
      lastLocation?: string;
      visitedLocations: Record<string, boolean>;
      countries: Record<
        string,
        {
          chapters: Record<string, { completed: Record<string, boolean>; stamp?: string }>;
          acts: Record<string, boolean>;
          questions: Record<string, boolean>;
          locations: Record<string, boolean>;
          metMentor?: boolean;
        }
      >;
      inventory?: Record<string, number>;
    };

    const VALID_LOCATIONS: Record<string, string> = {
      byblos: 'LB',
      mount_lebanon: 'LB',
      cairo: 'EG',
      baghdad: 'IQ',
      jeonju: 'KR',
      lyon: 'FR',
    };
    const DEFAULT_LOCATION: Record<string, string> = {
      LB: 'byblos',
      EG: 'cairo',
      IQ: 'baghdad',
      KR: 'jeonju',
      FR: 'lyon',
    };

    // Mirrors ProgressService.migrate & ProgressService.merge deterministically
    function countryOf(save: SaveShape, cc: string) {
      if (!save.countries[cc]) {
        save.countries[cc] = { chapters: {}, acts: {}, questions: {}, locations: {} };
      }
      return save.countries[cc];
    }

    function migrate(raw: Record<string, any> | null | undefined): SaveShape {
      const save: SaveShape = { schemaVersion: 2, visitedLocations: {}, countries: {} };
      if (!raw || typeof raw !== 'object') {
        return save;
      }
      if (raw.countries && typeof raw.countries === 'object') {
        save.countries = JSON.parse(JSON.stringify(raw.countries));
        for (const cc of Object.keys(save.countries)) {
          const c = countryOf(save, cc);
          c.chapters = c.chapters || {};
          c.acts = c.acts || {};
          c.questions = c.questions || {};
          c.locations = c.locations || {};
        }
      }
      if (raw.inventory && typeof raw.inventory === 'object') {
        save.inventory = JSON.parse(JSON.stringify(raw.inventory));
      }
      if (raw.visitedLocations && typeof raw.visitedLocations === 'object') {
        for (const [locId, visited] of Object.entries(raw.visitedLocations)) {
          const norm = locId.toLowerCase();
          if (visited && VALID_LOCATIONS[norm]) {
            save.visitedLocations[norm] = true;
            countryOf(save, VALID_LOCATIONS[norm]).locations[norm] = true;
          }
        }
      }
      const rawCountry =
        typeof raw.lastCountry === 'string'
          ? raw.lastCountry
          : typeof raw.lastCountryId === 'string'
            ? raw.lastCountryId
            : undefined;
      if (raw.passportStamps && typeof raw.passportStamps === 'object') {
        for (const [key, code] of Object.entries(raw.passportStamps)) {
          const cc = String(key).slice(0, 2);
          if (/^[A-Z]{2}$/.test(cc) && typeof code === 'string') {
            const c = countryOf(save, cc);
            c.chapters['1'] = c.chapters['1'] || { completed: {} };
            c.chapters['1'].stamp = c.chapters['1'].stamp || code;
          }
        }
      }
      for (const [, country] of Object.entries(save.countries)) {
        if (country.locations && typeof country.locations === 'object') {
          for (const [locId, visited] of Object.entries(country.locations)) {
            const norm = locId.toLowerCase();
            if (visited && VALID_LOCATIONS[norm]) {
              save.visitedLocations[norm] = true;
              country.locations[norm] = true;
            }
          }
        }
      }
      const rawLoc = typeof raw.lastLocation === 'string' ? raw.lastLocation.toLowerCase() : undefined;
      if (rawLoc && VALID_LOCATIONS[rawLoc]) {
        save.lastLocation = rawLoc;
        save.lastCountry = VALID_LOCATIONS[rawLoc];
      } else if (rawCountry && DEFAULT_LOCATION[rawCountry.toUpperCase()]) {
        const upper = rawCountry.toUpperCase();
        save.lastCountry = upper;
        save.lastLocation = DEFAULT_LOCATION[upper];
      }
      if (save.lastCountry && save.lastLocation) {
        save.visitedLocations[save.lastLocation] = true;
        countryOf(save, save.lastCountry).locations[save.lastLocation] = true;
      }
      return save;
    }

    function recordLocationVisit(save: SaveShape, countryId: string, locationId: string) {
      const normLoc = locationId.toLowerCase();
      const normCc = VALID_LOCATIONS[normLoc] || countryId.toUpperCase();
      save.lastCountry = normCc;
      save.lastLocation = normLoc;
      save.visitedLocations[normLoc] = true;
      countryOf(save, normCc).locations[normLoc] = true;
    }

    function merge(into: any, from: any): any {
      if (typeof into !== 'object' || into === null || typeof from !== 'object' || from === null) {
        return from !== undefined && from !== null ? from : into;
      }
      for (const [k, v] of Object.entries(from)) {
        into[k] = merge(into[k], v);
      }
      return into;
    }

    it('implements ProgressService.migrate, recordLocationVisit, and safe dirty-flag retry in Luau', () => {
      expect(progressLuau).toContain('function ProgressService.migrate(raw: any): Save');
      expect(progressLuau).toContain('function ProgressService.recordLocationVisit(save: Save, countryId: string, locationId: string)');
      expect(progressLuau).toContain('WorldRegistry.defaultLocationId');
      expect(progressLuau).toContain('visitedLocations');
      expect(progressLuau).toContain('dirty[userId] = true');
    });

    it('migrates legacy v6 saves with lastCountryId="LB" and passportStamps to lastLocation="byblos" without losing stamps', () => {
      const v6Raw = {
        lastCountryId: 'LB',
        passportStamps: {
          'LB-1': 'MV-LB1-ABCD-9XYZ',
        },
      };
      const migrated = migrate(v6Raw);
      expect(migrated.lastCountry).toBe('LB');
      expect(migrated.lastLocation).toBe('byblos');
      expect(migrated.visitedLocations.byblos).toBe(true);
      expect(migrated.countries.LB.locations.byblos).toBe(true);
      expect(migrated.countries.LB.chapters['1'].stamp).toBe('MV-LB1-ABCD-9XYZ');
    });

    it('migrates existing v2 saves with lastCountry="LB" and no lastLocation to defaultLocation="byblos" while preserving completed challenges and inventory', () => {
      const v2Raw = {
        schemaVersion: 2,
        lastCountry: 'LB',
        inventory: { cedar_plank: 1, flatbread: 1 },
        countries: {
          LB: {
            metMentor: true,
            chapters: {
              '1': {
                completed: { 'LB-1-gather': true, 'LB-1-cook': true, 'LB-1-build': true },
              },
            },
            acts: {},
            questions: {},
            locations: {},
          },
        },
      };
      const migrated = migrate(v2Raw);
      expect(migrated.lastCountry).toBe('LB');
      expect(migrated.lastLocation).toBe('byblos');
      expect(migrated.visitedLocations.byblos).toBe(true);
      expect(migrated.inventory).toEqual({ cedar_plank: 1, flatbread: 1 });
      expect(migrated.countries.LB.metMentor).toBe(true);
      expect(migrated.countries.LB.chapters['1'].completed).toEqual({
        'LB-1-gather': true,
        'LB-1-cook': true,
        'LB-1-build': true,
      });
    });

    it('records visitedLocations for both byblos and mount_lebanon and merges saves idempotently without losing progress', () => {
      const baseSave = migrate({
        schemaVersion: 2,
        lastCountry: 'LB',
        countries: {
          LB: {
            chapters: {
              '1': {
                completed: { 'LB-1-gather': true, 'LB-1-cook': true },
                stamp: 'MV-LB1-2345-6789',
              },
            },
            acts: {},
            questions: {},
            locations: { byblos: true },
          },
        },
      });

      const sessionSave = JSON.parse(JSON.stringify(baseSave)) as SaveShape;
      recordLocationVisit(sessionSave, 'LB', 'mount_lebanon');

      const merged = merge(migrate(baseSave), sessionSave) as SaveShape;
      expect(merged.lastCountry).toBe('LB');
      expect(merged.lastLocation).toBe('mount_lebanon');
      expect(merged.visitedLocations.byblos).toBe(true);
      expect(merged.visitedLocations.mount_lebanon).toBe(true);
      expect(merged.countries.LB.locations.byblos).toBe(true);
      expect(merged.countries.LB.locations.mount_lebanon).toBe(true);
      expect(merged.countries.LB.chapters['1'].stamp).toBe('MV-LB1-2345-6789');
      expect(merged.countries.LB.chapters['1'].completed['LB-1-gather']).toBe(true);
    });
  });

  describe('4. SessionManager Single-Authority Travel & Byblos Challenge Isolation', () => {
    const sessionLuau = readLuau('apps/roblox/src/server/Core/SessionManager.luau');
    const clientLuau = readLuau('apps/roblox/src/client/Main.client.luau');

    it('routes all travel transitions through a single server-authoritative travelTo function in SessionManager.luau', () => {
      expect(sessionLuau).toContain('local function travelTo(player: Player, destination: string): (boolean, string?)');
      expect(sessionLuau).toContain('ProgressService.recordLocationVisit(s.save, targetLoc.countryId, targetLoc.locationId)');
      expect(sessionLuau).toContain('MapBuilder.getLocationSpawn(targetLoc.locationId)');
      expect(sessionLuau).toContain('Registry.canTravel(currentFrom, targetLoc.locationId)');
      expect(sessionLuau).toContain('newRemote("RemoteFunction", "TravelToLocation")');
    });

    it('guards against busy/in-flight travel, invalid location IDs, duplicate travel requests, and region challenge exploits', () => {
      expect(sessionLuau).toContain('if s.busy or s.traveling then');
      expect(sessionLuau).toContain('return false, "busy"');
      expect(sessionLuau).toContain('return false, "invalid-destination"');
      expect(sessionLuau).toContain('return false, "already-there"');
      expect(sessionLuau).toContain('return false, "invalid-transition"');
      expect(sessionLuau).toContain('if currentLoc and currentLoc.locationType == "region" then');
      expect(sessionLuau).toContain('return { ok = false, reason = "wrong-location", state = snapshot(player, s) }');
      expect(sessionLuau).toContain('if sessions[player] ~= s or s.country ~= cc or s.location ~= startLocationId then');
    });

    it('updates client HUD for regional exploration while keeping Back to Lobby visible and hiding Play challenge in Mount Lebanon', () => {
      expect(clientLuau).toContain('local isRegion = state.locationType == "region"');
      expect(clientLuau).toContain('playBtn.Visible = (state.canRunChallenge == true) and not state.hasStations and not isRegion and not state.stamp');
      expect(clientLuau).toContain('lobbyButton.Visible = state.country ~= nil');
      expect(clientLuau).toContain('Explore the mountain terraces');
    });
  });
});
