import type { CountryId, Lang, Pack, Story } from '../../../../packages/content/schema';
import packsData from '../generated/packs.json';

export const PACKS: Pack[] = packsData as unknown as Pack[];

const storyModules = import.meta.glob<Story>('../../../../packages/content/stories/*.json', {
  eager: true,
  import: 'default',
});

export const STORIES: Partial<Record<Lang, Story>> = {};
for (const path of Object.keys(storyModules).sort()) {
  const story = storyModules[path];
  STORIES[story.lang] = story;
}

export type VocabularyEntry = Story['vocab'][number];
export type VocabularyFile = VocabularyEntry[] | {
  lang: Lang;
  country?: CountryId;
  words?: VocabularyEntry[];
  vocab?: VocabularyEntry[];
};

const vocabModules = import.meta.glob<VocabularyFile>('../../../../packages/content/vocab/*.json', {
  eager: true,
  import: 'default',
});

export const VOCAB: Partial<Record<Lang, VocabularyFile>> = {};
for (const path of Object.keys(vocabModules).sort()) {
  const vocab = vocabModules[path];
  const lang = Array.isArray(vocab) ? path.split('/').pop()!.replace(/\.json$/, '') as Lang : vocab.lang;
  VOCAB[lang] = vocab;
}

export function getPack(country: CountryId | string): Pack | undefined {
  return PACKS.find((pack) => pack.country === country);
}

export function getStory(lang: Lang | string): Story | undefined {
  return STORIES[lang as Lang];
}
