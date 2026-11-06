/**
 * Plays the Atlas countries (Germany, China, Japan, Russia, Ukraine, Morocco) through the
 * existing challenge runners, and places their city districts.
 */
import { BlockVolume, UnloadedChunksError, system, world, type Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { run as runChallenge } from '../challenges/index.js';
import { say, show } from '../challenges/util.js';
import { buildOrigins } from '../world/index.js';
import atlasData from '../generated/atlas.json';

const atlas = atlasData as any;
const BUILT_PREFIX = 'mv:atlas_built_v1:';
const PROGRESS_KEY = 'mv:atlas_progress_v1';
const CHUNK_WAIT_TICKS = 6000;
const AREA_RETRY_TICKS = 20;
const NPC_TAG = 'miraverse_atlas_npc';
const BUILD_OFFSET = 2;

export const ATLAS_COUNTRIES: { code: string; name: string }[] = atlas.countries.map((c: any) => ({
  code: c.code,
  name: c.name,
}));

export function isAtlasCountry(code: string | undefined): boolean {
  return ATLAS_COUNTRIES.some((c) => c.code === code);
}

const countryOf = (code: string) => atlas.countries.find((c: any) => c.code === code);
const builtKey = (code: string) => `${BUILT_PREFIX}${code}`;

export interface AtlasProgress {
  completed: string[];
  artifacts: string[];
  storySparks: number;
  stamps: string[];
}

export function loadProgress(player: Player): AtlasProgress {
  const empty: AtlasProgress = { completed: [], artifacts: [], storySparks: 0, stamps: [] };
  try {
    const raw = player.getDynamicProperty(PROGRESS_KEY);
    if (typeof raw !== 'string') return empty;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.completed) || !Array.isArray(parsed?.artifacts)) return empty;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function saveProgress(player: Player, progress: AtlasProgress): void {
  player.setDynamicProperty(PROGRESS_KEY, JSON.stringify(progress));
}

export function isUnlocked(chapter: any, progress: AtlasProgress): boolean {
  return !chapter.prerequisite || progress.completed.includes(chapter.prerequisite);
}

/** Records a finished chapter. Rewards are granted once, even if it is replayed. */
export function recordCompletion(progress: AtlasProgress, country: any, chapter: any): boolean {
  if (progress.completed.includes(chapter.id)) return false;
  progress.completed.push(chapter.id);
  progress.artifacts.push(chapter.artifactName);
  progress.storySparks += chapter.storySparks;
  const finishedCountry = country.chapters.every((c: any) => progress.completed.includes(c.id));
  if (finishedCountry && !progress.stamps.includes(country.stampName)) progress.stamps.push(country.stampName);
  return true;
}

/** Adapts an Atlas country to the shape the challenge runners expect. */
function packFor(country: any): any {
  return {
    country: country.code,
    name_en: country.name,
    mentor: { name: country.mentorName },
    items: Object.entries(country.items).map(([id, name]) => ({ id, name_en: name })),
    chapters: [],
    atlasBlocks: country.blocks,
  };
}

async function runSource(player: Player, challenge: any): Promise<boolean> {
  for (;;) {
    const form = new ActionFormData().title(challenge.title_en);
    form.body(`${challenge.goal_en}\n\nWhat kind of story is this?`);
    for (const option of challenge.options) form.button(option.label);
    form.button('Leave');
    const selection = await show(player, form);
    if (selection === undefined || selection >= challenge.options.length) return false;
    if (challenge.options[selection].id === challenge.answer) {
      say(player, '§aThat is right!');
      return true;
    }
    say(player, '§eNot that one. Try again!');
  }
}

async function playChapter(player: Player, country: any, chapter: any): Promise<void> {
  const { x, y, z } = chapter.location;
  player.teleport({ x: x + 0.5, y, z: z + 0.5 });
  (buildOrigins as Record<string, { x: number; y: number; z: number }>)[country.code] = {
    x: x + BUILD_OFFSET,
    y,
    z: z + BUILD_OFFSET,
  };
  say(player, chapter.greeting);
  const pack = packFor(country);
  for (const challenge of chapter.challenges) {
    const finished =
      challenge.type === 'source' ? await runSource(player, challenge) : await runChallenge(player, challenge, pack);
    // Leaving a challenge returns to the chapter menu. Nothing is lost.
    if (!finished) return;
  }
  const progress = loadProgress(player);
  if (recordCompletion(progress, country, chapter)) {
    saveProgress(player, progress);
    say(player, `§a${chapter.completion}`);
    if (progress.stamps.includes(country.stampName)) say(player, `§6${country.stampName}`);
  } else {
    say(player, `§a${chapter.title}: replayed!`);
  }
}

/** Chapter menu. Returns when the player leaves it. */
export async function playAtlasCountry(player: Player, code: string): Promise<void> {
  const country = countryOf(code);
  if (!country) return;
  player.teleport({ x: country.spawn.x + 0.5, y: country.spawn.y, z: country.spawn.z + 0.5 });
  for (;;) {
    const progress = loadProgress(player);
    const form = new ActionFormData().title(country.name).body(`${country.story}\n\nGuide: ${country.mentorName}`);
    for (const chapter of country.chapters) {
      const status = progress.completed.includes(chapter.id)
        ? ' (Completed)'
        : isUnlocked(chapter, progress)
          ? ''
          : ' (Locked)';
      form.button(`${chapter.index}. ${chapter.title}${status}`);
    }
    form.button('Leave');
    const selection = await show(player, form);
    if (selection === undefined || selection >= country.chapters.length) return;
    const chapter = country.chapters[selection];
    if (!isUnlocked(chapter, progress)) {
      say(player, '§eFinish the chapter before this one first.');
      continue;
    }
    await playChapter(player, country, chapter);
  }
}

export function atlasPassportLines(player: Player): string[] {
  const progress = loadProgress(player);
  return atlas.countries.map((country: any) => {
    const done = country.chapters.filter((c: any) => progress.completed.includes(c.id)).length;
    const stamp = progress.stamps.includes(country.stampName) ? `  ${country.stampName}` : '';
    return `${country.name}: ${done}/${country.chapters.length}${stamp}`;
  });
}

export function isAtlasAreaReady(code: string): boolean {
  try {
    return world.getDynamicProperty(builtKey(code)) === true;
  } catch {
    return false;
  }
}

function runAreaCommand(command: string): void {
  try {
    world.getDimension('overworld').runCommand(command);
  } catch {
    // The area may already exist, or may already be gone.
  }
}

function spawnNpcs(country: any): void {
  const dimension = world.getDimension('overworld');
  for (const npc of country.npcs) {
    const tag = `${NPC_TAG}_${npc.id}`;
    if (dimension.getEntities({ tags: [tag] }).length > 0) continue;
    const entity = dimension.spawnEntity(`miraverse:${npc.id}`, npc.pos);
    entity.addTag(NPC_TAG);
    entity.addTag(tag);
    entity.nameTag = npc.name;
  }
}

/** Places one district. Partial builds aren't marked done, so the next world load retries. */
function* buildDistrict(country: any): Generator<void, void, void> {
  const name = `mv_atlas_${country.code.toLowerCase()}`;
  const { min, max } = country.bounds;
  runAreaCommand(`tickingarea add ${min[0]} ${min[1]} ${min[2]} ${max[0]} ${max[1]} ${max[2]} ${name} true`);
  const dimension = world.getDimension('overworld');
  let failed = 0;
  for (const [ax, ay, az, bx, by, bz, blockIndex] of country.packedFills) {
    const block = country.palette[blockIndex];
    const deadline = system.currentTick + CHUNK_WAIT_TICKS;
    for (;;) {
      try {
        dimension.fillBlocks(new BlockVolume({ x: ax, y: ay, z: az }, { x: bx, y: by, z: bz }), block);
        break;
      } catch (error) {
        if (error instanceof UnloadedChunksError && system.currentTick < deadline) {
          yield;
          continue;
        }
        failed += 1;
        console.warn(`Atlas: fill failed in ${country.code} for ${block}: ${error}`);
        break;
      }
    }
    yield;
  }
  try {
    spawnNpcs(country);
  } catch (error) {
    failed += 1;
    console.warn(`Atlas: NPC spawn failed in ${country.code}: ${error}`);
  }
  if (failed === 0) {
    world.setDynamicProperty(builtKey(country.code), true);
    // The area has done its job; it would otherwise keep chunks loaded forever.
    runAreaCommand(`tickingarea remove ${name}`);
  } else {
    world.sendMessage(`Some of ${country.name} could not be built. It will retry next time this world loads.`);
  }
}

export function buildAtlasWorld(): void {
  system.runJob(
    (function* () {
      for (const country of atlas.countries) {
        if (!isAtlasAreaReady(country.code)) yield* buildDistrict(country);
      }
    })()
  );
}

export function waitForAtlasArea(code: string, tries = 300): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    const handle = system.runInterval(() => {
      if (isAtlasAreaReady(code)) {
        system.clearRun(handle);
        resolve(true);
      } else if (++attempts >= tries) {
        system.clearRun(handle);
        resolve(false);
      }
    }, AREA_RETRY_TICKS);
  });
}
