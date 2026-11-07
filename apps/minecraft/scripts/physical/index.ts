/**
 * Physical quests: objectives advance from what actually happens in the world. Menus here
 * only talk and choose a language; none of them can complete an objective.
 * Each player's progress is stored on that player, so players can't corrupt each other's.
 */
import {
  BlockVolume,
  ItemStack,
  system,
  world,
  type Entity,
  type EntityInventoryComponent,
  type Player,
} from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { LocaleService, type SupportedLocaleId } from '../src/locales/index.js';
import { runFills } from '../world/fill-runner.js';
import physicalData from '../generated/physical.json';

const physical = physicalData as any;
const byblos = physical.settlements.byblos;
const SAVE_KEY = 'mv:physical_v1';
const LOCALE_KEY = 'mv:locale_v1';
const BUILT_KEY = 'mv:physical_built_v1:byblos';
const NPC_TAG = 'miraverse_physical_npc';
const CHECK_TICKS = 10;
const RECOVERY_TICKS = 200;
const DEFAULT_LOCALE: SupportedLocaleId = 'en-US';
const GLOBAL_LOCALE_IDS: SupportedLocaleId[] = [
  'en-US', 'fr-FR', 'fr-CA', 'de-DE', 'zh-Hans-CN', 'ja-JP', 'ru-RU', 'uk-UA', 'ko-KR', 'ar', 'ar-LB', 'ar-IQ', 'ar-EG', 'ar-MA',
];

export interface QuestProgress {
  objective: number;
  done: boolean;
}
export interface PhysicalSave {
  quests: Record<string, QuestProgress>;
  storySparks: number;
  artifacts: string[];
}

export function loadSave(player: Player): PhysicalSave {
  const empty: PhysicalSave = { quests: {}, storySparks: 0, artifacts: [] };
  try {
    const raw = player.getDynamicProperty(SAVE_KEY);
    if (typeof raw !== 'string') return empty;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.quests === 'object' ? { ...empty, ...parsed } : empty;
  } catch {
    return empty;
  }
}

function writeSave(player: Player, save: PhysicalSave): void {
  player.setDynamicProperty(SAVE_KEY, JSON.stringify(save));
}

export function localeOf(player: Player): SupportedLocaleId {
  const value = player.getDynamicProperty(LOCALE_KEY);
  return typeof value === 'string' && (GLOBAL_LOCALE_IDS as string[]).includes(value)
    ? (value as SupportedLocaleId)
    : DEFAULT_LOCALE;
}

const t = (player: Player, key: string): string => LocaleService.translate(localeOf(player), key).text;

function countItem(player: Player, typeId: string): number {
  const container = (player.getComponent('minecraft:inventory') as EntityInventoryComponent | undefined)?.container;
  if (!container) return 0;
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const stack = container.getItem(i);
    if (stack?.typeId === typeId) total += stack.amount;
  }
  return total;
}

function blockAt(p: { x: number; y: number; z: number }): string | undefined {
  try {
    return world.getDimension('overworld').getBlock(p)?.typeId;
  } catch {
    return undefined;
  }
}

/** Checks the real blocks. Returns how many cells are still wrong; unloaded cells count as wrong. */
export function missingCells(objective: any): number {
  return objective.cells.filter((cell: any) => blockAt(cell) !== objective.block).length;
}

const within = (player: Player, at: any, radius: number): boolean => {
  const dx = player.location.x - at.x;
  const dy = player.location.y - at.y;
  const dz = player.location.z - at.z;
  return dx * dx + dz * dz <= radius * radius && Math.abs(dy) <= 4;
};

function placeObjectiveOf(quest: any): any {
  return quest.objectives.find((o: any) => o.type === 'place');
}

