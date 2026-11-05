/**
 * Binds the Phoenicia flow to the Bedrock Script API. Only reached when the
 * add-on is built with MV_PHOENICIA=1. Interaction is "walk to the spot and sneak",
 * which needs no custom entity behaviour and also works on touch controls.
 */
import { BlockVolume, UnloadedChunksError, system, world, type Entity, type Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { PHOENICIA } from './gate.js';
import { PhoeniciaFlow, translate, type AskRequest, type PhoeniciaHost } from './flow.js';
import { planRegion, regionOrigin } from './planner.js';

const SAVE_KEY = 'mv:phoenicia:v1';
const BUILT_KEY = 'mv:phoenicia:built:v1';
const NPC_ENTITY = 'miraverse:mentor_lb';
const NPC_TAG = 'miraverse_phoenicia_npc';
const REGION_IDS = Object.keys(PHOENICIA.regions);
const STAND_Y = PHOENICIA.projection.landTopY + 1;
const FORM_RETRIES = 40;
const CHUNK_WAIT_TICKS = 6000;

const sleep = (ticks: number) => new Promise<void>((resolve) => system.runTimeout(() => resolve(), ticks));

let worldBuilt = false;
const wasSneaking = new Map<string, boolean>();
const patrolIndex = new Map<string, number>();

function playerById(id: string): Player | undefined {
  return world.getAllPlayers().find((p) => p.id === id);
}

function worldPoint(region: string, point: { x: number; z: number; y?: number }) {
  const o = regionOrigin(region);
  return { x: o.x + point.x + 0.5, y: o.y + (point.y ?? STAND_Y), z: o.z + point.z + 0.5 };
}

async function showForm(player: Player, request: AskRequest): Promise<string | null> {
  const form = new ActionFormData().title(request.title).body(request.body);
  for (const option of request.options) form.button(option.label);
  // A form cannot open while the player has another screen up, so wait and retry.
  for (let i = 0; i < FORM_RETRIES; i++) {
    const res = await form.show(player);
    if (res.canceled && res.cancelationReason === 'UserBusy') {
      await sleep(10);
      continue;
    }
    if (res.canceled || res.selection === undefined) return null;
    return request.options[res.selection]?.id ?? null;
  }
  return null;
}

const host: PhoeniciaHost = {
  load(playerId) {
    const player = playerById(playerId);
    if (!player) return { ok: false };
    try {
      return { ok: true, value: player.getDynamicProperty(SAVE_KEY) as string | undefined };
    } catch {
      return { ok: false };
    }
  },
  save(playerId, value) {
    try {
      playerById(playerId)?.setDynamicProperty(SAVE_KEY, value);
      return true;
    } catch {
      return false;
    }
  },
  position(playerId) {
    const player = playerById(playerId);
    if (!player) return null;
    for (const id of REGION_IDS) {
      const o = regionOrigin(id);
      const x = player.location.x - o.x;
      const z = player.location.z - o.z;
      const bounds = PHOENICIA.regions[id].bounds;
      if (Math.abs(x) <= bounds && Math.abs(z) <= bounds) return { region: id, x, z };
    }
    return null;
  },
  teleport(playerId, region, point) {
    playerById(playerId)?.teleport(worldPoint(region, point));
  },
  ask(playerId, request) {
    const player = playerById(playerId);
    return player ? showForm(player, request) : Promise.resolve(null);
  },
  say(playerId, text) {
    playerById(playerId)?.sendMessage(text);
  },
  async sail(playerId, fromRegion, toRegion, seconds) {
    const player = playerById(playerId);
    if (!player) return;
    const start = fromRegion ?? toRegion;
    player.teleport(worldPoint(start, PHOENICIA.regions[start].points.shipDeck));
    const state = flow.getState(playerId);
    player.onScreenDisplay.setActionBar(translate(state?.locale ?? null, 'ui.sailing'));
    await sleep(Math.round((seconds * 20) / 2));
    const live = playerById(playerId);
    if (!live) return;
    live.teleport(worldPoint(toRegion, PHOENICIA.regions[toRegion].points.shipDeck));
    await sleep(Math.round((seconds * 20) / 2));
  },
};

const flow = new PhoeniciaFlow(host);

function addTickingArea(regionId: string): void {
  const o = regionOrigin(regionId);
  const b = PHOENICIA.regions[regionId].bounds + 1;
  const name = `mv_phoenicia_${regionId}`;
  try {
    world.getDimension('overworld').runCommand(
      `tickingarea add ${o.x - b} ${o.y} ${o.z - b} ${o.x + b} ${o.y} ${o.z + b} ${name} true`
    );
  } catch {
    // Usually means it already exists from an earlier session.
  }
}

function spawnNpcs(): void {
  const dimension = world.getDimension('overworld');
  for (const id of REGION_IDS) {
    for (const npc of PHOENICIA.regions[id].npcs) {
      const tag = `${NPC_TAG}_${npc.id}`;
      if (dimension.getEntities({ tags: [tag] }).length > 0) continue;
      const entity = dimension.spawnEntity(NPC_ENTITY, worldPoint(id, npc));
      entity.addTag(NPC_TAG);
      entity.addTag(tag);
      entity.nameTag = translate('en-US', npc.nameKey);
    }
  }
}

/** A small state machine: walk one block towards the next waypoint, then turn back. */
function stepNpc(entity: Entity, region: string, npc: any): void {
  const index = patrolIndex.get(npc.id) ?? 0;
  const [tx, tz] = npc.patrol[index];
  const target = worldPoint(region, { x: tx, z: tz });
  const dx = target.x - entity.location.x;
  const dz = target.z - entity.location.z;
  const distance = Math.hypot(dx, dz);
  if (distance < 1) {
    patrolIndex.set(npc.id, (index + 1) % npc.patrol.length);
    return;
  }
  entity.teleport(
    { x: entity.location.x + dx / distance, y: target.y, z: entity.location.z + dz / distance },
    { facingLocation: target }
  );
}

export function buildPhoeniciaWorld(): void {
  for (const id of REGION_IDS) addTickingArea(id);
  const finish = () => {
    worldBuilt = true;
    try {
      spawnNpcs();
    } catch {
      // Retried by the NPC loop once chunks are ready.
    }
  };
  if (world.getDynamicProperty(BUILT_KEY) === true) {
    finish();
    return;
  }
  const dimension = world.getDimension('overworld');
  let failed = 0;
  system.runJob(
    (function* () {
      for (const id of REGION_IDS) {
        for (const op of planRegion(id)) {
          // Ticking areas take a moment to load, so wait for the chunks by game time.
          const deadline = system.currentTick + CHUNK_WAIT_TICKS;
          for (;;) {
            try {
              dimension.fillBlocks(new BlockVolume(op.min, op.max), op.block);
              break;
            } catch (error) {
              if (error instanceof UnloadedChunksError && system.currentTick < deadline) {
                yield;
                continue;
              }
              failed += 1;
              console.warn(`Phoenicia: fill failed for ${op.block}: ${error}`);
              break;
            }
          }
          yield;
        }
      }
      // A partial build is not marked as done, so the next world load retries it.
      if (failed === 0) world.setDynamicProperty(BUILT_KEY, true);
      else world.sendMessage(`Phoenicia: ${failed} world sections failed to build and will retry on the next load.`);
      finish();
    })()
  );
}

export function enterPhoenicia(player: Player): void {
  const id = player.id;
  const handle = system.runInterval(() => {
    if (!worldBuilt) return;
    system.clearRun(handle);
    void flow.enter(id).catch(() => host.say(id, 'Something went wrong. Please rejoin.'));
  }, 20);
}

export function startPhoenicia(): void {
  world.afterEvents.playerLeave.subscribe((ev) => {
    flow.leave(ev.playerId);
    wasSneaking.delete(ev.playerId);
  });
  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      const prompt = flow.promptFor(player.id);
      if (prompt) player.onScreenDisplay.setActionBar(`${prompt} (sneak)`);
      const sneaking = player.isSneaking;
      if (prompt && sneaking && !wasSneaking.get(player.id)) void flow.interact(player.id);
      wasSneaking.set(player.id, sneaking);
    }
  }, 5);
  system.runInterval(() => {
    if (!worldBuilt) return;
    const dimension = world.getDimension('overworld');
    for (const id of REGION_IDS) {
      for (const npc of PHOENICIA.regions[id].npcs) {
        const entity = dimension.getEntities({ tags: [`${NPC_TAG}_${npc.id}`] })[0];
        if (entity) stepNpc(entity, id, npc);
      }
    }
  }, 30);
}
