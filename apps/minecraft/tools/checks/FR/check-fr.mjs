#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/FR/lyon-district.json'), 'utf8'));
if ((d.exteriors || []).length < 5) throw new Error('Expected >= 5 FR exterior buildings');
if ((d.interiors || []).length < 3) throw new Error('Expected >= 3 FR furnished interiors');
if ((d.npcs || []).length < 4) throw new Error('Expected >= 4 FR NPCs');
if ((d.anchors || []).length < 11) throw new Error('Expected >= 11 FR quest anchors');
if ((d.restorationStages || []).length !== 3) throw new Error('Expected 3 FR restoration stages');
console.log('PASS: DX08 verified FR district exteriors (5), interiors (3), NPCs (4), anchors (11), and restoration (3 stages).');
