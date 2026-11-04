import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  COUNTRIES,
  CHALLENGE_TYPES,
  COUNTRY_META,
  formatSemanticId,
  parseSemanticId,
  validateSemanticId,
} from '../../packages/contracts/index';
import { migratePackToQuestSpec } from '../../packages/content/migrations/index';

describe('MiraVerse v0.4 Contracts & Content Migration (CX01)', () => {
  it('formats, parses, and validates semantic IDs across all 5 countries', () => {
    for (const c of COUNTRIES) {
      const id = formatSemanticId(c, 1, 'bakery', 'restore');
      expect(validateSemanticId(id)).toBe(true);
      const parsed = parseSemanticId(id);
      expect(parsed).toEqual({
        country: c,
        chapter: 'ch1',
        quest: 'bakery',
        objective: 'restore',
      });
    }
    expect(validateSemanticId('INVALID:id')).toBe(false);
    expect(validateSemanticId('XX:ch1:quest:obj')).toBe(false);
  });

  it('migrates all 5 authoritative v0.1 country packs into v0.4 QuestSemanticSpec', () => {
    for (const c of COUNTRIES) {
      const packPath = path.resolve(process.cwd(), `packages/content/packs/${c}.json`);
      const raw = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
      const spec = migratePackToQuestSpec(raw);
      expect(spec.country).toBe(c);
      expect(spec.mentorName).toBe(COUNTRY_META[c].mentorName);
      expect(spec.objectives).toHaveLength(5);
      expect(spec.objectives.map((o) => o.challengeType)).toEqual([...CHALLENGE_TYPES]);
      for (const obj of spec.objectives) {
        expect(validateSemanticId(obj.objectiveId)).toBe(true);
        expect(obj.miraTokenReward).toBeGreaterThan(0);
      }
    }
  });
});
