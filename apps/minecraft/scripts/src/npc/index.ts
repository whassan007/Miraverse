/**
 * MiraVerse v1.0 Minecraft Bedrock — Mentor & Regional NPC Dialogue Controller
 * (`apps/minecraft/scripts/src/npc/index.ts`)
 * Owner: CL02 (Wave W1–W2)
 */
import type { CountryId } from '../../../../../../packages/content/schema.js';
import type { NpcPlacementSpec, PlayerSaveStateV10 } from '../contracts/index.js';
import { REGIONS_V10 } from '../regions/index.js';
import { acceptCountryQuest } from '../quests/index.js';

export function getNpcsForCountry(country: CountryId): NpcPlacementSpec[] {
  return REGIONS_V10[country]?.npcs || [];
}

export function interactWithNpcV10(
  state: PlayerSaveStateV10,
  country: CountryId,
  npcId: string
): {
  npc: NpcPlacementSpec;
  animationToPlay: NpcPlacementSpec['defaultAnimation'];
  greetingEn: string;
  greetingNative: string;
  questLifecycle: string;
  nextRecommendedChallenge: string;
} {
  const region = REGIONS_V10[country];
  const npc = region.npcs.find((n) => n.npcId === npcId) || region.npcs[0];
  const q = acceptCountryQuest(state, country);
  const nextCh = ['gather', 'trade', 'cook', 'build', 'word'].find(
    (c) => !q.completedChallenges.includes(c as any)
  ) || 'completed';

  return {
    npc,
    animationToPlay: q.lifecycle === 'REWARDED' ? 'celebrate' : npc.role === 'mentor' ? 'greeting' : npc.defaultAnimation,
    greetingEn: npc.dialogueGreetingEn,
    greetingNative: npc.dialogueGreetingNative,
    questLifecycle: q.lifecycle,
    nextRecommendedChallenge: nextCh,
  };
}