/** True when the world or the player's inventory really satisfies this objective. */
export function isSatisfied(player: Player, quest: any, objective: any): boolean {
  switch (objective.type) {
    case 'reach':
      return within(player, objective.at, objective.radius);
    case 'collect': {
      // If someone else already repaired it, nothing more is needed for this player.
      const place = placeObjectiveOf(quest);
      const needed = place ? Math.min(objective.count, missingCells(place)) : objective.count;
      return countItem(player, objective.item) >= needed;
    }
    case 'place':
      return missingCells(objective) === 0;
    default:
      // A talk objective only advances through a real interaction.
      return false;
  }
}

function completeQuest(player: Player, quest: any, save: PhysicalSave): void {
  const progress = save.quests[quest.id];
  if (progress.done) return;
  progress.done = true;
  save.storySparks += quest.reward.storySparks;
  if (!save.artifacts.includes(quest.reward.artifact)) {
    save.artifacts.push(quest.reward.artifact);
    try {
      (player.getComponent('minecraft:inventory') as EntityInventoryComponent | undefined)?.container?.addItem(
        new ItemStack(`miraverse:${quest.reward.artifact}`, 1)
      );
    } catch {
      // This add-on variant doesn't include the item; the save still records the reward.
    }
  }
  player.sendMessage(`§a${t(player, quest.rewardKey)}`);
}

/** Moves a player through every objective that's already true, saving each step. */
export function advance(player: Player, quest: any): void {
  const save = loadSave(player);
  const progress = save.quests[quest.id];
  if (!progress || progress.done) return;
  let changed = false;
  while (progress.objective < quest.objectives.length) {
    const objective = quest.objectives[progress.objective];
    if (!isSatisfied(player, quest, objective)) break;
    progress.objective += 1;
    changed = true;
    const next = quest.objectives[progress.objective];
    if (next) player.sendMessage(`§e${t(player, next.textKey)}`);
  }
  if (changed) writeSave(player, save);
}

async function say(player: Player, title: string, body: string, buttons: string[]): Promise<number | undefined> {
  const form = new ActionFormData().title(title).body(body);
  for (const button of buttons) form.button(button);
  const result = await form.show(player);
  return result.canceled ? undefined : result.selection;
}

/** Dialogue depends on where this player really is in the quest. */
export function dialogueFor(player: Player, quest: any, npcId: string): { key: string; advances: boolean } {
  const text = physical.npcText[npcId];
  if (quest.giver !== npcId) return { key: text.unavailableKey, advances: false };
  const progress = loadSave(player).quests[quest.id];
  if (progress?.done) return { key: text.completeKey, advances: false };
  const objective = quest.objectives[progress?.objective ?? 0];
  if (objective.type === 'talk' && objective.npc === npcId) return { key: objective.dialogueKey, advances: true };
  return { key: objective.dialogueKey, advances: false };
}

export async function talkToNpc(player: Player, npcId: string): Promise<void> {
  const quest = physical.quests.pq_lb_harbor;
  const text = physical.npcText[npcId];
  const { key, advances } = dialogueFor(player, quest, npcId);
  const selection = await say(player, t(player, text.nameKey), t(player, key), [t(player, 'ui.quest.continue')]);
  if (selection === undefined || !advances) return;
  const save = loadSave(player);
  const progress = save.quests[quest.id] ?? { objective: 0, done: false };
  save.quests[quest.id] = progress;
  progress.objective += 1;
  if (progress.objective >= quest.objectives.length) completeQuest(player, quest, save);
  else player.sendMessage(`§e${t(player, quest.objectives[progress.objective].textKey)}`);
  writeSave(player, save);
}

export async function chooseLanguage(player: Player): Promise<void> {
  const selection = await say(
    player,
    t(player, 'ui.language.choose'),
    '',
    GLOBAL_LOCALE_IDS.map((id) => LocaleService.getLocaleMetadata(id)?.name ?? id)
  );
  if (selection !== undefined) player.setDynamicProperty(LOCALE_KEY, GLOBAL_LOCALE_IDS[selection]);
}

function currentObjectiveText(player: Player): string | undefined {
  const quest = physical.quests.pq_lb_harbor;
  const progress = loadSave(player).quests[quest.id];
  if (progress?.done) return undefined;
  return t(player, quest.objectives[progress?.objective ?? 0].textKey);
}

