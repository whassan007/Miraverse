import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ObjectiveRegistry, QuestDirector } from '../../apps/minecraft/scripts/src/quests/index.js';
import {
  PHOENICIA,
  applyEvent,
  createState,
  parseState,
  snapshot,
} from '../../apps/minecraft/scripts/src/phoenicia/gate.js';
import { PhoeniciaFlow, type PhoeniciaHost } from '../../apps/minecraft/scripts/src/phoenicia/flow.js';
import { planRegion, regionOrigin, volumeOf } from '../../apps/minecraft/scripts/src/phoenicia/planner.js';

const vectors = JSON.parse(fs.readFileSync('tests/phoenicia/vectors.json', 'utf8'));
const quest = PHOENICIA.quests['TYR-05'];
const tyre = PHOENICIA.regions.tyre;
const byblos = PHOENICIA.regions.byblos;

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

describe('shared gate vectors (the same file runs on the Roblox side)', () => {
  for (const scenario of vectors.scenarios) {
    it(scenario.name, () => {
      const state = createState();
      for (const [event, expected] of scenario.steps) {
        const code = applyEvent(state, event);
        const { code: expectedCode, ...expectedSnapshot } = expected;
        expect(code).toBe(expectedCode);
        expect(snapshot(state)).toEqual(expectedSnapshot);
      }
    });
  }
});

function newWorld() {
  const world = {
    saved: undefined as string | undefined,
    saveCount: 0,
    pos: null as { region: string; x: number; z: number } | null,
    said: [] as string[],
    answers: [] as string[],
    voyages: 0,
    loadOk: true,
    saveOk: true,
  };
  const host: PhoeniciaHost = {
    load: () => (world.loadOk ? { ok: true, value: world.saved } : { ok: false }),
    save: (_, value) => {
      world.saveCount += 1;
      if (world.saveOk) world.saved = value;
      return world.saveOk;
    },
    position: () => world.pos,
    teleport: (_, region, point) => {
      world.pos = { region, x: point.x, z: point.z };
    },
    ask: async (_, request) => world.answers.shift() ?? request.options[0].id,
    say: (_, text) => void world.said.push(text),
    sail: async (_, from) => {
      if (from) world.voyages += 1;
    },
  };
  return { world, host };
}

describe('acceptance journey through the real flow', () => {
  it('Tyre market, sail, act at Byblos, sail back, reward, with a reconnect in the middle', async () => {
    const { world, host } = newWorld();
    const walk = (region: string, x: number, z: number) => void (world.pos = { region, x, z });
    const first = new PhoeniciaFlow(host);

    world.answers = ['en-US'];
    await first.enter('p');
    expect(world.pos).toEqual({ region: 'tyre', x: -20, z: -40 });
    expect(first.promptFor('p')).toBeNull();

    walk('tyre', -20, 4);
    world.answers = ['accept'];
    await first.interact('p');

    walk('tyre', -20, -42);
    world.answers = ['open_west', 'coast_port', 'coast_starboard'];
    await first.interact('p');
    expect(first.getState('p')?.chapter.attempts).toBe(2);
    expect(world.pos?.region).toBe('byblos');
    expect(world.voyages).toBe(1);

    first.leave('p');
    const second = new PhoeniciaFlow(host);
    await second.enter('p');
    expect(world.pos?.region).toBe('byblos');
    expect(snapshot(second.getState('p')!).completed).toHaveLength(2);

    walk('byblos', 8, 6);
    world.answers = ['green', 'seasoned'];
    await second.interact('p');

    walk('byblos', -14, 0);
    world.answers = ['coast_port'];
    await second.interact('p');
    expect(world.pos?.region).toBe('tyre');
    expect(world.voyages).toBe(2);

    walk('tyre', -20, 4);
    world.answers = ['commission'];
    await second.interact('p');
    const final = second.getState('p')!;
    expect(final.chapter.lifecycle).toBe('COMPLETED');
    expect(final.storySparks).toBe(50);
    expect(final.artifacts).toEqual(['ph_cedar_keel_token']);

    const third = new PhoeniciaFlow(host);
    await third.enter('p');
    expect(third.getState('p')?.chapter.lifecycle).toBe('COMPLETED');
    walk('tyre', -20, 4);
    expect(third.promptFor('p')).toBe(PHOENICIA.strings['prompt.codex']['en-US']);
    await third.interact('p');
    expect(third.getState('p')?.storySparks).toBe(50);
  });

  it('never overwrites the real save after a failed load', async () => {
    const { world, host } = newWorld();
    world.saved = 'real-save-sentinel';
    world.loadOk = false;
    const flow = new PhoeniciaFlow(host);
    world.answers = ['en-US'];
    await flow.enter('p');
    world.pos = { region: 'tyre', x: -20, z: 4 };
    world.answers = ['accept'];
    await flow.interact('p');
    expect(world.saveCount).toBe(0);
    expect(world.saved).toBe('real-save-sentinel');
  });

  it('warns and keeps playing when a save fails', async () => {
    const { world, host } = newWorld();
    world.saveOk = false;
    const flow = new PhoeniciaFlow(host);
    world.answers = ['en-US'];
    await flow.enter('p');
    expect(world.said).toContain(PHOENICIA.strings['ui.save_failed']['en-US']);
    world.pos = { region: 'tyre', x: -20, z: 4 };
    world.answers = ['accept'];
    await flow.interact('p');
    expect(snapshot(flow.getState('p')!).completed).toHaveLength(1);
  });

  it('rejects corrupt saves', () => {
    for (const raw of [5, 'not json', '{"schemaVersion":99}', '{"schemaVersion":1,"region":"tyre"}']) {
      expect(parseState(raw)).toBeNull();
    }
    expect(parseState(JSON.stringify(createState()))).not.toBeNull();
  });
});

