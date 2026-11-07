/**
 * Records the open defects from reports/minecraft/root-cause-audit.md. Each `it.fails`
 * states the behavior we want and is expected to fail today. When a repair lands, vitest
 * reports it as an error until `.fails` is removed, so a defect can't be closed by accident.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const MC = 'apps/minecraft';
const read = (file: string) => fs.readFileSync(path.join(MC, file), 'utf8');
const CODES = ['LB', 'IQ', 'EG', 'FR', 'KR', 'DE', 'CN', 'JP', 'RU', 'UA', 'MA'];

function layoutSignature(code: string): string {
  const file = `world/${code}/structures/${code.toLowerCase()}_district_v11.mcstructure.json`;
  const offsets = JSON.parse(read(file)).voxels.map((v: { offset: number[] }) => v.offset.join(','));
  return crypto.createHash('sha1').update(offsets.sort().join(';')).digest('hex');
}

describe('open defects', () => {
  it.fails('Defect 1: city layouts are distinct', () => {
    expect(new Set(CODES.map(layoutSignature)).size).toBe(CODES.length);
  });

  it.fails('Defect 2: quests have no menu shortcuts', () => {
    const code = read('scripts/challenges/build.ts') + read('scripts/challenges/gather.ts');
    expect(code).not.toMatch(/Place all blocks for me|Place the next block for me|`Gather \$/);
  });

  it.fails('Defect 3: NPCs can move and respond', () => {
    const mentor = JSON.parse(read('bp/entities/mentor_lb.json'))['minecraft:entity'].components;
    expect(mentor['minecraft:movement'].value).toBeGreaterThan(0);
    expect(read('scripts/main.ts') + read('scripts/npc/index.ts')).toMatch(/playerInteractWithEntity/);
  });

  it.fails('Defect 5: menus use translation keys', () => {
    expect(read('scripts/atlas/index.ts') + read('scripts/core/passport.ts')).toMatch(/translate:/);
    expect(read('scripts/atlas/index.ts')).not.toMatch(/form\.button\('Leave'\)/);
  });

  it.fails('Defect 6: original five countries have their chapters', () => {
    const { countries } = JSON.parse(read('scripts/generated/atlas.json'));
    const codes = countries.map((c: { code: string }) => c.code);
    for (const code of ['LB', 'IQ', 'EG', 'FR', 'KR']) expect(codes).toContain(code);
  });
});
