import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validatePack, validateWorkspace } from '../tools/validate.js';
import { compileFixturePacks } from './compiler/compiler.js';
import { createValidPack, createValidPackEG, createValidPackFR } from './content/fixtures.js';

describe('pack compiler determinism and collision detection', () => {
  it('produces byte-for-byte identical outputs across two successive compiler invocations on fixture packs', () => {
    const firstInput = [createValidPack(), createValidPackFR(), createValidPackEG()];
    const secondInput = [createValidPack(), createValidPackFR(), createValidPackEG()];

    const firstOut = compileFixturePacks(firstInput);
    const secondOut = compileFixturePacks(secondInput);

    expect(Buffer.compare(Buffer.from(firstOut.webJson, 'utf-8'), Buffer.from(secondOut.webJson, 'utf-8'))).toBe(0);
    expect(
      Buffer.compare(Buffer.from(firstOut.robloxLuau, 'utf-8'), Buffer.from(secondOut.robloxLuau, 'utf-8'))
    ).toBe(0);
    expect(
      Buffer.compare(Buffer.from(firstOut.minecraftJson, 'utf-8'), Buffer.from(secondOut.minecraftJson, 'utf-8'))
    ).toBe(0);
    expect(firstOut).toEqual(secondOut);
  });

  it('sorts countries and item IDs deterministically regardless of input pack or item ordering', () => {
    const packLB = createValidPack();
    const packFR = createValidPackFR();
    const packEG = createValidPackEG();

    const packLBShuffled = createValidPack();
    packLBShuffled.items = [...packLBShuffled.items].reverse();
    packLBShuffled.regions = [...packLBShuffled.regions].reverse();

    const packFRShuffled = createValidPackFR();
    packFRShuffled.items = [...packFRShuffled.items].reverse();

    const packEGShuffled = createValidPackEG();
    packEGShuffled.items = [...packEGShuffled.items].reverse();

    const runA = compileFixturePacks([packLB, packFR, packEG]);
    const runB = compileFixturePacks([packEGShuffled, packLBShuffled, packFRShuffled]);

    expect(runA.countries).toEqual(['EG', 'FR', 'LB']);
    expect(runB.countries).toEqual(['EG', 'FR', 'LB']);

    expect(runA.itemsByCountry.EG).toEqual([
      'alabaster_stone',
      'koshari_bowl',
      'nile_clay',
      'papyrus_reed',
      'red_lentils',
      'white_rice',
    ]);
    expect(runA.itemsByCountry.FR).toEqual([
      'brioche_loaf',
      'lavender_bundle',
      'oak_beam',
      'slate_tile',
      'sweet_butter',
      'wheat_flour',
    ]);
    expect(runA.itemsByCountry.LB).toEqual([
      'cedar_plank',
      'limestone_block',
      'manoushe_flatbread',
      'olive_oil',
      'pita_dough',
      'woven_basket',
      'zaatar_herb',
    ]);

    expect(Buffer.compare(Buffer.from(runA.webJson, 'utf-8'), Buffer.from(runB.webJson, 'utf-8'))).toBe(0);
    expect(Buffer.compare(Buffer.from(runA.robloxLuau, 'utf-8'), Buffer.from(runB.robloxLuau, 'utf-8'))).toBe(0);
    expect(Buffer.compare(Buffer.from(runA.minecraftJson, 'utf-8'), Buffer.from(runB.minecraftJson, 'utf-8'))).toBe(0);
  });

  it('detects item ID collisions within a single pack and across fixture packs', () => {
    // 1. Intra-pack duplicate item ID
    const duplicateInPack = createValidPack();
    duplicateInPack.items.push({
      id: 'cedar_plank',
      name_en: 'Duplicate Cedar Plank',
      color: '#8B5A2B',
    });

    const packErrors = validatePack(duplicateInPack, 'packs/LB.json');
    expect(packErrors).toContain("packs/LB.json#/items/7/id: duplicate item id 'cedar_plank'");
    expect(() => compileFixturePacks([duplicateInPack])).toThrow(/collision.*cedar_plank/i);

    // 2. Cross-pack item ID collision
    const packLB = createValidPack();
    const packFRWithCollision = createValidPackFR();
    packFRWithCollision.items[0].id = 'cedar_plank';
    // Update references in FR challenges so FR remains structurally valid on its own
    packFRWithCollision.chapters[0].challenges[0].needs![0].item = 'cedar_plank';
    packFRWithCollision.chapters[0].challenges[1].recipe!.inputs[0] = 'cedar_plank';

    expect(validatePack(packFRWithCollision, 'packs/FR.json')).toEqual([]);
    expect(() => compileFixturePacks([packLB, packFRWithCollision])).toThrow(/collision.*cedar_plank/i);

    // 3. Global item ID collision when two packs for the same country are compiled together
    const packLBDuplicateCountry = createValidPack();
    expect(() => compileFixturePacks([packLB, packLBDuplicateCountry])).toThrow(
      /Global item ID collision detected: 'lb_cedar_plank'/
    );

    // 4. Workspace validation detects invalid pack item IDs on disk
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-compiler-collision-'));
    try {
      const packsDir = path.join(tmpRoot, 'packages/content/packs');
      fs.mkdirSync(packsDir, { recursive: true });
      fs.writeFileSync(path.join(packsDir, 'LB.json'), JSON.stringify(duplicateInPack, null, 2));

      const wsErrors = validateWorkspace(tmpRoot, 'structural');
      expect(wsErrors).toContain("packs/LB.json#/items/7/id: duplicate item id 'cedar_plank'");
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