describe('existing content is unaffected', () => {
  it('keeps the global catalog at 66 chapters and leaves its objects alone', () => {
    expect(ObjectiveRegistry.getAllChapters()).toHaveLength(66);
    expect(ObjectiveRegistry.getAllChapters().some((c) => c.id === 'TYR-05')).toBe(false);
    expect(Object.keys(QuestDirector.initializeChapterMap())).not.toContain('TYR-05');
  });

  it('keeps the feature off by default on both platforms', () => {
    const project = JSON.parse(fs.readFileSync('apps/roblox/default.project.json', 'utf8'));
    expect(JSON.stringify(project)).not.toContain('MV_PHOENICIA');
    expect(fs.readFileSync('apps/minecraft/build.mjs', 'utf8')).toContain("process.env.MV_PHOENICIA === '1'");
  });
});

describe('geographic checks', () => {
  it('places Tyre south of Byblos on the Lebanese coast at about the real distance', () => {
    for (const region of [tyre, byblos]) {
      expect(region.modernCountry).toBe('Lebanon');
      expect(region.geo.lat).toBeGreaterThan(33);
      expect(region.geo.lat).toBeLessThan(34.7);
      expect(region.geo.lon).toBeGreaterThan(35);
      expect(region.geo.lon).toBeLessThan(36.7);
    }
    expect(tyre.geo.lat).toBeLessThan(byblos.geo.lat);
    const km = haversineKm(tyre.geo, byblos.geo);
    expect(km).toBeGreaterThan(90);
    expect(km).toBeLessThan(115);
  });

  it('keeps the island separate from the mainland in the Golden Age', () => {
    let islandEast = -Infinity;
    let mainlandWest = Infinity;
    for (const row of tyre.landRows) {
      for (const [a, b] of row.spans) {
        if (a >= 50) mainlandWest = Math.min(mainlandWest, a);
        else islandEast = Math.max(islandEast, b);
      }
    }
    expect(mainlandWest - islandEast).toBeGreaterThan(20);
    expect(mainlandWest).toBeGreaterThan(islandEast);
  });

  it('has no causeway or land bridge across the channel', () => {
    const inChannel = (x: number) => x > 19 && x < 49;
    const crossing = tyre.boxes.filter((b: any) => inChannel(b.min[0]) || inChannel(b.max[0]));
    expect(crossing).toEqual([]);
    expect(JSON.stringify(tyre).toLowerCase()).not.toContain('causeway');
  });

  it('puts the northern harbor north of the island, reached through a wall gap', () => {
    const dock = tyre.boxes.find((b: any) => b.id === 'north_dock');
    expect(dock.district).toBe('sidonian_harbor');
    expect(dock.max[2]).toBeLessThanOrEqual(-32);
    const west = tyre.boxes.find((b: any) => b.id === 'wall_n_w');
    const east = tyre.boxes.find((b: any) => b.id === 'wall_n_e');
    expect(east.min[0] - west.max[0]).toBeGreaterThan(4);
    expect(dock.min[0]).toBeGreaterThan(west.max[0]);
    expect(dock.max[0]).toBeLessThan(east.min[0]);
  });

  it('keeps sailing directions true: north with the coast east on the right, south on the left', () => {
    const correct = (id: string) => quest.nodes.find((n: any) => n.id === id).options.find((o: any) => o.correct).id;
    expect(PHOENICIA.routes.tyre_to_byblos.bearing).toBe('north');
    expect(correct('TYR-05:sail_north')).toBe('coast_starboard');
    expect(PHOENICIA.routes.byblos_to_tyre.bearing).toBe('south');
    expect(correct('TYR-05:sail_south')).toBe('coast_port');
  });
});

