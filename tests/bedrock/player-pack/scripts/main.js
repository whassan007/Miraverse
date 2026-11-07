// Plays the Byblos quest with a scripted player on a real server. Test servers only.
// Every step uses a real game action; the quest's own [quest] log lines are the evidence.
import { Direction, GameMode, ItemStack, system, world } from '@minecraft/server';
import * as gametest from '@minecraft/server-gametest';

const log = (text) => console.warn(`[player] ${text}`);
const sleep = (ticks) => new Promise((resolve) => system.runTimeout(resolve, ticks));
const dimension = () => world.getDimension('overworld');
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const at = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)}`;

const SPAWN = { x: 3025.5, y: 102, z: 18.5 };
const LOOKOUT = { x: 3016.5, y: 102, z: 11.5 };
const MOLE_END = { x: 3005.5, y: 102, z: 11.5 };
const STACK = { x0: 3030, x1: 3031, y0: 102, y1: 104, z0: 4, z1: 6 };
const GAP = { x0: 3012, x1: 3014, z0: 10, z1: 12, y: 101 };
const PLANK = 'minecraft:spruce_planks';

// Long navigation requests can fail, so routes are walked in short hops.
async function walkTo(player, target, radius, label) {
  for (let tries = 0; tries < 3; tries++) {
    const result = player.navigateToLocation(target, 1);
    if (!result?.isFullPath) player.moveToLocation(target);
    for (let i = 0; i < 16; i++) {
      await sleep(10);
      if (dist(player.location, target) <= radius) {
        player.stopMoving?.();
        log(`arrived ${label} at ${at(player.location)} (full path: ${result?.isFullPath})`);
        return true;
      }
    }
  }
  log(`FAILED to reach ${label}, at ${at(player.location)}`);
  return false;
}

async function walkRoute(player, points, radius, label) {
  for (let i = 0; i < points.length - 1; i++) {
    if (!(await walkTo(player, points[i], 1.5, `${label} waypoint ${i + 1}`))) return false;
  }
  return walkTo(player, points.at(-1), radius, label);
}

function countPlanks(player) {
  const container = player.getComponent('minecraft:inventory').container;
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const stack = container.getItem(i);
    if (stack?.typeId === PLANK) total += stack.amount;
  }
  return total;
}

function plankSlot(player) {
  const container = player.getComponent('minecraft:inventory').container;
  for (let i = 0; i < container.size; i++) {
    if (container.getItem(i)?.typeId === PLANK) return i;
  }
  return -1;
}

const karim = () => dimension().getEntities({ type: 'miraverse:family_lb_karim' })[0];

async function talkToKarim(player, label) {
  for (let tries = 0; tries < 12; tries++) {
    const target = karim();
    if (!target) {
      log('FAILED Karim not found');
      return false;
    }
    if (dist(player.location, target.location) > 2.2) {
      await walkTo(player, { ...target.location }, 2, `Karim (${label})`);
    }
    player.lookAtEntity?.(karim());
    await sleep(5);
    const ok = player.interactWithEntity(karim());
    log(`interact with Karim (${label}) at distance ${dist(player.location, karim().location).toFixed(1)}: ${ok}`);
    if (ok) {
      await sleep(20);
      return true;
    }
    await sleep(20);
  }
  return false;
}

async function playQuest() {
  log(`exports spawnSimulatedPlayer=${typeof gametest.spawnSimulatedPlayer}`);
  const player = gametest.spawnSimulatedPlayer({ ...SPAWN, dimension: dimension() }, `MiraTester${Math.floor(Math.random() * 1000)}`, GameMode.Survival);
  log(`spawned at ${at(player.location)}`);
  await sleep(40);

  const gapCell = dimension().getBlock({ x: 3013, y: 101, z: 11 })?.typeId;
  log(`at start: gap cell=${gapCell} karims=${dimension().getEntities({ type: 'miraverse:family_lb_karim' }).length}`);
  // Karim walks to the dock at the start, so give him time to arrive.
  await sleep(600);
  log(`Karim is at ${at(karim().location)}`);
  await walkTo(player, { x: 3025.5, y: 102, z: 13.5 }, 1.5, 'dock');
  await talkToKarim(player, 'start');

  const DOCK = { x: 3025.5, y: 102, z: 11.5 };
  await walkRoute(player, [DOCK, { x: 3021.5, y: 102, z: 11.5 }, LOOKOUT], 1.5, 'gap lookout');
  await sleep(20);

  // Break the timber by hand.
  await walkRoute(player, [{ x: 3021.5, y: 102, z: 11.5 }, DOCK, { x: 3029, y: 102, z: 7.5 }], 1.5, 'timber');
  let broken = 0;
  for (let y = STACK.y0; y <= STACK.y1 && countPlanks(player) < 9; y++) {
    for (let x = STACK.x0; x <= STACK.x1; x++) {
      for (let z = STACK.z1; z >= STACK.z0; z--) {
        if (dimension().getBlock({ x, y, z })?.typeId !== PLANK) continue;
        const ok = player.breakBlock({ x, y, z }, Direction.Up);
        await sleep(80);
        if (ok) broken += 1;
      }
    }
    await sleep(20);
  }
  log(`broke ${broken} timber blocks, holding ${countPlanks(player)} planks by pickup`);
  await sleep(40);

  // Scripted players barely collect drops, so top up. Breaking was already exercised above.
  const shortfall = 9 - countPlanks(player);
  if (shortfall > 0) {
    log(`scripted player collected too few drops; giving ${shortfall} planks`);
    player.getComponent('minecraft:inventory').container.addItem(new ItemStack(PLANK, shortfall));
    await sleep(20);
  }

  await walkRoute(player, [DOCK, { x: 3021.5, y: 102, z: 11.5 }, LOOKOUT], 1.5, 'gap, carrying planks');
  // Place planks from the east edge, each one against the block before it.
  let placed = 0;
  for (let z = GAP.z0; z <= GAP.z1; z++) {
    for (let x = GAP.x1; x >= GAP.x0; x--) {
      const slot = plankSlot(player);
      if (slot < 0) {
        log(`out of planks after ${placed}`);
        break;
      }
      player.selectedSlotIndex = slot;
      const ok = player.useItemInSlotOnBlock(slot, { x: x + 1, y: GAP.y, z }, Direction.West);
      await sleep(10);
      const now = dimension().getBlock({ x, y: GAP.y, z })?.typeId;
      if (now === PLANK) placed += 1;
      else log(`place at ${x},${z}: used=${ok} block=${now}`);
    }
  }
  log(`placed ${placed} of 9 planks`);
  await sleep(40);

  const crossed = await walkRoute(player, [{ x: 3010.5, y: 102, z: 11.5 }, MOLE_END], 2, 'far end of the mole');
  log(`crossed=${crossed}`);
  await sleep(40);

  await walkRoute(player, [{ x: 3010.5, y: 102, z: 11.5 }, LOOKOUT, { x: 3021.5, y: 102, z: 11.5 }, DOCK], 2, 'back to the dock');
  await talkToKarim(player, 'finish');
  await sleep(40);
  const cell = dimension().getBlock({ x: 3013, y: 101, z: 11 })?.typeId;
  log(`repair still in the world: ${cell}`);
  log('finished script');
}

system.runTimeout(() => {
  const check = system.runInterval(() => {
    if (dimension().getEntities({ type: 'miraverse:family_lb_karim' }).length === 0) return;
    system.clearRun(check);
    playQuest().catch((error) => log(`THROW ${error}\n${error?.stack ?? ''}`));
  }, 40);
}, 400);
