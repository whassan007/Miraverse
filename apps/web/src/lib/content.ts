import type { CountryId, Lang, Pack, Story } from '../../../../packages/content/schema';
import packsData from '../generated/packs.json';

export const PACKS: Pack[] = (packsData as unknown as Pack[]) ?? [];

export const STORIES: Partial<Record<Lang, Story>> = {};

export function getPack(country: CountryId | string): Pack | undefined {
  return PACKS.find((p) => p.country === country);
}

export function getStory(lang: Lang | string): Story | undefined {
  return STORIES[lang as Lang];
}