describe('historical checks', () => {
  const text = JSON.stringify({ regions: PHOENICIA.regions, quests: PHOENICIA.quests, strings: PHOENICIA.strings }).toLowerCase();

  it('has no later Roman structures in the Golden Age', () => {
    for (const word of ['hippodrome', 'colonnade', 'roman bath', 'triumphal', 'basilica', 'causeway']) {
      expect(text).not.toContain(word);
    }
  });

  it('labels the League as fiction and never as a real government', () => {
    expect(PHOENICIA.league.classification).toBe('game_fiction');
    const entry = quest.codex.find((c: any) => c.id === 'league');
    expect(entry.classification).toBe('game_fiction');
    expect(PHOENICIA.strings[entry.textKey]['en-US']).toMatch(/invented/i);
  });

  it('labels Wenamun as tradition, and the uncertain south harbor as uncertain', () => {
    expect(quest.codex.find((c: any) => c.id === 'wenamun').classification).toBe('historical_tradition');
    expect(PHOENICIA.strings['codex.harbors']['en-US']).toMatch(/uncertain/);
  });

  it('cites only sources that were actually read', () => {
    const readable = new Set(
      PHOENICIA.sources.filter((s: any) => s.status === 'read' || s.status === 'partly_read').map((s: any) => s.id)
    );
    const cited = [
      ...quest.sourceIds,
      ...quest.codex.flatMap((c: any) => c.sourceIds),
      tyre.geo.sourceId,
      byblos.geo.sourceId,
      ...Object.values<any>(PHOENICIA.regions).flatMap((r) => r.land.map((l: any) => l.sourceId)),
    ];
    for (const id of cited) expect(readable.has(id), id).toBe(true);
  });

  it('only marks the implemented epoch as implemented', () => {
    expect(PHOENICIA.epochs.filter((e: any) => e.implemented).map((e: any) => e.id)).toEqual(['phoenician_golden_age']);
    expect(quest.epoch).toBe('phoenician_golden_age');
  });

  it('gives every NPC a classification', () => {
    for (const region of Object.values<any>(PHOENICIA.regions)) {
      for (const npc of region.npcs) expect(npc.classification).toBe('game_fiction');
    }
  });
});

describe('content integrity', () => {
  it('translates every string into all four locales', () => {
    for (const [key, entry] of Object.entries<any>(PHOENICIA.strings)) {
      for (const locale of Object.keys(PHOENICIA.locales)) {
        expect(entry[locale], `${key} ${locale}`).toBeTruthy();
      }
    }
  });

  it('resolves every string key the quest and regions use', () => {
    const keys = new Set<string>();
    JSON.stringify({ q: quest, r: PHOENICIA.regions }, (name, value) => {
      if (/Key$/.test(name) && typeof value === 'string') keys.add(value);
      return value;
    });
    expect(keys.size).toBeGreaterThan(10);
    for (const key of keys) expect(PHOENICIA.strings[key], key).toBeTruthy();
  });

  it('gives every wrong option feedback and every node one correct option', () => {
    for (const node of quest.nodes) {
      expect(node.options.filter((o: any) => o.correct)).toHaveLength(1);
      for (const option of node.options) if (!option.correct) expect(option.feedbackKey, option.id).toBeTruthy();
    }
  });

  it('places each objective anchor within reach of the player arrival logic', () => {
    for (const node of quest.nodes) {
      const region = PHOENICIA.regions[node.anchor.region];
      expect(Math.abs(node.anchor.x)).toBeLessThan(region.bounds);
      expect(Math.abs(node.anchor.z)).toBeLessThan(region.bounds);
    }
    const distance = (a: any, b: any) => Math.hypot(a.x - b.x, a.z - b.z);
    const sailSouth = quest.nodes.find((n: any) => n.id === 'TYR-05:sail_south').anchor;
    expect(distance(byblos.points.arrival, sailSouth)).toBeLessThanOrEqual(sailSouth.radius);
  });
});

describe('Minecraft world plan', () => {
  it('fits Bedrock limits for fills and ticking areas', () => {
    for (const id of Object.keys(PHOENICIA.regions)) {
      for (const op of planRegion(id)) expect(volumeOf(op)).toBeLessThanOrEqual(32768);
      // Bedrock allows a ticking area up to 100 chunks, counted on real chunk boundaries.
      const o = regionOrigin(id);
      const b = PHOENICIA.regions[id].bounds + 1;
      const side = (center: number) => Math.floor((center + b) / 16) - Math.floor((center - b) / 16) + 1;
      expect(side(o.x) * side(o.z)).toBeLessThanOrEqual(100);
    }
  });

  it('stays clear of the existing country worlds', () => {
    const existing = JSON.parse(fs.readFileSync('packages/content/minecraft-global/registry.json', 'utf8'));
    const furthest = Math.max(...existing.countries.map((c: any) => Math.abs(c.origin[0])));
    for (const id of Object.keys(PHOENICIA.regions)) {
      expect(regionOrigin(id).x - PHOENICIA.regions[id].bounds).toBeGreaterThan(furthest + 200);
    }
  });

  it('uses a known block for every material', () => {
    for (const material of Object.values<any>(PHOENICIA.materials)) {
      expect(material.minecraft).toMatch(/^minecraft:[a-z_]+$/);
    }
  });

  it('builds the sea and land before the structures on top of them', () => {
    const ops = planRegion('tyre');
    const firstBox = ops.findIndex((o) => o.block === 'minecraft:spruce_planks');
    const lastLand = ops.map((o) => o.block).lastIndexOf('minecraft:sandstone', firstBox);
    expect(ops[0].block).toBe('minecraft:sand');
    expect(lastLand).toBeGreaterThan(0);
    expect(firstBox).toBeGreaterThan(ops.findIndex((o) => o.block === 'minecraft:water'));
  });
});
