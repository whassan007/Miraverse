import { system, world, ItemStack, EntityInventoryComponent, type Player } from '@minecraft/server';
import { PACKS } from './generated/packs.js';
import { buildWorld, spawns, mentorSpots } from './world/index.js';
import { run as runChallenge } from './challenges/index.js';
import { spawnMentor, talk } from './npc/index.js';
import {
  PASSPORT_ITEM,
  addStamp,
  chooseCountry,
  getCountry,
  getStamp,
  isChallengeDone,
  markChallenge,
  showPassport,
} from './core/passport.js';
import { make } from './core/stamp.js';
import type { CountryId } from '../../../packages/content/schema.js';

export { PACKS, buildWorld, runChallenge, spawnMentor, talk };

let worldReady = false;
const busy = new Set<string>();

function hasPassport(player: Player): boolean {
  const inv = (player.getComponent('inventory') as EntityInventoryComponent | undefined)?.container;
  if (!inv) return false;
  for (let i = 0; i < inv.size; i++) if (inv.getItem(i)?.typeId === PASSPORT_ITEM) return true;
  return false;
}

function givePassport(player: Player): void {
  if (hasPassport(player)) return;
  try {
    (player.getComponent('inventory') as EntityInventoryComponent | undefined)?.container?.addItem(new ItemStack(PASSPORT_ITEM, 1));
  } catch {
    player.sendMessage('Passport item unavailable.');
  }
}

function areaReady(cc: CountryId): boolean {
  const s = spawns[cc];
  if (!worldReady || !s) return false;
  try {
    return world.getDimension('overworld').getBlock(s) !== undefined;
  } catch {
    return false;
  }
}

function waitUntilReady(cc: CountryId, tries = 200): Promise<boolean> {
  return new Promise((resolve) => {
    let n = 0;
    const id = system.runInterval(() => {
      if (areaReady(cc)) {
        system.clearRun(id);
        resolve(true);
      } else if (++n >= tries) {
        system.clearRun(id);
        resolve(false);
      }
    }, 20);
  });
}

async function playChapter(player: Player, cc: CountryId): Promise<void> {
  const pack = PACKS.find((p) => p.country === cc);
  const chapter = pack?.chapters.find((c) => c.id === 1) ?? pack?.chapters[0];
  if (!pack || !chapter) return;
  for (const challenge of chapter.challenges.slice(0, 5)) {
    if (isChallengeDone(player, cc, challenge.id)) continue;
    await runChallenge(player, challenge, pack);
    markChallenge(player, cc, challenge.id);
  }
  if (chapter.challenges.slice(0, 5).every((c) => isChallengeDone(player, cc, c.id))) {
    let code = getStamp(player, cc);
    if (!code) {
      code = make(cc, 1);
      addStamp(player, code);
    }
    player.sendMessage(`Souvenir stamp: ${code}`);
  }
}

async function begin(player: Player): Promise<void> {
  if (busy.has(player.id)) return;
  busy.add(player.id);
  try {
    let cc = getCountry(player);
    if (!cc) cc = await chooseCountry(player);
    if (!cc) return;
    if (!(await waitUntilReady(cc))) {
      player.sendMessage('The world is still loading. Use your passport to try again.');
      return;
    }
    const s = spawns[cc];
    if (s) player.teleport(s);
    await playChapter(player, cc);
  } catch (e) {
    player.sendMessage('Something went wrong. Please try again.');
  } finally {
    busy.delete(player.id);
  }
}

world.afterEvents.worldInitialize.subscribe(() => {
  // Wait for chunks to load before building.
  system.runTimeout(() => {
    buildWorld()
      .then(() => {
        for (const p of PACKS) {
          const loc = mentorSpots[p.country];
          if (loc) spawnMentor(p.country, loc);
        }
        worldReady = true;
      })
      .catch(() => {
        worldReady = false;
      });
  }, 100);
});

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  givePassport(ev.player);
  void begin(ev.player);
});

world.afterEvents.itemUse.subscribe((ev) => {
  if (ev.itemStack.typeId !== PASSPORT_ITEM) return;
  const player = ev.source;
  void (async () => {
    await showPassport(player);
    if (getCountry(player) && !busy.has(player.id)) void begin(player);
  })();
});
