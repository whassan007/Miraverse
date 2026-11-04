#!/usr/bin/env node
/**
 * MiraVerse v0.7 (Option A) — Bedrock Manifest, UUID, Stable API & Structure Validator (`DX13`)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bpManifest = JSON.parse(fs.readFileSync(path.join(root, 'apps/minecraft/bp/manifest.json'), 'utf-8'));
const rpManifest = JSON.parse(fs.readFileSync(path.join(root, 'apps/minecraft/rp/manifest.json'), 'utf-8'));

if (bpManifest.header.uuid === rpManifest.header.uuid) {
  console.error('BP and RP header UUIDs must be unique');
  process.exit(1);
}

for (const dep of bpManifest.dependencies || []) {
  if (typeof dep.version === 'string' && dep.version.includes('beta')) {
    console.error('Forbidden experimental beta Script API dependency:', dep);
    process.exit(1);
  }
}

const structures = ['hub', 'LB', 'EG', 'IQ', 'KR', 'FR'];
for (const s of structures) {
  const sp = path.join(root, 'apps/minecraft/structures', `${s}.mcstructure.json`);
  if (!fs.existsSync(sp)) {
    console.error('Missing structure template:', sp);
    process.exit(1);
  }
}

console.log(
  JSON.stringify({
    status: 'PASS',
    bpUuid: bpManifest.header.uuid,
    rpUuid: rpManifest.header.uuid,
    structuresVerified: structures.length,
  })
);
