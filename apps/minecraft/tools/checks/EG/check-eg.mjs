#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'apps/minecraft/world/EG/cairo-district.json'), 'utf8'));
if ((d.exteriors || []).length < 5) throw new Error('Expected >= 5 EG exterior buildings');
if ((d.interiors || []).length < 3) throw new Error('Expected >= 3 EG furnished interiors');
if ((d.npcs || []).length < 4) throw new Error('Expected >= 4 EG NPCs');
if ((d.anchors || []).length < 11) throw new Error('Expected >= 11 EG quest anchors');
if ((d.restorationStages || []).length !== 3) throw new Error('Expected 3 EG restoration stages');
console.log('PASS: DX05 verified EG district exteriors (5), interiors (3), NPCs (4), anchors (11), and restoration (3 stages).');
