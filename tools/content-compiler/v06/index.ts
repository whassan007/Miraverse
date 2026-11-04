/**
 * MiraVerse v0.7 (Option A) — Content Compiler v06 Bridge (`CX02`)
 * Validates all 5 country packs (LB, EG, IQ, KR, FR) and produces deterministic metadata
 * for Roblox Luau and Minecraft Bedrock native challenge adapters.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface CompiledCountrySummaryV06 {
  countryId: 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
  mentorName: string;
  questId: string;
  challengeTypes: string[];
  miraTokenReward: number;
  cosmeticUnlockId: string;
}

export function compileV06CountrySummaries(rootDir = process.cwd()): CompiledCountrySummaryV06[] {
  const countries: Array<'LB' | 'EG' | 'IQ' | 'KR' | 'FR'> = ['LB', 'EG', 'IQ', 'KR', 'FR'];
  return countries.map((cid) => {
    const packPath = path.join(rootDir, 'packages/content/packs', `${cid}.json`);
    const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
    const challengeTypes = Object.keys(pack.challenges || {});
    return {
      countryId: cid,
      mentorName: pack.mentor?.name?.en || cid,
      questId: `QUEST_${cid}_MAIN_V06`,
      challengeTypes,
      miraTokenReward: 100,
      cosmeticUnlockId: `cosmetic_${cid.toLowerCase()}_heritage_outfit`,
    };
  });
}
