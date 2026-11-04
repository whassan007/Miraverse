#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Repository Inventory, Non-Destructive Migration & Rollback Tool (`tools/v12/migration/inventory.mjs`)
 * Owner: CX01 (Wave W0)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const countries = ['LB', 'IQ', 'EG', 'FR', 'KR'];

function sha256File(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
}

const baselineInventory = {
  generated_at: new Date().toISOString(),
  owner: 'CX01',
  country_sequence: countries,
  preserved_files: {},
  country_summary: {},
};

const trackedRelPaths = [
  'packages/content/schema.ts',
  ...countries.map((c) => `packages/content/packs/${c}.json`),
  ...countries.map((c) => `content/quests/${c}.json`),
  ...countries.map((c) => `content/dialogue/${c}.json`),
  'packages/content/stories/ar-LB.json',
  'packages/content/stories/ar-IQ.json',
  'packages/content/stories/ar-EG.json',
  'packages/content/stories/fr.json',
  'packages/content/stories/ko.json',
];

for (const rel of trackedRelPaths) {
  baselineInventory.preserved_files[rel] = {
    sha256: sha256File(rel),
    exists: fs.existsSync(path.join(root, rel)),
  };
}

for (const c of countries) {
  const pack = JSON.parse(fs.readFileSync(path.join(root, `packages/content/packs/${c}.json`), 'utf8'));
  const quest = JSON.parse(fs.readFileSync(path.join(root, `content/quests/${c}.json`), 'utf8'));
  const dlg = JSON.parse(fs.readFileSync(path.join(root, `content/dialogue/${c}.json`), 'utf8'));
  baselineInventory.country_summary[c] = {
    name_en: pack.name_en,
    lang: pack.lang,
    mentor: pack.mentor.name,
    legacy_quest_id: quest.questId,
    pack_item_ids: pack.items.map((i) => i.id),
    pack_challenge_ids: pack.chapters[0].challenges.map((ch) => ch.id),
    quest_objective_ids: quest.objectives.map((o) => o.objectiveId),
    npc_ids: dlg.map((d) => d.npcId),
    regions: pack.regions.map((r) => r.id),
  };
}

const outDir = path.join(root, 'tools/v12/migration');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'baseline-snapshot.json'), JSON.stringify(baselineInventory, null, 2) + '\n', 'utf8');
console.log('CX01 baseline snapshot generated for', countries.join(' -> '));
