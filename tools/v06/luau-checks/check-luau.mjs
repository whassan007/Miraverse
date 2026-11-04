#!/usr/bin/env node
/**
 * MiraVerse v0.7 (Option A) — Static Luau & Rojo Project Consistency Check (`DX02`)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const projPath = path.join(root, 'apps/roblox/default.project.json');
const proj = JSON.parse(fs.readFileSync(projPath, 'utf-8'));

const requiredDirs = [
  'apps/roblox/src/server',
  'apps/roblox/src/client',
  'apps/roblox/src/shared',
];

for (const d of requiredDirs) {
  if (!fs.existsSync(path.join(root, d))) {
    console.error('Missing required Roblox directory:', d);
    process.exit(1);
  }
}

// Verify zero external Stripe or checkout URLs exist in any Luau script
function walkLuau(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkLuau(full));
    else if (e.name.endsWith('.luau')) files.push(full);
  }
  return files;
}

const luauFiles = walkLuau(path.join(root, 'apps/roblox/src'));
for (const f of luauFiles) {
  const src = fs.readFileSync(f, 'utf-8');
  if (/checkout\.stripe\.com/i.test(src)) {
    console.error('Forbidden external Stripe URL in Luau file:', f);
    process.exit(1);
  }
}

console.log(JSON.stringify({ status: 'PASS', project: proj.name, luauFilesChecked: luauFiles.length }));
