/**
 * Plays the Byblos harbor quest through the real engine against a simulated Script API.
 * Events are fired the way the game fires them, and blocks and inventory are simulated
 * state the engine must really read. A real Bedrock server still has to confirm this.
 */
import fs from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sim = vi.hoisted(() => ({
  blocks: new Map<string, string>(),
  entities: [] as any[],
  players: [] as any[],
  worldProps: new Map<string, unknown>(),
  handlers: {} as Record<string, ((e: any) => void)[]>,
  intervals: [] as (() => void)[],
  answer: 0 as number | undefined,
  forms: [] as { title: string; body: string; buttons: string[] }[],
  events: [] as string[],
  commands: [] as string[],
}));

const signal = (name: string) => ({
  subscribe: (fn: (e: any) => void) => {
    (sim.handlers[name] ??= []).push(fn);
  },
});

vi.mock('@minecraft/server', () => {
  class UnloadedChunksError extends Error {}
  class BlockVolume {
    constructor(public from: any, public to: any) {}
  }
  const key = (p: any) => `${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`;
  const dimension = {
    getBlock: (p: any) => ({ typeId: sim.blocks.get(key(p)) ?? 'minecraft:air' }),
    fillBlocks: (volume: any, block: string) => {
      for (let x = volume.from.x; x <= volume.to.x; x++) {
        for (let y = volume.from.y; y <= volume.to.y; y++) {
          for (let z = volume.from.z; z <= volume.to.z; z++) sim.blocks.set(`${x},${y},${z}`, block);
        }
      }
    },
    runCommand: (command: string) => sim.commands.push(command),
    getEntities: ({ tags }: { tags: string[] }) => sim.entities.filter((e) => tags.every((t) => e.tags.includes(t))),
    spawnEntity: (typeId: string, location: any) => {
      const entity = {
        typeId,
        location: { ...location },
        tags: [] as string[],
        nameTag: '',
        addTag(tag: string) {
          this.tags.push(tag);
        },
        hasTag(tag: string) {
          return this.tags.includes(tag);
        },
        triggerEvent(event: string) {
          sim.events.push(event);
        },
        teleport(p: any) {
          this.location = { ...p };
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
      amount: number;
      constructor(public typeId: string, amount = 1) {
        this.amount = amount;
      }
    },
    system: {
      currentTick: 0,
      run: (fn: () => void) => fn(),
      runTimeout: (fn: () => void) => fn(),
      runInterval: (fn: () => void) => {
        sim.intervals.push(fn);
        return sim.intervals.length;
      },
      clearRun: () => {},
      runJob: (job: Iterator<void>) => {
        while (!job.next().done);
      },
    },
    world: {
      getDimension: () => dimension,
      getAllPlayers: () => sim.players,
      getDynamicProperty: (k: string) => sim.worldProps.get(k),
      setDynamicProperty: (k: string, v: unknown) => sim.worldProps.set(k, v),
      sendMessage: () => {},
      beforeEvents: { playerInteractWithEntity: signal('interact') },
      afterEvents: { playerPlaceBlock: signal('place'), playerBreakBlock: signal('break') },
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
      sim.forms.push(this.form);
      return sim.answer === undefined ? { canceled: true } : { canceled: false, selection: sim.answer };
    }
  },
}));

const engine = await import('../../apps/minecraft/scripts/physical/index.js');
const data = JSON.parse(fs.readFileSync('apps/minecraft/scripts/generated/physical.json', 'utf8'));
const byblos = data.settlements.byblos;
const quest = data.quests.pq_lb_harbor;
const objective = (id: string) => quest.objectives.find((o: any) => o.id === id);
const PLANK = 'minecraft:spruce_planks';

function newPlayer(name = 'A') {
  const props = new Map<string, unknown>();
  const slots: any[] = Array(36).fill(undefined);
  const player: any = {
    name,
    location: { ...byblos.spawn },
    messages: [] as string[],
    onScreenDisplay: { setActionBar: () => {} },
    getDynamicProperty: (k: string) => props.get(k),
    setDynamicProperty: (k: string, v: unknown) => props.set(k, v),
    sendMessage(text: string) {
      this.messages.push(text);
    },
    teleport(p: any) {
      this.location = { ...p };
    },
    getComponent: () => ({
      container: {
        size: 36,
        getItem: (i: number) => slots[i],
        addItem: (stack: any) => {
          slots[slots.findIndex((s) => !s)] = stack;
        },
      },
    }),
    give(typeId: string, amount: number) {
      slots[slots.findIndex((s) => !s)] = { typeId, amount };
    },
    take(typeId: string, amount: number) {
      const stack = slots.find((s) => s?.typeId === typeId);
      stack.amount -= amount;
      if (stack.amount === 0) slots[slots.indexOf(stack)] = undefined;
    },
  };
  sim.players.push(player);
  return player;
}

const karim = () => sim.entities.find((e) => e.typeId === 'miraverse:family_lb_karim');
const tick = () => sim.intervals.forEach((fn) => fn());
const fire = (name: string, event: any) => (sim.handlers[name] ?? []).forEach((fn) => fn(event));
const flush = () => new Promise((resolve) => setImmediate(resolve));
const stage = (player: any) => engine.loadSave(player).quests.pq_lb_harbor?.objective;

async function talk(player: any) {
  const event = { player, target: karim(), cancel: false };
  fire('interact', event);
  await flush();
  return event;
}

function placeBlock(player: any, cell: any, block: string) {
  sim.blocks.set(`${cell.x},${cell.y},${cell.z}`, block);
  player.take(block, 1);
  fire('place', { player, block: { typeId: block, location: cell } });
}

let started = false;
beforeEach(() => {
  sim.blocks.clear();
  sim.entities.length = 0;
  sim.players.length = 0;
  sim.worldProps.clear();
  sim.forms.length = 0;
  sim.events.length = 0;
  sim.answer = 0;
  if (!started) {
    engine.startPhysical();
    started = true;
  }
  // The build job runs once at startup; restore a fresh world for each test.
  for (const [ax, ay, az, bx, by, bz, index] of byblos.packedFills) {
    for (let x = ax; x <= bx; x++) {
      for (let y = ay; y <= by; y++) {
        for (let z = az; z <= bz; z++) sim.blocks.set(`${x},${y},${z}`, byblos.palette[index]);
      }
    }
  }
  sim.worldProps.set('mv:physical_built_v1:byblos', true);
  sim.entities.push(
    Object.assign(
      {
        typeId: 'miraverse:family_lb_karim',
        location: { ...byblos.npcs[0].pos },
        tags: ['miraverse_physical_npc', 'miraverse_physical_npc_family_lb_karim'],
        hasTag(this: any, tag: string) {
          return this.tags.includes(tag);
        },
        teleport(this: any, p: any) {
          this.location = { ...p };
        },
      },
      {}
    )
  );
});

async function playToEnd(player: any) {
  await talk(player);
  player.location = { ...objective('inspect').at };
  tick();
  player.give(PLANK, objective('collect').count);
  fire('break', { player, block: { typeId: PLANK } });
  for (const cell of objective('place').cells) placeBlock(player, cell, PLANK);
  player.location = { ...objective('cross').at };
  tick();
  await talk(player);
}

describe('the Byblos repair quest needs real actions', () => {
  it('completes through the full physical sequence and rewards once', async () => {
    const player = newPlayer();
    await playToEnd(player);
    const save = engine.loadSave(player);
    expect(save.quests.pq_lb_harbor.done).toBe(true);
    expect(save.storySparks).toBe(25);
    expect(save.artifacts).toEqual(['lb_harbor_compass']);
    await talk(player);
    expect(engine.loadSave(player).storySparks).toBe(25);
  });

  it('cannot be finished by talking', async () => {
    const player = newPlayer();
    for (let i = 0; i < 10; i++) await talk(player);
    tick();
    expect(stage(player)).toBe(1);
    expect(engine.loadSave(player).quests.pq_lb_harbor.done).toBe(false);
  });

  it('holds at the gap until planks are really held', async () => {
    const player = newPlayer();
    await talk(player);
    player.location = { ...objective('inspect').at };
    tick();
    expect(quest.objectives[stage(player)].id).toBe('collect');
    player.give(PLANK, objective('collect').count - 1);
    tick();
    expect(quest.objectives[stage(player)].id).toBe('collect');
    player.give(PLANK, 1);
    tick();
    expect(quest.objectives[stage(player)].id).toBe('place');
  });

  it('rejects wrong blocks and partial repairs by checking the world', async () => {
    const player = newPlayer();
    await talk(player);
    player.location = { ...objective('inspect').at };
    tick();
    player.give(PLANK, objective('collect').count);
    player.give('minecraft:dirt', 1);
    tick();
    const cells = objective('place').cells;
    placeBlock(player, cells[0], 'minecraft:dirt');
    for (const cell of cells.slice(1, -1)) placeBlock(player, cell, PLANK);
    tick();
    expect(quest.objectives[stage(player)].id).toBe('place');
    expect(engine.missingCells(objective('place'))).toBe(2);
    for (const cell of [cells[0], cells.at(-1)]) placeBlock(player, cell, PLANK);
    tick();
    expect(quest.objectives[stage(player)].id).toBe('cross');
  });

  it('requires walking across the repair, not just standing beside it', async () => {
    const player = newPlayer();
    await talk(player);
    player.location = { ...objective('inspect').at };
    tick();
    player.give(PLANK, objective('collect').count);
    tick();
    for (const cell of objective('place').cells) placeBlock(player, cell, PLANK);
    tick();
    expect(quest.objectives[stage(player)].id).toBe('cross');
    player.location = { ...objective('inspect').at };
    tick();
    expect(quest.objectives[stage(player)].id).toBe('cross');
  });

  it('changes dialogue with the player state', async () => {
    const player = newPlayer();
    const seen: string[] = [];
    const record = () => seen.push(sim.forms.at(-1)!.body);
    await talk(player);
    record();
    await talk(player);
    record();
    await playToEnd(player);
    await talk(player);
    record();
    expect(new Set(seen).size).toBe(3);
  });

  it('keeps progress across a reload', async () => {
    const player = newPlayer();
    await talk(player);
    player.location = { ...objective('inspect').at };
    tick();
    const saved = player.getDynamicProperty('mv:physical_v1');
    const restored = newPlayer('A again');
    restored.setDynamicProperty('mv:physical_v1', saved);
    expect(quest.objectives[stage(restored)].id).toBe('collect');
  });

  it('keeps two players separate', async () => {
    const one = newPlayer('one');
    const two = newPlayer('two');
    await talk(one);
    expect(stage(one)).toBe(1);
    expect(stage(two)).toBeUndefined();
    await talk(two);
    one.location = { ...objective('inspect').at };
    two.location = { ...byblos.spawn };
    tick();
    expect(quest.objectives[stage(one)].id).toBe('collect');
    expect(quest.objectives[stage(two)].id).toBe('inspect');
  });

  it('survives a corrupt save', () => {
    const player = newPlayer();
    player.setDynamicProperty('mv:physical_v1', '{oops');
    expect(engine.loadSave(player).quests).toEqual({});
  });

  it('shows French after the player chooses it', async () => {
    const player = newPlayer();
    sim.answer = ['en-US', 'fr-FR'].indexOf('fr-FR');
    await engine.chooseLanguage(player);
    sim.answer = 0;
    expect(engine.localeOf(player)).toBe('fr-FR');
    await talk(player);
    const french = sim.forms.at(-1)!.body;
    const { strings } = JSON.parse(fs.readFileSync('packages/content/locales/fr-FR/messages.json', 'utf8'));
    expect(french).toBe(strings['quest.pq_lb_harbor.talk_start.intro']);
    expect(french).not.toBe('');
  });

  it('cancels the default screen and opens dialogue on a later tick', async () => {
    const player = newPlayer();
    const event = await talk(player);
    expect(event.cancel).toBe(true);
    expect(sim.forms).toHaveLength(1);
  });

  it('returns a lost NPC only as recovery', () => {
    const npc = karim();
    npc.location = { x: byblos.spawn.x + 500, y: byblos.spawn.y, z: byblos.spawn.z };
    tick();
    expect(npc.location).toEqual(byblos.npcs[0].home);
  });
});

describe('Byblos is a distinct place', () => {
  const blockAt = (p: any) => {
    const key = `${p.x},${p.y},${p.z}`;
    return sim.blocks.get(key);
  };

  it('has sea to the west and land rising to the castle in the east', () => {
    const o = { x: 3000, y: 100, z: 0 };
    expect(blockAt({ x: o.x + 2, y: o.y, z: o.z + 20 })).toBe('minecraft:water');
    expect(blockAt({ x: o.x + 30, y: o.y + 1, z: o.z + 30 })).toMatch(/limestone/);
    expect(byblos.landmarks.castle.y).toBeGreaterThan(byblos.landmarks.souk.y);
    expect(byblos.landmarks.souk.x).toBeGreaterThan(byblos.landmarks.dock.x);
    expect(byblos.landmarks.dock.x).toBeGreaterThan(byblos.landmarks.moleEnd.x);
  });

  it('starts with a real gap in the walkway, over water', () => {
    for (const cell of objective('place').cells) {
      expect(blockAt(cell) ?? 'minecraft:air').toBe('minecraft:air');
      expect(blockAt({ ...cell, y: cell.y - 1 })).toBe('minecraft:water');
    }
    expect(engine.missingCells(objective('place'))).toBe(objective('place').cells.length);
  });

  it('stands everyone on solid ground, with open air above', () => {
    for (const p of [byblos.spawn, byblos.npcs[0].pos, byblos.npcs[0].home, objective('inspect').at, objective('cross').at]) {
      expect(blockAt({ ...p, y: p.y - 1 }), JSON.stringify(p)).not.toMatch(/water|air|undefined/);
      expect(blockAt(p) ?? 'minecraft:air', JSON.stringify(p)).toBe('minecraft:air');
    }
  });

  it('has a walkable route from the spawn to the gap and from the dock marker', () => {
    // Flood fill across standable cells, as a walking player or NPC moves.
    const standable = (x: number, y: number, z: number) => {
      const below = sim.blocks.get(`${x},${y - 1},${z}`);
      const feet = sim.blocks.get(`${x},${y},${z}`) ?? 'minecraft:air';
      const head = sim.blocks.get(`${x},${y + 1},${z}`) ?? 'minecraft:air';
      return !!below && !/water|air|barrier/.test(below) && /air|water/.test(feet) && /air/.test(head) && feet !== 'minecraft:water';
    };
    const reachable = (from: any, target: any, radius: number) => {
      const start = `${from.x},${from.y},${from.z}`;
      const seen = new Set([start]);
      const queue = [from];
      while (queue.length) {
        const p = queue.shift();
        if (Math.hypot(p.x - target.x, p.z - target.z) <= radius && Math.abs(p.y - target.y) <= 2) return true;
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          for (const dy of [0, 1, -1]) {
            const n = { x: p.x + dx, y: p.y + dy, z: p.z + dz };
            const k = `${n.x},${n.y},${n.z}`;
            if (!seen.has(k) && standable(n.x, n.y, n.z)) {
              seen.add(k);
              queue.push(n);
              break;
            }
          }
        }
      }
      return false;
    };
    const { spawn, npcs } = byblos;
    expect(reachable(spawn, objective('inspect').at, objective('inspect').radius)).toBe(true);
    expect(reachable(npcs[0].pos, npcs[0].home, 3)).toBe(true);
    // The mole end can't be walked to before the repair...
    expect(reachable(spawn, objective('cross').at, objective('cross').radius)).toBe(false);
    // ...and can afterwards.
    for (const cell of objective('place').cells) sim.blocks.set(`${cell.x},${cell.y},${cell.z}`, PLANK);
    expect(reachable(spawn, objective('cross').at, objective('cross').radius)).toBe(true);
    expect(reachable(spawn, byblos.landmarks.souk, 3)).toBe(true);
  });

  it('uses textured custom blocks and valid IDs', () => {
    const custom = byblos.palette.filter((b: string) => b.startsWith('miraverse:'));
    expect(custom.length).toBeGreaterThanOrEqual(5);
    for (const block of custom) {
      expect(fs.existsSync(`apps/minecraft/bp/blocks/${block.split(':')[1]}.json`), block).toBe(true);
    }
    for (const block of byblos.palette) expect(block).toMatch(/^(minecraft|miraverse):[a-z0-9_]+$/);
  });

  it('gives Karim working pathfinding and visuals', () => {
    const entity = JSON.parse(fs.readFileSync('apps/minecraft/bp/entities/family_lb_karim.json', 'utf8'))['minecraft:entity'];
    expect(entity.components['minecraft:movement'].value).toBeGreaterThan(0);
    expect(entity.components['minecraft:movement.basic']).toBeTruthy();
    expect(entity.components['minecraft:navigation.walk']).toBeTruthy();
    expect(entity.component_groups['miraverse:walk_to_dock']['minecraft:behavior.move_to_block'].target_blocks).toEqual(['minecraft:lodestone']);
    expect(fs.existsSync('apps/minecraft/rp/entity/family_lb_karim.entity.json')).toBe(true);
    expect(fs.existsSync('apps/minecraft/rp/textures/entity/family_lb_karim.png')).toBe(true);
    expect(byblos.palette).toContain('minecraft:lodestone');
  });
});
