#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const items = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/assets-src/items/food/food-items-manifest.json'), 'utf8'));
const blocks = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/assets-src/blocks/blocks-kit-manifest.json'), 'utf8'));

if (items.totalItems < 50) throw new Error('Expected >= 50 items, got ' + items.totalItems);
if (blocks.totalCustomBlocks < 40) throw new Error('Expected >= 40 custom blocks, got ' + blocks.totalCustomBlocks);
const ids = new Set();
for (const list of Object.values(items.itemsByRegion || {})) {
  for (const it of list) {
    if (ids.has(it.id)) throw new Error('Duplicate item ID: ' + it.id);
    ids.add(it.id);
  }
}
console.log(`PASS: DX09 verified ${items.totalItems} unique items and ${blocks.totalCustomBlocks} custom blocks.`);
