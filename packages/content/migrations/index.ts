/**
 * Content Migration Adapter (`packages/content/migrations/index.ts`)
 * Adapts authoritative v0.1 country packs and stories into v0.4 QuestSemanticSpec structures.
 */
import {
  COUNTRIES,
  COUNTRY_META,
  formatSemanticId,
  type ChallengeType,
  type CountryCode,
  type QuestObjectiveSpec,
  type QuestSemanticSpec,
} from '../../contracts/index';
import type { PackFile } from '../schema';

export function migratePackToQuestSpec(pack: PackFile): QuestSemanticSpec {
  const country = pack.country as CountryCode;
  const meta = COUNTRY_META[country];
  const questSlug = country === 'FR' ? 'bakery' : country === 'LB' ? 'harbor' : country === 'EG' ? 'lantern' : country === 'IQ' ? 'shanasheel' : 'hanok';
  const questId = `${country}:ch1:${questSlug}:main`;

  const orderedKinds: ChallengeType[] = ['gather', 'trade', 'build', 'cook', 'word'];
  const objectives: QuestObjectiveSpec[] = orderedKinds.map((kind) => {
    const ch = pack.challenges.find((c) => c.kind === kind);
    const objectiveId = formatSemanticId(country, 1, questSlug, kind);
    return {
      objectiveId,
      challengeType: kind,
      title: ch?.title || `${meta.nameEn} ${kind} challenge`,
      description: ch?.instructions || `Complete the ${kind} step with ${meta.mentorName}.`,
      targetNpcId: meta.mentorId,
      targetStationId: `station:${country}:${kind}`,
      requiredItems: (pack.items || []).slice(0, 3).map((it) => ({
        itemId: `item:${country}:${it.id}`,
        quantity: 1,
        labelEn: it.nameEn,
        labelNative: it.nameNative,
      })),
      rewardItems: [
        {
          itemId: `item:${country}:${kind}_token`,
          quantity: 1,
          labelEn: `${meta.nameEn} ${kind.toUpperCase()} Keepsake`,
        },
      ],
      miraTokenReward: 20,
      culturalFact: pack.Overview || `Discover ${meta.regionName} with ${meta.mentorName}.`,
      vocabWords: (pack.items || []).slice(0, 3).map((it, idx) => ({
        word: it.nameNative,
        translit: it.id.replace(/_/g, ' '),
        en: it.nameEn,
        objectId: `prop:${country}:word_${idx + 1}`,
      })),
    };
  });

  return {
    questId,
    country,
    chapter: 1,
    titleEn: pack.chapterTitle || `${meta.nameEn}: ${meta.signatureDish}`,
    titleNative: meta.nameNative,
    synopsis: pack.Overview || `Explore ${meta.regionName} alongside ${meta.mentorName}.`,
    mentorId: meta.mentorId,
    mentorName: meta.mentorName,
    landmarkId: `landmark:${country}:main`,
    objectives,
    completionReward: {
      rewardId: `reward:${country}:ch1_keepsake`,
      keepsakeNameEn: `${meta.landmarkName} Golden Keepsake`,
      keepsakeNameNative: meta.nameNative,
      miraTokensBonus: 50,
      stampChapter: 1,
    },
  };
}

export function isValidCountryCode(code: string): code is CountryCode {
  return COUNTRIES.includes(code as CountryCode);
}
