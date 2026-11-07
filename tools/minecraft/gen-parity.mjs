#!/usr/bin/env node
/**
 * Writes reports/minecraft/quest-parity.json from the compiled game data, so each state
 * reflects what the build contains. Run after `npm run compile`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const catalog = read('packages/content/minecraft-global/generated/atlas-catalog.json');
const atlas = read('apps/minecraft/scripts/generated/atlas.json');
const physical = read('apps/minecraft/scripts/generated/physical.json');

const inMinecraftAtlas = new Set(atlas.countries.flatMap((c) => c.chapters.map((ch) => ch.id)));

const rows = catalog.chapters.map((chapter) => {
  const available = inMinecraftAtlas.has(chapter.id);
  return {
    id: chapter.id,
    country: chapter.country,
    roblox: {
      state: 'implemented_generated_activity',
      automatedTest: 'tests/roblox/boot.luau (simulated engine)',
      runtimeTest: 'not_played_in_real_roblox',
    },
    minecraft: {
      state: available ? 'menu_based' : 'missing',
      automatedTest: available ? 'tests/minecraft/atlas-flow.test.ts (simulated API)' : 'none',
      runtimeTest: 'not_run_no_bedrock_runtime',
    },
    objectiveEquivalence: available ? 'partial_shared_design_but_menu_driven' : 'none',
    knownLimitations: available
      ? ['Objectives advance through menus', 'Fails AC-04 until converted to physical gameplay']
      : ['Not offered in Minecraft', 'Blocked until physical quests are proven'],
  };
});

const physicalRows = Object.values(physical.quests).map((quest) => ({
  id: quest.id,
  country: 'LB',
  roblox: { state: 'no_equivalent', automatedTest: 'none', runtimeTest: 'none' },
  minecraft: {
    state: 'physical_behind_staging_flag',
    automatedTest: 'tests/minecraft/physical-flow.test.ts (simulated API)',
    runtimeTest: 'not_run_no_bedrock_runtime',
  },
  objectiveEquivalence: 'minecraft_only_vertical_slice',
  knownLimitations: ['Not in default builds until it runs on a real Bedrock server'],
}));

const count = (fn) => rows.filter(fn).length;
const report = {
  summary: {
    chapters: rows.length,
    minecraftMenuBased: count((r) => r.minecraft.state === 'menu_based'),
    minecraftMissing: count((r) => r.minecraft.state === 'missing'),
    minecraftPhysical: 0,
    physicalSliceQuests: physicalRows.length,
    realGameRuntimeTests: 0,
  },
  chapters: rows,
  physicalQuests: physicalRows,
};
const out = path.join(ROOT, 'reports/minecraft/quest-parity.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
