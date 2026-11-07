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
import { MiraVerseBedrockRuntimeV10, MiraVerseGlobalRuntimeV11 } from './src/bootstrap/index.js';
import { REGIONS_V10 } from './src/regions/index.js';
import { COUNTRIES_V10 } from './src/contracts/index.js';
import { claimChapterPassportReward } from './src/passport/index.js';
import { StructureBuilderV10 } from './src/structures/index.js';
import { BedrockUiFormsV10 } from './src/ui/index.js';
import type { CountryId } from '../../../packages/content/schema.js';
import { buildAtlasWorld, isAtlasCountry, playAtlasCountry, waitForAtlasArea } from './atlas/index.js';
import { chooseLanguage, enterByblos, isByblosReady, startPhysical } from './physical/index.js';
import { buildPhoeniciaWorld, startPhoenicia, enterPhoenicia } from './src/phoenicia/bedrock.js';

declare const __MV_PHOENICIA__: boolean;
declare const __MV_PHYSICAL__: boolean;

export const runtimeV10 = new MiraVerseBedrockRuntimeV10();
export {
  PACKS,
  buildWorld,
  runChallenge,
  spawnMentor,
  talk,
  MiraVerseBedrockRuntimeV10,
  REGIONS_V10,
  COUNTRIES_V10,
  claimChapterPassportReward,
  StructureBuilderV10,
  BedrockUiFormsV10,
};

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
    if (__MV_PHYSICAL__ && cc === 'LB' && isByblosReady()) {
      await chooseLanguage(player);
      enterByblos(player);
      return;
    }
    if (isAtlasCountry(cc)) {
      if (!(await waitForAtlasArea(cc))) {
        player.sendMessage('The world is still loading. Use your passport to try again.');
        return;
      }
      await playAtlasCountry(player, cc);
      return;
    }
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
  if (__MV_PHYSICAL__) system.runTimeout(() => startPhysical(), 120);
  if (__MV_PHOENICIA__) {
    startPhoenicia();
    system.runTimeout(() => buildPhoeniciaWorld(), 100);
  }
  // Wait for chunks to load before building.
  system.runTimeout(() => {
    buildWorld()
      .then(() => {
        for (const p of PACKS) {
          const loc = mentorSpots[p.country];
          if (loc) spawnMentor(p.country, loc);
        }
        worldReady = true;
        buildAtlasWorld();
      })
      .catch(() => {
        worldReady = false;
      });
  }, 100);
});

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  givePassport(ev.player);
  if (__MV_PHOENICIA__) {
    enterPhoenicia(ev.player);
    return;
  }
  void begin(ev.player);
});

world.afterEvents.itemUse.subscribe((ev) => {
  if (ev.itemStack.typeId !== PASSPORT_ITEM) return;
  const player = ev.source;
  void (async () => {
    if (busy.has(player.id)) return;
    const changeCountry = await showPassport(player);
    if (changeCountry) {
      const picked = await chooseCountry(player);
      if (!picked) return;
    }
    if (getCountry(player) && !busy.has(player.id)) void begin(player);
  })();
});

export const runtimeGlobalV11 = new MiraVerseGlobalRuntimeV11();
export { MiraVerseGlobalRuntimeV11 };
