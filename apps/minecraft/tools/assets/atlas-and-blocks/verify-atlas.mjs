#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blocks = JSON.parse(fs.readFileSync(path.join(root, 'apps/minecraft/assets-src/blocks/blocks-kit-manifest.json'), 'utf8'));
const items = JSON.parse(fs.readFileSync(path.join(root, 'apps/minecraft/assets-src/items/food/food-items-manifest.json'), 'utf8'));

let count = 0;
for (const b of blocks.blocks || []) {
  const p = path.join(root, b.textureSource);
  if (!fs.existsSync(p)) throw new Error('Missing block texture PNG: ' + p);
  count++;
}
for (const list of Object.values(items.itemsByRegion || {})) {
  for (const it of list) {
    const p = path.join(root, 'apps/minecraft/assets-src/items/food', it.tex + '.png');
    if (!fs.existsSync(p)) throw new Error('Missing item texture PNG: ' + p);
    count++;
  }
}
console.log(`PASS: DX17 verified ${count} item and terrain texture atlas references.`);
