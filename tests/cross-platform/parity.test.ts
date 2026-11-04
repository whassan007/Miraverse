import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { COUNTRIES, CHALLENGE_TYPES } from '../../packages/contracts/index';

describe('MiraVerse v0.4 75-Cell Cross-Platform Semantic Parity (CL10)', () => {
  it('maintains identical sourceContentHash and 25 country-challenge objectives across Web, Roblox, and Minecraft', () => {
    const webBundle = JSON.parse(fs.readFileSync(path.resolve('apps/web/src/generated/v04-bundle.json'), 'utf-8'));
    const robloxLuau = fs.readFileSync(path.resolve('apps/roblox/src/shared/V04Bundle.luau'), 'utf-8');
    const mcTs = fs.readFileSync(path.resolve('apps/minecraft/scripts/generated/v04-bundle.ts'), 'utf-8');

    expect(webBundle.quests).toHaveLength(5);
    expect(robloxLuau).toContain(webBundle.sourceContentHash);
    expect(mcTs).toContain(webBundle.sourceContentHash);

    for (const c of COUNTRIES) {
      const q = webBundle.quests.find((x: any) => x.country === c);
      expect(q).toBeDefined();
      expect(q.objectives.map((o: any) => o.challengeType)).toEqual([...CHALLENGE_TYPES]);
      for (const obj of q.objectives) {
        expect(robloxLuau).toContain(obj.objectiveId);
        expect(mcTs).toContain(obj.objectiveId);
      }
    }
  });
});