function checkPlayers(): void {
  const quest = physical.quests.pq_lb_harbor;
  for (const player of world.getAllPlayers()) {
    advance(player, quest);
    const text = currentObjectiveText(player);
    if (text && within(player, byblos.landmarks.dock, 90)) player.onScreenDisplay.setActionBar(text);
  }
}

/** Timber regrows if nobody holds enough, so wasted planks can't block a player for good. */
function refillTimber(): void {
  const quest = physical.quests.pq_lb_harbor;
  const objective = placeObjectiveOf(quest);
  if (missingCells(objective) === 0) return;
  const stack = byblos.timberStack;
  try {
    const dimension = world.getDimension('overworld');
    dimension.fillBlocks(new BlockVolume(stack.min, stack.max), objective.block);
  } catch {
    // Chunks not loaded; nobody is nearby to need it.
  }
}

function npcEntities(tag: string): Entity[] {
  return world.getDimension('overworld').getEntities({ tags: [tag] });
}

/** Controlled recovery only: an NPC far from its area or lost is returned; normal movement is AI. */
function recoverNpcs(): void {
  for (const npc of byblos.npcs) {
    const tag = `${NPC_TAG}_${npc.id}`;
    const entities = npcEntities(tag);
    const entity = entities[0];
    if (!entity) continue;
    const dx = entity.location.x - npc.home.x;
    const dz = entity.location.z - npc.home.z;
    if (dx * dx + dz * dz > npc.recoveryRadius * npc.recoveryRadius) entity.teleport(npc.home);
  }
}

function spawnNpcs(): void {
  const dimension = world.getDimension('overworld');
  for (const npc of byblos.npcs) {
    const tag = `${NPC_TAG}_${npc.id}`;
    if (npcEntities(tag).length > 0) continue;
    const entity = dimension.spawnEntity(`miraverse:${npc.id}`, npc.pos);
    entity.addTag(NPC_TAG);
    entity.addTag(tag);
    entity.nameTag = LocaleService.translate(DEFAULT_LOCALE, npc.nameKey).text;
    // He walks to the dock using the game's own pathfinding.
    entity.triggerEvent(npc.event);
  }
}

async function buildByblos(): Promise<void> {
  const failed = await runFills({
    label: 'Byblos',
    areaName: 'mv_physical_byblos',
    bounds: byblos.bounds,
    palette: byblos.palette,
    packedFills: byblos.packedFills,
  });
  if (failed > 0) {
    world.sendMessage(`Byblos: ${failed} sections failed to build. It will retry next time this world loads.`);
    return;
  }
  // The area stays, so Karim keeps walking and the timber can regrow when nobody is nearby.
  spawnNpcs();
  world.setDynamicProperty(BUILT_KEY, true);
}

export const isByblosReady = (): boolean => world.getDynamicProperty(BUILT_KEY) === true;

export function enterByblos(player: Player): void {
  const { x, y, z } = byblos.spawn;
  player.teleport({ x: x + 0.5, y, z: z + 0.5 });
  const text = currentObjectiveText(player);
  if (text) player.sendMessage(`§e${text}`);
}

export function startPhysical(): void {
  world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    const npc = byblos.npcs.find((n: any) => event.target.hasTag(`${NPC_TAG}_${n.id}`));
    if (!npc) return;
    event.cancel = true;
    const { player } = event;
    // Before-events run in read-only mode, so the dialogue opens on the next tick.
    system.run(() => void talkToNpc(player, npc.id));
  });
  const quest = physical.quests.pq_lb_harbor;
  world.afterEvents.playerPlaceBlock.subscribe((event) => advance(event.player, quest));
  world.afterEvents.playerBreakBlock.subscribe((event) => advance(event.player, quest));
  system.runInterval(checkPlayers, CHECK_TICKS);
  system.runInterval(() => {
    if (!isByblosReady()) return;
    recoverNpcs();
    refillTimber();
  }, RECOVERY_TICKS);
  if (!isByblosReady()) void buildByblos();
}
