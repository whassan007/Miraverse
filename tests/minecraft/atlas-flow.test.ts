/**
 * Plays the six Atlas countries through the real menus and challenge runners, against a
 * simulated Script API. This can't show how the game looks or behaves on a real client.
 */
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type FormHandler = (form: { title: string; body: string; buttons: string[] }) => number | undefined;

const sim = vi.hoisted(() => ({
  respond: null as unknown as FormHandler,
  blocks: new Map<string, string>(),
  fills: [] as { min: any; max: any; block: string }[],
  commands: [] as string[],
  worldProps: new Map<string, unknown>(),
  entities: [] as { typeId: string; tags: string[]; nameTag: string }[],
  unloadedFailures: 0,
}));

vi.mock('@minecraft/server', () => {
  class UnloadedChunksError extends Error {}
  class BlockVolume {
    constructor(public from: any, public to: any) {}
  }
  const dimension = {
    getBlock: (p: any) => {
      const key = `${p.x},${p.y},${p.z}`;
      return {
        typeId: sim.blocks.get(key) ?? 'minecraft:air',
        setType: (type: string) => sim.blocks.set(key, type),
      };
    },
    fillBlocks: (volume: any, block: string) => {
      if (sim.unloadedFailures > 0) {
        sim.unloadedFailures -= 1;
        throw new UnloadedChunksError('chunks not loaded');
      }
      sim.fills.push({ min: volume.from, max: volume.to, block });
    },
    runCommand: (command: string) => {
      sim.commands.push(command);
      return { successCount: 1 };
    },
    getEntities: ({ tags }: { tags: string[] }) => sim.entities.filter((e) => tags.every((t) => e.tags.includes(t))),
    spawnEntity: (typeId: string) => {
      const entity = {
        typeId,
        tags: [] as string[],
        nameTag: '',
        addTag(tag: string) {
          this.tags.push(tag);
        },
      };
      sim.entities.push(entity);
      return entity;
    },
  };
  return {
    UnloadedChunksError,
    BlockVolume,
    ItemStack: class {
      constructor(id: string) {
        throw new Error(`Unknown item ${id}`);
      }
    },
    BlockPermutation: {
      resolve: (id: string) => {
        if (!id.startsWith('minecraft:')) throw new Error(`Unknown block ${id}`);
        return {};
      },
    },
    system: {
      currentTick: 0,
      runTimeout: (fn: () => void) => fn(),
      run: (fn: () => void) => fn(),
      runInterval: (fn: () => void) => {
        queueMicrotask(fn);
        return 1;
      },
      clearRun: () => {},
      runJob: (job: Iterator<void>) => {
        while (!job.next().done);
      },
    },
    world: {
      getDimension: () => dimension,
      getDynamicProperty: (key: string) => sim.worldProps.get(key),
      setDynamicProperty: (key: string, value: unknown) => sim.worldProps.set(key, value),
      sendMessage: () => {},
    },
  };
});

vi.mock('@minecraft/server-ui', () => ({
  ActionFormData: class {
    form = { title: '', body: '', buttons: [] as string[] };
    title(text: string) {
      this.form.title = text;
      return this;
    }
    body(text: string) {
      this.form.body = text;
      return this;
    }
    button(text: string) {
      this.form.buttons.push(text);
      return this;
    }
    async show() {
      const selection = sim.respond(this.form);
      return selection === undefined ? { canceled: true, cancelationReason: 'UserClosed' } : { canceled: false, selection };
    }
  },
}));

const atlas = await import('../../apps/minecraft/scripts/atlas/index.js');
const data = JSON.parse(fs.readFileSync('apps/minecraft/scripts/generated/atlas.json', 'utf8'));
const COUNTRIES: any[] = data.countries.map((c: any) => ({
  ...c,
  fills: c.packedFills.map((f: number[]) => ({ min: f.slice(0, 3), max: f.slice(3, 6), block: c.palette[f[6]] })),
}));

function newPlayer() {
  const props = new Map<string, unknown>();
  const player = {
    messages: [] as string[],
    positions: [] as any[],
    location: { x: 0, y: 100, z: 0 },
    getDynamicProperty: (key: string) => props.get(key),
    setDynamicProperty: (key: string, value: unknown) => props.set(key, value),
    getComponent: () => undefined,
    sendMessage(text: string) {
      this.messages.push(text);
    },
    teleport(pos: any) {
      this.positions.push(pos);
      this.location = pos;
    },
    dimension: undefined as any,
  };
  return player;
}

