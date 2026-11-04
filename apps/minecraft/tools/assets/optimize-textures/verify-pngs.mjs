#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function findPngs(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findPngs(full, out);
    else if (e.name.endsWith('.png')) out.push(full);
  }
  return out;
}

const pngs = [
  ...findPngs(path.join(process.cwd(), 'apps/minecraft/rp')),
  ...findPngs(path.join(process.cwd(), 'apps/minecraft/assets-src')),
];

for (const p of pngs) {
  const buf = fs.readFileSync(p);
  if (buf[0] !== 0x89 || buf[1] !== 0x50) throw new Error('Invalid PNG header: ' + p);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if ((w & (w - 1)) !== 0 || (h & (h - 1)) !== 0) {
    throw new Error(`Non-power-of-two PNG (${w}x${h}): ${p}`);
  }
}
console.log(`PASS: DX16 verified ${pngs.length} PNG textures have valid headers and power-of-two dimensions.`);
