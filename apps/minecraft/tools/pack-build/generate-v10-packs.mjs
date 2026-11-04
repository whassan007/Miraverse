#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { compileContentPacks } from '../content-compiler/compile-v10-content.mjs';
import { buildEntityDescriptor } from '../entity-gen/generate-entities.mjs';
import { generateBlockDefinition } from '../resource-gen/generate-resources.mjs';

const ROOT = process.cwd();
const blocksManifestPath = path.join(ROOT, 'apps/minecraft/assets-src/blocks/blocks-kit-manifest.json');
const blocksKit = JSON.parse(fs.readFileSync(blocksManifestPath, 'utf8'));

const customBlocks = (blocksKit.blocks || []).map((b) => ({
  region: b.country,
  blockId: b.blockId,
  definition: generateBlockDefinition(b.blockId, b.mapColorHex || '#C4A472'),
}));

const entities = [
  buildEntityDescriptor('mentor_lb', 'LB', 'mentor'),
  buildEntityDescriptor('mentor_eg', 'EG', 'mentor'),
  buildEntityDescriptor('mentor_iq', 'IQ', 'mentor'),
  buildEntityDescriptor('mentor_kr', 'KR', 'mentor'),
  buildEntityDescriptor('mentor_fr', 'FR', 'mentor'),
  buildEntityDescriptor('artisan_npc', 'ALL', 'artisan'),
  buildEntityDescriptor('vendor_npc', 'ALL', 'vendor'),
];

const report = {
  generatedAt: new Date().toISOString(),
  customBlocksCount: customBlocks.length,
  entitiesCount: entities.length,
  contentPacks: compileContentPacks(),
  sampleBlock: customBlocks[0],
  sampleEntity: entities[0],
};

fs.writeFileSync(
  path.join(ROOT, 'apps/minecraft/tools/pack-build/pack-generation-manifest.json'),
  JSON.stringify(report, null, 2)
);

if (customBlocks.length < 40) {
  console.error('Expected >= 40 custom blocks, got', customBlocks.length);
  process.exit(1);
}
console.log(`PASS: CX02 generated pack manifest with ${customBlocks.length} custom blocks and ${entities.length} entity templates.`);