/** Answers forms as a player would, using only what's on screen and the chapter's data. */
function solver(country: any, chapter: any, log: { wrongSources: number }) {
  return (form: { title: string; body: string; buttons: string[] }) => {
    const { body, buttons } = form;
    const gather = buttons.findIndex((b) => b.startsWith('Gather '));
    if (gather >= 0) return gather;
    const placeAll = buttons.indexOf('Place all blocks for me');
    if (placeAll >= 0) return placeAll;
    if (buttons[0]?.startsWith('Trade')) return 0;
    if (body.includes('What kind of story is this?')) {
      const challenge = chapter.challenges.find((c: any) => c.type === 'source');
      const right = challenge.options.find((o: any) => o.id === challenge.answer).label;
      if (log.wrongSources === 0) {
        log.wrongSources += 1;
        return buttons.findIndex((b) => b !== right && b !== 'Leave');
      }
      return buttons.indexOf(right);
    }
    if (body.includes('What does it mean?')) {
      const challenge = chapter.challenges.find((c: any) => c.type === 'word');
      const word = challenge.words.find((w: any) => body.startsWith(w.word));
      return buttons.indexOf(word.en);
    }
    const step = body.match(/Step (\d+) of/);
    if (step) {
      const challenge = chapter.challenges.find((c: any) => c.type === 'cook');
      const next = challenge.recipe.inputs[Number(step[1]) - 1];
      return buttons.indexOf(country.items[next]);
    }
    throw new Error(`No answer for form: ${form.title} / ${body.slice(0, 80)} / ${buttons.join('|')}`);
  };
}

/** Selects one chapter from the menu, plays it, then leaves the menu. */
async function playOneChapter(player: any, country: any, chapter: any, log = { wrongSources: 0 }) {
  const answer = solver(country, chapter, log);
  let opened = false;
  sim.respond = (form) => {
    if (form.title === country.name) {
      if (opened) return form.buttons.indexOf('Leave');
      opened = true;
      return chapter.index - 1;
    }
    return answer(form);
  };
  await atlas.playAtlasCountry(player as never, country.code);
}

beforeEach(() => {
  sim.blocks.clear();
  sim.fills.length = 0;
  sim.commands.length = 0;
  sim.worldProps.clear();
  sim.entities.length = 0;
  sim.unloadedFailures = 0;
});

describe('Atlas countries are offered', () => {
  it('connects exactly the six missing countries', () => {
    expect(atlas.ATLAS_COUNTRIES.map((c: any) => c.code)).toEqual(['DE', 'CN', 'JP', 'RU', 'UA', 'MA']);
    expect(atlas.isAtlasCountry('DE')).toBe(true);
    expect(atlas.isAtlasCountry('LB')).toBe(false);
  });

  it('has six chapters per country, each ending in a source check', () => {
    for (const country of COUNTRIES) {
      expect(country.chapters).toHaveLength(6);
      for (const chapter of country.chapters) {
        expect(chapter.challenges.at(-1).type).toBe('source');
      }
    }
  });
});

describe('playing every chapter', () => {
  for (const country of COUNTRIES) {
    it(`${country.code}: all six chapters play in order and award the stamp`, async () => {
      const player = newPlayer();
      player.dimension = (await import('@minecraft/server')).world.getDimension('overworld');
      for (const chapter of country.chapters) {
        const log = { wrongSources: 0 };
        await playOneChapter(player, country, chapter, log);
        expect(log.wrongSources, chapter.id).toBe(1);
        expect(atlas.loadProgress(player as never).completed, chapter.id).toContain(chapter.id);
        expect(player.messages.join('\n')).toContain(chapter.completion);
      }
      const progress = atlas.loadProgress(player as never);
      expect(progress.artifacts).toHaveLength(6);
      expect(progress.storySparks).toBe(country.chapters.reduce((s: number, c: any) => s + c.storySparks, 0));
      expect(progress.stamps).toEqual([country.stampName]);
    });
  }

  it('refuses a locked chapter', async () => {
    const [country] = COUNTRIES;
    const player = newPlayer();
    let opens = 0;
    sim.respond = (form) => {
      opens += 1;
      expect(form.buttons[1]).toContain('(Locked)');
      return opens === 1 ? 1 : form.buttons.indexOf('Leave');
    };
    await atlas.playAtlasCountry(player as never, country.code);
    expect(atlas.loadProgress(player as never).completed).toEqual([]);
    expect(player.messages.join()).toContain('Finish the chapter');
  });

  it('grants rewards once when a chapter is replayed', async () => {
    const [country] = COUNTRIES;
    const [chapter] = country.chapters;
    const player = newPlayer();
    player.dimension = (await import('@minecraft/server')).world.getDimension('overworld');
    await playOneChapter(player, country, chapter);
    await playOneChapter(player, country, chapter);
    const progress = atlas.loadProgress(player as never);
    expect(progress.completed).toEqual([chapter.id]);
    expect(progress.artifacts).toHaveLength(1);
    expect(progress.storySparks).toBe(chapter.storySparks);
  });

  it('keeps earlier progress when a player leaves mid-chapter', async () => {
    const [country] = COUNTRIES;
    const player = newPlayer();
    player.dimension = (await import('@minecraft/server')).world.getDimension('overworld');
    await playOneChapter(player, country, country.chapters[0]);
    let menuOpens = 0;
    sim.respond = (form) => {
      if (form.title === country.name) {
        menuOpens += 1;
        return menuOpens === 1 ? 1 : form.buttons.indexOf('Leave');
      }
      return form.buttons.indexOf('Leave');
    };
    await atlas.playAtlasCountry(player as never, country.code);
    const progress = atlas.loadProgress(player as never);
    expect(progress.completed).toEqual([country.chapters[0].id]);
  });

  it('survives a corrupt save', () => {
    const player = newPlayer();
    player.setDynamicProperty('mv:atlas_progress_v1', '{not json');
    expect(atlas.loadProgress(player as never).completed).toEqual([]);
  });
});

