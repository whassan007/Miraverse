import type { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { COUNTRIES, type CountryId } from '../../../../packages/content/schema.js';
import { PACKS } from '../generated/packs.js';
import { verify } from './stamp.js';

export const PASSPORT_ITEM = 'miraverse:passport';
const K_COUNTRY = 'mv:country';
const K_PROGRESS = 'mv:progress';
const K_STAMPS = 'mv:stamps';

function readJson<T>(player: Player, key: string, fallback: T): T {
  try {
    const raw = player.getDynamicProperty(key);
    if (typeof raw !== 'string') return fallback;
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getCountry(player: Player): CountryId | undefined {
  const c = player.getDynamicProperty(K_COUNTRY);
  return typeof c === 'string' && (COUNTRIES as string[]).includes(c) ? (c as CountryId) : undefined;
}

export function setCountry(player: Player, cc: CountryId): void {
  player.setDynamicProperty(K_COUNTRY, cc);
}

/** Map of "<CC>:<challengeId>" -> true */
export function getProgress(player: Player): Record<string, boolean> {
  const v = readJson<Record<string, boolean>>(player, K_PROGRESS, {});
  return Array.isArray(v) ? {} : v;
}

export function markChallenge(player: Player, cc: CountryId, challengeId: string): void {
  const p = getProgress(player);
  p[`${cc}:${challengeId}`] = true;
  player.setDynamicProperty(K_PROGRESS, JSON.stringify(p));
}

export function isChallengeDone(player: Player, cc: CountryId, challengeId: string): boolean {
  return getProgress(player)[`${cc}:${challengeId}`] === true;
}

export function getStamps(player: Player): string[] {
  const v = readJson<unknown[]>(player, K_STAMPS, []);
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && verify(s) !== null) : [];
}

/** Add a stamp, deduplicated by (country, chapter). Returns false if already held. */
export function addStamp(player: Player, code: string): boolean {
  const info = verify(code);
  if (!info) return false;
  const stamps = getStamps(player);
  if (stamps.some((s) => {
    const i = verify(s);
    return i && i.country === info.country && i.chapter === info.chapter;
  })) return false;
  stamps.push(code);
  player.setDynamicProperty(K_STAMPS, JSON.stringify(stamps));
  return true;
}

export function getStamp(player: Player, cc: CountryId): string | undefined {
  return getStamps(player).find((s) => verify(s)?.country === cc);
}

/** Show the Passport UI. Local-only; nothing leaves the world. */
export async function showPassport(player: Player): Promise<void> {
  const current = getCountry(player);
  const stamps = getStamps(player);
  const progress = getProgress(player);
  const lines: string[] = [];
  for (const pack of PACKS) {
    const total = pack.chapters.flatMap((c) => c.challenges).length;
    const done = pack.chapters
      .flatMap((c) => c.challenges)
      .filter((c) => progress[`${pack.country}:${c.id}`]).length;
    const stamp = stamps.find((s) => verify(s)?.country === pack.country);
    lines.push(
      `${pack.country === current ? '> ' : ''}${pack.name_en}: ${done}/${total}${stamp ? `  ${stamp}` : ''}`,
    );
  }
  const form = new ActionFormData()
    .title('MiraVerse Passport')
    .body(`${lines.join('\n')}\n\nStamps: ${stamps.length}/${PACKS.length}\nProgress is saved only in this world.`)
    .button('Close');
  await form.show(player);
}

/** Country selection form; returns the chosen country (and saves it) or undefined if dismissed. */
export async function chooseCountry(player: Player): Promise<CountryId | undefined> {
  const form = new ActionFormData().title('Choose your adventure').body('Where would you like to start?');
  for (const p of PACKS) form.button(p.name_en);
  const res = await form.show(player);
  if (res.canceled || res.selection === undefined) return undefined;
  const pack = PACKS[res.selection];
  if (!pack) return undefined;
  setCountry(player, pack.country);
  return pack.country;
}