describe('building the districts', () => {
  it('places every district, waits for chunks, spawns NPCs and releases ticking areas', async () => {
    sim.unloadedFailures = 25;
    await atlas.buildAtlasWorld();
    for (const country of COUNTRIES) {
      expect(atlas.isAtlasAreaReady(country.code), country.code).toBe(true);
    }
    const total = COUNTRIES.reduce((sum, c) => sum + c.fills.length, 0);
    expect(sim.fills).toHaveLength(total);
    expect(sim.entities).toHaveLength(COUNTRIES.reduce((sum, c) => sum + c.npcs.length, 0));
    expect(sim.commands.filter((c) => c.startsWith('tickingarea add'))).toHaveLength(6);
    expect(sim.commands.filter((c) => c.startsWith('tickingarea remove'))).toHaveLength(6);
  });

  it('does not rebuild a finished district or duplicate its NPCs', async () => {
    await atlas.buildAtlasWorld();
    const firstFills = sim.fills.length;
    const firstNpcs = sim.entities.length;
    await atlas.buildAtlasWorld();
    expect(sim.fills).toHaveLength(firstFills);
    expect(sim.entities).toHaveLength(firstNpcs);
  });
});

describe('world data', () => {
  const inside = (c: any, p: any) =>
    p.x > c.bounds.min[0] && p.x < c.bounds.max[0] && p.z > c.bounds.min[2] && p.z < c.bounds.max[2] && p.y > c.bounds.min[1];

  it('keeps every spawn, NPC and chapter inside the walled district, above its floor', () => {
    for (const c of COUNTRIES) {
      expect(inside(c, c.spawn), `${c.code} spawn`).toBe(true);
      for (const npc of c.npcs) expect(inside(c, npc.pos), npc.id).toBe(true);
      for (const chapter of c.chapters) expect(inside(c, chapter.location), chapter.id).toBe(true);
    }
  });

  it('stays within Bedrock limits for fills and ticking areas', () => {
    for (const c of COUNTRIES) {
      const blocksOf = (fill: any) => {
        const size = fill.max ? [0, 1, 2].map((i) => fill.max[i] - fill.min[i] + 1) : [1, 1, 1];
        return size[0] * size[1] * size[2];
      };
      for (const fill of c.fills) expect(blocksOf(fill)).toBeLessThanOrEqual(32768);
      const side = (a: number, b: number) => Math.floor(b / 16) - Math.floor(a / 16) + 1;
      expect(side(c.bounds.min[0], c.bounds.max[0]) * side(c.bounds.min[2], c.bounds.max[2])).toBeLessThanOrEqual(100);
    }
  });

  it('uses only valid lowercase block and item IDs', () => {
    for (const c of COUNTRIES) {
      for (const fill of c.fills) expect(fill.block).toMatch(/^minecraft:[a-z_]+$/);
      for (const id of Object.keys(c.items)) expect(id).toMatch(/^[a-z0-9_]+$/);
      for (const block of Object.values(c.blocks)) expect(block).toMatch(/^minecraft:[a-z_]+$/);
    }
  });

  it('does not overlap another district or the original plazas', () => {
    const sorted = [...COUNTRIES].sort((a, b) => a.bounds.min[0] - b.bounds.min[0]);
    expect(sorted[0].bounds.min[0]).toBeGreaterThan(1010);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].bounds.min[0]).toBeGreaterThan(sorted[i - 1].bounds.max[0]);
    }
    expect(sorted.at(-1).bounds.max[0]).toBeLessThan(5900);
  });

  it('gives every NPC a behavior file, a client entity and a skin', () => {
    const MC = 'apps/minecraft';
    for (const c of COUNTRIES) {
      for (const npc of c.npcs) {
        expect(fs.existsSync(path.join(MC, 'bp/entities', `${npc.id}.json`)), npc.id).toBe(true);
        const client = JSON.parse(fs.readFileSync(path.join(MC, 'rp/entity', `${npc.id}.entity.json`), 'utf8'));
        const description = client['minecraft:client_entity'].description;
        expect(description.identifier).toBe(`miraverse:${npc.id}`);
        expect(fs.existsSync(path.join(MC, 'rp', `${description.textures.default}.png`)), npc.id).toBe(true);
      }
    }
  });
});
